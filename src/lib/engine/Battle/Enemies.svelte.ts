import { Progress } from "$lib/components/common/IProgress.svelte";
import { Decimal } from "../../utils/BreakInfinity/Decimal.svelte.ts";
import { MultiplierBase } from "../../utils/Multipliers.svelte.ts";
import type { Combat } from "./Combat.svelte.ts";
import { EnemyRegistry, EnemyEnum, type IEnemyConfig, type IEnemyAttack } from "./EnemyRegistry.svelte";

export function BuildEnemy(combat: Combat, type: EnemyEnum): EnemyBase {
  const config = EnemyRegistry[type];
  return new BuiltEnemy(combat, config);
}

export abstract class EnemyBase {
  public abstract Health: Progress;
  public abstract Damage: Decimal;
  public abstract Name: string;
  public abstract Description: string;
  public abstract Icon: string;
  public abstract Regen: Decimal;
  public abstract Resistances: Decimal[];

  public CanParry: boolean = $state(false);
  public DamageMultiplier: MultiplierBase = MultiplierBase.default();
  public AttackSpeedMultiplier: MultiplierBase = MultiplierBase.default();

  private _globalCooldownUntil: number = $state(0);
  private _attackCooldowns: Map<number, number> = new Map();
  private _now: number = $state(Date.now());

  public readonly GlobalCooldownLeft: number = $derived(
    Math.max(0, (this._globalCooldownUntil - this._now) / 1000)
  );

  public Attacks: IEnemyAttack[] = [];
  protected _combat: Combat;

  constructor(combat: Combat) {
    this._combat = combat;

    setInterval(() => {
      if (!this._combat.Fighting)
        return;

      this._now = Date.now();
      this.AttackLoop();
    }, 100);
  }

  public AttackLoop(): void {
    if (this.GlobalCooldownLeft > 0) return;

    const availableAttacks: { index: number; attack: IEnemyAttack }[] = [];

    for (let i = 0; i < this.Attacks.length; i++) {
      if (Math.max(0, ((this._attackCooldowns.get(i) ?? 0) - this._now) / 1000) !== 0)
        continue;
      availableAttacks.push({ index: i, attack: this.Attacks[i] });
    }

    if (availableAttacks.length === 0) return;

    let totalWeight = availableAttacks.reduce((sum, a) => sum + a.attack.weight, 0);
    let rand = Math.random() * totalWeight;

    for (let { index, attack } of availableAttacks) {
      if (rand < attack.weight) {
        this._globalCooldownUntil = this._now + (attack.cooldown * 1000);
        this._attackCooldowns.set(index, this._now + (attack.cooldown * 1000));
        attack.execute(this._combat, this.Damage, this);
        return;
      }
      rand -= attack.weight;
    }
  }

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

  constructor(combat: Combat, config: IEnemyConfig) {
    super(combat);
    this.Name = config.Name;
    this.Description = config.Description;
    this.Health = new Progress(new MultiplierBase(config.Health));
    this.Icon = config.Icon;
    this.Damage = config.Damage;
    this._onDeath = config.OnDeath;
    this.Regen = config.Regen;
    this.Attacks = config.Attacks;

    this.Resistances = config.Resistance;
  }

  public DealDamage(): Decimal {
    return this.Damage;
  }

  public OnDeath(): void {
    this._onDeath?.();
  }
}
