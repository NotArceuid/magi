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

  public Equipment: Record<ItemType, ItemBase | undefined> = $state({
    [ItemType.Head]: undefined, [ItemType.Vest]: undefined, [ItemType.Boots]: undefined,
    [ItemType.Seal]: undefined, [ItemType.Gun]: undefined, [ItemType.Amulet]: undefined,
    [ItemType.Ring1]: undefined, [ItemType.Ring2]: undefined, [ItemType.Ring3]: undefined,
    [ItemType.Accessory1]: undefined, [ItemType.Accessory2]: undefined, [ItemType.Accessory3]: undefined,
    [ItemType.Other]: undefined,
  });

  public EquipmentMultiplier: Record<EquipmentEffect, MultiplierBase> = $state({
    [EquipmentEffect.Damage]: new MultiplierBase(1),
    [EquipmentEffect.Defence]: new MultiplierBase(1),
    [EquipmentEffect.Regen]: new MultiplierBase(1),
    [EquipmentEffect.EnergyCap]: new MultiplierBase(1),
    [EquipmentEffect.EnergyPower]: new MultiplierBase(1),
    [EquipmentEffect.SourceCap]: new MultiplierBase(1),
    [EquipmentEffect.SourceSpeed]: new MultiplierBase(1)
  })

  public UnequipItem(slot: ItemType): ItemBase | undefined {
    const item = this.Equipment[slot];
    if (item) {
      item.OnRemove();
      this.Equipment[slot] = undefined;
    }
    return item;
  }

  public EquipItem(slot: ItemType, item: ItemBase) {
    const prev = this.UnequipItem(slot);
    if (prev) this.GiveItem(prev.ItemEnum);
    this.Equipment[slot] = item;
    item.OnEquip();
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
    const freeSlot = this.Inventory.indexOf(null);
    if (freeSlot === -1) {
      this.PendingItems.push(item);
      return;
    }

    let new_item = ItemsRepository[item](this);
    this.Inventory[freeSlot] = new_item;
  }

  public Get(at: number): ItemBase | null {
    if (at >= 0 && at < this.Inventory.length) {
      return this.Inventory[at];
    }

    return null;
  }

  public Set(at: number, item: ItemBase) {
    this.Inventory[at] = item;
  }

  // This does not have notification 
  // very dangeroud
  public RemoveItem(at: number): void {
    this.Inventory[at] = null;

    const pending = this.PendingItems.shift();
    if (pending === undefined) return;
    this.GiveItem(pending);
  }
}

export enum EquipmentEffect {
  Damage = "items.stats.damage",
  Defence = "items.stats.defence",
  Regen = "items.stats.regen",

  EnergyCap = "items.stats.energy_cap",
  EnergyPower = "items.stats.energy_speed",

  SourceCap = "items.stats.source_cap",
  SourceSpeed = "items.stats.source_speed",
  SourcePower = "items.stats.source_speed",
}

