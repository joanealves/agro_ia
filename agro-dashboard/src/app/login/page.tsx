// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
// import Image from 'next/image'
// import { Button } from '../../components/ui/button'
// import { Input } from '../../components/ui/input'
// import { Label } from '../../components/ui/label'
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
// import { useAuth } from '../providers/AuthProvider'
// import Cookies from 'js-cookie'

// export default function LoginPage() {
//   const router = useRouter()
//   const { login, user } = useAuth()
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   // Verificar se o usuário já está autenticado
//   useEffect(() => {
//     if (user) {
//       // Se o usuário já estiver autenticado, redirecione
//       if (user.role === 'admin') {
//         router.replace('/admin')
//       } else {
//         router.replace('/dashboard')
//       }
//     }
//   }, [user, router])

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')

//     try {
//       await login(email, password)
//       // Redirecionamento é tratado dentro da função login
//     } catch (err: any) {
//       console.error('Login error:', err)
//       setError(
//         err.response?.data?.detail ||
//         'Falha no login. Verifique suas credenciais e tente novamente.'
//       )
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (

//     <div className="min-h-screen bg-background flex">
//       {/* Lado esquerdo - Área de login */}
//       <div className="w-full md:w-1/2 flex items-center justify-center p-8">
//         <Card className="w-full max-w-md border-none bg-card/50 backdrop-blur-sm">
//           <CardHeader className="space-y-1">
//             <div className="flex items-center justify-center mb-4">
//               <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
//                 <svg
//                   className="w-8 h-8 text-white"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
//                   />
//                 </svg>
//               </div>
//             </div>
//             <CardTitle className="text-2xl text-center font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
//               AgroSmart
//             </CardTitle>
//             <CardDescription className="text-center text-muted-foreground">
//               Entre com suas credenciais para acessar o sistema
//             </CardDescription>
//           </CardHeader>
//           <form onSubmit={handleSubmit}>
//             <CardContent className="space-y-4">
//               {error && (
//                 <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-md">
//                   {error}
//                 </div>
//               )}
//               <div className="space-y-2">
//                 <Label htmlFor="email" className="text-foreground">Email</Label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     id="email"
//                     type="email"
//                     placeholder="nome@empresa.com"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="pl-10 bg-background border-border"
//                     required
//                   />
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="password" className="text-foreground">Senha</Label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     id="password"
//                     type={showPassword ? "text" : "password"}
//                     placeholder="••••••••"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="pl-10 pr-10 bg-background border-border"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-3"
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-4 w-4 text-muted-foreground" />
//                     ) : (
//                       <Eye className="h-4 w-4 text-muted-foreground" />
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </CardContent>
//             <CardFooter className="flex flex-col gap-4">
//               <Button
//                 type="submit"
//                 className="w-full bg-primary hover:bg-primary/90"
//                 disabled={loading}
//               >
//                 {loading ? "Entrando..." : "Entrar"}
//               </Button>
//               <div className="text-sm text-center text-muted-foreground">
//                 Não tem uma conta?{" "}
//                 <a
//                   href="/register"
//                   className="text-primary hover:text-primary/80 hover:underline"
//                 >
//                   Cadastre-se
//                 </a>
//               </div>
//             </CardFooter>
//           </form>
//         </Card>
//       </div>

//       {/* Lado direito - Imagem de fundo e overlay */}
//       <div className="hidden md:block w-1/2 relative bg-black">
//         <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent z-10" />
//         <div className="absolute inset-0">
//           <Image
//             src="/images/login-background.jpg"
//             alt="Login"
//             fill
//             className="object-cover opacity-50"
//             priority
//             onError={() => {
//               // Fallback para placeholder se a imagem não carregar
//               const imgElement = document.querySelector('.login-bg') as HTMLImageElement;
//               if (imgElement) {
//                 imgElement.src = "/api/placeholder/1200/800";
//               }
//             }}
//           />
//         </div>
//         <div className="relative z-20 h-full flex items-center justify-center p-12">
//           <div className="text-center">
//             <h2 className="text-3xl font-bold text-white mb-4">
//               Bem-vindo ao Futuro do Agronegócio
//             </h2>
//             <p className="text-lg text-gray-200 max-w-md">
//               Gerencie sua fazenda de forma inteligente e eficiente com nossa plataforma moderna.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }



"use client";

// =============================================================================
// LOGIN PAGE - Página de autenticação
// =============================================================================

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Leaf, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { useAuth } from "../../app/providers/AuthProvider";

// =============================================================================
// LOGIN PAGE COMPONENT
// =============================================================================

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      router.push(callbackUrl);
    } catch (err) {
      console.error("Erro no login:", err);
      setError("Email ou senha inválidos. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Leaf className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">AgroIA Dashboard</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Não tem uma conta?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Registre-se
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}