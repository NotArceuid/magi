import { dev } from "$app/environment";
import type { Engine } from "../Engine.svelte";
import type { Player } from "../Player.svelte";
import type { Saves } from "../Saves";
import { NileouCity } from "./AreasRegistry.svelte";
import type { EnemyBase } from "./Enemies.svelte";

export class Adventure {
  public Fighting: boolean = $state(false);
  public InBattle: boolean = $state(false);
  public Areas: IAdventureArea[] = [new NileouCity()]
  public AreaIndex: number = $state(0);
  public WaveIndex: number = $state(0);

  public get CurrentArea(): IAdventureArea | undefined {
    return this.Areas[this.AreaIndex];
  }

  public get CurrentWaves(): EnemyBase[] | undefined {
    return this.CurrentArea?.Waves;
  }

  public get CurrentEnemy(): EnemyBase | undefined {
    return this.CurrentWaves?.[this.WaveIndex];
  }

  private _player: Player;
  private readonly SAVEKEY: string = "Battle";
  constructor(engine: Engine, player: Player, saves: Saves) {
    this._player = player;

    engine.Tick.add((e) => { this.DamagePlayer(e.total_ticks) });
    engine.Tick.add((e) => { this.DamageEnemy(e.total_ticks) });

    saves.SaveCallback<IAdventureSaves>(this.SAVEKEY, () => {
      return {
        HighestArea: this.HighestArea,
        HighestWave: this.HighestWave,
        Wave: this.WaveIndex,
        Area: this.AreaIndex,
      }
    });

    saves.LoadCallback<IAdventureSaves>(this.SAVEKEY, (data) => {
      this.HighestWave = data.HighestWave;
      this.HighestArea = data.HighestArea;
      this.AreaIndex = data.Area;
      this.WaveIndex = data.Wave;
    })
  }

  private DamagePlayer(ticks: number) {
    if (!this.Fighting)
      return;

    let enemy = this.CurrentEnemy;
    if (!enemy)
      return;

    if (!enemy.Tick(ticks, this._player.AtkSpeedDivider.Get()))
      return;

    this._player.TakeDamage(enemy.DealDamage());
    if (this._player.Health.Value.lte(0)) {
      this.PlayerOnDeath();
    }
  }

  private PlayerOnDeath() {
    this.SwitchWave(0);
    this.SwitchArea(0);
  }

  private DamageEnemy(ticks: number): void {
    let enemy = this.CurrentEnemy;
    if (!enemy || !this.Fighting)
      return;

    if (!this._player.Tick(ticks, enemy.AtkSpeedDivider))
      return;

    enemy.TakeDamage(this._player.DealDamage());
    if (enemy.Health.Value.lte(0)) {
      enemy.OnDeath();
      this.StopCombat();
      this.NextWave();
    }
  }

  public HighestArea: number = $state(0);
  public HighestWave: number = $state(0);

  public EnterCombat(): void {
    this.InBattle = true;
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
    let can = false;
    for (let i = 0; i < this.AreaIndex; i++) {
      let current_wave = this.Areas[this.AreaIndex].Waves[i];
      can = current_wave.Health.Value.lte(0);

      if (!can)
        return false;
    }

    return true;
  }

  public get CanAdvanceWave(): boolean {
    return this.Areas[this.AreaIndex].Waves[this.WaveIndex].Health.Value.lte(0) || dev;
  }
}

export interface IAdventureArea {
  Name: string;
  Description: string;
  Waves: EnemyBase[];
}

interface IAdventureSaves {
  Area: number;
  Wave: number;
  HighestArea: number;
  HighestWave: number;
}
