import { MetricsServer } from "$lib/server/metrics";
import type { WebSearchScrapedSource, WebSearchUsedSource } from "$lib/types/WebSearch";
import type { EmbeddingBackendModel } from "../../embeddingModels";
import { getSentenceSimilarity } from "../../sentenceSimilarity";
import { MarkdownElementType, type MarkdownElement } from "../markdown/types";
import { stringifyMarkdownElement } from "../markdown/utils/stringify";
import { getCombinedSentenceSimilarity } from "./combine";
import { flattenTree } from "./tree";

const MIN_CHARS = 8_000;
const SOFT_MAX_CHARS = 128_000;

export async function findContextSources(
	sources: WebSearchScrapedSource[],
	prompt: string,
	embeddingModel: EmbeddingBackendModel
) {
	const startTime = Date.now();

	const sourcesMarkdownElems = sources.map((source) => flattenTree(source.page.markdownTree));
	const markdownElems = sourcesMarkdownElems.flat();

	// When using CPU embedding (transformersjs), join sentences together to the max character limit
	// to reduce inference time
	const embeddingFunc =
		embeddingModel.endpoints[0].type === "transformersjs"
			? getCombinedSentenceSimilarity
			: getSentenceSimilarity;

	const embeddings = await embeddingFunc(
		embeddingModel,
		prompt,
		markdownElems
			.map(stringifyMarkdownElement)
			// Safety in case the stringified markdown elements are too long
			// but chunking should have happened earlier
			.map((elem) => elem.slice(0, embeddingModel.chunkCharLength))
	);

	const topEmbeddings = embeddings
		.sort((a, b) => a.distance - b.distance)
		.filter((embedding) => markdownElems[embedding.idx].type !== MarkdownElementType.Header);

	let totalChars = 0;
	const selectedMarkdownElems = new Set<MarkdownElement>();
	const selectedEmbeddings: number[][] = [];
	for (const embedding of topEmbeddings) {
		const elem = markdownElems[embedding.idx];

		// Add element
		if (!selectedMarkdownElems.has(elem)) {
			selectedMarkdownElems.add(elem);
			selectedEmbeddings.push(embedding.embedding);
			totalChars += elem.content.length;
		}

		// Add element's parent (header)
		if (elem.parent && !selectedMarkdownElems.has(elem.parent)) {
			selectedMarkdownElems.add(elem.parent);
			totalChars += elem.parent.content.length;
		}

		if (totalChars > SOFT_MAX_CHARS) break;
		if (totalChars > MIN_CHARS && embedding.distance > 0.25) break;
	}

	let contextSources = sourcesMarkdownElems
		.map<WebSearchUsedSource>((elems, idx) => {
			const sourceSelectedElems = elems.filter((elem) => selectedMarkdownElems.has(elem));
			const context = sourceSelectedElems.map(stringifyMarkdownElement).join("\n");
			const source = sources[idx];
			return { ...source, context };
		})
		.filter((contextSource) => contextSource.context.length > 0);

	// check for duplicate sources
	const seenSources = new Set<string>();
	contextSources = contextSources.filter((contextSource) => {
		const seen = seenSources.has(contextSource.link);
		seenSources.add(contextSource.link);
		return !seen;
	});

	MetricsServer.getMetrics().webSearch.embeddingDuration.observe(Date.now() - startTime);

	return contextSources;
}
