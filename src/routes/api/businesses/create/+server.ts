import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { generateId } from '$lib/server/utils';
import type { RequestHandler } from './$types';

// POST /api/businesses/create - Create a new business
export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const data = await request.json();
    const { name, description, address } = data;

    if (!name || name.trim().length === 0) {
        throw error(400, 'Business name is required');
    }

    const businessId = generateId('biz');

    const newBusiness = {
        id: businessId,
        ownerId: locals.user.id,
        name: name.trim(),
        description: description?.trim() || null,
        address: address?.trim() || null,
        isActive: true
    };

    await db.insert(table.business).values(newBusiness);

    return json(newBusiness, { status: 201 });
};
