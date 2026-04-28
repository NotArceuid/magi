import { dev } from "$app/environment";
import { Progress, type IProgress } from "$lib/components/common/IProgress.svelte.ts";
import type { Engine } from "./Engine.svelte.ts";
import type { Saves } from "./Saves.ts";
import { Decimal } from "./utils/BreakInfinity/Decimal.svelte.ts";
import { MultiplierBase } from "./utils/Multipliers.ts";

export class Player {
  _player = $state<IPlayer>({
    Name: "Player",
    Health: {
      Max: new Decimal(100),
      Min: new Decimal(0),
      Value: new Decimal(100),
    },
    Mana: {
      Max: new Decimal(100),
      Min: new Decimal(0),
      Value: new Decimal(100),
    },
    Energy: {
      Max: new Decimal(10000),
      Min: new Decimal(0),
      Value: new Decimal(dev ? 10000 : 0),
    },
    RebirthCount: 0,
    RebirthFactor: Decimal.ZERO,
    Playtime: 0,
    SaveTime: 0,
    Money: new Decimal(0),
    AllocationAmount: Decimal.ONE,
    cultivationamount: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  });

  public readonly HealthRegen = new MultiplierBase();
  public readonly AtkSpeedDivider = new MultiplierBase();
  public readonly DamageMultiplier = new MultiplierBase();
  public readonly AttackSpeedMultiplier = new MultiplierBase();
  public readonly HealthMultiplier = new MultiplierBase();
  public readonly EnergyCapMultiplier = new MultiplierBase();

  get Name() { return this._player.Name; }
  set Name(val) { this._player.Name = val; }
  get Money() { return this._player.Money; }
  set Money(value) { this._player.Money = value; }

  public readonly Health = new Progress(this._player.Health, MultiplierBase.default(), this.HealthMultiplier);
  public readonly Damage = $derived(this.DamageMultiplier.Get());
  public readonly Mana: IProgress = this._player.Mana;
  public readonly Energy: IProgress = new Progress(this._player.Energy, MultiplierBase.default(),)
  get AllocationAmount(): Decimal { return this._player.AllocationAmount; }
  set AllocationAmount(val) { this._player.AllocationAmount = val }
  public get Icon() { return "/mc.png"; }
  get RebirthCount() { return this._player.RebirthCount; }
  set RebirthCount(val) { this._player.RebirthCount = val; }
  get RebirthFactor() { return this._player.RebirthFactor; }
  set RebirthFactor(val) { this._player.RebirthFactor = val; }
  get CultivationAmount() { return this._player.cultivationamount; }

  private readonly SAVEKEY = "player";
  private _engine: Engine;
  constructor(engine: Engine, save: Saves) {
    this._engine = engine;

    this._engine.Tick.add(() => this.HealPlayer());
    save.SaveCallback<IPlayerSaves>(this.SAVEKEY, () => {
      return {
        //@ts-ignore
        version: PKG_VERSION,
        playtime: this._player.Playtime,
        savetime: new Date().getTime(),
        name: this.Name,
        money: this.Money,
        mana: this.Mana,
        energy: this.Energy,
        health: this.Health,
        allocationAmount: this.AllocationAmount,
        rebirthcount: this.RebirthCount,
        rebirthfactor: this.RebirthFactor,
        cultivationamount: this.CultivationAmount
      }
    });

    setInterval(() => {
      this._player.Playtime += 1
    }, 1000);

    save.LoadCallback<IPlayerSaves>(this.SAVEKEY, (data: IPlayerSaves) => {
      this._player.Money = data.money;
      this._player.SaveTime = data.savetime;
      this._player.Name = data.name
      this._player.Playtime = data.playtime;
      this._player.Health = data.health;
      this._player.Mana = data.mana;
      this._player.AllocationAmount = data.allocationAmount;
      this._player.RebirthCount = data.rebirthcount;
      this._player.RebirthFactor = data.rebirthfactor;
    });
  }

  public HealPlayer() {
    this._player.Health.Value = Decimal.min(this.Health.Max, this._player.Health.Value.plus(this.HealthRegen.Get()));
  }

  public Tick(elapsed: number, divider: Decimal = Decimal.ONE): boolean {
    let tick = Math.floor(divider.div(this.AttackSpeedMultiplier.Get()).toNumber());
    return elapsed % tick == 0;
  }

  public DealDamage(): Decimal {
    let damage = this.DamageMultiplier.Get();
    return damage;
  }

  public TakeDamage(damage: Decimal): void {
    if (damage.lte(0)) return;
    this.Health.Value = Decimal.max(Decimal.ZERO, this.Health.Value.minus(damage));
  }
}

interface IPlayerSaves {
  version: string,
  playtime: number,
  savetime: number,
  name: string,
  money: Decimal,
  mana: IProgress;
  health: IProgress;
  energy: IProgress;
  allocationAmount: Decimal;
  rebirthcount: number;
  cultivationamount: number[];
  rebirthfactor: Decimal;
}

interface IPlayer {
  Name: string;
  Playtime: number,
  SaveTime: number,
  Money: Decimal;
  Health: IProgress;
  Mana: IProgress;
  AllocationAmount: Decimal;
  Energy: IProgress;
  RebirthCount: number,
  RebirthFactor: Decimal,
  cultivationamount: number[],
}
