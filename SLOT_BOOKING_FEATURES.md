# Slot Creation & Booking Configuration Guide

## Overview
Slotly now features a highly configurable slot creation and booking system with advanced options for managing appointments, capacity, and availability.

## Slot Creation Modes

### 1. Single Slot Creation
Create individual time slots one at a time.

**Features:**
- Manual start/end time selection
- Auto-calculated end time based on service duration
- Custom capacity per slot

**Use Cases:**
- One-time special appointments
- Irregular availability
- Testing new services

---

### 2. Bulk Slot Creation
Generate multiple slots for a single day in one operation.

**Configuration Options:**
- **Date**: Select the day for bulk creation
- **Start Time**: When the first slot begins (e.g., 09:00)
- **End Time**: When the last slot should end (e.g., 17:00)
- **Interval**: Time between slot starts in minutes (e.g., 30 = slots every 30 minutes)

**Example:**
```
Service: Haircut (30 minutes)
Date: 2026-02-10
Start Time: 09:00
End Time: 17:00
Interval: 30 minutes

Result: Creates slots at:
- 09:00 - 09:30
- 09:30 - 10:00
- 10:00 - 10:30
... continues until 16:30 - 17:00
```

**Use Cases:**
- Daily appointment scheduling
- Opening regular business hours
- Event day scheduling

---

### 3. Recurring Slot Creation
Automatically create repeating slots across multiple days.

**Pattern Options:**

#### Daily Pattern
Repeats every day for the specified number of occurrences.

**Example:**
```
Slot Time: 10:00 - 11:00
Pattern: Daily
Occurrences: 7

Result: Creates the same slot for 7 consecutive days
```

#### Weekly Pattern
Repeats the same day of the week.

**Example:**
```
Slot Time: Monday 14:00 - 15:00
Pattern: Weekly
Occurrences: 4

Result: Creates slots for next 4 Mondays
```

#### Weekdays Pattern
Repeats Monday through Friday only, skipping weekends.

**Example:**
```
Slot Time: 09:00 - 10:00
Pattern: Weekdays
Occurrences: 10

Result: Creates slots for next 10 weekdays (skips Sat/Sun)
```

**Configuration:**
- **Occurrences**: Number of times to repeat (1-365)
- **End Date**: Alternative to occurrences - stops creating slots after this date

**Use Cases:**
- Regular weekly classes/sessions
- Ongoing therapy/consultation appointments
- Subscription-based services

---

## Capacity & Booking Controls

### Maximum Bookings per Slot
Set how many customers can book the same time slot.

**Default:** 1 (one-on-one appointment)
**Range:** 1-100

**Use Cases:**
- **1**: Personal training, doctor visits, haircuts
- **5-10**: Small group classes, workshops
- **20+**: Large events, seminars, webinars
- **100**: Open house, community events

---

### Buffer Time
Gap time added after each booking for preparation, cleanup, or travel.

**Configuration:** Minutes (0-60+)
**Default:** 0

**Example:**
```
Service Duration: 45 minutes
Buffer Time: 15 minutes
Actual Time Blocked: 60 minutes

Booking ends at 10:45, but next slot starts at 11:00
```

**Use Cases:**
- Medical appointments (sanitization time)
- Home services (travel between locations)
- Equipment-based services (setup/teardown)
- Back-to-back consultations (admin time)

---

### Advance Booking Window
How far in the future customers can book.

**Configuration:** Days (1-365)
**Default:** 30 days

**Examples:**
- **7 days**: Weekly schedule, rolling availability
- **30 days**: Standard monthly planning
- **90 days**: Quarterly planning for seasonal services
- **365 days**: Wedding venues, event spaces

**Benefits:**
- Prevents too-far-ahead bookings
- Manages capacity planning
- Reduces no-shows for distant appointments
- Allows phased release of availability

---

### Minimum Advance Notice
Minimum time before slot starts that bookings are accepted.

**Configuration:** Hours (0-72)
**Default:** 1 hour

**Examples:**
- **0 hours**: Walk-in friendly, instant bookings
- **1 hour**: Quick turnaround services
- **4 hours**: Same-day appointments with prep time
- **24 hours**: Next-day minimum, better planning
- **48-72 hours**: Multi-day notice for complex services

