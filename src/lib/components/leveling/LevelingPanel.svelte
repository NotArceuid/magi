<script lang="ts">
	import { AllocatableProgress } from "$lib/engine/Levelling/LevelingRepo.svelte";
	import { _ } from "svelte-i18n";
	import ProgressBar from "../common/ProgressBar.svelte";
	import { Game } from "$lib/engine/stores.svelte";

	let { data }: { data: AllocatableProgress } = $props();
</script>

<div class="w-full h-full flex flex-col border p-2 gap-2">
	<div class="flex flex-row gap-2 items-center">
		<div class="relative grow">
			<ProgressBar
				containerClass={"border min-h-5"}
				min={data.Progress.Min}
				max={data.Progress.Max}
				value={data.Progress.Value}
			/>

			<h6
				class="absolute inset-0 flex items-center justify-center text-sm z-10 pointer-events-none text-gray-800"
			>
				{data.Progress.Value.format()} /
				{data.Progress.Max.format()}
			</h6>
		</div>

		<div class="flex shrink-0 justify-end gap-1">
			<button
				class="border w-5 h-5 flex items-center justify-center text-xs leading-none hover:bg-gray-100 cursor-pointer select-none"
				onclick={() => data.Allocate(Game.Player.Energy)}
			>
				+
			</button>
			<button
				class="border w-5 h-5 flex items-center justify-center text-xs leading-none hover:bg-gray-100 cursor-pointer select-none"
				onclick={() => data.Deallocate(Game.Player.Energy)}
			>
				-
			</button>
		</div>
	</div>

	<div class="flex justify-between items-center text-sm font-medium">
		<span
			>{$_(data.Name)}
			{data.Count}x
		</span>
		<span>{data.AllocatedAmount} </span>
	</div>
</div>
