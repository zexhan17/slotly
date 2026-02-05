import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { business, availability } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateId } from '$lib/server/utils';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Default availability schedule (Mon-Fri 9-5, Sat-Sun closed)
function getDefaultAvailability() {
    return [
        { dayOfWeek: 0, isEnabled: false, startTime: '09:00', endTime: '17:00' }, // Sunday
        { dayOfWeek: 1, isEnabled: true, startTime: '09:00', endTime: '17:00' }, // Monday
        { dayOfWeek: 2, isEnabled: true, startTime: '09:00', endTime: '17:00' }, // Tuesday
        { dayOfWeek: 3, isEnabled: true, startTime: '09:00', endTime: '17:00' }, // Wednesday
        { dayOfWeek: 4, isEnabled: true, startTime: '09:00', endTime: '17:00' }, // Thursday
        { dayOfWeek: 5, isEnabled: true, startTime: '09:00', endTime: '17:00' }, // Friday
        { dayOfWeek: 6, isEnabled: false, startTime: '09:00', endTime: '17:00' } // Saturday
    ];
}

// GET - Fetch availability for a business
export const GET: RequestHandler = async ({ params, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const businessRecord = await db.query.business.findFirst({
        where: eq(business.id, params.id)
    });

    if (!businessRecord) {
        throw error(404, 'Business not found');
    }

    // Check ownership
    if (businessRecord.ownerId !== locals.user.id) {
        throw error(403, 'Access denied');
    }

    // Get existing availability
    let availabilityRecords = await db
        .select()
        .from(availability)
        .where(eq(availability.businessId, params.id))
        .orderBy(availability.dayOfWeek);

    // If no availability exists, create default and return it
    if (availabilityRecords.length === 0) {
        const defaultSchedule = getDefaultAvailability();

        for (const day of defaultSchedule) {
            await db.insert(availability).values({
                id: generateId(),
                businessId: params.id,
                dayOfWeek: day.dayOfWeek,
                isEnabled: day.isEnabled,
                startTime: day.startTime,
                endTime: day.endTime
            });
        }

        availabilityRecords = await db
            .select()
            .from(availability)
            .where(eq(availability.businessId, params.id))
            .orderBy(availability.dayOfWeek);
    }

    // Format response with day names
    const formattedAvailability = availabilityRecords.map((record) => ({
        ...record,
        dayName: DAY_NAMES[record.dayOfWeek]
    }));

    return json(formattedAvailability);
};

// PUT - Update availability for a business
export const PUT: RequestHandler = async ({ params, locals, request }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const businessRecord = await db.query.business.findFirst({
        where: eq(business.id, params.id)
    });

    if (!businessRecord) {
        throw error(404, 'Business not found');
    }

    // Check ownership
    if (businessRecord.ownerId !== locals.user.id) {
        throw error(403, 'Access denied');
    }

    const body = await request.json();
    const { schedule } = body;

    if (!Array.isArray(schedule) || schedule.length !== 7) {
        throw error(400, 'Schedule must be an array of 7 days');
    }

    // Validate and update each day
    for (const day of schedule) {
        if (
            typeof day.dayOfWeek !== 'number' ||
            day.dayOfWeek < 0 ||
            day.dayOfWeek > 6
        ) {
            throw error(400, 'Invalid day of week');
        }

        // Validate time format (HH:MM)
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(day.startTime) || !timeRegex.test(day.endTime)) {
            throw error(400, 'Invalid time format. Use HH:MM');
        }

        // Check if start time is before end time
        if (day.isEnabled && day.startTime >= day.endTime) {
            throw error(400, `${DAY_NAMES[day.dayOfWeek]}: Start time must be before end time`);
        }

        // Check if record exists
        const existing = await db.query.availability.findFirst({
            where: and(
                eq(availability.businessId, params.id),
                eq(availability.dayOfWeek, day.dayOfWeek)
            )
        });

        if (existing) {
            // Update
            await db
                .update(availability)
                .set({
                    isEnabled: day.isEnabled,
                    startTime: day.startTime,
                    endTime: day.endTime
                })
                .where(eq(availability.id, existing.id));
        } else {
            // Insert
            await db.insert(availability).values({
                id: generateId(),
                businessId: params.id,
                dayOfWeek: day.dayOfWeek,
                isEnabled: day.isEnabled,
                startTime: day.startTime,
                endTime: day.endTime
            });
        }
    }

    // Return updated availability
    const updatedRecords = await db
        .select()
        .from(availability)
        .where(eq(availability.businessId, params.id))
        .orderBy(availability.dayOfWeek);

    const formattedAvailability = updatedRecords.map((record) => ({
        ...record,
        dayName: DAY_NAMES[record.dayOfWeek]
    }));

    return json(formattedAvailability);
};
