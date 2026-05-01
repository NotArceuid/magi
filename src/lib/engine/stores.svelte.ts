import { Settings } from "$lib/components/settings/Settings.svelte.ts";
import { Achievement } from "./Achievements.svelte";
import { Adventure } from "./Battle/Adventure.svelte";
import { Dungeon } from "./Battle/Dungeon.svelte";
import { ConsoleCommandManager } from "./Command";
import { Engine } from "./Engine.svelte";
import { Inventory } from "./Inventory/Inventory.svelte";
import { Levelilng } from "./Levelling/Leveling.svelte";
import { Player } from "./Player.svelte";
import { Saves } from "./Saves";


const console_command = new ConsoleCommandManager();
const saves = new Saves();
const engine = new Engine({}, console_command);
const player = new Player(engine, saves);
export const Game: IGame = $state({
  Engine: engine,
  Saves: saves,
  Player: player,
  Achievement: new Achievement(saves),
  Settings: new Settings(saves),
  Inventory: new Inventory(player, saves),
  Dungeon: new Dungeon(),
  Leveling: new Levelilng(engine, player, saves, console_command),
  Adventure: new Adventure(engine, player, saves),
});

interface IGame {
  Engine: Engine,
  Saves: Saves,
  Achievement: Achievement,
  Player: Player,
  Settings: Settings,
  Inventory: Inventory,
  Adventure: Adventure,
  Dungeon: Dungeon,
  Leveling: Levelilng,
}
