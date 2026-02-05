# Security Features & Demo Environment Setup

## Overview
This Slotly instance is configured as a secure demo environment with automatic data cleanup and rate limiting to prevent abuse.

## 🔐 Security Features

### 1. Rate Limiting
Protects all endpoints from abuse with configurable limits:

#### Login Endpoint
- **Limit**: 5 attempts per 15 minutes
- **Per**: IP address
- **Purpose**: Prevent brute force attacks

#### API Routes (General)
- **Limit**: 60 requests per minute
- **Per**: IP address
- **Purpose**: Prevent API abuse

#### Booking Creation
- **Limit**: 10 bookings per minute
- **Per**: User + IP combination
- **Purpose**: Prevent spam bookings

#### Slot Creation
- **Limit**: 20 slot creations per minute
- **Per**: User + IP combination
- **Purpose**: Prevent database flooding

### 2. Security Headers
All responses include security headers:
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Permissions-Policy` - Restricts camera, microphone, geolocation access

### 3. Authentication
- **Password Hashing**: Argon2id (industry-standard)
- **Session-Based Auth**: Lucia Auth library
- **Session Expiry**: Automatic cleanup of expired sessions
- **Secure Cookies**: HttpOnly, SameSite=Lax

### 4. Input Validation
- Email validation on all user inputs
- Password strength requirements (minimum 8 characters)
- Type-safe database queries via Drizzle ORM
- Sanitized user inputs

### 5. Authorization
- Owner-only access to business management
- User verification for all mutations
- Protected seed data from deletion
- Role-based access control

---

## 🌱 Demo Environment Configuration

### Automatic Data Cleanup
A cron job runs **every hour** to clean up non-seed data:

**What Gets Deleted:**
- ✅ All user-created bookings
- ✅ All notifications
- ✅ All sessions (users will be logged out)
- ✅ Non-seed slots, services, businesses, and users

**What's Protected (Never Deleted):**
- ⭐ 2 seed users (customer & seller)
- ⭐ 3 seed businesses
- ⭐ 11 seed services
- ⭐ ~400+ seed slots (for next 14 days)

### Seed Data Details

#### Default Users
Two permanent demo accounts are always available:

**Customer Account:**
- Email: `customer@slotly.demo`
- Password: `customer123`
- Role: Regular user (can browse and book)

**Seller Account:**
- Email: `seller@slotly.demo`
- Password: `seller123`
- Role: Business owner (can manage businesses, services, slots)

#### Seed Businesses

**1. Elite Hair Salon**
- Owner: seller@slotly.demo
- Address: 123 Main St, Downtown
- Services: Haircut (45min), Hair Coloring (120min), Beard Trim (30min), Hair Treatment (60min)
- Slots: 9 AM - 5 PM, every 45 minutes, next 14 days

**2. Zen Yoga Studio**
- Owner: seller@slotly.demo
- Address: 456 Wellness Ave, Uptown
- Services: Morning Yoga (60min), Meditation Class (45min), Power Yoga (75min)
- Slots: 7 AM, 12 PM, 6 PM daily, next 14 days
- Capacity: 15 people per class

**3. HealthCare Medical Clinic**
- Owner: seller@slotly.demo
- Address: 789 Medical Plaza, Health District
- Services: General Consultation (30min), Health Checkup (60min), Vaccination (15min), Follow-up Visit (20min)
- Slots: 8 AM - 4 PM, every 30 minutes, weekdays only, next 14 days

---

## 🚫 Registration Disabled

The registration page has been **removed** to maintain demo environment integrity:
- Only seed users can access the system
- No new user creation allowed
- Prevents spam and unauthorized usage
- Ensures consistent demo experience

---

## 🎯 User Experience Improvements

### Toast Notifications
All user feedback now uses Sonner toast notifications instead of browser alerts:
- ✅ Success messages (green)
- ❌ Error messages (red)
- ℹ️ Info messages (blue)
- Non-blocking, auto-dismissing notifications
- Better UX and modern interface

### Examples:
- "Booking successful! Check your dashboard."
- "Failed to book appointment. Slot is fully booked."
- "Too many login attempts. Please try again in 15 minutes."
- "Booking cancelled successfully"

---

## 🛡️ API Security Best Practices

### 1. Always Authenticated
All mutation endpoints require authentication:
```typescript
if (!locals.user) {
    throw error(401, 'Unauthorized');
}
```

### 2. Rate Limited
All endpoints apply appropriate rate limits:
```typescript
try {
    const identifier = getClientAddress() + ':' + locals.user.id;
    bookingRateLimit(identifier);
} catch (e) {
    throw error(429, 'Too many requests. Please slow down.');
}
```

### 3. Owner Verification
Business operations verify ownership:
```typescript
if (business.ownerId !== locals.user.id) {
    throw error(403, 'Forbidden');
}
```

### 4. Data Validation
All inputs validated before processing:
```typescript
if (!isValidEmail(email)) {
    throw error(400, 'Invalid email address');
}
```

---

## 📊 Monitoring & Logs

### Cleanup Service Logs
```
🧹 Starting cleanup of non-seed data...
  Deleted 23 bookings
  Deleted 45 notifications
  Deleted 12 sessions
  Deleted 0 non-seed slots
  Deleted 0 non-seed services
  Deleted 0 non-seed businesses
  Deleted 0 non-seed users
