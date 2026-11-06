import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Volleyball Tournament Manager",
  description:
    "Manage a mixed volleyball tournament: teams, courts, results, standings, and knockout progression."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
