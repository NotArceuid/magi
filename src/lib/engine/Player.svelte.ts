import { Progress } from "$lib/components/common/IProgress.svelte.ts";
import type { Engine } from "./Engine.svelte.ts";
import type { Saves } from "./Saves.ts";
import { Decimal } from "./utils/BreakInfinity/Decimal.svelte.ts";
import { MultiplierBase, MultiplierType } from "./utils/Multipliers.svelte.ts";

export class Player {
  public readonly DamageMultiplier = MultiplierBase.default();
  public readonly AttackSpeedMultiplier = MultiplierBase.default();
  public readonly HealthMultiplier = new MultiplierBase(100);
  public readonly HealthRegen = MultiplierBase.default();
  public readonly EnergyCapMultiplier = new MultiplierBase(10000);
  public readonly DamageReduction = MultiplierBase.default();
  public readonly Resistance: MultiplierBase[] = [
    MultiplierBase.default(),
    MultiplierBase.default(),
    MultiplierBase.default(),
    MultiplierBase.default(),
    MultiplierBase.default()
  ]

  // only if there's a { get; set; }
  // god i miss c# so much

  public Name: string = $state("Arcc");
  public Icon: string = $state("/mc.png");

  public Money: Decimal = Decimal.ZERO;
  public Energy: Progress = new Progress(new MultiplierBase(100));
  public readonly Health = new Progress(this.HealthMultiplier);
  public readonly Damage = $derived(this.DamageMultiplier.Get());
  public AllocationAmount: Decimal = $state(Decimal.ONE);
  public Playtime: number = $state(0);
  public RebirthCount: number = $state(0);

  private readonly SAVEKEY = "player";
  private _engine: Engine;
  constructor(engine: Engine, save: Saves) {
    this._engine = engine;

    this._engine.Tick.add(() => this.HealPlayer());

    save.SaveCallback<IPlayerSaves>(this.SAVEKEY, () => {
      return {
        //@ts-ignore
        version: PKG_VERSION,
        playtime: this.Playtime,
        savetime: new Date().getTime(),
        name: this.Name,
      }
    });

    setInterval(() => {
      this.Playtime += 1
    }, 1000);

    // TODO: SAVES
    save.LoadCallback<IPlayerSaves>(this.SAVEKEY, (data: IPlayerSaves) => {

    });

    let _self = this;
    this.HealthRegen.Set("base", {
      priority: 0,
      value: function(): Decimal {
        return _self.Health.Get().mul(0.01);
      },
      type: MultiplierType.Additive
    });
  }

  public HealPlayer() {
    this.Health.Set(
      Decimal.max(Decimal.ZERO, this.Health.Taken.minus(this.HealthRegen.Get()))
    );
  }

  public DealDamage(): Decimal {
    let damage = this.DamageMultiplier.Get();
    return damage;
  }

  public TakeDamage(damage: Decimal): void {
    if (damage.lte(0)) return;
    const actualDamage = damage.mul(Decimal.sub(1, this.DamageReduction.Get()));
    this.Health.Set(
      Decimal.min(this.Health.Max.Get(), this.Health.Taken.plus(actualDamage))
    );
  }
}

interface IPlayerSaves {
  version: string,
  playtime: number,
  savetime: number,
  name: string,
}
