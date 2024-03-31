export type ExcelSheet = {
	name: string;
	values: string[][];
};

export type ExamineeImportSettings = {
	firstRowIsHeader: boolean;
	groupRowsByColumn: number | undefined;

	courtColumn: number | undefined;
	subjectNameColumn: number | undefined;
	surenamesColumn: number | undefined;
	nameColumn: number | undefined;
	nifColumn: number | undefined;
	subjectKindColumn: number | undefined;
	originColumn: number | undefined;
	academicCentreColumn: number | undefined;
};
