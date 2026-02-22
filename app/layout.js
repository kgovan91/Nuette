import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Dreamwell — Your 24/7 Baby Sleep Coach",
  description: "Meet Luna \u2014 your AI sleep coach available 24/7. Science-backed sleep training and real-time support for peaceful nights.",
  openGraph: {
    title: "Dreamwell — Your 24/7 Baby Sleep Coach",
    description: "Meet Luna \u2014 your AI sleep coach available 24/7. Science-backed sleep training and real-time support for peaceful nights.",
    url: "https://dreamwell.live",
    siteName: "Dreamwell",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dreamwell — Your 24/7 Baby Sleep Coach",
    description: "Meet Luna \u2014 your AI baby sleep coach. Available 24/7.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
