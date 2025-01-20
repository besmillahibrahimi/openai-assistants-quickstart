"use client";

import { useEffect, useRef, useState } from "react";

type State = "idle" | "initializing" | "ready" | "error";

function Page() {
	const [state, setState] = useState<State>("idle");
	const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
	const mediaStreamRef = useRef<MediaStream | null>(null);

	async function init() {
		try {
			setState("initializing");

			// Get ephemeral key
			const tokenResponse = await fetch("/api/session");
			if (!tokenResponse.ok) throw new Error("Failed to fetch session token");
			const data = await tokenResponse.json();
			const EPHEMERAL_KEY = data.client_secret.value;

			// Create a peer connection
			const pc = new RTCPeerConnection();

			// Set up to play remote audio from the model
			const audioEl = document.createElement("audio");
			audioEl.autoplay = true;
			pc.ontrack = (e) => {
				audioEl.srcObject = e.streams[0];
			};

			// Add local audio track for microphone input
			const mediaStream = await navigator.mediaDevices.getUserMedia({
				audio: true,
			});
			mediaStreamRef.current = mediaStream;
			for (const track of mediaStream.getTracks())
				pc.addTrack(track, mediaStream);

			// Set up data channel for events
			const dc = pc.createDataChannel("oai-events");
			dc.addEventListener("message", (e) => {
				console.log("Received event:", e.data);
			});

			// Start session using SDP
			const offer = await pc.createOffer();
			await pc.setLocalDescription(offer);

			const baseUrl = "https://api.openai.com/v1/realtime";
			const model = "gpt-4o-realtime-preview-2024-12-17";
			const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
				method: "POST",
				body: offer.sdp, // Fix: Correct format for OpenAI API
				headers: {
					Authorization: `Bearer ${EPHEMERAL_KEY}`,
					"Content-Type": "application/sdp", // Fix: Correct content type
				},
			});

			if (!sdpResponse.ok)
				throw new Error("Failed to fetch SDP answer from OpenAI");

			const answer: RTCSessionDescriptionInit = {
				type: "answer",
				sdp: await sdpResponse.text(),
			};
			await pc.setRemoteDescription(answer);

			peerConnectionRef.current = pc; // Store reference
			setState("ready");
		} catch (error) {
			console.error("Error initializing WebRTC session:", error);
			// close microphone
			if (mediaStreamRef.current) {
				for (const track of mediaStreamRef.current.getTracks()) track.stop();
			}
			setState("error");
		}
	}

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (peerConnectionRef.current) {
				peerConnectionRef.current.close();
				peerConnectionRef.current = null;
			}
			if (mediaStreamRef.current) {
				for (const track of mediaStreamRef.current.getTracks()) track.stop();

				mediaStreamRef.current = null;
			}
		};
	}, []);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				height: "100vh",
			}}
		>
			<button type="button" onClick={init} disabled={state === "initializing"}>
				{state === "initializing" ? "Starting..." : "Start Voice"}
			</button>
			<p>{state}</p>
		</div>
	);
}

export default Page;
