<script lang="ts">
	import type { Examinee } from '$lib/models/examinees';
	import * as m from '$paraglide/messages';

	export let matching: Examinee | undefined;
</script>

<div
	class="card p-4 variant-filled-surface"
	data-popup="examinee-warning"
	style={matching === undefined ? 'display: none;' : ''}
>
	<p><strong>{m.examinee_already_exists({ nif: matching?.nif || '' })}</strong></p>
	<div>
		<table class="table">
			<tbody>
				<tr>
					<td>{m.nif()}</td>
					<td>{matching?.nif}</td>
				</tr>
				<tr>
					<td>{m.name()}</td>
					<td>{matching?.name}</td>
				</tr>
				<tr>
					<td>{m.surenames()}</td>
					<td>{matching?.surenames}</td>
				</tr>
				<tr>
					<td>{m.origin()}</td>
					<td>{matching?.origin}</td>
				</tr>
				<tr>
					<td>{m.court()}</td>
					<td>{matching?.court}</td>
				</tr>
				<tr>
					<td>{m.academic_centre()}</td>
					<td>
						{#if matching?.getAcademicCentre() !== undefined}
							{matching.getAcademicCentre()?.name}
						{:else}
							<i>{m.no_academic_centre()}</i>
						{/if}
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
