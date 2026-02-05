import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// GET /api/businesses/[id]/bookings - Get all bookings for a business
export const GET: RequestHandler = async ({ params, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    // First, verify the user owns this business
    const [business] = await db.select()
        .from(table.business)
        .where(eq(table.business.id, params.id));

    if (!business) {
        throw error(404, 'Business not found');
    }

    if (business.ownerId !== locals.user.id) {
        throw error(403, 'Forbidden');
    }

    // Get all bookings for services belonging to this business
    const bookings = await db.select({
        id: table.booking.id,
        status: table.booking.status,
        createdAt: table.booking.createdAt,
        slotId: table.booking.slotId,
        userId: table.booking.userId,
        userEmail: table.user.email,
        slotStartTime: table.slot.startTime,
        slotEndTime: table.slot.endTime,
        serviceName: table.service.name,
        serviceId: table.service.id
    })
        .from(table.booking)
        .innerJoin(table.slot, eq(table.booking.slotId, table.slot.id))
        .innerJoin(table.service, eq(table.slot.serviceId, table.service.id))
        .innerJoin(table.user, eq(table.booking.userId, table.user.id))
        .where(eq(table.service.businessId, params.id));

    return json(bookings);
};
