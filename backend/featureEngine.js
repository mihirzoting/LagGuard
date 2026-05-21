console.log("🔥 FEATURE ENGINE LOADED");
const eventBus = require("./eventBus");

// ----------------------------
// CONFIG
// ----------------------------
const WINDOW_SIZE = 10;
const samples = [];

// ----------------------------
// HELPERS
// ----------------------------
function mean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function variance(arr) {
    const m = mean(arr);
    return mean(arr.map(x => (x - m) ** 2));
}

function slope(arr) {
    const n = arr.length;
    const x = Array.from({ length: n }, (_, i) => i);

    const xMean = mean(x);
    const yMean = mean(arr);

    let num = 0;
    let den = 0;

    for (let i = 0; i < n; i++) {
        num += (x[i] - xMean) * (arr[i] - yMean);
        den += (x[i] - xMean) ** 2;
    }

    return den === 0 ? 0 : num / den;
}

// ----------------------------
// CORE FEATURE ENGINE
// ----------------------------
eventBus.subscribe("NETWORK_SAMPLE", (data) => {
    console.log("📥 FEATURE ENGINE RECEIVED SAMPLE"); // DEBUG LINE

    samples.push(data);

    if (samples.length > WINDOW_SIZE) {
        samples.shift();
    }

    if (samples.length < WINDOW_SIZE) return;

    const pingArr = samples.map(s => s.ping);
    const jitterArr = samples.map(s => s.jitter);

    const featureVector = {
        timestamp: Date.now(),

        // core stats
        mean_ping: mean(pingArr),
        variance_ping: variance(pingArr),

        mean_jitter: mean(jitterArr),
        variance_jitter: variance(jitterArr),

        // dynamics (VERY IMPORTANT for prediction)
        ping_slope: slope(pingArr),
        jitter_slope: slope(jitterArr)
    };

    console.log("FEATURE:", featureVector);

    // send to ML layer
    console.log("📤 EMITTING FEATURE_VECTOR");
eventBus.publish("FEATURE_VECTOR", featureVector);
});