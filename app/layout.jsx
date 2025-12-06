import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ThemeProvider from "@/components/ThemeProvider";
import NavigationProgress from "@/components/NavigationProgress";
import Footer from "@/components/Footer";

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata = {
  title: "i2i - AI Image Processing Platform",
  description: "Professional image-to-image AI processing for businesses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={plusJakartaSans.className}>
        <ThemeProvider>
          <TooltipProvider>
            <NavigationProgress />
            <div className="flex flex-col min-h-screen">
              {children}
              <Footer />
            </div>
            <Toaster 
              position="bottom-right" 
              richColors
              toastOptions={{
                className: 'toast-class',
                style: {
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                },
              }}
            />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

