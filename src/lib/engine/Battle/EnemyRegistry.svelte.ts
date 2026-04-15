import { Decimal } from "../utils/BreakInfinity/Decimal.svelte";

export enum Enemy {
  OldMan,
  // Zone 1 (Forest Enemies)
  //  Leaf, SmallRock, Stick, Bush, Tree, WeepingWillow,
  // Zone 2 (Home)
  //  Dog, Rat, Cat, Mom, Dad,
  // Zone 3 (School - enroll to school)
  //  Nerd, SmallBully, Bully, BigBully, BullyBoss, // (Big g) 
  // Zone 4 (Enchanted forest - school trip)
  //  Hound, WolfHound, CorruptedHound, BoundedBeast,
  // unlock hunt here

  // Raid on school
  //  MinorBeast, FrostBeast, FlameBeast, DemonicBeast,
}

export const EnemyRegistry: Record<Enemy, IEnemyConfig> = {
  [Enemy.OldMan]: {
    Name: "Old Man",
    Description: "A frail old man.",
    Icon: "",
    Health: new Decimal(10),
    Damage: new Decimal(0),
    AtkSpeed: new Decimal(0),
    BaseTick: 0,
    OnDeath: () => { },
  },
};

export interface IEnemyConfig {
  Name: string;
  Description: string;
  Health: Decimal;
  Damage: Decimal;
  AtkSpeed: Decimal;
  BaseTick: number;
  Icon: string;
  OnDeath?: () => void;
}
