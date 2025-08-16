import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/app/ClientLayout";

export const metadata: Metadata = {
  title: "Elbe DD",
  description: "A web application for monitoring the Elbe river around Dresden",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
