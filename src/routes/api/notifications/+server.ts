import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// GET /api/notifications - Get user's notifications
export const GET: RequestHandler = async ({ locals, url }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const limit = parseInt(url.searchParams.get('limit') || '20');
    const unreadOnly = url.searchParams.get('unread') === 'true';

    let query = db.select()
        .from(table.notification)
        .where(eq(table.notification.userId, locals.user.id))
        .orderBy(desc(table.notification.createdAt))
        .limit(limit);

    if (unreadOnly) {
        query = db.select()
            .from(table.notification)
            .where(and(
                eq(table.notification.userId, locals.user.id),
                eq(table.notification.isRead, false)
            ))
            .orderBy(desc(table.notification.createdAt))
            .limit(limit);
    }

    const notifications = await query;

    return json(notifications);
};

// PUT /api/notifications - Mark all notifications as read
export const PUT: RequestHandler = async ({ locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    await db.update(table.notification)
        .set({ isRead: true })
        .where(eq(table.notification.userId, locals.user.id));

    return json({ success: true });
};
