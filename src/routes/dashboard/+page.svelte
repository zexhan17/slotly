<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Card from "$lib/components/ui/card";
    import * as Dialog from "$lib/components/ui/dialog";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import * as Alert from "$lib/components/ui/alert";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import { toast } from "svelte-sonner";

    let { data } = $props();

    // Dialog states
    let showNotificationsDialog = $state(false);
    let showCancelBookingDialog = $state(false);
    let cancelBookingForm = $state({ id: "", message: "" });
    let isLoading = $state(false);

    const upcomingBookings = $derived(
        data.bookings
            .filter(
                (b: (typeof data.bookings)[0]) =>
                    b.status === "booked" && new Date(b.startTime) > new Date(),
            )
            .sort(
                (a: (typeof data.bookings)[0], b: (typeof data.bookings)[0]) =>
                    new Date(a.startTime).getTime() -
                    new Date(b.startTime).getTime(),
            ),
    );

    const pastBookings = $derived(
        data.bookings
            .filter(
                (b: (typeof data.bookings)[0]) =>
                    new Date(b.startTime) <= new Date(),
            )
            .sort(
                (a: (typeof data.bookings)[0], b: (typeof data.bookings)[0]) =>
                    new Date(b.startTime).getTime() -
                    new Date(a.startTime).getTime(),
            ),
    );

    // Seller's upcoming bookings (customers who booked their services)
    const upcomingSellerBookings = $derived(
        data.sellerBookings
            .filter(
                (b: (typeof data.sellerBookings)[0]) =>
                    b.status === "booked" && new Date(b.startTime) > new Date(),
            )
            .sort(
                (
                    a: (typeof data.sellerBookings)[0],
                    b: (typeof data.sellerBookings)[0],
                ) =>
                    new Date(a.startTime).getTime() -
                    new Date(b.startTime).getTime(),
            ),
    );

    const pastSellerBookings = $derived(
        data.sellerBookings
            .filter(
                (b: (typeof data.sellerBookings)[0]) =>
                    new Date(b.startTime) <= new Date(),
            )
            .sort(
                (
                    a: (typeof data.sellerBookings)[0],
                    b: (typeof data.sellerBookings)[0],
                ) =>
                    new Date(b.startTime).getTime() -
                    new Date(a.startTime).getTime(),
            ),
    );

    const unreadNotifications = $derived(
        data.notifications.filter(
            (n: (typeof data.notifications)[0]) => !n.isRead,
        ),
    );

    function openCancelBooking(bookingId: string) {
        cancelBookingForm = { id: bookingId, message: "" };
        showCancelBookingDialog = true;
    }

    async function cancelBooking() {
        isLoading = true;
        try {
            const response = await fetch(
                `/api/bookings/${cancelBookingForm.id}/cancel`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: cancelBookingForm.message,
                    }),
                },
            );

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || "Failed to cancel booking");
                return;
            }

            toast.success("Booking cancelled successfully");
            showCancelBookingDialog = false;
            await invalidateAll();
        } catch (err) {
            toast.error("Failed to cancel booking. Please try again.");
        } finally {
            isLoading = false;
        }
    }

    async function markAllNotificationsRead() {
        try {
            const response = await fetch("/api/notifications", {
                method: "PUT",
            });

            if (!response.ok) {
                toast.error("Failed to mark notifications as read");
                return;
            }

            toast.success("All notifications marked as read");
            await invalidateAll();
        } catch (err) {
            toast.error("Failed to mark notifications as read");
        }
    }

    async function markNotificationRead(notificationId: string) {
        try {
            await fetch(`/api/notifications/${notificationId}`, {
                method: "PUT",
            });
            await invalidateAll();
        } catch (err) {
            // Silently fail
        }
    }

    function formatDateTime(date: Date) {
        return new Date(date).toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    }

    function formatNotificationTime(date: Date) {
        const now = new Date();
        const notifDate = new Date(date);
        const diffMs = now.getTime() - notifDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return notifDate.toLocaleDateString();
    }

    function getStatusVariant(
        status: string,
    ): "default" | "secondary" | "destructive" | "outline" {
        switch (status) {
            case "booked":
                return "default";
            case "cancelled":
                return "destructive";
            case "completed":
                return "secondary";
            default:
                return "outline";
        }
    }

    function getNotificationIcon(type: string) {
        switch (type) {
            case "booking_created":
                return "📅";
            case "cancelled":
                return "❌";
            case "reminder":
                return "⏰";
            default:
                return "📬";
        }
    }
