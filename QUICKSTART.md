# Slotly - Quick Start Guide

## 🎯 What is Slotly?

Slotly is a professional appointment and queue management system designed for small businesses. It allows:

- **Customers**: Browse businesses, view available time slots, and book appointments
- **Business Owners**: Create and manage businesses, define services, create time slots, and receive bookings

## 🚀 Getting Started (3 minutes)

### Step 1: Setup

```bash
# Run the setup script
./setup.sh

# Or manually:
pnpm install
cp .env.example .env
pnpm db:push
```

### Step 2: Start Development Server

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173)

### Step 3: Create Your First Business

1. **Register an account** at `/register`
2. **Go to Dashboard** at `/dashboard`
3. **Click "Create Business"**
4. **Add a service** (e.g., "Haircut", 30 minutes, $25)
5. **Create time slots** for your service
6. **Share your business URL** with customers!

## 👥 User Journeys

### As a Customer

```
1. Visit homepage → See all businesses
2. Click on a business → View services & available slots
3. Click "Book" → Redirected to login/register
4. After login → Booking confirmed ✅
5. Receive real-time notification
6. Get reminders 24h and 1h before appointment
```

### As a Business Owner

```
1. Register/Login
2. Dashboard → Create Business
3. Add Services (name, duration, price)
4. Create Time Slots
5. Receive real-time notifications when customers book
6. View all bookings in business dashboard
```

## 📁 Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/                    # shadcn-svelte components
│   │   └── NotificationListener.svelte  # SSE notifications
│   ├── server/
│   │   ├── db/
│   │   │   ├── schema.ts          # Database schema
│   │   │   └── index.ts           # DB connection
│   │   ├── auth.ts                # Lucia authentication
│   │   ├── notifications.ts       # Realtime notification manager
│   │   ├── reminders.ts           # Background reminder system
│   │   └── utils.ts               # Server utilities
│   └── custom/
│       └── ThemeToggle.svelte     # Dark mode toggle
├── routes/
│   ├── api/                       # API endpoints
│   │   ├── businesses/
│   │   ├── services/
│   │   ├── slots/
│   │   ├── bookings/
│   │   └── notifications/
│   ├── business/[id]/             # Public business pages
│   ├── dashboard/                 # User dashboard
│   │   └── businesses/[id]/       # Business management
│   ├── login/
│   ├── register/
│   └── +layout.svelte             # Root layout with nav
└── hooks.server.ts                # Server hooks (auth + reminders)
```

## 🔑 Key Features

### ✅ Authentication
- Email/password registration
- Secure password hashing (Argon2)
- Session-based authentication
- Protected routes

### ✅ Booking System
- Real-time availability checking
- Capacity limits
- Prevent overbooking
- Cancel bookings
- Booking history

### ✅ Realtime Notifications
- Server-Sent Events (SSE)
- Instant booking confirmations
- Toast notifications
- Persistent notification history

### ✅ Reminders
- Automatic 24-hour reminders
- Automatic 1-hour reminders
- Background job runs every 15 minutes

### ✅ Business Management
- Create multiple businesses
- Define services with pricing
- Create flexible time slots
- View customer bookings
- Dashboard with stats

## 🛠️ Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm check                  # Type checking
pnpm build                  # Build for production
pnpm preview                # Preview production build

# Database
pnpm db:push                # Push schema changes
pnpm db:generate            # Generate migrations
pnpm db:migrate             # Run migrations
pnpm db:studio              # Open Drizzle Studio (DB GUI)
```

## 🌐 API Routes

### Public
- `GET /api/businesses` - List all businesses
- `GET /api/businesses/:id` - Get business details
- `GET /api/businesses/:id/services` - Get services
- `GET /api/services/:id/slots` - Get available slots

### Authenticated
- `POST /api/businesses/create` - Create business
- `POST /api/services/create` - Create service
- `POST /api/slots/create` - Create time slot
- `POST /api/bookings` - Book appointment
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings/:id/cancel` - Cancel booking
- `GET /api/notifications/stream` - SSE notifications

## 🎨 Tech Stack

- **Frontend**: SvelteKit 5, Svelte 5, TypeScript
- **Styling**: Tailwind CSS, shadcn-svelte
- **Database**: SQLite (libSQL)
- **ORM**: Drizzle ORM
- **Auth**: Lucia Auth (session-based)
- **Realtime**: Server-Sent Events (SSE)
- **Notifications**: svelte-sonner

## 🔒 Security

- ✅ Password hashing with Argon2
- ✅ Session-based authentication
- ✅ CSRF protection (SvelteKit default)
- ✅ Authorization checks on all protected routes
- ✅ SQL injection prevention (Drizzle ORM)
- ✅ Input validation

## 📊 Database Schema

```
users
├── id (pk)
├── email (unique)
├── password_hash
└── created_at

businesses
├── id (pk)
├── owner_id (fk -> users)
├── name
├── description
├── address
├── is_active
└── created_at

services
├── id (pk)
├── business_id (fk -> businesses)
├── name
├── description
├── duration_minutes
├── price
├── is_active
└── created_at

slots
├── id (pk)
├── service_id (fk -> services)
├── start_time
├── end_time
├── max_bookings
└── created_at

bookings
├── id (pk)
├── slot_id (fk -> slots)
├── user_id (fk -> users)
├── status (booked|cancelled|completed)
└── created_at

notifications
├── id (pk)
├── user_id (fk -> users)
├── type (booking_created|reminder|cancelled)
├── message
├── is_read
└── created_at
```

## 🚀 Deployment

### Database
For production, use [Turso](https://turso.tech/):

```env
DATABASE_URL="libsql://your-database.turso.io"
DATABASE_AUTH_TOKEN="your-auth-token"
```

### Build
```bash
pnpm build
```

Deploy to:
- Vercel (recommended)
- Netlify
- Cloudflare Pages
- Any Node.js hosting

## 💡 Tips

1. **Database GUI**: Run `pnpm db:studio` to open Drizzle Studio for easy database viewing
2. **Dark Mode**: Click the theme toggle in the navigation bar
3. **Notifications**: Keep your browser tab open to receive real-time notifications
4. **Testing**: Create multiple accounts to test customer and business owner flows
5. **Production**: Use Turso for serverless SQLite in production

## 🐛 Troubleshooting

### Database not found
```bash
pnpm db:push
```

### Port already in use
```bash
# Change port in vite.config.ts or kill process on port 5173
lsof -ti:5173 | xargs kill
```

### Type errors
```bash
pnpm check
```

## 📚 Learn More

- [SvelteKit Docs](https://kit.svelte.dev/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Lucia Auth Docs](https://lucia-auth.com/)
- [shadcn-svelte](https://www.shadcn-svelte.com/)

## 🤝 Contributing

This is a complete, production-ready system. Feel free to:
- Add new features
- Improve UI/UX
- Add tests
- Enhance security
- Add integrations (payments, email, SMS)

---

Built with ❤️ using SvelteKit
