import { error } from '@sveltejs/kit';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

export function rateLimit(config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }) {
    return (identifier: string): void => {
        const now = Date.now();
        const record = rateLimitMap.get(identifier);

        if (!record || now > record.resetTime) {
            // New window
            rateLimitMap.set(identifier, {
                count: 1,
                resetTime: now + config.windowMs
            });
            return;
        }

        if (record.count >= config.maxRequests) {
            throw error(429, 'Too many requests. Please try again later.');
        }

        record.count++;
    };
}

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
        if (now > value.resetTime) {
            rateLimitMap.delete(key);
        }
    }
}, 5 * 60 * 1000);

// Specific rate limiters for different endpoints
export const loginRateLimit = rateLimit({ maxRequests: 5, windowMs: 15 * 60 * 1000 }); // 5 attempts per 15 min
export const apiRateLimit = rateLimit({ maxRequests: 60, windowMs: 60 * 1000 }); // 60 requests per minute
export const bookingRateLimit = rateLimit({ maxRequests: 10, windowMs: 60 * 1000 }); // 10 bookings per minute
export const slotCreationRateLimit = rateLimit({ maxRequests: 20, windowMs: 60 * 1000 }); // 20 slot creations per minute
