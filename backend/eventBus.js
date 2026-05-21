class EventBus {
    constructor() {
        this.events = {};
    }

    subscribe(eventType, callback) {
        if (!this.events[eventType]) {
            this.events[eventType] = [];
        }
        this.events[eventType].push(callback);
    }

    publish(eventType, data) {
        if (!this.events[eventType]) return;

        this.events[eventType].forEach(cb => cb(data));
    }
}

// IMPORTANT: export INSTANCE
module.exports = new EventBus();