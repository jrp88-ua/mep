<script lang="ts">
	import { appState } from '$lib/models/appState';
	import { VigilantForCreate, type Vigilant } from '$lib/models/vigilant';
	import { getVigilant, updatedVigilant } from '$lib/services/vigilant';
	import { showErrorToast, showSuccessToast } from '$lib/toast';
	import { routeTo } from '$lib/util';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { onDestroy, onMount } from 'svelte';
	import { get } from 'svelte/store';

	const toastStore = getToastStore();
	let vigilant: Vigilant;

	onMount(() => {
		const id = appState.getEdittingVigilant();
		if (id === undefined) {
			routeTo('/vigilants');
			return;
		}
		let ovigilant = get(getVigilant(id));
		if (ovigilant === undefined) {
			routeTo('/vigilants');
			return;
		}
		vigilant = ovigilant!;
	});

	onDestroy(() => appState.setEdittingVigilant(undefined));

	function submitForm(e: SubmitEvent) {
		const raw = Object.fromEntries(new FormData(e.target as HTMLFormElement));
		const result = VigilantForCreate.safeParse(raw);
		if (!result.success) {
			showErrorToast(toastStore, {
				title: 'No se ha guardado el vigilante',
				message: 'Los valores son inválidos'
			});
			console.error(result.error);
			return;
		}

		const values = result.data;

		// TODO set values

		updatedVigilant(vigilant.id);
		showSuccessToast(toastStore, { message: 'Vigilante actualizado' });
		routeTo('/vigilants');
	}
</script>

<h1 class="text-3xl mb-4">Editando vigilante <i>{vigilant?.surenames}, {vigilant?.name}</i></h1>
<form class="card" method="post" on:submit|preventDefault={submitForm}>
	<h2 class=" card-header text-2xl">
		Edita los valores del vigilante <i>{vigilant?.surenames}, {vigilant?.name}</i>
	</h2>
	<div class="p-4">TODO</div>
	<div class="card-footer">
		<button type="submit" class="btn variant-filled-primary">
			<i class="fa-solid fa-floppy-disk" />
			<span>Guardar</span>
		</button>
		<a href="/vigilants" class="btn variant-filled-tertiary">
			<i class="fa-solid fa-xmark" />
			<span>Cancelar</span>
		</a>
	</div>
</form>
