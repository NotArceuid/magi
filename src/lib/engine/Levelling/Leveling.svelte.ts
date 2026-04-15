import { OffenseEnum, type DefenceEnum, type MagicEnum, type AllocatableProgress, Punch } from "./LevelingRepo.svelte.ts";

export class Levelilng {
  public readonly OffenseRepo = new Map<OffenseEnum, AllocatableProgress>([
    [OffenseEnum.Punch, new Punch()]
  ]);

  public readonly DefenceRepo = new Map<DefenceEnum, AllocatableProgress>();
  public readonly MagicRepo = new Map<MagicEnum, AllocatableProgress>();
}
