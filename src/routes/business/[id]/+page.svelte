<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Dialog from "$lib/components/ui/dialog";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import * as Alert from "$lib/components/ui/alert";
    import { toast } from "svelte-sonner";

    let { data } = $props();

    // Types
    type TimeSlot = {
        startTime: Date;
        endTime: Date;
        isBooked: boolean;
    };

    type ServiceWithSlots = (typeof data.services)[0] & {
        availableSlots: TimeSlot[];
    };

    // State
    let selectedService = $state<ServiceWithSlots | null>(null);
    let selectedDate = $state<Date | null>(null);
    let currentMonth = $state(new Date());
    let isBooking = $state(false);

    // Mobile dialog state
    let showMobileDialog = $state(false);
    let mobileStep = $state<"service" | "calendar" | "time">("service");

    // Is current viewer the business owner?
    const isOwner = $derived(
        !!(
            data.viewerId &&
            data.business &&
            data.viewerId === data.business.ownerId
        ),
    );

    // Get available dates for selected service as a Set for quick lookup
    const availableDateStrings = $derived.by(() => {
        if (!selectedService) return new Set<string>();
        const dates = new Set<string>();
        selectedService.availableSlots.forEach((slot) => {
            const d = new Date(slot.startTime);
            dates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
        });
        return dates;
    });

    // Get time slots for selected date
    const timeSlots = $derived.by(() => {
        if (!selectedService || !selectedDate) return [] as TimeSlot[];
        const dayStart = new Date(selectedDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(selectedDate);
        dayEnd.setHours(23, 59, 59, 999);

        return selectedService.availableSlots
            .filter((slot) => {
                const slotTime = new Date(slot.startTime).getTime();
                return (
                    slotTime >= dayStart.getTime() &&
                    slotTime <= dayEnd.getTime()
                );
            })
            .sort(
                (a, b) =>
                    new Date(a.startTime).getTime() -
                    new Date(b.startTime).getTime(),
            );
    });

    // Calendar helpers
    function getDaysInMonth(date: Date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days: (Date | null)[] = [];

        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    }

    function isDateAvailable(date: Date | null) {
        if (!date) return false;

        // Check if this day of week has availability enabled
        const dayOfWeek = date.getDay();
        const dayAvailability = data.availability?.find(
            (a: any) => a.dayOfWeek === dayOfWeek,
        );

        return dayAvailability?.isEnabled ?? false;
    }

    function isSameDate(d1: Date | null, d2: Date | null) {
        if (!d1 || !d2) return false;
        return (
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
        );
    }

    function isToday(date: Date | null) {
        if (!date) return false;
        const today = new Date();
        return isSameDate(date, today);
    }

    function isPastDate(date: Date | null) {
        if (!date) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    }

    function prevMonth() {
        currentMonth = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() - 1,
            1,
        );
    }

    function nextMonth() {
        currentMonth = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + 1,
            1,
        );
    }

    function selectService(service: ServiceWithSlots) {
        selectedService = service;
        selectedDate = null;
        currentMonth = new Date();
    }

    function selectDate(date: Date) {
        if (isDateAvailable(date) && !isPastDate(date)) {
            selectedDate = date;
        }
    }

    // Mobile navigation
    function selectServiceMobile(service: ServiceWithSlots) {
        selectService(service);
        mobileStep = "calendar";
    }

    function selectDateMobile(date: Date) {
        selectDate(date);
        if (isDateAvailable(date)) {
            mobileStep = "time";
        }
    }

    function resetMobile() {
        mobileStep = "service";
        selectedService = null;
        selectedDate = null;
    }

    async function bookSlot(slot: TimeSlot) {
        if (isBooking || !selectedService) return;
        isBooking = true;

        try {
            const response = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    serviceId: selectedService.id,
                    startTime: slot.startTime,
                }),
            });

            if (response.status === 401) {
                toast.error("Please login to book appointments");
                goto("/login");
                return;
            }

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || "Failed to book appointment");
                return;
            }

            if (showMobileDialog) showMobileDialog = false;
            toast.success("Booking confirmed! Check your dashboard.");
            invalidateAll();
        } catch {
            toast.error("Failed to book appointment. Please try again.");
        } finally {
            isBooking = false;
        }
    }

    function formatTime(date: Date) {
        return new Date(date).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        });
    }

    function formatMonthYear(date: Date) {
        return date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });
    }

    function formatSelectedDate(date: Date) {
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        });
    }

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const calendarDays = $derived(getDaysInMonth(currentMonth));

    // Month navigation limits (current and next month only)
    const today = new Date();
    const canGoPrev = $derived(
        currentMonth.getFullYear() > today.getFullYear() ||
            (currentMonth.getFullYear() === today.getFullYear() &&
                currentMonth.getMonth() > today.getMonth()),
    );
    const canGoNext = $derived(
        currentMonth.getFullYear() < today.getFullYear() ||
            (currentMonth.getFullYear() === today.getFullYear() &&
                currentMonth.getMonth() < today.getMonth() + 1),
    );
