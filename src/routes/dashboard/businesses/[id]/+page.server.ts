import { redirect, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, inArray, gte, desc } from 'drizzle-orm';
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

    // Get services
    const services = await db.select()
        .from(table.service)
        .where(eq(table.service.businessId, params.id));

    // Get service IDs for bookings query
    const serviceIds = services.map(s => s.id);

    // Get bookings for this business
    let bookings: Array<{
        id: string;
        status: string;
        createdAt: Date;
        startTime: Date;
        endTime: Date;
        serviceId: string;
        userId: string;
        userEmail: string;
        serviceName: string;
    }> = [];

    if (serviceIds.length > 0) {
        bookings = await db.select({
            id: table.booking.id,
            status: table.booking.status,
            createdAt: table.booking.createdAt,
            startTime: table.booking.startTime,
            endTime: table.booking.endTime,
            serviceId: table.booking.serviceId,
            userId: table.booking.userId,
            userEmail: table.user.email,
            serviceName: table.service.name
        })
            .from(table.booking)
            .innerJoin(table.service, eq(table.booking.serviceId, table.service.id))
            .innerJoin(table.user, eq(table.booking.userId, table.user.id))
            .where(inArray(table.booking.serviceId, serviceIds))
            .orderBy(desc(table.booking.startTime))
            .limit(50);
    }

    // Get availability
    const availability = await db.select()
        .from(table.availability)
        .where(eq(table.availability.businessId, params.id));

    return {
        business,
        services,
        bookings,
        availability
    };
};
