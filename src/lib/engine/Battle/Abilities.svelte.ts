import type { Player } from "../Player.svelte";
import type { EnemyBase } from "./Enemies.svelte";

export interface IAbility {
  Name: string;
  Description: string;

  Fire(enemy: EnemyBase): void;
  Cooldown: number;
}

export abstract class AbilityBase implements IAbility {
  public abstract Name: string;
  public abstract Description: string;
  public SkillInfo: [string, any] | undefined;

  public abstract InactiveDescription: string;
  public abstract Fire(): void;

  public abstract Cooldown: number;
  public IsUnlocked: boolean = $state(false);
  public Enemy: EnemyBase | undefined = $state()

  protected _cooldownUntil: number = $state(0);
  protected frozenTime: number = $state(0);
  protected _player: Player;
  constructor(player: Player) {
    this._player = player;
    setInterval(() => { this._now = Date.now(); }, 100);
  }

  protected _now: number = $state(Date.now());
  public readonly CooldownLeft: number = $derived.by(() => {
    if (this.frozenTime > 0) return this.frozenTime;
    return Math.max(0, (this._cooldownUntil - this._now) / 1000);
  });

  public Freeze(): void {
    this.frozenTime = this.CooldownLeft;
  }

  public Unfreeze(): void {
    this._cooldownUntil = Date.now() + (this.frozenTime * 1000);
    this.frozenTime = 0;
  }
}
