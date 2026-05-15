import { ItemBase, ItemType } from "$lib/engine/Inventory/InventoryRepo.svelte";
import { Game } from "$lib/stores.svelte";

export enum SourceEnum { inventory, equipment, crafting }
type Source =
  | { type: SourceEnum.inventory; index: number }
  | { type: SourceEnum.equipment; slot: ItemType }
  | { type: SourceEnum.crafting; slot: number };

export const dragStore = $state<{
  drag_item: { item: ItemBase, source: Source } | null;
  hover_item: ItemBase | null;

  craftingSlot1: ItemBase | null;
  craftingSlot2: ItemBase | null;
  craftingResult: ItemBase | null;
}>({
  drag_item: null,
  hover_item: null,

  craftingSlot1: null,
  craftingSlot2: null,
  craftingResult: null
});

export function canEquip(item: any, slot: ItemType): boolean {
  if (!item) return false;
  if (item.ItemType === slot) return true;
  if (item.ItemType === ItemType.Ring1 && slot >= ItemType.Ring1 && slot <= ItemType.Ring3) return true;
  if (item.ItemType === ItemType.Accessory1 && slot >= ItemType.Accessory1 && slot <= ItemType.Accessory3) return true;

  return false;
}

export function drag_start(item: ItemBase | null, source: Source, e?: DragEvent) {
  if (!item) return;

  dragStore.drag_item = { item, source };
}

export function on_drop(drag_item: { item: ItemBase, source: Source } | null, self: Source) {
  if (!drag_item) return;

  switch (self.type) {

    case SourceEnum.inventory: {
      const targetItem = Game.Inventory.Get(self.index);

      if (drag_item.source.type === SourceEnum.inventory) {
        if (targetItem) {
          Game.Inventory.Set(drag_item.source.index, targetItem);
          Game.Inventory.Set(self.index, drag_item.item);
        } else {
          Game.Inventory.Set(self.index, drag_item.item);
          Game.Inventory.RemoveItem(drag_item.source.index);
        }

      } else if (drag_item.source.type === SourceEnum.equipment) {
        const equipSlot = drag_item.source.slot;
        if (targetItem && canEquip(targetItem, equipSlot)) {
          Game.Inventory.UnequipItem(equipSlot);
          Game.Inventory.Equipment[equipSlot] = targetItem;
          targetItem.OnEquip();
          Game.Inventory.Set(self.index, drag_item.item);
        } else if (!targetItem) {
          Game.Inventory.UnequipItem(equipSlot);
          Game.Inventory.Set(self.index, drag_item.item);
        }

      } else if (drag_item.source.type === SourceEnum.crafting) {
        const { slot: craftingSlot } = drag_item.source;
        if (targetItem) {
          Game.Inventory.Set(self.index, drag_item.item);
          setcraftingSlot(craftingSlot, targetItem);
        } else {
          Game.Inventory.Set(self.index, drag_item.item);
          setcraftingSlot(craftingSlot, null);
        }
      }
      break;
    }

    case SourceEnum.equipment: {
      const targetSlot = self.slot;

      if (drag_item.source.type === SourceEnum.inventory) {
        if (!canEquip(drag_item.item, targetSlot)) break;
        Game.Inventory.RemoveItem(drag_item.source.index);
        Game.Inventory.EquipItem(targetSlot, drag_item.item);

      } else if (drag_item.source.type === SourceEnum.crafting) {
        if (!canEquip(drag_item.item, targetSlot)) break;
        Game.Inventory.EquipItem(targetSlot, drag_item.item);
        setcraftingSlot(drag_item.source.slot, null);

      } else if (drag_item.source.type === SourceEnum.equipment) {
        const sourceSlot = drag_item.source.slot;
        if (sourceSlot === targetSlot) break;
        const isRing = (s: ItemType) => s >= ItemType.Ring1 && s <= ItemType.Ring3;
        const isAccessory = (s: ItemType) => s >= ItemType.Accessory1 && s <= ItemType.Accessory3;
        const sameGroup = (isRing(sourceSlot) && isRing(targetSlot)) ||
          (isAccessory(sourceSlot) && isAccessory(targetSlot));
        if (!sameGroup) break;

        const sourceItem = Game.Inventory.UnequipItem(sourceSlot);
        const targetItem = Game.Inventory.UnequipItem(targetSlot);
        if (sourceItem) {
          Game.Inventory.Equipment[targetSlot] = sourceItem;
          sourceItem.OnEquip();
        }
        if (targetItem) {
          Game.Inventory.Equipment[sourceSlot] = targetItem;
          targetItem.OnEquip();
        }
      }
      break;
    }

    case SourceEnum.crafting: {
      const targetcraftingSlot = self.slot;
      const currentIncrafting = getcraftingSlot(targetcraftingSlot);

      if (drag_item.source.type === SourceEnum.inventory) {
        setcraftingSlot(targetcraftingSlot, drag_item.item);
        if (currentIncrafting) {
          Game.Inventory.Set(drag_item.source.index, currentIncrafting);
        } else {
          Game.Inventory.RemoveItem(drag_item.source.index);
        }

      } else if (drag_item.source.type === SourceEnum.equipment) {
        const equipSlot = drag_item.source.slot;
        Game.Inventory.UnequipItem(equipSlot);
        setcraftingSlot(targetcraftingSlot, drag_item.item);
        if (currentIncrafting && canEquip(currentIncrafting, equipSlot)) {
          Game.Inventory.Equipment[equipSlot] = currentIncrafting;
          currentIncrafting.OnEquip();
        } else if (currentIncrafting) {
          Game.Inventory.GiveItem(currentIncrafting.ItemEnum);
        }

      } else if (drag_item.source.type === SourceEnum.crafting) {
        if (drag_item.source.slot === targetcraftingSlot) break;
        setcraftingSlot(targetcraftingSlot, drag_item.item);
        setcraftingSlot(drag_item.source.slot, currentIncrafting);
      }
      break;
    }
  }

  dragStore.drag_item = null;
}

