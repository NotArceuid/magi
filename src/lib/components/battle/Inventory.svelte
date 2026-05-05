<script lang="ts">
	import { ItemType } from "$lib/engine/Inventory/InventoryRepo.svelte";
	import { Game } from "$lib/engine/stores.svelte";
	import { _ } from "svelte-i18n";

	let equipment_label = [
		{ label: "Head", key: ItemType.Head },
		{ label: "Robes", key: ItemType.Vest },
		{ label: "Boots", key: ItemType.Boots },
		{ label: "Seal", key: ItemType.Seal },
		{ label: "Gun", key: ItemType.Gun },
		{ label: "Amulet", key: ItemType.Amulet },
		{ label: "Ring", key: ItemType.Ring1 },
		{ label: "Ring", key: ItemType.Ring2 },
		{ label: "Ring", key: ItemType.Ring3 },
		{ label: "Accessory", key: ItemType.Accessory1 },
		{ label: "Accessory", key: ItemType.Accessory2 },
		{ label: "Accessory", key: ItemType.Accessory3 },
	];

	let is_open = $state(true);
	let draggedItem = $state<{
		index: number;
		item: any;
		sourceSlot?: ItemType;
	} | null>(null);

	let dragOverSlot = $state<ItemType | null>(null);
	let dragOverInventoryIndex = $state<number | null>(null);
	let touchClone = $state<HTMLElement | null>(null);
	let touchStartX = $state(0);
	let touchStartY = $state(0);

	function canEquip(item: any, slot: ItemType): boolean {
		if (!item) return false;
		if (item.ItemType === slot) return true;
		if (
			item.ItemType === ItemType.Ring1 &&
			slot >= ItemType.Ring1 &&
			slot <= ItemType.Ring3
		)
			return true;
		if (
			item.ItemType === ItemType.Accessory1 &&
			slot >= ItemType.Accessory1 &&
			slot <= ItemType.Accessory3
		)
			return true;
		return false;
	}

	function handleInventoryDragStart(e: DragEvent, index: number, item: any) {
		if (!item) return;

		draggedItem = { index, item };
		e.dataTransfer!.effectAllowed = "move";
	}

	function handleEquipmentDragStart(e: DragEvent, slot: ItemType, item: any) {
		if (!item) return;
		draggedItem = { index: -1, item, sourceSlot: slot };
		e.dataTransfer!.effectAllowed = "move";
	}

	function handleDragEnd() {
		draggedItem = null;
		dragOverSlot = null;
		dragOverInventoryIndex = null;
		removeTouchClone();
	}

	function handleSlotDragOver(e: DragEvent, slot: ItemType) {
		e.preventDefault();
		if (draggedItem && canEquip(draggedItem.item, slot)) {
			e.dataTransfer!.dropEffect = "move";
			dragOverSlot = slot;
		} else {
			e.dataTransfer!.dropEffect = "none";
		}
	}

	function handleSlotDragLeave() {
		dragOverSlot = null;
	}

	function handleSlotDrop(e: DragEvent, slot: ItemType) {
		e.preventDefault();
		if (!draggedItem || !canEquip(draggedItem.item, slot)) return;

		const item = draggedItem.item;

		if (draggedItem.sourceSlot !== undefined) {
			const sourceSlot = draggedItem.sourceSlot;
			const targetItem = Game.Inventory.Equipment[slot];

			Game.Inventory.Equipment[sourceSlot] = targetItem || undefined;
			Game.Inventory.Equipment[slot] = item;

			item.OnRemove?.();
			item.OnEquip?.();

			if (targetItem) {
				targetItem.OnRemove?.();
				targetItem.OnEquip?.();
			}
		} else {
			const targetItem = Game.Inventory.Equipment[slot];

			if (targetItem) {
				Game.Inventory.Set(draggedItem.index, targetItem);
				targetItem.OnRemove?.();
			} else {
				Game.Inventory.RemoveItem(draggedItem.index);
			}

			Game.Inventory.Equipment[slot] = item;
			item.OnEquip?.();
		}

		draggedItem = null;
		dragOverSlot = null;
	}

	function handleInventoryDragOver(e: DragEvent, index: number) {
		e.preventDefault();
		e.dataTransfer!.dropEffect = "move";
		dragOverInventoryIndex = index;
	}

	function handleInventoryDragLeave() {
		dragOverInventoryIndex = null;
	}

	function handleInventoryDrop(e: DragEvent, index: number) {
		e.preventDefault();
		if (!draggedItem) return;

		if (draggedItem.sourceSlot !== undefined) {
			const item = draggedItem.item;
			const targetItem = Game.Inventory.Get(index);

			Game.Inventory.Equipment[draggedItem.sourceSlot] =
				targetItem || undefined;
			Game.Inventory.Set(index, item);

			item.OnRemove?.();

			if (targetItem) targetItem.OnEquip?.();
		} else {
			const ori_item = Game.Inventory.Get(index);
			const dragged_item = Game.Inventory.Get(draggedItem.index);

			Game.Inventory.Set(index, dragged_item!);
			Game.Inventory.Set(draggedItem.index, ori_item!);
		}

		draggedItem = null;
		dragOverInventoryIndex = null;
	}

	function removeTouchClone() {
		if (touchClone) {
			touchClone.remove();
			touchClone = null;
		}
	}

	function handleTouchStart(
		e: TouchEvent,
		index: number,
		item: any,
		sourceSlot?: ItemType,
	) {
		if (!item) return;

		const touch = e.touches[0];
		touchStartX = touch.clientX;
		touchStartY = touch.clientY;

		draggedItem = { index, item, sourceSlot };

		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();

		touchClone = target.cloneNode(true) as HTMLElement;
		touchClone.style.position = "fixed";
		touchClone.style.left = rect.left + "px";
		touchClone.style.top = rect.top + "px";
		touchClone.style.width = rect.width + "px";
		touchClone.style.height = rect.height + "px";
		touchClone.style.pointerEvents = "none";
		touchClone.style.zIndex = "1000";
		touchClone.style.opacity = "0.8";
		document.body.appendChild(touchClone);

		e.preventDefault();
	}

	function handleTouchMove(e: TouchEvent) {
		if (!draggedItem || !touchClone) return;

		const touch = e.touches[0];
		const dx = touch.clientX - touchStartX;
		const dy = touch.clientY - touchStartY;

		if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
			e.preventDefault();
		}

		touchClone.style.left = touch.clientX - touchClone.offsetWidth / 2 + "px";
		touchClone.style.top = touch.clientY - touchClone.offsetHeight / 2 + "px";

		const elementBelow = document.elementFromPoint(
			touch.clientX,
			touch.clientY,
		);
		dragOverSlot = null;
		dragOverInventoryIndex = null;

		if (elementBelow) {
			const slotDiv = elementBelow.closest("[data-slot]");
			const inventoryDiv = elementBelow.closest("[data-inventory]");

			if (slotDiv) {
				const slotType = parseInt(slotDiv.getAttribute("data-slot")!);
				if (canEquip(draggedItem.item, slotType)) {
					dragOverSlot = slotType;
				}
			} else if (inventoryDiv) {
				const index = parseInt(inventoryDiv.getAttribute("data-inventory")!);
				dragOverInventoryIndex = index;
			}
		}
	}

	function handleTouchEnd(e: TouchEvent) {
		if (!draggedItem) return;

		const touch = e.changedTouches[0];
		const elementBelow = document.elementFromPoint(
			touch.clientX,
			touch.clientY,
		);

		if (elementBelow) {
			const slotDiv = elementBelow.closest("[data-slot]");
			const inventoryDiv = elementBelow.closest("[data-inventory]");

			if (slotDiv) {
				const slotType = parseInt(
					slotDiv.getAttribute("data-slot")!,
				) as ItemType;
				if (canEquip(draggedItem.item, slotType)) {
					const item = draggedItem.item;

					if (draggedItem.sourceSlot !== undefined) {
						const sourceSlot = draggedItem.sourceSlot;
						const targetItem = Game.Inventory.Equipment[slotType];

						Game.Inventory.Equipment[sourceSlot] = targetItem || undefined;
						Game.Inventory.Equipment[slotType] = item;

						item.OnRemove?.();
						item.OnEquip?.();

						if (targetItem) {
							targetItem.OnRemove?.();
							targetItem.OnEquip?.();
						}
					} else {
						const targetItem = Game.Inventory.Equipment[slotType];

						if (targetItem) {
							Game.Inventory.Set(draggedItem.index, targetItem);
							targetItem.OnRemove?.();
						} else {
							Game.Inventory.RemoveItem(draggedItem.index);
						}

						Game.Inventory.Equipment[slotType] = item;
						item.OnEquip?.();
					}
				}
			} else if (inventoryDiv) {
				const index = parseInt(inventoryDiv.getAttribute("data-inventory")!);

				if (draggedItem.sourceSlot !== undefined) {
					const item = draggedItem.item;
					const targetItem = Game.Inventory.Get(index);

					Game.Inventory.Equipment[draggedItem.sourceSlot] =
						targetItem || undefined;
					Game.Inventory.Set(index, item);

					item.OnRemove?.();

					if (targetItem) targetItem.OnEquip?.();
				} else {
					const ori_item = Game.Inventory.Get(index);
					const dragged_item = Game.Inventory.Get(draggedItem.index);

					Game.Inventory.Set(index, dragged_item!);
					Game.Inventory.Set(draggedItem.index, ori_item!);
				}
			}
		}

		removeTouchClone();
		draggedItem = null;
		dragOverSlot = null;
		dragOverInventoryIndex = null;
	}
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
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							data-slot={slot.key}
							class="w-14 h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 2xl:w-20 2xl:h-20 border shrink-0 flex items-center justify-center transition-shadow {dragOverSlot ===
							slot.key
								? 'ring-2 ring-blue-400 shadow-lg shadow-blue-400/50'
								: ''}"
							draggable={Game.Inventory.Equipment[slot.key] !== undefined}
							ondragstart={(e) =>
								handleEquipmentDragStart(
									e,
									slot.key,
									Game.Inventory.Equipment[slot.key],
								)}
							ondragend={handleDragEnd}
							ondragover={(e) => handleSlotDragOver(e, slot.key)}
							ondragleave={handleSlotDragLeave}
							ondrop={(e) => handleSlotDrop(e, slot.key)}
							ontouchstart={(e) =>
								handleTouchStart(
									e,
									-1,
									Game.Inventory.Equipment[slot.key],
									slot.key,
								)}
							ontouchmove={(e) => handleTouchMove(e)}
							ontouchend={(e) => handleTouchEnd(e)}
						>
							{#if Game.Inventory.Equipment[slot.key]}
								<img
									src={Game.Inventory.Equipment[slot.key]?.Icon_path}
									alt={$_(Game.Inventory.Equipment[slot.key]?.Name ?? "")}
								/>
							{:else}
								<span class="text-md text-gray-400"></span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}