</script>

<svelte:head>
    <title>Dashboard - Slotly</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
    <div class="mb-8">
        <h1 class="text-4xl font-bold mb-2">Dashboard</h1>
        <p class="text-muted-foreground">Welcome back, {data.user.email}</p>
    </div>

    {#if unreadNotifications.length > 0}
        <Alert.Root
            class="mb-6 cursor-pointer"
            onclick={() => (showNotificationsDialog = true)}
        >
            <Alert.Title
                >📬 You have {unreadNotifications.length} new notification{unreadNotifications.length !==
                1
                    ? "s"
                    : ""}</Alert.Title
            >
            <Alert.Description
                >Click to view your notifications</Alert.Description
            >
        </Alert.Root>
    {/if}

    <div class="grid gap-6 md:grid-cols-2 mb-8">
        <Card.Root>
            <Card.Header>
                <Card.Title>Quick Stats</Card.Title>
            </Card.Header>
            <Card.Content>
                <div class="grid grid-cols-3 gap-4">
                    <div>
                        <p class="text-2xl font-bold">
                            {upcomingBookings.length}
                        </p>
                        <p class="text-sm text-muted-foreground">My Bookings</p>
                    </div>
                    <div>
                        <p class="text-2xl font-bold">
                            {data.businesses.length}
                        </p>
                        <p class="text-sm text-muted-foreground">
                            My Businesses
                        </p>
                    </div>
                    {#if data.businesses.length > 0}
                        <div>
                            <p class="text-2xl font-bold">
                                {upcomingSellerBookings.length}
                            </p>
                            <p class="text-sm text-muted-foreground">
                                Customer Bookings
                            </p>
                        </div>
                    {/if}
                </div>
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Header>
                <Card.Title>Quick Actions</Card.Title>
            </Card.Header>
            <Card.Content class="space-y-2">
                <Button href="/" variant="outline" class="w-full"
                    >Browse Businesses</Button
                >
                <Button href="/dashboard/businesses/create" class="w-full"
                    >Create New Business</Button
                >
            </Card.Content>
        </Card.Root>
    </div>

    <Separator class="my-8" />

    <!-- My Bookings -->
    <section class="mb-8">
        <h2 class="text-2xl font-semibold mb-4">My Bookings</h2>

        <h3 class="text-lg font-medium mb-3">Upcoming</h3>
        {#if upcomingBookings.length === 0}
            <Alert.Root class="mb-6">
                <Alert.Description>
                    No upcoming bookings.
                    <Button href="/" variant="link" class="px-1 h-auto">
                        Browse businesses
                    </Button>
                    to book.
                </Alert.Description>
            </Alert.Root>
        {:else}
            <div class="grid gap-4 mb-6">
                {#each upcomingBookings as booking}
                    <Card.Root>
                        <Card.Header>
                            <div class="flex justify-between items-start">
                                <div>
                                    <Card.Title class="text-lg"
                                        >{booking.businessName}</Card.Title
                                    >
                                    <Card.Description
                                        >{booking.serviceName}</Card.Description
                                    >
                                </div>
                                <Badge
                                    variant={getStatusVariant(booking.status)}
                                    >{booking.status}</Badge
                                >
                            </div>
                        </Card.Header>
                        <Card.Content>
                            <p class="text-sm mb-2">
                                📅 {formatDateTime(booking.startTime)}
                            </p>
                            {#if booking.businessAddress}
                                <p class="text-sm text-muted-foreground mb-4">
                                    📍 {booking.businessAddress}
                                </p>
                            {/if}
                            {#if booking.status === "booked"}
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onclick={() =>
                                        openCancelBooking(booking.id)}
                                >
                                    Cancel Booking
                                </Button>
                            {/if}
                        </Card.Content>
                    </Card.Root>
                {/each}
            </div>
        {/if}

        {#if pastBookings.length > 0}
            <h3 class="text-lg font-medium mb-3">Past Bookings</h3>
            <div class="grid gap-4">
                {#each pastBookings.slice(0, 5) as booking}
                    <Card.Root class="opacity-75">
                        <Card.Header>
                            <div class="flex justify-between items-start">
                                <div>
                                    <Card.Title class="text-lg"
                                        >{booking.businessName}</Card.Title
                                    >
                                    <Card.Description
                                        >{booking.serviceName}</Card.Description
                                    >
                                </div>
                                <Badge
                                    variant={getStatusVariant(booking.status)}
                                    >{booking.status}</Badge
                                >
                            </div>
                        </Card.Header>
                        <Card.Content>
                            <p class="text-sm">
                                📅 {formatDateTime(booking.startTime)}
                            </p>
                        </Card.Content>
                    </Card.Root>
                {/each}
            </div>
        {/if}
    </section>

    {#if data.businesses.length > 0}
        <Separator class="my-8" />

        <!-- Customer Bookings (for sellers) -->
        <section class="mb-8">
            <h2 class="text-2xl font-semibold mb-4">Customer Bookings</h2>
            <p class="text-muted-foreground mb-4">
                Bookings made by customers to your services
            </p>

            <h3 class="text-lg font-medium mb-3">Upcoming</h3>
            {#if upcomingSellerBookings.length === 0}
                <Alert.Root class="mb-6">
                    <Alert.Description>
                        No upcoming customer bookings. Share your business page
                        to get bookings!
                    </Alert.Description>
                </Alert.Root>
            {:else}
                <div class="grid gap-4 mb-6">
                    {#each upcomingSellerBookings as booking}
                        <Card.Root>
                            <Card.Header>
                                <div class="flex justify-between items-start">
                                    <div>
                                        <Card.Title class="text-lg"
                                            >{booking.serviceName}</Card.Title
                                        >
                                        <Card.Description
                                            >{booking.businessName}</Card.Description
                                        >
                                    </div>
                                    <Badge
                                        variant={getStatusVariant(
                                            booking.status,
                                        )}>{booking.status}</Badge
                                    >
                                </div>
                            </Card.Header>
                            <Card.Content>
                                <p class="text-sm mb-2">
                                    📅 {formatDateTime(booking.startTime)}
                                </p>
                                <p class="text-sm text-muted-foreground">
                                    👤 {booking.customerEmail}
                                </p>
                            </Card.Content>
                        </Card.Root>
                    {/each}
                </div>
            {/if}

            {#if pastSellerBookings.length > 0}
                <h3 class="text-lg font-medium mb-3">Past Customer Bookings</h3>
                <div class="grid gap-4">
                    {#each pastSellerBookings.slice(0, 5) as booking}
                        <Card.Root class="opacity-75">
                            <Card.Header>
                                <div class="flex justify-between items-start">
                                    <div>
                                        <Card.Title class="text-lg"
                                            >{booking.serviceName}</Card.Title
                                        >
                                        <Card.Description
                                            >{booking.businessName}</Card.Description
                                        >
                                    </div>
                                    <Badge
                                        variant={getStatusVariant(
                                            booking.status,
                                        )}>{booking.status}</Badge
                                    >
                                </div>
                            </Card.Header>
                            <Card.Content>
                                <p class="text-sm mb-1">
                                    📅 {formatDateTime(booking.startTime)}
                                </p>
                                <p class="text-sm text-muted-foreground">
                                    👤 {booking.customerEmail}
                                </p>
                            </Card.Content>
                        </Card.Root>
                    {/each}
                </div>
            {/if}
        </section>
    {/if}

    <Separator class="my-8" />

    <!-- My Businesses -->
    <section>
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-semibold">My Businesses</h2>
            <Button href="/dashboard/businesses/create">Create Business</Button>
        </div>

        {#if data.businesses.length === 0}
            <Alert.Root>
                <Alert.Description>
                    You haven't created any businesses yet. Create one to start
                    accepting bookings!
                </Alert.Description>
            </Alert.Root>
        {:else}
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {#each data.businesses as business}
                    <Card.Root>
                        <Card.Header>
                            <Card.Title>{business.name}</Card.Title>
                            {#if business.description}
                                <Card.Description
                                    >{business.description}</Card.Description
                                >
                            {/if}
                        </Card.Header>
                        <Card.Content>
                            <Button
                                href="/dashboard/businesses/{business.id}"
                                class="w-full"
                            >
                                Manage
                            </Button>
                        </Card.Content>
                    </Card.Root>
                {/each}
            </div>
        {/if}
    </section>
</div>

<!-- Notifications Dialog -->
<Dialog.Root bind:open={showNotificationsDialog}>
    <Dialog.Content class="max-w-lg max-h-[80vh] overflow-y-auto">
        <Dialog.Header>
            <Dialog.Title>Notifications</Dialog.Title>
            <Dialog.Description>Your recent notifications</Dialog.Description>
        </Dialog.Header>
        <div class="py-4">
            {#if data.notifications.length === 0}
                <p class="text-center text-muted-foreground py-8">
                    No notifications yet
                </p>
            {:else}
                <div class="space-y-3">
                    {#each data.notifications as notification}
                        <button
                            type="button"
                            class="w-full text-left p-3 rounded-lg border {notification.isRead
                                ? 'bg-muted/30'
                                : 'bg-primary/5 border-primary/20'}"
                            onclick={() =>
                                !notification.isRead &&
                                markNotificationRead(notification.id)}
                        >
                            <div class="flex justify-between items-start gap-2">
                                <div class="flex-1">
                                    <p
                                        class="text-sm {notification.isRead
                                            ? 'text-muted-foreground'
                                            : ''}"
                                    >
                                        {getNotificationIcon(notification.type)}
                                        {notification.message}
                                    </p>
                                    <p
                                        class="text-xs text-muted-foreground mt-1"
                                    >
                                        {formatNotificationTime(
                                            notification.createdAt,
                                        )}
                                    </p>
                                </div>
                                {#if !notification.isRead}
                                    <Badge variant="default" class="text-xs"
                                        >New</Badge
                                    >
                                {/if}
                            </div>
                        </button>
                    {/each}
                </div>
            {/if}
        </div>
        <Dialog.Footer>
            {#if unreadNotifications.length > 0}
                <Button variant="outline" onclick={markAllNotificationsRead}>
                    Mark All as Read
                </Button>
            {/if}
            <Button onclick={() => (showNotificationsDialog = false)}
                >Close</Button
            >
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<!-- Cancel Booking Dialog -->
<Dialog.Root bind:open={showCancelBookingDialog}>
    <Dialog.Content class="max-w-md">
        <Dialog.Header>
            <Dialog.Title>Cancel Booking</Dialog.Title>
            <Dialog.Description>
                Are you sure you want to cancel this booking? You can optionally
                provide a reason.
            </Dialog.Description>
        </Dialog.Header>
        <div class="space-y-4 py-4">
            <div class="space-y-2">
                <Label for="cancel-reason">Cancellation Reason (optional)</Label
                >
                <Textarea
                    id="cancel-reason"
                    bind:value={cancelBookingForm.message}
                    placeholder="e.g. Schedule conflict..."
                />
            </div>
        </div>
        <Dialog.Footer>
            <Button
                variant="outline"
                onclick={() => (showCancelBookingDialog = false)}
                >Keep Booking</Button
            >
            <Button
                variant="destructive"
                onclick={cancelBooking}
                disabled={isLoading}
            >
                {isLoading ? "Cancelling..." : "Cancel Booking"}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
