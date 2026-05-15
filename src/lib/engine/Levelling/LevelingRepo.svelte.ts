import type { Progress } from "$lib/components/common/IProgress.svelte";
import { Player } from "../Player.svelte";
import { Saves } from "../Saves";
import { Game } from "../../stores.svelte";
import { Decimal } from "../../utils/BreakInfinity/Decimal.svelte";

export abstract class AllocatableProgress {
  public Name: string;
  public abstract Description: string;
  public AllocatedAmount: Decimal = $state(Decimal.ZERO);

  public abstract ShowRequirement: () => boolean;
  public abstract Requirement: () => boolean;
  public abstract OnComplete: (completions: Decimal) => void;

  public abstract PowerMult: Decimal;
  public abstract SpeedMult: Decimal;
  public abstract SpeedCap: Decimal;
  public abstract GainMult: Decimal;
  public abstract AllocationTarget: Decimal;

  public Count: Decimal = $state(Decimal.ZERO);
  public Visible: boolean = $state(false);
  public Unlocked: boolean = $state(false);

  // Shits break when max isn't at 100, change SpeedFactor, Not Max Progress!!!!!!!!!!!!!
  public Progress = $state({
    // DO NOT CHANGE THIS, CHANGE ALLOCATION TARGET!!!! okay???
    Max: new Decimal(100),
    Value: Decimal.ZERO,
  });

  protected _player: Player;
  constructor(player: Player, save: Saves, name: string) {
    this._player = player;
    this.Name = name;

    save.SaveCallback<AllocatableProgressSaves>(name, () => {
      return {
        Progress: this.Progress.Value,
        Allocated: this.AllocatedAmount,
        Unlocked: this.Unlocked,
        Visible: this.Visible,
        Count: this.Count,
      }
    })
  }

  public Deallocate(progress: Progress) {
    const allocatedAmount = this._player.AllocationAmount;
    if (this.AllocatedAmount.lte(allocatedAmount)) {
      progress.Set(Decimal.max(Decimal.ZERO, progress.Taken.minus(this.AllocatedAmount)));
      this.AllocatedAmount = Decimal.ZERO;
      return;
    }
    progress.Set(Decimal.max(Decimal.ZERO, progress.Taken.minus(allocatedAmount)));
    this.AllocatedAmount = this.AllocatedAmount.minus(allocatedAmount);
  }

  public Allocate(progress: Progress) {
    if (progress.Get().lte(Decimal.ZERO)) return;
    const amount = this._player.AllocationAmount;
    if (progress.Get().lte(amount)) {
      this.AllocatedAmount = this.AllocatedAmount.plus(progress.Get());
      progress.Set(progress.Max.Get()); // Taken = Max → Get() = 0
      return;
    }
    progress.Set(progress.Taken.plus(amount));
    this.AllocatedAmount = this.AllocatedAmount.plus(amount);
  }

  public AllocateMax(progress: Progress) {
    if (progress.Get().lte(Decimal.ZERO)) return;
    const available = Decimal.min(
      progress.Get(),
      this.AllocationTarget.minus(this.AllocatedAmount)
    );
    if (available.lte(Decimal.ZERO)) return;
    progress.Set(progress.Taken.plus(available));
    this.AllocatedAmount = this.AllocatedAmount.plus(available);
  }

  protected get SpeedFactor(): Decimal {
    return Decimal.max(1, this.SpeedMult.mul(this.RebirthFactor));
  }

  public get MaxAllocation() {
    return this.AllocationTarget.mul(this.RebirthFactor);
  }

  protected abstract RebirthFactor: Decimal;
  // MUST BE BETWEEN 0.0 and 1.0;
  public OvercapThreshold: Decimal = Decimal.ZERO;
  public OvercapScaling: number = 1.25;
  public get OvercapStep(): Decimal {
    let target_amount = this.AllocationTarget.mul(this.RebirthFactor);
    if (this.AllocatedAmount.lte(this.OvercapThreshold))
      return Decimal.ZERO;

    let t = ((this.AllocatedAmount.sub(this.OvercapThreshold))
      .div(this.AllocationTarget.sub(this.OvercapThreshold))).pow(this.OvercapScaling);
    //    let y = this.OvercapThreshold.add(new Decimal(100).sub(this.OvercapThreshold).mul(t));

    let y = Decimal.Lerp(this.OvercapThreshold, new Decimal(100), t)

    return target_amount
      .div(y.mul(Game.Engine.TickSpeed).div(100))
      .floor()
      .max(Decimal.ONE);
  }

