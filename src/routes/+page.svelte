<script lang="ts">
	import { Game } from "$lib/stores.svelte";
	import ProgressBar from "$lib/components/common/ProgressBar.svelte";
	import { onMount, tick } from "svelte";
	import { _ } from "svelte-i18n";
	import { ReactiveText } from "$lib/utils/ReactiveText.svelte";
	import { Decimal } from "$lib/utils/BreakInfinity/Decimal.svelte";
	import type { AbilityBase } from "$lib/engine/Battle/Abilities.svelte";
	import { CombatTextSrcEnum } from "$lib/engine/Battle/Combat.svelte";

	let battle = $derived(Game.Adventure);
	let current_enemy = $derived(Game.Adventure.CurrentEnemy);
	let show_lore = $state(false);

	let mobile_view = $state("combat");
	let show_mobile_menu = $state(false);
	let hovered_ability = $state<AbilityBase>();

	function setMobileView(view: string) {
		mobile_view = view;
		show_mobile_menu = false;
		if (view === "lore") show_lore = true;
		if (view === "logs") show_lore = false;
	}

	let element_ring_map = ["ring-gray-400/80", "ring-red-500"];
	let log_source_color_map: Record<CombatTextSrcEnum, string> = {
		[CombatTextSrcEnum.Enemy]: "text-red-500",
		[CombatTextSrcEnum.Player]: "text-blue-500",
		[CombatTextSrcEnum.System]: "text-gray-500",
	};

	let log: HTMLDivElement = $state()!;
	let bottom: HTMLDivElement = $state()!;

	let combat_desc = $derived(
		Game.Combat.Fighting
			? "combat.fighting.yes.desc"
			: "combat.fighting.no.desc",
	);

	onMount(() => {
		Game.Engine.start();
	});

	$effect(() => {
		Game.Combat.CombatText.length;
		tick().then(() => bottom?.scrollIntoView());
	});

	$effect(() => {
		if (hovered_ability) {
			Game.HoveredText[0] = hovered_ability.Description;
		} else {
			Game.HoveredText[0] = "";
			Game.HoveredText[1] = {};
		}
	});
</script>

