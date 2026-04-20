import type { Engine } from "../Engine.svelte.ts";
import type { Player } from "../Player.svelte.ts";
import type { Saves } from "../Saves.ts";
import { DefenceEnum, OffenseEnum, type MagicEnum, type AllocatableProgress, Punch, Kick, Strike, Elbow, Sweep, Parry } from "./LevelingRepo.svelte.ts";

export class Levelilng {
  private _player: Player;

  private _offenseRepo;
  private _defenceRepo;
  private _magicRepo;

  public get OffenseRepo() { return this._offenseRepo; }
  public get DefenceRepo() { return this._defenceRepo; }
  public get MagicRepo() { return this._magicRepo; }

  constructor(engine: Engine, player: Player, saves: Saves) {
    this._player = player;

    let punch = new Punch(this._player, saves);
    let kick = new Kick(this._player, saves, punch);
    let strike = new Strike(this._player, saves, kick);
    let elbow = new Elbow(this._player, saves, strike);
    let sweep = new Sweep(this._player, saves, elbow);
    let parry = new Parry(this._player, saves, sweep);

    this._offenseRepo = new Map<OffenseEnum, AllocatableProgress>([
      [OffenseEnum.Punch, punch],
      [OffenseEnum.Kick, kick],
      [OffenseEnum.Strike, strike],
      [OffenseEnum.Elbow, elbow],
      [OffenseEnum.Sweep, sweep],
      [OffenseEnum.Parry, parry],
    ]);

    this._defenceRepo = new Map<DefenceEnum, AllocatableProgress>([
      //      [DefenceEnum.Dodge, new Dodge(this._player)],
      //      [DefenceEnum.Flexibility, new Flexibility(this._player)],
      //      [DefenceEnum.Block, new Block(this._player)],
      //      [DefenceEnum.Conditioning, new Conditioning(this._player)],
      //      [DefenceEnum.Footwork, new Footwork(this._player)],
      //      [DefenceEnum.Lock, new Lock(this._player)],
    ]);
    this._magicRepo = new Map<MagicEnum, AllocatableProgress>();

    engine.Tick.add((tick) => {
      this.OffenseRepo.values().forEach((v) => {
        v.NextTick(tick.total_ticks);
      })
    });
    engine.Tick.add((tick) => {
      this.DefenceRepo.values().forEach((v) => {
        v.NextTick(tick.total_ticks);
      })
    })
    engine.Tick.add((tick) => {
      this.MagicRepo.values().forEach((v) => {
        v.NextTick(tick.total_ticks);
      })
    })
  }
}
