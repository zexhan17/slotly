import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// GET /api/services/:id - Get service details
export const GET: RequestHandler = async ({ params }) => {
    const [service] = await db.select()
        .from(table.service)
        .where(eq(table.service.id, params.id));

    if (!service) {
        throw error(404, 'Service not found');
    }

    return json(service);
};

// PUT /api/services/:id - Update service
export const PUT: RequestHandler = async ({ params, request, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    // Get service with business info to verify ownership
    const [serviceData] = await db.select({
        service: table.service,
        ownerId: table.business.ownerId
    })
        .from(table.service)
        .innerJoin(table.business, eq(table.service.businessId, table.business.id))
        .where(eq(table.service.id, params.id));

    if (!serviceData) {
        throw error(404, 'Service not found');
    }

    if (serviceData.ownerId !== locals.user.id) {
        throw error(403, 'Forbidden');
    }

    const data = await request.json();
    const { name, description, durationMinutes, price, isActive } = data;

    const updateData: Partial<typeof table.service.$inferInsert> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (durationMinutes !== undefined) updateData.durationMinutes = durationMinutes;
    if (price !== undefined) updateData.price = price;
    if (isActive !== undefined) updateData.isActive = isActive;

    await db.update(table.service)
        .set(updateData)
        .where(eq(table.service.id, params.id));

    const [updated] = await db.select().from(table.service).where(eq(table.service.id, params.id));

    return json(updated);
};

// DELETE /api/services/:id - Delete service
export const DELETE: RequestHandler = async ({ params, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    // Get service with business info to verify ownership
    const [serviceData] = await db.select({
        service: table.service,
        ownerId: table.business.ownerId
    })
        .from(table.service)
        .innerJoin(table.business, eq(table.service.businessId, table.business.id))
        .where(eq(table.service.id, params.id));

    if (!serviceData) {
        throw error(404, 'Service not found');
    }

    if (serviceData.ownerId !== locals.user.id) {
        throw error(403, 'Forbidden');
    }

    // Delete service (cascades to slots and bookings)
    await db.delete(table.service).where(eq(table.service.id, params.id));

    return json({ success: true });
};
