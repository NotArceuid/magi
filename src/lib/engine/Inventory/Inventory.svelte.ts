import type { Player } from "../Player.svelte";
import type { Saves } from "../Saves";
import { Decimal } from "../utils/BreakInfinity/Decimal.svelte";
import { MultiplierBase, MultiplierPrioritySchemeEnum, MultiplierType } from "../utils/Multipliers.svelte.ts";
import { ItemBase, ItemsEnum, ItemsRepository, ItemType } from "./InventoryRepo.svelte";

export class Inventory {
  private readonly MAX_SLOTS = 12;
  private Inventory: Array<ItemBase | null> = $state([]);
  private readonly PendingItems: Array<ItemsEnum> = $state([]);
  private readonly SAVEKEY = "inventory";
  public EquipmentUnlock: Map<ItemsEnum, number> = new Map();

  public Equipment: Record<ItemType, ItemBase | undefined> = {
    [ItemType.Head]: undefined,
    [ItemType.Robes]: undefined,
    [ItemType.Boots]: undefined,
    [ItemType.Amulet]: undefined,
    [ItemType.Ring1]: undefined,
    [ItemType.Ring2]: undefined,
    [ItemType.Accessory1]: undefined,
    [ItemType.Accessory2]: undefined,
    [ItemType.Mark]: undefined,
    [ItemType.Gun]: undefined,
    [ItemType.Other]: undefined,
  };

  public EquipmentMultiplier: Record<EquipmentEffect, MultiplierBase> = {
    [EquipmentEffect.Damage]: new MultiplierBase(1),
    [EquipmentEffect.Defence]: new MultiplierBase(1),
    [EquipmentEffect.Regen]: new MultiplierBase(1),
    [EquipmentEffect.EnergyCap]: new MultiplierBase(1),
    [EquipmentEffect.EnergySpeed]: new MultiplierBase(1),
    [EquipmentEffect.SourceCap]: new MultiplierBase(1),
    [EquipmentEffect.SourceSpeed]: new MultiplierBase(1)
  }

  public EquipItem(slot: ItemType, item: ItemBase) {
    let prev = this.Equipment[slot];
    if (prev) this.GiveItem(prev.ItemEnum);

    this.Equipment[slot] = item;
  }

  private _player: Player;
  constructor(player: Player, save: Saves) {
    this._player = player;
    if (this.Inventory.length === 0) {
      this.Inventory = new Array(this.MAX_SLOTS).fill(null);
    }

    player.DamageMultiplier.Set("inventory", {
      priority: MultiplierPrioritySchemeEnum.Inventory,
      value: function(): Decimal {
        return Decimal.ONE;
      },
      type: MultiplierType.Additive
    })

    save.SaveCallback<(ItemBase | null)[]>(this.SAVEKEY, () => {
      return this.Inventory;
    });

    save.LoadCallback<(ItemBase | null)[]>(this.SAVEKEY, (data) => {
      if (data && Array.isArray(data)) {
        this.Inventory = data;

        if (this.Inventory.length < this.MAX_SLOTS) {
          const missing = this.MAX_SLOTS - this.Inventory.length;
          this.Inventory.push(...new Array(missing).fill(null));
        }
      } else {
        this.Inventory = new Array(this.MAX_SLOTS).fill(null);
      }
    });

    this.GiveItem(ItemsEnum.BrokenPendant);
  }

  public GetAll(): Array<ItemBase | null> {
    return this.Inventory;
  }

  public GiveItem(item: ItemsEnum): void {
    if (this.Inventory.length > this.MAX_SLOTS) {
      this.PendingItems.push(item);
      return;
    }

    let new_item = ItemsRepository[item](this);
    this.Inventory[this.Inventory.length - 1] = new_item;
  }

  public Get(at: number): ItemBase | null {
    if (at >= 0 && at < this.Inventory.length) {
      return this.Inventory[at];
    }

    return null;
  }

  // This does not have notification 
  // very dangeroud
  public RemoveItem(at: number): void {
    this.Inventory[this.Inventory.length - 1] = null;

    let pending_items = this.PendingItems.at(at);
    if (!pending_items)
      return;

    this.GiveItem(pending_items);
  }
}

export enum EquipmentEffect {
  Damage = "items.stats.damage",
  Defence = "items.stats.defence",
  Regen = "items.stats.regen",

  EnergyCap = "items.stats.energy_cap",
  EnergySpeed = "items.stats.energy_speed",
  EnergyPower = "items.stats.energy_speed",

  SourceCap = "items.stats.source_cap",
  SourceSpeed = "items.stats.source_speed",
  SourcePower = "items.stats.source_speed",
}

