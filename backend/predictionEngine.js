console.log("🔥 PREDICTION ENGINE LOADED");
const eventBus = require("./eventBus");
const mlClient = require("./mlServiceClient");

const THRESHOLDS = {
    HIGH: 0.55,
    CRITICAL: 0.78,
};

const HYBRID_WEIGHTS = {
    ml: 0.6,
    rule: 0.4,
};

const HISTORY_SIZE = 5;
const history = [];

function pushHistory(feature) {
    history.push(feature);
    if (history.length > HISTORY_SIZE) history.shift();
}

function mean(arr) {
    return arr.reduce((sum, value) => sum + value, 0) / arr.length;
}

function rollingTrendScore(hist) {
    if (hist.length < 2) return 0;

    const means = hist.map((f) => f.mean_ping);
    const avg = mean(means);
    const std = Math.sqrt(
        means.map((value) => (value - avg) ** 2).reduce((sum, value) => sum + value, 0) / means.length
    );
    const threshold = avg + 1.5 * std;

    let trendingUp = 0;
    for (let i = 1; i < means.length; i += 1) {
        if (means[i] > means[i - 1] && means[i] > threshold) trendingUp += 1;
    }

    return Math.min(trendingUp / (hist.length - 1), 1);
}

function spikeDetectionScore(feature, hist) {
    if (hist.length < 2) return 0;

    const rollingMean =
        hist.slice(0, -1).map((f) => f.mean_ping).reduce((sum, value) => sum + value, 0) /
        (hist.length - 1);

    const deviation = feature.mean_ping - rollingMean;
    return Math.min(Math.max(deviation / 70, 0), 1);
}

function jitterInstabilityScore(feature) {
    const jitterLevel = Math.min(feature.mean_jitter / 40, 1);
    const slopeBoost = feature.jitter_slope > 0
        ? Math.min(feature.jitter_slope / 3, 0.5)
        : Math.max(feature.jitter_slope / 3, -0.3);

    return Math.min(Math.max(jitterLevel + slopeBoost, 0), 1);
}

function slopeScore(feature) {
    return Math.min(Math.max(feature.ping_slope / 5, 0), 1);
}

function varianceScore(feature) {
    return Math.min(feature.variance_ping / 1000, 1);
}

function computeRuleBasedRisk(feature, hist) {
    const weights = {
        trend: 0.25,
        spike: 0.25,
        jitter: 0.20,
        slope: 0.18,
        variance: 0.12,
    };

    const scores = {
        trend: rollingTrendScore(hist),
        spike: spikeDetectionScore(feature, hist),
        jitter: jitterInstabilityScore(feature),
        slope: slopeScore(feature),
        variance: varianceScore(feature),
    };

    const risk =
        weights.trend * scores.trend +
        weights.spike * scores.spike +
        weights.jitter * scores.jitter +
        weights.slope * scores.slope +
        weights.variance * scores.variance;

    return { risk: Math.min(risk, 1), scores };
}

function estimateEta(riskScore) {
    if (riskScore >= THRESHOLDS.CRITICAL) return "~1–2s";
    if (riskScore >= THRESHOLDS.HIGH) return "~4–5s";
    return "stable";
}

function buildBasePrediction(feature, ruleScore, ruleSubscores) {
    const status =
        ruleScore >= THRESHOLDS.CRITICAL ? "CRITICAL" :
            ruleScore >= THRESHOLDS.HIGH ? "HIGH" :
                "STABLE";

    return {
        timestamp: Date.now(),
        ruleScore: parseFloat(ruleScore.toFixed(4)),
        mlScore: null,
        finalScore: parseFloat(ruleScore.toFixed(4)),
        source: "rule",
        status,
        eta_warning: estimateEta(ruleScore),
        _debug: {
            ruleSubscores,
            historyDepth: history.length,
        },
    };
}

async function emitFinalPrediction(feature, basePrediction) {
    try {
        const mlResult = await mlClient.callMLService(feature);
        const mlScore = typeof mlResult.probability === "number" ? mlResult.probability : 0;

        const finalScore = parseFloat(
            (
                HYBRID_WEIGHTS.ml * mlScore +
                HYBRID_WEIGHTS.rule * basePrediction.ruleScore
            ).toFixed(4)
        );

        const status =
            finalScore >= THRESHOLDS.CRITICAL ? "CRITICAL" :
                finalScore >= THRESHOLDS.HIGH ? "HIGH" :
                    "STABLE";

        const finalPrediction = {
            ...basePrediction,
            mlScore: parseFloat(mlScore.toFixed(4)),
            finalScore,
            source: "hybrid",
            status,
            eta_warning: estimateEta(finalScore),
            _debug: {
                ...basePrediction._debug,
                mlModelVersion: mlResult.modelVersion || "unknown",
                mlWeights: HYBRID_WEIGHTS,
            },
        };

        console.log("🔀 HYBRID PREDICTION:", finalPrediction);
        eventBus.publish("LAG_PREDICTION_FINAL", finalPrediction);
    } catch (error) {
        const circuitStatus = mlClient.getCircuitStatus();
        const fallbackPrediction = {
            ...basePrediction,
            source: "fallback",
            _debug: {
                ...basePrediction._debug,
                mlError: error.message,
                circuitStatus,
            },
        };

        console.warn("⚠️  ML fallback active:", error.message);
        console.log("📡 FALLBACK PREDICTION:", fallbackPrediction);
        eventBus.publish("LAG_PREDICTION_FINAL", fallbackPrediction);
    }
}

eventBus.subscribe("FEATURE_VECTOR", (feature) => {
    try {
        pushHistory(feature);

        const { risk: ruleScore, scores: ruleSubscores } = computeRuleBasedRisk(feature, history);
        const basePrediction = buildBasePrediction(feature, ruleScore, ruleSubscores);

        emitFinalPrediction(feature, basePrediction);
    } catch (err) {
        console.error("Prediction Engine Error:", err);
    }
});