import type { Engine } from "../Engine.svelte.ts";
import type { Player } from "../Player.svelte.ts";
import { OffenseEnum, type DefenceEnum, type MagicEnum, type AllocatableProgress, Punch } from "./LevelingRepo.svelte.ts";

export class Levelilng {
  private _player: Player;

  private _offenseRepo;
  private _defenceRepo;
  private _magicRepo;

  public get OffenseRepo() { return this._offenseRepo; }
  public get DefenceRepo() { return this._defenceRepo; }
  public get MagicRepo() { return this._magicRepo; }

  constructor(engine: Engine, player: Player) {
    this._player = player;

    this._offenseRepo = new Map<OffenseEnum, AllocatableProgress>([
      [OffenseEnum.Punch, new Punch(this._player)]
    ]);

    this._defenceRepo = new Map<DefenceEnum, AllocatableProgress>();
    this._magicRepo = new Map<MagicEnum, AllocatableProgress>();

    engine.Tick.add(() => {
      this.OffenseRepo.values().forEach((v) => {
        v.NextTick();
      })
    });
    engine.Tick.add(() => {
      this.DefenceRepo.values().forEach((v) => {
        v.NextTick();
      })
    })
    engine.Tick.add(() => {
      this.MagicRepo.values().forEach((v) => {
        v.NextTick();
      })
    })
  }
}
