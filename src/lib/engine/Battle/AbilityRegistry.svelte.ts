import type { Player } from "../Player.svelte";
import { Decimal } from "../utils/BreakInfinity/Decimal.svelte";
import { MultiplierPrioritySchemeEnum, MultiplierType } from "../utils/Multipliers.svelte";
import { AbilityBase } from "./Abilities.svelte";

export enum AbilityEnum {
  FireCrimson, FirePurity, Block, SwitchPurity
}

class FireCrimson extends AbilityBase {
  public SkillInfo: [string, any] | undefined = ["skills.fire_purity.skill_info", null];

  public get Damage() {
    return Decimal.ONE;
  }

  public Name: string = "skills.fire_crimson.name";
  public Description: string = "skills.fire_crimson.description";
  public InactiveDescription: string = "skills.fire_crimson.inactive_description";

  public Fire(): void {
    if (this.CooldownLeft > 0) return;

    this._cooldownUntil = Date.now() + (this.Cooldown * 1000);
    this.Enemy?.DealDamage();
  }

  public Cooldown: number = 2.0;
  constructor(player: Player) {
    super(player);
  }
}

class FirePurity extends AbilityBase {
  public SkillInfo: [string, any] | undefined = ["skills.fire_purity.skill_info", { damage: this.Damage }];
  public Name: string = "skills.fire_purity.name";
  public Description: string = "skills.fire_purity.description";
  public InactiveDescription: string = "skills.fire_purity.inactive_description"


  public get Damage() {
    return Decimal.ONE;
  }

  public Fire(): void {
    if (this._cooldownUntil > Date.now()) return;

    this._cooldownUntil = Date.now() + (this.Cooldown * 1000);
    this.Enemy?.TakeDamage(this.Damage);
  }

  public Cooldown: number = 2.0;
  constructor(player: Player) {
    super(player);
    this.IsUnlocked = true;
  }
}

class Block extends AbilityBase {
  public InactiveDescription: string = "skills.inactive_description";
  public Name: string = "skills.block.name";
  public Description: string = "skills.block.description";

  public Fire(): void {
    if (this._cooldownUntil > Date.now()) return;
    this._cooldownUntil = Date.now() + (this.Cooldown * 1000);

    if (this.Enemy?.CanParry) {
      this.Parry(); return;
    }

    this._player.DamageReduction.Set("ability", {
      priority: MultiplierPrioritySchemeEnum.Ability,
      value: function(): Decimal {
        return new Decimal(0.6);
      },
      type: MultiplierType.Compounding
    });

    setTimeout(() => {
      this._player.DamageReduction.Remove("ability");
    }, this.BlockTime * 1000);
  }

  private Parry() {
    this._player.DamageReduction.Set("ability", {
      priority: MultiplierPrioritySchemeEnum.Ability,
      value: function(): Decimal {
        return new Decimal(0.4);
      },
      type: MultiplierType.Compounding
    });

    setTimeout(() => {
      this._player.DamageReduction.Remove("ability");
    }, this.BlockTime * 1000);
  }


  public Cooldown: number = 4.0;
  private BlockTime: number = 2.0;
  constructor(player: Player) {
    super(player);
    this.IsUnlocked = true;
  }
}

class SwitchPurity extends AbilityBase {
  public Name: string = "skills.switch_purity.name";
  public Description: string = "skills.switch_purity.description";
  public InactiveDescription: string = "skills.switch_purity.inactive_description";
  public SkillInfo: [string, any] | undefined = ["skills.switch_purity.skill_info", {}]
  public Cooldown: number = 10.0;

  public Fire(): void {
    if (this.CooldownLeft > 0) return;
    this._cooldownUntil = Date.now() + (this.Cooldown * 1000);
  }


  constructor(player: Player) {
    super(player);
    this.IsUnlocked = true;
  }
}

export const AbilityRegistry: Record<AbilityEnum, (player: Player) => AbilityBase> = {
  [AbilityEnum.FireCrimson]: (player: Player) => new FireCrimson(player),
  [AbilityEnum.FirePurity]: (player: Player) => new FirePurity(player),
  [AbilityEnum.Block]: (player: Player) => new Block(player),
  [AbilityEnum.SwitchPurity]: (player: Player) => new SwitchPurity(player)
}