✅ Cleanup completed! Total items deleted: 80
```

### Seeding Logs
```
🌱 Starting database seeding...
✅ Created customer user: customer@slotly.demo / customer123
✅ Created seller user: seller@slotly.demo / seller123
✅ Created business: Elite Hair Salon
✅ Created business: Zen Yoga Studio
✅ Created business: HealthCare Medical Clinic
✅ Created 11 services
✅ Created 412 slots for next 14 days
🎉 Database seeding completed!
```

---

## 🔧 Configuration Files

### Rate Limit Configuration
**File**: `src/lib/server/rateLimit.ts`

Adjust limits by modifying:
```typescript
export const loginRateLimit = rateLimit({ 
    maxRequests: 5, 
    windowMs: 15 * 60 * 1000 
});

export const apiRateLimit = rateLimit({ 
    maxRequests: 60, 
    windowMs: 60 * 1000 
});
```

### Cleanup Interval
**File**: `src/lib/server/cleanup.ts`

Change cleanup frequency:
```typescript
// Currently: 1 hour
setInterval(() => {
    cleanupNonSeedData().catch(console.error);
}, 60 * 60 * 1000); // Change this value
```

### Seed Data Protection
**File**: `src/lib/server/seed.ts`

Protected IDs are hardcoded:
```typescript
export const SEED_USER_IDS = {
    customer: 'user_seed_customer_001',
    seller: 'user_seed_seller_001'
};

export const SEED_DATA_IDS = {
    users: [...],
    businesses: [...],
    services: [...],
    slots: [...]
};
```

---

## 🚀 Quick Start for Developers

### Testing the Demo
1. Visit the app at http://localhost:5173
2. Login with either demo account:
   - Customer: `customer@slotly.demo` / `customer123`
   - Seller: `seller@slotly.demo` / `seller123`

3. As Customer:
   - Browse businesses
   - Book appointments
   - View dashboard with bookings

4. As Seller:
   - Manage 3 seed businesses
   - Create new services (will be deleted in 1 hour)
   - Create new slots (will be deleted in 1 hour)
   - View bookings for your businesses

### Testing Rate Limiting
```bash
# Test login rate limit (>5 attempts in 15 min)
for i in {1..10}; do
  curl -X POST http://localhost:5173/login \
    -d "email=test@test.com&password=wrong"
done

# Test booking rate limit (>10 requests per minute)
for i in {1..15}; do
  curl -X POST http://localhost:5173/api/bookings \
    -H "Content-Type: application/json" \
    -d '{"slotId":"test"}'
done
```

### Verifying Cleanup
Check logs after 1 hour to see cleanup in action:
```
🧹 Starting cleanup of non-seed data...
✅ Cleanup completed! Total items deleted: X
```

---

## 🔒 Production Deployment Notes

For production deployment, consider:

1. **Disable Cleanup Job**: Remove `startCleanupService()` from `hooks.server.ts`
2. **Enable Registration**: Uncomment or recreate registration routes
3. **Environment-Based Config**: Use `.env` for rate limits and cleanup intervals
4. **Database Backups**: Implement regular backup strategy
5. **Monitoring**: Add error tracking (Sentry, etc.)
6. **SSL/TLS**: Ensure HTTPS in production
7. **CORS**: Configure appropriate CORS headers
8. **CSP**: Add Content Security Policy headers

---

## 📝 License & Support

This is a demo environment. All data is temporary and will be reset hourly.
For production use, modify security settings appropriately for your use case.
