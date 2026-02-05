import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and, like } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// GET /api/businesses - List all active businesses
export const GET: RequestHandler = async ({ url }) => {
    const search = url.searchParams.get('search') || '';

    let query = db.select().from(table.business).where(eq(table.business.isActive, true));

    if (search) {
        query = db.select().from(table.business).where(
            and(
                eq(table.business.isActive, true),
                like(table.business.name, `%${search}%`)
            )
        );
    }

    const businesses = await query;

    return json(businesses);
};
