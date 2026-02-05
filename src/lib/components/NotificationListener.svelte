<script lang="ts">
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { toast } from "svelte-sonner";

    let { user } = $props<{ user: { id: string; email: string } | null }>();

    onMount(() => {
        if (!browser || !user) return;

        const eventSource = new EventSource("/api/notifications/stream");

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type !== "connected") {
                    // Show toast notification
                    toast(data.message, {
                        description: new Date().toLocaleTimeString(),
                    });
                }
            } catch (err) {
                console.error("Failed to parse notification:", err);
            }
        };

        eventSource.onerror = () => {
            console.error("SSE connection error");
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    });
</script>
