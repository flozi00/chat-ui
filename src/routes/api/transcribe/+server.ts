import type { RequestHandler } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const audioBlob = formData.get("audio_blob") as File | null;

		if (!audioBlob) {
			throw error(400, "Audio blob is required");
		}

		const newApiUrl = "http://inference-server:8000/intern/api/asr/transcribe";
		const apiFormData = new FormData();
		apiFormData.append("file", audioBlob, audioBlob.name || "recording.wav"); // Provide a default filename if not available
		apiFormData.append("tiny", "false"); // As per the curl example

		const response = await fetch(newApiUrl, {
			method: "POST",
			body: apiFormData,
			headers: {
				// 'Content-Type': 'multipart/form-data' is automatically set by fetch when using FormData
				accept: "application/json",
			},
		});

		if (!response.ok) {
			const errorBody = await response.text();
			console.error("API Error Response:", errorBody);
			throw error(
				response.status,
				`API request failed with status ${response.status}: ${errorBody}`
			);
		}

		const result = await response.json();

		let transcribedText = "";
		// Assuming the new API returns a JSON object with a 'transcription' field
		// or a similar structure. You might need to adjust this based on the actual API response.
		if (result && typeof result.transcription === "string") {
			transcribedText = result.transcription.trim();
		} else if (result && typeof result.text === "string") {
			// Common alternative
			transcribedText = result.text.trim();
		} else if (
			result &&
			Array.isArray(result) &&
			result.length > 0 &&
			typeof result[0].text === "string"
		) {
			// Handling array of objects with text
			transcribedText = result
				.map((item: { text: string }) => item.text)
				.join(" ")
				.trim();
		} else {
			console.warn("Unexpected transcription result format from new API:", result);
			// Fallback or specific handling if the structure is different
			// For example, if it's just a string directly:
			// if (typeof result === 'string') transcribedText = result.trim();
			// else throw error(500, "Unexpected transcription result format from new API");
			// For now, let's assume it might be empty if no specific field is found
			transcribedText = "";
			if (Object.keys(result).length === 0 && result.constructor === Object) {
				// Empty JSON object
				console.log("New API returned no transcription data.");
			} else if (typeof result === "string" && result.trim() === "") {
				// Empty string response
				console.log("New API returned an empty string.");
			} else {
				console.warn("Unexpected transcription result format from new API:", result);
				throw error(500, "Unexpected transcription result format from new API");
			}
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
