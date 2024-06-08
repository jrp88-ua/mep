<script lang="ts">
	import { appState } from '$lib/models/appState';
	import * as m from '$paraglide/messages';
</script>

<h1 class="text-3xl mb-4">{m.home_page_title()}</h1>

{#if $appState.openedFile === undefined}
	<a href="/open" class="btn variant-filled-primary">Abrir archivo</a>
{:else}
	<!-- else content here -->
{/if}
