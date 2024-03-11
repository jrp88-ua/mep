<script lang="ts">
	import { page } from '$app/stores';
	import { examineesStore } from '$lib/stores/models';

	const examinee = examineesStore.getInstance(Number($page.params.id));
</script>

{#await examinee}
	Cargando...
{:then exa}
	{JSON.stringify(exa)}
{/await}
