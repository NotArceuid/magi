<script lang="ts">
	import {
		canEquip,
		drag_end,
		drag_over,
		drag_start,
		dragStore,
		lockScrollWhileDragging,
		on_drop,
		on_hover,
		SourceEnum,
		stop_hover,
		touch_start,
	} from "$lib/components/battle/dragging.svelte";
	import { EquipmentEffect } from "$lib/engine/Inventory/Inventory.svelte";
	import { ItemType } from "$lib/engine/Inventory/InventoryRepo.svelte";
	import { Game } from "$lib/engine/stores.svelte";
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

	let is_open = $state(true);
	let drag_indicator = "ring-1 ring-gray-400 shadow-lg shadow-blue-400/30";

	let showStats = $state(false);
	let mainStats = $derived.by(() => {
		if (!dragStore.hover_item?.Effects) return [];

		return [...dragStore.hover_item.Effects.values()]
			.filter(
				(val) =>
					val.EquipmentEffect === EquipmentEffect.Damage ||
					val.EquipmentEffect === EquipmentEffect.Defence,
			)
			.map((val) => [val.EquipmentEffect, val] as const);
	});

	let substats = $derived.by(() => {
		if (!dragStore.hover_item?.Effects) return [];

		return [...dragStore.hover_item.Effects.values()]
			.filter(
				(val) =>
					val.EquipmentEffect !== EquipmentEffect.Damage &&
					val.EquipmentEffect !== EquipmentEffect.Defence,
			)
			.map((val) => [val.EquipmentEffect, val] as const);
	});
</script>