</script>

<svelte:head>
    <title>{data?.business?.name ?? "Business"} - Slotly</title>
</svelte:head>

<div class="min-h-screen bg-background">
    <!-- Mobile View -->
    <div class="lg:hidden">
        <div class="p-4">
            <Button href="/" variant="ghost" size="sm" class="mb-4">
                ← Back
            </Button>

            <div class="mb-6">
                <h1 class="text-2xl font-bold">{data.business.name}</h1>
                {#if data.business.description}
                    <p class="text-muted-foreground mt-1">
                        {data.business.description}
                    </p>
                {/if}
            </div>

            <Button
                size="lg"
                class="w-full"
                onclick={() => {
                    showMobileDialog = true;
                    resetMobile();
                }}
            >
                Book Appointment
            </Button>
        </div>

        <Dialog.Root bind:open={showMobileDialog}>
            <Dialog.Content
                class="max-w-md max-h-[90vh] overflow-hidden flex flex-col"
            >
                <Dialog.Header class="pb-4">
                    <Dialog.Title>
                        {#if mobileStep === "service"}
                            Select a Service
                        {:else if mobileStep === "calendar"}
                            Select a Date
                        {:else}
                            Select a Time
                        {/if}
                    </Dialog.Title>
                </Dialog.Header>

                <div class="flex-1 overflow-y-auto">
                    {#if mobileStep === "service"}
                        <div class="space-y-3">
                            {#each data.services as service (service.id)}
                                <button
                                    class="w-full text-left p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all"
                                    onclick={() => selectServiceMobile(service)}
                                >
                                    <div class="font-semibold">
                                        {service.name}
                                    </div>
                                    <div
                                        class="text-sm text-muted-foreground mt-1"
                                    >
                                        30 min
                                        {#if service.price}· ${service.price}{/if}
                                    </div>
                                </button>
                            {/each}
                        </div>
                    {:else if mobileStep === "calendar"}
                        <div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onclick={() => (mobileStep = "service")}
                                class="mb-4"
                            >
                                ← {selectedService?.name}
                            </Button>

                            <div class="rounded-lg border p-4">
                                <div
                                    class="flex items-center justify-between mb-4"
                                >
                                    <button
                                        onclick={prevMonth}
                                        class="p-2 hover:bg-accent rounded-md {!canGoPrev
                                            ? 'opacity-30 cursor-not-allowed'
                                            : ''}"
                                        aria-label="Previous month"
                                        disabled={!canGoPrev}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            class="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fill-rule="evenodd"
                                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                                clip-rule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                    <span class="font-semibold"
                                        >{formatMonthYear(currentMonth)}</span
                                    >
                                    <button
                                        onclick={nextMonth}
                                        class="p-2 hover:bg-accent rounded-md {!canGoNext
                                            ? 'opacity-30 cursor-not-allowed'
                                            : ''}"
                                        aria-label="Next month"
                                        disabled={!canGoNext}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            class="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fill-rule="evenodd"
                                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                clip-rule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </div>

                                <div
                                    class="grid grid-cols-7 gap-1 text-center text-sm"
                                >
                                    {#each weekDays as day (day)}
                                        <div
                                            class="py-2 text-muted-foreground font-medium"
                                        >
                                            {day}
                                        </div>
                                    {/each}
                                    {#each calendarDays as day, i (i)}
                                        {#if day === null}
                                            <div></div>
                                        {:else}
                                            {@const available =
                                                isDateAvailable(day)}
                                            {@const past = isPastDate(day)}
                                            {@const selected = isSameDate(
                                                day,
                                                selectedDate,
                                            )}
                                            {@const today = isToday(day)}
                                            <button
                                                class="aspect-square flex items-center justify-center rounded-full text-sm transition-all
                                                    {selected
                                                    ? 'bg-primary text-primary-foreground'
                                                    : ''}
                                                    {!selected && today
                                                    ? 'border border-primary'
                                                    : ''}
                                                    {!selected &&
                                                available &&
                                                !past
                                                    ? 'hover:bg-accent font-semibold'
                                                    : ''}
                                                    {!available || past
                                                    ? 'text-muted-foreground/40 cursor-not-allowed'
                                                    : 'cursor-pointer'}"
                                                disabled={!available || past}
                                                onclick={() =>
                                                    selectDateMobile(day)}
                                            >
                                                {day.getDate()}
                                            </button>
                                        {/if}
                                    {/each}
                                </div>
                            </div>
                        </div>
                    {:else}
                        <div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onclick={() => (mobileStep = "calendar")}
                                class="mb-4"
                            >
                                ← Change date
                            </Button>

                            {#if selectedDate}
                                <p class="text-sm text-muted-foreground mb-4">
                                    {formatSelectedDate(selectedDate)}
                                </p>
                            {/if}

                            {#if timeSlots.length === 0}
                                <Alert.Root>
                                    <Alert.Description
                                        >No available times for this date.</Alert.Description
                                    >
                                </Alert.Root>
                            {:else}
                                <div class="grid grid-cols-2 gap-2">
                                    {#each timeSlots as slot, i (i)}
                                        <Button
                                            variant={slot.isBooked
                                                ? "secondary"
                                                : "outline"}
                                            class="h-auto py-3 {slot.isBooked
                                                ? 'opacity-50 cursor-not-allowed line-through'
                                                : ''}"
                                            disabled={isBooking ||
                                                slot.isBooked}
                                            onclick={() => bookSlot(slot)}
                                        >
                                            {formatTime(slot.startTime)}
                                            {#if slot.isBooked}
                                                <span class="ml-1 text-xs"
                                                    >(Booked)</span
                                                >
                                            {/if}
                                        </Button>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    {/if}
                </div>
            </Dialog.Content>
        </Dialog.Root>
    </div>

    <!-- Desktop View - Cal.com style -->
    <div class="hidden lg:flex min-h-screen">
        <!-- Left Panel - Business Info & Services -->
        <div class="w-96 border-r bg-muted/30 p-8 flex flex-col">
            <Button href="/" variant="ghost" size="sm" class="w-fit mb-6">
                ← Back to businesses
            </Button>

            <div class="mb-8">
                <h1 class="text-2xl font-bold mb-2">{data.business.name}</h1>
                {#if data.business.description}
                    <p class="text-muted-foreground text-sm">
                        {data.business.description}
                    </p>
                {/if}
                {#if data.business.address}
                    <p class="text-muted-foreground text-sm mt-2">
                        📍 {data.business.address}
                    </p>
                {/if}
            </div>

            <Separator class="mb-6" />

            <div class="flex-1 overflow-y-auto">
                <h3
                    class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4"
                >
                    Services
                </h3>
                <div class="space-y-2">
                    {#each data.services as service (service.id)}
                        {@const isSelected = selectedService?.id === service.id}
                        <button
                            class="w-full text-left p-4 rounded-lg border transition-all
                                {isSelected
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-transparent hover:border-border hover:bg-accent/50'}"
                            onclick={() => selectService(service)}
                        >
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <div class="font-semibold">
                                        {service.name}
                                    </div>
                                    <div
                                        class="text-sm text-muted-foreground mt-1"
                                    >
                                        30 min
                                    </div>
                                </div>
                                {#if service.price}
                                    <Badge variant="secondary"
                                        >${service.price}</Badge
                                    >
                                {/if}
                            </div>
                            {#if service.description}
                                <p
                                    class="text-xs text-muted-foreground mt-2 line-clamp-2"
                                >
                                    {service.description}
                                </p>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>
        </div>

        <!-- Right Panel - Calendar & Time Slots -->
        <div class="flex-1 p-8 overflow-y-auto">
            {#if !selectedService}
                <div
                    class="flex flex-col items-center justify-center h-full text-muted-foreground"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-16 w-16 mb-4 opacity-30"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    <p class="text-lg">
                        Select a service to see available times
                    </p>
                </div>
            {:else}
                <div class="max-w-4xl mx-auto">
                    <div class="mb-6">
                        <h2 class="text-xl font-semibold">
                            {selectedService.name}
                        </h2>
                        <p class="text-muted-foreground">
                            30 min session
                            {#if selectedService.price}
                                · ${selectedService.price}{/if}
                        </p>
                    </div>

                    <div class="grid lg:grid-cols-2 gap-8">
                        <!-- Calendar -->
                        <div class="rounded-xl border bg-card p-6">
                            <div class="flex items-center justify-between mb-6">
                                <button
                                    onclick={prevMonth}
                                    class="p-2 hover:bg-accent rounded-lg transition-colors {!canGoPrev
                                        ? 'opacity-30 cursor-not-allowed'
                                        : ''}"
                                    aria-label="Previous month"
                                    disabled={!canGoPrev}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fill-rule="evenodd"
                                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                            clip-rule="evenodd"
                                        />
                                    </svg>
                                </button>
                                <h3 class="font-semibold text-lg">
                                    {formatMonthYear(currentMonth)}
                                </h3>
                                <button
                                    onclick={nextMonth}
                                    class="p-2 hover:bg-accent rounded-lg transition-colors {!canGoNext
                                        ? 'opacity-30 cursor-not-allowed'
                                        : ''}"
                                    aria-label="Next month"
                                    disabled={!canGoNext}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fill-rule="evenodd"
                                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                            clip-rule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div class="grid grid-cols-7 gap-1">
                                {#each weekDays as day (day)}
                                    <div
                                        class="py-2 text-center text-sm font-medium text-muted-foreground"
                                    >
                                        {day}
                                    </div>
                                {/each}
                                {#each calendarDays as day, i (i)}
                                    {#if day === null}
                                        <div></div>
                                    {:else}
                                        {@const available =
                                            isDateAvailable(day)}
                                        {@const past = isPastDate(day)}
                                        {@const selected = isSameDate(
                                            day,
                                            selectedDate,
                                        )}
                                        {@const today = isToday(day)}
                                        <button
                                            class="aspect-square flex items-center justify-center rounded-full text-sm transition-all
                                                {selected
                                                ? 'bg-primary text-primary-foreground font-semibold'
                                                : ''}
                                                {!selected && today
                                                ? 'ring-2 ring-primary ring-offset-2'
                                                : ''}
                                                {!selected && available && !past
                                                ? 'hover:bg-primary/10 font-medium text-foreground'
                                                : ''}
                                                {!available || past
                                                ? 'text-muted-foreground/30 cursor-not-allowed'
                                                : 'cursor-pointer'}"
                                            disabled={!available || past}
                                            onclick={() => selectDate(day)}
                                        >
                                            {day.getDate()}
                                        </button>
                                    {/if}
                                {/each}
                            </div>
                        </div>

                        <!-- Time Slots -->
                        <div class="rounded-xl border bg-card p-6">
                            {#if !selectedDate}
                                <div
                                    class="flex flex-col items-center justify-center h-full text-muted-foreground py-12"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="h-12 w-12 mb-3 opacity-30"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="1.5"
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <p>Select a date to see available times</p>
                                </div>
                            {:else}
                                <h3 class="font-semibold mb-4">
                                    {formatSelectedDate(selectedDate)}
                                </h3>

                                {#if timeSlots.length === 0}
                                    <Alert.Root>
                                        <Alert.Description
                                            >No available times for this date.</Alert.Description
                                        >
                                    </Alert.Root>
                                {:else}
                                    <div
                                        class="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto"
                                    >
                                        {#each timeSlots as slot, i (i)}
                                            <Button
                                                variant={slot.isBooked
                                                    ? "secondary"
                                                    : "outline"}
                                                class="h-auto py-3 justify-center
                                                    {slot.isBooked
                                                    ? 'opacity-50 cursor-not-allowed line-through'
                                                    : 'hover:bg-primary hover:text-primary-foreground'}
                                                    {isOwner && !slot.isBooked
                                                    ? 'opacity-40 cursor-not-allowed'
                                                    : ''}"
                                                disabled={isOwner ||
                                                    isBooking ||
                                                    slot.isBooked}
                                                onclick={() => bookSlot(slot)}
                                            >
                                                {formatTime(slot.startTime)}
                                                {#if slot.isBooked}
                                                    <span class="ml-1 text-xs"
                                                        >(Booked)</span
                                                    >
                                                {/if}
                                            </Button>
                                        {/each}
                                    </div>

                                    {#if isOwner}
                                        <p
                                            class="text-sm text-muted-foreground mt-4 text-center"
                                        >
                                            You cannot book your own services
                                        </p>
                                    {/if}
                                {/if}
                            {/if}
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
