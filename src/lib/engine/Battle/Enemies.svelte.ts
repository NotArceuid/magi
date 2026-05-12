import type { IProgress } from "$lib/components/common/IProgress.svelte";
import { Decimal } from "../utils/BreakInfinity/Decimal.svelte";
import { MultiplierBase } from "../utils/Multipliers.svelte.ts";
import { BattleRegistry, type Enemy, type IEnemyConfig } from "./EnemyRegistry.svelte";

export function BuildEnemy(type: Enemy): EnemyBase {
  const config = BattleRegistry[type];
  return new BuiltEnemy(config);
}

export abstract class EnemyBase {
  public abstract Health: IProgress;
  public abstract Damage: Decimal;

  public abstract Name: string;
  public abstract Description: string;
  public abstract Icon: string;

  public abstract Regen: Decimal;
  public abstract Resistances: Decimal[];
  public CanAttack: boolean = false;
  public CanParry: boolean = $state(false);

  public DamageMultiplier: MultiplierBase = MultiplierBase.default();
  public AttackSpeedMultiplier: MultiplierBase = MultiplierBase.default();

  protected _timer: any = null;
  protected _timeLeft: number = 0;
  public TakeDamage(damage: Decimal): void {
    if (damage.lte(0)) return;

    this.Health.Value = Decimal.max(Decimal.ZERO, this.Health.Value.minus(damage));
  }

  public abstract DealDamage(): Decimal;
  public abstract OnDeath(): void;
}

class BuiltEnemy extends EnemyBase {
  public Name: string;
  public Description: string;
  public Health: IProgress;
  public Damage: Decimal;
  public Regen: Decimal;

  public Resistances: Decimal[];
  public Icon: string;
  private _onDeath: (() => void) | undefined;

  constructor(config: IEnemyConfig) {
    super();
    this.Name = config.Name;
    this.Description = config.Description;
    this.Health = $state({
      Min: Decimal.ZERO,
      Max: config.Health,
      Value: config.Health,
    });

    this.Icon = config.Icon;
    this.Damage = config.Damage;
    this._onDeath = config.OnDeath;
    this.Regen = config.Regen;

    this.Resistances = config.Resistance;
  }

  public DealDamage(): Decimal {
    return this.Damage;
  }

  public OnDeath(): void {
    this._onDeath?.();
  }
}
