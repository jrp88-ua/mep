<script lang="ts">
	import type { IndividualExamConfiguration } from '$lib/assignment/individualExamConfiguration';

	export let exam: IndividualExamConfiguration;
</script>

<h1>{exam.subject.name}</h1>
