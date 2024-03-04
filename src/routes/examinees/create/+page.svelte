<script lang="ts">
	import { enhance } from '$app/forms';
	import * as m from '$paraglide/messages';
</script>

<h1 class="text-3xl mb-4">{m.examinees_create_page_title()}</h1>

<form class="card" method="post" use:enhance>
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
				name="court"
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
