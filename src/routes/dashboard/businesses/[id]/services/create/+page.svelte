<script lang="ts">
    import { enhance } from "$app/forms";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import * as Card from "$lib/components/ui/card";
    import * as Alert from "$lib/components/ui/alert";

    let { data, form } = $props();
</script>

<svelte:head>
    <title>Create Service - {data.business.name}</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-2xl">
    <Button
        href="/dashboard/businesses/{data.business.id}"
        variant="link"
        size="sm"
        class="px-0 mb-4"
    >
        ← Back to {data.business.name}
    </Button>

    <h1 class="text-4xl font-bold mb-2">Create Service</h1>
    <p class="text-muted-foreground mb-8">for {data.business.name}</p>

    <Card.Root>
        <Card.Content class="pt-6">
            {#if form?.message}
                <Alert.Root variant="destructive" class="mb-4">
                    <Alert.Description>{form.message}</Alert.Description>
                </Alert.Root>
            {/if}

            <form method="POST" use:enhance>
                <div class="space-y-4">
                    <div class="space-y-2">
                        <Label for="name">Service Name *</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Haircut"
                            required
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Describe this service..."
                            rows={3}
                        />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <Label for="durationMinutes"
                                >Duration (minutes) *</Label
                            >
                            <Input
                                id="durationMinutes"
                                name="durationMinutes"
                                type="number"
                                placeholder="30"
                                min="1"
                                required
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="price">Price (optional)</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                placeholder="25.00"
                            />
                        </div>
                    </div>

                    <div class="flex gap-2 pt-4">
                        <Button type="submit" class="flex-1"
                            >Create Service</Button
                        >
                        <Button
                            type="button"
                            variant="outline"
                            onclick={() => history.back()}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </form>
        </Card.Content>
    </Card.Root>
</div>
