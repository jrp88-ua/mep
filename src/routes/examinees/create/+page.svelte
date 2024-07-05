<script lang="ts">
	import * as m from '$paraglide/messages';

	import { showErrorToast, showSuccessToast } from '$lib/toast';
	import { getModalStore, getToastStore, popup } from '@skeletonlabs/skeleton';
	import { Examinee, ExamineeForCreate } from '$lib/models/examinees';
	import { createExaminee, findExamineeByNif } from '$lib/services/examinees';
	import AcademicCentreSearch from '$lib/components/AcademicCentreSearch.svelte';
	import SubjectsSelector from '$lib/components/SubjectsSelector.svelte';
	import { routeTo } from '$lib/util';
	import PopupWarning from '../PopupWarning.svelte';
	import { appState } from '$lib/models/appState';
	import { showActionWillDeleteAssignment } from '../../actionWillDeleteAssignment';

	const toastStore = getToastStore();
	const modalStore = getModalStore();

	let academicCentreSelector: AcademicCentreSearch;
	let subjectsSelector: SubjectsSelector;

	let matchingExaminee: undefined | Examinee = undefined;
	function checkNif(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const nif = event.currentTarget.value;
		if (nif.trim() === '') {
			matchingExaminee = undefined;
			return;
		}
		matchingExaminee = findExamineeByNif(nif);
	}

	async function submitForm(e: SubmitEvent) {
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

		if (!(await showActionWillDeleteAssignment(modalStore))) return;

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
		if (!result.success) {
			console.error(result.error);
			return;
		}

		const willCreateAcademicCentre = !academicCentreSelector.academicCentreExists();
		const examinee = createExaminee(result.data);
		if (examinee === false) {
			showErrorToast(toastStore, {
				title: m.could_not_create_examinee(),
				message: m.values_are_invalid()
			});
			return;
		}

		showSuccessToast(toastStore, {
			message: willCreateAcademicCentre
				? m.created_examinee_and_academic_centre()
				: m.created_examinee()
		});
		routeTo('/examinees');
	}
</script>

<h1 class="text-3xl mb-4">{m.examinees_create_page_title()}</h1>

<form class="card" method="post" on:submit|preventDefault={submitForm}>
	<h2 class=" card-header text-2xl">{m.values_of_the_examinee()}</h2>
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
