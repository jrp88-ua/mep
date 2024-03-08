<script lang="ts">
	import * as m from '$paraglide/messages';
	import { Step, Stepper } from '@skeletonlabs/skeleton';
	import SelectAndValidateFile from './SelectAndValidateFile.svelte';
	import SelectSheetToImport from './SelectSheetToImport.svelte';

	let selectAndValidateFile: SelectAndValidateFile;

	let selectedFile: string | undefined;
	let sheets: string[] | undefined;
	let selectedSheet: string | undefined;

	function onFileReady(e: CustomEvent<{ selectedFile: string; sheets: string[] }>) {
		selectedFile = e.detail.selectedFile;
		sheets = e.detail.sheets;
	}

	function onSelectedSheet(e: CustomEvent<string>) {
		selectedSheet = e.detail;
	}
</script>

<h1 class="text-3xl mb-4">Importar examinados</h1>
<div class="w-full card p-4 text-token">
	<Stepper
		stepTerm={m.stepper_step()}
		buttonNextLabel={m.stepper_next()}
		buttonBackLabel={m.stepper_back()}
	>
		<Step locked={selectedFile === undefined}>
			<svelte:fragment slot="header">Elegir origen de datos a importar</svelte:fragment>
			<SelectAndValidateFile {selectedFile} on:fileready={onFileReady} />
		</Step>
		<Step locked={selectedSheet === undefined}>
			<svelte:fragment slot="header">Indicar la hoja con los datos</svelte:fragment>
			{#if sheets !== undefined}
				<SelectSheetToImport {selectedSheet} on:sheetselected={onSelectedSheet} {sheets} />
			{/if}
		</Step>
		<Step>paso 3</Step>
		<Step>paso 4</Step>
		<Step>paso 5</Step>
	</Stepper>
	<a href="/examinees" class="btn variant-filled-tertiary mt-4">
		<i class="fa-solid fa-xmark" />
		<span>Cancelar</span>
	</a>
</div>
