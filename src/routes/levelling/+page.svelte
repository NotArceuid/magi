<script lang="ts">
	import CollapsibleCard from "$lib/components/common/CollapsibleCard.svelte";
	import LevelingPanel from "$lib/components/leveling/LevelingPanel.svelte";
	import { Game } from "$lib/engine/stores.svelte";
	import { _ } from "svelte-i18n";
	import { slide } from "svelte/transition";
</script>

<div class="overflow-scroll h-full flex flex-col">
	<div class="flex flex-row justify-center gap-4 h-full">
		<div class="w-1/4 text-center bg-gray-400/25 h-full">
			<CollapsibleCard transition={{ transition: slide }} isOpen={true}>
				{#snippet header()}
					<h6 class="text-md border bg-red-400 font-bold mb-1">Offense</h6>
				{/snippet}
				{#snippet body()}
					{#each Game.Leveling.OffenseRepo.values() as skill}
						<LevelingPanel data={skill} />
					{/each}
				{/snippet}
			</CollapsibleCard>
		</div>

		<div class="w-1/4 text-center bg-gray-400/25">
			<CollapsibleCard transition={{ transition: slide }} isOpen={true}>
				{#snippet header()}
					<h6 class="text-md border bg-green-400 font-bold mb-1">Defence</h6>
				{/snippet}
				{#snippet body()}
					{#each Game.Leveling.OffenseRepo.values() as skill}
						<LevelingPanel data={skill} />
					{/each}
				{/snippet}
			</CollapsibleCard>
		</div>

		<div class="w-1/4 text-center bg-gray-400/25 h-full">
			<CollapsibleCard transition={{ transition: slide }} isOpen={true}>
				{#snippet header()}
					<h6 class="text-md border bg-blue-400 font-bold mb-1">Magic</h6>
				{/snippet}
				{#snippet body()}
					{#each Game.Leveling.OffenseRepo.values() as skill}
						<LevelingPanel data={skill} />
					{/each}
				{/snippet}
			</CollapsibleCard>
		</div>
	</div>
</div>
