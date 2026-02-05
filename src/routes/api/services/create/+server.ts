import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { generateId } from '$lib/server/utils';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// POST /api/services/create - Create a new service
export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const data = await request.json();
    const { businessId, name, description, durationMinutes, price } = data;

    // Verify the user owns this business
    const [business] = await db.select()
        .from(table.business)
        .where(eq(table.business.id, businessId));

    if (!business) {
        throw error(404, 'Business not found');
    }

    if (business.ownerId !== locals.user.id) {
        throw error(403, 'Forbidden');
    }

    if (!name || name.trim().length === 0) {
        throw error(400, 'Service name is required');
    }

    if (!durationMinutes || durationMinutes <= 0) {
        throw error(400, 'Duration must be greater than 0');
    }

    const serviceId = generateId('svc');

    const newService = {
        id: serviceId,
        businessId,
        name: name.trim(),
        description: description?.trim() || null,
        durationMinutes,
        price: price?.toString() || null,
        isActive: true
    };

    await db.insert(table.service).values(newService);

    return json(newService, { status: 201 });
};
