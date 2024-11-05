import type { ConfigTool } from "$lib/types/Tool";
import { ObjectId } from "mongodb";
import { runWebSearch } from "../../websearch/runWebSearch";

const websearch: ConfigTool = {
	_id: new ObjectId("00000000000000000000000A"),
	type: "config",
	description:
		"Search the web for answers to the user's query, useful for general questions and researches.",
	color: "blue",
	icon: "wikis",
	displayName: "Web Search",
	name: "websearch",
	endpoint: null,
	inputs: [
		{
			name: "query",
			type: "str",
			description:
				"A focused search query targeting a specific aspect of the user's question at once.",
			paramType: "required",
		},
	],
	outputComponent: null,
	outputComponentIdx: null,
	showOutput: false,
	async *call({ query }, { conv, assistant, messages }) {
		const webSearchToolResults = yield* runWebSearch(conv, messages, assistant?.rag, String(query));
		const chunks = webSearchToolResults?.contextSources
			.map(({ context }) => context)
			.join("\n------------\n");

		return {
			outputs: [{ websearch: chunks }],
			display: false,
		};
	},
};

export default websearch;
