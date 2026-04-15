import type { Decimal } from "$lib/engine/utils/BreakInfinity/Decimal.svelte"

export interface IProgress {
  Value: Decimal;
  Max: Decimal;
  Min: Decimal;
}

export interface IProgressGain extends IProgress {
  Gain: Decimal
}
