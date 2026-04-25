<script>
	import Inventory from "$lib/components/Inventory.svelte";

	let { children } = $props();
</script>

<div class="min-h-8/12">
	<div class="flex flex-row space-x-4 text-center text-sm">
		<a class="border p-2 min-w-32" href="/player/cultivation">Cultivation</a>
	</div>

	<div class="pt-4 min-h-8/12">
		{@render children?.()}
	</div>
</div>
<div class="border-t mt-auto max-h-4/12">
	<Inventory />
</div>
