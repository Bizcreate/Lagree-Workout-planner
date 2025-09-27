import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Lagree Sequencing Planner",
  description: "Plan Lagree class blocks and exercises quickly.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}