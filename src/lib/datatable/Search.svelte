<script lang="ts">
	import type { DataHandler } from '@vincjo/datatables';
	import * as m from '$paraglide/messages';

	export let handler: DataHandler;
	let value: string;
</script>

<input
	class="input sm:w-64 w-36"
	type="search"
	placeholder={m.datatable_search_entry()}
	bind:value
	on:input={() => handler.search(value)}
/>
