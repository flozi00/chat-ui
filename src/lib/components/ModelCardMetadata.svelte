<script lang="ts">
	import CarbonEarth from "~icons/carbon/earth";
	import CarbonArrowUpRight from "~icons/carbon/arrow-up-right";
	import BIMeta from "~icons/bi/meta";
	import CarbonCode from "~icons/carbon/code";
	import type { Model } from "$lib/types/Model";

	interface Props {
		model: Pick<
			Model,
			"name" | "datasetName" | "websiteUrl" | "modelUrl" | "datasetUrl" | "hasInferenceAPI"
		>;
		variant?: "light" | "dark";
	}

	let { model, variant = "light" }: Props = $props();
</script>

<div
	class="flex items-center gap-5 rounded-xl bg-gray-100 px-3 py-2 text-xs sm:text-sm
	{variant === 'dark'
		? 'text-gray-600 dark:bg-gray-800 dark:text-gray-300'
		: 'text-gray-800 dark:bg-gray-100 dark:text-gray-600'}"
>
</div>
