import { Settings } from "$lib/components/settings/Settings.svelte.ts";
import { Achievement } from "./Achievements.svelte";
import { Battle } from "./Battle/Combat.svelte";
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
  Inventory: new Inventory(saves),
  Battle: new Battle(engine, player, saves),
  Leveling: new Levelilng(engine, player, saves, console_command),
});

interface IGame {
  Engine: Engine,
  Saves: Saves,
  Achievement: Achievement,
  Player: Player,
  Settings: Settings,
  Inventory: Inventory,
  Battle: Battle,
  Leveling: Levelilng,
}
