<script lang="ts">
	import { page } from '$app/stores';

	$: title = $page.data.pageTitle();
</script>

<h1 class="text-3xl">
	{@html title}
</h1>
