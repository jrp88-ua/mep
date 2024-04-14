import { z } from 'zod';
import { createStore, ModelId, type Model } from './models';

export class AcademicCentre implements Model {
	static Id = ModelId;
	static Name = z.string().trim().min(1);
	static Type = z.object({
		id: AcademicCentre.Id,
		name: AcademicCentre.Name
	});

	readonly id: ModelId;
	name: string;

	constructor(params: { id: ModelId; name: string }) {
		this.id = params.id;
		this.name = params.name;
	}

	setName(value: string): void {
		this.name = AcademicCentre.Name.parse(value);
	}

	toString(): string {
		return `id: ${this.id}, name: ${this.name}`;
	}
}

export const AcademicCentreForCreate = z.object({
	name: AcademicCentre.Name
});
export type AcademicCentreForCreate = z.infer<typeof AcademicCentreForCreate>;

export const academicCentresStore = createStore<AcademicCentre>('academic centre');
