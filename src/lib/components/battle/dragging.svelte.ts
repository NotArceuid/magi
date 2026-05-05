// draggin these nuts
import { ItemType } from "$lib/engine/Inventory/InventoryRepo.svelte";
import { Game } from "$lib/engine/stores.svelte";

export const dragStore = $state<{
  draggedItem: { index: number; item: any; sourceSlot?: ItemType } | null;
  dragOverSlot: ItemType | null;
  dragOverInventoryIndex: number | null;
  source: string;
  touchClone: HTMLElement | null;
  touchStartX: number;
  touchStartY: number;
}>({
  draggedItem: null,
  dragOverSlot: null,
  dragOverInventoryIndex: null,
  source: "",
  touchClone: null,
  touchStartX: 0,
  touchStartY: 0,

});

export function handleInventoryDragStart(e: DragEvent, index: number, item: any) {
  if (!item) return;

  dragStore.draggedItem = { index, item };
  e.dataTransfer!.effectAllowed = "move";
}

export function handleEquipmentDragStart(e: DragEvent, slot: ItemType, item: any) {
  if (!item) return;
  dragStore.draggedItem = { index: -1, item, sourceSlot: slot };
  e.dataTransfer!.effectAllowed = "move";
}

export function handleDragEnd() {
  dragStore.draggedItem = null;
  dragStore.dragOverSlot = null;
  dragStore.dragOverInventoryIndex = null;
  removeTouchClone();
}

export function handleSlotDragOver(e: DragEvent, slot: ItemType) {
  e.preventDefault();
  if (dragStore.draggedItem && canEquip(dragStore.draggedItem.item, slot)) {
    e.dataTransfer!.dropEffect = "move";
    dragStore.dragOverSlot = slot;
  } else {
    e.dataTransfer!.dropEffect = "none";
  }
}

export function handleSlotDragLeave() {
  dragStore.dragOverSlot = null;
}

export function handleSlotDrop(e: DragEvent, slot: ItemType) {
  e.preventDefault();
  if (!dragStore.draggedItem || !canEquip(dragStore.draggedItem.item, slot)) return;

  const item = dragStore.draggedItem.item;

  if (dragStore.draggedItem.sourceSlot !== undefined) {
    const sourceSlot = dragStore.draggedItem.sourceSlot;
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
      Game.Inventory.Set(dragStore.draggedItem.index, targetItem);
      targetItem.OnRemove?.();
    } else {
      Game.Inventory.RemoveItem(dragStore.draggedItem.index);
    }

    Game.Inventory.Equipment[slot] = item;
    item.OnEquip?.();
  }

  dragStore.draggedItem = null;
  dragStore.dragOverSlot = null;
}

export function handleInventoryDragOver(e: DragEvent, index: number) {
  e.preventDefault();
  e.dataTransfer!.dropEffect = "move";
  dragStore.dragOverInventoryIndex = index;
}

export function handleInventoryDragLeave() {
  dragStore.dragOverInventoryIndex = null;
}

export function handleInventoryDrop(e: DragEvent, index: number) {
  e.preventDefault();
  if (!dragStore.draggedItem) return;

  if (dragStore.draggedItem.sourceSlot !== undefined) {
    const item = dragStore.draggedItem.item;
    const targetItem = Game.Inventory.Get(index);

    Game.Inventory.Equipment[dragStore.draggedItem.sourceSlot] =
      targetItem || undefined;
    Game.Inventory.Set(index, item);

    item.OnRemove?.();

    if (targetItem) targetItem.OnEquip?.();
  } else {
    const ori_item = Game.Inventory.Get(index);
    const dragged_item = Game.Inventory.Get(dragStore.draggedItem.index);

    Game.Inventory.Set(index, dragged_item!);
    Game.Inventory.Set(dragStore.draggedItem.index, ori_item!);
  }

  dragStore.draggedItem = null;
  dragStore.dragOverInventoryIndex = null;
}

