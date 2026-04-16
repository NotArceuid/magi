import type { IProgress, IProgressGain } from "$lib/components/common/IProgress";
import { Player } from "../Player.svelte";
import { Decimal } from "../utils/BreakInfinity/Decimal.svelte";

export abstract class AllocatableProgress {
  public abstract AllocatedAmount: Decimal;
  public abstract AllocatedPower: Decimal;
  public abstract Name: string;
  public abstract Description: string;
  public abstract Requirement: () => boolean;
  public abstract Progress: IProgressGain;
  public abstract Count: Decimal;
  public abstract Cap: Decimal;
  public abstract BaseGain: Decimal;
  public abstract OnComplete: (completions: Decimal) => void;
  public abstract NextTick: () => void;
  public abstract Unlocked: boolean;
  public abstract Amount: number;

  protected _player: Player;
  constructor(player: Player) {
    this._player = player;
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

  public get AllocationRatio(): Decimal {
    if (this.Cap.lte(Decimal.ZERO)) return new Decimal(1);
    return Decimal.min(this.AllocatedAmount.divide(this.Cap), new Decimal(1));
  }

  public get ProgressMin(): Decimal {
    const overcap = this.AllocatedAmount.minus(this.Cap);
    if (overcap.lte(Decimal.ZERO))
      return Decimal.ZERO;

    const ratio = Decimal.min(overcap.divide(this.Cap), new Decimal(1));
    return ratio.multiply(this.Progress.Max).floor();
  }

  public get CurrentGain(): Decimal {
    const { Max } = this.Progress;
    const min = this.ProgressMin;
    const range = Max.minus(min);
    return this.BaseGain.plus(this.AllocationRatio.multiply(range.minus(this.BaseGain)));
  }
}

export class Punch extends AllocatableProgress {
  public Name: string = "leveling.offense.upgrades.0.name";
  public Description: string = "leveling.offense.upgrades.0.description";
  public Requirement: () => boolean = () => true;
  public AllocatedAmount: Decimal = $state(Decimal.ZERO);
  public AllocatedPower: Decimal = $state(Decimal.ZERO);
  public Cap: Decimal = $state(new Decimal(10000));
  public BaseGain: Decimal = $state(Decimal.ZERO);
  public Count: Decimal = $state(Decimal.ZERO);
  public Unlocked: boolean = true;
  public Amount: number = $derived(1);
  public Progress: IProgressGain = $state({
    Max: new Decimal(100),
    Min: Decimal.ZERO,
    Value: Decimal.ZERO,
    Gain: Decimal.ZERO,
  });

  public OnComplete = (completions: Decimal): void => {
    this.Count = this.Count.plus(completions);
  };

  public NextTick = (): void => {
    const min = this.ProgressMin;
    const gain = this.CurrentGain;

    this.Progress.Min = min;
    this.Progress.Gain = gain;
    this.Progress.Value = this.Progress.Value.plus(gain);

    if (this.Progress.Value.gte(this.Progress.Max)) {
      this.Progress.Value = min;
      this.OnComplete(new Decimal(this.Amount));
    }
  };
}

export enum OffenseEnum {
  Punch,
  Kick,
  SeriousPunch,
  PalmBlast,
  Quake,
  Crumble,
  DadBelt,
}

export enum DefenceEnum {
  Brace,
  SideStep,
  Dodge,
  IronSkin,
  PrismBarrier,
  MetaShield,
  NokiaArmor,
}


export enum MagicEnum {

}
