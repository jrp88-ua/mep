<script lang="ts">
	import type { IndividualExamConfiguration } from '$lib/assignment/individualExamConfiguration';
	import type { Classroom } from '$lib/models/classroom';
	import type { Vigilant } from '$lib/models/vigilant';
	import { routeTo, nameSorter } from '$lib/util';
	import { languageTag } from '$paraglide/runtime';
	import { createEventDispatcher, onMount } from 'svelte';

	export let exam: IndividualExamConfiguration;
	export let availableVigilants: Vigilant[] = [];
	export let availableClassrooms: Classroom[] = [];

	const dispatcher = createEventDispatcher();

	onMount(() => {
		if (exam === undefined) routeTo('/assignment');
		const distribution = exam.getDistribution();
		if (distribution === 'assignment-not-done') {
			routeTo('/assignment');
			return;
		}

		selectedClassrooms = distribution.distribution.map((v) => v.classroom);
		selectedSpecialists = distribution.specialists;
		distribution.distribution.forEach((v) => (selectedVigilants[v.classroom.id] = v.vigilants));
		examineesPerClassroom = distribution.distribution.map((v) => v.examinees.length);
	});

	$: startDate = exam.subject.examStartDate!.toLocaleString(
		{ dateStyle: 'full', timeStyle: 'short' },
		{ locale: languageTag() }
	);
	$: finishDate = exam.subject.examFinishDate!.toLocaleString(
		{ dateStyle: 'short', timeStyle: 'short' },
		{ locale: languageTag() }
	);
	$: duration = exam.subject.examDuration!.toFormat("h'h' m'm' ");
	$: availableSpecialists = availableVigilants.filter((vigilant) =>
		vigilant.specialtiesIds.has(exam.subject.id)
	);

	let selectedClassrooms: Classroom[] = [];
	let selectedSpecialists: Vigilant[] = [];
	let selectedVigilants: Vigilant[][] = [];
	let examineesPerClassroom: number[] = [];
	$: {
		selectedSpecialists.sort(nameSorter);
		selectedClassrooms.sort((a, b) => a.priority - b.priority);
		const selectedVigilantsBackup = selectedVigilants;
		const examineesPerClassroomBackup = examineesPerClassroom;
		selectedVigilants = [];
		examineesPerClassroom = [];
		for (const classroom of selectedClassrooms) {
			selectedVigilants[classroom.id] = selectedVigilantsBackup[classroom.id] ?? [];
			examineesPerClassroom[classroom.id] = examineesPerClassroomBackup[classroom.id] ?? 0;
		}
	}
	$: totalExamineesInFields = examineesPerClassroom.reduce(
		(accumulator, actual) => accumulator + actual,
		0
	);

	export function getExam() {
		return exam;
	}

	export function deselectVigilant(vigilant: Vigilant) {
		for (let index = 0; index < selectedVigilants.length; index++) {
			const selected = selectedVigilants[index];
			if (selected === undefined) continue;
			const vigilantIndex = selected.indexOf(vigilant);
			if (vigilantIndex === -1) continue;
			selected.splice(vigilantIndex, 1);
		}
		const index = selectedSpecialists.indexOf(vigilant);
		if (index !== -1) selectedSpecialists.splice(index, 1);
		selectedVigilants = selectedVigilants;
		selectedSpecialists = selectedSpecialists;
	}

	export function deselectClassroom(classroom: Classroom) {
		const index = selectedClassrooms.indexOf(classroom);
		if (index === -1) return;
		selectedClassrooms.splice(index, 1);
		selectedClassrooms = selectedClassrooms;
	}

	function deselectOtherVigilantsAndSpecialist(vigilant: Vigilant, classroom: Classroom) {
		for (let index = 0; index < selectedVigilants.length; index++) {
			if (index === classroom.id) continue;
			const selected = selectedVigilants[index];
			if (selected === undefined) continue;
			const vigilantIndex = selected.indexOf(vigilant);
			if (vigilantIndex === -1) continue;
			selected.splice(vigilantIndex, 1);
		}
		const index = selectedSpecialists.indexOf(vigilant);
		if (index !== -1) selectedSpecialists.splice(index, 1);
	}

	function deselectVigilants(vigilant: Vigilant) {
		for (let index = 0; index < selectedVigilants.length; index++) {
			const selected = selectedVigilants[index];
			if (selected === undefined) continue;
			const vigilantIndex = selected.indexOf(vigilant);
			if (vigilantIndex === -1) continue;
			selected.splice(vigilantIndex, 1);
		}
	}

	function reduceOtherExamineesAmount(classroom: Classroom) {
		let totalInFields = examineesPerClassroom.reduce(
			(accumulator, actual) => accumulator + actual,
			0
		);
		const totalExaminees = exam.examinees.size;
		while (totalInFields > totalExaminees) {
			for (let index = 0; index < examineesPerClassroom.length; index++) {
				if (index === classroom.id) continue;
				while (examineesPerClassroom[index] > 0 && totalInFields > totalExaminees) {
					examineesPerClassroom[index]--;
					totalInFields--;
				}
			}
		}
	}

	export function performSave() {
		const classrooms = new Map<Classroom, { examinees: number; vigilants: Vigilant[] }>();
		for (const classroom of selectedClassrooms) {
			const vigilants = selectedVigilants[classroom.id];
			const examinees = examineesPerClassroom[classroom.id];
			classrooms.set(classroom, { vigilants, examinees });
		}
		exam.useConfiguration(selectedSpecialists, classrooms);
	}
