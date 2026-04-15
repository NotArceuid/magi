import { Decimal } from "../utils/BreakInfinity/Decimal.svelte";

export interface IAbility {
  Tick(): boolean;
  DealDamage(): Decimal;
}

export abstract class AbilityBase {
  public abstract Damage: Decimal;
  public abstract AtkSpeed: Decimal;
  public CurrentTick: number = 1;

  public get BaseTick(): number {
    const speed = this.AtkSpeed.toNumber();
    return speed >= 60 ? 1 : Math.max(1, Math.ceil(60 / speed));
  }

  private get DamageMultiplier(): Decimal {
    return this.AtkSpeed.gt(60) ? this.AtkSpeed.div(60) : Decimal.ONE;
  }

  public Tick(): boolean {
    if (this.CurrentTick <= 1) {
      this.CurrentTick = this.BaseTick;
      return true;
    }
    this.CurrentTick--;
    return false;
  }

  public DealDamage(baseDamage: Decimal): Decimal {
    return baseDamage.mul(this.Damage).mul(this.DamageMultiplier);
  }
}
