<script>
	import { Player } from "$lib/engine/Player.svelte";
</script>

<div class="p-3 border-b flex flex-row space-x-4 text-center text-sm font-bold">
	<a class="border p-2 min-w-32" href="/">Battle</a>
	<a class="border p-2 min-w-32" href="/player">{Player.name}</a>

	<a class="border p-2 min-w-32 ml-auto" href="/shop">Shop</a>
	<a class="border p-2 min-w-32" href="/achievement">Achievements</a>
	<a class="border p-2 min-w-32" href="/settings">Settings</a>
</div>
