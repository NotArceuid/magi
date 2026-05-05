<script lang="ts">
	import { Game } from "$lib/engine/stores.svelte";
	import { _ } from "svelte-i18n";
	let equipment_label = [
		{ label: "Head", key: "head" },
		{ label: "Robes", key: "robes" },
		{ label: "Boots", key: "boots" },

		{ label: "Seal", key: "seal" },
		{ label: "Gun", key: "gun" },
		{ label: "Amulet", key: "amulet" },
		{ label: "Ring", key: "ring1" },
		{ label: "Ring", key: "ring2" },
		{ label: "Ring", key: "ring3" },
		{ label: "Accessory", key: "accessory1" },
		{ label: "Accessory", key: "accessory2" },
		{ label: "Accessory", key: "accessory3" },
	];
	let is_open = $state(true);
</script>

<button
	class="w-full max-h-10 text-base p-0 m-0"
	onclick={() => {
		is_open = !is_open;
	}}
>
	x
</button>
{#if is_open}
	<div class="flex flex-row gap-4 h-full p-6 pt-0 min-h-0">
		<div class="flex-1 overflow-y-auto border-r">
			<div
				class="grid grid-cols-[repeat(auto-fill,minmax(3.5rem,3.5rem))] md:grid-cols-[repeat(auto-fill,minmax(4rem,4rem))]
      lg:grid-cols-[repeat(auto-fill,minmax(4.5rem,4.5rem))] 2xl:grid-cols-[repeat(auto-fill,minmax(5rem,5rem))]
      gap-2 md:gap-3 lg:gap-4"
			>
				{#each Game.Inventory.GetAll() as item}
					<div
						class="w-14 h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 2xl:w-20 2xl:h-20 border flex items-center justify-center"
					>
						<img src={item?.Icon_path} alt={$_(item?.Name ?? "notfound")} />
					</div>
				{/each}
			</div>
		</div>
		<div class="min-w-4/12 shrink-0 flex flex-col gap-2 min-h-0 h-full">
			<div class="flex flex-row border-b">
				<span class="text-lg font-semibold mb-1">Equipment</span>
				<!-- TODO: Add a achievemnt congradulating the player for being so dumb that he actually dragged to the span here hehe-->
				<span
					class="text-xs font-semibold mb-1 ml-auto mt-auto sm:visible invisible"
					>Drag here!!</span
				>
			</div>
			<div
				class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 overflow-y-scroll"
			>
				{#each equipment_label as slot}
					<div class="flex flex-col items-center gap-1">
						<span class="text-md text-center">{slot.label}</span>
						<div
							class="w-14 h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 2xl:w-20 2xl:h-20 border shrink-0 flex items-center justify-center"
						>
							<span class="text-md text-gray-400">
								<!-- {Game.Inventory.Equipped?.[slot.key]?.name?.[0] ?? ""} -->
							</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}
