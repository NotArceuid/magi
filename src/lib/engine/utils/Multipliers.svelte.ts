import { SvelteMap } from "svelte/reactivity";
import { Decimal, type DecimalSource } from "./BreakInfinity/Decimal.svelte";

export interface Multiplier {
  priority: number;
  value: () => Decimal;
  type: MultiplierType;
}

export enum MultiplierType {
  Additive,
  Multiplicative,
  Compounding,
}

export class MultiplierBase {
  public BaseValue: Decimal;
  protected MultiplierList: SvelteMap<string, Multiplier> = new SvelteMap();

  constructor(base?: DecimalSource) {
    this.BaseValue = $state(new Decimal(base) ?? Decimal.ONE);
  }

  public Set(source: string, multiplier: Multiplier): void {
    for (const [_, existingMultiplier] of this.MultiplierList) {
      if (existingMultiplier.priority === multiplier.priority) {
        console.error(`Duplicate priority in multiplier, ${source}`);
        return;
      }
    }

    this.MultiplierList.set(source, multiplier);
    this.sortMultipliersByPriority();
  }

  // Might be very slow because it calculates on fetch everytime :P
  public Get(): Decimal {
    let result = new Decimal(this.BaseValue);
    this.MultiplierList.forEach((multiplier) => {
      switch (multiplier.type) {
        case MultiplierType.Additive:
          result = result.add(multiplier.value());
          break;
        case MultiplierType.Multiplicative:
          result = result.multiply(multiplier.value());
          break;
        case MultiplierType.Compounding:
          result = result.multiply(Decimal.ONE.add(multiplier.value()));
          break;
      }
    });

    return result;
  }

  public Remove(source: string): void {
    let item = this.MultiplierList.get(source);
    if (!item) return;

    this.MultiplierList.delete(source);
  }

  private sortMultipliersByPriority(): void {
    const sortedEntries = Array.from(this.MultiplierList.entries()).sort(
      ([, a], [, b]) => a.priority - b.priority,
    );

    this.MultiplierList = new SvelteMap(sortedEntries);
  }

  public static default() {
    return new MultiplierBase(1);
  }
}

export enum MultiplierPrioritySchemeEnum {
  Inventory = 0,
  Leveling = 1,
  Ability = 2,
}
