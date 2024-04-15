<script lang="ts">
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';
	import { appState } from '$lib/models/appState';
	import { type Subject, SubjectForCreate, SUBJECT_KIND_VALUES } from '$lib/models/subjects';
	import { getSubject, subjectKindValuesTranslate, updatedSubject } from '$lib/services/subjects';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { showErrorToast, showSuccessToast } from '$lib/toast';

	const toastStore = getToastStore();
	let subject: Subject;
	let examDateInput: HTMLInputElement;

	onMount(() => {
		const id = appState.getEdittingSubject();
		if (id === undefined) {
			goto('/subjects');
			return;
		}
		let osubject = get(getSubject(id));
		if (osubject === undefined) {
			goto('/subjects');
			return;
		}
		subject = osubject!;
	});

	onDestroy(() => appState.setEdittingSubject(undefined));

	const t = subjectKindValuesTranslate as (v: string) => string;

	function submitForm(e: SubmitEvent) {
		const raw = Object.fromEntries(new FormData(e.target as HTMLFormElement));
		console.log(raw);
		const result = SubjectForCreate.safeParse(raw);
		if (!result.success) {
			toastStore.trigger(
				showErrorToast({
					title: 'No se ha guardado la asignatura',
					message: 'Los valores son inválidos'
				})
			);
			console.error(result.error);
			return;
		}

		const values = result.data;
		subject.setName(values.name);
		subject.setKind(values.kind);
		subject.examStartDate = values.examStartDate;
		subject.examDuration = values.examDuration;
		updatedSubject(subject.id);
		toastStore.trigger(showSuccessToast({ message: 'Asignatura actualizada' }));
		goto('/subjects');
	}
</script>

<h1 class="text-3xl mb-4">Editando asignatura <i>{subject?.name}</i></h1>
<form class="card" method="post" on:submit|preventDefault={submitForm}>
	<h2 class=" card-header text-2xl">Edita los valores de la asignatura <i>{subject?.name}</i></h2>
	<div class="p-4">
		<label class="my-5">
			<span class="text-xl">Nombre</span>
			<input
				class="input"
				title="Nombre"
				name="name"
				type="text"
				value={subject?.name || ''}
				placeholder="Nombre de la asignatura..."
				required
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">Tipo</span>
			<select name="kind" class="select" size={SUBJECT_KIND_VALUES.length} value={subject?.kind}>
				{#each SUBJECT_KIND_VALUES as kind}
					<option value={kind}>{t(kind)}</option>
				{/each}
			</select>
		</label>
		<label class="my-5">
			<span class="text-xl">Fecha del examen</span>
			<input
				bind:this={examDateInput}
				class="input"
				title="Fecha del examen"
				name="examDate"
				type="datetime-local"
				placeholder="Fecha del examen de la asignatura..."
				required
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">Duración del examen en minutos</span>
			<input
				class="input"
				title="Duración del examen en minutos"
				name="examDuration"
				type="number"
				value={subject?.examDuration?.minutes || 30}
				placeholder="Duración del examen en minutos de la asignatura..."
				min="1"
				step="1"
				required
			/>
		</label>
	</div>
	<div class="card-footer">
		<button type="submit" class="btn variant-filled-primary">
			<i class="fa-solid fa-floppy-disk" />
			<span>Guardar</span>
		</button>
		<a href="/subjects" class="btn variant-filled-tertiary">
			<i class="fa-solid fa-xmark" />
			<span>Cancelar</span>
		</a>
	</div>
</form>
