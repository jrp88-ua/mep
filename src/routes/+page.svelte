<script lang="ts">
	import * as m from '$paraglide/messages';
	import SaveApp from './SaveApp.svelte';
</script>

<h1 class="text-3xl mb-4">{m.home_page_title()}</h1>

<p><a href="/open" class="btn variant-filled-primary m-4">Abrir archivo</a></p>

<SaveApp />
