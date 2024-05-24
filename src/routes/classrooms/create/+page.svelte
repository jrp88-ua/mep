<script lang="ts">
	import * as m from '$paraglide/messages';

	import { showErrorToast, showSuccessToast } from '$lib/toast';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { ClassroomForCreate } from '$lib/models/classroom';
	import { createClassroom } from '$lib/services/classroom';
	import { routeTo } from '$lib/util';

	const toastStore = getToastStore();
	let examCapacityInput: HTMLInputElement;

	function submitForm(e: SubmitEvent) {
		const raw = Object.fromEntries(new FormData(e.target as HTMLFormElement));
		const result = ClassroomForCreate.safeParse(raw);
		if (result.success) {
			const classroom = createClassroom(result.data);
			console.log(classroom);
			if (classroom === false) {
				showErrorToast(toastStore, {
					message: 'No se ha podido crear la sala, los valores no son válidos'
				});
				return;
			}
			showSuccessToast(toastStore, {
				message: 'Sala creada'
			});
			routeTo('/classrooms');
		} else {
			console.error(result.error);
		}
	}

	function onTotalCapacityChange(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		if (isNaN(e.currentTarget.valueAsNumber) || e.currentTarget.valueAsNumber <= 0) return;
		examCapacityInput.value = String(Math.max(Math.floor(e.currentTarget.valueAsNumber / 3), 1));
	}
</script>

<h1 class="text-3xl mb-4">Añadir sala</h1>

<form class="card" method="post" on:submit|preventDefault={submitForm}>
	<h2 class=" card-header text-2xl">Datos de la sala</h2>
	<div class="p-4">
		<label class="my-5">
			<span class="text-xl">Código</span>
			<input
				class="input"
				title="Código"
				name="code"
				type="text"
				placeholder="Código de la sala..."
				required
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">Código de lugar</span>
			<input
				class="input"
				title="Código de lugar"
				name="locationCode"
				type="text"
				placeholder="Código de lugar de la sala..."
			/>
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
				required
				on:input={onTotalCapacityChange}
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
				placeholder="Prioridad de la sala..."
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
				placeholder="Sede del tribunal..."
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">Tipo</span>
			<input class="input" title="Tipo" name="kind" type="text" placeholder="Tipo de la sala..." />
		</label>
		<label class="my-5">
			<span class="text-xl">Notas</span>
			<textarea
				class="textarea"
				rows="5"
				title="Notas"
				name="notes"
				placeholder="Notas de la sala..."
			/>
		</label>
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
		<a href="/classrooms" class="btn variant-filled-tertiary">
			<i class="fa-solid fa-xmark" />
			<span>Cancelar</span>
		</a>
	</div>
</form>
