import type { IProgressGain } from "$lib/components/common/IProgress.ts";
import type { AbilityBase } from "./Battle/Abilities.svelte.ts";
import type { Engine } from "./Engine.svelte.ts";
import type { Saves } from "./Saves.ts";
import { Decimal } from "./utils/BreakInfinity/Decimal.svelte.ts";

export class Player {
  _player = $state<IPlayer>({
    Name: "Player",
    Health: {
      Max: new Decimal(100),
      Min: new Decimal(0),
      Value: new Decimal(100),
      Gain: new Decimal(0.01),
    },
    Mana: {
      Max: new Decimal(100),
      Min: new Decimal(0),
      Value: new Decimal(100),
      Gain: new Decimal(0.01),
    },
    Energy: {
      Max: new Decimal(100),
      Min: new Decimal(0),
      Value: new Decimal(100),
      Gain: new Decimal(0.01),
    },
    Playtime: 0,
    SaveTime: 0,
    Money: new Decimal(0),
    AllocationAmount: Decimal.ONE
  });

  get Name() { return this._player.Name; }
  set Name(val) { this._player.Name = val; }
  get Money() { return this._player.Money; }
  set Money(value) { this._player.Money = value; }
  get Health(): IProgressGain { return this._player.Health; }
  get Mana(): IProgressGain { return this._player.Mana; }
  get Energy(): IProgressGain { return this._player.Energy; }
  get AllocationAmount(): Decimal { return this._player.AllocationAmount; }
  set AllocationAmount(val) { this._player.AllocationAmount = val }
  public get Icon() { return ""; }

  private get SAVEKEY(): string { return "player" };
  private _engine: Engine;
  constructor(engine: Engine, save: Saves) {
    this._engine = engine;

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
    });
  }

  public Damage: Decimal = $state(Decimal.ONE);
  public AtkSpeed: Decimal = $state(Decimal.ONE);
  public Abilities: AbilityBase[] = $state([]);
  public get BaseTick(): number {
    const speed = this.AtkSpeed.toNumber();
    return speed >= 60 ? 1 : Math.max(1, Math.ceil(60 / speed));
  }

  public CurrentTick: number = 1;

  public Tick(): boolean {
    if (this.CurrentTick <= 1) {
      this.CurrentTick = this.BaseTick;
      return true;
    }
    this.CurrentTick--;
    return false;
  }

  public DealDamage(): Decimal {
    return this.Abilities.reduce(
      (total, ability) => total.add(ability.DealDamage(this.Damage)),
      Decimal.ZERO
    );
  }

  public TakeDamage(damage: Decimal): void {
    if (damage.lte(0)) return;
    this.Health.Value = Decimal.max(Decimal.ZERO, this.Health.Value.minus(damage));
    if (this.Health.Value.lte(0)) {
      this.OnDeath();
    }
  }

  public OnDeath(): void {
  }
}

interface IPlayerSaves {
  version: string,
  playtime: number,
  savetime: number,
  name: string,
  money: Decimal,
  mana: IProgressGain;
  health: IProgressGain;
  energy: IProgressGain;
  allocationAmount: Decimal;
}

interface IPlayer {
  Name: string;
  Playtime: number,
  SaveTime: number,
  Money: Decimal;
  Health: IProgressGain;
  Mana: IProgressGain;
  AllocationAmount: Decimal;
  Energy: IProgressGain;
}
