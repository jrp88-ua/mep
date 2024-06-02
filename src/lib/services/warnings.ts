import * as m from '$paraglide/messages';

import { appWarnings } from '$lib/models/warnings';
import { get } from 'svelte/store';
import { getAllSubjects } from './subjects';
import type { Vigilant } from '$lib/models/vigilant';
import type { Examinee } from '$lib/models/examinees';
import { getAllVigilants } from './vigilant';
import { getAllExaminees } from './examinees';
import { type AcademicCentre } from '$lib/models/academicCentres';
import { getAcademicCentre } from './academicCentres';

export function runExamineeAndVigilantHaveSameAcademicCentreCheck() {
	const WARNING_TYPE = 'examinee-vigilant-same-academic-centre';

	const centresGrouped = new Map<
		number,
		{ vigilants: Vigilant[]; examinees: Examinee[]; academicCentre: AcademicCentre }
	>();

	function getInMap(ac: number) {
		if (!centresGrouped.has(ac)) {
			const value = { vigilants: [], examinees: [], academicCentre: get(getAcademicCentre(ac))! };
			centresGrouped.set(ac, value);
			return value;
		}
		return centresGrouped.get(ac)!;
	}

	get(getAllVigilants())
		.filter((vigilant) => vigilant.academicCentreId !== undefined)
		.forEach((vigilant) => getInMap(vigilant.academicCentreId!).vigilants.push(vigilant));

	get(getAllExaminees())
		.filter((examinee) => examinee.academicCentreId !== undefined)
		.forEach((examinee) => getInMap(examinee.academicCentreId!).examinees.push(examinee));

	appWarnings.removeWarning((warning) => warning.type !== WARNING_TYPE);

	const collitions = [...centresGrouped.values()].filter(
		({ vigilants, examinees }) => vigilants.length > 0 && examinees.length > 0
	);

	if (collitions.length == 0) return;

	appWarnings.addWarning({
		type: WARNING_TYPE,
		severity: 'error',
		title: m.warning_vigilants_and_examinees_from_the_same_centre_title,
		message() {
			let message = '';
			collitions.forEach(
				(collition) =>
					(message += m.warning_vigilants_and_examinees_from_the_same_centre_message({
						centre: collition.academicCentre.name,
						examinees: collition.examinees.length,
						vigilants: collition.vigilants.length
					}))
			);
			return message;
		},
		meta: undefined
	});
}

export function runSubjectsWithoutWarningCheck() {
	const WARNING_TYPE = 'subjects-without-exam-date';

	appWarnings.removeWarning((warning) => warning.type !== WARNING_TYPE);

	const missing = get(getAllSubjects()).filter((subject) => !subject.hasExamDate).length;

	if (missing > 0)
		appWarnings.addWarning({
			type: WARNING_TYPE,
			severity: 'warning',
			title: m.warning_subject_without_exam_date_title,
			message: () => m.warning_subject_without_exam_date_message({ amount: missing }),
			meta: undefined
		});
}
