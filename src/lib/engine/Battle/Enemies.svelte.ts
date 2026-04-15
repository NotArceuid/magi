import type { IProgressGain } from "$lib/components/common/IProgress";
import { Decimal } from "../utils/BreakInfinity/Decimal.svelte";
import { EnemyRegistry, type Enemy, type IEnemyConfig } from "./EnemyRegistry.svelte";

export function BuildEnemy(type: Enemy): EnemyBase {
  const config = EnemyRegistry[type];
  return new BuiltEnemy(config);
}

export abstract class EnemyBase {
  public abstract Health: IProgressGain;
  public abstract Damage: Decimal;
  public abstract AtkSpeed: Decimal;
  public abstract Name: string;
  public abstract Description: string;
  public abstract readonly BaseTick: number;
  public abstract CurrentTick: number;
  public abstract Icon: string;

  public Tick(): boolean {
    if (this.CurrentTick - 1 == 0) {
      this.CurrentTick = this.BaseTick;
      return true;
    }

    this.CurrentTick--;
    return false;
  }

  public TakeDamage(damage: Decimal): void {
    if (damage.lessThan(0))
      return;

    this.Health.Value = Decimal.min(
      this.Health.Value.minus(damage),
      this.Health.Max,
    );

    if (this.Health.Value.lessThanOrEqualTo(0)) {
      this.OnDeath();
    }
  }

  public abstract DealDamage(): Decimal;
  public abstract OnDeath(): void;
}

class BuiltEnemy extends EnemyBase {
  public Name: string;
  public Description: string;
  public Health: IProgressGain;
  public Damage: Decimal;
  public AtkSpeed: Decimal;
  public Icon: string;
  public readonly BaseTick: number;
  public CurrentTick: number;
  private _onDeath: (() => void) | undefined;

  constructor(config: IEnemyConfig) {
    super();
    this.Name = config.Name;
    this.Description = config.Description;
    this.Health = {
      Min: Decimal.ZERO,
      Max: config.Health,
      Value: config.Health,
      Gain: Decimal.ZERO,
    };
    this.Icon = config.Icon;
    this.Damage = config.Damage;
    this.AtkSpeed = config.AtkSpeed;
    this.BaseTick = config.BaseTick;
    this.CurrentTick = config.BaseTick;
    this._onDeath = config.OnDeath;
  }

  public DealDamage(): Decimal {
    return this.Damage;
  }

  public OnDeath(): void {
    this._onDeath?.();
  }
}
