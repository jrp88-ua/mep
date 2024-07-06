import { goto } from '$app/navigation';
import * as m from '$paraglide/messages';
import { tick } from 'svelte';
import { i18n } from './i18n';

export function createSheetColumns(amount: number): string[] {
	const columns: string[] = [];
	for (let i = 0; i < amount; i++)
		columns.push(m.sheet_column_name({ letter: sheetColumnLetter(i) }));

	return columns;
}

export function sheetColumnLetter(n: number): string {
	const ordA = 'A'.charCodeAt(0);
	const ordZ = 'Z'.charCodeAt(0);
	const len = ordZ - ordA + 1;

	let s = '';
	while (n >= 0) {
		s = String.fromCharCode((n % len) + ordA) + s;
		n = Math.floor(n / len) - 1;
	}
	return s;
}

export function nameSorter(
	a: { name: string; surenames: string },
	b: { name: string; surenames: string }
) {
	let comparison = a.surenames.localeCompare(b.surenames);
	if (comparison === 0) comparison = a.name.localeCompare(b.name);
	return comparison;
}

type BaseUrls = '/academic-centres' | '/classrooms' | '/examinees' | '/subjects' | '/vigilants';
type CrudUrls = '/create' | '/edit' | '';
type AssignmentUrls = '/assignment' | '/assignment/edit' | '/assignment/examinees';
type AllUrls =
	| `${BaseUrls}${CrudUrls}`
	| AssignmentUrls
	| '/settings'
	| '/open'
	| '/examinees/import'
	| '/';

export async function routeTo(url: AllUrls) {
	await tick();
	goto(i18n.resolveRoute(url));
}
