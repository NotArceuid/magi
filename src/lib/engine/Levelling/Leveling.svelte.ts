import type { ConsoleCommandManager } from "../Command.ts";
import type { Engine } from "../Engine.svelte.ts";
import type { Player } from "../Player.svelte.ts";
import type { Saves } from "../Saves.ts";
import { InvokeableEvent } from "../utils/Events.ts";
import { DefenceEnum, OffenseEnum, type MagicEnum, type AllocatableProgress, Punch, Kick, Strike, Elbow, Sweep, Parry, Dodge, Flexibility, Block, Conditioning, Footwork, Lock } from "./LevelingRepo.svelte.ts";

export class Levelilng {
  private _player: Player;

  private _offenseRepo;
  private _defenceRepo;
  private _magicRepo;

  public ShowAllBasic: InvokeableEvent<void> = new InvokeableEvent();

  public get OffenseRepo() { return this._offenseRepo; }
  public get DefenceRepo() { return this._defenceRepo; }
  public get MagicRepo() { return this._magicRepo; }

  constructor(engine: Engine, player: Player, saves: Saves, _console: ConsoleCommandManager) {
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

    let dodge = new Dodge(this._player, saves);
    let flexibility = new Flexibility(this._player, saves, dodge);
    let block = new Block(this._player, saves, flexibility);
    let conditioning = new Conditioning(this._player, saves, block);
    let footwork = new Footwork(this._player, saves, conditioning);
    let lock = new Lock(this._player, saves, footwork);

    this._defenceRepo = new Map<DefenceEnum, AllocatableProgress>([
      [DefenceEnum.Dodge, dodge],
      [DefenceEnum.Flexibility, flexibility],
      [DefenceEnum.Block, block],
      [DefenceEnum.Conditioning, conditioning],
      [DefenceEnum.Footwork, footwork],
      [DefenceEnum.Lock, lock],
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

    this.register_commands(_console, this._offenseRepo, this._defenceRepo);
  }

  private register_commands(_console: ConsoleCommandManager, offense: Map<OffenseEnum, AllocatableProgress>, defence: Map<DefenceEnum, AllocatableProgress>) {
    _console.registerCommand({
      name: "show_basic",
      description: "shows basic attacks",
      execute: function(args: string[]): void {
        if (args.length == 0)
          return;

        let idx = args.length == 1 ? -1 : args[1];
        switch (args[0]) {
          case "offense":
            idx == -1 ? offense.forEach((progress) => {
              progress.Visible = true;
            }) : offense.entries().toArray().at(Number(idx))![1].Visible = true;
            break;
          case "defence":
            idx == -1 ? defence.forEach((progress) => {
              progress.AllocatedAmount = progress.AllocationTarget;
            }) : defence.entries().toArray().at(Number(idx))![1].Visible = true;
            break;
        }
      }
    })

    _console.registerCommand({
      name: "max_leveling",
      description: "set allocated amount to allocation target",
      execute: function(args: string[]): void {
        if (args.length < 1)
          return;

        let idx = args.length == 1 ? -1 : args[1];
        switch (args[0]) {
          case "offense":
            idx == -1 ? offense.forEach((progress) => {
              progress.AllocatedAmount = progress.AllocationTarget;
            }) : offense.entries().toArray().at(Number(idx))![1].AllocatedAmount = offense.entries().toArray().at(Number(idx))![1].AllocationTarget;
            break;
          case "defence":
            idx == -1 ? defence.forEach((progress) => {
              progress.AllocatedAmount = progress.AllocationTarget;
            }) : defence.entries().toArray().at(Number(idx))![1].AllocatedAmount = offense.entries().toArray().at(Number(idx))![1].AllocationTarget;
            break;
        }
      }
    })
  }
}
