import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/app/ClientLayout";
import { VERSION } from "@/lib/version";
import { Stack, Typography } from "@mui/material";

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
    <html
      lang="en"
      style={{ height: "100%", overflow: "hidden", width: "100%" }}
    >
      <body style={{ height: "100%", overflowX: "hidden", width: "100%" }}>
        <ClientLayout>{children}</ClientLayout>
        <footer>
          <Stack p={2} alignItems="flex-end">
            <Typography variant="caption" color="text.disabled">
              {VERSION}
            </Typography>
          </Stack>
        </footer>
      </body>
    </html>
  );
}
