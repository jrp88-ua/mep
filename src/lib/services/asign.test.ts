import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	findExamDateCollisions,
	findExamineesWithExamnDateCollisions,
	groupExamineesBySubjects
} from './asign';
import { DateTime, Duration, Settings } from 'luxon';
import { Subject, subjectsStore } from '$lib/models/subjects';
import { Examinee, examineesStore } from '$lib/models/examinees';
import { clearMocks } from '@tauri-apps/api/mocks';

beforeEach(() => {
	vi.clearAllMocks();
	vi.mock('tauri-plugin-log-api', () => ({
		error: () => {},
		warn: () => {},
		info: () => {},
		debug: () => {},
		trace: () => {}
	}));
	subjectsStore.clear();
	examineesStore.clear();
});

afterEach(() => {
	clearMocks();
});

describe('groupExamineesBySubjects', () => {
	let id = 0;
	const subjects = [
		new Subject({ id: id++, name: 'Math' }),
		new Subject({ id: id++, name: 'Spanish' }),
		new Subject({ id: id++, name: 'History' }),
		new Subject({ id: id++, name: 'French' })
	];

	const baseExaminee = { nif: '', origin: '', court: 1 };
	const examinees = [
		new Examinee({ ...baseExaminee, id: id++, name: 'Examinee A', subjectsIds: [0, 1, 2] }),
		new Examinee({ ...baseExaminee, id: id++, name: 'Examinee B', subjectsIds: [0, 1] }),
		new Examinee({ ...baseExaminee, id: id++, name: 'Examinee C', subjectsIds: [1, 2] }),
		new Examinee({ ...baseExaminee, id: id++, name: 'Examinee D', subjectsIds: [1] })
	];
	/**
	 * Examinee A => Math, Spanish, History
	 * Examinee B => Math, Spanish
	 * Examinee C => Spanish, History
	 * Examinee D => Spanish
	 */

	it('works', () => {
		subjects.forEach((subject) => subjectsStore.storeInstance(subject));

		const grouped = groupExamineesBySubjects(subjects, examinees);

		const expected = new Map();
		expected.set(subjects[0], [examinees[0], examinees[1]]);
		expected.set(subjects[1], [examinees[0], examinees[1], examinees[2], examinees[3]]);
		expected.set(subjects[2], [examinees[0], examinees[2]]);
		expected.set(subjects[3], []);

		expect(grouped).toEqual(expected);
	});
});

describe('findExamDateCollisions with no collisions', () => {
	it('With no subjects', () => {
		const collisions = findExamDateCollisions([]);

		expect(collisions).not.toBeUndefined();
		expect(collisions).toEqual([]);
	});

	it('With subjects', () => {
		let id = 0;
		const collisions = findExamDateCollisions([
			new Subject({
				id: ++id,
				name: 'Math',
				examStartDate: DateTime.utc(2024, 6, 14, 9, 0),
				examDuration: Duration.fromObject({ hour: 3 })
			}),
			new Subject({
				id: ++id,
				name: 'English',
				examStartDate: DateTime.utc(2024, 6, 14, 12, 30),
				examDuration: Duration.fromObject({ hour: 2 })
			}),
			new Subject({
				id: ++id,
				name: 'Spanish',
				examStartDate: DateTime.utc(2024, 6, 15, 9, 0),
				examDuration: Duration.fromObject({ hour: 2 })
			})
		]);

		expect(collisions).not.toBeUndefined();
		expect(collisions).toEqual([]);
	});
});

