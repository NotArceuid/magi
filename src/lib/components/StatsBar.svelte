<script lang="ts">
	import { Game } from "$lib/stores.svelte";
	import { _ } from "svelte-i18n";
	import { Decimal } from "$lib/utils/BreakInfinity/Decimal.svelte";

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

<div>
	<div class="flex justify-between items-center">
		<h1 class="font-semibold">{$_("stats.health")}:</h1>
		<span class="text-sm font-mono">
			{Game.Player.Health.Get().format(0)}/{Game.Player.Health.Max.Get().format(
				0,
			)}
		</span>
	</div>
	<!--		<ProgressBar
			min={Game.Player.Health.Min}
			max={Game.Player.Health.Max}
			value={Game.Player.Health.Value}
			fillClass="bg-red-400 h-full rounded-full"
			containerClass="h-2 w-full rounded-full"
		/> -->
</div>

<div>
	<div class="flex justify-between items-center">
		<h1 class="font-semibold">{$_("stats.energy")}:</h1>
		<span class="text-sm font-mono">
			{Game.Player.Energy.Get().format(0)}/{Game.Player.Energy.Max.Get().format(
				0,
			)}
		</span>
	</div>
	<!--		<ProgressBar
			min={Game.Player.Energy.Min}
			max={Game.Player.Energy.Max}
			value={Game.Player.Energy.Value}
			fillClass="bg-green-400 h-full rounded-full"
			containerClass="h-2 w-full rounded-full"
		/> -->
</div>

<div>
	<div class="flex justify-between items-center">
		<h1 class="font-semibold">{$_("stats.mana")}:</h1>
		<span class="text-sm font-mono"> wip / wip </span>
	</div>
	<!--		<ProgressBar
			min={Game.Player.Mana.Min}
			max={Game.Player.Mana.Max}
			value={Game.Player.Mana.Value}
			fillClass="bg-blue-400 h-full rounded-full"
			containerClass="h-2 w-full rounded-full"
		/> -->
</div>

<div class="border-gray-300 mt-2 border-b-4"></div>

<div class="flex flex-col gap-2 w-full">
	<div class="flex gap-1">
		<input
			type="text"
			class="w-full border rounded px-2 py-1 text-sm"
			bind:value={inputValue}
			oninput={handleInput}
			onblur={() =>
				(inputValue = Game.Player.AllocationAmount.floor().toString())}
			placeholder={"Enter amount"}
		/>
	</div>
</div>
