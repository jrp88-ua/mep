<script lang="ts">
	import { goto } from '$app/navigation';
	import { store } from '$lib/stores/examinees';
	import * as m from '$paraglide/messages';
	import type { ExamineeForCreate } from '../../../types/ExamineeForCreate';

	function submitForm(e: SubmitEvent) {
		const data = Object.fromEntries(new FormData(e.target as HTMLFormElement)) as any as ExamineeForCreate;
		store.createExaminee(data);
		goto("/examinees");
	}
</script>

<h1 class="text-3xl mb-4">{m.examinees_create_page_title()}</h1>

<form class="card" method="post" on:submit|preventDefault={submitForm}>
	<h2 class=" card-header text-2xl">Datos del nuevo examinado</h2>
	<div class="p-4">
		<label class="my-5">
			<span class="text-xl">Nombre</span>
			<input
				class="input"
				title="Nombre"
				name="name"
				type="text"
				placeholder="Nombre del alumno..."
				tabindex="0"
				required
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">Apellidos</span>
			<input
				class="input"
				title="Apellidos"
				name="surenames"
				type="text"
				placeholder="Apellidos del alumno..."
				required
			/>
		</label>
		<label class="my-5">
			<span class="text-xl">Origen</span>
			<select name="origin" title="Origen" class="select" size="3" required>
				<option value="Baccalaureate">Bachillerato</option>
				<option value="VocationalTraining">Formación profesional</option>
				<option value="other" disabled>Otro</option>
			</select>
		</label>
		<label class="my-5">
			<span class="text-xl">Tribunal</span>
			<input
				class="input"
				title="Tribunal"
				name="court_number"
				type="number"
				min="-32768"
				max="32767"
				placeholder="Tribunal del alumno..."
				required
			/>
		</label>
	</div>
	<div class="card-footer">
		<button type="submit" class="btn variant-filled-primary">
			<i class="fa-solid fa-plus" />
			<span>Añadir</span>
		</button>
		<button type="reset" class="btn variant-filled-secondary">
			<i class="fa-solid fa-broom" />
			<span>Limpair</span>
		</button>
		<a href="/examinees" class="btn variant-filled-tertiary">
			<i class="fa-solid fa-xmark" />
			<span>Cancelar</span>
		</a>
	</div>
</form>
