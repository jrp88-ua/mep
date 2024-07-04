import { clearMocks } from '@tauri-apps/api/mocks';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IndividualExamConfiguration } from './individualExamConfiguration';
import { Subject } from '$lib/models/subjects';
import { Examinee } from '$lib/models/examinees';
import { Classroom } from '$lib/models/classroom';
import type { ExamDistribution } from './assign';
import { Vigilant } from '$lib/models/vigilant';
import { nameSorter } from '$lib/util';

beforeEach(() => {
	id = 0;
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

let id = 0;
function makeExaminee(subjects: number[]) {
	return new Examinee({
		id: id++,
		name: `Examinee ${id}`,
		surenames: `Surenames ${id}`,
		court: 1,
		nif: `Nif${id}`,
		origin: 'B',
		subjectsIds: subjects
	});
}

function makeVigilant(specialties?: number[]) {
	return new Vigilant({
		id: id++,
		name: `Vigilant ${id}`,
		surenames: `Surenames ${id}`,
		mainCourt: 1,
		role: 'MEMBER',
		specialtiesIds: specialties
	});
}

function makeClassroom(priority: number, totalCapacity: number, examCapacity?: number) {
	return new Classroom({
		id: id++,
		code: `C${id}`,
		totalCapacity,
		examCapacity: examCapacity ?? Math.floor(totalCapacity / 3),
		kind: '',
		locationCode: `L${id}`,
		notes: [],
		priority
	});
}

describe('hasEnoughCapacity', () => {
	let subject: Subject;
	let configuration: IndividualExamConfiguration;

	let examinees: Examinee[];
	let firstClassroom: Classroom;
	let seccondClassroom: Classroom;

	function instanciate() {
		id = 0;
		subject = new Subject({
			id: 0,
			name: 'Test subject'
		});
		configuration = new IndividualExamConfiguration(subject);
		examinees = [
			makeExaminee([0]),
			makeExaminee([0]),
			makeExaminee([0]),
			makeExaminee([0]),
			makeExaminee([0])
		];
		firstClassroom = makeClassroom(1, 3);
		seccondClassroom = makeClassroom(2, 3);
	}

	describe('With one classroom', () => {
		beforeEach(() => {
			instanciate();
			configuration.addExaminees(examinees);
			configuration.addClassrooms([firstClassroom]);
		});

		it('Not enough capacity', () => {
			firstClassroom.setTotalCapacity(1);
			expect(configuration.hasEnoughCapacity()).toBe('not-enough');
		});

		it('Has just enough total capacity', () => {
			firstClassroom.setTotalCapacity(5);
			expect(configuration.hasEnoughCapacity()).toBe('could-use-more');
		});

		it('Has just enough exam capacity', () => {
			firstClassroom.setCapacities(15, 5);
			expect(configuration.hasEnoughCapacity()).toBe('no-problem');
		});

		it('Has capacity with the total', () => {
			firstClassroom.setCapacities(7, 1);
			expect(configuration.hasEnoughCapacity()).toBe('could-use-more');
		});

		it('Has capacity with the exam', () => {
			firstClassroom.setCapacities(14, 7);
			expect(configuration.hasEnoughCapacity()).toBe('no-problem');
		});
	});

	describe('With two classrooms', () => {
		beforeEach(() => {
			instanciate();
			configuration.addExaminees(examinees);
			configuration.addClassrooms([firstClassroom, seccondClassroom]);
		});

		it('Not enough capacity', () => {
			firstClassroom.setCapacities(2, 1);
			seccondClassroom.setCapacities(2, 1);
			expect(configuration.hasEnoughCapacity()).toBe('not-enough');
		});

		it('Has just enough total capacity', () => {
			firstClassroom.setCapacities(3, 1);
			seccondClassroom.setCapacities(2, 1);
			expect(configuration.hasEnoughCapacity()).toBe('could-use-more');
		});

		it('Has just enough exam capacity', () => {
			firstClassroom.setCapacities(6, 3);
			seccondClassroom.setCapacities(4, 2);
			expect(configuration.hasEnoughCapacity()).toBe('no-problem');
		});

		it('Has enough total capacity', () => {
			firstClassroom.setCapacities(6, 1);
			seccondClassroom.setCapacities(6, 1);
			expect(configuration.hasEnoughCapacity()).toBe('could-use-more');
		});

		it('Has enough exam capacity', () => {
			firstClassroom.setCapacities(5, 3);
			seccondClassroom.setCapacities(5, 3);
			expect(configuration.hasEnoughCapacity()).toBe('no-problem');
		});
	});
});

describe('doAssignment', () => {
	let subject: Subject;
	let configuration: IndividualExamConfiguration;

	let examinees: Examinee[];
	let vigilants: Vigilant[];
	let firstClassroom: Classroom;
	let seccondClassroom: Classroom;

	function instanciate() {
		id = 0;
		subject = new Subject({
			id: 0,
			name: 'Test subject'
		});
		configuration = new IndividualExamConfiguration(subject);
		examinees = [
			makeExaminee([0]),
			makeExaminee([0]),
			makeExaminee([0]),
			makeExaminee([0]),
			makeExaminee([0]),
			makeExaminee([0]),
			makeExaminee([0]),
			makeExaminee([0]),
			makeExaminee([0]),
			makeExaminee([0])
		].sort(nameSorter);
		vigilants = [makeVigilant(), makeVigilant(), makeVigilant()];
		firstClassroom = makeClassroom(2, 3);
		seccondClassroom = makeClassroom(1, 3);
	}

	it('getExamineesDistribution errors if no distribution is done', () => {
		instanciate();
		expect(configuration.getDistribution()).toEqual('assignment-not-done');
	});

	describe('With one classroom', () => {
		beforeEach(() => {
			instanciate();
			configuration.addExaminees(examinees);
			configuration.addClassrooms([firstClassroom]);
			configuration.addVigilants(vigilants);
		});

		it('Not enough capacity', () => {
			firstClassroom.setTotalCapacity(1);
			expect(configuration.doAssignment()).toEqual([{ type: 'not-enough-seats', subject }]);
		});

		it('Has just enough total capacity', () => {
			firstClassroom.setTotalCapacity(10);
			expect(configuration.doAssignment()).toEqual([]);
			expect(configuration.getDistribution()).toEqual({
				subject,
				specialists: [],
				distribution: [{ classroom: firstClassroom, examinees, vigilants }]
			} satisfies ExamDistribution);
		});

		it('Has just enough exam capacity', () => {
			firstClassroom.setCapacities(15, 5);
			expect(configuration.doAssignment()).toEqual([]);
			expect(configuration.getDistribution()).toEqual({
				subject,
				specialists: [],
				distribution: [{ classroom: firstClassroom, examinees, vigilants }]
			} satisfies ExamDistribution);
		});

		it('Has capacity with the total', () => {
			firstClassroom.setCapacities(11, 1);
			expect(configuration.doAssignment()).toEqual([]);
			expect(configuration.getDistribution()).toEqual({
				subject,
				specialists: [],
				distribution: [{ classroom: firstClassroom, examinees: examinees, vigilants }]
			} satisfies ExamDistribution);
		});

		it('Has capacity with the exam', () => {
			firstClassroom.setCapacities(14, 11);
			expect(configuration.doAssignment()).toEqual([]);
			expect(configuration.getDistribution()).toEqual({
				subject,
				specialists: [],
				distribution: [{ classroom: firstClassroom, examinees, vigilants }]
			} satisfies ExamDistribution);
		});
	});

	describe('With two classrooms', () => {
		beforeEach(() => {
			instanciate();
			configuration.addExaminees(examinees);
			configuration.addClassrooms([firstClassroom, seccondClassroom]);
			configuration.addVigilants(vigilants);
		});

		it('Not enough capacity', () => {
			firstClassroom.setCapacities(1, 1);
			seccondClassroom.setCapacities(1, 1);
			expect(configuration.doAssignment()).toEqual([{ type: 'not-enough-seats', subject }]);
		});

		it('Has just enough total capacity', () => {
			firstClassroom.setCapacities(5, 1);
			seccondClassroom.setCapacities(5, 1);
			expect(configuration.doAssignment()).toEqual([]);
			expect(configuration.getDistribution()).toEqual({
				subject,
				specialists: [],
				distribution: [
					{
						classroom: seccondClassroom,
						examinees: examinees.slice(0, 5),
						vigilants: vigilants.slice(0, 2)
					},
					{
						classroom: firstClassroom,
						examinees: examinees.slice(5),
						vigilants: vigilants.slice(2)
					}
				]
			} satisfies ExamDistribution);
		});

		it('Has just enough exam capacity', () => {
			firstClassroom.setCapacities(10, 5);
			seccondClassroom.setCapacities(10, 5);
			expect(configuration.doAssignment()).toEqual([]);
			expect(configuration.getDistribution()).toEqual({
				subject,
				specialists: [],
				distribution: [
					{
						classroom: seccondClassroom,
						examinees: examinees.slice(0, 5),
						vigilants: vigilants.slice(0, 2)
					},
					{
						classroom: firstClassroom,
						examinees: examinees.slice(5),
						vigilants: vigilants.slice(2)
					}
				]
			} satisfies ExamDistribution);
		});

		it('Has capacity with the total', () => {
			firstClassroom.setCapacities(10, 1);
			seccondClassroom.setCapacities(5, 1);
			expect(configuration.doAssignment()).toEqual([]);
			expect(configuration.getDistribution()).toEqual({
				subject,
				specialists: [],
				distribution: [
					{
						classroom: seccondClassroom,
						examinees: examinees.slice(0, 4),
						vigilants: vigilants.slice(0, 1)
					},
					{
						classroom: firstClassroom,
						examinees: examinees.slice(4),
						vigilants: vigilants.slice(1)
					}
				]
			} satisfies ExamDistribution);
		});

		it('Has capacity with the exam', () => {
			firstClassroom.setCapacities(15, 10);
			seccondClassroom.setCapacities(15, 10);
			expect(configuration.doAssignment()).toEqual([]);
			expect(configuration.getDistribution()).toEqual({
				subject,
				specialists: [],
				distribution: [
					{
						classroom: seccondClassroom,
						examinees: examinees.slice(0, 5),
						vigilants: vigilants.slice(0, 2)
					},
					{
						classroom: firstClassroom,
						examinees: examinees.slice(5),
						vigilants: vigilants.slice(2)
					}
				]
			} satisfies ExamDistribution);
		});

		it('Most priority is at exam capacity seccond priority does not', () => {
			firstClassroom.setCapacities(20, 10);
			seccondClassroom.setCapacities(3, 2);
			expect(configuration.doAssignment()).toEqual([]);
			expect(configuration.getDistribution()).toEqual({
				subject,
				specialists: [],
				distribution: [
					{
						classroom: seccondClassroom,
						examinees: examinees.slice(0, 2),
						vigilants: vigilants.slice(0, 1)
					},
					{
						classroom: firstClassroom,
						examinees: examinees.slice(2),
						vigilants: vigilants.slice(1)
					}
				]
			} satisfies ExamDistribution);
		});
	});
});
