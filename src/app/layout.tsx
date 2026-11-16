import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SITE_NAME } from "@/utils/structuredData";
import { getRequestLanguage } from "@/utils/languages";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  authors: [{ name: `${SITE_NAME} Editorial Team` }],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The language of the page's interface: the visitor's choice on the main
  // site, the country's language on a country site.
  const { uiLanguage } = await getRequestLanguage();
  return (
    <html lang={uiLanguage}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
