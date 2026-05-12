import { Settings } from "$lib/components/settings/Settings.svelte.ts";
import { Achievement } from "./Achievements.svelte";
import { Adventure } from "./Battle/Adventure.svelte";
import { Combat } from "./Battle/Combat.svelte";
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
const combat = new Combat(player);

export const Game: IGame = $state({
  Engine: engine,
  Saves: saves,
  Player: player,
  Achievement: new Achievement(saves),
  Settings: new Settings(saves),
  Inventory: new Inventory(player, saves),
  Leveling: new Levelilng(engine, player, saves, console_command),
  Combat: combat,
  Adventure: new Adventure(engine, combat, player, saves),
});

interface IGame {
  Engine: Engine,
  Saves: Saves,
  Achievement: Achievement,
  Player: Player,
  Settings: Settings,
  Inventory: Inventory,
  Adventure: Adventure,
  Combat: Combat,
  Leveling: Levelilng,
}

// INFO: FOR FUTURE ME OR ANY UNFORTUNATE MAINTAINERS IN THE FUTURE: 
// theres a lexical declaraction if i use enum of elemtns 
// so to fix that, i used arrays, starting from 0-9
// THE ORDERR of the elements is as so:
// ------ Light
// PURITY 
// CRIMSON 
// sPECTRAL 
// AZURE 
// eMERALD
// ------- Dark
// PURITY
// CRIMSON 
// sPECTRAL 
// AZURE
// eMERALD
// OK???
