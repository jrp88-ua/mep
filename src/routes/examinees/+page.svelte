<script lang="ts">
	import { store } from '$lib/stores/examinees';
	import ExamineesDatatable from './ExamineesDatatable.svelte';

	function createExaminee() {
		store.createExaminee({
			name: 'Juan',
			origin: 'Baccalaureate',
			surenames: 'Pedro',
			court: 12
		});
	}
</script>

<ExamineesDatatable />

<button class="btn variant-filled-primary" on:click={createExaminee}>Crear</button>
