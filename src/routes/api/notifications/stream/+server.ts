import { error } from '@sveltejs/kit';
import { notificationManager } from '$lib/server/notifications';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const stream = new ReadableStream({
        start(controller) {
            // Send initial connection message
            controller.enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

            // Subscribe to notifications for this user
            const unsubscribe = notificationManager.subscribe(locals.user!.id, (notification) => {
                controller.enqueue(`data: ${JSON.stringify(notification)}\n\n`);
            });

            // Keep connection alive with periodic pings
            const pingInterval = setInterval(() => {
                controller.enqueue(`: ping\n\n`);
            }, 30000);

            // Cleanup on connection close
            return () => {
                clearInterval(pingInterval);
                unsubscribe();
            };
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }
    });
};
