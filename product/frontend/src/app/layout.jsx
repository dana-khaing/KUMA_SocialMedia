import { Inter } from "next/font/google";
import NavBar from "./components/navBar";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "KUMA - Social Media Website",
  description: "Developed by Dana Khaing",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
