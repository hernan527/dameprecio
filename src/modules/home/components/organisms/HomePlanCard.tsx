/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  Scale, 
  Check, 
  Building2, 
  Sparkles, 
  Bed, 
  Brain, 
  Glasses, 
  Smile, 
  Video, 
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { normalizeLogoPath } from "@/lib/supabase-helpers";



export interface ClinicData {
  imagenes: any;
  id?: number;
  nombre: string;
  nombre_abreviado?: string;
  ubicaciones?: {
    barrio?: string;
    region?: string;
    direccion?: string;
  };
}

export interface HomePlanData {
  id: string;
  name: string;
  precio_total: number;
  precio_lista: number;
  valor_aporte?: number;
  item_id: string;
  empresa: string;
  precio_final?: number;
  empresas: {
    nombre: string;
    logo_url: string;
    slogan?: string; // Lo que arreglamos antes
  };
  logo: string;
  price: number;
  originalPrice: number;
  attributes: string[];
  slogans?: string[]; // Propiedad necesaria para el Sparkles
  clinics: string[];
  clinicsData: ClinicData[];
  copago: boolean;
  modalidad?: 'P' | 'D';
  plan_prestacion?: any[];
  beneficios?: any[];

}

interface HomePlanCardProps {
  plan: HomePlanData;
  isSelected: boolean;
  onSelect: () => void;
  onWhatsApp: () => void;
  index: number;
  isLoading: boolean;
}


export const HomePlanCard = forwardRef<HTMLDivElement, any>(
  ({ plan, isSelected, isLoading, onWhatsApp, onSelect, index, ...props }, ref) => {
    const [currentTagline, setCurrentTagline] = useState(0);

    const prestacionesFiltradas = (plan.plan_prestacion || []).filter((p: any) => p.listar === true);

    const TAGLINES = useMemo(() => {
      const validSlogans = (plan.slogans || []).filter(s => s && s.trim() !== "");
      return validSlogans.length === 0 ? ["Cobertura Nacional", "Atención 24/7"] : validSlogans;
    }, [plan.slogans]);

    useEffect(() => {
      if (TAGLINES.length <= 1) return;
      const interval = setInterval(() => {
        setCurrentTagline((prev) => (prev + 1) % TAGLINES.length);
      }, 3500);
      return () => clearInterval(interval);
    }, [TAGLINES]);
// Dentro de HomePlanCard
const precioAMostrar = plan.precio_final || plan.price; // El que tiene el descuento aplicado
const precioOriginal = plan.precio_total || plan.originalPrice; // El valor base de la prepaga
    const discount = Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100);
    const formatCurrency = (value: number) =>
      new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);

    // ✅ Lógica para separar el nombre en dos líneas si tiene más de una palabra
    const renderPlanName = (name: string) => {
      const words = name.split(" ");
      if (words.length > 1) {
        return (
          <>
            <span className="block">{words[0]}</span>
            <span className="block text-primary -mt-1">{words.slice(1).join(" ")}</span>
          </>
        );
      }
      return name;
    };

    return (
      <div ref={ref} {...props} className="h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "group relative bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col h-full",
            isSelected ? "border-primary ring-4 ring-primary/10" : "hover:border-primary/30"
          )}
        >
          {/* Header compartido: Logo Izquierda | Nombre Derecha */}
          <div className="p-6 pb-2 flex items-center gap-4">
            {/* LOGO MÁS GRANDE */}
            <div className="w-20 h-20 bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-500 shadow-sm">
              <img 
                src={normalizeLogoPath(plan.logo)} 
                alt={plan.empresa} 
                className="w-full h-full object-contain" 
              />
            </div>
            
            {/* NOMBRE DEL PLAN (2 líneas) */}
            <div className="flex-1 text-left">
              <h3 className="font-black text-xl md:text-2xl text-slate-900 leading-[0.9] tracking-tighter">
                {renderPlanName(plan.name || "")}
              </h3>
              <div className="h-4 overflow-hidden mt-1">
                <AnimatePresence mode="wait">
                  <motion.p key={currentTagline} initial={{ y: 10 }} animate={{ y: 0 }} exit={{ y: -10 }} className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                    {TAGLINES[currentTagline]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 pt-2 flex flex-col flex-1">
            {/* 🟢 BENTO GRID 2-COLUMNS (Ajustado para 3 por fila) */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {prestacionesFiltradas.slice(0, 4).map((item: any, idx: number) => {
                const maestra = item?.prestaciones_maestras || {};
                return (
                  <div key={idx} className="bg-[#FDFCF6]/80 p-3 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center gap-1 min-h-[90px] hover:bg-white hover:border-blue-100 transition-all shadow-sm">
                    <span className="text-2xl">{maestra.icono_emoji || "✨"}</span>
                    <p className="text-[8px] font-black text-slate-800 uppercase tracking-tight leading-none">
                      {maestra.nombre}
                    </p>
                    {item.valor && (
                      <span className="text-[9px] font-black text-blue-600 truncate max-w-full">
                        {item.valor}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-auto space-y-4">
              {/* Precio Impacto */}
              <div className="bg-slate-900 py-4 rounded-3xl relative overflow-hidden text-center shadow-lg shadow-slate-200">
                {discount > 0 && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl">
                    -{discount}%
                  </div>
                )}
                <span className="text-[10px] text-slate-400 font-bold line-through block leading-none mb-1 opacity-70">
                  {formatCurrency(precioOriginal)}
                </span>
                <div className="flex items-baseline justify-center gap-1 text-white">
                  <span className="text-3xl font-black tracking-tighter">
                    {formatCurrency(precioAMostrar)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">/mes</span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <Button 
                  onClick={(e) => { e.stopPropagation(); onWhatsApp(); }} 
                  className="flex-1 bg-[#25D366] hover:bg-[#20BD5A] h-12 rounded-2xl text-[11px] font-black shadow-lg shadow-green-100 group/wa"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  LO QUIERO
                </Button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onSelect(); }}
                  className={cn(
                    "w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all",
                    isSelected ? "bg-primary border-primary text-white" : "bg-white border-slate-200 text-slate-400"
                  )}
                >
                  <Scale size={20} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
);