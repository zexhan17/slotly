import { redirect, fail, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
    if (!locals.user) {
        throw redirect(302, '/login');
    }

    const [business] = await db.select()
        .from(table.business)
        .where(eq(table.business.id, params.id));

    if (!business) {
        throw error(404, 'Business not found');
    }

    if (business.ownerId !== locals.user.id) {
        throw error(403, 'Forbidden');
    }

    return { business };
};

export const actions: Actions = {
    default: async ({ request, params, fetch }) => {
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const durationMinutes = parseInt(formData.get('durationMinutes') as string);
        const price = formData.get('price') as string;

        if (!name || name.trim().length === 0) {
            return fail(400, { message: 'Service name is required' });
        }

        if (!durationMinutes || durationMinutes <= 0) {
            return fail(400, { message: 'Duration must be greater than 0' });
        }

        const response = await fetch('/api/services/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                businessId: params.id,
                name,
                description,
                durationMinutes,
                price
            })
        });

        if (!response.ok) {
            return fail(400, { message: 'Failed to create service' });
        }

        throw redirect(302, `/dashboard/businesses/${params.id}`);
    }
};
