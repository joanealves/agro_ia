// "use client";

// // =============================================================================
// // THEME PROVIDER - Gerenciador de tema (claro/escuro)
// // =============================================================================

// import { ThemeProvider as NextThemesProvider } from "next-themes";
// import { type ThemeProviderProps } from "next-themes";

// export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
//   return (
//     <NextThemesProvider
//       attribute="class"
//       defaultTheme="dark"
//       enableSystem
//       disableTransitionOnChange={false}
//       {...props}
//     >
//       {children}
//     </NextThemesProvider>
//   );
// }








"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}