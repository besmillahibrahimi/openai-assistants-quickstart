import { openai } from "@/app/openai";
import { writeFileSync } from "node:fs";
export const runtime = "nodejs";

// Create a new assistant
export async function GET() {
	// Generate an audio response to the given prompt

	const response = await openai.chat.completions.create({
		model: "gpt-4o-audio-preview",
		modalities: ["text", "audio"],
		audio: { voice: "alloy", format: "wav" },
		messages: [
			{
				role: "user",
				content: "Is a golden retriever a good family dog?",
			},
		],
	});

	// Inspect returned data
	console.log(response.choices[0]);

	// Write audio data to a file
	writeFileSync(
		"dog.wav",
		Buffer.from(response.choices[0].message.audio.data, "base64"),
		{ encoding: "utf-8" },
	);

	return Response.json({ status: "OK" });
}
