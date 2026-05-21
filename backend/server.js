const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const eventBus = require("./eventBus");

const PORT = process.env.PORT || 5000;
const EVENT_TYPES = [
    "NETWORK_SAMPLE",
    "FEATURE_VECTOR",
    "LAG_PREDICTION_FINAL",
    "ALERT",
];

function createPayload(eventType, data) {
    return JSON.stringify({
        type: eventType,
        data,
        timestamp: Date.now(),
    });
}

function start() {
    const app = express();
    const server = http.createServer(app);
    const wss = new WebSocket.Server({ server, path: "/events" });
    const clients = new Set();

    app.get("/", (req, res) => {
        res.send("LagGuard event server is running");
    });

    app.get("/health", (req, res) => {
        res.json({ status: "ok", port: PORT });
    });

    wss.on("connection", (socket) => {
        clients.add(socket);
        socket.send(createPayload("CONNECTED", { message: "Connected to LagGuard event stream" }));

        socket.on("close", () => {
            clients.delete(socket);
        });

        socket.on("error", () => {
            clients.delete(socket);
        });
    });

    function broadcast(eventType, data) {
        const payload = createPayload(eventType, data);
        for (const socket of clients) {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(payload);
            }
        }
    }

    EVENT_TYPES.forEach((eventType) => {
        eventBus.subscribe(eventType, (data) => {
            broadcast(eventType, data);
        });
    });

    server.listen(PORT, () => {
        console.log(`LagGuard event server listening on http://localhost:${PORT}`);
    });
}

module.exports = { start };
