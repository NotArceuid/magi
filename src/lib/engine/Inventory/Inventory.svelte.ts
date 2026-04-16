import type { Saves } from "../Saves";

enum ItemType {
  // health stuff, no pants because wizards dont wear them

  // focus speed
  Head,

  // Affects hp regen
  Robes,

  // Affects dungeon movement speed
  Boots,

  // overall buff
  Accessory,

  // buffs spells
  // spell speed
  Book,

  // spell damage 
  // spell slot
  Wand,
}

export interface InventoryItem {
  id: number;
  name: string;
  icon_path: string;
  level: number;
  descriptoin: string;
}

export class Inventory {
  private readonly MAX_SLOTS = 12;
  private Inventory: Array<InventoryItem | null> = $state([]);

  private get SAVEKEY() {
    return "inventory";
  }

  constructor(save: Saves) {
    if (this.Inventory.length === 0) {
      this.Inventory = new Array(this.MAX_SLOTS).fill(null);
    }

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

  public Add(item: InventoryItem | null): boolean {
    if (item == null) {
      console.warn("Trying to add null item. Use Remove() instead.");
      return false;
    }

    const emptyIndex = this.Inventory.findIndex(slot => slot === null);
    if (emptyIndex !== -1) {
      this.Inventory[emptyIndex] = item;
      return true;
    } else {
      console.warn("Inventory is full!");
      return false;
    }
  }

  public Set(at: number, item: InventoryItem | null): void {
    if (at >= 0 && at < this.Inventory.length) {
      this.Inventory[at] = item;
    } else {
      console.error(`Invalid inventory slot index: ${at}`);
    }
  }

  public Get(at: number): InventoryItem | null {
    if (at >= 0 && at < this.Inventory.length) {
      return this.Inventory[at];
    }
    return null;
  }

  public Remove(at: number): void {
    this.Set(at, null);
  }

  public IsEmpty(at: number): boolean {
    return this.Get(at) === null;
  }

  public FindItemIndex(item: InventoryItem): number {
    return this.Inventory.indexOf(item);
  }

}
