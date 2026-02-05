import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// GET /api/notifications/[id] - Get single notification
export const GET: RequestHandler = async ({ params, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const [notification] = await db.select()
        .from(table.notification)
        .where(and(
            eq(table.notification.id, params.id),
            eq(table.notification.userId, locals.user.id)
        ));

    if (!notification) {
        throw error(404, 'Notification not found');
    }

    return json(notification);
};

// PUT /api/notifications/[id] - Mark single notification as read
export const PUT: RequestHandler = async ({ params, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const [notification] = await db.select()
        .from(table.notification)
        .where(and(
            eq(table.notification.id, params.id),
            eq(table.notification.userId, locals.user.id)
        ));

    if (!notification) {
        throw error(404, 'Notification not found');
    }

    await db.update(table.notification)
        .set({ isRead: true })
        .where(eq(table.notification.id, params.id));

    return json({ success: true });
};

// DELETE /api/notifications/[id] - Delete notification
export const DELETE: RequestHandler = async ({ params, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const [notification] = await db.select()
        .from(table.notification)
        .where(and(
            eq(table.notification.id, params.id),
            eq(table.notification.userId, locals.user.id)
        ));

    if (!notification) {
        throw error(404, 'Notification not found');
    }

    await db.delete(table.notification).where(eq(table.notification.id, params.id));

    return json({ success: true });
};
