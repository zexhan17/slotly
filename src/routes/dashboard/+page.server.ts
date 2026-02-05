import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(302, '/login');
    }

    // Get user's bookings (as a customer)
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

    // Get user's businesses
    const businesses = await db.select()
        .from(table.business)
        .where(eq(table.business.ownerId, locals.user.id));

    // Get bookings for seller's businesses (customers who booked their services)
    let sellerBookings: {
        id: string;
        status: string;
        createdAt: Date;
        startTime: Date;
        endTime: Date;
        serviceName: string;
        businessName: string;
        customerEmail: string;
    }[] = [];

    if (businesses.length > 0) {
        const businessIds = businesses.map(b => b.id);

        // Get all services for seller's businesses
        const services = await db.select()
            .from(table.service)
            .where(inArray(table.service.businessId, businessIds));

        if (services.length > 0) {
            const serviceIds = services.map(s => s.id);

            // Get all bookings for those services
            sellerBookings = await db.select({
                id: table.booking.id,
                status: table.booking.status,
                createdAt: table.booking.createdAt,
                startTime: table.booking.startTime,
                endTime: table.booking.endTime,
                serviceName: table.service.name,
                businessName: table.business.name,
                customerEmail: table.user.email
            })
                .from(table.booking)
                .innerJoin(table.service, eq(table.booking.serviceId, table.service.id))
                .innerJoin(table.business, eq(table.service.businessId, table.business.id))
                .innerJoin(table.user, eq(table.booking.userId, table.user.id))
                .where(inArray(table.booking.serviceId, serviceIds))
                .orderBy(desc(table.booking.startTime));
        }
    }

    // Get notifications (ordered by most recent first)
    const notifications = await db.select()
        .from(table.notification)
        .where(eq(table.notification.userId, locals.user.id))
        .orderBy(desc(table.notification.createdAt))
        .limit(20);

    return {
        user: locals.user,
        bookings,
        businesses,
        sellerBookings,
        notifications
    };
};
