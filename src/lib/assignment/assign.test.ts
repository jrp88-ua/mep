import { Subject } from '$lib/models/subjects';
import { clearMocks } from '@tauri-apps/api/mocks';
import { DateTime, Duration } from 'luxon';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { collidingExamnsToConfiguration, orderAndGroupSubjects } from './assign';

beforeEach(() => {
	vi.clearAllMocks();
	vi.mock('tauri-plugin-log-api', () => ({
		error: () => {},
		warn: () => {},
		info: () => {},
		debug: () => {},
		trace: () => {}
	}));
});

afterEach(() => {
	clearMocks();
});

describe('orderAndGroupSubjects', () => {
	let id = -1;

	/*
	 * [
	 * [S0, S2, S3],
	 * [S4],
	 * [S1, S5]
	 * ]
	 */
	const subjects = [
		new Subject({
			id: id++,
			name: `S${id}`,
			examStartDate: DateTime.fromObject({ year: 2024, month: 6, day: 18, hour: 12, minute: 0 }),
			examDuration: Duration.fromObject({ hours: 2 })
		}),
		new Subject({
			id: id++,
			name: `S${id}`,
			examStartDate: DateTime.fromObject({ year: 2024, month: 6, day: 18, hour: 19, minute: 30 }),
			examDuration: Duration.fromObject({ hours: 2 })
		}),
		new Subject({
			id: id++,
			name: `S${id}`,
			examStartDate: DateTime.fromObject({ year: 2024, month: 6, day: 18, hour: 13, minute: 0 }),
			examDuration: Duration.fromObject({ hours: 2 })
		}),
		new Subject({
			id: id++,
			name: `S${id}`,
			examStartDate: DateTime.fromObject({ year: 2024, month: 6, day: 18, hour: 14, minute: 30 }),
			examDuration: Duration.fromObject({ hours: 2 })
		}),
		new Subject({
			id: id++,
			name: `S${id}`,
			examStartDate: DateTime.fromObject({ year: 2024, month: 6, day: 18, hour: 17, minute: 0 }),
			examDuration: Duration.fromObject({ hours: 2 })
		}),
		new Subject({
			id: id++,
			name: `S${id}`,
			examStartDate: DateTime.fromObject({ year: 2024, month: 6, day: 18, hour: 19, minute: 30 }),
			examDuration: Duration.fromObject({ hours: 2 })
		})
	];

	const expected = collidingExamnsToConfiguration([
		[subjects[0], subjects[2], subjects[3]],
		[subjects[4]],
		[subjects[1], subjects[5]]
	]);

	it('works', () => {
		const grouped = orderAndGroupSubjects(subjects);

		expect(grouped).toEqual({ ok: true, configuration: expected });
	});
});
