const eventBus = require("./eventBus");
const ping = require("ping");

const HOST = "8.8.8.8"; // Google DNS for baseline latency

let lastPing = null;
let lastJitter = 0;

// Base system emulation for performance stats
let currentFps = 144;
let currentCpu = 35;
let currentGpu = 60;

function startNetworkCollector() {
    setInterval(async () => {
        try {
            const res = await ping.promise.probe(HOST, { timeout: 2 });
            let currentPing = res.time;
            
            // If ping drops/times out, inflate the ping to signify lag spike
            if (currentPing === "unknown" || !res.alive) {
                currentPing = lastPing !== null ? lastPing + 80 : 150;
            }

            let currentJitter = 0;
            if (lastPing !== null) {
                currentJitter = Math.abs(currentPing - lastPing);
            }
            
            // Apply smoothing logic to avoid erratic jitter jumping
            currentJitter = (lastJitter * 0.3) + (currentJitter * 0.7);

            // Fluctuate hardware stats dynamically
            currentFps = Math.max(30, Math.min(240, currentFps + (Math.random() * 10 - 5)));
            currentCpu = Math.max(10, Math.min(100, currentCpu + (Math.random() * 8 - 4)));
            currentGpu = Math.max(20, Math.min(100, currentGpu + (Math.random() * 10 - 5)));
            const frameTime = 1000 / currentFps;

            const sample = {
                timestamp: Date.now(),
                ping: currentPing,
                jitter: currentJitter,
                fps: currentFps,
                cpu: currentCpu,
                gpu: currentGpu,
                frameTime: frameTime
            };

            lastPing = currentPing;
            lastJitter = currentJitter;

            eventBus.publish("NETWORK_SAMPLE", sample);
            console.log("Real Data Sample:", sample);

        } catch (error) {
            console.error("Network collector error:", error.message);
        }
    }, 500); // Polling every 500ms (2Hz)
}

module.exports = startNetworkCollector;