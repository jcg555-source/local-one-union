import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "Local One Security Union",
  description:
    "Modern public website and member portal for Local One Security Union."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SiteShell>{children}</SiteShell>
        </AuthProvider>
      </body>
    </html>
  );
}
