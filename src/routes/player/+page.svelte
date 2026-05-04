<script lang="ts">
	import CollapsibleCard from "$lib/components/common/CollapsibleCard.svelte";
	import LevelingPanel from "$lib/components/leveling/LevelingPanel.svelte";
	import { Game } from "$lib/engine/stores.svelte";
	import { _ } from "svelte-i18n";
	import { slide } from "svelte/transition";
	let offense = Game.Leveling.OffenseRepo.entries().toArray();
	let defense = Game.Leveling.DefenceRepo.entries().toArray();
</script>

<div class="overflow-scroll h-full flex flex-col p-4">
	<div class="flex flex-row justify-center gap-6 h-full">
		<div class="w-1/3 text-center bg-gray-400/25 h-full">
			<CollapsibleCard transition={{ transition: slide }} isOpen={true}>
				{#snippet header()}
					<h6 class="text-lg border bg-red-400 font-bold mb-2">Offense</h6>
				{/snippet}
				{#snippet body()}
					{#each offense as skill, idx}
						{#if skill[1].ShowRequirement()}
							<LevelingPanel data={skill[1]} not_unlocked={false} />
						{/if}
						{#if (offense[idx + 1] && !offense[idx + 1][1].ShowRequirement() && offense[idx][1].ShowRequirement()) || (offense[idx + 1] && offense[idx + 1][1].Visible)}
							<LevelingPanel
								data={offense[idx + 1][1]}
								not_unlocked={true}
								text={$_("leveling.requirement", {
									values: {
										amount: idx * 5000 + 5000,
										prev: $_(offense[idx][1].Name),
									},
								})}
							/>
						{/if}
					{/each}
				{/snippet}
			</CollapsibleCard>
		</div>
		<div class="w-1/3 text-center bg-gray-400/25">
			<CollapsibleCard transition={{ transition: slide }} isOpen={true}>
				{#snippet header()}
					<h6 class="text-lg border bg-green-400 font-bold mb-2">Defence</h6>
				{/snippet}
				{#snippet body()}
					{#each defense as skill, idx}
						{#if skill[1].ShowRequirement()}
							<LevelingPanel data={skill[1]} not_unlocked={false} />
						{/if}
						{#if (defense[idx + 1] && !defense[idx + 1][1].ShowRequirement() && defense[idx][1].ShowRequirement()) || (defense[idx + 1] && defense[idx + 1][1].Visible)}
							<LevelingPanel
								data={defense[idx + 1][1]}
								not_unlocked={true}
								text={$_("leveling.requirement", {
									values: {
										amount: idx * 5000 + 5000,
										prev: $_(defense[idx][1].Name),
									},
								})}
							/>
						{/if}
					{/each}
				{/snippet}
			</CollapsibleCard>
		</div>
	</div>
</div>
