<script lang="ts">
	import { appWarnings } from '$lib/models/warnings';

	const warnings = appWarnings;
</script>

{#if $warnings.length > 0}
	<div class="p-4 flex gap-4 flex-col">
		{#each $warnings as warning}
			<aside class={`alert variant-filled-${warning.severity}`}>
				<div>
					{#if warning.severity === 'warning'}
						<i class="fa-solid fa-triangle-exclamation text-4xl" />
					{:else}
						<i class="fa-solid fa-circle-exclamation text-4xl" />
					{/if}
				</div>
				<div class="alert-message">
					<h3 class="h3">{warning.title()}</h3>
					<p>{warning.message()}</p>
				</div>
			</aside>
		{/each}
	</div>
{/if}
