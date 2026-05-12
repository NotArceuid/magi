import { Decimal } from "../utils/BreakInfinity/Decimal.svelte";

export enum Enemy {
  YoungMan,
  LightClone,
  LightHound,
  LightBeast,
  HatMan,
  Alleyway,
  CondensedSlime,
  TunnelSludge,
}

export const BattleRegistry: Record<Enemy, IEnemyConfig> = {
  [Enemy.YoungMan]: {
    Name: "combat.enemies.0.name",
    Description: "combat.enemies.0.lore",
    Icon: "enemies/youngman.png",
    Health: new Decimal(25),
    AtkSpeedDivider: new Decimal(7),
    Resistance: [],
    Damage: new Decimal(0),
    AtkSpeed: new Decimal(0),
    Regen: new Decimal(0),
    OnDeath: () => { },
  },
  [Enemy.LightClone]: {
    Name: "combat.enemies.1.name",
    Description: "combat.enemies.1.lore",
    Icon: "enemies/lightclone.png",
    Health: new Decimal(2.5e4),
    Damage: new Decimal(1e4),
    Resistance: [],
    AtkSpeedDivider: new Decimal(8),
    AtkSpeed: new Decimal(1),
    Regen: new Decimal(0),
    OnDeath: () => { },
  },
  [Enemy.LightHound]: {
    Name: "combat.enemies.2.name",
    Description: "combat.enemies.2.lore",
    Icon: "enemies/lighthound.png",
    Health: new Decimal(1000),
    Resistance: [],
    Damage: new Decimal(10),
    AtkSpeed: new Decimal(10),
    AtkSpeedDivider: new Decimal(10),
    Regen: new Decimal(0),
    OnDeath: () => { },
  },
  [Enemy.LightBeast]: {
    Name: "combat.enemies.3.name",
    Description: "combat.enemies.3.lore",
    Icon: "enemies/lightbeast.png",
    Health: new Decimal(1000),
    Damage: new Decimal(100),

    Resistance: [],
    AtkSpeed: new Decimal(10),
    AtkSpeedDivider: new Decimal(100),
    Regen: new Decimal(0),
    OnDeath: () => { },
  },
  [Enemy.HatMan]: {
    Name: "combat.enemies.4.name",
    Description: "combat.enemies.4.lore",
    Icon: "enemies/hatman.png",
    Health: new Decimal(1000),
    Damage: new Decimal(100),
    AtkSpeed: new Decimal(10),
    Resistance: [],
    AtkSpeedDivider: new Decimal(100),
    Regen: new Decimal(0),
    OnDeath: () => { },
  },
  [Enemy.Alleyway]: {
    Name: "combat.enemies.5.name",
    Description: "combat.enemies.5.lore",
    Icon: "enemies/alleyway.png",
    Health: new Decimal(1000),
    Damage: new Decimal(100),
    AtkSpeed: new Decimal(10),
    AtkSpeedDivider: new Decimal(100),
    Resistance: [],
    Regen: new Decimal(0),
    OnDeath: () => { },
  },
  [Enemy.CondensedSlime]: {
    Name: "combat.enemies.6.name",
    Description: "combat.enemies.6.lore",
    Icon: "enemies/condensedslime.png",
    Health: new Decimal(1000),
    Damage: new Decimal(100),
    AtkSpeed: new Decimal(10),
    AtkSpeedDivider: new Decimal(100),
    Regen: new Decimal(0),
    Resistance: [],
    OnDeath: () => { },
  },
  [Enemy.TunnelSludge]: {
    Name: "combat.enemies.7.name",
    Description: "combat.enemies.7.lore",
    Icon: "enemies/tunnel.png",
    Health: new Decimal(1000),
    Damage: new Decimal(100),
    AtkSpeed: new Decimal(10),
    Resistance: [],
    AtkSpeedDivider: new Decimal(100),
    Regen: new Decimal(0),
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
  Regen: Decimal;
  Icon: string;
  Resistance: Decimal[];
  OnDeath?: () => void;
}
