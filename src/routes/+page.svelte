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
</script>

<div class="flex flex-col h-full">
	<div class="max-h-8/12 pt-3">
		<!-- Main battle area -->
		<div class="flex flex-col sm:flex-row w-full h-full mt- sm:mt-0 min-h-0">
			<div
				class="flex flex-col sm:flex-row w-full h-full border gap-2 sm:gap-6 overflow-auto"
			>
				<!-- Player -->
				<div
					class="flex flex-col flex-1 min-w-0 p-3 sm:p-6 lg:p-5 items-center sm:items-stretch"
				>
					<span class="text-base sm:text-xl text-center font-semibold"
						>{Game.Player.Name}</span
					>
					<div class="flex w-full flex-1 items-center justify-center py-2">
						<div
							class="relative w-full 2xl:max-w-[20rem] lg:max-w-60 aspect-square border"
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
					class="flex flex-row sm:flex-col w-full sm:w-auto sm:h-full items-center justify-center gap-3 sm:gap-4 px-3 sm:px-4 pb-3 sm:pb-0 border-t sm:border-t-0 sm:pt-0"
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

					<!-- Fight button -->
					{#if !battle.Fighting}
						<button
							class="border px-3 sm:px-4 py-1.5 text-base sm:text-lg font-semibold w-full max-w-32 sm:max-w-none"
							onclick={() => battle.StartCombat()}>Fight!1!</button
						>
					{:else}
						<button
							class="border px-3 sm:px-4 py-1.5 text-base sm:text-lg font-semibold w-full max-w-32 sm:max-w-none"
							onclick={() => battle.StopCombat()}>Stawp >:(</button
						>
					{/if}
				</div>

				<!-- Enemy -->
				<div
					class="flex flex-col flex-1 min-w-0 p-3 sm:p-6 lg:p-5 items-center sm:items-stretch"
				>
					<span class="text-base sm:text-xl text-center font-semibold"
						>{$_(current_enemy?.Name ?? "")}</span
					>
					<div class="flex w-full flex-1 items-center justify-center py-2">
						<div
							class="relative w-full 2xl:max-w-[20rem] md:max-w-60 aspect-square border"
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
	<!-- Lore panel -->
	<div
		class="p-3 flex flex-col gap-1 w-full h-full border border-t-0 overflow-hidden"
	>
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

	<!-- Header -->
	<!--	<div class="flex flex-row flex-wrap gap-2 mt-3 sm:mt-5 px-2 sm:px-0">
		<div class="flex flex-row gap-0.5 min-w-0 flex-1">
			<span class="text-base font-semibold truncate"
				>{$_(battle.CurrentArea?.Name ?? "")} -
			</span>
			<span class="text-sm text-gray-500 line-clamp-2 mt-auto ml-1"
				>{$_(battle.CurrentArea?.Description ?? "")}</span
			>
		</div>
		<div
			class="flex flex-row gap-2 sm:gap-4 text-sm sm:text-base font-bold shrink-0"
		>
			<span>Highest Stage: {battle.HighestArea + 1}</span>
			<span>Highest Wave: {battle.HighestWave + 1}</span>
		</div>
	</div> -->
</div>
