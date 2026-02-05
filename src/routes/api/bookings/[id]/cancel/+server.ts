import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '$lib/server/utils';
import type { RequestHandler } from './$types';

// Helper to create notification
async function createNotification(userId: string, type: 'booking_created' | 'reminder' | 'cancelled', message: string) {
    const notificationId = generateId('notif');
    await db.insert(table.notification).values({
        id: notificationId,
        userId,
        type,
        message,
        isRead: false
    });
}

// POST /api/bookings/[id]/cancel - Cancel a booking (customer or seller)
export const POST: RequestHandler = async ({ params, request, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    // Get booking with service and business info
    const [bookingData] = await db.select({
        booking: table.booking,
        service: table.service,
        business: table.business
    })
        .from(table.booking)
        .innerJoin(table.service, eq(table.booking.serviceId, table.service.id))
        .innerJoin(table.business, eq(table.service.businessId, table.business.id))
        .where(eq(table.booking.id, params.id));

    if (!bookingData) {
        throw error(404, 'Booking not found');
    }

    const { booking, service, business } = bookingData;
    const isCustomer = booking.userId === locals.user.id;
    const isSeller = business.ownerId === locals.user.id;

    if (!isCustomer && !isSeller) {
        throw error(403, 'Forbidden');
    }

    if (booking.status === 'cancelled') {
        throw error(400, 'Booking already cancelled');
    }

    // Get optional cancellation message from body
    let cancellationMessage = '';
    try {
        const body = await request.json();
        cancellationMessage = body.message || '';
    } catch {
        // No body or invalid JSON, that's ok
    }

    await db.update(table.booking)
        .set({ status: 'cancelled' })
        .where(eq(table.booking.id, params.id));

    const slotTime = booking.startTime.toLocaleString();

    // Create notifications
    if (isSeller && !isCustomer) {
        // Seller cancelled - notify customer
        const message = cancellationMessage
            ? `Your booking for ${service.name} on ${slotTime} was cancelled by ${business.name}. Reason: ${cancellationMessage}`
            : `Your booking for ${service.name} on ${slotTime} was cancelled by ${business.name}`;
        await createNotification(booking.userId, 'cancelled', message);
    } else if (isCustomer) {
        // Customer cancelled - notify seller
        const message = cancellationMessage
            ? `Booking for ${service.name} on ${slotTime} was cancelled by the customer. Reason: ${cancellationMessage}`
            : `Booking for ${service.name} on ${slotTime} was cancelled by the customer`;
        await createNotification(business.ownerId, 'cancelled', message);
    }

    return json({ success: true });
};
