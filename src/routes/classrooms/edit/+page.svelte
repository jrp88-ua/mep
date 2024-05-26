<script lang="ts">
	import * as m from '$paraglide/messages';
	import { appState } from '$lib/models/appState';
	import { ClassroomForCreate, type Classroom } from '$lib/models/classroom';
	import {
		findClassroomByCode,
		findClassroomByLocationCode,
		getClassroom,
		updatedClassroom
	} from '$lib/services/classroom';
	import { showErrorToast, showSuccessToast } from '$lib/toast';
	import { routeTo } from '$lib/util';
	import { getToastStore, popup } from '@skeletonlabs/skeleton';
	import { onDestroy, onMount } from 'svelte';
	import { get } from 'svelte/store';
	import ClassroomPopupWarning from '../ClassroomPopupWarning.svelte';

	const toastStore = getToastStore();
	let classroom: Classroom;

	onMount(() => {
		const id = appState.getEdittingClassroom();
		if (id === undefined) {
			routeTo('/classrooms');
			return;
		}
		let oclassroom = get(getClassroom(id));
		if (oclassroom === undefined) {
			routeTo('/classrooms');
			return;
		}
		classroom = oclassroom!;
		examCapacityInput.valueAsNumber = classroom.examCapacity;
	});

	onDestroy(() => appState.setEdittingClassroom(undefined));

	let matchingCode: Classroom | undefined = undefined;
	function checkCode(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		if (event.currentTarget.value === classroom.code) {
			matchingCode = undefined;
			return;
		}
		matchingCode = findClassroomByCode(event.currentTarget.value);
	}

	let matchingLocationCode: Classroom | undefined = undefined;
	function checkLocationCode(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		if (
			event.currentTarget.value.trim() === '' ||
			event.currentTarget.value === classroom.locationCode
		) {
			matchingLocationCode = undefined;
			return;
		}
		matchingLocationCode = findClassroomByLocationCode(event.currentTarget.value);
	}

	function submitForm(e: SubmitEvent) {
		if (matchingCode !== undefined || matchingLocationCode !== undefined) {
			const classroom = (matchingCode ?? matchingLocationCode)!;
			showErrorToast(toastStore, {
				message: 'Ya existe una sala con el código/código de sala {code}',
				action: {
					label: 'Editar sala',
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

		const values = result.data;

		classroom.setCode(values.code);
		classroom.setLocationCode(values.locationCode);
		classroom.setTotalCapacity(values.totalCapacity);
		classroom.setExamCapacity(values.examCapacity);
		classroom.setPriority(values.priority);
		classroom.setCourtLocation(values.courtLocation);
		classroom.setKind(values.kind);
		classroom.setNotes(values.notes);

		updatedClassroom(classroom.id);
		showSuccessToast(toastStore, { message: 'Sala actualizada' });
		routeTo('/classrooms');
	}

	let examCapacityInput: HTMLInputElement;
	function onTotalCapacityChange(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		if (isNaN(e.currentTarget.valueAsNumber) || e.currentTarget.valueAsNumber <= 0) return;
		examCapacityInput.value = String(Math.max(Math.floor(e.currentTarget.valueAsNumber / 3), 1));
	}
</script>

<h1 class="text-3xl mb-4">Editando sala <i>{classroom?.code}</i></h1>
<form class="card" method="post" on:submit|preventDefault={submitForm}>
	<h2 class=" card-header text-2xl">Edita los valores de la sala <i>{classroom?.code}</i></h2>
	<div class="p-4">
		<label class="my-5">
			<span class="text-xl">Código</span>
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
					title="Código"
					name="code"
					type="text"
					placeholder="Código de la sala..."
					on:input={checkCode}
					value={classroom?.code}
					required
				/>
			</div>
		</label>
		<label class="my-5">
			<span class="text-xl">Código de lugar</span>
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
					title="Código de lugar"
					name="locationCode"
					type="text"
					placeholder="Código de lugar de la sala..."
					value={classroom?.locationCode}
					on:input={checkLocationCode}
				/>
			</div>
		</label>
		<label class="my-5">
			<span class="text-xl">Capacidad total</span>
			<input
				class="input"
				title="Capacidad total"
				name="totalCapacity"
				type="number"
				min="0"
				step="1"
				placeholder="Capacidad total de la sala..."
				value={classroom?.totalCapacity}
				on:input={onTotalCapacityChange}
				required
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">Capacidad para examen</span>
			<input
				bind:this={examCapacityInput}
				class="input"
				title="Capacidad para examen"
				name="examCapacity"
				type="number"
				min="0"
				step="1"
				placeholder="Capacidad para examen de la sala..."
				required
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">Prioridad para asignar examinados</span>
			<input
				class="input"
				title="Prioridad"
				name="priority"
				type="number"
				min="1"
				step="1"
				value={classroom?.priority}
				placeholder="Prioridad de la sala..."
				required
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">Sede de tribunal</span>
			<input
				class="input"
				title="Sede de tribunal"
				name="courtLocation"
				type="number"
				min="-32768"
				max="32767"
				step="1"
				value={classroom?.courtLocation}
				placeholder="Sede del tribunal..."
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">Tipo</span>
			<input
				class="input"
				title="Tipo"
				name="kind"
				type="text"
				placeholder="Tipo de la sala..."
				value={classroom?.kind}
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">Notas</span>
			<textarea
				class="textarea"
				rows="5"
				title="Notas"
				name="notes"
				placeholder="Notas de la sala..."
				value={classroom?.notes}
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
