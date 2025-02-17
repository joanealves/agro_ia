import Image from "next/image";
import Link from "next/link";

export default function Page() {  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Bem-vindo ao AgroTech</h1>
        <p className="text-lg mb-8">Soluções inteligentes para o agronegócio</p>
        <Image
          src="/agro-tech-image.jpg" 
          alt="AgroTech"
          width={800}
          height={450}
          className="rounded-lg mb-8"
        />
        <Link href="/login">
          <button className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded">
            Login
          </button>
        </Link>
      </div>
    </div>
  );
}
