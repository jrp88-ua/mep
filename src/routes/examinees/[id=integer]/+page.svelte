<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { store } from '$lib/stores/examinees';

	const examinee = store.getExaminee(Number($page.params.id));
</script>

{#await examinee}
	Cargando...
{:then exa}
	{JSON.stringify(exa)}
{/await}
