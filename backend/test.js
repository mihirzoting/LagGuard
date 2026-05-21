const eventBus = require("./eventBus");

// start data generator
const startNetworkCollector = require("./networkCollector");

// activate pipelines (IMPORTANT ORDER DOESN'T MATTER MUCH, BUT KEEP CLEAN)
require("./featureEngine");
require("./predictionEngine"); // 🔥 THIS WAS MISSING / CRITICAL

// listen for ML alerts
eventBus.subscribe("ALERT", (data) => {
    console.log("🚨 ALERT:", data);
});

// optional: track ML predictions
eventBus.subscribe("FEATURE_VECTOR", (data) => {
    console.log("📊 FEATURE VECTOR:", data);
});

// start streaming
startNetworkCollector();