**Use Cases:**
- Prevent last-minute bookings
- Ensure preparation time
- Staff scheduling requirements
- Inventory/material preparation

---

## Booking Validation Rules

The system automatically enforces these rules:

### Time-Based Validations
✅ Slot must be in the future
✅ Booking must be within advance booking window
✅ Booking must meet minimum advance notice
✅ End time must be after start time

### Capacity Validations
✅ Slot cannot exceed maximum bookings
✅ User cannot double-book same slot
✅ Checks available spots in real-time

### Authorization
✅ Users must be logged in to book
✅ Only business owners can create slots
✅ Owner verification for slot creation

---

## Real-World Scenarios

### Scenario 1: Hair Salon
```
Service: Haircut (45 min)
Mode: Bulk Creation
Hours: 9am - 6pm
Interval: 45 minutes
Max Bookings: 1
Buffer: 15 minutes (cleanup between clients)
Advance Window: 14 days
Min Notice: 2 hours
```

### Scenario 2: Yoga Studio
```
Service: Morning Yoga Class (60 min)
Mode: Recurring - Weekdays
Time: 7:00 AM - 8:00 AM
Occurrences: 20 (4 weeks)
Max Bookings: 15
Buffer: 0
Advance Window: 30 days
Min Notice: 4 hours
```

### Scenario 3: Medical Clinic
```
Service: Doctor Consultation (30 min)
Mode: Bulk Creation
Hours: 8am - 4pm
Interval: 30 minutes
Max Bookings: 1
Buffer: 10 minutes (notes, sanitization)
Advance Window: 60 days
Min Notice: 24 hours
```

### Scenario 4: Event Venue
```
Service: Venue Rental (4 hours)
Mode: Single Slot
Custom Times: Set individually
Max Bookings: 1
Buffer: 2 hours (setup/teardown)
Advance Window: 365 days
Min Notice: 168 hours (1 week)
```

### Scenario 5: Webinar Platform
```
Service: Live Training Session (90 min)
Mode: Recurring - Weekly
Time: Every Thursday 2pm - 3:30pm
Occurrences: 12
Max Bookings: 50
Buffer: 0
Advance Window: 90 days
Min Notice: 1 hour
```

---

## Tips for Optimal Configuration

### For High-Volume Services
- Use **bulk creation** for consistent daily schedules
- Set appropriate **intervals** to maximize capacity
- Consider **buffer time** to avoid burnout
- Shorter **advance windows** for better demand prediction

### For Premium/Consultative Services
- Use **single slots** or **recurring** patterns
- Longer **buffer times** for personalized attention
- Longer **minimum advance notice** for preparation
- Extended **advance booking windows** for planning

### For Classes/Group Events
- **Recurring patterns** for regular schedules
- Higher **max bookings** for group capacity
- Longer **minimum notice** to ensure minimum attendance
- Clear **capacity limits** for space constraints

### For Emergency/Walk-in Services
- **Bulk creation** with short intervals
- **0 buffer time** for immediate availability
- **0 minimum notice** for instant booking
- Short **advance window** (7 days) for flexibility

---

## Future Enhancements (Coming Soon)

- 🔜 Cancellation policies (hours before, refund rules)
- 🔜 Waitlist for fully booked slots
- 🔜 Custom booking fields (notes, preferences)
- 🔜 Multi-day slot creation (e.g., Mon/Wed/Fri only)
- 🔜 Dynamic pricing by time/date
- 🔜 Booking approval workflow (manual confirmation)
- 🔜 Block out dates (holidays, vacations)
- 🔜 Resource management (rooms, equipment)

---

## Technical Details

### Database Schema
```typescript
slot {
  id: string
  serviceId: string
  startTime: timestamp
  endTime: timestamp
  maxBookings: integer (default: 1)
  bufferMinutes: integer (default: 0)
  advanceBookingDays: integer (default: 30)
  minAdvanceHours: integer (default: 1)
  createdAt: timestamp
}
```

### API Validation
All booking requests validate:
1. User authentication
2. Slot availability check
3. Advance booking window compliance
4. Minimum advance notice compliance
5. Capacity limits
6. Duplicate booking prevention

---

## Support & Feedback

For questions or feature requests, contact the development team or submit an issue on GitHub.
