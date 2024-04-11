<script lang="ts">
	import * as m from '$paraglide/messages';
	import { goto } from '$app/navigation';
	import { showErrorToast, showSuccessToast } from '$lib/toast';
	import { getToastStore, popup } from '@skeletonlabs/skeleton';
	import { Examinee, ExamineeForCreate } from '$lib/models/examinees';
	import { createExaminee, findExamineeByNif } from '$lib/services/examinees';
	import AcademicCentreSearch from '$lib/components/AcademicCentreSearch.svelte';
	import { VIGILANT_ROLE_VALUES } from '$lib/models/vigilant';
	import { vigilantRoleValuesTranslate } from '$lib/services/vigilant';

	const toastStore = getToastStore();
	let academicCentreSelector: AcademicCentreSearch;

	function submitForm(e: SubmitEvent) {
		const raw = Object.fromEntries(new FormData(e.target as HTMLFormElement));
		if (
			'academicCentre' in raw &&
			typeof raw.academicCentre === 'string' &&
			raw.academicCentre.trim() === ''
		)
			delete raw.academicCentre;
		const result = ExamineeForCreate.safeParse(raw);
		if (result.success) {
			const willCreateAcademicCentre = !academicCentreSelector.academicCentreExists();
			const examinee = createExaminee(result.data);
			if (examinee === false) {
				toastStore.trigger(
					showErrorToast({
						message: 'No se ha podido crear el examinado, los valores no son válidos'
					})
				);
				return;
			}
			toastStore.trigger(
				showSuccessToast({
					message: willCreateAcademicCentre
						? 'Examinado y centro académico creados'
						: 'Examinado creado'
				})
			);
			goto('/examinees');
		} else {
			console.error(result.error);
		}
	}

	let matchingExaminee: undefined | Examinee = undefined;
	let checkExamineeNifTask: string | number | NodeJS.Timeout | undefined = undefined;
	$: showExamineeWarning = matchingExaminee !== undefined;
	function checkExamineeNif(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		clearTimeout(checkExamineeNifTask);
		let nif = event.currentTarget.value;
		if (!nif) {
			showExamineeWarning = false;
			return;
		}
		checkExamineeNifTask = setTimeout(() => {
			matchingExaminee = findExamineeByNif(nif);
		}, 500);
	}

	const t = vigilantRoleValuesTranslate as (v: string) => string;
</script>

<h1 class="text-3xl mb-4">{m.vigilants_create_page_title()}</h1>

<form class="card" method="post" on:submit|preventDefault={submitForm}>
	<h2 class=" card-header text-2xl">Datos del nuevo vigilante</h2>
	<div class="p-4">
		<label class="my-5">
			<span class="text-xl">Nombre</span>
			<input
				class="input"
				title="Nombre"
				name="name"
				type="text"
				placeholder="Nombre del vigilante..."
				required
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">Apellidos</span>
			<input
				class="input"
				title="Apellidos"
				name="surenames"
				type="text"
				placeholder="Apellidos del vigilante..."
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">Rol</span>
			<select
				class="input"
				title="Rol"
				name="role"
				placeholder="Rol del vigilante..."
				value="MEMBER"
				required
			>
				{#each VIGILANT_ROLE_VALUES as role}
					<option value={role}> {t(role)} </option>
				{/each}
			</select>
		</label>
		<label class="my-5">
			<span class="text-xl">Tribunal</span>
			<input
				class="input"
				title="Tribunal"
				name="court"
				type="number"
				min="-32768"
				max="32767"
				placeholder="Tribunal del alumno..."
				required
			/>
		</label>
		<AcademicCentreSearch bind:this={academicCentreSelector} />
	</div>
	<div class="card-footer">
		<button type="submit" class="btn variant-filled-primary">
			<i class="fa-solid fa-plus" />
			<span>Añadir</span>
		</button>
		<button type="reset" class="btn variant-filled-secondary">
			<i class="fa-solid fa-broom" />
			<span>Limpair</span>
		</button>
		<a href="/vigilants" class="btn variant-filled-tertiary">
			<i class="fa-solid fa-xmark" />
			<span>Cancelar</span>
		</a>
	</div>
</form>
