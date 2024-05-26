<script lang="ts">
	import * as m from '$paraglide/messages';

	import { AcademicCentre, AcademicCentreForCreate } from '$lib/models/academicCentres';
	import { createAcademicCentre, findAcademicCentreByName } from '$lib/services/academicCentres';
	import { showErrorToast, showSuccessToast } from '$lib/toast';
	import { getToastStore, popup } from '@skeletonlabs/skeleton';
	import { routeTo } from '$lib/util';
	import { appState } from '$lib/models/appState';

	const toastStore = getToastStore();

	let matchingAcademicCentre: AcademicCentre | undefined = undefined;
	function checkAcademicCentreName(
		event: Event & { currentTarget: EventTarget & HTMLInputElement }
	) {
		matchingAcademicCentre = findAcademicCentreByName(event.currentTarget.value);
	}

	function submitForm(e: SubmitEvent) {
		if (matchingAcademicCentre !== undefined) {
			const academicCentre = matchingAcademicCentre;
			showErrorToast(toastStore, {
				message: m.academic_centre_already_exists({ name: academicCentre.name }),
				action: {
					label: m.edit_existing_academic_centre(),
					response() {
						appState.setEdittingAcademicCentre(academicCentre.id);
						routeTo('/academic-centres/edit');
					}
				}
			});
			return;
		}

		const raw = Object.fromEntries(new FormData(e.target as HTMLFormElement));
		const result = AcademicCentreForCreate.safeParse(raw);
		if (!result.success) {
			console.error(result.error);
			return;
		}

		const academicCentre = createAcademicCentre(result.data);
		if (academicCentre === false) {
			showErrorToast(toastStore, {
				message: m.could_not_create_academic_centre()
			});
			return;
		}
		showSuccessToast(toastStore, {
			message: m.created_academic_centre()
		});
		routeTo('/academic-centres');
	}
</script>

<form class="card" method="post" on:submit|preventDefault={submitForm}>
	<h2 class=" card-header text-2xl">{m.values_of_the_academic_centre()}</h2>
	<div class="p-4">
		<label class="my-5">
			<span class="text-xl">{m.name()}</span>
			<div class="input-group input-group-divider grid-cols-[auto_1fr]">
				{#if matchingAcademicCentre !== undefined}
					<div
						class="input-group-shim"
						use:popup={{
							event: 'hover',
							target: 'academic-centre-warning',
							placement: 'top-start'
						}}
					>
						<i class="fa-solid fa-circle-exclamation text-warning-500 animate-pulse" />
					</div>
				{/if}
				<input
					title={m.name()}
					name="name"
					type="text"
					placeholder={m.name_of_the_academic_centre()}
					on:input={checkAcademicCentreName}
					required
				/>
			</div>
		</label>
	</div>
	<div class="card-footer">
		<button
			type="submit"
			class="btn variant-filled-primary"
			disabled={matchingAcademicCentre !== undefined}
		>
			<i class="fa-solid fa-floppy-disk" />
			<span>{m.save()}</span>
		</button>
		<a href="/academic-centres" class="btn variant-filled-tertiary">
			<i class="fa-solid fa-xmark" />
			<span>{m.cancel()}</span>
		</a>
	</div>
</form>
<div
	class="card p-4 variant-filled-surface"
	data-popup="academic-centre-warning"
	style={matchingAcademicCentre === undefined ? 'display: none;' : ''}
>
	<p>
		<strong>{m.academic_centre_already_exists({ name: matchingAcademicCentre?.name ?? '' })}</strong
		>
	</p>
</div>
