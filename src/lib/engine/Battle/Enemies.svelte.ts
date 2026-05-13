import { Progress } from "$lib/components/common/IProgress.svelte";
import { Decimal } from "../utils/BreakInfinity/Decimal.svelte";
import { MultiplierBase } from "../utils/Multipliers.svelte.ts";
import { BattleRegistry, type Enemy, type IEnemyConfig } from "./EnemyRegistry.svelte";

export function BuildEnemy(type: Enemy): EnemyBase {
  const config = BattleRegistry[type];
  return new BuiltEnemy(config);
}

export abstract class EnemyBase {
  public abstract Health: Progress;
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

  public TakeDamage(damage: Decimal): void {
    if (damage.lte(0)) return;
    this.Health.Set(
      Decimal.min(this.Health.Max.Get(), this.Health.Taken.plus(damage))
    );
  }

  public abstract DealDamage(): Decimal;
  public abstract OnDeath(): void;
}

class BuiltEnemy extends EnemyBase {
  public Name: string;
  public Description: string;
  public Health: Progress;
  public Damage: Decimal;
  public Regen: Decimal;

  public Resistances: Decimal[];
  public Icon: string;
  private _onDeath: (() => void) | undefined;

  constructor(config: IEnemyConfig) {
    super();
    this.Name = config.Name;
    this.Description = config.Description;
    this.Health = new Progress(new MultiplierBase(config.Health));
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
