import Image from "next/image";
import Link from "next/link";
import agroTechImage from "@/assets/agro-tech-image.jpg";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-6xl">
        {/* Imagem */}
        <div className="flex items-center justify-center p-8">
          <Image
            src={agroTechImage}
            alt="AgroTech"
            width={800}
            height={450}
            className="rounded-lg object-cover w-full h-auto shadow-xl"
          />
        </div>

        {/* Texto e botão */}
        <div className="flex flex-col items-center justify-center p-8 bg-secondary rounded-lg shadow-lg">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold mb-4">Bem-vindo ao AgroTech</h1>
            <p className="text-lg mb-8">
              Soluções inteligentes para o agronegócio. Gerencie sua fazenda de
              forma eficiente, aumente a produtividade e tome decisões baseadas em dados.
            </p>
            <Link href="/login">
              <Button className="bg-primary hover:bg-primary/80 text-primary-foreground px-6 py-3 text-lg">
                Acessar Plataforma
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
