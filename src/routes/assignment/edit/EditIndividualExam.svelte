<script lang="ts">
	import type { ExamConfiguration, ExamDistribution } from '$lib/assignment/assign';
	import type { IndividualExamConfiguration } from '$lib/assignment/individualExamConfiguration';
	import type { Classroom } from '$lib/models/classroom';
	import type { Vigilant } from '$lib/models/vigilant';
	import { nameSorter, routeTo } from '$lib/util';
	import { languageTag } from '$paraglide/runtime';
	import { onMount } from 'svelte';

	export let exam: IndividualExamConfiguration;

	onMount(() => {
		if (exam === undefined) routeTo('/assignment');
		distribution = exam.getDistribution();
		if (distribution === 'assignment-not-done') {
			routeTo('/assignment');
			return;
		}
		selectedSpecialists = [...exam.specialists];
		distribution.distribution.forEach((d) => {
			selectedVigilants[d.classroom.id] = d.vigilants;
			examineesPerClassroom[d.classroom.id] = d.examinees.length;
		});
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

	$: allVigilants = [...exam.vigilants].sort(nameSorter);
	$: allSpecialists = [...exam.specialists].sort(nameSorter);

	let distribution: ExamDistribution = { subject: undefined, distribution: [] };
	let selectedSpecialists: Vigilant[] = [];
	let selectedVigilants: Vigilant[][] = [];
	let examineesPerClassroom: number[] = [];
	$: totalExamineesInFields = examineesPerClassroom.reduce(
		(accumulator, actual) => accumulator + actual,
		0
	);

	function deselectOtherVigilants(classroom: Classroom, vigilant: Vigilant) {
		for (let index = 0; index < selectedVigilants.length; index++) {
			if (index === classroom.id) continue;
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
			<div class="card p-4 pb-2 text-lg">
				<header class="cars-header text-lg"><strong>Especialistas</strong></header>
				<section class="p-4 pt-0 pb-0 flex gap-8">
					{#each allSpecialists as specialist}
						<label class="flex items-center space-x-2">
							<input
								type="checkbox"
								class="checkbox"
								bind:group={selectedSpecialists}
								name={`specialists-${exam.subject.name}`}
								value={specialist}
							/>
							<p>{specialist.surenames}, {specialist.name}</p>
						</label>
					{/each}
				</section>
			</div>
			{#each distribution.distribution as d}
				<div class="card p-4 pb-2 text-lg">
					<header class="cars-header text-lg">
						<strong>
							Sala
							<i>
								{d.classroom.code}
								{#if d.classroom.locationCode !== ''}
									({d.classroom.locationCode})
								{/if}
							</i>
						</strong>
					</header>
					<section class="p-4 flex flex-row gap-4">
						<div class="flex-grow">
							<p class="text-xl">Vigilantes</p>
							{#if selectedVigilants[d.classroom.id].length === 0}
								<p
									class={`pb-3 ${
										examineesPerClassroom[d.classroom.id] > 0 ? 'text-error-500' : ''
									}`}
								>
									No hay vigilantes seleccionados
								</p>
							{:else}
								<p class="pb-3">
									Hay {Math.ceil(
										examineesPerClassroom[d.classroom.id] / selectedVigilants[d.classroom.id].length
									)} examinados por cada vigilante
								</p>
							{/if}
							<div class="p-4 pt-0 pb-0 flex gap-8">
								{#each allVigilants as vigilant}
									<label class="flex items-center space-x-2">
										<input
											type="checkbox"
											class="checkbox"
											bind:group={selectedVigilants[d.classroom.id]}
											name={`vigilants-${exam.subject.name}`}
											value={vigilant}
											on:input={() => deselectOtherVigilants(d.classroom, vigilant)}
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
									class={examineesPerClassroom[d.classroom.id] > d.classroom.examCapacity
										? 'text-error-500'
										: ''}
								>
									Se ha usado un {(
										(examineesPerClassroom[d.classroom.id] / d.classroom.examCapacity) *
										100
									).toFixed(2)}% de la capacidad del examen ({d.classroom.examCapacity})
								</li>
								<li
									class={examineesPerClassroom[d.classroom.id] > d.classroom.totalCapacity
										? 'text-error-500'
										: ''}
								>
									Se ha usado un {(
										(examineesPerClassroom[d.classroom.id] / d.classroom.totalCapacity) *
										100
									).toFixed(2)}% de la capacidad total ({d.classroom.totalCapacity})
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
									bind:value={examineesPerClassroom[d.classroom.id]}
									on:input={() => reduceOtherExamineesAmount(d.classroom)}
								/>
							</label>
						</div>
					</section>
				</div>
			{/each}
		</div>
	</section>
</div>
