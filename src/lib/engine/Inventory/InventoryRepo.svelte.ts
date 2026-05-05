import { SvelteMap } from "svelte/reactivity";
import { Decimal } from "../utils/BreakInfinity/Decimal.svelte";
import { MultiplierType, type Multiplier } from "../utils/Multipliers.svelte";
import { ReactiveText } from "../utils/ReactiveText.svelte";
import { EquipmentEffect, Inventory } from "./Inventory.svelte";

export enum ItemsEnum {
  BrokenPendant
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
  Mark = 8,
  Gun = 9,
  Other,
}

// TODO: Add colors when these elements are added
enum Color {
  Base = "text-white",
  Red = "", // fire
  Blue = "", // Water
  Green = "", // Earth
  Gray = "", // Air
  Purple = "", // Space  
}

export abstract class ItemBase {
  public abstract Name: string;
  public abstract ItemEnum: ItemsEnum;
  public abstract Icon_path: string;
  public abstract Level: number;
  public abstract Description: string;
  protected _inventory: Inventory;
  public Effects: SvelteMap<EquipmentEffect, Substats> = new SvelteMap();
  public readonly LevelCap = 100;
  public ItemType: ItemType = ItemType.Other;

  constructor(inventory: Inventory) {
    this._inventory = inventory;
  }

  public OnEquip() {
    this.Effects.forEach((value, key) => {
      this._inventory.EquipmentMultiplier[key].Set(value.EquipmentEffect.toString(), {
        priority: this.ItemType as number,
        value: () => {
          return value.Effect(this._inventory, value);
        },
        type: MultiplierType.Additive
      });
    })
  }

  public OnRemove() {
    this.Effects.forEach((value, key) => {
      this._inventory.EquipmentMultiplier[key].Remove(value.EquipmentEffect.toString());
    })
  }
}

interface SubstatText {
  Color: string;
  Text: ReactiveText;
}

class Substats {
  public EquipmentEffect: EquipmentEffect;
  public get View(): SubstatText {
    return {
      Color: this.Color.toString(),
      Text: new ReactiveText(this.EquipmentEffect.toString(), ` (${this.AllocateStart}/${this.AllocationTarget}) - ${this.Effect(this._inventory, this).format()}x ${(this.AllocateStart / this.AllocateEnd) == 1 ? '(Capped)' : ''}`)
    }
  }

  public Color: Color;
  private _links = 0;
  public get Links() { return this._links; }
  public set Links(val) { this._links = Math.min(this._links + val, this.LinkCap); }

  public LinkCap: number = 6;
  public AllocateStart: number = 0;
  public AllocationTarget: number;
  public get AllocateEnd() { return this.AllocationTarget * (this.parent.Level / this.parent.LevelCap) }
  public AllocateStat(val: number) { this.AllocateStart += val; }

  public Effect: (inventory: Inventory, stat: Substats) => Decimal;
  protected _inventory: Inventory;
  protected parent: ItemBase;

  constructor(parent: ItemBase, inventory: Inventory, config: SubstatConfig) {
    this.parent = parent;
    this._inventory = inventory;

    this.Effect = config.Effect;
    this.Color = config.Color;
    this.AllocationTarget = config.AllocationTarget;
    this.EquipmentEffect = $state(config.EquipmentEffect);
  }

  public ApplyEffect(multiplier: Multiplier) {
    this._inventory.EquipmentMultiplier[this.EquipmentEffect].Set(this.parent.ItemEnum.toString(), multiplier);
  }

  public RemoveEffect() {
    this._inventory.EquipmentMultiplier[this.EquipmentEffect].Remove(this.parent.ItemEnum.toString());
  }
}

interface SubstatConfig {
  Effect: (inventory: Inventory, stat: Substats) => Decimal;
  AllocationTarget: number;
  EquipmentEffect: EquipmentEffect;
  Color: Color;
  LinkCap: number;
}

class BrokenPendant extends ItemBase {
  Name = "items.broken_pendant.name";
  ItemEnum = ItemsEnum.BrokenPendant;
  Icon_path = "/items/brokenpendant.png";
  Level = $state(1);
  Description = "items.broken_pendant.description";

  constructor(inventory: Inventory) {
    super(inventory);

    this.Effects.set(EquipmentEffect.Damage, new Substats(this, this._inventory, {
      Effect: (inventory: Inventory, stat: Substats): Decimal => {
        return new Decimal(1.5).mul(this.Level / this.LevelCap).mul(stat.Links + 1).plus(1);
      },
      AllocationTarget: 10,
      EquipmentEffect: EquipmentEffect.Damage,
      Color: Color.Base,
      LinkCap: 6
    }));

    this.Effects.set(EquipmentEffect.Defence, new Substats(this, this._inventory, {
      Effect: (inventory: Inventory, stat: Substats): Decimal => {
        return new Decimal(1.5).mul(this.Level / this.LevelCap).mul(stat.Links + 1).plus(1);
      },
      AllocationTarget: 10,
      EquipmentEffect: EquipmentEffect.Defence,
      Color: Color.Base,
      LinkCap: 6
    }))

  }
}

export const ItemsRepository: Record<ItemsEnum, (inventory: Inventory) => ItemBase> = {
  [ItemsEnum.BrokenPendant]: (inventory) => new BrokenPendant(inventory),
};
