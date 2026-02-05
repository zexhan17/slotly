<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Card from "$lib/components/ui/card";
    import Switch from "$lib/components/ui/switch/switch.svelte";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import { toast } from "svelte-sonner";

    let { data } = $props();

    // Generate time options for select (30 min intervals)
    const timeOptions = $derived.by(() => {
        const options: string[] = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let min = 0; min < 60; min += 30) {
                const h = hour.toString().padStart(2, "0");
                const m = min.toString().padStart(2, "0");
                options.push(`${h}:${m}`);
            }
        }
        return options;
    });

    // Format time for display (e.g., "09:00" -> "9:00 AM")
    function formatTimeDisplay(time: string): string {
        const [hourStr, minStr] = time.split(":");
        const hour = parseInt(hourStr);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${hour12}:${minStr} ${ampm}`;
    }

    // Local state for the schedule
    let schedule = $state<
        Array<{
            dayOfWeek: number;
            dayName: string;
            isEnabled: boolean;
            startTime: string;
            endTime: string;
        }>
    >([]);

    // Keep track of original values for change detection
    let originalSchedule = $state<
        Array<{
            dayOfWeek: number;
            dayName: string;
            isEnabled: boolean;
            startTime: string;
            endTime: string;
        }>
    >([]);

    // Initialize schedule from data only when data actually changes from server
    $effect(() => {
        const newData = data.availability.map(
            (day: (typeof data.availability)[0]) => ({
                dayOfWeek: day.dayOfWeek,
                dayName: day.dayName,
                isEnabled: day.isEnabled,
                startTime: day.startTime,
                endTime: day.endTime,
            }),
        );
        schedule = newData;
        originalSchedule = newData.map((d: (typeof newData)[0]) => ({ ...d }));
    });

    // Track if there are unsaved changes
    let hasChanges = $derived.by(() => {
        if (schedule.length === 0 || originalSchedule.length === 0)
            return false;
        return schedule.some((day, index) => {
            const original = originalSchedule[index];
            if (!original) return false;
            return (
                day.isEnabled !== original.isEnabled ||
                day.startTime !== original.startTime ||
                day.endTime !== original.endTime
            );
        });
    });

    let isSaving = $state(false);

    async function saveSchedule() {
        isSaving = true;
        try {
            const response = await fetch(
                `/api/businesses/${data.business.id}/availability`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ schedule }),
                },
            );

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || "Failed to save availability");
                return;
            }

            toast.success("Availability saved successfully");
            await invalidateAll();
        } catch {
            toast.error("Failed to save availability");
        } finally {
            isSaving = false;
        }
    }

    function copyToAllEnabled(sourceIndex: number) {
        const source = schedule[sourceIndex];
        schedule = schedule.map((day, index) => {
            if (index === sourceIndex || !day.isEnabled) return day;
            return {
                ...day,
                startTime: source.startTime,
                endTime: source.endTime,
            };
        });
        toast.success("Copied times to all enabled days");
    }
</script>

<svelte:head>
    <title>Availability - {data.business.name}</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-3xl">
    <Button
        href="/dashboard/businesses/{data.business.id}"
        variant="link"
        size="sm"
        class="px-0 mb-4"
    >
        ← Back to {data.business.name}
    </Button>

    <div class="flex justify-between items-start mb-8">
        <div>
            <h1 class="text-3xl font-bold mb-2">Availability</h1>
            <p class="text-muted-foreground">
                Set your weekly hours when customers can book appointments
            </p>
        </div>
    </div>

    <Card.Root>
        <Card.Header>
            <Card.Title>Weekly Hours</Card.Title>
            <Card.Description>
                Configure which days you're available and your working hours for
                each day
            </Card.Description>
        </Card.Header>
        <Card.Content class="space-y-0">
            {#each schedule as day, index (day.dayOfWeek)}
                <div
                    class="flex items-center gap-4 py-4 {index !== 0
                        ? 'border-t'
                        : ''}"
                >
                    <!-- Day toggle -->
                    <div class="flex items-center gap-3 w-32">
                        <Switch bind:checked={day.isEnabled} />
                        <span
                            class="font-medium text-sm {day.isEnabled
                                ? ''
                                : 'text-muted-foreground'}"
                        >
                            {day.dayName.slice(0, 3)}
                        </span>
                    </div>

                    {#if day.isEnabled}
                        <!-- Time selectors -->
                        <div class="flex items-center gap-2 flex-1">
                            <div class="relative">
                                <select
                                    bind:value={day.startTime}
                                    class="h-9 w-30 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring appearance-none cursor-pointer"
                                >
                                    {#each timeOptions as time (time)}
                                        <option value={time}
                                            >{formatTimeDisplay(time)}</option
                                        >
                                    {/each}
                                </select>
                                <svg
                                    class="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>

                            <span class="text-muted-foreground">-</span>

                            <div class="relative">
                                <select
                                    bind:value={day.endTime}
                                    class="h-9 w-30 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring appearance-none cursor-pointer"
                                >
                                    {#each timeOptions as time (time)}
                                        <option value={time}
                                            >{formatTimeDisplay(time)}</option
                                        >
                                    {/each}
                                </select>
                                <svg
                                    class="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </div>

                        <!-- Copy button -->
                        <Button
                            variant="ghost"
                            size="sm"
                            onclick={() => copyToAllEnabled(index)}
                            title="Copy to all enabled days"
                            class="text-muted-foreground hover:text-foreground"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <rect
                                    width="14"
                                    height="14"
                                    x="8"
                                    y="8"
                                    rx="2"
                                    ry="2"
                                />
                                <path
                                    d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
                                />
                            </svg>
                        </Button>
                    {:else}
                        <div class="flex-1">
                            <span class="text-sm text-muted-foreground"
                                >Unavailable</span
                            >
                        </div>
                    {/if}
                </div>
            {/each}
        </Card.Content>
    </Card.Root>

    <!-- Save button (sticky footer) -->
    {#if hasChanges}
        <div
            class="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg"
        >
            <div class="container mx-auto max-w-3xl flex justify-end gap-3">
                <Button
                    variant="outline"
                    onclick={() => {
                        schedule = originalSchedule.map((day) => ({ ...day }));
                    }}
                >
                    Discard
                </Button>
                <Button onclick={saveSchedule} disabled={isSaving}>
                    {#if isSaving}
                        Saving...
                    {:else}
                        Save Changes
                    {/if}
                </Button>
            </div>
        </div>
    {/if}

    <!-- Spacer for sticky footer -->
    {#if hasChanges}
        <div class="h-20"></div>
    {/if}
</div>
