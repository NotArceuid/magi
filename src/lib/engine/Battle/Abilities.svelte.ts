import type { IHoverable } from "$lib/stores.svelte";
import type { Player } from "../Player.svelte";
import type { Combat } from "./Combat.svelte";
import type { EnemyBase } from "./Enemies.svelte";

export abstract class AbilityBase implements IHoverable {
  public abstract Name: string;
  public abstract Cooldown: number;
  public IsUnlocked: boolean = $state(false);
  public IsFrozen: boolean = $state(false);
  public Enemy: EnemyBase | undefined = $state();
  protected _cooldownUntil: number = $state(0);
  protected frozenTime: number = $state(0);

  protected _player: Player;
  protected _combat: Combat;
  constructor(player: Player, combat: Combat) {
    this._player = player;
    this._combat = combat;

    setInterval(() => { if (!this.IsFrozen) this._now = Date.now(); }, 100);
  }

  text: string = $derived.by(() => {
    const last_dot = this.Name.lastIndexOf('.');
    let path = last_dot === -1 ? this.Name : this.Name.substring(0, last_dot + 1);
    return this.IsUnlocked ? path + "description" : path + "inactive_description";
  })

  props: object = {};
  additional_props?: [string, () => string][] | undefined;

  protected _now: number = $state(Date.now());

  public readonly CooldownLeft: number = $derived.by(() => {
    return Math.max(0, (this._cooldownUntil - this._now) / 1000);
  });

  public abstract Execute(): void;

  public Fire(): void {
    if (!this._combat.Fighting)
      this._combat.StartCombat();

    if (this.CooldownLeft > 0) return;
    this._cooldownUntil = Date.now() + (this.Cooldown * 1000);

    this.Execute();
  }

  public StartCombat() {
    this._combat.StartCombat();
  }

  public Freeze(): void {
    this.IsFrozen = true;
    this.frozenTime = this.CooldownLeft;
  }

  public Unfreeze(): void {
    this._now = Date.now();
    if (this.frozenTime > 0) {
      this._cooldownUntil = this._now + (this.frozenTime * 1000);
    }
    this.frozenTime = 0;
    this.IsFrozen = false;
  }
}
