import { verify } from '@node-rs/argon2';
import { isValidEmail } from '$lib/server/utils';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as auth from '$lib/server/auth';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { loginRateLimit } from '$lib/server/rateLimit';
import { SEED_USER_IDS } from '$lib/server/seed';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async (event) => {
        // Apply rate limiting
        try {
            const identifier = event.getClientAddress() + ':login';
            loginRateLimit(identifier);
        } catch (e) {
            return fail(429, { message: 'Too many login attempts. Please try again in 15 minutes.' });
        }

        const formData = await event.request.formData();
        // Support two modes: demo quick-login by role, or email/password fallback
        const role = formData.get('role');
        if (!role) {
            return fail(400, { message: 'Unknown role' });
        }

        const roleStr = String(role);
        const userId = (SEED_USER_IDS as Record<string, string>)[roleStr];
        if (!userId) {
            return fail(400, { message: 'Unknown role' });
        }

        const results = await db.select().from(table.user).where(eq(table.user.id, userId));
        const existingUser = results.at(0);
        if (!existingUser) {
            return fail(500, { message: 'Seed user not found' });
        }

        const sessionToken = auth.generateSessionToken();
        const session = await auth.createSession(sessionToken, existingUser.id);
        auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

        if (roleStr === 'seller') {
            return redirect(302, '/dashboard');
        }
        return redirect(302, '/');
    }
};
