const axios = require("axios");

const CIRCUIT_BREAKER = {
    failureThreshold: 3,
    recoveryWindowMs: 30 * 1000,
    timeoutMs: 100,
};

let failureCount = 0;
let circuitOpen = false;
let circuitOpenedAt = null;

function isCircuitOpen() {
    if (!circuitOpen) return false;

    const elapsed = Date.now() - circuitOpenedAt;
    if (elapsed >= CIRCUIT_BREAKER.recoveryWindowMs) {
        circuitOpen = false;
        failureCount = 0;
        circuitOpenedAt = null;
        console.log("[ML Client] 🔄 Circuit breaker recovered");
        return false;
    }

    return true;
}

async function callMLService(featureVector) {
    if (isCircuitOpen()) {
        throw new Error("ML circuit breaker is open");
    }

    try {
        const response = await axios.post(
            "http://localhost:8000/predict",
            featureVector,
            { timeout: CIRCUIT_BREAKER.timeoutMs }
        );

        failureCount = 0;
        return response.data;
    } catch (error) {
        failureCount += 1;
        console.error(
            `[ML Client] call failed (${failureCount}/${CIRCUIT_BREAKER.failureThreshold}):`,
            error.message
        );

        if (failureCount >= CIRCUIT_BREAKER.failureThreshold) {
            circuitOpen = true;
            circuitOpenedAt = Date.now();
            console.error("[ML Client] 🔴 Circuit breaker OPEN");
        }

        throw error;
    }
}

function getCircuitStatus() {
    return {
        circuitOpen,
        failureCount,
        recoveryRemainingMs: circuitOpen
            ? Math.max(0, CIRCUIT_BREAKER.recoveryWindowMs - (Date.now() - circuitOpenedAt))
            : 0,
    };
}

module.exports = {
    callMLService,
    getCircuitStatus,
};