// using non zero indexing because im evil hehe
function getcraftingSlot(slot: number): ItemBase | null {
  return slot === 1 ? dragStore.craftingSlot1 : dragStore.craftingSlot2;
}

function setcraftingSlot(slot: number, item: ItemBase | null) {
  if (slot === 1) dragStore.craftingSlot1 = item;
  else dragStore.craftingSlot2 = item;
}
export function drag_over(e: DragEvent) {
  e.preventDefault();
}

export function touch_start(
  item: ItemBase | null,
  source: Source,
  e: TouchEvent,
) {
  if (!item) return;

  dragStore.drag_item = { item, source };
  dragStore.hover_item = item;

  document.addEventListener("touchend", _touch_end, { once: true });

  e.preventDefault();
}

function _touch_end(e: TouchEvent) {
  if (!dragStore.drag_item) return;

  dragStore.hover_item = null;

  const touch = e.changedTouches[0];
  const el = document.elementFromPoint(
    touch.clientX,
    touch.clientY,
  ) as HTMLElement | null;

  const dropTarget = el?.closest<HTMLElement>(
    "[data-inventory],[data-slot],[data-crafting]",
  );

  if (!dropTarget) {
    drag_end()
    return;
  }

  const { inventory, slot, crafting } = dropTarget.dataset;
  let targetSource: Source | null = null;

  if (inventory !== undefined) targetSource = { type: SourceEnum.inventory, index: +inventory };
  else if (slot !== undefined) targetSource = { type: SourceEnum.equipment, slot: +slot as ItemType };
  else if (crafting !== undefined) targetSource = { type: SourceEnum.crafting, slot: +crafting };

  if (targetSource) on_drop(dragStore.drag_item, targetSource);
  else drag_end()
}

export function lockScrollWhileDragging(node: HTMLElement) {
  const handler = (e: TouchEvent) => {
    if (dragStore.drag_item) e.preventDefault();
  };
  node.addEventListener("touchmove", handler, { passive: false });
  return { destroy() { node.removeEventListener("touchmove", handler); } };
}

export function drag_end() {
  dragStore.drag_item = null;
}

export function on_hover(item: ItemBase | null) {
  dragStore.hover_item = item;
}

export function stop_hover() {
  dragStore.hover_item = null;
}
