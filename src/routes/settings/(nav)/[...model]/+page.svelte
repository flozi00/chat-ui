<script lang="ts">
	import { page } from "$app/state";
	import { base } from "$app/paths";

	import type { BackendModel } from "$lib/server/models";
	import { useSettingsStore } from "$lib/stores/settings";
	import CopyToClipBoardBtn from "$lib/components/CopyToClipBoardBtn.svelte";
	import TokensCounter from "$lib/components/TokensCounter.svelte";
	import CarbonArrowUpRight from "~icons/carbon/arrow-up-right";
	import CarbonLink from "~icons/carbon/link";
	import CarbonChat from "~icons/carbon/chat";
	import CarbonCode from "~icons/carbon/code";

	import { goto } from "$app/navigation";
	import { usePublicConfig } from "$lib/utils/PublicConfig.svelte";

	const publicConfig = usePublicConfig();
	const settings = useSettingsStore();

	$effect(() => {
		if ($settings.customPrompts[page.params.model] === undefined) {
			$settings.customPrompts = {
				...$settings.customPrompts,
				[page.params.model]:
					page.data.models.find((el: BackendModel) => el.id === page.params.model)?.preprompt || "",
			};
		}
	});

	let hasCustomPreprompt = $derived(
		$settings.customPrompts[page.params.model] !==
			page.data.models.find((el: BackendModel) => el.id === page.params.model)?.preprompt
	);

	let model = $derived(page.data.models.find((el: BackendModel) => el.id === page.params.model));
</script>

<div class="flex flex-col items-start">
	<div class="mb-5 flex flex-col gap-1.5">
		<h2 class="text-lg font-semibold md:text-xl">
			{page.params.model}
		</h2>

		{#if model.description}
			<p class="whitespace-pre-wrap text-gray-600">
				{model.description}
			</p>
		{/if}
	</div>

	<button
		class="my-2 flex w-fit items-center rounded-full bg-black px-3 py-1 text-base !text-white"
		name="Activate model"
		onclick={(e) => {
			e.stopPropagation();
			settings.instantSet({
				activeModel: page.params.model,
			});
			goto(`${base}/`);
		}}
	>
		<CarbonChat class="mr-1.5 text-sm" />
		New chat
	</button>

	<div class="relative flex w-full flex-col gap-2">
		<div class="flex w-full flex-row content-between">
			<h3 class="mb-1.5 text-lg font-semibold text-gray-800">System Prompt</h3>
			{#if hasCustomPreprompt}
				<button
					class="ml-auto underline decoration-gray-300 hover:decoration-gray-700"
					onclick={(e) => {
						e.stopPropagation();
						$settings.customPrompts[page.params.model] = model.preprompt;
					}}
				>
					Reset
				</button>
			{/if}
		</div>
		<textarea
			aria-label="Custom system prompt"
			rows="10"
			class="w-full resize-none rounded-md border-2 bg-gray-100 p-2"
			bind:value={$settings.customPrompts[page.params.model]}
		></textarea>
		{#if model.tokenizer && $settings.customPrompts[page.params.model]}
			<TokensCounter
				classNames="absolute bottom-2 right-2"
				prompt={$settings.customPrompts[page.params.model]}
				modelTokenizer={model.tokenizer}
				truncate={model?.parameters?.truncate}
			/>
		{/if}
	</div>
</div>
