import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// POST /api/notifications/[id]/read - Mark notification as read
export const POST: RequestHandler = async ({ params, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const [notification] = await db.select()
        .from(table.notification)
        .where(eq(table.notification.id, params.id));

    if (!notification) {
        throw error(404, 'Notification not found');
    }

    if (notification.userId !== locals.user.id) {
        throw error(403, 'Forbidden');
    }

    await db.update(table.notification)
        .set({ isRead: true })
        .where(eq(table.notification.id, params.id));

    return json({ success: true });
};
