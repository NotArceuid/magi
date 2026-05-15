import { NUMBER_EXP_MIN, NUMBER_EXP_MAX } from "./Constants";

const powersOf10: number[] = [];
for (let i = NUMBER_EXP_MIN + 1; i <= NUMBER_EXP_MAX; i++) {
	powersOf10.push(Number("1e" + i));
}
const indexOf0InPowersOf10 = 323;

export function powerOf10(power: number): number {
	return powersOf10[power + indexOf0InPowersOf10];
}
