import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"]
});
export const metadata = {
  title: "StaffingX — Lead Management CRM",
  description: "Discover, qualify, and manage leads sourced from LinkedIn job postings."
};
export default function RootLayout({
  children
}) {
  return <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>;
}
