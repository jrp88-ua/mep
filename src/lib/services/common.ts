import { academicCentresStore } from '$lib/stores/academicCentres';
import { examineesStore } from '$lib/stores/examinees';
import { subjectsStore } from '$lib/stores/subjects';

export async function reloadAllStores() {
	examineesStore.clear();
	academicCentresStore.clear();
	subjectsStore.clear();
	await examineesStore.getAllInstances();
	await academicCentresStore.getAllInstances();
	await subjectsStore.getAllInstances();
}
