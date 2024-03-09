export type ExcelSheet = {
	name: string;
	values: string[][];
};

export type ExamineeImportSettings = {
	firstRowIsHeader: boolean;
	groupRowsByColumn: number | undefined;
	nameColumn: number | undefined;
	surenamesColumn: number | undefined;
	originColumn: number | undefined;
	courtColumn: number | undefined;
};
