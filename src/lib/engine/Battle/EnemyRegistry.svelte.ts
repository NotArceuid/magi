import { _ } from "svelte-i18n";
import { Decimal } from "../../utils/BreakInfinity/Decimal.svelte";
import { CombatTextSrcEnum, type Combat } from "./Combat.svelte";
import type { EnemyBase } from "./Enemies.svelte";

export enum EnemyEnum {
  CondensedSlime,
  //  Tunnelsludge,
  //  MutatedRat,
  //  FeralDoggo,
  //  SludgeGolem,
  //  SludgeAbomination,
  //  CatacombsProtector,
  //  SkeletonPuppet,
  //  Weepingspirit,
  //  LostSpirit
  //  SludgeKnight,
  //  Guardianofthethreshold,
  //  AnimatedScarecrow,
  //  Pissedofffarmer,
  //  Deformedchicken,
  //  DrunkenCow,
  //  DancingCow,
  //  CowBeast,
  //  TwinCows,
}

export const EnemyRegistry: Record<EnemyEnum, IEnemyConfig> = {
  [EnemyEnum.CondensedSlime]: {
    Name: "enemies.0.name",
    Description: "",
    Icon: "",
    Health: new Decimal(25),
    Damage: new Decimal(25),
    Regen: Decimal.ZERO,
    Resistance: [],
    OnDeath: () => { return; },
    Attacks: [
      {
        weight: 1,
        cooldown: 1.5,
        execute: (combat, damage, enemy) => {
          let dmg = combat.DamagePlayer(damage);
          if (dmg.neq(Decimal.MINUS_ONE))
            combat.Log(CombatTextSrcEnum.Enemy, "combat.enemies.condensed_slime.attack.0", { values: { damage: dmg.format() } });
        }
      },
    ]
  }
};

export interface IEnemyAttack {
  weight: number;
  cooldown: number;
  execute: (combat: Combat, damage: Decimal, enemy: EnemyBase) => void;
}

export interface IEnemyConfig {
  Name: string;
  Description: string;
  Icon: string;
  Health: Decimal;
  Damage: Decimal;
  Regen: Decimal;
  Resistance: Decimal[];
  OnDeath: () => void;
  Attacks: IEnemyAttack[];  // Changed from Attack
}
