import type { EasingFunction, TransitionConfig } from "svelte/transition";

export interface TransitionParams {
  transition: (node: Element, params?: any) => TransitionConfig;
  easing?: EasingFunction;
  duration?: number;
  delay?: number;
}
