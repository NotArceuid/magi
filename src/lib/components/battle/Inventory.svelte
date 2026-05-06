<script lang="ts">
	import { Game } from "$lib/engine/stores.svelte";
	import { _ } from "svelte-i18n";
	import {
		drag_end,
		drag_over,
		drag_start,
		dragStore,
		lockScrollWhileDragging,
		on_drop,
		SourceEnum,
		touch_start,
	} from "./dragging.svelte";

	let is_open = $state(true);
	let drag_indicator = "ring-1 ring-gray-400 shadow-lg shadow-blue-400/30";
</script>

<div class="border border-t-0 h-full min-h-0 flex flex-col">
	<button
		class="w-full text-base p-0 m-0"
		onclick={() => {
			is_open = !is_open;
		}}
	>
		x
	</button>
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
              {dragStore.drag_item ? drag_indicator : ''}
              "
							use:lockScrollWhileDragging
							draggable={item !== null}
							ondragstart={(e) =>
								drag_start(item, { type: SourceEnum.inventory, index: i }, e)}
							ondragover={drag_over}
							ondragend={drag_end}
							ontouchend={drag_end}
							ondrop={(_) =>
								on_drop(dragStore.drag_item, {
									type: SourceEnum.inventory,
									index: i,
								})}
							ontouchstart={(e) =>
								touch_start(item, { type: SourceEnum.inventory, index: i }, e)}
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
							class="w-18 h-18 border flex items-center justify-center transition-shadow {dragStore.drag_item
								? drag_indicator
								: ''}"
							ondragstart={(e) =>
								drag_start(
									dragStore.refineSlot1,
									{ type: SourceEnum.refine, slot: 1 },
									e,
								)}
							ondragend={drag_end}
							ontouchend={drag_end}
							ondragover={drag_over}
							ondrop={(_) =>
								on_drop(dragStore.drag_item, {
									type: SourceEnum.refine,
									slot: 1,
								})}
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
							class="w-18 h-18 border flex items-center justify-center transition-shadow {dragStore.drag_item
								? drag_indicator
								: ''}"
							ondragstart={(e) =>
								drag_start(
									dragStore.refineSlot2,
									{ type: SourceEnum.refine, slot: 2 },
									e,
								)}
							ondragend={drag_end}
							ontouchend={drag_end}
							ondragover={drag_over}
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
						class="w-18 h-18 border flex items-center justify-center"
						ondragstart={(e) =>
							drag_start(
								dragStore.refineResult,
								{ type: SourceEnum.refine, slot: 3 },
								e,
							)}
						ondragend={drag_end}
						ontouchend={drag_end}
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
						ontouchend={drag_end}
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

					<span class="text-xl">→</span>
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
						ondragover={drag_over}
						ondragend={drag_end}
						ontouchend={drag_end}
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
						ontouchend={drag_end}
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
