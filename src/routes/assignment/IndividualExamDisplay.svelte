<script lang="ts">
	import * as m from '$paraglide/messages';

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
			<p class="alert variant-filled-error">{m.no_assignation()}</p>
		{:else}
			{#if assignedExaminees < exam.examinees.size}
				<p class="text-error-500 text-xl">
					{m.there_are_examinees_without_assignation({
						missing: exam.examinees.size - assignedExaminees
					})}
				</p>
			{/if}
			<div class="flex flex-col gap-2">
				<div class="card p-4 pb-2 text-lg">
					<header class="cars-header text-lg"><strong>{m.specialists()}</strong></header>
					<section class="p-4 pt-0 pb-0">
						{#if exam.distribution?.specialists.length === 0}
							<p class="pb-3 text-error-500">{m.no_specialists_selected()}</p>
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
								{m.classroom()}
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
								<p class="text-xl">{m.vigilants()}</p>
								{#if item.vigilants.length === 0}
									<p class={item.examinees.length > 0 ? 'text-error-500' : ''}>
										{m.there_are_no_vigilants()}
									</p>
								{:else}
									<p>{m.there_are_x_vigilants({ amount: item.vigilants.length })}</p>
									<p class="pb-3">
										{m.examinees_to_vigilant_ratio({
											ratio: Math.ceil(item.examinees.length / item.vigilants.length)
										})}
									</p>

									<p>
										<Accordion>
											<AccordionItem>
												<svelte:fragment slot="summary">
													<strong>{m.vigilant_list()}</strong>
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
								<p class="text-xl">{m.examinees()}</p>
								{#if item.examinees.length === 0}
									<p>{m.there_are_no_examinees()}</p>
								{:else}
									<ul>
										<li>{m.used_x_seats({ amount: item.examinees.length })}</li>
										<li
											class={item.examinees.length > item.classroom.examCapacity
												? 'text-error-500'
												: ''}
										>
											{m.used_percentage_of_exam_capacity({
												percentage: (
													(item.examinees.length / item.classroom.examCapacity) *
													100
												).toFixed(2),
												total: item.classroom.examCapacity
											})}
										</li>
										<li
											class={item.examinees.length > item.classroom.totalCapacity
												? 'text-error-500'
												: ''}
										>
											{m.used_percentage_of_total_capacity({
												percentage: (
													(item.examinees.length / item.classroom.totalCapacity) *
													100
												).toFixed(2),
												total: item.classroom.totalCapacity
											})}
										</li>
									</ul>
									<p>
										<Accordion>
											<AccordionItem>
												<svelte:fragment slot="summary">
													<strong>{m.examinees_list()}</strong>
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
