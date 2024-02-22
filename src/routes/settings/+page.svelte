<script lang="ts">
	import * as m from '$paraglide/messages';
	import { languageTag, setLanguageTag } from '$paraglide/runtime';
	import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';

	let selectedLanguage = languageTag();
</script>

<h1 class="text-xl">{m.settings_language()}</h1>
<RadioGroup>
	<a href="/settings" hreflang="es-ES">
		<RadioItem bind:group={selectedLanguage} name="appLanguage" value={'es-ES'}>Español</RadioItem>
	</a>
	<a href="/settings" hreflang="en">
		<RadioItem bind:group={selectedLanguage} name="appLanguage" value={'en'}>English</RadioItem>
	</a>
</RadioGroup>
