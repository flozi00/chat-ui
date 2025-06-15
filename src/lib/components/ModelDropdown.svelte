<script lang="ts">
	import type { Model } from "$lib/types/Model";
	import { base } from "$app/paths";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import { useSettingsStore } from "$lib/stores/settings";
	import IconCaretDown from "~icons/bi/caret-down-fill";

	const settings = useSettingsStore();
	let { models, currentModel }: { models: Model[]; currentModel: Model } = $props();

	let showDropdown = false;

	function selectModel(model: Model) {
		const newSettings = {
			...$settings,
			activeModel: model.id,
		};
		settings.set(newSettings);
		goto(base + "/");
		showDropdown = false;
	}
</script>

<div class="relative">
	<button
		class="flex items-center gap-1.5 rounded-lg bg-gray-100 p-2 text-sm font-semibold hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
		onclick={() => (showDropdown = !showDropdown)}
	>
		<span>{currentModel.displayName}</span>
		<IconCaretDown class="text-xs" />
	</button>

	{#if showDropdown}
		<div
			class="absolute right-0 top-full z-10 mt-2 w-64 rounded-lg border bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
		>
			<ul class="py-1">
				{#each models as model}
					<li>
						<button
							class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 {currentModel.id ===
							model.id
								? 'font-semibold'
								: ''}"
							onclick={() => selectModel(model)}
						>
							{#if model.logoUrl}
								<img
									class="aspect-square size-5 rounded-sm"
									src={model.logoUrl}
									alt="{model.displayName} logo"
								/>
							{:else}
								<div class="size-5 rounded-sm bg-gray-300 dark:bg-gray-600"></div>
							{/if}
							<span>{model.displayName}</span>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
