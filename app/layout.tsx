import type { Metadata } from "next";
import { Nunito, Chango } from "next/font/google";
import "./globals.scss";

export const metadata: Metadata = {
	title: "Doge Day 2025",
	description: "Doge Day 2025 - Chiba, Japan",
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
