import type { ConfigTool } from "$lib/types/Tool";
import { ObjectId } from "mongodb";
import { scrapeUrl } from "$lib/server/websearch/scrape/scrape";
import { stringifyMarkdownElementTree } from "$lib/server/websearch/markdown/utils/stringify";

const WIKIPEDIA_API_URL = "https://en.wikipedia.org/w/api.php";

const wikipedia: ConfigTool = {
	_id: new ObjectId("00000000000000000000000F"),
	type: "config",
	description: "Search Wikipedia and get the first result",
	color: "green",
	icon: "wikis",
	displayName: "Wikipedia Search",
	name: "wikipedia",
	endpoint: null,
	inputs: [
		{
			name: "query",
			type: "str",
			description: "Search term for Wikipedia, has to be english only",
			paramType: "required",
		},
	],
	outputComponent: null,
	outputComponentIdx: null,
	showOutput: false,
	async *call({ query }) {
		try {
			if (typeof query !== "string") {
				throw new Error("Query must be a string");
			}

			const searchParams = new URLSearchParams({
				action: "query",
				list: "search",
				srsearch: query,
				format: "json",
			});

			const response = await fetch(`${WIKIPEDIA_API_URL}?${searchParams}`);
			if (!response.ok) {
				throw new Error("Failed to fetch from Wikipedia API");
			}

			const data = await response.json();
			const pageids = data.query.search.slice(0, 1).map((result: { pageid: any }) => result.pageid);

			let results = "";
			for (const pageid of pageids) {
				const urlStr = `https://en.wikipedia.org/?action=raw&curid=${pageid}`;
				const { title, markdownTree } = await scrapeUrl(urlStr, Infinity);
				results = stringifyMarkdownElementTree(markdownTree);
			}

			return {
				outputs: [{ results }],
				display: true,
			};
		} catch (error) {
			throw new Error("Failed to search Wikipedia", { cause: error });
		}
	},
};

export default wikipedia;
