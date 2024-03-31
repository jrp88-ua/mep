import type { SUBJECT_KIND_VALUES } from '$lib/stores/subjects';
import * as m from '$paraglide/messages';

export function subjectKindValuesTranslate(kind: (typeof SUBJECT_KIND_VALUES)[number]) {
	switch (kind) {
		case 'OBLIGATORY':
			return m.subject_kind_obligatory();
		case 'VOLUNTARY':
			return m.subject_kind_voluntary();
		case 'UNKNOWN':
			return m.subject_kind_unknown();
	}
}
