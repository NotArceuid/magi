import type { Player } from "../Player.svelte";
import type { AbilityBase } from "./Abilities.svelte";
import type { EnemyBase } from "./Enemies.svelte";
import { AbilityRegistry, AbilityEnum } from "./AbilityRegistry.svelte";

export class Combat {
  public Elements: number = $state(0);
  public Fighting: boolean = $state(false);

  // INFO: 
  // 1. Fire 
  // 2. Block
  // 3. Elmental skill 
  // 4. Elemental skill
  //
  // TODO: SWITCH THIS OUT WIHT AN INACTIVE VERSION OF THE SKILL
  // AND REMOVE UNDEFINED
  public Abilities: [fire: AbilityBase, block: AbilityBase, skill_1: AbilityBase | undefined, skill_2: AbilityBase | undefined];
  public readonly SwitchAbility: Array<AbilityBase | undefined>;
  private AbilityMap: [fire: AbilityBase, skill_1: AbilityBase, skill_2: AbilityBase][];

  constructor(player: Player) {
    this.Abilities = $state(
      [undefined!, AbilityRegistry[AbilityEnum.Block](player), undefined!, undefined!]
    );
    this.SwitchAbility = [AbilityRegistry[AbilityEnum.SwitchPurity](player), undefined, undefined, undefined, undefined]
    this.AbilityMap = [[AbilityRegistry[AbilityEnum.FirePurity](player), undefined!, undefined!]];

    this.SwitchElement(0);
  }

  public SwitchEnemies(enemy: EnemyBase | undefined) {
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
    this.Elements = element;

    this.Abilities[0] = this.AbilityMap[element][0];
    this.Abilities[2] = this.AbilityMap[element][1];
    this.Abilities[3] = this.AbilityMap[element][2];

    this.SwitchEnemies(currentEnemy);
  }
}
