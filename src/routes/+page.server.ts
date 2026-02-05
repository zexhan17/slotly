import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const businesses = await db.select()
        .from(table.business)
        .where(eq(table.business.isActive, true));

    return {
        businesses
    };
};
