import { Decimal } from "$lib/engine/utils/BreakInfinity/Decimal.svelte"
import type { MultiplierBase } from "$lib/engine/utils/Multipliers.svelte.ts";
import { ReactiveText } from "$lib/engine/utils/ReactiveText.svelte";

export interface IProgress {
  Max: MultiplierBase;
  Taken: Decimal;
}

export class Progress implements IProgress {
  constructor(Max: MultiplierBase) {
    this.Max = Max;
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
