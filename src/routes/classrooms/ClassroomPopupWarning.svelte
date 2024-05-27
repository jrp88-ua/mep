<script lang="ts">
	import * as m from '$paraglide/messages';
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
				{m.classroom_location_code_already_exists({ code: matching?.locationCode || '' })}
			{:else}
				{m.classroom_code_already_exists({ code: matching?.code || '' })}
			{/if}
		</strong>
	</p>
	<div>
		<table class="table">
			<tbody>
				<tr>
					<td>{m.code()}</td>
					<td>{matching?.code}</td>
				</tr>
				<tr>
					<td>{m.location_code()}</td>
					<td>{matching?.locationCode}</td>
				</tr>
				<tr>
					<td>{m.total_capacity()}</td>
					<td>{matching?.totalCapacity}</td>
				</tr>
				<tr>
					<td>{m.exam_capacity()}</td>
					<td>{matching?.examCapacity}</td>
				</tr>
				<tr>
					<td>{m.priority_to_asign_examinees()}</td>
					<td>{matching?.priority}</td>
				</tr>
				<tr>
					<td>{m.court_location()}</td>
					<td>
						{#if matching?.courtLocation !== undefined}
							{matching.courtLocation}
						{:else}
							<i>{m.no_court_location()}</i>
						{/if}
					</td>
				</tr>
				<tr>
					<td>{m.kind()}</td>
					<td>{matching?.kind}</td>
				</tr>
				<tr>
					<td>{m.notes()}</td>
					<td>{matching?.notes}</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
