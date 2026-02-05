// Simple in-memory notification store for SSE
// In production, use Redis or a proper message queue

type NotificationCallback = (notification: {
    id: string;
    type: string;
    message: string;
}) => void;

class NotificationManager {
    private subscribers = new Map<string, Set<NotificationCallback>>();

    subscribe(userId: string, callback: NotificationCallback) {
        if (!this.subscribers.has(userId)) {
            this.subscribers.set(userId, new Set());
        }
        this.subscribers.get(userId)!.add(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.subscribers.get(userId);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.subscribers.delete(userId);
                }
            }
        };
    }

    notify(userId: string, notification: { id: string; type: string; message: string }) {
        const callbacks = this.subscribers.get(userId);
        if (callbacks) {
            callbacks.forEach(callback => callback(notification));
        }
    }

    getActiveSubscribers(): number {
        return this.subscribers.size;
    }
}

export const notificationManager = new NotificationManager();