<div class="h-full flex flex-col">
	<div class="flex flex-col md:flex-row h-full gap-4 w-full border p-4">
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
					<div
						class="flex flex-col items-center gap-1 {Game.Inventory.Equipment[
							slot.key
						]
							? 'cursor-grab'
							: ''}"
					>
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
							onfocus={() =>
								on_hover(Game.Inventory.Equipment[slot.key] ?? null)}
							ondragend={drag_end}
							onmouseover={() =>
								on_hover(Game.Inventory.Equipment[slot.key] ?? null)}
							onmouseleave={() => stop_hover()}
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
			class="border-l border-gray-700 hidden md:flex md:flex-1 overflow-hidden min-h-0 max-w-3/12 min-w-3/12 ml-auto h-full flex-col"
		>
			<div class="p-4 pt-1 overflow-y-auto flex-1 min-h-0">
				<h3 class="text-lg font-semibold mb-2 border-b">
					{$_(dragStore.hover_item?.Name ?? "No item lol")}
				</h3>
				<div class="flex flex-col gap-2">
					<div class="text-xs mb-2">
						{$_(
							dragStore.hover_item?.Description ??
								"Hover over an item to view its stats",
						)}
					</div>
					<div class="flex flex-col gap-1">
						{#each mainStats as stat}
							<div class="flex justify-between text-xs">
								<span>{$_(stat[0])}</span>
								<span>{stat[1]?.View.Text ?? ""}</span>
							</div>
						{/each}
						{#if dragStore.hover_item}
							<div class="border-t"></div>
						{/if}
						{#each substats as stat}
							<div class="flex justify-between text-xs">
								<span>{$_(stat[0])}</span>
								<span>{stat[1]?.View.Text ?? ""}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<div class="p-4 border-t border-gray-700 overflow-y-auto h-4/12 shrink-0">
				<h1 class="text-base font-semibold mb-2">Total Stats</h1>
				<div class="flex flex-col gap-1">
					{#each Object.entries(Game.Inventory.EquipmentMultiplier) as effect}
						<div class="flex flex-row text-xs">
							<h1>{$_(effect[0])}</h1>
							<h1 class="ml-auto">{effect[1].Get().format()}x</h1>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Mobile Stats Panel -->
	{#if showStats}
		<div
			class="md:hidden w-full border-b border-gray-700 overflow-y-auto min-h-50 max-h-50 mt-auto flex flex-col"
		>
			<div class="p-4 pt-1 border-l border-r">
				<h3 class="text-lg font-semibold mb-2 border-b">
					{$_(dragStore.hover_item?.Name ?? "No item lol")}
				</h3>
				<div class="flex flex-col gap-2">
					<div class="text-xs mb-2">
						{$_(
							dragStore.hover_item?.Description ??
								"Hover over an item to view its stats",
						)}
					</div>
					<div class="flex flex-col gap-1">
						{#each mainStats as stat}
							<div class="flex justify-between text-xs">
								<span>{$_(stat[0])}</span>
								<span>{stat[1]?.View.Text ?? ""}</span>
							</div>
						{/each}
						{#if dragStore.hover_item}
							<div class="border-t"></div>
						{/if}
						{#each substats as stat}
							<div class="flex justify-between text-xs">
								<span>{$_(stat[0])}</span>
								<span>{stat[1]?.View.Text ?? ""}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
			<div class="p-4 border-l border-r">
				<h1>Total Stats</h1>
				{#each Object.entries(Game.Inventory.EquipmentMultiplier) as effect}
					<div class="flex flex-row text-xs">
						<h1>{$_(effect[0])}</h1>
						<h1 class="ml-auto">{effect[1].Get().format()}x</h1>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<button
		class="w-full text-base p-0 m-0 mt-auto border-l border-r"
		onclick={() => {
			is_open = !is_open;
		}}
	>
		x
	</button>

	<div class="shrink-0 flex flex-col">
		<div class="border border-t-0 h-full min-h-0 flex flex-col">
			{#if is_open}
				<div
					class="flex flex-col md:flex-row gap-4 p-6 pt-0 min-h-0 min-w-10/12 h-full"
				>
					<div class="flex-1 overflow-y-auto border-r">
						<div
							class=" grid grid-cols-[repeat(auto-fill,minmax(3.5rem,3.5rem))] md:grid-cols-[repeat(auto-fill,minmax(4rem,4rem))]
      lg:grid-cols-[repeat(auto-fill,minmax(4.5rem,4.5rem))] 2xl:grid-cols-[repeat(auto-fill,minmax(5rem,5rem))]
      gap-2 md:gap-3 lg:gap-4"
						>
							{#each Game.Inventory.GetAll() as item, i}
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									data-inventory={i}
									class=" w-14 h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 2xl:w-20 2xl:h-20 border flex items-center justify-center transition-shadow
                  {item ? 'cursor-grab' : ''}
              {dragStore.drag_item ? drag_indicator : ''}
              "
									use:lockScrollWhileDragging
									onfocus={() => on_hover(item)}
									draggable={item !== null}
									ondragstart={(e) =>
										drag_start(
											item,
											{ type: SourceEnum.inventory, index: i },
											e,
										)}
									ondragover={drag_over}
									ondragend={drag_end}
									onmouseover={() => on_hover(item)}
									onmouseleave={() => stop_hover()}
									ondrop={(_) =>
										on_drop(dragStore.drag_item, {
											type: SourceEnum.inventory,
											index: i,
										})}
									ontouchstart={(e) =>
										touch_start(
											item,
											{ type: SourceEnum.inventory, index: i },
											e,
										)}
								>
									{#if item}
										<img src={item?.Icon_path} alt={$_(item?.Name ?? "")} />
									{/if}
								</div>
							{/each}
						</div>
					</div>

					<div
						class="flex flex-col gap-4 min-w-2/12 border-t md:border-t-0 pt-4 md:pt-0 md:pl-4"
					>
						<!-- Desktop Layout -->
						<div class="hidden md:flex flex-col items-center gap-4">
							<div class="flex flex-row gap-2">
								<!-- Slot 1 -->
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									data-refine="1"
									class="w-18 h-18 border flex items-center justify-center transition-shadow
                  {dragStore.refineSlot1 ? 'cursor-grab' : ''}
                  {dragStore.drag_item ? drag_indicator : ''}"
									ondragstart={(e) =>
										drag_start(
											dragStore.refineSlot1,
											{ type: SourceEnum.refine, slot: 1 },
											e,
										)}
									ondragend={drag_end}
									ondragover={drag_over}
									ondrop={(_) =>
										on_drop(dragStore.drag_item, {
											type: SourceEnum.refine,
											slot: 1,
										})}
									onfocus={() => on_hover(dragStore.refineSlot1)}
									onmouseover={() => on_hover(dragStore.refineSlot1)}
									onmouseleave={() => stop_hover()}
									ontouchstart={(e) =>
										touch_start(
											dragStore.refineSlot1,
											{ type: SourceEnum.refine, slot: 1 },
											e,
										)}
								>
									{#if dragStore.refineSlot1}
										<img
											src={dragStore.refineSlot1.Icon_path}
											alt={$_(dragStore.refineSlot1.Name)}
										/>
									{/if}
								</div>

								<span class="text-xl content-center">+</span>

								<!-- Slot 2 -->
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									class="w-18 h-18 border flex items-center justify-center transition-shadow
                  {dragStore.refineSlot2 ? 'cursor-grab' : ''}
                  {dragStore.drag_item ? drag_indicator : ''}"
									data-refine="2"
									ondragstart={(e) =>
										drag_start(
											dragStore.refineSlot2,
											{ type: SourceEnum.refine, slot: 2 },
											e,
										)}
									ondragend={drag_end}
									ondragover={drag_over}
									onfocus={() => on_hover(dragStore.refineSlot2)}
									onmouseover={() => on_hover(dragStore.refineSlot2)}
									onmouseleave={() => stop_hover()}
									ondrop={(_) =>
										on_drop(dragStore.drag_item, {
											type: SourceEnum.refine,
											slot: 2,
										})}
									ontouchstart={(e) =>
										touch_start(
											dragStore.refineSlot1,
											{ type: SourceEnum.refine, slot: 2 },
											e,
										)}
								>
									{#if dragStore.refineSlot2}
										<img
											src={dragStore.refineSlot2.Icon_path}
											alt={$_(dragStore.refineSlot2.Name)}
										/>
									{/if}
								</div>
							</div>

							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="w-18 h-18 border flex items-center justify-center
                {dragStore.refineResult ? 'cursor-grab' : ''}
                "
								ondragstart={(e) =>
									drag_start(
										dragStore.refineResult,
										{ type: SourceEnum.refine, slot: 3 },
										e,
									)}
								ondragend={drag_end}
								onfocus={() => on_hover(dragStore.refineResult)}
								onmouseover={() => on_hover(dragStore.refineResult)}
								onmouseleave={() => stop_hover()}
							>
								{#if dragStore.refineResult}
									<img
										src={dragStore.refineResult.Icon_path}
										alt={$_(dragStore.refineResult.Name)}
									/>
								{/if}
							</div>

							<button class="border w-6/12 mt-2">Refine</button>
						</div>

						<!-- Mobile Layout -->
						<div class="flex md:hidden flex-row items-center gap-2">
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								data-refine="1"
								class="w-14 h-14 border flex items-center justify-center transition-shadow {dragStore.drag_item
									? drag_indicator
									: ''}"
								ondragstart={(e) =>
									drag_start(
										dragStore.refineSlot1,
										{ type: SourceEnum.refine, slot: 1 },
										e,
									)}
								ondragover={drag_over}
								ondrop={(_) =>
									on_drop(dragStore.drag_item, {
										type: SourceEnum.refine,
										slot: 1,
									})}
								ondragend={drag_end}
								ontouchstart={(e) =>
									touch_start(
										dragStore.refineSlot1,
										{ type: SourceEnum.refine, slot: 1 },
										e,
									)}
							>
								{#if dragStore.refineSlot1}
									<img
										src={dragStore.refineSlot1.Icon_path}
										alt={$_(dragStore.refineSlot1.Name)}
									/>
								{/if}
							</div>

							<span class="text-xl">+</span>
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="w-14 h-14 border flex items-center justify-center transition-shadow {dragStore.drag_item
									? drag_indicator
									: ''}"
								ondragstart={(e) =>
									drag_start(
										dragStore.refineSlot2,
										{ type: SourceEnum.refine, slot: 2 },
										e,
									)}
								data-refine="2"
								ondragover={drag_over}
								ondragend={drag_end}
								ondrop={(_) =>
									on_drop(dragStore.drag_item, {
										type: SourceEnum.refine,
										slot: 2,
									})}
								ontouchstart={(e) =>
									touch_start(
										dragStore.refineSlot2,
										{ type: SourceEnum.refine, slot: 2 },
										e,
									)}
							>
								{#if dragStore.refineSlot2}
									<img
										src={dragStore.refineSlot2.Icon_path}
										alt={$_(dragStore.refineSlot2.Name)}
									/>
								{/if}
							</div>

							<span class="text-xl">→</span>

							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="w-14 h-14 border flex items-center justify-center border-green-400"
								ondragstart={(e) =>
									drag_start(
										dragStore.refineResult,
										{ type: SourceEnum.refine, slot: 3 },
										e,
									)}
								ondragend={drag_end}
								ontouchstart={(e) =>
									touch_start(
										dragStore.refineResult,
										{ type: SourceEnum.refine, slot: 3 },
										e,
									)}
							>
								{#if dragStore.refineResult}
									<img
										src={dragStore.refineResult.Icon_path}
										alt={$_(dragStore.refineResult.Name)}
									/>
								{/if}
							</div>

							<button class="border ml-auto">Refine</button>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