export function canEquip(item: any, slot: ItemType): boolean {
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

export function removeTouchClone() {
  if (dragStore.touchClone) {
    dragStore.touchClone.remove();
    dragStore.touchClone = null;
  }
}

export function handleTouchStart(
  e: TouchEvent,
  index: number,
  item: any,
  sourceSlot?: ItemType,
) {
  if (!item) return;

  const touch = e.touches[0];
  dragStore.touchStartX = touch.clientX;
  dragStore.touchStartY = touch.clientY;

  dragStore.draggedItem = { index, item, sourceSlot };

  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();

  dragStore.touchClone = target.cloneNode(true) as HTMLElement;
  dragStore.touchClone.style.position = "fixed";
  dragStore.touchClone.style.left = rect.left + "px";
  dragStore.touchClone.style.top = rect.top + "px";
  dragStore.touchClone.style.width = rect.width + "px";
  dragStore.touchClone.style.height = rect.height + "px";
  dragStore.touchClone.style.pointerEvents = "none";
  dragStore.touchClone.style.zIndex = "1000";
  dragStore.touchClone.style.opacity = "0.8";
  document.body.appendChild(dragStore.touchClone);

  e.preventDefault();
}

export function handleTouchMove(e: TouchEvent) {
  if (!dragStore.draggedItem || !dragStore.touchClone) return;

  const touch = e.touches[0];
  const dx = touch.clientX - dragStore.touchStartX;
  const dy = touch.clientY - dragStore.touchStartY;

  if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
    e.preventDefault();
  }

  dragStore.touchClone.style.left = touch.clientX - dragStore.touchClone.offsetWidth / 2 + "px";
  dragStore.touchClone.style.top = touch.clientY - dragStore.touchClone.offsetHeight / 2 + "px";

  const elementBelow = document.elementFromPoint(
    touch.clientX,
    touch.clientY,
  );
  dragStore.dragOverSlot = null;
  dragStore.dragOverInventoryIndex = null;

  if (elementBelow) {
    const slotDiv = elementBelow.closest("[data-slot]");
    const inventoryDiv = elementBelow.closest("[data-inventory]");

    if (slotDiv) {
      const slotType = parseInt(slotDiv.getAttribute("data-slot")!);
      if (canEquip(dragStore.draggedItem.item, slotType)) {
        dragStore.dragOverSlot = slotType;
      }
    } else if (inventoryDiv) {
      const index = parseInt(inventoryDiv.getAttribute("data-inventory")!);
      dragStore.dragOverInventoryIndex = index;
    }
  }
}

export function handleTouchEnd(e: TouchEvent) {
  if (!dragStore.draggedItem) return;

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
      if (canEquip(dragStore.draggedItem.item, slotType)) {
        const item = dragStore.draggedItem.item;

        if (dragStore.draggedItem.sourceSlot !== undefined) {
          const sourceSlot = dragStore.draggedItem.sourceSlot;
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
            Game.Inventory.Set(dragStore.draggedItem.index, targetItem);
            targetItem.OnRemove?.();
          } else {
            Game.Inventory.RemoveItem(dragStore.draggedItem.index);
          }

          Game.Inventory.Equipment[slotType] = item;
          item.OnEquip?.();
        }
      }
    } else if (inventoryDiv) {
      const index = parseInt(inventoryDiv.getAttribute("data-inventory")!);

      if (dragStore.draggedItem.sourceSlot !== undefined) {
        const item = dragStore.draggedItem.item;
        const targetItem = Game.Inventory.Get(index);

        Game.Inventory.Equipment[dragStore.draggedItem.sourceSlot] =
          targetItem || undefined;
        Game.Inventory.Set(index, item);

        item.OnRemove?.();

        if (targetItem) targetItem.OnEquip?.();
      } else {
        const ori_item = Game.Inventory.Get(index);
        const dragged_item = Game.Inventory.Get(dragStore.draggedItem.index);

        Game.Inventory.Set(index, dragged_item!);
        Game.Inventory.Set(dragStore.draggedItem.index, ori_item!);
      }
    }
  }

  removeTouchClone();
  dragStore.draggedItem = null;
  dragStore.dragOverSlot = null;
  dragStore.dragOverInventoryIndex = null;
}


