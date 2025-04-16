import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";
import { ReduxProvider } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <title>The Fetch Adoption Center</title>
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
        />
      </head>
      <body>
        <ReduxProvider>
          {children}
          <Footer />
        </ReduxProvider>
      </body>
    </html>
  );
}