</script>

<div class="card mb-4">
	<header class="card-header text-2xl">Editar {exam.subject.name}</header>
	<section class="p-4 flex flex-col">
		<p><small>{startDate}, {duration} ({finishDate})</small></p>
		{#if totalExamineesInFields < exam.examinees.size}
			<p class="text-error-500 text-xl">
				Hay {exam.examinees.size - totalExamineesInFields} examinado(s) sin asignar
			</p>
		{/if}
		<div class="flex flex-col gap-2">
			<div class="card p-4 pb-2">
				<header class="cars-header text-lg"><strong>Salas a usar</strong></header>
				<section class="p-4 pt-0 pb-0 flex gap-8 flex-wrap">
					{#each availableClassrooms as classroom}
						<label class="flex items-center space-x-2">
							<input
								type="checkbox"
								class="checkbox"
								bind:group={selectedClassrooms}
								name={`classroom-${exam.subject.name}`}
								on:input={() => dispatcher('selected-classroom', { classroom, exam })}
								value={classroom}
							/>
							<p>{classroom.code}, {classroom.locationCode}</p>
						</label>
					{/each}
				</section>
			</div>
			<div class="card p-4 pb-2 text-lg">
				<header class="cars-header text-lg"><strong>Especialistas</strong></header>
				<section class="p-4 pt-0 pb-0">
					{#if selectedSpecialists.length === 0}
						<p class="pb-3 text-error-500">No hay vigilantes seleccionados</p>
					{/if}
					<div class="flex gap-8 flex-wrap">
						{#each availableSpecialists as specialist}
							<label class="flex items-center space-x-2">
								<input
									type="checkbox"
									class="checkbox"
									bind:group={selectedSpecialists}
									name={`specialists-${exam.subject.name}`}
									on:input={() => {
										deselectVigilants(specialist);
										dispatcher('selected-vigilant', { vigilant: specialist, exam });
									}}
									value={specialist}
								/>
								<p>{specialist.surenames}, {specialist.name}</p>
							</label>
						{/each}
					</div>
				</section>
			</div>
			{#each selectedClassrooms as classroom (classroom.id)}
				<div class="card p-4 pb-2 text-lg">
					<header class="cars-header text-lg">
						<strong>
							Sala
							<i>
								{classroom.code}
								{#if classroom.locationCode !== ''}
									({classroom.locationCode})
								{/if}
							</i>
						</strong>
					</header>
					<section class="p-4 flex flex-row gap-4">
						<div class="flex-grow">
							<p class="text-xl">Vigilantes</p>
							{#if selectedVigilants[classroom.id].length === 0}
								<p
									class={`pb-3 ${examineesPerClassroom[classroom.id] > 0 ? 'text-error-500' : ''}`}
								>
									No hay vigilantes seleccionados
								</p>
							{:else}
								<p class="pb-3">
									Hay {Math.ceil(
										examineesPerClassroom[classroom.id] / selectedVigilants[classroom.id].length
									)} examinados por cada vigilante
								</p>
							{/if}
							<div class="p-4 pt-0 pb-0 flex gap-8 flex-wrap">
								{#each availableVigilants as vigilant}
									<label class="flex items-center space-x-2">
										<input
											type="checkbox"
											class="checkbox"
											bind:group={selectedVigilants[classroom.id]}
											name={`vigilants-${exam.subject.name}`}
											value={vigilant}
											on:input={() => {
												deselectOtherVigilantsAndSpecialist(vigilant, classroom);
												dispatcher('selected-vigilant', { vigilant, exam });
											}}
										/>
										<p>{vigilant.surenames}, {vigilant.name}</p>
									</label>
								{/each}
							</div>
						</div>
						<div class="flex-grow">
							<p class="text-xl">Examinados</p>
							<ul>
								<li
									class={examineesPerClassroom[classroom.id] > classroom.examCapacity
										? 'text-error-500'
										: ''}
								>
									Se ha usado un {(
										(examineesPerClassroom[classroom.id] / classroom.examCapacity) *
										100
									).toFixed(2)}% de la capacidad del examen ({classroom.examCapacity})
								</li>
								<li
									class={examineesPerClassroom[classroom.id] > classroom.totalCapacity
										? 'text-error-500'
										: ''}
								>
									Se ha usado un {(
										(examineesPerClassroom[classroom.id] / classroom.totalCapacity) *
										100
									).toFixed(2)}% de la capacidad total ({classroom.totalCapacity})
								</li>
							</ul>
							<label class="label">
								<span>Cantidad de examinados en este aula</span>
								<input
									class="input"
									type="number"
									step="1"
									min="0"
									max={exam.examinees.size}
									bind:value={examineesPerClassroom[classroom.id]}
									on:input={() => reduceOtherExamineesAmount(classroom)}
								/>
							</label>
						</div>
					</section>
				</div>
			{/each}
		</div>
	</section>
</div>
