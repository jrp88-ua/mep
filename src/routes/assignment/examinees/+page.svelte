<script lang="ts">
	import * as m from '$paraglide/messages';

	import { findExamineesWithExamnDateCollisions } from '$lib/assignment/assignUtils';
	import { getAllExaminees } from '$lib/services/examinees';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { DateTime, Duration } from 'luxon';
	import { languageTag } from '$paraglide/runtime';
	import { get } from 'svelte/store';

	const examinees = getAllExaminees();
	const examineesWithCollitions = findExamineesWithExamnDateCollisions(get(examinees));
</script>

<h1 class="text-3xl mb-4">{m.assignment_examinees_page_title()}</h1>
<h2 class="mb-4">
	{m.there_are_x_examinees_with_colliding_exams({ amount: examineesWithCollitions.size })}
</h2>
{#each examineesWithCollitions as collitions (collitions[0].id)}
	<div class="card mb-4">
		<Accordion>
			<AccordionItem>
				<svelte:fragment slot="summary">
					{collitions[0].nif} - {`${collitions[0].surenames}, ${collitions[0].name}`}
				</svelte:fragment>
				<svelte:fragment slot="content">
					<ul>
						{#each collitions[1] as collition}
							<li>
								{m.subjects_overlap_text({
									firstSubject: collition[0].name,
									secondSubject: collition[1].name,
									overlap:
										collition[0].examFinishDate
											?.diff(collition[1].examStartDate ?? DateTime.now())
											.toFormat('m') ?? '',
									instant:
										collition[1].examStartDate?.toLocaleString(
											{ dateStyle: 'short', timeStyle: 'short' },
											{ locale: languageTag() }
										) ?? ''
								})}
							</li>
						{/each}
					</ul>
				</svelte:fragment>
			</AccordionItem>
		</Accordion>
	</div>
{/each}
