<script lang="ts">
	import { SUBJECT_KIND_VALUES, SubjectForCreate } from '$lib/models/subjects';
	import { createSubject, subjectKindValuesTranslate } from '$lib/services/subjects';
	import { showErrorToast, showSuccessToast } from '$lib/toast';
	import { routeTo } from '$lib/util';
	import { getToastStore } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	const t = subjectKindValuesTranslate as (v: string) => string;

	function submitForm(e: SubmitEvent) {
		const raw = Object.fromEntries(new FormData(e.target as HTMLFormElement));
		const result = SubjectForCreate.safeParse(raw);
		if (!result.success) {
			console.error(result.error);
			return;
		}

		const subject = createSubject(result.data);
		if (subject === false) {
			showErrorToast(toastStore, {
				message: 'No se ha podido crear la asignatura'
			});
		} else {
			showSuccessToast(toastStore, {
				message: 'Asignatura creada'
			});
		}
		routeTo('/subjects');
	}
</script>

<h1 class="text-3xl mb-4">Añadir asignatura</h1>
<form class="card" method="post" on:submit|preventDefault={submitForm}>
	<h2 class=" card-header text-2xl">Datos de la nueva asignatura</h2>
	<div class="p-4">
		<label class="my-5">
			<span class="text-xl">Nombre</span>
			<input
				class="input"
				title="Nombre"
				name="name"
				type="text"
				placeholder="Nombre de la asignatura..."
				required
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">Tipo</span>
			<select name="kind" class="select" size={SUBJECT_KIND_VALUES.length} value="UNKNOWN" required>
				{#each SUBJECT_KIND_VALUES as kind}
					<option value={kind}>{t(kind)}</option>
				{/each}
			</select>
		</label>
		<label class="my-5">
			<span class="text-xl">Fecha del examen</span>
			<input
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
