import { Combat } from "./Combat.svelte";
import { BuildEnemy } from "./Enemies.svelte";
import type { EnemyBase } from "./Enemies.svelte";
import { EnemyEnum } from "./EnemyRegistry.svelte";


export abstract class AdventureAreaBase {
  public abstract Name: string;
  public abstract Description: string;
  public abstract EnemyList: EnemyEnum[];

  public HeighestDifficulty: number = $state(0);
  public Difficulty: number = $state(0);
  public Killed: Set<number> = $state(new Set());

  private _enemies: EnemyBase[] = $state([]);

  protected initEnemies(): void {
    this._enemies = this.EnemyList.map((enemy) => BuildEnemy(this._combat, enemy));
  }

  public get Enemies(): EnemyBase[] { return this._enemies; }
  public get CurrentIdx(): number {
    return this.EnemyList.findIndex((_, i) => !this.Killed.has(i));
  }

  public get Current(): EnemyBase | null {
    return this.CurrentIdx === -1 ? null : this.Enemies[this.CurrentIdx];
  }

  public get Cleared(): boolean { return this.Current === null; }

  protected _combat: Combat;
  constructor(combat: Combat) {
    this._combat = combat;
  }

  public KillCurrent(): void {
    this.Killed.add(this.CurrentIdx);

    if (this.Cleared) {
      if (this.HeighestDifficulty < this.Difficulty) {
        this.HeighestDifficulty++;
      }

      this.Difficulty++;
      this.Killed = new Set();

      this.initEnemies();
    }
  }
}


export class Sewers extends AdventureAreaBase {
  Name = "areas.0.name";
  Description = "areas.0.description";
  EnemyList = [EnemyEnum.CondensedSlime];

  constructor(combat: Combat) {
    super(combat);
    this.initEnemies();
  }
}
