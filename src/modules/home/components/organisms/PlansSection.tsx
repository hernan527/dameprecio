/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomePlanCard, HomePlanData } from "./HomePlanCard";
import { HomeComparisonModal } from "./HomeComparisonModal";
import { CotizadorSidebar } from "./CotizadorSidebar"; 
import { normalizeLogoPath } from "@/lib/supabase-helpers";

// Componente Skeleton local para asegurar que no falle por importación
const HomePlanSkeleton = () => (
  <div className="h-full animate-pulse">
    <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden flex flex-col h-full shadow-sm p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-20 h-20 bg-slate-100 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-slate-200 rounded-md w-3/4" />
          <div className="h-3 bg-slate-100 rounded-md w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-50 h-[90px] rounded-2xl" />
        ))}
      </div>
      <div className="mt-auto bg-slate-100 h-24 rounded-3xl" />
    </div>
  </div>
);

export const PlansSection = () => {
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [precios, setPrecios] = useState<any>(null);
  const [planesMock, setPlanesMock] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [filtros, setFiltros] = useState({
    edad1: 18,
    edad2: 0,
    hijos: 1,
    sueldo: 0,
    tipo: '0'
  });

  // Carga de Precios (13MB)
  useEffect(() => {
    fetch('/assets/data/precios_optimizados.json?v=2')
      .then(res => res.json())
      .then(data => {
        setPrecios(data);
        console.log("✅ Precios cargados");
      })
      .catch(err => console.error("❌ Error precios:", err));
  }, []);

  // Carga de Estructura de Planes
  useEffect(() => {
    fetch('/assets/data/planes_mock.json')
      .then(res => res.json())
      .then(data => {
        setPlanesMock(data);
        console.log("✅ Mock cargado");
      })
      .catch(err => console.error("❌ Error mock:", err));
  }, []);

  // ID de búsqueda
  const currentTargetId = useMemo(() => {
    const e1 = String(filtros.edad1).padStart(2, '0');
    const e2 = String(filtros.edad2 || '00').padStart(2, '0');
    const h  = String(filtros.hijos).padStart(2, '0');
    const t  = filtros.sueldo > 0 ? '1' : '0';
    return `${e1}${e2}${h}${t}`;
  }, [filtros.edad1, filtros.edad2, filtros.hijos, filtros.sueldo]);

  // Lógica de Matching
  // Busca el bloque de livePlans y asegúrate de que se vea así:
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
      id: String(plan.id),
      // 🚩 ESTA ES LA LÍNEA QUE FALTA:
      name: plan.nombre_plan, 
      price: Math.max(0, (precioInfo.p || 0) - aporte),
      originalPrice: precioInfo.p || 0,
      precio_total: precioInfo.p,
      precio_lista: precioInfo.v,
      precio_final: Math.max(0, (precioInfo.p || 0) - aporte),
      valor_aporte: aporte,
      logo: normalizeLogoPath(plan.logo || plan.empresas?.imagenes?.logo),
      empresa: plan.empresa_nombre || plan.empresas?.nombre || "Prepaga",
      // Aseguramos clínicas para el modal
      clinicsData: plan.plan_clinica?.map((pc: any) => pc.clinicas).filter(Boolean) || []
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

// Busca este bloque en tu PlansSection.tsx y reemplázalo:
// Busca este bloque en tu PlansSection.tsx y reemplázalo:
const selectedPlanData = useMemo(() => {
  return selectedPlans
    .map((id) => livePlans.find((p) => String(p.id) === String(id)))
    .filter((p): p is any => p !== undefined); // Filtro estricto para que no pasen nulos
}, [selectedPlans, livePlans]);

  const isLoading = !precios || !planesMock;

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
          {/* SIDEBAR */}
          <aside className="w-full lg:w-[350px] sticky top-0 self-start z-40">
            <CotizadorSidebar filtros={filtros} setFiltros={setFiltros} />
          </aside>
          

          {/* MAIN CONTENT */}
          <main className="flex-1 w-full">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => <HomePlanSkeleton key={i} />)}
              </div>
            ) : livePlans.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-[2.5rem]">
                <p className="text-xl font-bold">No se encontraron planes.</p>
                <p className="text-sm">ID: {currentTargetId}</p>
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
                      onWhatsApp={() => window.open(`https://wa.me/5491100000000`)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* COMPARISON BAR */}
      <AnimatePresence>
        {selectedPlans.length > 0 && (
          <motion.div 
            initial={{ y: 100, x: "-50%" }} 
            animate={{ y: 0, x: "-50%" }} 
            exit={{ y: 100, x: "-50%" }}
            className="fixed bottom-8 left-1/2 z-50 w-[90%] max-w-md"
          >
            <div className="bg-card/95 backdrop-blur-xl border border-primary/20 rounded-3xl shadow-2xl p-4 flex items-center justify-between">
              <div className="flex -space-x-3">
                {selectedPlanData.map((p) => (
                  <div key={p.id} className="w-10 h-10 rounded-full border-2 border-background bg-white flex items-center justify-center overflow-hidden">
                    <img src={p.logo} alt="" className="w-6 h-6 object-contain" />
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => setShowModal(true)} 
                disabled={selectedPlans.length < 2}
                className="font-bold rounded-xl"
              >
                <Scale className="w-4 h-4 mr-2" />
                {selectedPlans.length === 2 ? "Comparar ahora" : "Selecciona 2"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <HomeComparisonModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        plans={selectedPlanData}
        onWhatsApp={(name) => window.open(`https://wa.me/5491100000000?text=Consulta`)}
      />
    </section>
  );
};