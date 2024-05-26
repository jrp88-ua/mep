<script lang="ts">
	import { onDestroy } from 'svelte';
	import { appState } from '$lib/models/appState';
	import { type Subject, SubjectForCreate, SUBJECT_KIND_VALUES } from '$lib/models/subjects';
	import {
		findSubjectByName,
		getSubject,
		subjectKindValuesTranslate,
		updatedSubject
	} from '$lib/services/subjects';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { getToastStore, popup } from '@skeletonlabs/skeleton';
	import { showErrorToast, showSuccessToast } from '$lib/toast';
	import { routeTo } from '$lib/util';
	import { languageTag } from '$paraglide/runtime';

	const toastStore = getToastStore();
	let subject: Subject;
	let examDateInput: HTMLInputElement;

	onMount(() => {
		const id = appState.getEdittingSubject();
		if (id === undefined) {
			routeTo('/subjects');
			return;
		}
		let osubject = get(getSubject(id));
		if (osubject === undefined) {
			routeTo('/subjects');
			return;
		}
		subject = osubject!;
	});

	onDestroy(() => appState.setEdittingSubject(undefined));

	const t = subjectKindValuesTranslate as (v: string) => string;

	let matchingSubject: Subject | undefined = undefined;
	function checkSubjectName(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const subjectName = event.currentTarget.value.toLowerCase();
		if (subjectName === subject.name.toLocaleLowerCase()) {
			matchingSubject = undefined;
			return;
		}
		matchingSubject = findSubjectByName(event.currentTarget.value);
	}

	function submitForm(e: SubmitEvent) {
		const raw = Object.fromEntries(new FormData(e.target as HTMLFormElement));
		const result = SubjectForCreate.safeParse(raw);
		if (!result.success) {
			showErrorToast(toastStore, {
				title: 'No se ha guardado la asignatura',
				message: 'Los valores son inválidos'
			});
			console.error(result.error);
			return;
		}

		const values = result.data;
		subject.setName(values.name);
		subject.setKind(values.kind);
		subject.examStartDate = values.examStartDate;
		subject.examDuration = values.examDuration;
		updatedSubject(subject.id);
		showSuccessToast(toastStore, { message: 'Asignatura actualizada' });
		routeTo('/subjects');
	}
</script>

<h1 class="text-3xl mb-4">Editando asignatura <i>{subject?.name}</i></h1>
<form class="card" method="post" on:submit|preventDefault={submitForm}>
	<h2 class=" card-header text-2xl">Edita los valores de la asignatura <i>{subject?.name}</i></h2>
	<div class="p-4">
		<label class="my-5">
			<span class="text-xl">Nombre</span>
			<div class="input-group input-group-divider grid-cols-[auto_1fr]">
				{#if matchingSubject !== undefined}
					<div
						class="input-group-shim"
						use:popup={{
							event: 'hover',
							target: 'subject-warning',
							placement: 'top-start'
						}}
					>
						<i class="fa-solid fa-circle-exclamation text-warning-500 animate-pulse" />
					</div>
				{/if}
				<input
					class="input"
					title="Nombre"
					name="name"
					type="text"
					value={subject?.name || ''}
					placeholder="Nombre de la asignatura..."
					on:input={checkSubjectName}
					required
				/>
			</div>
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
				name="examStartDate"
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
		<button
			type="submit"
			class="btn variant-filled-primary"
			disabled={matchingSubject !== undefined}
		>
			<i class="fa-solid fa-floppy-disk" />
			<span>Guardar</span>
		</button>
		<a href="/subjects" class="btn variant-filled-tertiary">
			<i class="fa-solid fa-xmark" />
			<span>Cancelar</span>
		</a>
	</div>
</form>
<div
	class="card p-4 variant-filled-surface"
	data-popup="subject-warning"
	style={matchingSubject === undefined ? 'display: none;' : ''}
>
	<p><strong>Ya existe una asignatura con el nombre {matchingSubject?.name}</strong></p>
	<div>
		<table class="table">
			<tbody>
				<tr>
					<td>Nombre</td>
					<td>{matchingSubject?.name}</td>
				</tr>
				<tr>
					<td>Tipo</td>
					<td>{t(matchingSubject?.kind || 'UNKNOWN')}</td>
				</tr>
				<tr>
					<td>Fecha examen</td>
					<td>
						{#if matchingSubject?.examStartDate}
							{matchingSubject.examStartDate?.toLocaleString(
								{ dateStyle: 'full', timeStyle: 'short' },
								{ locale: languageTag() }
							)}
						{/if}
					</td>
				</tr>
				<tr>
					<td>Duración</td>
					<td>
						{#if matchingSubject?.examDuration !== undefined}
							{matchingSubject.examDuration.toFormat("h'h' m'm' ")}
						{/if}
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
