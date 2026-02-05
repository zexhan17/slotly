import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { generateId } from '$lib/server/utils';
import { notificationManager } from '$lib/server/notifications';
import { eq, and, gte, lte } from 'drizzle-orm';

// Send reminder notifications for upcoming bookings
export async function sendReminders() {
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Get bookings starting in the next 24 hours
    const upcomingBookings = await db.select({
        booking: table.booking,
        service: table.service,
        business: table.business,
        user: table.user
    })
        .from(table.booking)
        .innerJoin(table.service, eq(table.booking.serviceId, table.service.id))
        .innerJoin(table.business, eq(table.service.businessId, table.business.id))
        .innerJoin(table.user, eq(table.booking.userId, table.user.id))
        .where(
            and(
                eq(table.booking.status, 'booked'),
                gte(table.booking.startTime, now),
                lte(table.booking.startTime, twentyFourHoursFromNow)
            )
        );

    for (const { booking, service, business, user } of upcomingBookings) {
        const timeUntilAppointment = booking.startTime.getTime() - now.getTime();
        const hoursUntil = Math.floor(timeUntilAppointment / (60 * 60 * 1000));

        // Send 24-hour reminder
        if (hoursUntil <= 24 && hoursUntil > 23) {
            const message = `Reminder: Your appointment for ${service.name} at ${business.name} is tomorrow at ${booking.startTime.toLocaleTimeString()}`;
            await createAndSendReminder(user.id, message);
        }

        // Send 1-hour reminder
        if (hoursUntil <= 1 && hoursUntil > 0) {
            const message = `Reminder: Your appointment for ${service.name} at ${business.name} starts in 1 hour!`;
            await createAndSendReminder(user.id, message);
        }
    }

    console.log(`Checked ${upcomingBookings.length} upcoming bookings for reminders`);
}

async function createAndSendReminder(userId: string, message: string) {
    const notificationId = generateId('notif');

    // Save to database
    await db.insert(table.notification).values({
        id: notificationId,
        userId,
        type: 'reminder',
        message,
        isRead: false
    });

    // Send realtime notification
    notificationManager.notify(userId, {
        id: notificationId,
        type: 'reminder',
        message
    });
}

// Run the reminder check every 15 minutes
let reminderInterval: NodeJS.Timeout | null = null;

export function startReminderService() {
    if (reminderInterval) {
        console.log('Reminder service already running');
        return;
    }

    console.log('Starting reminder service...');

    // Run immediately
    sendReminders().catch(console.error);

    // Then every 15 minutes
    reminderInterval = setInterval(() => {
        sendReminders().catch(console.error);
    }, 15 * 60 * 1000);

    console.log('Reminder service started');
}

export function stopReminderService() {
    if (reminderInterval) {
        clearInterval(reminderInterval);
        reminderInterval = null;
        console.log('Reminder service stopped');
    }
}
