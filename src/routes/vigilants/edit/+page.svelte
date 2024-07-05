<script lang="ts">
	import * as m from '$paraglide/messages';

	import AcademicCentreSearch from '$lib/components/AcademicCentreSearch.svelte';
	import SubjectsSelector from '$lib/components/SubjectsSelector.svelte';
	import { appState } from '$lib/models/appState';
	import { VIGILANT_ROLE_VALUES, Vigilant, VigilantForCreate } from '$lib/models/vigilant';
	import {
		findCourtPresident,
		findCourtSecretary,
		findVigilantByName,
		getVigilant,
		updatedVigilant,
		vigilantRoleValuesTranslate
	} from '$lib/services/vigilant';
	import { showErrorToast, showSuccessToast } from '$lib/toast';
	import { routeTo } from '$lib/util';
	import { getModalStore, getToastStore, popup } from '@skeletonlabs/skeleton';
	import { onDestroy, onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { createAcademicCentre, findAcademicCentreByName } from '$lib/services/academicCentres';
	import PopupWarning from '../PopupWarning.svelte';
	import { showActionWillDeleteAssignment } from '../../actionWillDeleteAssignment';

	const toastStore = getToastStore();
	const modalStore = getModalStore();

	let vigilant: Vigilant;

	let academicCentreSelector: AcademicCentreSearch;
	let subjectsSelector: SubjectsSelector;
	let vigilantName: HTMLInputElement;
	let vigilantSurenames: HTMLInputElement;
	let selectedCourt: HTMLInputElement;
	let selectedRole: HTMLSelectElement;

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
		academicCentreSelector.setName(vigilant.getAcademicCentre()?.name ?? '');
		subjectsSelector.setSelection([...vigilant.specialtiesIds]);
	});

	onDestroy(() => appState.setEdittingVigilant(undefined));

	async function submitForm(e: SubmitEvent) {
		if (matchingRole !== undefined || matchingName !== undefined) {
			const matching = (matchingRole ?? matchingName)!;
			showErrorToast(toastStore, {
				message:
					matchingRole !== undefined
						? m.vigilant_role_already_exists({
								role: vigilantRoleValuesTranslate(matching.role),
								court: matching.mainCourt
						  })
						: m.vigilant_name_already_exists({
								name: matching.name,
								surenames: matching.surenames
						  }),
				action: {
					label: m.edit_existing_vigilant(),
					response() {
						appState.setEdittingVigilant(matching.id);
						routeTo('/vigilants/edit');
					}
				}
			});
			return;
		}

		if (!(await showActionWillDeleteAssignment(modalStore))) return;

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

		if (!result.success) {
			showErrorToast(toastStore, {
				title: m.could_not_save_vigilant(),
				message: m.values_are_invalid()
			});
			console.error(result.error);
			return;
		}

		const values = result.data;

		const selectedAcademicCentre = findAcademicCentreByName(academicCentreSelector.getName());
		let createdAcademicCentre = false;
		if (selectedAcademicCentre === undefined) {
			if (academicCentreSelector.getName().trim() === '') {
				vigilant.setAcademicCentreId(undefined);
			} else {
				const academicCentre = createAcademicCentre({ name: academicCentreSelector.getName() });
				createdAcademicCentre = true;
				if (academicCentre !== false) {
					vigilant.setAcademicCentreId(academicCentre.id);
				} else {
					showErrorToast(toastStore, {
						title: m.could_not_create_academic_centre(),
						message: m.values_are_invalid()
					});
					return;
				}
			}
		} else {
			vigilant.setAcademicCentreId(selectedAcademicCentre.id);
		}

		vigilant.setName(values.name);
		vigilant.setSurenames(values.surenames);
		vigilant.setRole(values.role);
		vigilant.setSpecialties(values.specialtiesIds);
		vigilant.setMainCourt(values.mainCourt);

		updatedVigilant(vigilant.id);
		showSuccessToast(toastStore, { message: m.updated_vigilant() });
		routeTo('/vigilants');
	}

	let matchingName: undefined | Vigilant = undefined;
	function checkName() {
		const parsedName = Vigilant.Name.safeParse(vigilantName.value);
		const parsedSurenames = Vigilant.Surenames.safeParse(vigilantSurenames.value);
		if (!parsedName.success || !parsedSurenames.success) {
			matchingName = undefined;
			return;
		}
		const name = parsedName.data;
		const surenames = parsedSurenames.data;
		matchingName = findVigilantByName(name, surenames);

		if (matchingName === vigilant) matchingName = undefined;
	}

	let matchingRole: undefined | Vigilant = undefined;
	function checkRole() {
		const parsedCourt = Vigilant.MainCourt.safeParse(selectedCourt.value);
		const parsedRole = Vigilant.Role.safeParse(selectedRole.value);
		if (!parsedCourt.success || !parsedRole.success) {
			matchingRole = undefined;
			return;
		}
		const court = parsedCourt.data;
		const role = parsedRole.data;
		switch (role) {
			case 'PRESIDENT':
				matchingRole = findCourtPresident(court);
				break;
			case 'SECRETARY':
				matchingRole = findCourtSecretary(court);
				break;
			case 'MEMBER':
				matchingRole = undefined;
				break;
		}

		if (matchingRole === vigilant) matchingRole = undefined;
	}

	const t = vigilantRoleValuesTranslate as (v: string) => string;