<div class="flex flex-col h-full">
	<div
		class="h-7/12 pt-1 sm:pt-3 flex-1 flex-col sm:flex-row w-full sm:mt-0 min-h-0"
	>
		<!-- Main battle area -->
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
						min={Decimal.ZERO}
						max={Game.Player.Health.Max.Get()}
						value={Game.Player.Health.Get()}
						text={new ReactiveText(
							Game.Player.Health.Get().format(),
							"/",
							Game.Player.Health.Max.Get().format(),
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
							disabled={battle.AreaIndex === 0}
							onclick={() => battle.PrevArea()}>←</button
						>
						<select
							class="border text-sm sm:text-lg text-center px-1 py-1.5 w-54"
							value={battle.AreaIndex}
						>
							{#each battle.Areas as area, idx}
								<option value={idx} disabled={idx > battle.HighestUnlockedArea}>
									{$_(area.Name)}
									{area.CurrentIdx + 1} / {area.EnemyList.length}
								</option>
							{/each}
						</select>
						<button
							class="border w-8 h-8 flex items-center justify-center text-base disabled:opacity-30"
							disabled={!battle.CurrentArea?.Cleared}
							onclick={() => battle.NextArea()}>→</button
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
						max={current_enemy?.Health.Max.Get() ?? Decimal.ZERO}
						value={current_enemy?.Health.Get() ?? Decimal.ZERO}
						text={new ReactiveText(
							current_enemy?.Health.Get().format() ?? "NaN",
							"/",
							current_enemy?.Health.Max.Get().format() ?? "NaN",
						)}
						containerClass="w-full h-10 bg-gray-200 rounded-2xl"
						fillClass="h-full bg-blue-600/60 rounded-2xl transition-all ease-out"
						textClass="text-lg text-black z-10 absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center"
					/>
				</div>
			</div>
		</div>
	</div>

	<!-- Mobile controls -->
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

	<!-- Bottom bar-->
	<div class="flex flex-col h-5/12 lg:flex-row w-full border-b mt-auto">
		<div
			class="
      border-l p-3 flex flex-row min-h-0 h-full
      w-full lg:w-8/12
      {mobile_view === 'combat' ? 'hidden lg:flex' : 'flex'}
    "
		>
			<div class="border-r pr-3 flex-col hidden lg:flex shrink-0">
				<button class="border" onclick={() => (show_lore = true)}>Lore</button>
				<button class="border" onclick={() => (show_lore = false)}>Logs</button>
			</div>

			{#if show_lore || mobile_view === "lore"}
				<div class="overflow-y-auto flex-1 min-h-0 p-3">
					{$_(current_enemy?.Description ?? "")}
				</div>
			{:else}
				<div class="p-3 pt-0 flex flex-col flex-1 min-h-0">
					<span class="border-b shrink-0">Logs</span>
					<div
						bind:this={log}
						class="overflow-y-auto flex-1 min-h-0 p-3 flex flex-col"
					>
						{#each Game.Combat.CombatText as text}
							<div>
								<span class={log_source_color_map[text[0]]}
									>{$_(text[0].toString())}</span
								>
								<span>{$_(text[1], text[2])}</span>
							</div>
						{/each}
						<div bind:this={bottom}></div>
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
					<!-- svelte-ignore a11y_consider_explicit_label -->
					<button
						class="w-14 h-14 2xl:w-20 2xl:h-20 rounded-full shrink-0 border relative overflow-hidden flex justify-center items-center
            {Game.Combat.Abilities[0].CooldownLeft === 0
							? 'ring-4'
							: ''} {element_ring_map[Game.Combat.Elements]}"
						onclick={() => Game.Combat.Abilities[0].Fire()}
						onmouseover={() => {
							hovered_ability = Game.Combat.Abilities[0];
						}}
						onmouseleave={() => {
							hovered_ability = undefined;
						}}
						onfocus={() => {
							hovered_ability = Game.Combat.Abilities[0];
						}}
						ontouchstart={() => {
							hovered_ability = Game.Combat.Abilities[0];
						}}
						ontouchend={() => {
							hovered_ability = undefined;
						}}
					>
						{$_(Game.Combat.Abilities[0].Name ?? "")}
						<div
							class="absolute bottom-0 left-0 w-full bg-gray-500/40 pointer-events-none"
							style="height: {((Game.Combat.Abilities[0].CooldownLeft ?? 0) /
								(Game.Combat.Abilities[0].Cooldown ?? 1)) *
								100}%"
						></div>
					</button>
					<div class="flex flex-row gap-1">
						{#each Game.Combat.Abilities as ability, idx}
							{#if idx !== 0}
								<button
									class="h-10 w-10 2xl:h-16 2xl:w-16 border relative overflow-hidden flex justify-center items-center {idx ===
										1 && current_enemy?.CanParry
										? 'ring-1 ring-yellow-500 shadow-2xl'
										: ''}"
									onclick={() => ability?.Fire()}
									onmouseover={() => {
										hovered_ability = ability;
									}}
									onmouseleave={() => {
										hovered_ability = undefined;
									}}
									onfocus={() => {
										hovered_ability = ability;
									}}
									ontouchstart={() => {
										hovered_ability = ability;
									}}
									ontouchend={() => {
										hovered_ability = undefined;
									}}
								>
									{$_(ability?.Name ?? "")}
									{#if (ability?.CooldownLeft ?? 0) > 0}
										<div
											class="absolute bottom-0 left-0 w-full bg-gray-500/40 pointer-events-none"
											style="height: {((ability?.CooldownLeft ?? 0) /
												(ability?.Cooldown ?? 1)) *
												100}%"
										></div>
									{/if}
								</button>
							{/if}
						{/each}
						<button
							class="h-10 text-xs w-10 2xl:h-16 2xl:w-16 border relative overflow-hidden flex justify-center items-center"
							onclick={() => {
								Game.Combat.Fighting
									? Game.Combat.StopCombat()
									: Game.Combat.StartCombat();
							}}
							onmouseover={() => {
								Game.HoveredText[0] = combat_desc;
							}}
							onmouseleave={() => {
								Game.HoveredText[0] = "";
							}}
							onfocus={() => {
								Game.HoveredText[0] = combat_desc;
							}}
							ontouchstart={() => {
								Game.HoveredText[0] = combat_desc;
							}}
							ontouchend={() => {
								Game.HoveredText[0] = "";
							}}
						>
							{$_(
								Game.Combat.Fighting
									? "combat.fighting.yes.label"
									: "combat.fighting.no.label",
							)}
						</button>
					</div>
				</div>
				<div
					class="flex-1 border min-h-0 p-4 whitespace-pre-line overflow-y-scroll"
				>
					{#if hovered_ability?.IsUnlocked}
						{$_(Game.HoveredText[0], Game.HoveredText[1])}

						<br />

						<div class="flex flex-col">
							{#if hovered_ability.SkillInfo}
								<span class="border-b w-full font-bold"
									>{$_("skills.info")}</span
								>
								{#each hovered_ability.SkillInfo as skill}
									<div class="flex justify-between">
										<span>{$_(skill[0])}</span>
										<span>{skill[1]()}</span>
									</div>
								{/each}
							{/if}
						</div>
					{:else}
						{$_(Game.HoveredText[0], Game.HoveredText[1])}
						<!--
						{$_(hovered_ability?.InactiveDescription ?? "skills.none")}
-->
					{/if}
				</div>
			</div>

			<div class="flex flex-col gap-1 shrink-0">
				{#each Game.Combat.SwitchAbility as ability, idx}
					<!-- TODO: Add the other rays -->
					<button
						class="h-10 w-10 2xl:h-16 2xl:w-16 border relative overflow-hidden flex justify-center items-center
    ring-2 {idx === 1 && current_enemy?.CanParry
							? 'ring-yellow-500 shadow-2xl'
							: element_ring_map[Game.Combat.Elements]}"
						onclick={() => Game.Combat.SwitchElement(idx)}
						onmouseover={() => {
							hovered_ability = ability;
						}}
						onmouseleave={() => {
							hovered_ability = undefined;
						}}
						onfocus={() => {
							hovered_ability = ability;
						}}
						ontouchstart={() => {
							hovered_ability = ability;
						}}
						ontouchend={() => {
							hovered_ability = undefined;
						}}
						><span class="p-0 text-sm">
							{$_(Game.Combat.SwitchAbility[idx]?.Name ?? "??")}
						</span></button
					>
				{/each}
			</div>
		</div>
	</div>
</div>
