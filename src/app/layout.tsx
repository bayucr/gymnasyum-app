import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Gymnasyum - Smart Reminder & Follow-up App",
  description: "Aplikasi Admin Operations & Follow-up Pelanggan Gym",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
