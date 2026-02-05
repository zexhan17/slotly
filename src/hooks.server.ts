import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { startReminderService } from '$lib/server/reminders';
import { seedDatabase } from '$lib/server/seed';
import { startCleanupService } from '$lib/server/cleanup';
import { apiRateLimit } from '$lib/server/rateLimit';
import { error } from '@sveltejs/kit';

// Initialize database with seed data, then start background services
seedDatabase()
	.then(() => {
		startReminderService();
		startCleanupService();
	})
	.catch(console.error);

const handleAuth: Handle = async ({ event, resolve }) => {
	// Apply rate limiting to API routes
	if (event.url.pathname.startsWith('/api/')) {
		try {
			const identifier = event.getClientAddress();
			apiRateLimit(identifier);
		} catch (e) {
			if (e && typeof e === 'object' && 'status' in e && e.status === 429) {
				throw error(429, 'Too many requests. Please slow down.');
			}
			throw e;
		}
	}

	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;

		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	const response = await resolve(event);

	// Add security headers
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

	return response;
};

export const handle: Handle = handleAuth;
