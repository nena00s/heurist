//layout.js



import localFont from "next/font/local";
import "./globals.css";

// Importa a fonte GeistSans como uma fonte local com pesos variáveis
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Metadados para o aplicativo
export const metadata = {
  title: "Heurist",
  description: "The AI Multiverse Decisions Make Platform.",
};

// Layout raiz que envolve todo o aplicativo
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} dark`}>
        {children}
      </body>
    </html>
  );
}