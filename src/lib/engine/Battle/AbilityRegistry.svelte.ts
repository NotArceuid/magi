import type { Player } from "../Player.svelte";
import { Decimal } from "../../utils/BreakInfinity/Decimal.svelte";
import { MultiplierPrioritySchemeEnum, MultiplierType } from "../../utils/Multipliers.svelte";
import { AbilityBase } from "./Abilities.svelte";
import { Combat } from "./Combat.svelte";

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

  public Execute(): void {
    this.Enemy?.TakeDamage(this.Damage);
    this.StartCombat();
  }

  public Cooldown: number = 2.0;
  constructor(player: Player, combat: Combat) {
    super(player, combat);
    this.SkillInfo?.push(["skills.cooldown"], `${this.CooldownLeft.toFixed(2).toString()}/${this.Cooldown.toFixed(2)} `)
  }
}

class FirePurity extends AbilityBase {
  public Cooldown: number = 2.0;
  public SkillInfo: Array<[string, () => string]> | undefined = [
    ["skills.fire_purity.skill_info", () => this.Damage.format()],
    ["skills.cooldown", () => `${this.CooldownLeft.toFixed(2).toString()}/${this.Cooldown.toFixed(2)} `]]

  public Name: string = "skills.fire_purity.name";
  public Description: string = "skills.fire_purity.description";
  public InactiveDescription: string = "skills.fire_purity.inactive_description"

  public get Damage() {
    return Decimal.ONE;
  }

  public Execute(): void {
    this.Enemy?.TakeDamage(this.Damage);
    this.StartCombat();
  }

  constructor(player: Player, combat: Combat) {
    super(player, combat);
    this.IsUnlocked = true;
  }
}

class Block extends AbilityBase {
  public Cooldown: number = 2.0;
  public SkillInfo: Array<[string, () => string]> | undefined = [
    ["skills.cooldown", () => `${this.CooldownLeft.toFixed(2).toString()}/${this.Cooldown.toFixed(2)} `]]

  public InactiveDescription: string = "skills.inactive_description";
  public Name: string = "skills.block.name";
  public Description: string = "skills.block.description";

  public Execute(): void {
    this.StartCombat();
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


  private BlockTime: number = 2.0;
  constructor(player: Player, combat: Combat) {
    super(player, combat);
    this.IsUnlocked = true;
  }
}

class SwitchPurity extends AbilityBase {
  public Name: string = "skills.switch_purity.name";
  public Description: string = "skills.switch_purity.description";
  public InactiveDescription: string = "skills.switch_purity.inactive_description";

  public Cooldown: number = 10.0;
  public SkillInfo: Array<[string, () => string]> | undefined = [
    ["skills.cooldown", () => `${this.CooldownLeft.toFixed(2).toString()}/${this.Cooldown.toFixed(2)} `]]

  public Execute(): void {
    this._combat.SwitchElement(0);
  }

  constructor(player: Player, combat: Combat) {
    super(player, combat);
    this.IsUnlocked = true;
  }
}

export const AbilityRegistry: Record<AbilityEnum, (player: Player, combat: Combat) => AbilityBase> = {
  [AbilityEnum.FireCrimson]: (player: Player, combat: Combat) => new FireCrimson(player, combat),
  [AbilityEnum.FirePurity]: (player: Player, combat: Combat) => new FirePurity(player, combat),
  [AbilityEnum.Block]: (player: Player, combat: Combat) => new Block(player, combat),
  [AbilityEnum.SwitchPurity]: (player: Player, combat: Combat) => new SwitchPurity(player, combat)
}
