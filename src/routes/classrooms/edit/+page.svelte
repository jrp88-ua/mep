<script lang="ts">
	import { appState } from '$lib/models/appState';
	import { ClassroomForCreate, type Classroom } from '$lib/models/classroom';
	import { getClassroom, updatedClassroom } from '$lib/services/classroom';
	import { showErrorToast, showSuccessToast } from '$lib/toast';
	import { routeTo } from '$lib/util';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { onDestroy, onMount } from 'svelte';
	import { get } from 'svelte/store';

	const toastStore = getToastStore();
	let classroom: Classroom;

	onMount(() => {
		const id = appState.getEdittingClassroom();
		if (id === undefined) {
			routeTo('/classrooms');
			return;
		}
		let oclassroom = get(getClassroom(id));
		if (oclassroom === undefined) {
			routeTo('/classrooms');
			return;
		}
		classroom = oclassroom!;
	});

	onDestroy(() => appState.setEdittingClassroom(undefined));

	function submitForm(e: SubmitEvent) {
		const raw = Object.fromEntries(new FormData(e.target as HTMLFormElement));
		const result = ClassroomForCreate.safeParse(raw);
		if (!result.success) {
			showErrorToast(toastStore, {
				title: 'No se ha guardado la sala',
				message: 'Los valores son inválidos'
			});
			console.error(result.error);
			return;
		}

		const values = result.data;

		// TODO set values

		updatedClassroom(classroom.id);
		showSuccessToast(toastStore, { message: 'Sala actualizada' });
		routeTo('/classrooms');
	}
</script>

<h1 class="text-3xl mb-4">Editando sala <i>{classroom?.code}</i></h1>
<form class="card" method="post" on:submit|preventDefault={submitForm}>
	<h2 class=" card-header text-2xl">Edita los valores de la sala <i>{classroom?.code}</i></h2>
	<div class="p-4">TODO</div>
	<div class="card-footer">
		<button type="submit" class="btn variant-filled-primary">
			<i class="fa-solid fa-floppy-disk" />
			<span>Guardar</span>
		</button>
		<a href="/classrooms" class="btn variant-filled-tertiary">
			<i class="fa-solid fa-xmark" />
			<span>Cancelar</span>
		</a>
	</div>
</form>
