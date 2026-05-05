<script lang="ts">
	import { Game } from "$lib/engine/stores.svelte";
	import { _ } from "svelte-i18n";
	import {
		dragStore,
		handleDragEnd,
		handleInventoryDragLeave,
		handleInventoryDragOver,
		handleInventoryDragStart,
		handleInventoryDrop,
		handleTouchEnd,
		handleTouchMove,
		handleTouchStart,
	} from "./dragging.svelte";

	let is_open = $state(true);

	let dragOverInventoryIndex = $state(dragStore.dragOverInventoryIndex);
</script>

<div class="border border-t-0">
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
					{#each Game.Inventory.GetAll() as item, i}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							data-inventory={i}
							class="w-14 h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 2xl:w-20 2xl:h-20 border flex items-center justify-center transition-shadow {dragOverInventoryIndex ===
							i
								? 'ring-2 ring-blue-400 shadow-lg shadow-blue-400/50'
								: ''}"
							draggable={item !== null}
							ondragstart={(e) => handleInventoryDragStart(e, i, item)}
							ondragend={handleDragEnd}
							ondragover={(e) => handleInventoryDragOver(e, i)}
							ondragleave={handleInventoryDragLeave}
							ondrop={(e) => handleInventoryDrop(e, i)}
							ontouchstart={(e) => handleTouchStart(e, i, item)}
							ontouchmove={(e) => handleTouchMove(e)}
							ontouchend={(e) => handleTouchEnd(e)}
						>
							{#if item}
								<img src={item?.Icon_path} alt={$_(item?.Name ?? "")} />
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