</script>

<h1 class="text-3xl mb-4">
	{m.vigilants_edit_page_title({
		name: vigilant?.name ?? '',
		surenames: vigilant?.surenames ?? ''
	})}
</h1>
<form class="card" method="post" on:submit|preventDefault={submitForm}>
	<h2 class=" card-header text-2xl">
		{m.edit_the_values_of_the_vigilant({
			name: vigilant?.name ?? '',
			surenames: vigilant?.surenames ?? ''
		})}
	</h2>
	<div class="p-4">
		<label class="my-5">
			<span class="text-xl">{m.name()}</span>
			<div class="input-group input-group-divider grid-cols-[auto_1fr]">
				{#if matchingName !== undefined}
					<div
						class="input-group-shim"
						use:popup={{
							event: 'hover',
							target: 'name-warning',
							placement: 'top-start'
						}}
					>
						<i class="fa-solid fa-circle-exclamation text-warning-500 animate-pulse" />
					</div>
				{/if}
				<input
					bind:this={vigilantName}
					title={m.name()}
					name="name"
					type="text"
					value={vigilant?.name}
					placeholder={m.name_of_the_vigilant()}
					on:input={checkName}
					required
				/>
			</div>
		</label>
		<label class="my-5">
			<span class="text-xl">{m.surenames()}</span>
			<input
				bind:this={vigilantSurenames}
				class="input"
				title={m.surenames()}
				name="surenames"
				value={vigilant?.surenames}
				type="text"
				on:input={checkName}
				placeholder={m.surenames_of_the_vigilant()}
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">{m.role()}</span>
			<div class="input-group input-group-divider grid-cols-[auto_1fr]">
				{#if matchingRole !== undefined}
					<div
						class="input-group-shim"
						use:popup={{
							event: 'hover',
							target: 'role-warning',
							placement: 'top-start'
						}}
					>
						<i class="fa-solid fa-circle-exclamation text-warning-500 animate-pulse" />
					</div>
				{/if}
				<select
					title={m.role()}
					name="role"
					placeholder={m.role_of_the_vigilant()}
					on:change={checkRole}
					bind:this={selectedRole}
					value={vigilant?.role}
					required
				>
					{#each VIGILANT_ROLE_VALUES as role}
						<option value={role}> {t(role)} </option>
					{/each}
				</select>
			</div>
		</label>
		<label class="my-5">
			<span class="text-xl">{m.court()}</span>
			<input
				class="input"
				title={m.court()}
				name="mainCourt"
				type="number"
				min="-32768"
				max="32767"
				placeholder={m.court_of_the_vigilant()}
				on:input={checkRole}
				bind:this={selectedCourt}
				value={vigilant?.mainCourt}
				required
			/>
		</label>
		<AcademicCentreSearch bind:this={academicCentreSelector} />
		<SubjectsSelector bind:this={subjectsSelector} />
	</div>
	<div class="card-footer">
		<button
			type="submit"
			class="btn variant-filled-primary"
			disabled={matchingRole !== undefined || matchingName !== undefined}
		>
			<i class="fa-solid fa-floppy-disk" />
			<span>{m.save()}</span>
		</button>
		<a href="/vigilants" class="btn variant-filled-tertiary">
			<i class="fa-solid fa-xmark" />
			<span>{m.cancel()}</span>
		</a>
	</div>
</form>
<PopupWarning bind:matching={matchingRole} name={false} />
<PopupWarning bind:matching={matchingName} name={true} />
