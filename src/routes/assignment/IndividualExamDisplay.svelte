<script lang="ts">
	import type { IndividualExamConfiguration } from '$lib/assignment/individualExamConfiguration';
	import { nameSorter } from '$lib/util';
	import { languageTag } from '$paraglide/runtime';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';

	export let exam: IndividualExamConfiguration;

	$: startDate = exam.subject.examStartDate!.toLocaleString(
		{ dateStyle: 'full', timeStyle: 'short' },
		{ locale: languageTag() }
	);
	$: finishDate = exam.subject.examFinishDate!.toLocaleString(
		{ dateStyle: 'short', timeStyle: 'short' },
		{ locale: languageTag() }
	);
	$: duration = exam.subject.examDuration!.toFormat("h'h' m'm' ");
	$: distribution = exam.getDistribution();

	$: assignedExaminees = exam.distribution!.distribution.reduce(
		(accumulator, current) => accumulator + current.examinees.length,
		0
	);
</script>

<div class="card mb-4">
	<header class="card-header text-2xl">{exam.subject.name}</header>
	<section class="p-4">
		<p><small>{startDate}, {duration} ({finishDate})</small></p>
		{#if distribution === 'assignment-not-done'}
			<p class="alert variant-filled-error">Sin asignación</p>
		{:else}
			{#if assignedExaminees < exam.examinees.size}
				<p class="text-error-500 text-xl">
					Hay {exam.examinees.size - assignedExaminees} examinado(s) sin asignar
				</p>
			{/if}
			<div class="flex flex-col gap-2">
				<div class="card p-4 pb-2 text-lg">
					<header class="cars-header text-lg"><strong>Especialistas</strong></header>
					<section class="p-4 pt-0 pb-0">
						{#if exam.distribution?.specialists.length === 0}
							<p class="pb-3 text-error-500">No hay vigilantes seleccionados</p>
						{/if}
						{exam.distribution?.specialists
							.toSorted(nameSorter)
							.map((s) => `${s.surenames}, ${s.name}`)
							.join(';')}
					</section>
				</div>
				{#each distribution.distribution as item (item.classroom.id)}
					<div class="card">
						<header class="card-header text-lg">
							<strong>
								Sala
								<i>
									{item.classroom.code}
									{#if item.classroom.locationCode !== ''}
										({item.classroom.locationCode})
									{/if}
								</i>
							</strong>
						</header>
						<section class="p-4 flex flex-row gap-4">
							<div class="flex-grow">
								<p class="text-xl">Vigilantes</p>
								{#if item.vigilants.length === 0}
									<p class={item.examinees.length > 0 ? 'text-error-500' : ''}>No hay vigilantes</p>
								{:else}
									<p>Hay {item.vigilants.length} vigilante(s)</p>
									<p class="pb-3">
										Hay {Math.ceil(item.examinees.length / item.vigilants.length)} examinados por cada
										vigilante
									</p>

									<p>
										<Accordion>
											<AccordionItem>
												<svelte:fragment slot="summary">
													<strong> Lista de vigilantes</strong>
												</svelte:fragment>
												<svelte:fragment slot="content">
													{#each item.vigilants as vigilants (vigilants.id)}
														{vigilants.surenames}, {vigilants.name} <br />
													{/each}
												</svelte:fragment>
											</AccordionItem>
										</Accordion>
									</p>
								{/if}
							</div>
							<div class="flex-grow">
								<p class="text-xl">Examinados</p>
								{#if item.examinees.length === 0}
									<p>No hay examinados</p>
								{:else}
									<ul>
										<li>Ocupados {item.examinees.length} sitio(s)</li>
										<li
											class={item.examinees.length > item.classroom.examCapacity
												? 'text-error-500'
												: ''}
										>
											Se ha usado un {(
												(item.examinees.length / item.classroom.examCapacity) *
												100
											).toFixed(2)}% de la capacidad del examen ({item.classroom.examCapacity})
										</li>
										<li
											class={item.examinees.length > item.classroom.totalCapacity
												? 'text-error-500'
												: ''}
										>
											Se ha usado un {(
												(item.examinees.length / item.classroom.totalCapacity) *
												100
											).toFixed(2)}% de la capacidad total ({item.classroom.totalCapacity})
										</li>
									</ul>
									<p>
										<Accordion>
											<AccordionItem>
												<svelte:fragment slot="summary">
													<strong>Lista de examinados</strong>
												</svelte:fragment>
												<svelte:fragment slot="content">
													{#each item.examinees as examinee (examinee.id)}
														{examinee.nif} - {examinee.surenames}, {examinee.name} <br />
													{/each}
												</svelte:fragment>
											</AccordionItem>
										</Accordion>
									</p>
								{/if}
							</div>
						</section>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>
