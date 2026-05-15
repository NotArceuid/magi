import type { Player } from "../Player.svelte";
import { Decimal } from "../../utils/BreakInfinity/Decimal.svelte";
import { MultiplierPrioritySchemeEnum, MultiplierType } from "../../utils/Multipliers.svelte";
import { AbilityBase } from "./Abilities.svelte";
import { Combat, CombatTextSrcEnum } from "./Combat.svelte";

export enum AbilityEnum {
  FireCrimson, FirePurity, Block, SwitchPurity
}

class FireCrimson extends AbilityBase {
  public get Damage() {
    return Decimal.ONE;
  }

  public Name: string = "skills.fire_crimson.name";

  public Execute(): void {
    this.Enemy?.TakeDamage(this.Damage);
    this.StartCombat();
  }

  public Cooldown: number = 2.0;
  constructor(player: Player, combat: Combat) {
    super(player, combat);

    this.additional_props = [["skills.fire_purity.skill_info", () => ""],
    ["skills.cooldown", () => `${this.CooldownLeft.toFixed(2).toString()}/${this.Cooldown.toFixed(2)} `]
    ];
  }
}

class FirePurity extends AbilityBase {
  public Cooldown: number = 2.0;
  public Name: string = "skills.fire_purity.name";

  public get Damage() {
    return Decimal.ONE;
  }

  public Execute(): void {
    this.Enemy?.TakeDamage(this.Damage);
    this._combat.Log(CombatTextSrcEnum.Player, "skills.fire_purity.log", { damage: this.Damage.format() });

    this.StartCombat();
  }

  constructor(player: Player, combat: Combat) {
    super(player, combat);
    this.IsUnlocked = true;
    this.additional_props = [
      ["skills.fire_purity.skill_info", () => this.Damage.format()],
      ["skills.cooldown", () => `${this.CooldownLeft.toFixed(2).toString()}/${this.Cooldown.toFixed(2)} `]]
  }
}

class Block extends AbilityBase {
  public Cooldown: number = 2.0;
  public SkillInfo: Array<[string, () => string]> | undefined;

  public Name: string = "skills.block.name";

  public Execute(): void {
    this.StartCombat();
    if (this.Enemy?.CanParry) {
      this.Parry(); return;
    }

    this._player.DamageReduction.Set("ability", {
      priority: MultiplierPrioritySchemeEnum.Ability,
      value: function(): Decimal {
        return new Decimal(-0.6);
      },
      type: MultiplierType.Compounding
    });

    this._combat.Log(CombatTextSrcEnum.Player, "skills.block.block");

    setTimeout(() => {
      this._player.DamageReduction.Remove("ability");
    }, this.BlockTime * 1000);

  }

  private Parry() {
    this._player.DamageReduction.Set("ability", {
      priority: MultiplierPrioritySchemeEnum.Ability,
      value: function(): Decimal {
        return new Decimal(-0.8);
      },
      type: MultiplierType.Compounding
    });

    this._combat.Log(CombatTextSrcEnum.Player, "skills.block.parry");

    setTimeout(() => {
      this._player.DamageReduction.Remove("ability");
    }, this.BlockTime * 1000);
  }


  private BlockTime: number = 2.0;
  constructor(player: Player, combat: Combat) {
    super(player, combat);
    this.IsUnlocked = true;

    this.additional_props = [["skills.cooldown", () => `${this.CooldownLeft.toFixed(2).toString()}/${this.Cooldown.toFixed(2)} `]];
  }
}

class SwitchPurity extends AbilityBase {
  public Name: string = "skills.switch_purity.name";

  public Cooldown: number = 10.0;
  public SkillInfo: Array<[string, () => string]> | undefined;

  public Execute(): void {
    this._combat.SwitchElement(0);
  }

  constructor(player: Player, combat: Combat) {
    super(player, combat);
    this.IsUnlocked = true;
    this.SkillInfo = [["skills.cooldown", () => `${this.CooldownLeft.toFixed(2).toString()}/${this.Cooldown.toFixed(2)} `]]
  }
}

export const AbilityRegistry: Record<AbilityEnum, (player: Player, combat: Combat) => AbilityBase> = {
  [AbilityEnum.FireCrimson]: (player: Player, combat: Combat) => new FireCrimson(player, combat),
  [AbilityEnum.FirePurity]: (player: Player, combat: Combat) => new FirePurity(player, combat),
  [AbilityEnum.Block]: (player: Player, combat: Combat) => new Block(player, combat),
  [AbilityEnum.SwitchPurity]: (player: Player, combat: Combat) => new SwitchPurity(player, combat)
}
