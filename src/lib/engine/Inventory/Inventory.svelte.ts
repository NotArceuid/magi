import type { Player } from "../Player.svelte";
import type { Saves } from "../Saves";
import { Decimal } from "../utils/BreakInfinity/Decimal.svelte";
import { MultiplierBase, MultiplierPrioritySchemeEnum, MultiplierType } from "../utils/Multipliers";
import { BuildItem, ItemsEnum, ItemType, type InventoryItem } from "./InventoryRepo.svelte";

export class Inventory {
  private readonly MAX_SLOTS = 12;
  private Inventory: Array<InventoryItem | null> = $state([]);
  private readonly PendingItems: Array<ItemsEnum> = $state([]);
  private readonly SAVEKEY = "inventory";

  public Equipment: Record<ItemType, InventoryItem | undefined> = {
    [ItemType.Head]: undefined,
    [ItemType.Robes]: undefined,
    [ItemType.Boots]: undefined,
    [ItemType.Amulet]: undefined,
    [ItemType.Ring1]: undefined,
    [ItemType.Ring2]: undefined,
    [ItemType.Accessory1]: undefined,
    [ItemType.Accessory2]: undefined,
    [ItemType.Book]: undefined,
    [ItemType.Wand]: undefined,
  };

  public readonly DamageMultiplier: MultiplierBase = new MultiplierBase();
  public readonly HealthMultiplier: MultiplierBase = new MultiplierBase();
  public readonly RegenMultiplier: MultiplierBase = new MultiplierBase();
  public readonly EnergyCapMultiplier: MultiplierBase = new MultiplierBase();
  public readonly EnergySpeedMultiplier: MultiplierBase = new MultiplierBase();
  public readonly EnergyPowerMultiplier: MultiplierBase = new MultiplierBase();
  public readonly ManaCapMultiplier: MultiplierBase = new MultiplierBase();
  public readonly ManaSpeedMultiplier: MultiplierBase = new MultiplierBase();
  public readonly ManaPowerMultiplier: MultiplierBase = new MultiplierBase();

  public EquipItem(slot: ItemType, item: InventoryItem) {
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

    save.SaveCallback<(InventoryItem | null)[]>(this.SAVEKEY, () => {
      return this.Inventory;
    });

    save.LoadCallback<(InventoryItem | null)[]>(this.SAVEKEY, (data) => {
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
  }

  public GetAll(): Array<InventoryItem | null> {
    return this.Inventory;
  }

  public GiveItem(item: ItemsEnum): void {
    if (this.Inventory.length > this.MAX_SLOTS) {
      this.PendingItems.push(item);
      return;
    }

    let new_item = BuildItem(this, item);
    this.Inventory[this.Inventory.length - 1] = new_item;
  }

  public Get(at: number): InventoryItem | null {
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
