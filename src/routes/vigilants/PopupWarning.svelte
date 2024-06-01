<script lang="ts">
	import * as m from '$paraglide/messages';

	import type { Vigilant } from '$lib/models/vigilant';
	import { vigilantRoleValuesTranslate } from '$lib/services/vigilant';

	export let matching: undefined | Vigilant;
	export let name: boolean;
</script>

<div
	class="card p-4 variant-filled-surface"
	data-popup={name ? 'name-warning' : 'role-warning'}
	style={matching === undefined ? 'display: none;' : ''}
>
	<p>
		<strong>
			{#if name}
				{m.vigilant_name_already_exists({
					name: matching?.name ?? '',
					surenames: matching?.surenames ?? ''
				})}
			{:else}
				{m.vigilant_role_already_exists({
					court: matching?.mainCourt ?? 0,
					role: vigilantRoleValuesTranslate(matching?.role ?? 'MEMBER')
				})}
			{/if}
		</strong>
	</p>
	<div>
		<table class="table">
			<tbody>
				<tr>
					<td>{m.name()}</td>
					<td>{matching?.name}</td>
				</tr>
				<tr>
					<td>{m.surenames()}</td>
					<td>{matching?.surenames}</td>
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
				<tr>
					<td>{m.court()}</td>
					<td>{matching?.mainCourt}</td>
				</tr>
				<tr>
					<td>{m.role()}</td>
					<td>{vigilantRoleValuesTranslate(matching?.role ?? 'MEMBER')}</td>
				</tr>
				<tr>
					<td>{m.subjects()}</td>
					<td>
						<ul>
							{#each matching?.getSpecialties() ?? [] as subject}
								<li>{subject.name}</li>
							{/each}
						</ul>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
