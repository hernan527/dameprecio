import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Search, LogIn, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const Header = () => {
  const navigate = useNavigate();
  


    
   

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50 transition-all">
      <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <a href="/" className="flex items-center gap-2 group">
          <img 
            src="/assets/imagenes/logos/logo-header-tr.png" 
            alt="Mejor Plan - Consultores en Salud" 
            className="h-12 hidden md:block transition-transform group-hover:scale-105 dark:brightness-110"
          />
          <img 
            src="/assets/imagenes/logos/logo-header-tr-mobile.png" 
            alt="Mejor Plan - Consultores en Salud" 
            className="h-10 md:hidden dark:brightness-110"
          />
        </a>

        {/* ACCIONES */}
        <div className="flex items-center gap-3">
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
      

          {/* CTA PRINCIPAL */}
         
        </div>
      </div>
    </header>
  );
};

export default Header;
