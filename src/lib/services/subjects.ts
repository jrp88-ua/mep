import { Subject, SubjectForCreate, subjectsStore, type SubjectKind } from '$lib/models/subjects';
import type { ModelId } from '$lib/models/models';
import * as m from '$paraglide/messages';
import { get } from 'svelte/store';
import { examineesStore } from '$lib/models/examinees';
import { vigilantsStore } from '$lib/models/vigilant';

let currentId = 0;

export function createSubject(values: SubjectForCreate) {
	const parsed = SubjectForCreate.safeParse(values);
	if (!parsed.success) return false;
	values = parsed.data;

	const subject = new Subject({ id: currentId++, ...values });

	subjectsStore.storeInstance(subject);
	return subject;
}

export function getOrCreateSubject(values: SubjectForCreate) {
	return findSubjectByName(values.name) || createSubject(values);
}

export function findSubjectByName(name: string) {
	name = name.toLowerCase();
	return get(getAllSubjects()).find((s) => s.name.toLocaleLowerCase() === name);
}

export function subjectExists(predicate: (subject: Subject) => boolean) {
	return get(getAllSubjects()).find(predicate) !== undefined;
}

export function getAllSubjects() {
	return subjectsStore.getAllInstances();
}

export function getSubject(id: ModelId) {
	return subjectsStore.getInstance(id);
}

export function updatedSubject(id: ModelId) {
	return subjectsStore.updatedInstance(id);
}

export function deleteSubject(id: ModelId) {
	if (subjectsStore.deleteInstance(id)) {
		deleteSubjectFromExamineesAndVigilants([id]);
		return true;
	}
	return false;
}

export function deleteSubjects(ids: ModelId[]) {
	const deleted = subjectsStore.deleteInstances(ids);
	deleteSubjectFromExamineesAndVigilants(deleted);
	return deleted;
}

function deleteSubjectFromExamineesAndVigilants(ids: ModelId[]) {
	get(examineesStore.getAllInstances()).forEach((examinee) => {
		if (examinee.removeSubjects(ids)) {
			examineesStore.updatedInstance(examinee.id);
		}
	});
	get(vigilantsStore.getAllInstances()).forEach((vigilant) => {
		if (vigilant.removeSpecialties(ids)) {
			vigilantsStore.updatedInstance(vigilant.id);
		}
	});
}

export function subjectKindValuesTranslate(kind: SubjectKind) {
	switch (kind) {
		case 'OBLIGATORY':
			return m.subject_kind_obligatory();
		case 'VOLUNTARY':
			return m.subject_kind_voluntary();
		case 'UNKNOWN':
			return m.subject_kind_unknown();
	}
}
