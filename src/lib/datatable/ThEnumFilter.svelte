<script lang="ts">
	import type { DataHandler } from '@vincjo/datatables';
	import * as m from '$paraglide/messages';

	export let handler: DataHandler;
	export let filterBy: string;
	export let values: readonly string[];
	export let valueTranslator: (value: string) => string = (value) => value;
	let value: string | undefined;
</script>

<th>
	<select
		class="select input text-sm w-full"
		bind:value
		placeholder={m.datatable_filter()}
		on:change={() => {
			if (filterBy) handler.filter(value || '', filterBy);
		}}
	>
		<option value={undefined}>{m.datatable_enum_filter_none()}</option>
		<optgroup label={m.datatable_enum_filter_separator()}>
			{#each values as possibleValue}
				<option value={possibleValue}>{valueTranslator(possibleValue)}</option>
			{/each}
		</optgroup>
	</select>
</th>
