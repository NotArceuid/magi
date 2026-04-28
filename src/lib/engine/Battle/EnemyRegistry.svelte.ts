import { Decimal } from "../utils/BreakInfinity/Decimal.svelte";

export enum Enemy {
  YoungMan,
  LightClone,
  LightHound,
  LightBeast,
  HatMan,
}

export const EnemyRegistry: Record<Enemy, IEnemyConfig> = {
  [Enemy.YoungMan]: {
    Name: "combat.enemies.0.name",
    Description: "combat.enemies.0.lore",
    Icon: "/youngman.png",
    Health: new Decimal(25),
    AtkSpeedDivider: new Decimal(100),
    Damage: new Decimal(0),
    AtkSpeed: new Decimal(0),
    OnDeath: () => { },
  },
  [Enemy.LightClone]: {
    Name: "combat.enemies.1.name",
    Description: "combat.enemies.1.lore",
    Icon: "/lightclone.png",
    Health: new Decimal(2.5e6),
    Damage: new Decimal(1e4),
    AtkSpeedDivider: new Decimal(100),
    AtkSpeed: new Decimal(1),
    OnDeath: () => { },
  },
  [Enemy.LightHound]: {
    Name: "combat.enemies.2.name",
    Description: "combat.enemies.2.lore",
    Icon: "/lightclone.png",
    Health: new Decimal(1000),
    Damage: new Decimal(10),
    AtkSpeed: new Decimal(10),
    AtkSpeedDivider: new Decimal(10),
    OnDeath: () => { },
  },
  [Enemy.LightBeast]: {
    Name: "combat.enemies.3.name",
    Description: "combat.enemies.3.lore",
    Icon: "/lightclone.png",
    Health: new Decimal(1000),
    Damage: new Decimal(100),
    AtkSpeed: new Decimal(10),
    AtkSpeedDivider: new Decimal(100),
    OnDeath: () => { },
  },
  [Enemy.HatMan]: {
    Name: "combat.enemies.4.name",
    Description: "combat.enemies.4.lore",
    Icon: "/lightclone.png",
    Health: new Decimal(1000),
    Damage: new Decimal(100),
    AtkSpeed: new Decimal(10),
    AtkSpeedDivider: new Decimal(100),
    OnDeath: () => { },
  },
};

export interface IEnemyConfig {
  Name: string;
  Description: string;
  Health: Decimal;
  Damage: Decimal;
  AtkSpeed: Decimal;
  AtkSpeedDivider: Decimal;
  Icon: string;
  OnDeath?: () => void;
}
