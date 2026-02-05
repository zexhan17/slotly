import { db } from './db';
import * as table from './db/schema';
import { hash } from '@node-rs/argon2';
import { generateId } from './utils';
import { SEED_USERS, SEED_BUSINESSES, SEED_SERVICES, SEED_AVAILABILITY } from './seed-data';

// Extract seed user IDs from data file
export const SEED_USER_IDS = SEED_USERS.reduce((acc, user) => {
    acc[user.role] = user.id;
    return acc;
}, {} as Record<string, string>);

// Store all seed IDs for protection
export const SEED_DATA_IDS = {
    users: SEED_USERS.map(u => u.id),
    businesses: [] as string[],
    services: [] as string[]
};

export async function seedDatabase() {
    console.log('🌱 Starting database seeding...');

    try {
        // Create users from seed data
        for (const userData of SEED_USERS) {
            const passwordHash = await hash(userData.password, {
                memoryCost: 19456,
                timeCost: 2,
                outputLen: 32,
                parallelism: 1
            });

            await db.insert(table.user).values({
                id: userData.id,
                email: userData.email,
                passwordHash: passwordHash,
            }).onConflictDoNothing();

            console.log(`✅ Created ${userData.role} user: ${userData.email} / ${userData.password}`);
        }

        // Find seller user ID for business ownership
        const sellerUser = SEED_USERS.find(u => u.role === 'seller');
        if (!sellerUser) {
            throw new Error('Seller user not found in seed data');
        }

        // Create businesses from seed data
        for (const bizData of SEED_BUSINESSES) {
            await db.insert(table.business).values({
                id: bizData.id,
                name: bizData.name,
                description: bizData.description,
                address: bizData.address,
                ownerId: sellerUser.id,
                isActive: true
            }).onConflictDoNothing();
            SEED_DATA_IDS.businesses.push(bizData.id);
            console.log(`✅ Created business: ${bizData.name}`);
        }

        // Create services from seed data
        for (const serviceData of SEED_SERVICES) {
            await db.insert(table.service).values({
                id: serviceData.id,
                businessId: serviceData.businessId,
                name: serviceData.name,
                description: serviceData.description,
                durationMinutes: serviceData.durationMinutes,
                price: serviceData.price,
                isActive: true
            }).onConflictDoNothing();
            SEED_DATA_IDS.services.push(serviceData.id);
        }
        console.log(`✅ Created ${SEED_SERVICES.length} services`);

        // Create availability settings for each business
        for (const availConfig of SEED_AVAILABILITY) {
            for (const dayConfig of availConfig.weeklyHours) {
                await db.insert(table.availability).values({
                    id: generateId('avail'),
                    businessId: availConfig.businessId,
                    dayOfWeek: dayConfig.dayOfWeek,
                    isEnabled: dayConfig.isOpen,
                    startTime: dayConfig.openTime,
                    endTime: dayConfig.closeTime
                }).onConflictDoNothing();
            }
        }
        console.log(`✅ Created availability settings for ${SEED_AVAILABILITY.length} businesses`);

        console.log('🎉 Database seeding completed!');
        console.log('\n📋 Login Credentials:');
        for (const user of SEED_USERS) {
            console.log(`   ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}: ${user.email} / ${user.password}`);
        }

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}
