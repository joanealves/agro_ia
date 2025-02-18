import "@/app/globals.css"  
import { AuthProvider } from "@/app/providers/AuthProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark"> {/* Adicionado className="dark" para forçar tema escuro */}
      <body className="bg-background">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
