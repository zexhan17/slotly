<script lang="ts">
    import { enhance } from "$app/forms";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import * as Card from "$lib/components/ui/card";
    import * as Alert from "$lib/components/ui/alert";

    let { form } = $props();
</script>

<svelte:head>
    <title>Create Business - Slotly</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-2xl">
    <Button href="/dashboard" variant="link" size="sm" class="px-0 mb-4">
        ← Back to dashboard
    </Button>

    <h1 class="text-4xl font-bold mb-8">Create Business</h1>

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
                        <Label for="name">Business Name *</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="My Awesome Business"
                            required
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Tell customers about your business..."
                            rows={4}
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="address">Address</Label>
                        <Input
                            id="address"
                            name="address"
                            placeholder="123 Main St, City, State 12345"
                        />
                    </div>

                    <div class="flex gap-2 pt-4">
                        <Button type="submit" class="flex-1"
                            >Create Business</Button
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
