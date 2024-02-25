<script lang="ts">
	import type { DataHandler } from '@vincjo/datatables';
	import * as m from '$paraglide/messages';

	export let handler: DataHandler;
	export let filterBy: string;
	let value: string;
</script>

<th>
	<input
		class="input text-sm w-full"
		type="text"
		placeholder={m.datatable_filter()}
		bind:value
		on:input={() => {
			if (filterBy) handler.filter(value, filterBy);
		}}
	/>
</th>
