<script lang="ts">
	import type { Classroom } from '$lib/models/classroom';

	export let matching: Classroom | undefined;
	export let location: boolean;
</script>

<div
	class="card p-4 variant-filled-surface"
	data-popup={location ? 'location-code-warning' : 'code-warning'}
	style={matching === undefined ? 'display: none;' : ''}
>
	<p>
		<strong>
			{#if location}
				Ya existe un aula con el código de lugar {matching?.locationCode}
			{:else}
				Ya existe un aula con el código {matching?.code}
			{/if}
		</strong>
	</p>
	<div>
		<table class="table">
			<tbody>
				<tr>
					<td>Código</td>
					<td>{matching?.code}</td>
				</tr>
				<tr>
					<td>Código de lugar</td>
					<td>{matching?.locationCode}</td>
				</tr>
				<tr>
					<td>Capacidad total</td>
					<td>{matching?.totalCapacity}</td>
				</tr>
				<tr>
					<td>Capacidad de examen</td>
					<td>{matching?.examCapacity}</td>
				</tr>
				<tr>
					<td>Prioridad para asignar</td>
					<td>{matching?.priority}</td>
				</tr>
				<tr>
					<td>Sede del tribunal</td>
					<td>
						{#if matching?.courtLocation !== undefined}
							{matching.courtLocation}
						{:else}
							<i>No es la sede de ningún tribunal</i>
						{/if}
					</td>
				</tr>
				<tr>
					<td>Tipo</td>
					<td>{matching?.kind}</td>
				</tr>
				<tr>
					<td>Notas</td>
					<td>{matching?.notes}</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
