<script lang="ts">
	import { Game } from "$lib/engine/stores.svelte";
	import { _ } from "svelte-i18n";
	import ProgressBar from "./common/ProgressBar.svelte";
	import { Decimal } from "$lib/engine/utils/BreakInfinity/Decimal.svelte";

	let selectedAmt = $state(0);
	let inputValue = $state("");

	function handleInput() {
		selectedAmt = 0;
		const raw = inputValue.trim();
		const val = Decimal.fromString(raw);
		if (!val.isNaN()) {
			Game.Player.AllocationAmount = val.floor();
		} else {
			Game.Player.AllocationAmount = Decimal.ONE;
		}
	}
</script>

<div class="space-y-3">
	<div>
		<div class="flex justify-between items-center">
			<h1 class="font-semibold">{$_("stats.health")}:</h1>
			<span class="text-sm font-mono">
				{Game.Player.Health.Value}/{Game.Player.Health.Max}
			</span>
		</div>
		<ProgressBar
			min={Game.Player.Health.Min}
			max={Game.Player.Health.Max}
			value={Game.Player.Health.Value}
			fillClass="bg-red-400 h-full rounded-full"
			containerClass="h-2 w-full rounded-full"
		/>
	</div>

	<div>
		<div class="flex justify-between items-center">
			<h1 class="font-semibold">{$_("stats.energy")}:</h1>
			<span class="text-sm font-mono">
				{Game.Player.Energy.Value}/{Game.Player.Energy.Max}
			</span>
		</div>
		<ProgressBar
			min={Game.Player.Energy.Min}
			max={Game.Player.Energy.Max}
			value={Game.Player.Energy.Value}
			fillClass="bg-green-400 h-full rounded-full"
			containerClass="h-2 w-full rounded-full"
		/>
	</div>

	<div>
		<div class="flex justify-between items-center">
			<h1 class="font-semibold">{$_("stats.mana")}:</h1>
			<span class="text-sm font-mono">
				{Game.Player.Mana.Value}/{Game.Player.Mana.Max}
			</span>
		</div>
		<ProgressBar
			min={Game.Player.Mana.Min}
			max={Game.Player.Mana.Max}
			value={Game.Player.Mana.Value}
			fillClass="bg-blue-400 h-full rounded-full"
			containerClass="h-2 w-full rounded-full"
		/>
	</div>

	<div class="border-gray-300 mt-2 border-b-4"></div>

	<div class="flex flex-col gap-2 w-full">
		<div class="flex gap-1">
			<input
				type="text"
				class="w-full border rounded px-2 py-1 text-sm"
				bind:value={inputValue}
				oninput={handleInput}
				onblur={() => (inputValue = Game.Player.AllocationAmount.format(0))}
				placeholder={"Enter amount"}
			/>
		</div>
	</div>
</div>
