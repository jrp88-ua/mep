<script lang="ts">
	import * as m from '$paraglide/messages';
	import {
		ProgressRadial,
		Step,
		Stepper,
		getModalStore,
		getToastStore
	} from '@skeletonlabs/skeleton';
	import SelectAndValidateFile from './SelectAndValidateFile.svelte';
	import SelectSheetToImport from './SelectSheetToImport.svelte';
	import IndicateHowToImport from './IndicateHowToImport.svelte';
	import ImportResume from './ImportResume.svelte';
	import { appState } from '$lib/models/appState';

	import { showErrorToast, showSuccessToast } from '$lib/toast';
	import { ipc_invoke, ipc_invoke_result } from '$lib/ipc';
	import { onDestroy } from 'svelte';
	import type { ExamineeImportError } from '$lib/types/generated/ExamineeImportError';
	import { getExamineeImportErrorMessage } from '$lib/errors';
	import type { ExamineeImportValues } from '$lib/types/generated/ExamineeImportValues';
	import { importValues, type ImportValuesMoment } from '$lib/services/common';
	import type { ExamineeImportSettings } from '$lib/types/generated/ExamineeImportSettings';
	import type { ExcelSheet } from '$lib/types/generated/ExcelSheet';
	import { routeTo } from '$lib/util';
	import { showActionWillDeleteAssignment } from '../../actionWillDeleteAssignment';
	import { examineesStore } from '$lib/models/examinees';
	import { subjectsStore } from '$lib/models/subjects';
	import { academicCentresStore } from '$lib/models/academicCentres';
	import { get } from 'svelte/store';

	enum WhatToShow {
		Indicate,
		ProcessWaiting,
		ProcessCreating
	}

	let whatToShow = WhatToShow.Indicate;

	const toastStore = getToastStore();
	const modalStore = getModalStore();

	let selectedFile: string | undefined;
	let sheets: ExcelSheet[] | undefined;
	let selectedSheet: { name: string; valid: boolean } | undefined;
	let importSettings: ExamineeImportSettings = defaultImputSettings();
	let importSettingsAreValid: boolean = false;

	let importState: undefined | ImportValuesMoment;

	onDestroy(() => ipc_invoke('cancel_examinee_import'));

	async function onComplete() {
		if (!canImport) return;

		if (!(await showActionWillDeleteAssignment(modalStore))) return;

		whatToShow = WhatToShow.ProcessWaiting;
		appState.lockNavigation(m.locked_navigation_examinees_being_imported());
		if (selectedSheet === undefined) {
			showErrorToast(toastStore, {
				message: m.examinees_import_invalid_program_state()
			});
			appState.unlockNavigation();
			routeTo('/examinees');
			return;
		}
		const result = await ipc_invoke_result<ExamineeImportValues, ExamineeImportError>(
			'perform_examinee_import',
			{
				importSettings: {
					...importSettings,
					selectedSheet: selectedSheet.name
				}
			}
		);
		whatToShow = WhatToShow.ProcessCreating;
		if (result.success) {
			const importer = importValues(result.value);
			for (const importMoment of importer) importState = await importMoment;
			showSuccessToast(toastStore, {
				message: m.examinees_imported_succesfully({ amount: importState?.examinees.total! })
			});
		} else {
			showErrorToast(toastStore, {
				...getExamineeImportErrorMessage(result.error),
				autohide: false
			});
		}
		appState.unlockNavigation();
		routeTo('/examinees');
	}

	function defaultImputSettings(): ExamineeImportSettings {
		return {
			selectedSheet: '',
			firstRowIsHeader: true,
			groupRowsByColumn: 4,
			nifColumn: 4,
			subjectKindColumn: 7,
			courtColumn: 0,
			nameColumn: 3,
			originColumn: 7,
			surenamesColumn: 2,
			academicCentreColumn: 8,
			subjectNameColumn: 1
		};
	}

	const canImport =
		get(examineesStore).size === 0 &&
		get(subjectsStore).size === 0 &&
		get(academicCentresStore).size === 0;
</script>

<h1 class="text-3xl mb-4">{m.examinees_import_page_title()}</h1>
{#if canImport}
	{#if whatToShow === WhatToShow.Indicate}
		<div class="w-full card p-4 text-token">
			<Stepper
				stepTerm={m.stepper_step()}
				buttonNextLabel={m.stepper_next()}
				buttonBackLabel={m.stepper_back()}
				buttonCompleteLabel={m.import_examinees_do_import()}
				on:complete={onComplete}
			>
				<Step locked={selectedFile === undefined}>
					<svelte:fragment slot="header">{m.examinees_import_select_origin()}</svelte:fragment>
					<SelectAndValidateFile
						{selectedFile}
						on:fileready={(e) => {
							selectedFile = e.detail.selectedFile;
							sheets = e.detail.sheets;
						}}
					/>
				</Step>
				<Step locked={selectedSheet === undefined || !selectedSheet.valid}>
					<svelte:fragment slot="header">{m.examinees_import_select_sheet()}</svelte:fragment>
					{#if sheets !== undefined}
						<SelectSheetToImport
							selectedSheet={selectedSheet?.name}
							on:sheetselected={(e) => {
								if (selectedSheet?.name !== e.detail.name) importSettings = defaultImputSettings();
								selectedSheet = e.detail;
							}}
							{sheets}
						/>
					{/if}
				</Step>
				<Step locked={!importSettingsAreValid}>
					<svelte:fragment slot="header">{m.examinees_import_indicate_columns()}</svelte:fragment>
					<IndicateHowToImport
						bind:importSettings
						on:importsettingsvalidity={(e) => (importSettingsAreValid = e.detail)}
						sheet={sheets?.find((sheet) => sheet.name === selectedSheet?.name)}
					/>
				</Step>
				<Step>
					<svelte:fragment slot="header">{m.examinees_import_final()}</svelte:fragment>
					<ImportResume />
				</Step>
			</Stepper>
			<a href="/examinees" class="btn variant-filled-tertiary mt-4">
				<i class="fa-solid fa-xmark" />
				<span>{m.cancel()}</span>
			</a>
		</div>
	{:else if whatToShow === WhatToShow.ProcessWaiting}
		<div class=" flex flex-col items-center">
			<h2 class="text-2xl mb-5">{m.importing()}</h2>
			<ProgressRadial />
		</div>
	{:else}
		<div class=" flex flex-col items-center">
			<h2 class="text-2xl mb-5">{m.examinees_import_creating_instances()}</h2>
			<progress max={importState?.total || 0} value={importState?.done || 0} />
		</div>
	{/if}
{:else}
	<p>{m.examinees_import_can_not_import()}</p>
{/if}
