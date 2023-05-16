import './globals.css'
import { Poppins } from 'next/font/google'
import {Header} from "@/components/Header";

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

export const metadata = {
  title: 'Hec Sanchez - Product Engineer • JavaScript Developer',
  description: 'Hec SancheZ is a Product Engineer with 15 years of experience building software with JavaScript',
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
      </body>
    </html>
  )
}