  public Min: Decimal = Decimal.ZERO;

  public get StaticPart() {
    return Math.ceil(
      this.AllocatedAmount
        .div(this.OvercapStep)
        .min(Math.max(Game.Engine.TickSpeed, 1))
        .toNumber())
  };

  // TODO: fix the dumb ass bug where at a certain range, it becomes very slow and then after that the speed returns to nowmal
  // I have no idea how to fix this, gl contributors (if there's any), visual bug btw
  public NextTick = (tick: number): void => {
    if (!this.Unlocked || this.AllocatedAmount.eq(0) || !this.Requirement())
      return;

    this.Min = new Decimal(this.AllocatedAmount.div(this.OvercapStep).toNumber() / Game.Engine.TickSpeed * 100);

    if (tick % Math.max(1, Game.Engine.TickSpeed - this.StaticPart) === 0 && this.StaticPart !== 1) {
      this.OnComplete(new Decimal(this.GainMult));
      return;
    }

    let changing_part = Decimal.min(
      this.AllocatedAmount.mul(this.PowerMult).div(this.SpeedFactor),
      this.SpeedCap
    )

    this.Progress.Value = this.Progress.Value.plus(changing_part);
    if (this.Progress.Value.gte(this.Progress.Max)) {
      this.Progress.Value = Decimal.ZERO;
      this.OnComplete(this.GainMult);
    }
  };

  public CalculateOffline(tick: number) {
    let total_count = Decimal.ZERO;
    let elapsed_static_ticks = Math.floor(tick / Math.max(1, Game.Engine.TickSpeed - this.StaticPart));
    let changing_ticks = Decimal.floor(Decimal.min(
      this.AllocatedAmount.mul(this.GainMult).div(this.SpeedFactor),
      this.GainMult
    ).mul(tick).div(this.Progress.Max));

    total_count = total_count.plus(this.GainMult.mul(changing_ticks));
    total_count = total_count.plus(this.GainMult.mul(elapsed_static_ticks));

    this.Count = this.Count.plus(total_count);
  }
}

export class Punch extends AllocatableProgress {
  public Description: string = "leveling.offense.upgrades.0.description";
  public Requirement: () => boolean = () => true;
  public PowerMult: Decimal = Decimal.ONE;
  public SpeedMult: Decimal = new Decimal(50);
  public SpeedCap: Decimal = new Decimal(25);
  public GainMult: Decimal = Decimal.ONE;
  public AllocationTarget: Decimal = new Decimal(1000);
  public get RebirthFactor(): Decimal {
    return Decimal.ONE;
    //    return Game.Player.CultivationAmount[0] !== 0 ? Decimal.pow(.9, Game.Player.CultivationAmount[0]) : Decimal.ONE;
  }

  constructor(player: Player, save: Saves) {
    let name = "leveling.offense.upgrades.0.name";
    super(player, save, name);
    this.Name = name;
    this.Unlocked = true;
  }

  public OnComplete = (completions: Decimal): void => {
    this.Count = this.Count.plus(completions);
  };

  public ShowRequirement: () => boolean = () => { return true; };
}

export class Kick extends AllocatableProgress {
  public Description: string = "leveling.offense.upgrades.1.description"
  public Requirement: () => boolean = () => true;
  public PowerMult: Decimal = Decimal.ONE;
  public SpeedMult: Decimal = new Decimal(750);
  public SpeedCap: Decimal = new Decimal(25);
  public GainMult: Decimal = Decimal.ONE;
  public AllocationTarget: Decimal = new Decimal(3500);
  public ShowRequirement: () => boolean;
  public get RebirthFactor(): Decimal {
    return Decimal.ONE;
  }

  constructor(player: Player, save: Saves, punch: Punch) {
    let name = "leveling.offense.upgrades.1.name";
    super(player, save, name);
    this.Name = name;

    this.Unlocked = true;
    this.ShowRequirement = () => {
      return punch.Count.gte(5000);
    }
  }

  public OnComplete = (completions: Decimal): void => {
    this.Count = this.Count.plus(completions);
  };
}

