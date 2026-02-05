<script lang="ts">
    import { enhance } from "$app/forms";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Card from "$lib/components/ui/card";
    import Label from "$lib/components/ui/label/label.svelte";
    import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
</script>

<svelte:head>
    <title>Login - Slotly</title>
</svelte:head>

<div
    class="container mx-auto flex items-center justify-center px-4 mt-16 md:mt-28"
>
    <Card.Root class="w-full max-w-md">
        <Card.Header>
            <Card.Title class="text-2xl">Welcome Back - Demo Login</Card.Title>
            <Card.Description>
                Please select your role to log in as a seller or customer.
            </Card.Description>
        </Card.Header>

        <Card.Content class="flex justify-between items-center">
            <form method="POST" use:enhance class="w-full space-y-6">
                <div class="flex flex-col sm:flex-row gap-2 justify-between">
                    <Label>Login As</Label>

                    <RadioGroup.Root
                        class="flex gap-2"
                        value="seller"
                        name="role"
                    >
                        <div class="flex items-center space-x-2">
                            <RadioGroup.Item value="seller" id="r1" />
                            <Label for="r1">Seller</Label>
                        </div>
                        <div class="flex items-center space-x-2">
                            <RadioGroup.Item value="customer" id="r2" />
                            <Label for="r2">Customer</Label>
                        </div>
                    </RadioGroup.Root>
                </div>

                <Button type="submit" class="w-full">Login</Button>
            </form>
        </Card.Content>
    </Card.Root>
</div>
