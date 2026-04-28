import type { IProgress } from "$lib/components/common/IProgress.svelte";
import { Decimal } from "../utils/BreakInfinity/Decimal.svelte";
import { MultiplierBase } from "../utils/Multipliers";
import { EnemyRegistry, type Enemy, type IEnemyConfig } from "./EnemyRegistry.svelte";

export function BuildEnemy(type: Enemy): EnemyBase {
  const config = EnemyRegistry[type];
  return new BuiltEnemy(config);
}

export abstract class EnemyBase {
  public abstract Health: IProgress;
  public abstract Damage: Decimal;
  public abstract AtkSpeed: Decimal;
  public abstract Name: string;
  public abstract Description: string;
  public abstract AtkSpeedDivider: Decimal;
  public abstract Icon: string;

  public Tick(elapsed: number, divider: Decimal = Decimal.ONE): boolean {
    let tick = Math.floor(divider.div(this.AttackSpeedMultiplier.Get()).toNumber());
    return elapsed % tick == 0;
  }

  public DamageMultiplier: MultiplierBase = new MultiplierBase();
  public AttackSpeedMultiplier: MultiplierBase = new MultiplierBase();

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
  public AtkSpeed: Decimal;
  public AtkSpeedDivider: Decimal;
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
    this.AtkSpeedDivider = config.AtkSpeedDivider;
    this.Damage = config.Damage;
    this.AtkSpeed = config.AtkSpeed;
    this._onDeath = config.OnDeath;
  }

  public DealDamage(): Decimal {
    return this.Damage;
  }

  public OnDeath(): void {
    this._onDeath?.();
  }
}
