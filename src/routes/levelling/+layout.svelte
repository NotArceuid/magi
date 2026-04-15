<script>
	let { children } = $props();
</script>

<div class="h-full">
	<div class="flex flex-row space-x-4 text-center text-sm">
		<a class="border p-2 min-w-32" href="/levelling/">Cultivation</a>
		<a class="border p-2 min-w-32" href="/levelling/enhancement">Enhance</a>
	</div>

	<div class="pt-4 h-full">
		{@render children?.()}
	</div>
</div>
