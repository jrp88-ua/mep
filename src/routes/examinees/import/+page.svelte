<script lang="ts">
	import * as m from '$paraglide/messages';
	import { ProgressRadial, Step, Stepper, getToastStore } from '@skeletonlabs/skeleton';
	import SelectAndValidateFile from './SelectAndValidateFile.svelte';
	import SelectSheetToImport from './SelectSheetToImport.svelte';
	import type { ExcelSheet, ExamineeImportSettings } from '$lib/types/sheetsImport';
	import IndicateHowToImport from './IndicateHowToImport.svelte';
	import ImportResume from './ImportResume.svelte';
	import { appState } from '$lib/stores/appState';
	import { goto } from '$app/navigation';
	import { showErrorToast, showSuccessToast } from '$lib/toast';
	import { ipc_invoke } from '$lib/ipc';
	import { examineesStore, reloadAllStores } from '$lib/stores/models';
	import { onDestroy } from 'svelte';

	const toast = getToastStore();

	let selectedFile: string | undefined;
	let sheets: ExcelSheet[] | undefined;
	let selectedSheet: { name: string; valid: boolean } | undefined;
	let importSettings: ExamineeImportSettings = defaultImputSettings();
	let importSettingsAreValid: boolean = false;

	let importPromise: Promise<void> | undefined;

	onDestroy(() => ipc_invoke('cancel_examinee_import'));

	function onFileReady(e: CustomEvent<{ selectedFile: string; sheets: ExcelSheet[] }>) {
		selectedFile = e.detail.selectedFile;
		sheets = e.detail.sheets;
	}

	function onSelectedSheet(e: CustomEvent<{ name: string; valid: boolean }>) {
		if (selectedSheet?.name !== e.detail.name) importSettings = defaultImputSettings();
		selectedSheet = e.detail;
	}

	function onImportSettingsValidity(e: CustomEvent<boolean>) {
		importSettingsAreValid = e.detail;
	}

	function onComplete() {
		appState.lockNavigation(m.locked_navigation_examinees_being_imported());
		importPromise = new Promise<void>(async (res) => {
			try {
				if (selectedSheet === undefined) {
					appState.unlockNavigation();
					toast.trigger(
						showErrorToast({
							message: 'Estado del programa inválido, se ha cancelado el importado'
						})
					);
					goto('/examinees');
					res();
					return;
				}
				const result = await ipc_invoke<{ importedExaminees: number }>('perform_examinee_import', {
					importSettings: {
						...importSettings,
						selectedSheet: selectedSheet.name
					}
				});
				await reloadAllStores();
				toast.trigger(
					showSuccessToast({
						message: m.examinees_imported_succesfully({ amount: result.importedExaminees })
					})
				);
			} catch (e) {
				await reloadAllStores();
				toast.trigger(
					showErrorToast({
						message: (e as Error).message
					})
				);
			}
			appState.unlockNavigation();
			goto('/examinees');
			res();
		});
	}

	function defaultImputSettings(): ExamineeImportSettings {
		return {
			firstRowIsHeader: true,
			groupRowsByColumn: undefined,
			courtColumn: undefined,
			nameColumn: undefined,
			originColumn: undefined,
			surenamesColumn: undefined,
			academicCentreColumn: undefined,
			subjectsColumn: undefined
		};
	}
</script>

<h1 class="text-3xl mb-4">Importar examinados</h1>
{#if importPromise === undefined}
	<div class="w-full card p-4 text-token">
		<Stepper
			stepTerm={m.stepper_step()}
			buttonNextLabel={m.stepper_next()}
			buttonBackLabel={m.stepper_back()}
			buttonCompleteLabel={m.import_examinees_do_import()}
			on:complete={onComplete}
		>
			<Step locked={selectedFile === undefined}>
				<svelte:fragment slot="header">Elegir origen de datos a importar</svelte:fragment>
				<SelectAndValidateFile {selectedFile} on:fileready={onFileReady} />
			</Step>
			<Step locked={selectedSheet === undefined || !selectedSheet.valid}>
				<svelte:fragment slot="header">Indicar la hoja con los datos</svelte:fragment>
				{#if sheets !== undefined}
					<SelectSheetToImport
						selectedSheet={selectedSheet?.name}
						on:sheetselected={onSelectedSheet}
						{sheets}
					/>
				{/if}
			</Step>
			<Step locked={!importSettingsAreValid}>
				<svelte:fragment slot="header">Indicar cómo se deben importar los datos</svelte:fragment>
				<IndicateHowToImport
					bind:importSettings
					on:importsettingsvalidity={onImportSettingsValidity}
					sheet={sheets?.find((sheet) => sheet.name === selectedSheet?.name)}
				/>
			</Step>
			<Step>
				<svelte:fragment slot="header">Importar datos</svelte:fragment>
				<ImportResume />
			</Step>
		</Stepper>
		<a href="/examinees" class="btn variant-filled-tertiary mt-4">
			<i class="fa-solid fa-xmark" />
			<span>Cancelar</span>
		</a>
	</div>
{:else}
	<div class=" flex flex-col items-center">
		{#await importPromise}
			<h2 class="text-2xl mb-5">Importando</h2>
			<ProgressRadial />
		{/await}
	</div>
{/if}
