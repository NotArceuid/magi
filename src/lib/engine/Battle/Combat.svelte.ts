import type { Engine } from "../Engine.svelte";
import type { Player } from "../Player.svelte";
import type { Saves } from "../Saves";
import { Decimal } from "../utils/BreakInfinity/Decimal.svelte";
import type { EnemyBase } from "./Enemies.svelte";

// will have to seperate this later but eff fck it
export class Battle {
  public Fighting: boolean = $state(false);
  public InBattle: boolean = $state(false);
  public Areas: Area[] = []
  public AreaIndex: number = $state(0);
  public WaveIndex: number = $state(0);

  public get CurrentArea(): Area | undefined {
    return this.Areas[this.AreaIndex];
  }

  public get CurrentWave(): IWaves | undefined {
    return this.CurrentArea?.Waves[this.WaveIndex];
  }

  public get CurrentEnemies(): EnemyBase[] | undefined {
    return this.CurrentWave?.Enemies;
  }

  private _player: Player;
  private readonly SAVEKEY: string = "Battle";
  constructor(engine: Engine, player: Player, saves: Saves) {
    this._player = player;

    engine.Tick.add(this.DamagePlayer);
    engine.Tick.add(this.DamageEnemy);

    saves.SaveCallback<ICombatSaves>(this.SAVEKEY, () => {
      return {
        HighestArea: this.HighestArea,
        HighestWave: this.HighestWave,
        Wave: this.WaveIndex,
        Area: this.AreaIndex,
      }
    });

    saves.LoadCallback<ICombatSaves>(this.SAVEKEY, (data) => {
      this.HighestWave = data.HighestWave;
      this.HighestArea = data.HighestArea;
      this.AreaIndex = data.Area;
      this.WaveIndex = data.Wave;
    })
  }

  private DamagePlayer() {
    let enemies = this.CurrentEnemies;
    if (!enemies)
      return;

    let total_damage = Decimal.ZERO;
    enemies.forEach((enemy) => {
      if (enemy.Tick())
        return;

      total_damage = total_damage.add(enemy.DealDamage());
    })

    this._player.TakeDamage(total_damage);
  }

  private DamageEnemy(): void {
    if (!this._player.Tick() || !this.CurrentEnemies) return;
    let remaining = this._player.DealDamage();


    for (const enemy of this.CurrentEnemies) {
      if (remaining.lte(0)) break;
      const healthBefore = enemy.Health.Value;
      enemy.TakeDamage(remaining);
      remaining = remaining.minus(healthBefore.minus(enemy.Health.Value));
    }
  }

  public HighestArea: number = $state(0);
  public HighestWave: number = $state(0);
  public get AllEnemiesDead(): boolean | undefined {
    return this.CurrentEnemies?.every(e => e.Health.Value.lte(0));
  }

  public EnterCombat(): void {
    this.InBattle = true;
    this.AreaIndex = 0;
    this.WaveIndex = 0;
  }

  public StartCombat(): void {
    this.Fighting = true;
  }

  public StopCombat(): void {
    this.Fighting = false;
  }

  public ExitCombat(): void {
    this.Fighting = false;
    this.InBattle = false;
  }

  public SwitchArea(index: number): void {
    if (index < 0 || index >= this.Areas.length) return;
    this.AreaIndex = index;
    this.WaveIndex = 0;
    if (index > this.HighestArea) {
      this.HighestArea = index;
      this.HighestWave = 0;
    }
  }

  public SwitchWave(index: number): void {
    if (!this.CurrentArea)
      return;

    if (index < 0 || index >= this.CurrentArea.Waves.length) return;
    this.WaveIndex = index;
    if (this.AreaIndex === this.HighestArea && index > this.HighestWave) {
      this.HighestWave = index;
    }
  }

  public NextWave(): void {
    if (!this.CurrentArea)
      return;

    const nextWave = this.WaveIndex + 1;
    if (nextWave < this.CurrentArea.Waves.length) {
      this.SwitchWave(nextWave);
    } else {
      this.SwitchArea(this.AreaIndex + 1);
    }
  }

  public PrevWave(): void {
    if (!this.CurrentArea)
      return;

    if (this.WaveIndex > 0) {
      this.SwitchWave(this.WaveIndex - 1);
    } else if (this.AreaIndex > 0) {
      const prevAreaIndex = this.AreaIndex - 1;
      this.AreaIndex = prevAreaIndex;
      this.WaveIndex = this.CurrentArea.Waves.length - 1;
    }
  }

  public NextArea(): void {
    if (this.AreaIndex + 1 >= this.Areas.length) return;
    this.SwitchArea(this.AreaIndex + 1);
  }

  public PrevArea(): void {
    if (this.AreaIndex - 1 < 0) return;
    this.SwitchArea(this.AreaIndex - 1);
  }

  public get CanAdvanceArea(): boolean {
    if (!this.AllEnemiesDead)
      return false;

    return this.AreaIndex < this.Areas.length - 1 && this.AllEnemiesDead;
  }

  public get CanAdvanceWave(): boolean {
    if (!this.AllEnemiesDead || !this.CurrentArea)
      return false;

    const hasNextWave = this.WaveIndex < this.CurrentArea.Waves.length - 1;
    return hasNextWave && this.AllEnemiesDead;
  }
}

export interface Area {
  Name: string;
  Description: string;
  Waves: IWaves[];
}

export interface IWaves {
  Enemies: EnemyBase[];
  Name: string,
  Description: string,
}

interface ICombatSaves {
  Area: number;
  Wave: number;
  HighestArea: number;
  HighestWave: number;
}
