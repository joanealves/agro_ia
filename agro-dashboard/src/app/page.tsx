import Image from "next/image";
import Link from "next/link";
import agroTechImage from "@/assets/agro-tech-image.jpg";
import { Button } from "../components/ui/button";

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Imagem de fundo */}
      <div className="absolute inset-0 z-0">
        <Image
          src={agroTechImage}
          alt="AgroTech"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Board com texto e botao */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="bg-black/50 p-8 rounded-2xl shadow-2xl max-w-md text-center backdrop-blur-sm">
          <h1 className="text-4xl font-bold mb-4 text-white">Bem-vindo ao AgroTech</h1>
          <p className="text-lg mb-8 text-white">
            Soluções inteligentes para o agronegócio. Gerencie sua fazenda de
            forma eficiente, aumente a produtividade e tome decisões baseadas em dados.
          </p>
          <Link href="/login">
            <Button className="bg-primary hover:bg-primary/80 text-primary-foreground px-6 py-3 text-lg rounded-lg shadow-md">
              Acessar Plataforma
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
