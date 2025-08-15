import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
	title: "Doge Day 2025",
	description: "Doge Day 2025 - Chiba, Japan",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
