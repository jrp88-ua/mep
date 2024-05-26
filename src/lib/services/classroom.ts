import { Classroom, ClassroomForCreate, classroomsStore } from '$lib/models/classroom';
import type { ModelId } from '$lib/models/models';
import { get } from 'svelte/store';

let currentId = 0;

export function createClassroom(values: ClassroomForCreate) {
	const parsed = ClassroomForCreate.safeParse(values);
	if (!parsed.success) return false;
	values = parsed.data;

	const classroom = new Classroom({ id: currentId++, ...values });

	classroomsStore.storeInstance(classroom);
	return classroom;
}

export function findClassroomByCode(code: string) {
	// don't lower case check because the code may be case-sensitive
	return get(getAllClassrooms()).find((c) => c.code === code);
}

export function findClassroomByLocationCode(code: string) {
	// don't lower case check because the location code may be case-sensitive
	return get(getAllClassrooms()).find((c) => c.locationCode === code);
}

export function getAllClassrooms() {
	return classroomsStore.getAllInstances();
}

export function getClassroom(id: ModelId) {
	return classroomsStore.getInstance(id);
}

export function updatedClassroom(id: ModelId) {
	return classroomsStore.updatedInstance(id);
}

export function deleteClassroom(id: ModelId) {
	return classroomsStore.deleteInstance(id);
}

export function deleteClassrooms(ids: ModelId[]) {
	return classroomsStore.deleteInstances(ids);
}
