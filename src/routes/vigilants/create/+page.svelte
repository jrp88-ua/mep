<script lang="ts">
	import * as m from '$paraglide/messages';
	import { goto } from '$app/navigation';
	import { showErrorToast, showSuccessToast } from '$lib/toast';
	import { getToastStore, popup } from '@skeletonlabs/skeleton';
	import AcademicCentreSearch from '$lib/components/AcademicCentreSearch.svelte';
	import { VIGILANT_ROLE_VALUES, Vigilant, VigilantForCreate } from '$lib/models/vigilant';
	import {
		createVigilant,
		findCourtPresident,
		findCourtSecretary,
		vigilantRoleValuesTranslate
	} from '$lib/services/vigilant';
	import SubjectsSelector from '$lib/components/SubjectsSelector.svelte';

	const toastStore = getToastStore();
	let academicCentreSelector: AcademicCentreSearch;
	let subjectsSelector: SubjectsSelector;
	let selectedCourt: HTMLInputElement;
	let selectedRole: HTMLSelectElement;

	function submitForm(e: SubmitEvent) {
		const raw = {
			...Object.fromEntries(new FormData(e.target as HTMLFormElement)),
			specialtiesIds: subjectsSelector.getSelection()
		};

		if (
			'academicCentre' in raw &&
			typeof raw.academicCentre === 'string' &&
			raw.academicCentre.trim() === ''
		)
			delete raw.academicCentre;
		const result = VigilantForCreate.safeParse(raw);
		if (result.success) {
			const willCreateAcademicCentre = !academicCentreSelector.academicCentreExists();
			const vigilant = createVigilant(result.data);
			if (vigilant === false) {
				showErrorToast(toastStore, {
					message: 'No se ha podido crear el vigilante, los valores no son válidos'
				});
				return;
			}
			showSuccessToast(toastStore, {
				message: willCreateAcademicCentre
					? 'Vigilante y centro académico creados'
					: 'Vigilante creado'
			});
			requestAnimationFrame(() => goto('/vigilants'));
		} else {
			console.error(result.error);
		}
	}

	let matchingVigilantRole: undefined | Vigilant = undefined;
	let checkVigilantRoleTask: string | number | NodeJS.Timeout | undefined = undefined;
	$: showVigilantWarning = matchingVigilantRole !== undefined;
	function checkVigilantRole() {
		clearTimeout(checkVigilantRoleTask);
		if (!selectedCourt) return;
		const parsedCourt = Vigilant.MainCourt.safeParse(selectedCourt.value);
		const parsedRole = Vigilant.Role.safeParse(selectedRole.value);
		if (!parsedCourt.success || !parsedRole.success) return;
		const court = parsedCourt.data;
		const role = parsedRole.data;
		if (role === 'MEMBER') return;
		checkVigilantRoleTask = setTimeout(() => {
			if (role === 'PRESIDENT') matchingVigilantRole = findCourtPresident(court);
			if (role === 'SECRETARY') matchingVigilantRole = findCourtSecretary(court);
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
			<div class="input-group input-group-divider grid-cols-[auto_1fr]">
				{#if showVigilantWarning}
					<div
						class="input-group-shim"
						use:popup={{
							event: 'hover',
							target: 'vigilant-warning',
							placement: 'top-start'
						}}
					>
						<i class="fa-solid fa-circle-exclamation text-warning-500 animate-pulse" />
					</div>
				{/if}
				<select
					title="Rol"
					name="role"
					placeholder="Rol del vigilante..."
					value="MEMBER"
					on:change={checkVigilantRole}
					bind:this={selectedRole}
					required
				>
					{#each VIGILANT_ROLE_VALUES as role}
						<option value={role}> {t(role)} </option>
					{/each}
				</select>
			</div>
		</label>
		<label class="my-5">
			<span class="text-xl">Tribunal</span>
			<input
				class="input"
				title="Tribunal"
				name="mainCourt"
				type="number"
				min="-32768"
				max="32767"
				placeholder="Tribunal..."
				on:input={checkVigilantRole}
				bind:this={selectedCourt}
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
		<a href="/vigilants" class="btn variant-filled-tertiary">
			<i class="fa-solid fa-xmark" />
			<span>Cancelar</span>
		</a>
	</div>
</form>
<div class="card p-4 variant-filled-surface" data-popup="vigilant-warning">
	<p>
		<strong>Ya existe un vigilante con este rol en el tribunal</strong>
	</p>
	<div>
		<table class="table">
			<tbody>
				<tr>
					<td>Nombre</td>
					<td>{matchingVigilantRole?.name}</td>
				</tr>
				<tr>
					<td>Apellidos</td>
					<td>{matchingVigilantRole?.surenames}</td>
				</tr>
				<tr>
					<td>Centro académico</td>
					<td>
						{#if matchingVigilantRole?.getAcademicCentre() !== undefined}
							{matchingVigilantRole.getAcademicCentre()?.name}
						{:else}
							<i>{m.no_academic_centre()}</i>
						{/if}
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
