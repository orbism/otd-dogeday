import type { Metadata } from "next";
import { Nunito, Chango } from "next/font/google";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.scss";

export const metadata: Metadata = {
	title: "Doge Day 2025",
	description: "Doge Day 2025 - Chiba, Japan",
	metadataBase: new URL("https://dogeday.ownthedoge.com"),
	openGraph: {
		type: "website",
		url: "https://dogeday.ownthedoge.com/",
		title: "Doge Day 2025",
		description: "Doge Day 2025 - Chiba, Japan",
		images: [
			{ url: "/og-image.png" }
		]
	},
	twitter: {
		card: "summary_large_image",
		site: "@ownthedoge",
		title: "Doge Day 2025",
		description: "Doge Day 2025 - Chiba, Japan",
		images: ["/og-image.png"],
	},
};

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const chango = Chango({ weight: "400", subsets: ["latin"], variable: "--font-chango" });

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${nunito.variable} ${chango.variable}`}>
			<body>{children}</body>
		</html>
	);
}
