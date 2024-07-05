<script lang="ts">
	import * as m from '$paraglide/messages';

	import { showErrorToast, showSuccessToast } from '$lib/toast';
	import { getModalStore, getToastStore, popup } from '@skeletonlabs/skeleton';
	import AcademicCentreSearch from '$lib/components/AcademicCentreSearch.svelte';
	import { VIGILANT_ROLE_VALUES, Vigilant, VigilantForCreate } from '$lib/models/vigilant';
	import {
		createVigilant,
		findCourtPresident,
		findCourtSecretary,
		findVigilantByName,
		vigilantRoleValuesTranslate
	} from '$lib/services/vigilant';
	import SubjectsSelector from '$lib/components/SubjectsSelector.svelte';
	import { routeTo } from '$lib/util';
	import { appState } from '$lib/models/appState';
	import PopupWarning from '../PopupWarning.svelte';
	import { showActionWillDeleteAssignment } from '../../actionWillDeleteAssignment';

	const toastStore = getToastStore();
	const modalStore = getModalStore();

	let academicCentreSelector: AcademicCentreSearch;
	let subjectsSelector: SubjectsSelector;
	let vigilantName: HTMLInputElement;
	let vigilantSurenames: HTMLInputElement;
	let selectedCourt: HTMLInputElement;
	let selectedRole: HTMLSelectElement;

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
			console.error(result.error);
			return;
		}

		const willCreateAcademicCentre = !academicCentreSelector.academicCentreExists();
		const vigilant = createVigilant(result.data);
		if (vigilant === false) {
			showErrorToast(toastStore, {
				title: m.could_not_create_vigilant(),
				message: m.values_are_invalid()
			});
			return;
		}

		showSuccessToast(toastStore, {
			message: willCreateAcademicCentre
				? m.created_vigilant_and_academic_centre()
				: m.created_vigilant()
		});
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
	}

	const t = vigilantRoleValuesTranslate as (v: string) => string;
</script>

<h1 class="text-3xl mb-4">{m.vigilants_create_page_title()}</h1>

<form class="card" method="post" on:submit|preventDefault={submitForm}>
	<h2 class=" card-header text-2xl">{m.values_of_the_vigilant()}</h2>
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
					value="MEMBER"
					on:change={checkRole}
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
