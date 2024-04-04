import type { ExamineeImportColumn } from './types/generated/ExamineeImportColumn';
import type { ExamineeImportError } from './types/generated/ExamineeImportError';
import type { ExamineeImportInvalidValueError } from './types/generated/ExamineeImportInvalidValueError';

export function getExamineeImportErrorMessage(error: ExamineeImportError): {
	title: string;
	message: string;
} {
	let message = 'Error desconocido';
	const title = 'No se ha podido importar los datos';
	switch (error.type) {
		case 'lock':
			message =
				'Se ha producido un error desconocido durante el importado de los datos. Es posible que se requiera de reiniciar la aplicación.';
			break;
		case 'noValuesLoaded':
			message =
				'Se han intentado importar los datos cuando estos no se encuentran cargados en el programa.';
			break;
		case 'noSheet':
			message = 'Se han intentado importar los datos sin indicar primero a hoja que los contiene.';
			break;
		case 'missingValue':
			message = `En la fila ${error.row} falta el valor ${getColumnName(error.missing)}.`;
			break;
		case 'missmatchValue':
			message = `En la columna ${getColumnName(error.missmatch)} de la fila ${
				error.row
			} se ha encontrado el valor '${error.foundValue}', pero ya se había establecido el valor '${
				error.establishedValue
			}' para el examinado identificado mediante '${error.identifier}'.`;
			break;
		case 'invalidValue':
			message = `En la fila ${error.row}, ${getInvalidValueName(
				error.reason
			)}. El valor encontrado es '${error.invalidValue}'`;
			break;
		case 'missingExamineeValue':
			message = `Al examinado identificado por '${
				error.identifier
			}' le falta el valor para ${getColumnName(error.missing)}`;
			break;
	}
	return { title, message };
}

function getInvalidValueName(invalid: ExamineeImportInvalidValueError) {
	switch (invalid) {
		case 'courtIsNotNumber':
			return 'el tribunal no es un número';
	}
}

function getColumnName(missing: ExamineeImportColumn) {
	switch (missing) {
		case 'subjectName':
			return 'del nombre de la asignatura';
		case 'rowIdentifier':
			return 'del identificador de la fila';
		case 'examineeNif':
			return 'del nif del examinado';
		case 'examineeName':
			return 'del nombre del examinado';
		case 'examineeOrigin':
			return 'del origen del examinado';
		case 'examineeCourt':
			return 'del tribunal del examinado';
		case 'examineeSurenames':
			return 'de los apellidos del examinado';
		case 'examineeAcademicCentre':
			return 'del centro académico del examinado';
	}
}
