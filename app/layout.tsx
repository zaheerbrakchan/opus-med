import "./globals.css";
import { Inter } from "next/font/google";
import NavBar from "@/components/ui/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Opus-Med · Healthcare AI",
  description: "AI-powered medical document analysis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#f5f9fc] text-[#2a2f3a]`}>
        <div className="min-h-screen flex flex-col">

          {/* NAVBAR */}
          <NavBar />

          {/* MAIN */}
          <main className="py-10 px-6 flex-1">
            <div className="max-w-5xl mx-auto">{children}</div>
          </main>

          {/* FOOTER */}
          <footer className="text-center py-6 text-soft text-sm">
            © {new Date().getFullYear()} Opus-Med
          </footer>

        </div>
      </body>
    </html>
  );
}