describe('findExamDateCollisions with collisions', () => {
	const spanish = new Subject({
		id: 10,
		name: 'Spanish',
		examStartDate: DateTime.utc(2024, 6, 14, 15, 0),
		examDuration: Duration.fromObject({ hour: 2 })
	});
	const english = new Subject({
		id: 5,
		name: 'English',
		examStartDate: DateTime.utc(2024, 6, 14, 18, 0),
		examDuration: Duration.fromObject({ hour: 2 })
	});
	const german = new Subject({
		id: 1,
		name: 'German',
		examStartDate: DateTime.utc(2024, 6, 14, 18, 0),
		examDuration: Duration.fromObject({ hour: 2 })
	});
	it('Collides English and German, same date and duration;', () => {
		// german < english < spanish
		const collisions = findExamDateCollisions([spanish, english, german]);

		expect(collisions).toEqual([[german, english]]);
	});

	const french = new Subject({
		id: 2,
		name: 'French',
		examStartDate: DateTime.utc(2024, 6, 14, 19, 0),
		examDuration: Duration.fromObject({ hour: 2 })
	});
	it('German and French, French starts while German is ongoing; Collides English and German, same date and duration; English and French, French starts while English is ongoing;', () => {
		// german < french < english < spanish
		const collisions = findExamDateCollisions([french, spanish, english, german]);

		expect(collisions).toEqual([
			[german, french],
			[german, english],
			[french, english]
		]);
	});

	const math = new Subject({
		id: 3,
		name: 'Math',
		examStartDate: DateTime.utc(2024, 6, 14, 9, 0),
		examDuration: Duration.fromObject({ hour: 3 })
	});
	it('Same as before, but add math with no collisions', () => {
		// german < french < math < english < spanish
		const collisions = findExamDateCollisions([math, french, spanish, english, german]);

		expect(collisions).toEqual([
			[german, french],
			[german, english],
			[french, english]
		]);
	});
});

describe('findExamDateCollisions with invalid data', () => {
	it('has no exam date', () => {
		expect(() =>
			findExamDateCollisions([
				new Subject({
					id: 0,
					name: 'sub',
					examStartDate: undefined,
					examDuration: Duration.fromMillis(1)
				})
			])
		).toThrowError();
	});

	it('has no exam duration', () => {
		expect(() =>
			findExamDateCollisions([
				new Subject({
					id: 0,
					name: 'sub',
					examStartDate: DateTime.now(),
					examDuration: undefined
				})
			])
		).toThrowError();
	});

	it('has an invalid exam date', () => {
		const oldThrowOnInvalid = Settings.throwOnInvalid;
		Settings.throwOnInvalid = false;
		expect(() =>
			findExamDateCollisions([
				new Subject({
					id: 0,
					name: 'sub',
					examStartDate: DateTime.utc(2024, 31, 2),
					examDuration: Duration.fromMillis(1)
				})
			])
		).toThrowError();
		Settings.throwOnInvalid = oldThrowOnInvalid;
	});
});

describe('findExamineesWithExamnDateCollisions', () => {
	let id = 0;
	const subjects = [
		new Subject({
			id: id++,
			name: 'Math',
			examStartDate: DateTime.utc(2024, 6, 12, 9, 0),
			examDuration: Duration.fromObject({ hours: 2 })
		}),
		new Subject({
			id: id++,
			name: 'Spanish',
			examStartDate: DateTime.utc(2024, 6, 12, 15, 0),
			examDuration: Duration.fromObject({ hours: 2 })
		}),
		new Subject({
			id: id++,
			name: 'German',
			examStartDate: DateTime.utc(2024, 6, 13, 9, 0),
			examDuration: Duration.fromObject({ hours: 2 })
		}),
		new Subject({
			id: id++,
			name: 'French',
			examStartDate: DateTime.utc(2024, 6, 13, 9, 0),
			examDuration: Duration.fromObject({ hours: 2 })
		})
	];

	const baseExaminee = { nif: '', origin: '', court: 1 };
	const examinees = [
		new Examinee({ ...baseExaminee, id: id++, name: 'Examinee A', subjectsIds: [0, 1, 2] }),
		new Examinee({ ...baseExaminee, id: id++, name: 'Examinee B', subjectsIds: [0, 1] }),
		new Examinee({ ...baseExaminee, id: id++, name: 'Examinee C', subjectsIds: [1, 2] }),
		new Examinee({ ...baseExaminee, id: id++, name: 'Examinee D', subjectsIds: [1, 2, 3] })
	];
	/**
	 * Collision German-French
	 * Examinee A => Math, Spanish, German
	 * Examinee B => Math, Spanish
	 * Examinee C => Spanish, German
	 * Examinee D => Spanish, German, French -- Collision
	 */

	it('works', () => {
		subjects.forEach((subject) => subjectsStore.storeInstance(subject));

		const grouped = findExamineesWithExamnDateCollisions(examinees);

		const expected = new Map();
		expected.set(examinees[3], [[subjects[2], subjects[3]]]);

		expect(grouped).toEqual(expected);
	});
});
