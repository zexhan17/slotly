import { pgTable, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Users table
export const user = pgTable('user', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

// Sessions table (for Lucia auth)
export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

// Businesses table
export const business = pgTable('business', {
	id: text('id').primaryKey(),
	ownerId: text('owner_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description'),
	address: text('address'),
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

// Services table
export const service = pgTable('service', {
	id: text('id').primaryKey(),
	businessId: text('business_id').notNull().references(() => business.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description'),
	durationMinutes: integer('duration_minutes').notNull().default(30), // Default 30 min sessions
	price: text('price'), // stored as text to avoid float precision issues
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

// Bookings table - stores actual bookings with service + start time
export const booking = pgTable('booking', {
	id: text('id').primaryKey(),
	serviceId: text('service_id').notNull().references(() => service.id, { onDelete: 'cascade' }),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	startTime: timestamp('start_time', { withTimezone: true, mode: 'date' }).notNull(),
	endTime: timestamp('end_time', { withTimezone: true, mode: 'date' }).notNull(),
	status: text('status', { enum: ['booked', 'cancelled', 'completed'] }).notNull().default('booked'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

// Notifications table
export const notification = pgTable('notification', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	type: text('type', { enum: ['booking_created', 'reminder', 'cancelled'] }).notNull(),
	message: text('message').notNull(),
	isRead: boolean('is_read').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

// Weekly Availability table - stores availability for each day of the week per business
export const availability = pgTable('availability', {
	id: text('id').primaryKey(),
	businessId: text('business_id').notNull().references(() => business.id, { onDelete: 'cascade' }),
	dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
	isEnabled: boolean('is_enabled').notNull().default(true),
	startTime: text('start_time').notNull().default('09:00'), // HH:MM format
	endTime: text('end_time').notNull().default('17:00'), // HH:MM format
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

// Type exports
export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Business = typeof business.$inferSelect;
export type Service = typeof service.$inferSelect;
export type Booking = typeof booking.$inferSelect;
export type Notification = typeof notification.$inferSelect;
export type Availability = typeof availability.$inferSelect;
