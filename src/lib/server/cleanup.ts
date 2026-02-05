import { db } from './db';
import * as table from './db/schema';
import { not, inArray } from 'drizzle-orm';
import { SEED_DATA_IDS } from './seed';

export async function cleanupNonSeedData() {
    console.log('🧹 Starting cleanup of non-seed data...');

    try {
        let deletedCount = 0;

        // Delete non-seed bookings (all bookings are temporary)
        const deletedBookings = await db.delete(table.booking).returning();
        deletedCount += deletedBookings.length;
        console.log(`  Deleted ${deletedBookings.length} bookings`);

        // Delete non-seed notifications (all notifications are temporary)
        const deletedNotifications = await db.delete(table.notification).returning();
        deletedCount += deletedNotifications.length;
        console.log(`  Deleted ${deletedNotifications.length} notifications`);

        // Delete non-seed sessions (all sessions are temporary)
        const deletedSessions = await db.delete(table.session).returning();
        deletedCount += deletedSessions.length;
        console.log(`  Deleted ${deletedSessions.length} sessions`);

        // Delete non-seed services
        if (SEED_DATA_IDS.services.length > 0) {
            const deletedServices = await db.delete(table.service)
                .where(not(inArray(table.service.id, SEED_DATA_IDS.services)))
                .returning();
            deletedCount += deletedServices.length;
            console.log(`  Deleted ${deletedServices.length} non-seed services`);
        }

        // Delete non-seed businesses
        if (SEED_DATA_IDS.businesses.length > 0) {
            const deletedBusinesses = await db.delete(table.business)
                .where(not(inArray(table.business.id, SEED_DATA_IDS.businesses)))
                .returning();
            deletedCount += deletedBusinesses.length;
            console.log(`  Deleted ${deletedBusinesses.length} non-seed businesses`);
        }

        // Delete non-seed users
        if (SEED_DATA_IDS.users.length > 0) {
            const deletedUsers = await db.delete(table.user)
                .where(not(inArray(table.user.id, SEED_DATA_IDS.users)))
                .returning();
            deletedCount += deletedUsers.length;
            console.log(`  Deleted ${deletedUsers.length} non-seed users`);
        }

        console.log(`✅ Cleanup completed! Total items deleted: ${deletedCount}`);
        return deletedCount;
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        throw error;
    }
}

export function startCleanupService() {
    console.log('🕐 Starting hourly cleanup service...');

    // Run immediately on startup
    cleanupNonSeedData().catch(console.error);

    // Then run every hour
    const intervalId = setInterval(() => {
        cleanupNonSeedData().catch(console.error);
    }, 60 * 60 * 1000); // 1 hour in milliseconds

    console.log('✅ Cleanup service started (runs every 1 hour)');

    return intervalId;
}
