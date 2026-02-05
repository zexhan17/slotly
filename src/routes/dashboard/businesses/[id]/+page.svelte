<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Card from "$lib/components/ui/card";
    import * as Dialog from "$lib/components/ui/dialog";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import * as Alert from "$lib/components/ui/alert";
    import Input from "$lib/components/ui/input/input.svelte";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import { toast } from "svelte-sonner";

    let { data } = $props();

    // Edit dialogs state
    let showEditBusinessDialog = $state(false);
    let showEditServiceDialog = $state(false);
    let showCancelBookingDialog = $state(false);
    let showDeleteBusinessDialog = $state(false);
    let showDeleteServiceDialog = $state(false);

    // Form state
    let editBusinessForm = $state({
        name: "",
        description: "",
        address: "",
    });

    $effect(() => {
        if (showEditBusinessDialog) {
            editBusinessForm = {
                name: data.business.name,
                description: data.business.description || "",
                address: data.business.address || "",
            };
        }
    });

    let editServiceForm = $state({
        id: "",
        name: "",
        description: "",
        price: "",
    });

    let cancelBookingForm = $state({
        id: "",
        message: "",
    });

    let deleteServiceId = $state("");
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

    // Check if availability is set
    const hasAvailability = $derived(
        data.availability && data.availability.some((a: any) => a.isEnabled),
    );

    function formatDateTime(date: Date) {
        return new Date(date).toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
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

    // Business CRUD
    async function updateBusiness() {
        isLoading = true;
        try {
            const response = await fetch(
                `/api/businesses/${data.business.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editBusinessForm),
                },
            );

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || "Failed to update business");
                return;
            }

            toast.success("Business updated successfully");
            showEditBusinessDialog = false;
            await invalidateAll();
        } catch (err) {
            toast.error("Failed to update business");
        } finally {
            isLoading = false;
        }
    }

    async function deleteBusiness() {
        isLoading = true;
        try {
            const response = await fetch(
                `/api/businesses/${data.business.id}`,
                {
                    method: "DELETE",
                },
            );

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || "Failed to delete business");
                return;
            }

            toast.success("Business deleted successfully");
            goto("/dashboard");
        } catch (err) {
            toast.error("Failed to delete business");
        } finally {
            isLoading = false;
        }
    }

    // Service CRUD
    function openEditService(service: (typeof data.services)[0]) {
        editServiceForm = {
            id: service.id,
            name: service.name,
            description: service.description || "",
            price: service.price || "",
        };
        showEditServiceDialog = true;
    }

    async function updateService() {
        isLoading = true;
        try {
            const response = await fetch(
                `/api/services/${editServiceForm.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: editServiceForm.name,
                        description: editServiceForm.description,
                        price: editServiceForm.price,
                    }),
                },
            );

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || "Failed to update service");
                return;
            }

            toast.success("Service updated successfully");
            showEditServiceDialog = false;
            await invalidateAll();
        } catch (err) {
            toast.error("Failed to update service");
        } finally {
            isLoading = false;
        }
    }

    function openDeleteService(serviceId: string) {
        deleteServiceId = serviceId;
        showDeleteServiceDialog = true;
    }

    async function deleteService() {
        isLoading = true;
        try {
            const response = await fetch(`/api/services/${deleteServiceId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || "Failed to delete service");
                return;
            }

            toast.success("Service deleted successfully");
            showDeleteServiceDialog = false;
            await invalidateAll();
        } catch (err) {
            toast.error("Failed to delete service");
        } finally {
            isLoading = false;
        }
    }

    // Booking management
    function openCancelBooking(booking: (typeof data.bookings)[0]) {
        cancelBookingForm = {
            id: booking.id,
            message: "",
        };
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
            toast.error("Failed to cancel booking");
        } finally {
            isLoading = false;
        }
    }
</script>

<svelte:head>
    <title>{data.business.name} - Dashboard</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
    <Button href="/dashboard" variant="link" size="sm" class="px-0 mb-4">
        ← Back to dashboard
    </Button>

    <div class="flex justify-between items-start mb-8">
        <div>
            <h1 class="text-4xl font-bold mb-2">{data.business.name}</h1>
            {#if data.business.description}
                <p class="text-muted-foreground">{data.business.description}</p>
            {/if}
            {#if data.business.address}
                <p class="text-sm text-muted-foreground mt-1">
                    📍 {data.business.address}
                </p>
            {/if}
        </div>
        <div class="flex gap-2">
            <Button
                variant="outline"
                onclick={() => (showEditBusinessDialog = true)}
            >
                Edit Business
            </Button>
            <Button
                variant="destructive"
                onclick={() => (showDeleteBusinessDialog = true)}
            >
                Delete
            </Button>
        </div>
    </div>

    <!-- Availability Warning -->
    {#if !hasAvailability}
        <Alert.Root
            class="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
        >
            <Alert.Title>⚠️ Availability Not Set</Alert.Title>
            <Alert.Description>
                Your business doesn't have availability configured. Customers
                won't be able to book appointments until you set your available
                hours.
                <Button
                    href="/dashboard/businesses/{data.business.id}/availability"
                    variant="link"
                    class="px-1 h-auto"
                >
                    Set Availability Now
                </Button>
            </Alert.Description>
        </Alert.Root>
    {/if}

    <!-- Stats -->
    <div class="grid gap-4 md:grid-cols-3 mb-8">
        <Card.Root>
            <Card.Header>
                <Card.Title class="text-sm">Services</Card.Title>
            </Card.Header>
            <Card.Content>
                <p class="text-3xl font-bold">{data.services.length}</p>
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Header>
                <Card.Title class="text-sm">Upcoming Bookings</Card.Title>
            </Card.Header>
            <Card.Content>
                <p class="text-3xl font-bold">{upcomingBookings.length}</p>
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Header>
                <Card.Title class="text-sm">Total Bookings</Card.Title>
            </Card.Header>
            <Card.Content>
                <p class="text-3xl font-bold">{data.bookings.length}</p>
            </Card.Content>
        </Card.Root>
    </div>

    <!-- Quick Actions -->
    <div class="flex gap-2 mb-8 flex-wrap">
        <Button href="/dashboard/businesses/{data.business.id}/services/create">
            Add Service
        </Button>
        <Button
            href="/dashboard/businesses/{data.business.id}/availability"
            variant="outline"
        >
            Set Availability
        </Button>
        <Button href="/business/{data.business.id}" variant="outline">
            View Public Page
        </Button>
    </div>

    <Separator class="my-8" />

    <!-- Services -->
    <section class="mb-8">
        <h2 class="text-2xl font-semibold mb-4">Services</h2>
        {#if data.services.length === 0}
            <Alert.Root>
                <Alert.Description>
                    No services yet.
                    <Button
                        href="/dashboard/businesses/{data.business
                            .id}/services/create"
                        variant="link"
                        class="px-1 h-auto"
                    >
                        Create one
                    </Button>
                    to get started.
                </Alert.Description>
            </Alert.Root>
        {:else}
            <div class="grid gap-4 md:grid-cols-2">
                {#each data.services as service}
                    <Card.Root>
                        <Card.Header>
                            <div class="flex justify-between items-start">
                                <div>
                                    <Card.Title>{service.name}</Card.Title>
                                    {#if service.description}
                                        <Card.Description
                                            >{service.description}</Card.Description
                                        >
                                    {/if}
                                </div>
                                <Badge variant="outline">30 min</Badge>
                            </div>
                        </Card.Header>
                        <Card.Content>
                            <div class="flex justify-between items-center">
                                <div>
                                    {#if service.price}
                                        <p class="text-sm font-semibold mb-2">
                                            ${service.price}
                                        </p>
                                    {/if}
                                    <Badge
                                        variant={service.isActive
                                            ? "default"
                                            : "secondary"}
                                    >
                                        {service.isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </Badge>
                                </div>
                                <div class="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onclick={() => openEditService(service)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onclick={() =>
                                            openDeleteService(service.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </Card.Content>
                    </Card.Root>
                {/each}
            </div>
        {/if}
    </section>

    <Separator class="my-8" />

    <!-- Recent Bookings -->
    <section>
        <h2 class="text-2xl font-semibold mb-4">Recent Bookings</h2>
        {#if data.bookings.length === 0}
            <Alert.Root>
                <Alert.Description>No bookings yet.</Alert.Description>
            </Alert.Root>
        {:else}
            <div class="space-y-4">
                {#each data.bookings as booking}
                    <Card.Root>
                        <Card.Header>
                            <div class="flex justify-between items-start">
                                <div>
                                    <Card.Title class="text-lg"
                                        >{booking.serviceName}</Card.Title
                                    >
                                    <Card.Description
                                        >{booking.userEmail}</Card.Description
                                    >
                                </div>
                                <Badge
                                    variant={getStatusVariant(booking.status)}
                                    >{booking.status}</Badge
                                >
                            </div>
                        </Card.Header>
                        <Card.Content>
                            <div class="flex justify-between items-center">
                                <p class="text-sm">
                                    📅 {formatDateTime(booking.startTime)}
                                </p>
                                {#if booking.status === "booked"}
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onclick={() =>
                                            openCancelBooking(booking)}
                                    >
                                        Cancel Booking
                                    </Button>
                                {/if}
                            </div>
                        </Card.Content>
                    </Card.Root>
                {/each}
            </div>
        {/if}
    </section>
</div>

<!-- Edit Business Dialog -->
<Dialog.Root bind:open={showEditBusinessDialog}>
    <Dialog.Content class="max-w-md">
        <Dialog.Header>
            <Dialog.Title>Edit Business</Dialog.Title>
            <Dialog.Description
                >Update your business information</Dialog.Description
            >
        </Dialog.Header>
        <div class="space-y-4 py-4">
            <div class="space-y-2">
                <Label for="business-name">Name</Label>
                <Input id="business-name" bind:value={editBusinessForm.name} />
            </div>
            <div class="space-y-2">
                <Label for="business-description">Description</Label>
                <Textarea
                    id="business-description"
                    bind:value={editBusinessForm.description}
                />
            </div>
            <div class="space-y-2">
                <Label for="business-address">Address</Label>
                <Input
                    id="business-address"
                    bind:value={editBusinessForm.address}
                />
            </div>
        </div>
        <Dialog.Footer>
            <Button
                variant="outline"
                onclick={() => (showEditBusinessDialog = false)}>Cancel</Button
            >
            <Button onclick={updateBusiness} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<!-- Delete Business Dialog -->
<Dialog.Root bind:open={showDeleteBusinessDialog}>
    <Dialog.Content class="max-w-md">
        <Dialog.Header>
            <Dialog.Title>Delete Business</Dialog.Title>
            <Dialog.Description>
                Are you sure you want to delete this business? This will also
                delete all services and bookings. This action cannot be undone.
            </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
            <Button
                variant="outline"
                onclick={() => (showDeleteBusinessDialog = false)}
                >Cancel</Button
            >
            <Button
                variant="destructive"
                onclick={deleteBusiness}
                disabled={isLoading}
            >
                {isLoading ? "Deleting..." : "Delete Business"}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<!-- Edit Service Dialog -->
<Dialog.Root bind:open={showEditServiceDialog}>
    <Dialog.Content class="max-w-md">
        <Dialog.Header>
            <Dialog.Title>Edit Service</Dialog.Title>
            <Dialog.Description>Update service details</Dialog.Description>
        </Dialog.Header>
        <div class="space-y-4 py-4">
            <div class="space-y-2">
                <Label for="service-name">Name</Label>
                <Input id="service-name" bind:value={editServiceForm.name} />
            </div>
            <div class="space-y-2">
                <Label for="service-description">Description</Label>
                <Textarea
                    id="service-description"
                    bind:value={editServiceForm.description}
                />
            </div>
            <div class="space-y-2">
                <Label for="service-price">Price</Label>
                <Input
                    id="service-price"
                    bind:value={editServiceForm.price}
                    placeholder="e.g. 50.00"
                />
            </div>
        </div>
        <Dialog.Footer>
            <Button
                variant="outline"
                onclick={() => (showEditServiceDialog = false)}>Cancel</Button
            >
            <Button onclick={updateService} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<!-- Delete Service Dialog -->
<Dialog.Root bind:open={showDeleteServiceDialog}>
    <Dialog.Content class="max-w-md">
        <Dialog.Header>
            <Dialog.Title>Delete Service</Dialog.Title>
            <Dialog.Description>
                Are you sure you want to delete this service? This will also
                delete all associated bookings. This action cannot be undone.
            </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
            <Button
                variant="outline"
                onclick={() => (showDeleteServiceDialog = false)}>Cancel</Button
            >
            <Button
                variant="destructive"
                onclick={deleteService}
                disabled={isLoading}
            >
                {isLoading ? "Deleting..." : "Delete Service"}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<!-- Cancel Booking Dialog -->
<Dialog.Root bind:open={showCancelBookingDialog}>
    <Dialog.Content class="max-w-md">
        <Dialog.Header>
            <Dialog.Title>Cancel Booking</Dialog.Title>
            <Dialog.Description>
                The customer will be notified of the cancellation. You can
                optionally provide a reason.
            </Dialog.Description>
        </Dialog.Header>
        <div class="space-y-4 py-4">
            <div class="space-y-2">
                <Label for="cancel-message"
                    >Cancellation Reason (optional)</Label
                >
                <Textarea
                    id="cancel-message"
                    bind:value={cancelBookingForm.message}
                    placeholder="e.g. Unexpected closure, Staff unavailable..."
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
