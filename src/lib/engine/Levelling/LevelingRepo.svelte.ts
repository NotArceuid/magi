import type { IProgress, IProgressGain } from "$lib/components/common/IProgress";
import { Player } from "../Player.svelte";
import { Saves } from "../Saves";
import { Game } from "../stores.svelte";
import { Decimal } from "../utils/BreakInfinity/Decimal.svelte";

export abstract class AllocatableProgress {
  public Name: string;
  public abstract Description: string;
  public abstract AllocatedAmount: Decimal;

  public abstract ShowRequirement: () => boolean;
  public abstract Requirement: () => boolean;
  public abstract OnComplete: (completions: Decimal) => void;
  public abstract MaxAllocated: Decimal;

  public Count: Decimal = $state(Decimal.ZERO);
  public Visible: boolean = $state(false);
  public Unlocked: boolean = $state(false);

  /**
   * Power factor - basically, how much it boosts the speed factor
   **/
  public abstract PowerFactor: Decimal;

  /**
   * Speed factor - base speed multiplier
   **/
  public abstract SpeedFactor: Decimal;

  /**
   * Speed limit - max speed at which it caps
   * Remember to not go above 110km/h at a highway
   **/
  public abstract SpeedLimit: Decimal;

  /**
   * Gain Factor - How much you gain per fill
   **/
  public abstract GainFactor: Decimal;

  /**
   * Overcap step (min allocation needed for overcap to occur)
   **/
  public abstract OvercapStep: Decimal;