export class Strike extends AllocatableProgress {
  public Description: string = "leveling.offense.upgrades.2.description"
  public Requirement: () => boolean = () => true;
  public PowerMult: Decimal = Decimal.ONE;
  public SpeedMult: Decimal = new Decimal(1500);
  public SpeedCap: Decimal = new Decimal(50);
  public GainMult: Decimal = Decimal.ONE;
  public AllocationTarget: Decimal = new Decimal(6500);
  public ShowRequirement: () => boolean;
  public get RebirthFactor(): Decimal {
    return Decimal.ONE;
  }

  constructor(player: Player, save: Saves, kick: Kick) {
    let name = "leveling.offense.upgrades.2.name";
    super(player, save, name);
    this.Name = name;

    this.Unlocked = true;
    this.ShowRequirement = () => {
      return kick.Count.gte(10000);
    }
  }

  public OnComplete = (completions: Decimal): void => {
    this.Count = this.Count.plus(completions);
  };
}

export class Dodge extends AllocatableProgress {
  public Description: string = "leveling.defence.upgrades.0.description";
  public Requirement: () => boolean = () => true;
  public PowerMult: Decimal = Decimal.ONE;
  public SpeedMult: Decimal = new Decimal(50);
  public SpeedCap: Decimal = new Decimal(25);
  public GainMult: Decimal = Decimal.ONE;
  public AllocationTarget: Decimal = new Decimal(1000);
  public get RebirthFactor(): Decimal {

    return Decimal.ONE;
    //    return Game.Player.CultivationAmount[0] !== 0 ? Decimal.pow(.9, Game.Player.CultivationAmount[6]) : Decimal.ONE;
  }

  constructor(player: Player, save: Saves) {
    let name = "leveling.defence.upgrades.0.name";
    super(player, save, name);
    this.Name = name;

    this.Unlocked = true;
  }

  public OnComplete = (completions: Decimal): void => {
    this.Count = this.Count.plus(completions);
  };

  public ShowRequirement: () => boolean = () => { return true; };
}

export class Flexibility extends AllocatableProgress {
  public Description: string = "leveling.defence.upgrades.1.description"
  public Requirement: () => boolean = () => true;
  public PowerMult: Decimal = Decimal.ONE;
  public SpeedMult: Decimal = new Decimal(750);
  public SpeedCap: Decimal = new Decimal(25);
  public GainMult: Decimal = Decimal.ONE;
  public AllocationTarget: Decimal = new Decimal(3500);
  public ShowRequirement: () => boolean;
  public get RebirthFactor(): Decimal {
    return Decimal.ONE;
    //    return Game.Player.CultivationAmount[1] !== 0 ? Decimal.pow(.9, Game.Player.CultivationAmount[1]) : Decimal.ONE;
  }

  constructor(player: Player, save: Saves, dodge: Dodge) {
    let name = "leveling.defence.upgrades.1.name";
    super(player, save, name);
    this.Name = name;

    this.Unlocked = true;
    this.ShowRequirement = () => {
      return dodge.Count.gte(5000);
    }
  }

  public OnComplete = (completions: Decimal): void => {
    this.Count = this.Count.plus(completions);
  };
}

export class Block extends AllocatableProgress {
  public Description: string = "leveling.defence.upgrades.2.description"
  public Requirement: () => boolean = () => true;
  public PowerMult: Decimal = Decimal.ONE;
  public SpeedMult: Decimal = new Decimal(1500);
  public SpeedCap: Decimal = new Decimal(50);
  public GainMult: Decimal = Decimal.ONE;
  public AllocationTarget: Decimal = new Decimal(6500);
  public ShowRequirement: () => boolean;
  public get RebirthFactor(): Decimal {
    return Decimal.ONE;
    //    return Game.Player.CultivationAmount[2] !== 0 ? Decimal.pow(.9, Game.Player.CultivationAmount[2]) : Decimal.ONE;
  }

  constructor(player: Player, save: Saves, flexibility: Flexibility) {
    let name = "leveling.defence.upgrades.2.name";
    super(player, save, name);
    this.Name = name;

    this.Unlocked = true;
    this.ShowRequirement = () => {
      return flexibility.Count.gte(10000);
    }
  }

  public OnComplete = (completions: Decimal): void => {
    this.Count = this.Count.plus(completions);
  };
}

export enum OffenseEnum {
  Strength1,
  Strength2,
  Strength3,
}

export enum DefenceEnum {
  Def1,
  Def2,
  Def3,
}

export enum MagicEnum {

}

interface AllocatableProgressSaves {
  Progress: Decimal,
  Allocated: Decimal,
  Unlocked: boolean,
  Visible: boolean,
  Count: Decimal,
}

