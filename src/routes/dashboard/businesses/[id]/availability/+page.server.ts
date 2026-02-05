import { redirect, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
    if (!locals.user) {
        throw redirect(302, '/login');
    }

    // Get business
    const [business] = await db.select()
        .from(table.business)
        .where(eq(table.business.id, params.id));

    if (!business) {
        throw error(404, 'Business not found');
    }

    if (business.ownerId !== locals.user.id) {
        throw error(403, 'Forbidden');
    }

    // Get availability
    let availability = await db.select()
        .from(table.availability)
        .where(eq(table.availability.businessId, params.id))
        .orderBy(table.availability.dayOfWeek);

    // If no availability exists, return empty (will be created on first save)
    const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // If no records, provide defaults
    if (availability.length === 0) {
        availability = [
            { id: '', businessId: params.id, dayOfWeek: 0, isEnabled: false, startTime: '09:00', endTime: '17:00', createdAt: new Date() },
            { id: '', businessId: params.id, dayOfWeek: 1, isEnabled: true, startTime: '09:00', endTime: '17:00', createdAt: new Date() },
            { id: '', businessId: params.id, dayOfWeek: 2, isEnabled: true, startTime: '09:00', endTime: '17:00', createdAt: new Date() },
            { id: '', businessId: params.id, dayOfWeek: 3, isEnabled: true, startTime: '09:00', endTime: '17:00', createdAt: new Date() },
            { id: '', businessId: params.id, dayOfWeek: 4, isEnabled: true, startTime: '09:00', endTime: '17:00', createdAt: new Date() },
            { id: '', businessId: params.id, dayOfWeek: 5, isEnabled: true, startTime: '09:00', endTime: '17:00', createdAt: new Date() },
            { id: '', businessId: params.id, dayOfWeek: 6, isEnabled: false, startTime: '09:00', endTime: '17:00', createdAt: new Date() }
        ];
    }

    const formattedAvailability = availability.map(record => ({
        ...record,
        dayName: DAY_NAMES[record.dayOfWeek]
    }));

    return {
        business,
        availability: formattedAvailability
    };
};
