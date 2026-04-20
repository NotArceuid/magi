<script lang="ts">
	import type { Snippet } from "svelte";
	import type { TransitionParams } from "./TransitionParams.ts";
	let {
		transition,
		transitionIn = transition,
		transitionOut = transition,
		isOpen = $bindable(),
		header,
		body,
	}: {
		transition: TransitionParams;
		transitionIn?: TransitionParams;
		transitionOut?: TransitionParams;
		isOpen?: boolean;
		header: Snippet;
		body: Snippet;
	} = $props();

	function handleToggle(): void {
		isOpen = !isOpen;
	}
</script>

<div>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		tabindex="0"
		role="button"
		class="card-header"
		onclick={handleToggle}
		ontouchstart={handleToggle}
	>
		{@render header()}
	</div>

	{#if isOpen}
		<div
			class="card-body"
			in:transitionIn.transition={{
				delay: transitionIn.delay,
				duration: transitionIn.duration,
				easing: transitionIn.easing,
			}}
			out:transitionOut.transition={{
				delay: transitionOut.delay,
				duration: transitionOut.duration,
				easing: transitionOut.easing,
			}}
		>
			{@render body()}
		</div>
	{/if}
</div>
