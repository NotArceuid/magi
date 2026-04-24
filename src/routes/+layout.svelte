<script lang="ts">
	import { isLoading, waitLocale } from "svelte-i18n";
	import "../app.css";
	import { RegisterLocales } from "../Locales/i18n";
	import NotificationHandler from "$lib/components/NotificationHandler.svelte";
	import { onMount } from "svelte";
	import {
		NotificationPopUp,
		type INotification,
	} from "$lib/components/Notification.svelte";
	import NavBar from "$lib/components/NavBar.svelte";
	import { dev } from "$app/environment";
	import Footer from "$lib/components/index/Footer.svelte";
	import { Game } from "$lib/engine/stores.svelte";
	import StatsBar from "$lib/components/StatsBar.svelte";
	import Inventory from "$lib/components/Inventory.svelte";
	import { page } from "$app/stores";
	let { children } = $props();

	RegisterLocales();
	let localesLoaded = $state(false);
	onMount(async () => {
		await waitLocale();
		localesLoaded = true;
	});

	let notificationList: INotification[] = $state([]);
	onMount(() => {
		NotificationPopUp.add((notification: INotification) => {
			notificationList.push(notification);
		});
		Game.Engine.start();
	});
</script>

<svelte:head>
	<title>Magi Idle</title>
</svelte:head>

{#if !isLoading || localesLoaded}
	<div
		class="w-full h-full transition-colors duration-300 bg-bg text-font border-border"
	>
		<main class="w-full h-full">
			<div class="flex flex-row h-full">
				<div class="flex flex-col w-full h-full">
					<div class="max-h-2/12">
						<NavBar />
					</div>

					<div class="p-3 w-full h-full overflow-hidden">
						{#if $page.route.id === "/" || $page.route.id === "/battle"}
							<div class="flex flex-row space-x-4 text-center text-sm">
								<a class="border p-2 min-w-32" href="/">Adventure</a>
								<a class="border p-2 min-w-32" href="/dungeon">Dungeon</a>
							</div>
						{/if}
						<div class="overflow-y-scroll h-full">
							{@render children?.()}
						</div>
					</div>

					<div class="border-t mt-auto max-h-4/12">
						<Inventory />
					</div>
					<div class="absolute bottom-5 right-5">
						{#each notificationList as notification}
							<NotificationHandler
								data={notification}
								done={() => {
									notificationList = notificationList.filter(
										(a) => a.name !== notification.name,
									);
								}}
							/>
						{/each}
					</div>
				</div>

				<div class="w-2/12 h-full border-l p-3">
					<StatsBar />
				</div>
			</div>
		</main>
	</div>

	<Footer />
{/if}
