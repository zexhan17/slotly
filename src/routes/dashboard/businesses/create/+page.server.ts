import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(302, '/login');
    }

    return {
        user: locals.user
    };
};

export const actions: Actions = {
    default: async ({ request, fetch }) => {
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const address = formData.get('address') as string;

        if (!name || name.trim().length === 0) {
            return fail(400, { message: 'Business name is required' });
        }

        const response = await fetch('/api/businesses/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, address })
        });

        if (!response.ok) {
            return fail(400, { message: 'Failed to create business' });
        }

        const business = await response.json();
        throw redirect(302, `/dashboard/businesses/${business.id}`);
    }
};
