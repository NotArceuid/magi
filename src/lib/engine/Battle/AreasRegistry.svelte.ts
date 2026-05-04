import { Enemy } from "./EnemyRegistry.svelte";
import { BuildEnemy, EnemyBase } from "./Enemies.svelte";
import type { IAdventureArea } from "./Adventure.svelte";

export class NileouCity implements IAdventureArea {
  Name: string = "areas.0.name"
  Description: string = "areas.0.description";
  Waves: EnemyBase[];

  constructor() {
    this.Waves = [
      BuildEnemy(Enemy.YoungMan),
      BuildEnemy(Enemy.LightClone),
      BuildEnemy(Enemy.LightHound),
      BuildEnemy(Enemy.LightBeast),
      BuildEnemy(Enemy.HatMan),
      BuildEnemy(Enemy.Alleyway),
      BuildEnemy(Enemy.CondensedSlime),
      BuildEnemy(Enemy.TunnelSludge),
    ];
  }
}
