import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Coluna da imagem */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Image
          src="/assets/agro-tech-image.jpg"
          alt="AgroTech"
          width={800}
          height={450}
          className="rounded-lg object-cover w-full h-full"
        />
      </div>

      {/* Coluna do texto e botão de login */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-secondary">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4">Bem-vindo ao AgroTech</h1>
          <p className="text-lg mb-8">
            Soluções inteligentes para o agronegócio. Gerencie sua fazenda de
            forma eficiente, aumente a produtividade e tome decisões baseadas em
            dados.
          </p>
          <Link href="/login">
            <button className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded hover:bg-primary/90 transition-colors">
              Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}