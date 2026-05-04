<script>
	import Inventory from "$lib/components/Inventory.svelte";

	let { children } = $props();
</script>

<div class="flex flex-col h-full min-h-0">
	<div class="shrink-0">
		<div class="flex flex-row space-x-4 text-center text-sm">
			<a class="border p-2 min-w-32" href="/player">Cultivation</a>
		</div>
	</div>
	<div class="flex-1 min-h-0 pt-4 overflow-y-auto">
		{@render children?.()}
	</div>
	<div class="border-t shrink-0 max-h-96 flex flex-col min-h-0">
		<Inventory />
	</div>
</div>
