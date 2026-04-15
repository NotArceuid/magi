<script>
	import AchievementsCard from "$lib/components/achievements/AchievementsCard.svelte";
	import { Game } from "$lib/engine/stores.svelte";
</script>

<div>
	<h1>
		You current have ({Game.Achievement.UnlockedAchievementCount()} / {Object.entries(
			Game.Achievement.AchievementData,
		).length}) achievementes unlocked
	</h1>
	<h1>
		Granting a total of {(
			Game.Achievement.UnlockedAchievementCount() * 0.01 +
			1
		).toFixed(2)}x bonus to sell multiplier
	</h1>
	<div class="flex flex-wrap items-center content-center">
		{#each Object.entries(Game.Achievement.AchievementData) as achievement}
			<AchievementsCard idx={parseInt(achievement[0])} />
		{/each}
	</div>
</div>
