import { models } from "$lib/server/models";
export const load = async () => {
	return {
		models: models.map((model) => ({
			id: model.id,
			name: model.name,
			displayName: model.displayName,
			websiteUrl: model.websiteUrl,
			logoUrl: model.logoUrl,
			description: model.description,
			promptExamples: model.promptExamples,
			preprompt: model.preprompt,
			multimodal: model.multimodal,
		})),
	};
};
