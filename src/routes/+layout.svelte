<script lang="ts">
	import '../app.postcss';
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-js-adapter-sveltekit';
</script>

<ParaglideJS {i18n}>
	<slot />
</ParaglideJS>
