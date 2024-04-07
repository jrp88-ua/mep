<script lang="ts">
	import { Drawer, getDrawerStore } from '@skeletonlabs/skeleton';

	const drawerStore = getDrawerStore();
</script>

<Drawer>
	{#if $drawerStore.id === 'edit-examinee'}
		examinadi {JSON.stringify($drawerStore.meta)}
	{:else if $drawerStore.id === 'edit-academic-centre'}
		ac {JSON.stringify($drawerStore.meta)}
	{:else if $drawerStore.id === 'edit-subject'}
		ac {JSON.stringify($drawerStore.meta)}
	{:else}
		<div class="w-full h-full flex justify-center items-center">
			<div class="text-center space-y-2">
				<p>Invalid <code class="code">$drawerStore.id</code> provided.</p>
			</div>
		</div>
	{/if}
</Drawer>
