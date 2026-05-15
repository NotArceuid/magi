import type { Player } from "../Player.svelte";
import type { AbilityBase } from "./Abilities.svelte";
import type { EnemyBase } from "./Enemies.svelte";
import { AbilityRegistry, AbilityEnum } from "./AbilityRegistry.svelte";
import { Decimal } from "../../utils/BreakInfinity/Decimal.svelte";
import type { Engine } from "../Engine.svelte";

export class Combat {
  public Elements: number = $state(0);
  public Fighting: boolean = $state(false);
  public CombatText: Array<[CombatTextSrcEnum, string, object]> = $state([]);

  // INFO: 
  // 1. Fire 
  // 2. Block
  // 3. Elmental skill 
  // 4. Elemental skill
  //
  // TODO: SWITCH THIS OUT WIHT AN INACTIVE VERSION OF THE SKILL
  // AND REMOVE UNDEFINED
  // 
  // Player ability (active)
  public Abilities: [fire: AbilityBase, block: AbilityBase, skill_1: AbilityBase | undefined, skill_2: AbilityBase | undefined];
  //  abilities for switching
  public readonly SwitchAbility: Array<AbilityBase | undefined>;
  // place to put all abilites
  private AbilityMap: [fire: AbilityBase, skill_1: AbilityBase, skill_2: AbilityBase][];

  protected _player: Player;
  protected _enemy: EnemyBase | undefined;
  constructor(engine: Engine, player: Player) {
    this._player = player;

    engine.Tick.add(() => { if (this.Fighting) this._player.HealPlayer() })

    this.Abilities = $state(
      [undefined!, AbilityRegistry[AbilityEnum.Block](player, this), undefined!, undefined!]
    );
    this.SwitchAbility = [AbilityRegistry[AbilityEnum.SwitchPurity](player, this), undefined, undefined, undefined, undefined]
    this.AbilityMap = [[AbilityRegistry[AbilityEnum.FirePurity](player, this), undefined!, undefined!]];

    this.SwitchElement(0);
    // TODO: something something make this work when i add saves
    this.FirstJoin();
  }

  private FirstJoin() {
    this.Log(CombatTextSrcEnum.System, "combat.first_join");
  }

  public HealPlayer(amount: Decimal) {
    if (this.Fighting) this._player.HealPlayer(amount);
  }

  public SwitchEnemies(enemy: EnemyBase | undefined) {
    this._enemy = enemy;
    this.AbilityMap.forEach((ability) => {
      ability[0].Enemy = enemy;
      if (ability[1]) ability[1].Enemy = enemy;
      if (ability[2]) ability[2].Enemy = enemy;
    });

    this.Abilities.forEach(ability => {
      if (ability) ability.Enemy = enemy;
    });
  }

  public SwitchElement(element: number) {
    const currentEnemy = this.Abilities[0]?.Enemy;

    this.SwitchAbility[element]?.Fire();
    // fix here, in switchability,fire got startcombat alr in there
    this.StopCombat();

    this.Elements = element;

    this.Abilities[0] = this.AbilityMap[element][0];
    this.Abilities[2] = this.AbilityMap[element][1];
    this.Abilities[3] = this.AbilityMap[element][2];

    this.SwitchEnemies(currentEnemy);
  }

  public Log(src: CombatTextSrcEnum, key: string, values?: object): void {
    this.CombatText.push([src, key, values ?? {}]);
    if (this.CombatText.length > 67) this.CombatText.shift(); // unecessary and oddly specific number choice 
  }

  // Returns: dealt damage
  public DamagePlayer(damage: Decimal): Decimal {
    let dmg = this._player.TakeDamage(damage);
    if (this._player.Health.Get().lte(0)) {
      this.PlayerDied();
      return Decimal.MINUS_ONE;
    }

    return dmg
  }

  public PlayerDied() {
    this._player.Dead = true;
    this.Log(CombatTextSrcEnum.Player, "combat.death");
    this.StopCombat();
  }

  public StartCombat() {
    this.Fighting = true;

    if (this._player.Dead) {
      this._player.Dead = false;
      this.HealPlayer(this._player.Health.Max.Get());
      this._enemy?.Health.Set(Decimal.ZERO);
    }

    this.AbilityMap.forEach((ability) => {
      ability[0]?.Unfreeze();
      ability[1]?.Unfreeze();
      ability[2]?.Unfreeze();
    })

    this.SwitchAbility.forEach((ability) => {
      ability?.Unfreeze();
    })

    this.Abilities.forEach((ability) => {
      ability?.Unfreeze()
    })
  }

  public StopCombat() {
    this.Fighting = false;

    this.AbilityMap.forEach((ability) => {
      ability[0]?.Freeze();
      ability[1]?.Freeze();
      ability[2]?.Freeze();
    })

    this.SwitchAbility.forEach((ability) => {
      ability?.Freeze();
    })

    this.Abilities.forEach((ability) => {
      ability?.Freeze()
    })
  }
}

export enum CombatTextSrcEnum {
  Enemy = "combat.enemy",
  Player = "combat.player",
  System = "combat.system",
}
