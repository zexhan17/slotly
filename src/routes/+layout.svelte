<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import { ModeWatcher } from "mode-watcher";
	import ThemeToggle from "$lib/custom/ThemeToggle.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import NotificationListener from "$lib/components/NotificationListener.svelte";
	import { Toaster } from "$lib/components/ui/sonner";
	import * as Menubar from "$lib/components/ui/menubar";
	import Separator from "$lib/components/ui/separator/separator.svelte";

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Slotly</title>
</svelte:head>
<ModeWatcher />
<Toaster />
<NotificationListener user={data.user} />

<div class="min-h-screen flex flex-col">
	<!-- Navigation -->
	<header class="border-b">
		<div
			class="container mx-auto px-4 py-3 flex justify-between items-center"
		>
			<div class="flex items-center gap-4">
				<a href="/" class="text-xl font-bold">Slotly</a>
				{#if data.user}
					<Menubar.Root class="hidden md:flex">
						<Menubar.Menu>
							<Menubar.Trigger>
								<a href="/dashboard" class="text-sm"
									>Dashboard</a
								>
							</Menubar.Trigger>
						</Menubar.Menu>
					</Menubar.Root>
				{/if}
			</div>
			<div class="flex items-center gap-2">
				<ThemeToggle />
				{#if data.user}
					<form action="/logout" method="POST" class="inline">
						<Button type="submit" variant="ghost" size="sm"
							>Logout</Button
						>
					</form>
				{:else}
					<Button href="/login" variant="ghost" size="sm"
						>Login</Button
					>
				{/if}
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="flex-1">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="border-t mt-12">
		<div
			class="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground"
		>
			<p>© 2026 Slotly - Appointment & Queue Management System</p>
		</div>
	</footer>
</div>
