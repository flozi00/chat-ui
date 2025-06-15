<script lang="ts">
	import type { Model } from "$lib/types/Model";
	import { base } from "$app/paths";
	import ModelDropdown from "./ModelDropdown.svelte";

	interface Props {
		models: Model[];
		currentModel: Model;
	}

	let { models, currentModel }: Props = $props();
</script>

<div class="border-b bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
	<div class="mx-auto flex max-w-3xl items-center px-4 py-2.5">
		<div class="flex items-center gap-1.5 font-semibold max-sm:text-smd">
			{#if currentModel.logoUrl}
				<img
					class="overflown aspect-square size-10 rounded border dark:border-gray-700"
					src={currentModel.logoUrl}
					alt=""
				/>
			{:else}
				<div class="size-10 rounded border border-transparent bg-gray-300 dark:bg-gray-800"></div>
			{/if}
			<div>
				<p>{currentModel.displayName}</p>
				{#if currentModel.description}
					<p class="text-xs text-gray-500 dark:text-gray-400">{currentModel.description}</p>
				{/if}
			</div>
		</div>
		<div class="ml-auto">
			<ModelDropdown {models} {currentModel} />
		</div>
	</div>
</div>
