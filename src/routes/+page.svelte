<script lang="ts">
	import { Game } from "$lib/engine/stores.svelte";
	import ProgressBar from "$lib/components/common/ProgressBar.svelte";
	import { onMount } from "svelte";
	import { _ } from "svelte-i18n";
	import { ReactiveText } from "$lib/engine/utils/ReactiveText.svelte";
	import { Decimal } from "$lib/engine/utils/BreakInfinity/Decimal.svelte";

	onMount(() => {
		Game.Engine.start();
	});

	let battle = $derived(Game.Adventure);
	let current_enemy = $derived(Game.Adventure.CurrentEnemy);
	let show_lore = $state(false);

	let mobile_view = $state("combat"); // 'combat' | 'lore' | 'logs'
	let show_mobile_menu = $state(false);

	function setMobileView(view: string) {
		mobile_view = view;
		show_mobile_menu = false;
		if (view === "lore") show_lore = true;
		if (view === "logs") show_lore = false;
	}
</script>

<div class="flex flex-col h-full">
	<div class="h-full pt-1 sm:pt-3 min-h-0">
		<!-- Main battle area -->
		<div class="flex-1 flex-col sm:flex-row w-full h-full sm:mt-0 min-h-0">
			<div
				class="flex flex-col sm:flex-row w-full h-full border gap-1 sm:gap-6 overflow-hidden"
			>
				<!-- Player -->
				<div
					class="flex flex-col flex-1 min-w-0 p-1 sm:p-6 lg:p-5 items-center sm:items-stretch"
				>
					<span class="text-base sm:text-xl text-center font-semibold"
						>{Game.Player.Name}</span
					>
					<div class="flex w-full flex-1 items-center justify-center py-2">
						<div
							class="relative w-full max-w-28 sm:max-w-full 2xl:max-w-[20rem] lg:max-w-60 aspect-square border mx-auto"
						>
							<img
								src={Game.Player.Icon}
								alt="no icon :("
								class="absolute inset-0 w-full h-full object-contain"
							/>
						</div>
					</div>
					<div class="flex flex-col gap-2 p-1 sm:p-2 mt-auto w-full">
						<div class="flex flex-row">
							<span>{$_("adventure.damage")}: {Game.Player.Damage}</span>
							<span class="ml-auto">
								{$_("adventure.regen")}: {Game.Player.HealthRegen.Get()}
							</span>
						</div>
						<ProgressBar
							min={Game.Player.Health.Min}
							max={Game.Player.Health.Max}
							value={Game.Player.Health.Value}
							text={new ReactiveText(
								Game.Player.Health.Value.format(),
								"/",
								Game.Player.Health.Max.format(),
							)}
							containerClass="w-full h-10 bg-gray-200"
							fillClass="h-full bg-blue-600/60 rounded-2xl"
							textClass="text-lg text-black z-10 absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center"
						/>
					</div>
				</div>

				<div
					class="flex flex-row sm:flex-col w-full sm:w-auto sm:h-full items-center justify-center gap-2 sm:gap-4 px-2 sm:px-4 py-1 sm:py-0 border-t sm:border-t-0"
				>
					<!-- Wave -->
					<div class="flex flex-col items-center gap-2">
						<div class="flex flex-row items-center gap-2">
							<button
								class="border w-8 h-8 flex items-center justify-center text-base disabled:opacity-30"
								disabled={battle.WaveIndex === 0}
								onclick={() => battle.PrevWave()}>←</button
							>

							<select
								class="border text-sm sm:text-lg text-center px-1 py-1.5 w-54"
								value={battle.AreaIndex}
							>
								{#each battle.Areas as area, idx}
									<option value={idx} disabled={idx > battle.HighestArea}>
										{$_(area.Name)}
										{battle.WaveIndex + 1} / {battle.CurrentArea?.Waves.length}
									</option>
								{/each}
							</select>

							<button
								class="border w-8 h-8 flex items-center justify-center text-base disabled:opacity-30"
								disabled={!battle.CanAdvanceWave}
								onclick={() => battle.NextWave()}>→</button
							>
						</div>
					</div>
				</div>

				<!-- Enemy -->
				<div
					class="flex flex-col flex-1 min-w-0 p-1 sm:p-6 lg:p-5 items-center sm:items-stretch"
				>
					<span class="text-base sm:text-xl text-center font-semibold"
						>{$_(current_enemy?.Name ?? "")}</span
					>
					<div class="flex w-full flex-1 items-center justify-center py-2">
						<div
							class="relative w-full max-w-28 sm:max-w-full 2xl:max-w-[20rem] lg:max-w-60 aspect-square border mx-auto"
						>
							<img
								src={current_enemy?.Icon}
								alt="no icon :("
								class="absolute inset-0 w-full h-full object-contain"
							/>
						</div>
					</div>
					<div class="flex flex-col gap-2 p-1 mt-auto w-full">
						<div class="flex flex-row">
							<span>{$_("adventure.damage")}: {current_enemy?.Damage}</span>
							<span class="ml-auto">
								{$_("adventure.regen")}: {current_enemy?.Regen}
							</span>
						</div>

						<ProgressBar
							min={Decimal.ZERO}
							max={current_enemy?.Health.Max ?? Decimal.ZERO}
							value={current_enemy?.Health.Value ?? Decimal.ZERO}
							text={new ReactiveText(
								current_enemy?.Health.Value.format() ?? "NaN",
								"/",
								current_enemy?.Health.Max.format() ?? "NaN",
							)}
							containerClass="w-full h-10 bg-gray-200 rounded-2xl"
							fillClass="h-full bg-blue-600/60 rounded-2xl transition-all ease-out"
							textClass="text-lg text-black z-10 absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center"
						/>
					</div>
				</div>
			</div>
			<div></div>
		</div>
	</div>

	<div class="lg:hidden fixed bottom-14 left-4 z-50 flex flex-col gap-2">
		{#if show_mobile_menu}
			<div class="flex flex-col gap-2">
				<button
					class="border px-3 py-1 bg-white text-sm"
					onclick={() => setMobileView("lore")}>Lore</button
				>
				<button
					class="border px-3 py-1 bg-white text-sm"
					onclick={() => setMobileView("logs")}>Logs</button
				>
				<button
					class="border px-3 py-1 bg-white text-sm"
					onclick={() => setMobileView("combat")}>Combat</button
				>
			</div>
		{/if}
		<button
			class="border bg-white text-sm"
			onclick={() => (show_mobile_menu = !show_mobile_menu)}
		>
			{show_mobile_menu ? "✕" : "Menu"}
		</button>
	</div>

	<div
		class="flex flex-col lg:flex-row w-full min-h-72 max-h-72 border-b mt-auto"
	>
		<div
			class="
      border-l p-3 flex flex-row min-h-0
      w-full lg:w-8/12
      {mobile_view === 'combat' ? 'hidden lg:flex' : 'flex'}
    "
		>
			<div class="border-r pr-3 flex-col hidden lg:flex shrink-0">
				<button class="border" onclick={() => (show_lore = true)}>Lore</button>
				<button class="border" onclick={() => (show_lore = false)}>Logs</button>
			</div>

			{#if show_lore || mobile_view === "lore"}
				<div class="p-3 pt-0 flex flex-col flex-1 min-h-0">
					<span class="text-md font-semibold underline shrink-0">
						Lore - {$_(current_enemy?.Name ?? "")}
					</span>
					<p
						class="text-md leading-relaxed whitespace-pre-line overflow-y-auto flex-1 min-h-0"
					>
						{$_(battle.CurrentEnemy?.Description ?? "", {
							values: { player: Game.Player.Name },
						})}
					</p>
				</div>
			{:else}
				<div class="p-3 pt-0 flex flex-col flex-1 min-h-0">
					<span class="border-b shrink-0">Logs</span>
					<div class="overflow-y-auto flex-1 min-h-0 flex flex-col">
						{#each Game.Adventure.BattleInfo as text}
							<span>{text}</span>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<div
			class="
      flex gap-2 min-h-0 p-3 border-l
      w-full lg:w-4/12
      h-auto lg:h-full
      {mobile_view !== 'combat' ? 'hidden lg:flex' : 'flex'}
    "
		>
			<div class="flex flex-col flex-1 min-w-0 min-h-0">
				<div class="flex items-center gap-2 p-2 shrink-0 flex-wrap">
					<div
						class="w-14 h-14 2xl:w-20 2xl:h-20 rounded-full shrink-0 border"
					></div>
					<div class="flex flex-row gap-1">
						<div class="h-10 w-10 2xl:h-16 2xl:w-16 border"></div>
						<div class="h-10 w-10 2xl:h-16 2xl:w-16 border"></div>
						<div class="h-10 w-10 2xl:h-16 2xl:w-16 border"></div>
						<div class="h-10 w-10 2xl:h-16 2xl:w-16 border"></div>
					</div>
				</div>
				<div class="flex-1 border min-h-0"></div>
			</div>

			<div class="flex flex-col gap-1 shrink-0">
				{#each Array(5) as _}
					<div class="h-12 w-12 2xl:h-20 2xl:w-16 border"></div>
				{/each}
			</div>

			<div class="flex flex-col gap-1 shrink-0">
				{#each Array(5) as _}
					<div class="h-12 w-12 2xl:h-20 2xl:w-16 border"></div>
				{/each}
			</div>
		</div>
	</div>
</div>
