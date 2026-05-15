import { Decimal } from "$lib/utils/BreakInfinity/Decimal.svelte"
import type { MultiplierBase } from "$lib/utils/Multipliers.svelte";
import { ReactiveText } from "$lib/utils/ReactiveText.svelte";

export interface IProgress {
  Max: MultiplierBase;
  Taken: Decimal;
}

export class Progress implements IProgress {
  constructor(Max: MultiplierBase) {
    this.Max = $state(Max);
  }

  Max: MultiplierBase;
  Taken: Decimal = $state(Decimal.ZERO);
  public Get(): Decimal {
    return this.Max.Get().minus(this.Taken);
  }

  public Set(value: Decimal): void {
    this.Taken = value;
  }

  format(): ReactiveText {
    return new ReactiveText(this.Get().format() + "/" + this.Max.Get().format());
  }
}
