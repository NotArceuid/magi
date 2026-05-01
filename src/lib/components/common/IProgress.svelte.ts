import { Decimal } from "$lib/engine/utils/BreakInfinity/Decimal.svelte"
import type { MultiplierBase } from "$lib/engine/utils/Multipliers";
import { ReactiveText } from "$lib/engine/utils/ReactiveText.svelte";

export interface IProgress {
  Value: Decimal;
  Max: Decimal;
  Min: Decimal;
}

export class Progress implements IProgress {
  get Value(): Decimal { return this.raw.Value.multiply(this.value_multiplier?.Get() ?? Decimal.ONE) }
  set Value(value) { this.raw.Value = value; }
  get Max(): Decimal { return this.raw.Max.multiply(this.max_multiplier?.Get() ?? Decimal.ONE) }
  get Min(): Decimal { return this.raw.Min.multiply(this.min_multiplier?.Get() ?? Decimal.ONE) }

  private raw: IProgress;
  private value_multiplier?: MultiplierBase;
  private max_multiplier?: MultiplierBase;
  private min_multiplier?: MultiplierBase;

  constructor(raw: IProgress, value_multiplier?: MultiplierBase, max_multiplier?: MultiplierBase, min_multiplier?: MultiplierBase) {
    this.raw = $state(raw);
    this.value_multiplier = $state(value_multiplier);
    this.max_multiplier = $state(max_multiplier);
    this.min_multiplier = $state(min_multiplier);
  }

  format(): ReactiveText {
    return new ReactiveText(this.Value.format() + "/" + this.Max.format());
  }
}
