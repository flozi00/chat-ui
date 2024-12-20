import { defaultEmbeddingModel, embeddingModels } from "$lib/server/embeddingModels";

import type { Conversation } from "$lib/types/Conversation";
import type { Message } from "$lib/types/Message";
import type { WebSearch, WebSearchScrapedSource } from "$lib/types/WebSearch";
import type { Assistant } from "$lib/types/Assistant";
import type { MessageWebSearchUpdate } from "$lib/types/MessageUpdate";

import { search } from "./search/search";
import { scrape } from "./scrape/scrape";
import { findContextSources } from "./embed/embed";
import { removeParents } from "./markdown/tree";
import {
	makeErrorUpdate,
	makeFinalAnswerUpdate,
	makeGeneralUpdate,
	makeSourcesUpdate,
} from "./update";
import { mergeAsyncGenerators } from "$lib/utils/mergeAsyncGenerators";
import { MetricsServer } from "../metrics";
import { logger } from "$lib/server/logger";
import { env } from "$env/dynamic/private";

const num_searches = env.NUM_SEARCHES ? parseInt(env.NUM_SEARCHES, 10) + 1 : 1;
const MAX_N_PAGES_TO_SCRAPE = 5 * num_searches;
const MAX_N_PAGES_TO_EMBED = 1024 as const;

export async function* runWebSearch(
	conv: Conversation,
	messages: Message[],
	ragSettings?: Assistant["rag"],
	query?: string
): AsyncGenerator<MessageWebSearchUpdate, WebSearch, undefined> {
	const prompt = messages[messages.length - 1].content;
	const createdAt = new Date();
	const updatedAt = new Date();
	const max_pages = MAX_N_PAGES_TO_SCRAPE + (ragSettings?.allowedLinks?.length ?? 0) * num_searches;

	MetricsServer.getMetrics().webSearch.requestCount.inc();

	try {
		const embeddingModel =
			embeddingModels.find((m) => m.id === conv.embeddingModel) ?? defaultEmbeddingModel;
		if (!embeddingModel) {
			throw Error(`Embedding model ${conv.embeddingModel} not available anymore`);
		}

		// Search the web
		const { searchQuery, pages } = yield* search(messages, ragSettings, query);
		if (pages.length === 0) throw Error("No results found for this search query");

		// Scrape pages
		yield makeGeneralUpdate({ message: "Browsing search results" });

		const allScrapedPages = yield* mergeAsyncGenerators(
			pages.slice(0, max_pages).map(scrape(embeddingModel.chunkCharLength))
		);
		const scrapedPages = allScrapedPages
			.filter((p): p is WebSearchScrapedSource => Boolean(p))
			.filter((p) => p.page.markdownTree.children.length > 0)
			.slice(0, MAX_N_PAGES_TO_EMBED);

		if (!scrapedPages.length) {
			throw Error(`No text found in the first ${max_pages} results`);
		}

		// Chunk the text of each of the elements and find the most similar chunks to the prompt
		yield makeGeneralUpdate({ message: "Extracting relevant information" });
		const contextSources = await findContextSources(scrapedPages, prompt, embeddingModel).then(
			(ctxSources) =>
				ctxSources.map((source) => ({
					...source,
					page: { ...source.page, markdownTree: removeParents(source.page.markdownTree) },
				}))
		);
		yield makeSourcesUpdate(contextSources);

		const webSearch: WebSearch = {
			prompt,
			searchQuery,
			results: scrapedPages.map(({ page, ...source }) => ({
				...source,
				page: { ...page, markdownTree: removeParents(page.markdownTree) },
			})),
			contextSources,
			createdAt,
			updatedAt,
		};
		yield makeFinalAnswerUpdate();
		return webSearch;
	} catch (searchError) {
		const message = searchError instanceof Error ? searchError.message : String(searchError);
		logger.error(message);
		yield makeErrorUpdate({ message: "An error occurred", args: [message] });

		const webSearch: WebSearch = {
			prompt,
			searchQuery: "",
			results: [],
			contextSources: [],
			createdAt,
			updatedAt,
		};
		yield makeFinalAnswerUpdate();
		return webSearch;
	}
}
