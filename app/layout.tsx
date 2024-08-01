import '@/app/ui/global.css'
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Next.js Dashboard',
  description: "chiu chan, Next.js Dashboard, built with App Router",
  metadataBase: new URL("https://nextjs-dashboard.vercel.app"),
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} `}>{children}</body>
    </html>
  );
}
