import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// GET /api/businesses/[id] - Get a specific business
export const GET: RequestHandler = async ({ params }) => {
    const [business] = await db.select().from(table.business).where(eq(table.business.id, params.id));

    if (!business) {
        throw error(404, 'Business not found');
    }

    return json(business);
};

// PUT /api/businesses/[id] - Update a business
export const PUT: RequestHandler = async ({ params, request, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const [business] = await db.select().from(table.business).where(eq(table.business.id, params.id));

    if (!business) {
        throw error(404, 'Business not found');
    }

    if (business.ownerId !== locals.user.id) {
        throw error(403, 'Forbidden');
    }

    const data = await request.json();
    const { name, description, address, isActive } = data;

    const updateData: Partial<typeof table.business.$inferInsert> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (address !== undefined) updateData.address = address;
    if (isActive !== undefined) updateData.isActive = isActive;

    await db.update(table.business)
        .set(updateData)
        .where(eq(table.business.id, params.id));

    const [updated] = await db.select().from(table.business).where(eq(table.business.id, params.id));

    return json(updated);
};

// DELETE /api/businesses/[id] - Delete a business
export const DELETE: RequestHandler = async ({ params, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const [business] = await db.select().from(table.business).where(eq(table.business.id, params.id));

    if (!business) {
        throw error(404, 'Business not found');
    }

    if (business.ownerId !== locals.user.id) {
        throw error(403, 'Forbidden');
    }

    // Delete business (cascades to services, slots, bookings)
    await db.delete(table.business).where(eq(table.business.id, params.id));

    return json({ success: true });
};
