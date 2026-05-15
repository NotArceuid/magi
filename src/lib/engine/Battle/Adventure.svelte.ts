// Adventure.svelte.ts
import type { Engine } from "../Engine.svelte";
import type { Saves } from "../Saves";
import { AdventureAreaBase, Sewers } from "./AreasRegistry.svelte";
import type { Combat } from "./Combat.svelte";
import type { EnemyBase } from "./Enemies.svelte";

export class Adventure {
  public Areas: AdventureAreaBase[] | undefined;
  public AreaIndex: number = $state(0);
  public HighestUnlockedArea: number = $state(0);

  private _combat: Combat;
  private readonly SAVEKEY = "Battle";

  public get CurrentArea(): AdventureAreaBase | undefined { return this.Areas?.[this.AreaIndex]; }
  public get CurrentEnemy(): EnemyBase | undefined {
    return this.CurrentArea?.Current ?? undefined;
  }

  constructor(engine: Engine, combat: Combat, saves: Saves) {
    this._combat = combat;
    this._combat.SwitchEnemies(this.CurrentEnemy);

    this.Areas = [new Sewers(combat)];
    this.SwitchArea(0);
  }

  public SwitchArea(index: number): void {
    if (!this.Areas)
      return;

    if (index < 0 || index >= this.Areas?.length || index > this.HighestUnlockedArea) return;
    this.AreaIndex = index;
    this._combat.SwitchEnemies(this.CurrentEnemy);
  }

  public NextArea(): void { this.SwitchArea(this.AreaIndex + 1); }
  public PrevArea(): void { this.SwitchArea(this.AreaIndex - 1); }

  public EnemyKilled(): void {
    this.CurrentArea?.KillCurrent();
    this._combat.SwitchEnemies(this.CurrentEnemy);
  }
}

interface IAdventureSaves {
  AreaIndex: number;
  HighestUnlockedArea: number;
}
