<script lang="ts">
	import * as m from '$paraglide/messages';
	import { goto } from '$app/navigation';
	import { showErrorToast, showSuccessToast } from '$lib/toast';
	import { getToastStore, popup } from '@skeletonlabs/skeleton';
	import { Examinee, ExamineeForCreate } from '$lib/models/examinees';
	import { createExaminee, findExamineeByNif } from '$lib/services/examinees';
	import AcademicCentreSearch from '$lib/components/AcademicCentreSearch.svelte';
	import SubjectsSelector from '$lib/components/SubjectsSelector.svelte';

	const toastStore = getToastStore();
	let academicCentreSelector: AcademicCentreSearch;
	let subjectsSelector: SubjectsSelector;

	function submitForm(e: SubmitEvent) {
		const raw = {
			...Object.fromEntries(new FormData(e.target as HTMLFormElement)),
			subjectsIds: subjectsSelector.getSelection()
		};
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
				showErrorToast(toastStore, {
					message: 'No se ha podido crear el examinado, los valores no son válidos'
				});
				return;
			}
			showSuccessToast(toastStore, {
				message: willCreateAcademicCentre
					? 'Examinado y centro académico creados'
					: 'Examinado creado'
			});
			requestAnimationFrame(() => goto('/examinees'));
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
</script>

<h1 class="text-3xl mb-4">{m.examinees_create_page_title()}</h1>

<form class="card" method="post" on:submit|preventDefault={submitForm}>
	<h2 class=" card-header text-2xl">Datos del nuevo examinado</h2>
	<div class="p-4">
		<label class="my-5">
			<span class="text-xl">Nif</span>
			<div class="input-group input-group-divider grid-cols-[auto_1fr]">
				{#if showExamineeWarning}
					<div
						class="input-group-shim"
						use:popup={{
							event: 'hover',
							target: 'examinee-warning',
							placement: 'top-start'
						}}
					>
						<i class="fa-solid fa-circle-exclamation text-warning-500 animate-pulse" />
					</div>
				{/if}
				<input
					title="Nif"
					name="nif"
					type="text"
					placeholder="Nif del alumno..."
					tabindex="0"
					on:input={checkExamineeNif}
					required
				/>
			</div>
		</label>
		<label class="my-5">
			<span class="text-xl">Nombre</span>
			<input
				class="input"
				title="Nombre"
				name="name"
				type="text"
				placeholder="Nombre del alumno..."
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
				placeholder="Apellidos del alumno..."
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">Origen</span>
			<input
				class="input"
				title="Origen"
				name="origin"
				type="text"
				placeholder="Origen del alumno..."
				required
			/>
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
		<SubjectsSelector bind:this={subjectsSelector} />
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
		<a href="/examinees" class="btn variant-filled-tertiary">
			<i class="fa-solid fa-xmark" />
			<span>Cancelar</span>
		</a>
	</div>
</form>
<div class="card p-4 variant-filled-surface" data-popup="examinee-warning">
	<p><strong>Ya existe un examinado con el nif {matchingExaminee?.nif}</strong></p>
	<div>
		<table class="table">
			<tbody>
				<tr>
					<td>Nif</td>
					<td>{matchingExaminee?.nif}</td>
				</tr>
				<tr>
					<td>Nombre</td>
					<td>{matchingExaminee?.name}</td>
				</tr>
				<tr>
					<td>Apellidos</td>
					<td>{matchingExaminee?.surenames}</td>
				</tr>
				<tr>
					<td>Origen</td>
					<td>{matchingExaminee?.origin}</td>
				</tr>
				<tr>
					<td>Tribunal</td>
					<td>{matchingExaminee?.court}</td>
				</tr>
				<tr>
					<td>Centro académico</td>
					<td>
						{#if matchingExaminee?.getAcademicCentre() !== undefined}
							{matchingExaminee.getAcademicCentre()?.name}
						{:else}
							<i>{m.no_academic_centre()}</i>
						{/if}
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
