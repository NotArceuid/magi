import type { Player } from "../Player.svelte";
import { Decimal } from "../utils/BreakInfinity/Decimal.svelte";
import { ReactiveText } from "../utils/ReactiveText.svelte";
import { AbilityBase } from "./Abilities.svelte";

export enum AbilityEnum {
  FireCrimson, FirePurity, Parry, SwitchPurity
}

class FireCrimson extends AbilityBase {
  public SkillInfo: [string, any] | undefined = ["skills.fire_purity.skill_info", null];
  public EffectText(): ReactiveText {
    return new ReactiveText(`Damage: ${this.Damage.format()}`);
  }

  public get Damage() {
    return Decimal.ONE;
  }

  public Name: string = "skills.fire_crimson.name";
  public Description: string = "skills.fire_crimson.description";
  public InactiveDescription: string = "skills.fire_crimson.inactive_description";
  public Icon: string = "skills/fire_crimson.png";

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
  public Icon: string = "skills/fire_purity.png";

  public EffectText(): ReactiveText {
    return new ReactiveText(`Damage: ${this.Damage.format()}`);
  }

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

// Parry/block
class Parry extends AbilityBase {
  public InactiveDescription: string = "";
  public Name: string = "";
  public Description: string = "";
  public Icon: string = ""

  public Fire(): void {
    throw new Error("Method not implemented.");
  }
  public EffectText(): ReactiveText {
    return new ReactiveText();
  }

  public Cooldown: number = 2.0;
  constructor(player: Player) {
    super(player);
  }
}

class SwitchPurity extends AbilityBase {
  public Name: string = "skills.switch_purity.name";
  public Description: string = "skills.switch_purity.description";
  public InactiveDescription: string = "skills.switch_purity.inactive_description";
  public Icon: string = "skills/attune_purity.png"
  public SkillInfo: [string, any] | undefined = ["skills.switch_purity.skill_info", {}]
  public Cooldown: number = 10.0;

  public Fire(): void {
    if (this.CooldownLeft > 0) return;
    this._cooldownUntil = Date.now() + (this.Cooldown * 1000);
  }

  public EffectText(): ReactiveText {
    return new ReactiveText();
  }

  constructor(player: Player) {
    super(player);
    this.IsUnlocked = true;
  }
}

export const AbilityRegistry: Record<AbilityEnum, (player: Player) => AbilityBase> = {
  [AbilityEnum.FireCrimson]: (player: Player) => new FireCrimson(player),
  [AbilityEnum.FirePurity]: (player: Player) => new FirePurity(player),
  [AbilityEnum.Parry]: (player: Player) => new Parry(player),
  [AbilityEnum.SwitchPurity]: (player: Player) => new SwitchPurity(player)
}
