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
	readonly name: string;

	constructor(params: { id: ModelId; name: string }) {
		params = AcademicCentre.Type.parse(params);
		this.id = params.id;
		this.name = params.name;
	}
}

export const AcademicCentreForCreate = z.object({
	name: AcademicCentre.Name
});
export type AcademicCentreForCreate = z.infer<typeof AcademicCentreForCreate>;

export const AcademicCentreForUpdate = z.object({
	name: AcademicCentre.Name.optional()
});
export type AcademicCentreForUpdate = z.infer<typeof AcademicCentreForUpdate>;

export const academicCentresStore = createStore<
	AcademicCentre,
	AcademicCentreForCreate,
	AcademicCentreForUpdate
>(AcademicCentre, 'academic_centre', 'academic_centres');
