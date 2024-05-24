<script lang="ts">
	import * as m from '$paraglide/messages';

	import { AcademicCentreForCreate } from '$lib/models/academicCentres';
	import { createAcademicCentre } from '$lib/services/academicCentres';
	import { showErrorToast, showSuccessToast } from '$lib/toast';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { routeTo } from '$lib/util';

	const toastStore = getToastStore();

	function submitForm(e: SubmitEvent) {
		const raw = Object.fromEntries(new FormData(e.target as HTMLFormElement));
		const result = AcademicCentreForCreate.safeParse(raw);
		if (result.success) {
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
		} else {
			console.error(result.error);
		}
	}
</script>

<form class="card" method="post" on:submit|preventDefault={submitForm}>
	<h2 class=" card-header text-2xl">{m.values_of_the_academic_centre()}</h2>
	<div class="p-4">
		<label class="my-5">
			<span class="text-xl">{m.name()}</span>
			<input
				class="input"
				title={m.name()}
				name="name"
				type="text"
				placeholder={m.name_of_the_academic_centre()}
				required
			/>
		</label>
	</div>
	<div class="card-footer">
		<button type="submit" class="btn variant-filled-primary">
			<i class="fa-solid fa-floppy-disk" />
			<span>{m.save()}</span>
		</button>
		<a href="/academic-centres" class="btn variant-filled-tertiary">
			<i class="fa-solid fa-xmark" />
			<span>{m.cancel()}</span>
		</a>
	</div>
</form>
