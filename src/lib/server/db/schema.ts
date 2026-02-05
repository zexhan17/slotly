import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table
export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// Sessions table (for Lucia auth)
export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

// Businesses table
export const business = sqliteTable('business', {
	id: text('id').primaryKey(),
	ownerId: text('owner_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description'),
	address: text('address'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// Services table
export const service = sqliteTable('service', {
	id: text('id').primaryKey(),
	businessId: text('business_id').notNull().references(() => business.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description'),
	durationMinutes: integer('duration_minutes').notNull().default(30), // Default 30 min sessions
	price: text('price'), // stored as text to avoid float precision issues
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// Bookings table - stores actual bookings with service + start time
export const booking = sqliteTable('booking', {
	id: text('id').primaryKey(),
	serviceId: text('service_id').notNull().references(() => service.id, { onDelete: 'cascade' }),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
	endTime: integer('end_time', { mode: 'timestamp' }).notNull(),
	status: text('status', { enum: ['booked', 'cancelled', 'completed'] }).notNull().default('booked'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// Notifications table
export const notification = sqliteTable('notification', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	type: text('type', { enum: ['booking_created', 'reminder', 'cancelled'] }).notNull(),
	message: text('message').notNull(),
	isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// Weekly Availability table - stores availability for each day of the week per business
export const availability = sqliteTable('availability', {
	id: text('id').primaryKey(),
	businessId: text('business_id').notNull().references(() => business.id, { onDelete: 'cascade' }),
	dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
	isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull().default(true),
	startTime: text('start_time').notNull().default('09:00'), // HH:MM format
	endTime: text('end_time').notNull().default('17:00'), // HH:MM format
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// Type exports
export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Business = typeof business.$inferSelect;
export type Service = typeof service.$inferSelect;
export type Booking = typeof booking.$inferSelect;
export type Notification = typeof notification.$inferSelect;
export type Availability = typeof availability.$inferSelect;
