import { Decimal } from "../utils/BreakInfinity/Decimal.svelte";
import { MultiplierType } from "../utils/Multipliers";
import type { ReactiveText } from "../utils/ReactiveText.svelte";
import { Inventory } from "./Inventory.svelte";

export enum ItemsEnum {
  GreenPendant
}

export enum ItemType {
  Head = 0,
  Robes = 1,
  Boots = 2,
  Amulet = 3,
  Ring1 = 4,
  Ring2 = 5,
  Accessory1 = 6,
  Accessory2 = 7,
  Book = 8,
  Wand = 9,
}

//TODO: Mechanic idea links 
// Each items have links 
// each links links the item with other linked items 
// giving them a boost 
// Links can be elemental 
// Links can be obtained by trashing level 100 items of that specific category 
// Use chromatic orb to change the element of an item Or Cleansing orb to remove the elemnt of an item 
// Elemental items boost other 
//
// TODO: Other mechanic: Attunement
// Each item can have attunement 
// whihc is like poe's color sockets 
// where attuned items will get special bonuses from your elements 
// Attuned stat can be increased in colros
// like 
// Attunement can also support many stats
// But ofc it's going to be very expensive to max attune an item
// Armor: attuned to fire 
// Fire grants attack attuenment 
export interface InventoryItem {
  Name: string;
  Icon_path: string;
  ItemEnum: ItemsEnum;
  Level: number;
  Description: string;
  Links: number;
  ApplyEffect: (inventory: Inventory) => void;
  Remove: (inventory: Inventory) => void;
}

export abstract class ItemBase implements InventoryItem {
  public abstract Name: string;
  public abstract ItemEnum: ItemsEnum;
  public abstract Icon_path: string;
  public abstract Level: number;
  public abstract Description: string;
  public abstract ApplyEffect(inventory: Inventory): void;
  public abstract Remove(inventory: Inventory): void;
  public Links: number = 0;
  private _inventory: Inventory;
  public EffectText: Map<string, ReactiveText> = new Map();

  constructor(inventory: Inventory) {
    this._inventory = inventory;
  }

  public OnEquip() {
    this.ApplyEffect(this._inventory);
  }

  public OnRemove() {
    this.Remove(this._inventory);
  }
}

class GreenPendant extends ItemBase {
  Name = "items.green_pendant.name";
  ItemEnum = ItemsEnum.GreenPendant;
  Icon_path = "/items/green_pendant.png";
  Level = $state(0);
  Description = "items.green_pendant.description";

  EffectText() {

  }

  ApplyEffect(inventory: Inventory) {
    const _self = this;
    inventory.DamageMultiplier.Set(ItemType.Amulet.toString(), {
      priority: ItemType.Amulet,
      value(): Decimal {
        return new Decimal(_self.Level);
      },
      type: MultiplierType.Additive
    });
  }

  Remove(inventory: Inventory) {
    inventory.DamageMultiplier.Remove(ItemType.Amulet.toString());
  }
}

const ItemsRepository: Record<ItemsEnum, new (inventory: Inventory) => ItemBase> = {
  [ItemsEnum.GreenPendant]: GreenPendant,
};

export function BuildItem(inventory: Inventory, item: ItemsEnum): ItemBase {
  return new ItemsRepository[item](inventory);
}
