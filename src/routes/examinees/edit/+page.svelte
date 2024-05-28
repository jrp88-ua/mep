<script lang="ts">
	import * as m from '$paraglide/messages';

	import { appState } from '$lib/models/appState';
	import { ExamineeForCreate, type Examinee } from '$lib/models/examinees';
	import { findExamineeByNif, getExaminee, updatedExaminee } from '$lib/services/examinees';
	import { showErrorToast, showSuccessToast } from '$lib/toast';
	import { routeTo } from '$lib/util';
	import { getToastStore, popup } from '@skeletonlabs/skeleton';
	import { onDestroy, onMount } from 'svelte';
	import { get } from 'svelte/store';
	import PopupWarning from '../PopupWarning.svelte';
	import AcademicCentreSearch from '$lib/components/AcademicCentreSearch.svelte';
	import SubjectsSelector from '$lib/components/SubjectsSelector.svelte';
	import { createAcademicCentre, findAcademicCentreByName } from '$lib/services/academicCentres';

	const toastStore = getToastStore();
	let academicCentreSelector: AcademicCentreSearch;
	let subjectsSelector: SubjectsSelector;
	let examinee: Examinee;

	onMount(() => {
		const id = appState.getEdittingExaminee();
		if (id === undefined) {
			routeTo('/examinees');
			return;
		}
		let oexaminee = get(getExaminee(id));
		if (oexaminee === undefined) {
			routeTo('/examinees');
			return;
		}
		examinee = oexaminee!;
		academicCentreSelector.setName(examinee.getAcademicCentre()?.name || '');
		subjectsSelector.setSelection([...examinee.subjectsIds]);
	});

	onDestroy(() => appState.setEdittingExaminee(undefined));

	let matchingExaminee: undefined | Examinee = undefined;
	function checkNif(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const nif = event.currentTarget.value.toLowerCase();
		if (nif === examinee.name.toLowerCase()) {
			matchingExaminee = undefined;
			return;
		}
		matchingExaminee = findExamineeByNif(nif);
	}

	function submitForm(e: SubmitEvent) {
		if (matchingExaminee !== undefined) {
			const examinee = matchingExaminee;
			showErrorToast(toastStore, {
				message: m.examinee_already_exists({ nif: examinee.nif }),
				action: {
					label: m.edit_existing_examinee(),
					response() {
						appState.setEdittingExaminee(examinee.id);
						routeTo('/examinees/edit');
					}
				}
			});
			return;
		}

		const raw = {
			...Object.fromEntries(new FormData(e.target as HTMLFormElement)),
			subjectsIds: subjectsSelector.getSelection()
		};
		const result = ExamineeForCreate.safeParse(raw);
		if (!result.success) {
			showErrorToast(toastStore, {
				title: m.could_not_save_examinee(),
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
				examinee.setAcademicCentreId(undefined);
			} else {
				const academicCentre = createAcademicCentre({ name: academicCentreSelector.getName() });
				createdAcademicCentre = true;
				if (academicCentre !== false) {
					examinee.setAcademicCentreId(academicCentre.id);
				} else {
					showErrorToast(toastStore, {
						title: m.could_not_create_academic_centre(),
						message: m.values_are_invalid()
					});
					return;
				}
			}
		} else {
			examinee.setAcademicCentreId(selectedAcademicCentre.id);
		}

		examinee.setNif(values.nif);
		examinee.setName(values.name);
		examinee.setSurenames(values.surenames);
		examinee.setOrigin(values.origin);
		examinee.setCourt(values.court);
		examinee.setSubjects(values.subjectsIds);

		updatedExaminee(examinee.id);
		showSuccessToast(toastStore, { message: m.examinee_updated() });
		routeTo('/examinees');
	}
</script>

<h1 class="text-3xl mb-4">
	{m.editing_examinee_values({
		name: examinee.name,
		surenames: examinee.surenames,
		nif: examinee.nif
	})}
</h1>
<form class="card" method="post" on:submit|preventDefault={submitForm}>
	<h2 class=" card-header text-2xl">
		{m.edit_the_values_of_the_examinee({
			name: examinee.name,
			surenames: examinee.surenames,
			nif: examinee.nif
		})}
	</h2>
	<div class="p-4">
		<label class="my-5">
			<span class="text-xl">{m.nif()}</span>
			<div class="input-group input-group-divider grid-cols-[auto_1fr]">
				{#if matchingExaminee !== undefined}
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
					title={m.nif()}
					name="nif"
					type="text"
					placeholder={m.nif_of_the_examinee()}
					on:input={checkNif}
					value={examinee?.nif || ''}
					required
				/>
			</div>
		</label>
		<label class="my-5">
			<span class="text-xl">{m.name()}</span>
			<input
				class="input"
				title={m.name()}
				name="name"
				type="text"
				placeholder={m.name_of_the_examinee()}
				value={examinee?.name || ''}
				required
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">{m.surenames()}</span>
			<input
				class="input"
				title={m.surenames()}
				name="surenames"
				type="text"
				placeholder={m.surenames_of_the_examinee()}
				value={examinee?.surenames || ''}
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">{m.origin()}</span>
			<input
				class="input"
				title={m.origin()}
				name="origin"
				type="text"
				placeholder={m.origin_of_the_examinee()}
				value={examinee?.origin || ''}
				required
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">{m.court()}</span>
			<input
				class="input"
				title={m.court()}
				name="court"
				type="number"
				min="-32768"
				max="32767"
				placeholder={m.court_of_the_examinee()}
				value={examinee?.court || ''}
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
			disabled={matchingExaminee !== undefined}
		>
			<i class="fa-solid fa-floppy-disk" />
			<span>{m.save()}</span>
		</button>
		<a href="/examinees" class="btn variant-filled-tertiary">
			<i class="fa-solid fa-xmark" />
			<span>{m.cancel()}</span>
		</a>
	</div>
</form>
<PopupWarning bind:matching={matchingExaminee} />
