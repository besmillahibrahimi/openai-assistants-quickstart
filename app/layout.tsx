import { Inter } from "next/font/google";
import "./globals.css";
import Warnings from "./components/warnings";
import { assistantId } from "./assistant-config";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "Assistants API Quickstart",
	description: "A quickstart template using the Assistants API with OpenAI",
	icons: {
		icon: "/openai.svg",
	},
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className={`w-full bg-blue-500 ${inter.className}`}>
				{assistantId ? children : <Warnings />}
			</body>
		</html>
	);
}
