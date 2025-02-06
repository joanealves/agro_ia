import "./globals.css"; // Caminho correto dentro do App Router
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        <Sidebar />
        <main>{children}</main>
      </body>
    </html>
  );
}
