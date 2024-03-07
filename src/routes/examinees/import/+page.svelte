<script lang="ts">
	import * as m from '$paraglide/messages';
	import { FileDropzone, Step, Stepper } from '@skeletonlabs/skeleton';

	let selectedFile: FileList | undefined;
	$: stepOneCompleted = selectedFile !== undefined;
</script>

<h1 class="text-3xl mb-4">Importar examinados</h1>
<div class="w-full card p-4 text-token">
	<Stepper
		stepTerm={m.stepper_step()}
		buttonNextLabel={m.stepper_next()}
		buttonBackLabel={m.stepper_back()}
	>
		<Step locked={!stepOneCompleted}>
			<svelte:fragment slot="header">Elegir origen de datos a importar</svelte:fragment>
			<FileDropzone name="files" bind:files={selectedFile}>
				<svelte:fragment slot="lead">
					<i class="fa-solid fa-file-arrow-up text-4xl" />
				</svelte:fragment>
				<svelte:fragment slot="message">Elije un archivo o arrastra y suelta</svelte:fragment>
				<svelte:fragment slot="meta">
					Se permiten los formatos xls, xlsx, xlsm, xlsb, xla, xlam y ods
				</svelte:fragment>
			</FileDropzone>

			<div class={selectedFile === undefined ? 'hidden' : ''}>
				<h3>Comprobando archivo</h3>
			</div>
		</Step>
		<Step>paso 2</Step>
	</Stepper>
</div>
