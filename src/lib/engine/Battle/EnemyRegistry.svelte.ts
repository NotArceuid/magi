import { Decimal } from "../utils/BreakInfinity/Decimal.svelte";

export enum Enemy {
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

export const BattleRegistry: Record<Enemy, IEnemyConfig> = {
  [Enemy.CondensedSlime]: {
    Name: "",
    Description: "",
    Health: Decimal.ONE,
    Damage: Decimal.ONE,
    Regen: Decimal.ONE,
    Icon: "",
    Resistance: [],
    OnDeath: () => { return; },
    Attack: () => { return; }
  }
};

export interface IEnemyConfig {
  Name: string;
  Description: string;
  Icon: string;
  Health: Decimal;
  Damage: Decimal;
  Regen: Decimal;
  Resistance: Decimal[];
  OnDeath: () => void;
  Attack: () => void;
}
