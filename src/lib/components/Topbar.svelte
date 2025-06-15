<script lang="ts">
	import type { Model } from "$lib/types/Model";
	import { base } from "$app/paths";
	import IconGear from "~icons/bi/gear-fill";

	interface Props {
		currentModel: Model;
	}

	let { currentModel }: Props = $props();
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
		<a
			href="{base}/settings/{currentModel.id}"
			aria-label="Settings"
			class="btn ml-auto flex h-7 w-7 self-start rounded-full bg-gray-100 p-1 text-xs hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-600"
			><IconGear /></a
		>
	</div>
</div>
