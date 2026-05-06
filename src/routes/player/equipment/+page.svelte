<script lang="ts">
	import {
		canEquip,
		drag_end,
		drag_over,
		drag_start,
		dragStore,
		on_drop,
		SourceEnum,
		touch_start,
	} from "$lib/components/battle/dragging.svelte";
	import { ItemType } from "$lib/engine/Inventory/InventoryRepo.svelte";
	import { Game } from "$lib/engine/stores.svelte";
	import { Decimal } from "$lib/engine/utils/BreakInfinity/Decimal.svelte";
	import { _ } from "svelte-i18n";

	let equipment_label = [
		{ label: "Head", key: ItemType.Head },
		{ label: "Robes", key: ItemType.Vest },
		{ label: "Boots", key: ItemType.Boots },
		//		{ label: "Seal", key: ItemType.Seal },
		{ label: "Gun", key: ItemType.Gun },
		{ label: "Amulet", key: ItemType.Amulet },
		{ label: "Ring", key: ItemType.Ring1 },
		//		{ label: "Ring", key: ItemType.Ring2 },
		//		{ label: "Ring", key: ItemType.Ring3 },
		{ label: "Accessory", key: ItemType.Accessory1 },
		//		{ label: "Accessory", key: ItemType.Accessory2 },
		//		{ label: "Accessory", key: ItemType.Accessory3 },
	];

	let showStats = $state(false);
</script>

<div class="flex flex-col md:flex-row gap-4 w-full h-full border p-4">
	<!-- Equipment Slots -->
	<div class="shrink-0 flex flex-col gap-2 sm:min-w-9/12 sm:max-w-9/12">
		<div class="flex flex-row border-b">
			<span class="text-lg font-semibold mb-1">Equipment</span>
			<!-- TODO: Add a achievemnt congradulating the player for being so dumb that he actually dragged to the span here hehe-->
			<span class="text-xs font-semibold mb-1 ml-auto mt-auto hidden sm:block"
				>Drag here!!</span
			>
			<button
				class="md:hidden ml-auto text-sm"
				onclick={() => (showStats = !showStats)}
			>
				{showStats ? "Hide Stats" : "Show Stats"}
			</button>
		</div>
		<div class="flex flex-row flex-wrap gap-2">
			{#each equipment_label as slot}
				<div class="flex flex-col items-center gap-1">
					<span class="text-xs md:text-md text-center">{slot.label}</span>
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						data-slot={slot.key}
						class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 2xl:w-20 2xl:h-20 border shrink-0 flex items-center justify-center transition-shadow
             {dragStore.drag_item &&
						canEquip(dragStore.drag_item.item, slot.key)
							? 'ring-3 ring-blue-400/50 shadow-lg shadow-blue-400/40'
							: ''}
            "
						draggable={Game.Inventory.Equipment[slot.key] !== undefined}
						ondragend={drag_end}
						ontouchend={drag_end}
						ondragstart={(e) =>
							drag_start(
								Game.Inventory.Equipment[slot.key]!,
								{ type: SourceEnum.equipment, slot: slot.key },
								e,
							)}
						ondragover={drag_over}
						ondrop={(_) =>
							on_drop(dragStore.drag_item, {
								type: SourceEnum.equipment,
								slot: slot.key,
							})}
						ontouchstart={(e) =>
							touch_start(
								Game.Inventory.Equipment[slot.key] ?? null,
								{ type: SourceEnum.equipment, slot: slot.key },
								e,
							)}
					>
						{#if Game.Inventory.Equipment[slot.key]}
							<img
								src={Game.Inventory.Equipment[slot.key]?.Icon_path}
								alt={$_(Game.Inventory.Equipment[slot.key]?.Name ?? "")}
							/>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Stats Panel -->
	<div
		class="border-l border-gray-700 hidden md:block md:flex-1 overflow-y-auto min-h-0 max-w-3/12 min-w-3/12 ml-auto"
	>
		<div class="p-4 pt-1">
			<h3 class="text-lg font-semibold mb-2 border-b">Stats</h3>
			<div class="flex flex-col gap-2">
				{#each Object.entries(Game.Inventory.EquipmentMultiplier) as [key, multiplier]}
					{#if multiplier.Get().neq(Decimal.ONE)}
						<div class="flex justify-between text-sm">
							<span>{$_(key)}:</span>
							<span>{multiplier.Get().format()}x</span>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</div>

	<!-- Mobile Stats Panel -->
	{#if showStats}
		<div
			class="md:hidden w-full border-t border-gray-700 overflow-y-auto max-h-40"
		>
			<div class="p-4">
				<h3 class="text-lg font-semibold mb-2">Stats</h3>
				<div class="flex flex-col gap-2">
					{#each Object.entries(Game.Inventory.EquipmentMultiplier) as [key, multiplier]}
						{#if multiplier.Get().neq(Decimal.ONE)}
							<div class="flex justify-between text-sm">
								<span>{$_(key)}:</span>
								<span>{multiplier.Get().format()}x</span>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