  // Shits break when max isn't at 100, change SpeedFactor, Not Max Progress!!!!!!!!!!!!!
  public Progress: IProgressGain = $state({
    Max: new Decimal(100),
    Min: Decimal.ZERO,
    Value: Decimal.ZERO,
    Gain: Decimal.ZERO,
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

  public Deallocate(progress: IProgress) {
    let allocatedAmount = this._player.AllocationAmount;
    if (this.AllocatedAmount.lte(allocatedAmount)) {
      let clone = this.AllocatedAmount.clone();
      progress.Value = clone.plus(progress.Value);
      this.AllocatedAmount = Decimal.ZERO;
      return;
    }

    let diff = this.AllocatedAmount.minus(allocatedAmount);
    progress.Value = progress.Value.plus(allocatedAmount);
    this.AllocatedAmount = diff;
  }

  public Allocate(progress: IProgress) {
    let amount = this._player.AllocationAmount;
    if (progress.Value.lte(amount)) {
      this.AllocatedAmount = this.AllocatedAmount.plus(progress.Value);
      progress.Value = Decimal.ZERO;
      return;
    }

    if (progress.Value.minus(amount).lte(0)) {
      let clone = progress.Value.clone();
      progress.Value = Decimal.ZERO;
      this.AllocatedAmount = clone;
      return;
    }

    let diff = Decimal.max(0, progress.Value.minus(amount));
    progress.Value = diff;
    this.AllocatedAmount = this.AllocatedAmount.plus(amount);
  }

  public get StaticPart() {
    return Math.ceil(
      Decimal.min(this.AllocatedAmount.div(this.OvercapStep),
        Math.max(Game.Engine.TickSpeed, 1)).toNumber())
  };

  // TODO: fix the dumb ass bug where at a certain range, it becomes very slow and then after that the speed returns to nowmal
  // I have no idea how to fix this, gl contributors (if there's any)
  public NextTick = (tick: number): void => {
    if (!this.Unlocked || this.AllocatedAmount.eq(0) || !this.Requirement())
      return;

    this.Progress.Min = new Decimal(this.AllocatedAmount.div(this.OvercapStep).toNumber() / Game.Engine.TickSpeed * 100);

    if (tick % Math.max(1, Game.Engine.TickSpeed - this.StaticPart) === 0 && this.StaticPart !== 1) {
      this.OnComplete(new Decimal(this.GainFactor));
      return;
    }

    let changing_part = Decimal.min(
      this.AllocatedAmount.mul(this.PowerFactor).div(this.SpeedFactor),
      this.SpeedLimit
    )

    this.Progress.Value = this.Progress.Value.plus(changing_part);
    if (this.Progress.Value.gte(this.Progress.Max)) {
      this.Progress.Value = Decimal.ZERO;
      this.OnComplete(this.GainFactor);
    }
  };

  public CalculateOffline(tick: number) {
    let total_count = Decimal.ZERO;
    let elapsed_static_ticks = Math.floor(tick / Math.max(1, Game.Engine.TickSpeed - this.StaticPart));
    let changing_ticks = Decimal.floor(Decimal.min(
      this.AllocatedAmount.mul(this.PowerFactor).div(this.SpeedFactor),
      this.SpeedLimit
    ).mul(tick).div(this.Progress.Max));

    total_count = total_count.plus(this.GainFactor.mul(changing_ticks));
    total_count = total_count.plus(this.GainFactor.mul(elapsed_static_ticks));

    this.Count = this.Count.plus(total_count);
  }

}

export class Punch extends AllocatableProgress {
  public MaxAllocated: Decimal = $derived(new Decimal(1000 * (Math.pow(.9, Game.Player.CultivationAmount[0]))));
  public OvercapStep: Decimal = $derived(new Decimal(Decimal.max((this.MaxAllocated.div(Game.Engine.TickSpeed)).ceil(), Decimal.ONE)));

  public SpeedLimit: Decimal = $state(new Decimal(25));
  public Name: string;
  public Description: string = "leveling.offense.upgrades.0.description";
  public Requirement: () => boolean = () => true;
  public AllocatedAmount: Decimal = $state(Decimal.ZERO);
  public Unlocked: boolean = true;
  public PowerFactor: Decimal = $state(Decimal.ONE);
  public SpeedFactor: Decimal = $state(new Decimal(50));
  public GainFactor: Decimal = $state(Decimal.ONE);

  constructor(player: Player, save: Saves) {
    let name = "leveling.offense.upgrades.0.name";
    super(player, save, name);
    this.Name = name;
    this.Visible = true;
    this.Unlocked = true;
  }

  public OnComplete = (completions: Decimal): void => {
    this.Count = this.Count.plus(completions);
  };

  public ShowRequirement: () => boolean = () => { return true; };
}

export class Kick extends AllocatableProgress {
  public MaxAllocated: Decimal = $derived(new Decimal(3500 * (Math.pow(.9, Game.Player.CultivationAmount[1]))));
  public OvercapStep: Decimal = $derived(new Decimal(Decimal.max((this.MaxAllocated.div(Game.Engine.TickSpeed)).ceil(), Decimal.ONE)));
  public SpeedLimit: Decimal = $state(new Decimal(25));
  public Name: string;
  public Description: string = "leveling.offense.upgrades.1.description";
  public Requirement: () => boolean = () => true;
  public AllocatedAmount: Decimal = $state(Decimal.ZERO);
  public Unlocked: boolean = true;
  public PowerFactor: Decimal = $state(Decimal.ONE);
  public SpeedFactor: Decimal = $state(new Decimal(100));
  public GainFactor: Decimal = $state(Decimal.ONE);
  public ShowRequirement: () => boolean;

  constructor(player: Player, save: Saves, punch: Punch) {
    let name = "leveling.offense.upgrades.1.name";
    super(player, save, name);
    this.Name = name;
    this.Visible = true;
    this.Unlocked = true;
    this.ShowRequirement = () => {
      return punch.Count.gte(1);
    }
  }

  public OnComplete = (completions: Decimal): void => {
    this.Count = this.Count.plus(completions);
  };
}

export class Strike extends AllocatableProgress {
  public MaxAllocated: Decimal = $derived(new Decimal(6500 * (Math.pow(.9, Game.Player.CultivationAmount[2]))));
  public OvercapStep: Decimal = $derived(new Decimal(Decimal.max((this.MaxAllocated.div(Game.Engine.TickSpeed)).ceil(), Decimal.ONE)));
  public SpeedLimit: Decimal = $state(new Decimal(25));
  public Name: string;
  public Description: string = "leveling.offense.upgrades.2.description";
  public Requirement: () => boolean = () => true;
  public AllocatedAmount: Decimal = $state(Decimal.ZERO);
  public Unlocked: boolean = true;
  public PowerFactor: Decimal = $derived(Decimal.ONE);
  public SpeedFactor: Decimal = $state(new Decimal(150));
  public GainFactor: Decimal = $state(Decimal.ONE);
  public ShowRequirement: () => boolean;

  constructor(player: Player, save: Saves, kick: Kick) {
    let name = "leveling.offense.upgrades.2.name";
    super(player, save, name);
    this.Name = name;
    this.Visible = true;
    this.Unlocked = true;
    this.ShowRequirement = () => {
      return kick.Count.gte(1);
    }
  }

  public OnComplete = (completions: Decimal): void => {
    this.Count = this.Count.plus(completions);
  };
}

export class Elbow extends AllocatableProgress {
  public MaxAllocated: Decimal = $derived(new Decimal(9500 * (Math.pow(.9, Game.Player.CultivationAmount[3]))));
  public OvercapStep: Decimal = $derived(new Decimal(Decimal.max((this.MaxAllocated.div(Game.Engine.TickSpeed)).ceil(), Decimal.ONE)));
  public SpeedLimit: Decimal = $state(new Decimal(75));
  public Name: string;
  public Description: string = "leveling.offense.upgrades.3.description";
  public Requirement: () => boolean = () => true;
  public AllocatedAmount: Decimal = $state(Decimal.ZERO);
  public Unlocked: boolean = true;
  public PowerFactor: Decimal = $derived(Decimal.ONE);
  public SpeedFactor: Decimal = $state(new Decimal(150));
  public GainFactor: Decimal = $state(Decimal.ONE);
  public ShowRequirement: () => boolean;

  constructor(player: Player, save: Saves, strike: Strike) {
    let name = "leveling.offense.upgrades.3.name";
    super(player, save, name);
    this.Name = name;

    this.Visible = true;
    this.Unlocked = true;
    this.ShowRequirement = () => {
      return strike.Count.gte(1);
    }
  }

  public OnComplete = (completions: Decimal): void => {
    this.Count = this.Count.plus(completions);
  };
}

export class Sweep extends AllocatableProgress {
  public MaxAllocated: Decimal = $derived(new Decimal(13000 * (Math.pow(.9, Game.Player.CultivationAmount[4]))));
  public OvercapStep: Decimal = $derived(new Decimal(Decimal.max((this.MaxAllocated.div(Game.Engine.TickSpeed)).ceil(), Decimal.ONE)));
  public SpeedLimit: Decimal = $state(new Decimal(80));
  public Name: string;
  public Description: string = "leveling.offense.upgrades.4.description";
  public Requirement: () => boolean = () => true;
  public AllocatedAmount: Decimal = $state(Decimal.ZERO);
  public Unlocked: boolean = true;
  public PowerFactor: Decimal = $derived(Decimal.ONE);
  public SpeedFactor: Decimal = $state(new Decimal(175));
  public GainFactor: Decimal = $state(Decimal.ONE);
  public ShowRequirement: () => boolean;

  constructor(player: Player, save: Saves, elbow: Elbow) {
    let name = "leveling.offense.upgrades.4.name";
    super(player, save, name);
    this.Name = name;

    this.Visible = true;
    this.Unlocked = true;
    this.ShowRequirement = () => {
      return elbow.Count.gte(1);
    }
  }

  public OnComplete = (completions: Decimal): void => {
    this.Count = this.Count.plus(completions);
  };
}

export class Parry extends AllocatableProgress {
  public MaxAllocated: Decimal = $derived(new Decimal(16500 * (Math.pow(.9, Game.Player.CultivationAmount[5]))));
  public OvercapStep: Decimal = $derived(new Decimal(Decimal.max((this.MaxAllocated.div(Game.Engine.TickSpeed)).ceil(), Decimal.ONE)));
  public SpeedLimit: Decimal = $state(new Decimal(100));
  public Name: string;
  public Description: string = "leveling.offense.upgrades.5.description";
  public Requirement: () => boolean = () => true;
  public AllocatedAmount: Decimal = $state(Decimal.ZERO);
  public Unlocked: boolean = true;
  public PowerFactor: Decimal = $derived(Decimal.ONE);
  public SpeedFactor: Decimal = $state(new Decimal(250));
  public GainFactor: Decimal = $state(Decimal.ONE);
  public ShowRequirement: () => boolean;

  constructor(player: Player, saves: Saves, sweep: Sweep) {
    let name = "leveling.offense.upgrades.5.name";
    super(player, saves, name);
    this.Name = name;
    this.Visible = true;
    this.Unlocked = true;
    this.ShowRequirement = () => {
      return sweep.Count.gte(1);
    }
  }

  public OnComplete = (completions: Decimal): void => {
    this.Count = this.Count.plus(completions);
  };
}


export enum OffenseEnum {
  Punch,
  Kick,
  Strike,
  Elbow,
  Sweep,
  Parry,
}

export enum DefenceEnum {
  Dodge,
  Flexibility,
  Block,
  Conditioning,
  Footwork,
  Lock,
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

