<script lang="ts">
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';

	const bellPopup: PopupSettings = {
		event: 'click',
		target: 'bellPopup',
		placement: 'top'
	};
</script>

<div class="min-h-5 max-h-15 bg-surface-600 flex justify-between">
	<div>IZ</div>
	<div class="mr-4">
		<div class="relative inline-block" use:popup={bellPopup}>
			<span class="badge-icon variant-filled-warning absolute -right-1 w-3 h-3">2</span>
			<i class="fa-solid fa-bell" />
		</div>
	</div>
</div>

<div class="card" data-popup="bellPopup">NOTIS :3</div>
