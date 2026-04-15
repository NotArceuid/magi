<script lang="ts">
	import type { Decimal } from "$lib/engine/utils/BreakInfinity/Decimal.svelte";
	import { ReactiveText } from "$lib/engine/utils/ReactiveText.svelte";

	interface Props {
		min: Decimal;
		max: Decimal;
		value: Decimal;
		text?: ReactiveText;
		containerClass?: string;
		fillClass?: string;
		textClass?: string;
	}

	let {
		min,
		max,
		value,
		text,
		containerClass = "w-full h-4 bg-gray-200 rounded-full overflow-hidden",
		fillClass = "h-full bg-blue-600 transition-all duration-300 ease-out",
		textClass = "text-sm font-medium text-gray-700 mt-1",
	}: Props = $props();

	let percentage = $derived.by(() => {
		const range = max.sub(min);
		if (range.eq(0)) return 0;

		const current = value.sub(min);
		const pct = current.div(range).toNumber() * 100;

		return Math.min(Math.max(pct, 0), 100);
	});
</script>

<div class="flex flex-col gap-1 w-full relative">
	<div class={containerClass}>
		<div
			class={fillClass}
			style="width: {percentage}%;"
			role="progressbar"
			aria-valuenow={percentage}
			aria-valuemin="0"
			aria-valuemax="100"
		></div>
	</div>

	{#if text}
		<span class={textClass}>{text.toString()}</span>
	{/if}
</div>
