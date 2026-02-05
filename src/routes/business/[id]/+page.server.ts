import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and, gte, lt } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const SESSION_DURATION_MINUTES = 30;

// Generate all time slots for the next 2 months based on availability (with booked status)
function generateAvailableSlots(
    availability: typeof table.availability.$inferSelect[],
    existingBookings: { startTime: Date; endTime: Date }[],
    daysAhead: number = 62
): { startTime: Date; endTime: Date; isBooked: boolean }[] {
    const slots: { startTime: Date; endTime: Date; isBooked: boolean }[] = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (let day = 0; day < daysAhead; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() + day);
        const dayOfWeek = date.getDay();

        // Find availability for this day
        const dayAvailability = availability.find(a => a.dayOfWeek === dayOfWeek);
        if (!dayAvailability || !dayAvailability.isEnabled) {
            continue;
        }

        // Parse start and end times
        const [startHour, startMin] = dayAvailability.startTime.split(':').map(Number);
        const [endHour, endMin] = dayAvailability.endTime.split(':').map(Number);

        // Generate 30-minute slots
        let currentTime = new Date(date);
        currentTime.setHours(startHour, startMin, 0, 0);

        const endTime = new Date(date);
        endTime.setHours(endHour, endMin, 0, 0);

        while (currentTime.getTime() + SESSION_DURATION_MINUTES * 60 * 1000 <= endTime.getTime()) {
            const slotStart = new Date(currentTime);
            const slotEnd = new Date(currentTime.getTime() + SESSION_DURATION_MINUTES * 60 * 1000);

            // Skip if slot is in the past (with 1 hour minimum advance)
            const minBookingTime = new Date(now.getTime() + 60 * 60 * 1000);
            if (slotStart < minBookingTime) {
                currentTime = new Date(currentTime.getTime() + SESSION_DURATION_MINUTES * 60 * 1000);
                continue;
            }

            // Check if slot overlaps with any existing booking
            const isBooked = existingBookings.some(booking => {
                return slotStart < booking.endTime && slotEnd > booking.startTime;
            });

            slots.push({ startTime: slotStart, endTime: slotEnd, isBooked });

            currentTime = new Date(currentTime.getTime() + SESSION_DURATION_MINUTES * 60 * 1000);
        }
    }

    return slots;
}

export const load: PageServerLoad = async ({ params, locals }) => {
    // Get business
    const [business] = await db.select()
        .from(table.business)
        .where(eq(table.business.id, params.id));

    if (!business) {
        throw error(404, 'Business not found');
    }

    // Get services for this business
    const services = await db.select()
        .from(table.service)
        .where(eq(table.service.businessId, params.id));

    // Get availability for this business
    const availability = await db.select()
        .from(table.availability)
        .where(eq(table.availability.businessId, params.id));

    // Get all existing bookings for this business's services (next 2 months)
    const now = new Date();
    const futureDate = new Date(now.getTime() + 62 * 24 * 60 * 60 * 1000);

    const servicesWithSlots = await Promise.all(
        services.map(async (service) => {
            // Get existing bookings for this service
            const bookings = await db.select({
                startTime: table.booking.startTime,
                endTime: table.booking.endTime
            })
                .from(table.booking)
                .where(
                    and(
                        eq(table.booking.serviceId, service.id),
                        eq(table.booking.status, 'booked'),
                        gte(table.booking.startTime, now),
                        lt(table.booking.startTime, futureDate)
                    )
                );

            // Generate available slots based on availability and existing bookings
            const availableSlots = generateAvailableSlots(availability, bookings);

            return {
                ...service,
                availableSlots
            };
        })
    );

    return {
        business,
        services: servicesWithSlots,
        availability,
        viewerId: locals.user?.id ?? null
    };
};
