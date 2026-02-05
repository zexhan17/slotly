import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// GET /api/businesses/[id]/services - Get all services for a business
export const GET: RequestHandler = async ({ params }) => {
    const services = await db.select()
        .from(table.service)
        .where(eq(table.service.businessId, params.id));

    return json(services);
};
