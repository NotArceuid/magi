import { ItemBase, ItemType } from "$lib/engine/Inventory/InventoryRepo.svelte";
import { Game } from "$lib/engine/stores.svelte";

export enum SourceEnum { inventory, equipment, refine }
type Source =
  | { type: SourceEnum.inventory; index: number }
  | { type: SourceEnum.equipment; slot: ItemType }
  | { type: SourceEnum.refine; slot: number };

export const dragStore = $state<{
  drag_item: { item: ItemBase, source: Source } | null;

  refineSlot1: ItemBase | null;
  refineSlot2: ItemBase | null;
  refineResult: ItemBase | null;
}>({
  drag_item: null,

  refineSlot1: null,
  refineSlot2: null,
  refineResult: null
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

      } else if (drag_item.source.type === SourceEnum.refine) {
        const { slot: refineSlot } = drag_item.source;
        if (targetItem) {
          Game.Inventory.Set(self.index, drag_item.item);
          setRefineSlot(refineSlot, targetItem);
        } else {
          Game.Inventory.Set(self.index, drag_item.item);
          setRefineSlot(refineSlot, null);
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

      } else if (drag_item.source.type === SourceEnum.refine) {
        if (!canEquip(drag_item.item, targetSlot)) break;
        Game.Inventory.EquipItem(targetSlot, drag_item.item);
        setRefineSlot(drag_item.source.slot, null);

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

    case SourceEnum.refine: {
      const targetRefineSlot = self.slot;
      const currentInRefine = getRefineSlot(targetRefineSlot);

      if (drag_item.source.type === SourceEnum.inventory) {
        setRefineSlot(targetRefineSlot, drag_item.item);
        if (currentInRefine) {
          Game.Inventory.Set(drag_item.source.index, currentInRefine);
        } else {
          Game.Inventory.RemoveItem(drag_item.source.index);
        }

      } else if (drag_item.source.type === SourceEnum.equipment) {
        const equipSlot = drag_item.source.slot;
        Game.Inventory.UnequipItem(equipSlot);
        setRefineSlot(targetRefineSlot, drag_item.item);
        if (currentInRefine && canEquip(currentInRefine, equipSlot)) {
          Game.Inventory.Equipment[equipSlot] = currentInRefine;
          currentInRefine.OnEquip();
        } else if (currentInRefine) {
          Game.Inventory.GiveItem(currentInRefine.ItemEnum);
        }

      } else if (drag_item.source.type === SourceEnum.refine) {
        if (drag_item.source.slot === targetRefineSlot) break;
        setRefineSlot(targetRefineSlot, drag_item.item);
        setRefineSlot(drag_item.source.slot, currentInRefine);
      }
      break;
    }
  }

  dragStore.drag_item = null;
}

// using non zero indexing because im evil hehe
function getRefineSlot(slot: number): ItemBase | null {
  return slot === 1 ? dragStore.refineSlot1 : dragStore.refineSlot2;
}
function setRefineSlot(slot: number, item: ItemBase | null) {
  if (slot === 1) dragStore.refineSlot1 = item;
  else dragStore.refineSlot2 = item;
}
export function drag_over(e: DragEvent) {
  e.preventDefault();
}

let ghostEl: HTMLElement | null = null;
let touchOffsetX = 0;
let touchOffsetY = 0;

export function touch_start(
  item: ItemBase | null,
  source: Source,
  e: TouchEvent,
) {
  if (!item) return;
  dragStore.drag_item = { item, source };

  const touch = e.touches[0];
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  touchOffsetX = touch.clientX - rect.left;
  touchOffsetY = touch.clientY - rect.top;

  ghostEl = target.cloneNode(true) as HTMLElement;
  Object.assign(ghostEl.style, {
    position: "fixed",
    pointerEvents: "none",
    zIndex: "9999",
    opacity: "0.75",
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    left: `${touch.clientX - touchOffsetX}px`,
    top: `${touch.clientY - touchOffsetY}px`,
  });

  document.body.appendChild(ghostEl);
  document.addEventListener("touchmove", _touch_move, { passive: false });
  document.addEventListener("touchend", _touch_end, { once: true });

  e.preventDefault();
}

function _touch_move(e: TouchEvent) {
  if (!ghostEl) return;
  const touch = e.touches[0];
  ghostEl.style.left = `${touch.clientX - touchOffsetX}px`;
  ghostEl.style.top = `${touch.clientY - touchOffsetY}px`;
  e.preventDefault();
}

function _touch_end(e: TouchEvent) {
  ghostEl?.remove();
  ghostEl = null;
  document.removeEventListener("touchmove", _touch_move);

  if (!dragStore.drag_item) return;

  const touch = e.changedTouches[0];
  const el = document.elementFromPoint(
    touch.clientX,
    touch.clientY,
  ) as HTMLElement | null;

  const dropTarget = el?.closest<HTMLElement>(
    "[data-inventory],[data-slot],[data-refine]",
  );

  if (!dropTarget) {
    drag_end()
    return;
  }

  const { inventory, slot, refine } = dropTarget.dataset;
  let targetSource: Source | null = null;

  if (inventory !== undefined)
    targetSource = { type: SourceEnum.inventory, index: +inventory };
  else if (slot !== undefined)
    targetSource = { type: SourceEnum.equipment, slot: +slot as ItemType };
  else if (refine !== undefined)
    targetSource = { type: SourceEnum.refine, slot: +refine };

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
