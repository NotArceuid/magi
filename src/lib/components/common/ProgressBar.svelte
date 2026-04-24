<script lang="ts">
	import { Decimal } from "$lib/engine/utils/BreakInfinity/Decimal.svelte";
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
		fillClass = "h-full bg-blue-600/70",
		textClass = "text-sm font-medium text-gray-700 mt-1",
	}: Props = $props();

	let percentage = $derived.by(() => {
		if (max.eq(0)) return 0;

		const pct = value.div(max).toNumber() * 100;
		const overcap = min.div(max).toNumber() * 100;
		return Math.min(overcap + pct, 100);
	});
</script>

<div class="flex flex-col gap-1 w-full relative">
	<div class={containerClass} style="position: relative;">
		<div
			class={fillClass}
			style="position: absolute; 
      width: {Math.min(percentage, 100)}%; height: 100%;"
			role="progressbar"
		>
			<br />
		</div>
		{#if text}
			<span class={textClass}>{text.toString()}</span>
		{/if}
	</div>
</div>
