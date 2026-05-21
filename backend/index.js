const eventServer = require("./server");

console.log("🚀 LagGuard backend starting...");

require("./featureEngine");
require("./predictionEngine");

eventServer.start();

const startNetworkCollector = require("./networkCollector");
startNetworkCollector();

console.log("✅ Backend subsystems initialized");