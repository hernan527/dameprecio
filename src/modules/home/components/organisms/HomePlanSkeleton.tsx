/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomePlanCard, HomePlanData } from "./HomePlanCard";
import { HomeComparisonModal } from "./HomeComparisonModal";
import { CotizadorSidebar } from "./CotizadorSidebar"; 
import { usePlans } from "@/hooks/usePlans";
import { normalizeLogoPath } from "@/lib/supabase-helpers";

// Componente Skeleton dentro del mismo archivo para evitar errores de importación
const HomePlanSkeleton = () => (
  <div className="h-full animate-pulse">
    <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden flex flex-col h-full shadow-sm">
      <div className="p-6 pb-2 flex items-center gap-4">
        <div className="w-20 h-20 bg-slate-100 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-slate-200 rounded-md w-3/4" />
          <div className="h-3 bg-slate-100 rounded-md w-1/2" />
        </div>
      </div>
      <div className="px-6 pb-6 pt-2 flex flex-col flex-1">
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 h-[90px]" />
          ))}
        </div>
        <div className="mt-auto space-y-4">
          <div className="bg-slate-100 h-24 rounded-3xl w-full" />
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-100 h-12 rounded-2xl" />
            <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const PlansSection = () => {
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [precios, setPrecios] = useState<any>(null);
  const [planesMock, setPlanesMock] = useState<any>(null);
  const { data, isLoading: isLoadingDB } = usePlans();
  
  const [filtros, setFiltros] = useState({
    edad1: 18,
    edad2: 0,
    hijos: 0, // Cambié a 0 para que haga match con 1800000 por defecto
    sueldo: 0,
    tipo: '0'
  });

  // CARGA DE PRECIOS (13MB)
  useEffect(() => {
    fetch('/assets/data/precios_optimizados.json?v=2')
      .then(res => res.json())
      .then(data => setPrecios(data))
      .catch(err => console.error("❌ Error Precios:", err));
  }, []);

  // CARGA DE PLANES BASE
  useEffect(() => {
    fetch('/assets/data/planes_mock.json') // Agregada la / inicial
      .then(res => res.json())
      .then(json => setPlanesMock(json))
      .catch(err => console.error("❌ Error Mock:", err));
  }, []);

  const currentTargetId = useMemo(() => {
    const e1 = String(filtros.edad1).padStart(2, '0');
    const e2 = String(filtros.edad2 || '00').padStart(2, '0');
    const h  = String(filtros.hijos).padStart(2, '0');
    const t  = filtros.sueldo > 0 ? '1' : '0';
    return `${e1}${e2}${h}${t}`;
  }, [filtros.edad1, filtros.edad2, filtros.hijos, filtros.sueldo]);

  const livePlans = useMemo(() => {
    if (!precios || !planesMock) return [];
    
    const idFila = String(currentTargetId);
    const dataFila = precios[idFila];
    if (!dataFila) return [];

    const planesBase = planesMock.planes || [];
    const aporte = filtros.sueldo > 0 ? Math.round(filtros.sueldo * 0.0765) : 0;

    return planesBase.map((plan: any) => {
      const precioInfo = dataFila[plan.item_id];
      if (!precioInfo) return null;

      return {
        ...plan,
        precio_total: precioInfo.p,
        precio_lista: precioInfo.v,
        precio_final: Math.max(0, precioInfo.p - aporte),
        valor_aporte: aporte,
        logo: normalizeLogoPath(plan.logo),
        empresa: plan.empresa_nombre || plan.empresas?.nombre || "Prepaga",
      };
    }).filter(Boolean);
  }, [planesMock, currentTargetId, filtros.sueldo, precios]);

  const togglePlan = (planId: string) => {
    setSelectedPlans(prev => 
      prev.includes(planId) 
        ? prev.filter(id => id !== planId) 
        : (prev.length >= 2 ? [prev[1], planId] : [...prev, planId])
    );
  };

  const selectedPlanData = useMemo(() => {
    return selectedPlans
      .map((id) => livePlans.find((p) => String(p.id) === String(id)))
      .filter(Boolean) as HomePlanData[];
  }, [selectedPlans, livePlans]);

  // Lógica de carga unificada
  const loading = !precios || !planesMock || isLoadingDB;

  return (
    <section className="py-12 bg-background relative min-h-screen">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary uppercase tracking-wider">Cotizador Online</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black italic text-foreground">
            Versus <span className="text-primary">Prepagas</span>
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start relative pt-0">
          <aside className="w-full lg:w-[350px] sticky top-0 self-start z-40">
            <CotizadorSidebar filtros={filtros} setFiltros={setFiltros} />
          </aside>

          <main className="flex-1 w-full">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => <HomePlanSkeleton key={i} />)}
              </div>
            ) : livePlans.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground border rounded-[2.5rem] border-dashed">
                <p className="text-lg font-bold">No se encontraron planes.</p>
                <p className="text-sm">ID buscado: {currentTargetId}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {livePlans.map((plan, index) => (
                    <HomePlanCard
                      key={plan.id}
                      plan={plan}
                      index={index}
                      isSelected={selectedPlans.includes(plan.id)}
                      onSelect={() => togglePlan(plan.id)}
                      onWhatsApp={() => window.open(`https://wa.me/5491100000000?text=Consulta`)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Barra de Comparación y Modal se mantienen igual debajo */}
      {/* ... (resto de tu código de modal) */}
    </section>
  );
};