import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { generateId } from '$lib/server/utils';
import { eq, and, gte, lt } from 'drizzle-orm';
import { notificationManager } from '$lib/server/notifications';
import { bookingRateLimit } from '$lib/server/rateLimit';
import type { RequestHandler } from './$types';

const SESSION_DURATION_MINUTES = 30;

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

    // Send realtime notification
    notificationManager.notify(userId, {
        id: notificationId,
        type,
        message
    });
}

// Helper to check if a time slot is available based on availability settings
async function isTimeAvailable(businessId: string, serviceId: string, startTime: Date): Promise<boolean> {
    const dayOfWeek = startTime.getDay();
    const timeStr = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;

    // Check availability for that day
    const [availability] = await db.select()
        .from(table.availability)
        .where(
            and(
                eq(table.availability.businessId, businessId),
                eq(table.availability.dayOfWeek, dayOfWeek)
            )
        );

    // If no availability set or day is disabled, not available
    if (!availability || !availability.isEnabled) {
        return false;
    }

    // Check if time is within available hours
    if (timeStr < availability.startTime || timeStr >= availability.endTime) {
        return false;
    }

    // Check if there's already a booking for this time
    const endTime = new Date(startTime.getTime() + SESSION_DURATION_MINUTES * 60 * 1000);

    const existingBookings = await db.select()
        .from(table.booking)
        .where(
            and(
                eq(table.booking.serviceId, serviceId),
                eq(table.booking.status, 'booked'),
                // Check for overlapping bookings
                lt(table.booking.startTime, endTime),
                gte(table.booking.endTime, startTime)
            )
        );

    return existingBookings.length === 0;
}

// POST /api/bookings - Create a new booking
export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    // Apply rate limiting
    try {
        const identifier = getClientAddress() + ':' + locals.user.id;
        bookingRateLimit(identifier);
    } catch (e) {
        throw error(429, 'Too many booking requests. Please slow down.');
    }

    const data = await request.json();
    const { serviceId, startTime: startTimeStr } = data;

    if (!serviceId || !startTimeStr) {
        throw error(400, 'Missing serviceId or startTime');
    }

    const startTime = new Date(startTimeStr);
    const endTime = new Date(startTime.getTime() + SESSION_DURATION_MINUTES * 60 * 1000);

    // Get service with business info
    const [serviceData] = await db.select({
        service: table.service,
        business: table.business
    })
        .from(table.service)
        .innerJoin(table.business, eq(table.service.businessId, table.business.id))
        .where(eq(table.service.id, serviceId));

    if (!serviceData) {
        throw error(404, 'Service not found');
    }

    const { service, business } = serviceData;

    // Prevent business owner from booking their own services
    if (locals.user.id === business.ownerId) {
        throw error(403, 'Business owners cannot book their own services');
    }

    // Check if booking time is in the future
    const now = new Date();
    if (startTime < now) {
        throw error(400, 'Cannot book past times');
    }

    // Check minimum advance notice (1 hour)
    const minBookingTime = new Date(now.getTime() + 60 * 60 * 1000);
    if (startTime < minBookingTime) {
        throw error(400, 'Bookings must be made at least 1 hour in advance');
    }

    // Check maximum advance booking (30 days)
    const maxBookingDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (startTime > maxBookingDate) {
        throw error(400, 'Bookings can only be made up to 30 days in advance');
    }

    // Check if time is available
    const available = await isTimeAvailable(business.id, serviceId, startTime);
    if (!available) {
        throw error(400, 'This time slot is not available');
    }

    // Check if user already has a booking for this exact time with this service
    const existingUserBooking = await db.select()
        .from(table.booking)
        .where(
            and(
                eq(table.booking.serviceId, serviceId),
                eq(table.booking.userId, locals.user.id),
                eq(table.booking.startTime, startTime),
                eq(table.booking.status, 'booked')
            )
        );

    if (existingUserBooking.length > 0) {
        throw error(400, 'You already have a booking for this time');
    }

    const bookingId = generateId('book');

    const newBooking = {
        id: bookingId,
        serviceId,
        userId: locals.user.id,
        startTime,
        endTime,
        status: 'booked' as const
    };

    await db.insert(table.booking).values(newBooking);

    // Create notifications
    const slotTimeStr = startTime.toLocaleString();

    // Notify business owner
    await createNotification(
        business.ownerId,
        'booking_created',
        `New booking for ${service.name} on ${slotTimeStr}`
    );

    // Notify user
    await createNotification(
        locals.user.id,
        'booking_created',
        `Your booking for ${service.name} at ${business.name} on ${slotTimeStr} is confirmed`
    );

    return json(newBooking, { status: 201 });
};

// GET /api/bookings - Get user's bookings
export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const bookings = await db.select({
        id: table.booking.id,
        status: table.booking.status,
        createdAt: table.booking.createdAt,
        startTime: table.booking.startTime,
        endTime: table.booking.endTime,
        serviceName: table.service.name,
        serviceDescription: table.service.description,
        businessName: table.business.name,
        businessAddress: table.business.address
    })
        .from(table.booking)
        .innerJoin(table.service, eq(table.booking.serviceId, table.service.id))
        .innerJoin(table.business, eq(table.service.businessId, table.business.id))
        .where(eq(table.booking.userId, locals.user.id));

    return json(bookings);
};
