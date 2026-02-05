# Slotly - Appointment & Queue Management System

> **🎯 Demo Environment**: This instance auto-resets every hour with fresh seed data. [See Security Details](SECURITY.md)

A professional appointment and queue management system built with SvelteKit, SQLite, Drizzle ORM, and Lucia Auth.

## 🌟 Features

### Core Functionality
✅ **Public Business Browsing** - Browse businesses and view available slots without logging in  
✅ **User Authentication** - Email/password authentication with Lucia  
✅ **Appointment Booking** - Book appointments with real-time availability checking  
✅ **Business Management** - Create and manage your own businesses  
✅ **Service Management** - Define services with duration and pricing  
✅ **Advanced Slot Creation** - Single, bulk, and recurring slot patterns  
✅ **Realtime Notifications** - Get instant booking notifications via Server-Sent Events (SSE)  
✅ **Appointment Reminders** - Automatic reminders 24 hours and 1 hour before appointments  
✅ **User Dashboard** - View and manage your bookings and businesses  
✅ **Responsive UI** - Modern, clean interface with dark mode support  

### Security & Demo Features
🔒 **Rate Limiting** - API protection against abuse  
🔒 **Security Headers** - XSS, clickjacking, and MIME-sniffing protection  
🔒 **Argon2id Hashing** - Industry-standard password security  
🌱 **Auto-Cleanup** - Hourly data reset (preserves seed data)  
🌱 **Demo Accounts** - 2 persistent users (customer & seller)  
🌱 **Seed Data** - 3 businesses, 11 services, 400+ slots pre-loaded  

## 🎭 Demo Credentials

Registration is disabled. Use these accounts:

**Customer Account:**
- Email: `customer@slotly.demo`
- Password: `customer123`

**Seller Account:**
- Email: `seller@slotly.demo`
- Password: `seller123`

## 🛠️ Tech Stack

- **Framework**: SvelteKit 5 + Svelte 5
- **Database**: SQLite3 (via libSQL)
- **ORM**: Drizzle ORM
- **Authentication**: Lucia Auth (session-based)
- **UI Components**: shadcn-svelte (Tailwind CSS v4)
- **Notifications**: Svelte Sonner (toast notifications)
- **Realtime**: Server-Sent Events (SSE)
- **Security**: Custom rate limiting, security headers
- **Type Safety**: TypeScript

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` and configure your database URL:

```env
DATABASE_URL="file:./local.db"
```

### 3. Push Database Schema

```bash
pnpm db:push
```

### 4. Start Development Server

```bash
pnpm dev
```

Visit http://localhost:5173

## Database Commands

```bash
# Push schema to database
pnpm db:push

# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Open Drizzle Studio (DB GUI)
pnpm db:studio
```

## Project Structure

```
src/
├── lib/
│   ├── components/        # UI components
│   ├── server/
│   │   ├── db/           # Database connection & schema
│   │   ├── auth.ts       # Lucia authentication
│   │   ├── notifications.ts  # Realtime notification manager
│   │   ├── reminders.ts  # Background reminder service
│   │   └── utils.ts      # Server utilities
│   └── custom/           # Custom components
├── routes/
│   ├── api/              # API endpoints
│   ├── business/         # Public business pages
│   ├── dashboard/        # User dashboard
│   ├── login/            # Authentication pages
│   └── register/
└── hooks.server.ts       # SvelteKit server hooks
```

## Key Features Explained

### Authentication Flow

1. User registers with email/password
2. Password is hashed using Argon2
3. Session-based authentication with cookies
4. Protected routes require authentication

### Booking Flow

1. User browses businesses (no login required)
2. Views services and available slots
3. Must log in to book
4. System checks slot availability
5. Creates booking and sends realtime notifications
6. Both user and business owner receive notifications

### Realtime Notifications

- Uses Server-Sent Events (SSE)
- Persistent connection while user is logged in
- Instant notifications for:
  - New bookings
  - Booking confirmations
  - Appointment reminders

### Reminder System

- Background job runs every 15 minutes
- Sends reminders at:
  - 24 hours before appointment
  - 1 hour before appointment
- Notifications stored in DB and sent in realtime

## API Endpoints

### Public
- `GET /api/businesses` - List all businesses
- `GET /api/businesses/:id` - Get business details
- `GET /api/businesses/:id/services` - Get business services
- `GET /api/services/:id/slots` - Get available slots

### Auth Required
- `POST /api/businesses/create` - Create business
- `POST /api/services/create` - Create service
- `POST /api/slots/create` - Create slot
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings/:id/cancel` - Cancel booking
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/stream` - SSE stream for realtime notifications

## User Flows

### As a Customer

1. Browse businesses on home page
2. Click on a business to view services
3. See available time slots
4. Click "Book" → redirected to login if not authenticated
5. After login, booking is created
6. Receive confirmation notification
7. View bookings in dashboard
8. Receive reminders before appointment

### As a Business Owner

1. Register/login
2. Create a business from dashboard
3. Add services (name, duration, price)
4. Create time slots for services
5. View bookings in business dashboard
6. Receive realtime notifications for new bookings

## Security Features

- Password hashing with Argon2
- Session-based authentication
- CSRF protection via SvelteKit
- Authorization checks on all protected routes
- SQL injection prevention via Drizzle ORM

## Future Enhancements

- Payment integration (Stripe)
- Email/SMS notifications
- Calendar integration
- Multi-staff scheduling
- Reviews and ratings
- Advanced analytics

## Production Deployment

### Database

For production, use [Turso](https://turso.tech/) (serverless SQLite):

```env
DATABASE_URL="libsql://your-database.turso.io"
DATABASE_AUTH_TOKEN="your-auth-token"
```

### Environment Variables

Ensure these are set in your production environment:
- `DATABASE_URL`
- `DATABASE_AUTH_TOKEN` (if using Turso)

### Build

```bash
pnpm build
```

## License

MIT

---

Built with ❤️ using SvelteKit

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
