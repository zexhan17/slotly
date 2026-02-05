<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Card from "$lib/components/ui/card";
    import Input from "$lib/components/ui/input/input.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import * as Alert from "$lib/components/ui/alert";

    let { data } = $props();
    let searchQuery = $state("");

    const filteredBusinesses = $derived(
        data.businesses.filter(
            (b) =>
                b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (b.description &&
                    b.description
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())),
        ),
    );
</script>

<svelte:head>
    <title>Slotly - Book Appointments</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
    <div class="mb-8 text-center">
        <h1 class="mb-2 text-4xl font-bold">Welcome to Slotly</h1>
        <p class="text-lg text-muted-foreground">
            Book appointments with local businesses
        </p>
    </div>

    <div class="mb-6">
        <Input
            type="search"
            placeholder="Search businesses..."
            bind:value={searchQuery}
            class="max-w-md mx-auto"
        />
    </div>

    {#if filteredBusinesses.length === 0}
        <div class="max-w-md mx-auto">
            <Alert.Root>
                <Alert.Description class="text-center">
                    No businesses found. Try a different search term.
                </Alert.Description>
            </Alert.Root>
        </div>
    {:else}
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {#each filteredBusinesses as business}
                <Card.Root class="hover:shadow-lg transition-shadow">
                    <Card.Header>
                        <Card.Title>{business.name}</Card.Title>
                        {#if business.description}
                            <Card.Description
                                >{business.description}</Card.Description
                            >
                        {/if}
                    </Card.Header>
                    <Card.Content>
                        {#if business.address}
                            <p class="text-sm text-muted-foreground mb-4">
                                📍 {business.address}
                            </p>
                        {/if}
                        <Button href="/business/{business.id}" class="w-full">
                            View Services
                        </Button>
                    </Card.Content>
                </Card.Root>
            {/each}
        </div>
    {/if}
</div>
