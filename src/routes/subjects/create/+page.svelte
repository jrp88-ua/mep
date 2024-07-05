<script lang="ts">
	import * as m from '$paraglide/messages';
	import { appState } from '$lib/models/appState';
	import { SUBJECT_KIND_VALUES, Subject, SubjectForCreate } from '$lib/models/subjects';
	import {
		createSubject,
		findSubjectByName,
		subjectKindValuesTranslate
	} from '$lib/services/subjects';
	import { showErrorToast, showSuccessToast } from '$lib/toast';
	import { routeTo } from '$lib/util';
	import { languageTag } from '$paraglide/runtime';
	import { getModalStore, getToastStore, popup } from '@skeletonlabs/skeleton';
	import { showActionWillDeleteAssignment } from '../../actionWillDeleteAssignment';

	const toastStore = getToastStore();
	const modalStore = getModalStore();

	const t = subjectKindValuesTranslate as (v: string) => string;

	let matchingSubject: Subject | undefined = undefined;
	function checkSubjectName(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		matchingSubject = findSubjectByName(event.currentTarget.value);
	}

	async function submitForm(e: SubmitEvent) {
		if (matchingSubject !== undefined) {
			const subject = matchingSubject;
			showErrorToast(toastStore, {
				message: m.subject_already_exists({ name: subject.name }),
				action: {
					label: m.edit_existing_subject(),
					response() {
						appState.setEdittingSubject(subject.id);
						routeTo('/subjects/edit');
					}
				}
			});
			return;
		}

		if (!(await showActionWillDeleteAssignment(modalStore))) return;

		const raw = Object.fromEntries(new FormData(e.target as HTMLFormElement));
		const result = SubjectForCreate.safeParse(raw);
		if (!result.success) {
			console.error(result.error);
			return;
		}

		const subject = createSubject(result.data);
		if (subject === false) {
			showErrorToast(toastStore, {
				title: m.could_not_create_subject(),
				message: m.values_are_invalid()
			});
			return;
		}
		showSuccessToast(toastStore, {
			message: m.subject_created()
		});

		routeTo('/subjects');
	}
</script>

<h1 class="text-3xl mb-4">{m.subject_create_page_title()}</h1>

<form class="card" method="post" on:submit|preventDefault={submitForm}>
	<h2 class=" card-header text-2xl">{m.values_of_the_subject()}</h2>
	<div class="p-4">
		<label class="my-5">
			<span class="text-xl">{m.name()}</span>
			<div class="input-group input-group-divider grid-cols-[auto_1fr]">
				{#if matchingSubject !== undefined}
					<div
						class="input-group-shim"
						use:popup={{
							event: 'hover',
							target: 'subject-warning',
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
					placeholder={m.name_of_the_subject()}
					on:input={checkSubjectName}
					required
				/>
			</div>
		</label>
		<label class="my-5">
			<span class="text-xl">{m.kind()}</span>
			<select name="kind" class="select" size={SUBJECT_KIND_VALUES.length} value="UNKNOWN">
				{#each SUBJECT_KIND_VALUES as kind}
					<option value={kind}>{t(kind)}</option>
				{/each}
			</select>
		</label>
		<label class="my-5">
			<span class="text-xl">{m.exam_date()}</span>
			<input
				class="input"
				title={m.exam_date()}
				name="examStartDate"
				type="datetime-local"
				placeholder={m.exam_date_of_the_subject()}
				required
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">{m.exam_duration_in_minutes()}</span>
			<input
				class="input"
				title={m.exam_duration_in_minutes()}
				name="examDuration"
				type="number"
				placeholder={m.duration_of_the_exam_in_minutes()}
				min="1"
				step="1"
				required
			/>
		</label>
	</div>
	<div class="card-footer">
		<button
			type="submit"
			class="btn variant-filled-primary"
			disabled={matchingSubject !== undefined}
		>
			<i class="fa-solid fa-floppy-disk" />
			<span>{m.save()}</span>
		</button>
		<a href="/subjects" class="btn variant-filled-tertiary">
			<i class="fa-solid fa-xmark" />
			<span>{m.cancel()}</span>
		</a>
	</div>
</form>
<div
	class="card p-4 variant-filled-surface"
	data-popup="subject-warning"
	style={matchingSubject === undefined ? 'display: none;' : ''}
>
	<p><strong>{m.subject_already_exists({ name: matchingSubject?.name || '' })}</strong></p>
	<div>
		<table class="table">
			<tbody>
				<tr>
					<td>{m.name()}</td>
					<td>{matchingSubject?.name}</td>
				</tr>
				<tr>
					<td>{m.kind()}</td>
					<td>{t(matchingSubject?.kind || 'UNKNOWN')}</td>
				</tr>
				<tr>
					<td>{m.exam_date()}</td>
					<td>
						{#if matchingSubject?.examStartDate}
							{matchingSubject.examStartDate?.toLocaleString(
								{ dateStyle: 'full', timeStyle: 'short' },
								{ locale: languageTag() }
							)}
						{/if}
					</td>
				</tr>
				<tr>
					<td>{m.exam_duration()}</td>
					<td>
						{#if matchingSubject?.examDuration !== undefined}
							{matchingSubject.examDuration.toFormat("h'h' m'm' ")}
						{/if}
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
