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

	let show_stats = $state(false);
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
				<div
					class="p-3 border-b flex flex-row space-x-4 text-center text-sm font-bold"
				>
					<a class="border p-2 min-w-32" href="/">Battle</a>
					<a class="border p-2 min-w-32" href="/player">{Game.Player.Name}</a>

					<a class="border p-2 min-w-32 ml-auto" href="/shop">Shop</a>
					<a class="border p-2 min-w-32" href="/achievement">Achievements</a>
					<a class="border p-2 min-w-32" href="/settings">Settings</a>
				</div>

				<div class="flex flex-row h-full min-h-0">
					<div class="hidden lg:block p-4 border-r">
						<StatsBar />
					</div>
					<div class="p-3 w-full overflow-hidden flex flex-col min-h-0">
						{#if $page.route.id === "/" || $page.route.id === "/battle"}
							<div class="flex flex-row space-x-4 text-center text-sm shrink-0">
								<a class="border p-2 min-w-32" href="/">Adventure</a>
							</div>
						{/if}
						<div class="flex-1 min-h-0">
							{@render children?.()}
						</div>

						<Footer />
					</div>
					{#if show_stats}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="lg:hidden fixed inset-0 z-40 bg-black/50"
							onclick={() => (show_stats = false)}
						></div>
						<div
							class="lg:hidden fixed top-0 right-0 z-50 border h-full w-8/12 bg-white p-3 overflow-y-auto"
						>
							<StatsBar />
						</div>
					{/if}
					<button
						class="lg:hidden fixed bottom-4 left-4 z-50 border px-3 py-2 bg-white text-sm"
						onclick={() => (show_stats = !show_stats)}
					>
						Stats
					</button>
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
{/if}
