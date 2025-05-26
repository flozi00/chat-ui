import { Client, handle_file } from "@gradio/client";
import type { RequestHandler } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const audioBlob = formData.get("audio_blob") as File | null;

		if (!audioBlob) {
			throw error(400, "Audio blob is required");
		}

		// The Gradio client URL should ideally be configurable
		const gradioUrl = "http://inference-server:8000/";
		const gradioEndpoint = "/process_audio_file";

		const app = await Client.connect(gradioUrl);
		const result = await app.predict(gradioEndpoint, [handle_file(audioBlob)]);

		let transcribedText = "";
		if (result && Array.isArray(result.data)) {
			if (result.data.length === 0) {
				transcribedText = "";
				console.log("Gradio API returned no transcription data via backend.");
			} else {
				// always a JSON string: parse it first
				let items: unknown;
				try {
					items = JSON.parse(result.data[0] as string);
				} catch {
					// fallback to raw text if parsing fails
					transcribedText = (result.data[0] as string).trim();
					items = null;
				}

				if (Array.isArray(items)) {
					// combine all `text` fields
					transcribedText = (items as { text: string }[])
						.map((it) => it.text)
						.join(" ")
						.trim();
				} else if (!transcribedText) {
					console.warn("Unexpected transcription result format:", result);
					throw error(500, "Unexpected transcription result format from Gradio");
				}
			}
		} else {
			console.warn("Unexpected transcription result format from Gradio API via backend:", result);
			throw error(500, "Unexpected transcription result format from Gradio");
		}

		// Placeholder for filtering logic
		// Example: transcribedText = transcribedText.replace(/ unwanted_word /gi, " **** ");

		return new Response(JSON.stringify({ transcription: transcribedText }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
	} catch (err: unknown) {
		console.error("Error during server-side transcription:", err);
		if (typeof err === "object" && err !== null && "status" in err && "body" in err) {
			// If it's a SvelteKit error (e.g., from throw error()), re-throw it
			throw err;
		}
		// For other errors, return a generic 500
		const message =
			typeof err === "object" && err !== null && "message" in err
				? String((err as { message?: unknown }).message)
				: "Failed to transcribe audio due to a server error";
		throw error(500, message);
	}
};
