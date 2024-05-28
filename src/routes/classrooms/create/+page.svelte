<script lang="ts">
	import * as m from '$paraglide/messages';
	import { showErrorToast, showSuccessToast } from '$lib/toast';
	import { getToastStore, popup } from '@skeletonlabs/skeleton';
	import { Classroom, ClassroomForCreate } from '$lib/models/classroom';
	import {
		createClassroom,
		findClassroomByCode,
		findClassroomByLocationCode
	} from '$lib/services/classroom';
	import { routeTo } from '$lib/util';
	import ClassroomPopupWarning from '../ClassroomPopupWarning.svelte';
	import { appState } from '$lib/models/appState';

	const toastStore = getToastStore();

	let matchingCode: Classroom | undefined = undefined;
	function checkCode(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		matchingCode = findClassroomByCode(event.currentTarget.value);
	}

	let matchingLocationCode: Classroom | undefined = undefined;
	function checkLocationCode(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		if (event.currentTarget.value.trim() === '') {
			matchingLocationCode = undefined;
			return;
		}
		matchingLocationCode = findClassroomByLocationCode(event.currentTarget.value);
	}

	function submitForm(e: SubmitEvent) {
		if (matchingCode !== undefined || matchingLocationCode !== undefined) {
			const classroom = (matchingCode ?? matchingLocationCode)!;
			showErrorToast(toastStore, {
				message: matchingCode
					? m.classroom_code_already_exists({ code: matchingCode.code })
					: m.classroom_location_code_already_exists({
							code: matchingLocationCode?.locationCode || ''
					  }),
				action: {
					label: m.exit_existing_classroom(),
					response() {
						appState.setEdittingClassroom(classroom.id);
						routeTo('/classrooms/edit');
					}
				}
			});
			return;
		}

		const raw = Object.fromEntries(new FormData(e.target as HTMLFormElement));
		const result = ClassroomForCreate.safeParse(raw);
		if (!result.success) {
			console.error(result.error);
			return;
		}

		const classroom = createClassroom(result.data);
		if (classroom === false) {
			showErrorToast(toastStore, {
				title: m.could_not_create_classroom(),
				message: m.values_are_invalid()
			});
			return;
		}
		showSuccessToast(toastStore, {
			message: m.created_classroom()
		});
		routeTo('/classrooms');
	}

	let examCapacityInput: HTMLInputElement;
	function onTotalCapacityChange(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		if (isNaN(e.currentTarget.valueAsNumber) || e.currentTarget.valueAsNumber <= 0) return;
		examCapacityInput.value = String(Math.max(Math.floor(e.currentTarget.valueAsNumber / 3), 1));
	}
</script>

<h1 class="text-3xl mb-4">{m.classroom_create_page_title()}</h1>

<form class="card" method="post" on:submit|preventDefault={submitForm}>
	<h2 class=" card-header text-2xl">{m.values_of_the_classroom()}</h2>
	<div class="p-4">
		<label class="my-5">
			<span class="text-xl">{m.code()}</span>
			<div class="input-group input-group-divider grid-cols-[auto_1fr]">
				{#if matchingCode !== undefined}
					<div
						class="input-group-shim"
						use:popup={{
							event: 'hover',
							target: 'code-warning',
							placement: 'top-start'
						}}
					>
						<i class="fa-solid fa-circle-exclamation text-warning-500 animate-pulse" />
					</div>
				{/if}
				<input
					title={m.code()}
					name="code"
					type="text"
					placeholder={m.code_of_the_classroom()}
					on:input={checkCode}
					required
				/>
			</div>
		</label>
		<label class="my-5">
			<span class="text-xl">{m.location_code()}</span>
			<div class="input-group input-group-divider grid-cols-[auto_1fr]">
				{#if matchingLocationCode !== undefined}
					<div
						class="input-group-shim"
						use:popup={{
							event: 'hover',
							target: 'location-code-warning',
							placement: 'top-start'
						}}
					>
						<i class="fa-solid fa-circle-exclamation text-warning-500 animate-pulse" />
					</div>
				{/if}
				<input
					title={m.location_code()}
					name="locationCode"
					type="text"
					placeholder={m.location_code_of_the_classroom()}
					on:input={checkLocationCode}
				/>
			</div>
		</label>
		<label class="my-5">
			<span class="text-xl">{m.total_capacity()}</span>
			<input
				class="input"
				title={m.total_capacity()}
				name="totalCapacity"
				type="number"
				min="0"
				step="1"
				placeholder={m.total_capacity_of_the_classroom()}
				on:input={onTotalCapacityChange}
				required
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">{m.exam_capacity()}</span>
			<input
				bind:this={examCapacityInput}
				class="input"
				title={m.exam_capacity()}
				name="examCapacity"
				type="number"
				min="0"
				step="1"
				placeholder={m.exam_capacity_of_the_classroom()}
				required
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">{m.priority_to_asign_examinees()}</span>
			<input
				class="input"
				title={m.priority_to_asign_examinees()}
				name="priority"
				type="number"
				min="1"
				step="1"
				value="1"
				placeholder={m.priority_to_asign_examinees_of_the_classroom()}
				required
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">{m.court_location()}</span>
			<input
				class="input"
				title={m.court_location()}
				name="courtLocation"
				type="number"
				min="-32768"
				max="32767"
				step="1"
				placeholder={m.court_location_of_the_classroom()}
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">{m.kind()}</span>
			<input
				class="input"
				title={m.kind()}
				name="kind"
				type="text"
				placeholder={m.kind_of_the_classroom()}
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">{m.notes()}</span>
			<textarea
				class="textarea"
				rows="5"
				title={m.notes()}
				name="notes"
				placeholder={m.notes_of_the_classroom()}
			/>
		</label>
	</div>
	<div class="card-footer">
		<button
			type="submit"
			class="btn variant-filled-primary"
			disabled={matchingCode !== undefined || matchingLocationCode !== undefined}
		>
			<i class="fa-solid fa-floppy-disk" />
			<span>{m.save()}</span>
		</button>
		<a href="/classrooms" class="btn variant-filled-tertiary">
			<i class="fa-solid fa-xmark" />
			<span>{m.cancel()}</span>
		</a>
	</div>
</form>
<ClassroomPopupWarning location={false} bind:matching={matchingCode} />
<ClassroomPopupWarning location={true} bind:matching={matchingLocationCode} />
