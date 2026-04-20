<script lang="ts">
	import { AllocatableProgress } from "$lib/engine/Levelling/LevelingRepo.svelte";
	import { _ } from "svelte-i18n";
	import ProgressBar from "../common/ProgressBar.svelte";
	import { Game } from "$lib/engine/stores.svelte";
	import CollapsibleCard from "../common/CollapsibleCard.svelte";
	import { slide } from "svelte/transition";

	let { data }: { data: AllocatableProgress } = $props();
	let open = $state(false);
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
			{#if data.AllocatedAmount.gte(data.MaxAllocated)}
				(Max)
			{/if}
		</span>
		<span>{data.AllocatedAmount} </span>
	</div>

	<CollapsibleCard transition={{ transition: slide }} bind:isOpen={open}>
		{#snippet header()}
			<div class="flex items-center gap-2 cursor-pointer border-t pt-2">
				<span class="text-sm">
					Max: {data.MaxAllocated}
				</span>
				<span style="margin-left: auto; " class="text-xs">
					{open ? "-" : "+"}
				</span>
			</div>
		{/snippet}
		{#snippet body()}
			<div class="flex flex-col items-start content-start">
				<span class="text-sm text-left">
					{$_(data.Description)}
				</span>
			</div>
		{/snippet}
	</CollapsibleCard>
</div>
