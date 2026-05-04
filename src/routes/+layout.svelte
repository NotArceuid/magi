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
	import Footer from "$lib/components/index/Footer.svelte";
	import { Game } from "$lib/engine/stores.svelte";
	import StatsBar from "$lib/components/StatsBar.svelte";
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
			<div class="flex flex-col w-full h-full">
				<NavBar />

				<div class="flex flex-row h-full min-h-0">
					<div class="p-3 w-full overflow-hidden flex flex-col min-h-0">
						{#if $page.route.id === "/" || $page.route.id === "/battle"}
							<div class="flex flex-row space-x-4 text-center text-sm shrink-0">
								<a class="border p-2 min-w-32" href="/">Adventure</a>
							</div>
						{/if}
						<div class="flex-1 min-h-0">
							{@render children?.()}
						</div>
					</div>
					<div class="p-3 border-l shrink-0">
						<StatsBar />
					</div>
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
		</main>
	</div>

	<Footer />
{/if}
