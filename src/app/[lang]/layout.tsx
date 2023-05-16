import './globals.css'
import { Poppins } from 'next/font/google'
import Script from "next/script";

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

export const metadata = {
  title: 'Hec Sanchez - Product Engineer • JavaScript Developer',
  description: 'Hec Sanchez is a Product Engineer with 15 years of experience building software with JavaScript',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        {children}
          <div className="max-w-[1400px] m-auto py-10 flex justify-center">
              Hec Sanchez © 2018 - 2023 • All rights reserved
          </div>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=G-JNC5CX70DJ`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
            window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
    
              gtag('config', 'G-JNC5CX70DJ');
            `}
            </Script>
      </body>
    </html>
  )
}
