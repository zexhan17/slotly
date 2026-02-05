/**
 * Seed Data Configuration
 * 
 * Edit this file to customize the seed data for your demo environment.
 * All IDs must remain consistent to ensure proper cleanup protection.
 */

export const SEED_USERS = [
    {
        id: 'user_seed_customer_001',
        email: 'customer@slotly.demo',
        password: 'customer123',
        role: 'customer' as const
    },
    {
        id: 'user_seed_seller_001',
        email: 'seller@slotly.demo',
        password: 'seller123',
        role: 'seller' as const
    }
];

export const SEED_BUSINESSES = [
    {
        id: 'biz_seed_hairsalon_001',
        name: 'Elite Hair Salon',
        description: 'Premium haircuts and styling services',
        address: '123 Main St, Downtown',
        ownerEmail: 'seller@slotly.demo'
    },
    {
        id: 'biz_seed_yogastudio_001',
        name: 'Zen Yoga Studio',
        description: 'Peaceful yoga and meditation classes',
        address: '456 Wellness Ave, Uptown',
        ownerEmail: 'seller@slotly.demo'
    },
    {
        id: 'biz_seed_clinic_001',
        name: 'HealthCare Medical Clinic',
        description: 'General medical consultations and checkups',
        address: '789 Medical Plaza, Health District',
        ownerEmail: 'seller@slotly.demo'
    }
];

export const SEED_SERVICES = [
    // Hair Salon Services
    {
        id: 'srv_seed_haircut_001',
        businessId: 'biz_seed_hairsalon_001',
        name: 'Haircut',
        description: 'Professional haircut and styling',
        durationMinutes: 45,
        price: '35.00'
    },
    {
        id: 'srv_seed_coloring_001',
        businessId: 'biz_seed_hairsalon_001',
        name: 'Hair Coloring',
        description: 'Full hair coloring service',
        durationMinutes: 120,
        price: '85.00'
    },
    {
        id: 'srv_seed_beard_001',
        businessId: 'biz_seed_hairsalon_001',
        name: 'Beard Trim',
        description: 'Beard shaping and trimming',
        durationMinutes: 30,
        price: '20.00'
    },
    {
        id: 'srv_seed_treatment_001',
        businessId: 'biz_seed_hairsalon_001',
        name: 'Hair Treatment',
        description: 'Deep conditioning treatment',
        durationMinutes: 60,
        price: '45.00'
    },

    // Yoga Studio Services
    {
        id: 'srv_seed_morning_001',
        businessId: 'biz_seed_yogastudio_001',
        name: 'Morning Yoga',
        description: 'Energizing morning flow',
        durationMinutes: 60,
        price: '15.00'
    },
    {
        id: 'srv_seed_meditation_001',
        businessId: 'biz_seed_yogastudio_001',
        name: 'Meditation Class',
        description: 'Guided meditation session',
        durationMinutes: 45,
        price: '12.00'
    },
    {
        id: 'srv_seed_power_001',
        businessId: 'biz_seed_yogastudio_001',
        name: 'Power Yoga',
        description: 'Intensive power yoga workout',
        durationMinutes: 75,
        price: '20.00'
    },

    // Medical Clinic Services
    {
        id: 'srv_seed_consultation_001',
        businessId: 'biz_seed_clinic_001',
        name: 'General Consultation',
        description: 'Medical consultation with doctor',
        durationMinutes: 30,
        price: '75.00'
    },
    {
        id: 'srv_seed_checkup_001',
        businessId: 'biz_seed_clinic_001',
        name: 'Health Checkup',
        description: 'Comprehensive health screening',
        durationMinutes: 60,
        price: '120.00'
    },
    {
        id: 'srv_seed_vaccination_001',
        businessId: 'biz_seed_clinic_001',
        name: 'Vaccination',
        description: 'Immunization services',
        durationMinutes: 15,
        price: '25.00'
    },
    {
        id: 'srv_seed_followup_001',
        businessId: 'biz_seed_clinic_001',
        name: 'Follow-up Visit',
        description: 'Follow-up consultation',
        durationMinutes: 20,
        price: '40.00'
    }
];

/**
 * Availability Configuration for seed businesses
 * 
 * Each business can set their weekly availability schedule.
 * Available time slots are generated dynamically based on these settings.
 * All sessions are 30 minutes.
 */
export const SEED_AVAILABILITY = [
    {
        // Hair Salon - Open 9 AM - 5 PM, Monday to Saturday
        businessId: 'biz_seed_hairsalon_001',
        weeklyHours: [
            { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '17:00' }, // Sunday
            { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '17:00' },  // Monday
            { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '17:00' },  // Tuesday
            { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '17:00' },  // Wednesday
            { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '17:00' },  // Thursday
            { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '17:00' },  // Friday
            { dayOfWeek: 6, isOpen: true, openTime: '10:00', closeTime: '15:00' },  // Saturday
        ]
    },
    {
        // Yoga Studio - Open 7 AM - 8 PM daily
        businessId: 'biz_seed_yogastudio_001',
        weeklyHours: [
            { dayOfWeek: 0, isOpen: true, openTime: '08:00', closeTime: '18:00' },  // Sunday
            { dayOfWeek: 1, isOpen: true, openTime: '07:00', closeTime: '20:00' },  // Monday
            { dayOfWeek: 2, isOpen: true, openTime: '07:00', closeTime: '20:00' },  // Tuesday
            { dayOfWeek: 3, isOpen: true, openTime: '07:00', closeTime: '20:00' },  // Wednesday
            { dayOfWeek: 4, isOpen: true, openTime: '07:00', closeTime: '20:00' },  // Thursday
            { dayOfWeek: 5, isOpen: true, openTime: '07:00', closeTime: '20:00' },  // Friday
            { dayOfWeek: 6, isOpen: true, openTime: '08:00', closeTime: '18:00' },  // Saturday
        ]
    },
    {
        // Medical Clinic - Open 8 AM - 4 PM, weekdays only
        businessId: 'biz_seed_clinic_001',
        weeklyHours: [
            { dayOfWeek: 0, isOpen: false, openTime: '08:00', closeTime: '16:00' }, // Sunday
            { dayOfWeek: 1, isOpen: true, openTime: '08:00', closeTime: '16:00' },  // Monday
            { dayOfWeek: 2, isOpen: true, openTime: '08:00', closeTime: '16:00' },  // Tuesday
            { dayOfWeek: 3, isOpen: true, openTime: '08:00', closeTime: '16:00' },  // Wednesday
            { dayOfWeek: 4, isOpen: true, openTime: '08:00', closeTime: '16:00' },  // Thursday
            { dayOfWeek: 5, isOpen: true, openTime: '08:00', closeTime: '16:00' },  // Friday
            { dayOfWeek: 6, isOpen: false, openTime: '08:00', closeTime: '16:00' }, // Saturday
        ]
    }
];
