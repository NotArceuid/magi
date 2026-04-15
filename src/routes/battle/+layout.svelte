<script>
	let { children } = $props();
</script>

<div>
	<div class="pt-4">
		{@render children?.()}
	</div>
</div>
