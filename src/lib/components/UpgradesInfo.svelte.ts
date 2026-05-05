import type { ReactiveText } from "$lib/engine/utils/ReactiveText.svelte";

// yanked right form previous game, might be used later
export interface IUpgradesInfo {
  name: string;
  description: () => ReactiveText;
  Requirements: [() => ReactiveText, () => boolean];
  count: number;
  maxCount: number;
  effect?: () => ReactiveText

  getMax?: () => number;
  buyAmount: number;
  buy: () => void;
}
