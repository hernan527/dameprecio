/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomePlanCard, HomePlanData } from "./HomePlanCard";
import { HomeComparisonModal } from "./HomeComparisonModal";
import { CotizadorSidebar } from "./CotizadorSidebar"; 
import { normalizeLogoPath } from "@/lib/supabase-helpers";

export const PlansSection = () => {
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [precios, setPrecios] = useState<any>(null);
  const [planesMock, setPlanesMock] = useState<any>(null);

  const [filtros, setFiltros] = useState({
    edad1: 18,
    edad2: 0,
    hijos: 1,
    sueldo: 0,
    tipo: '0'
  });

  // 1. CARGA DE DATOS
  useEffect(() => {
    fetch('/assets/data/precios_optimizados.json?v=2').then(res => res.json()).then(setPrecios).catch(console.error);
    fetch('/assets/data/planes_mock.json').then(res => res.json()).then(setPlanesMock).catch(console.error);
  }, []);

  // 2. ID DE BÚSQUEDA DE PRECIO
  const currentTargetId = useMemo(() => {
    const e1 = String(filtros.edad1).padStart(2, '0');
    const e2 = String(filtros.edad2 || '00').padStart(2, '0');
    const h = String(filtros.hijos).padStart(2, '0');
    const t = filtros.sueldo > 0 ? '1' : '0';
    return `${e1}${e2}${h}${t}`;
  }, [filtros]);

  // 3. MOTOR DE CÁLCULO (Mapeo a HomePlanData)
  const livePlans = useMemo(() => {
    if (!precios || !planesMock) return [];
    
    const dataFila = precios[String(currentTargetId)];
    if (!dataFila) return [];

    const aporte = filtros.sueldo > 0 ? Math.round(filtros.sueldo * 0.0765) : 0;

    return (planesMock.planes || []).map((plan: any) => {
      const precioInfo = dataFila[plan.item_id];
      if (!precioInfo) return null;

      // ⚡ IMPORTANTE: Sincronizamos los nombres de las variables para que el Modal las lea
      return {
        ...plan,
        id: String(plan.id),
        name: plan.nombre_plan,
        price: Math.max(0, (precioInfo.p || 0) - aporte),
        originalPrice: precioInfo.p || 0,
        logo: normalizeLogoPath(plan.empresas?.imagenes?.logo || plan.logo),
        empresa: plan.empresa_nombre || plan.empresas?.nombre || "Prepaga",
        // Inyectamos las clínicas mapeadas para el Modal
        clinicsData: plan.plan_clinica?.map((pc: any) => pc.clinicas).filter(Boolean) || [],
        modalidad: filtros.sueldo > 0 ? 'D' : 'P'
      };
    }).filter(Boolean) as HomePlanData[];
  }, [planesMock, currentTargetId, filtros.sueldo, precios]);

  // 4. DATOS DE LOS PLANES SELECCIONADOS (Para el Modal)
  const selectedPlanData = useMemo(() => {
    return selectedPlans
      .map((id) => livePlans.find((p) => String(p.id) === String(id)))
      .filter((p): p is HomePlanData => !!p);
  }, [selectedPlans, livePlans]);

  const togglePlan = (planId: string) => {
    setSelectedPlans(prev => 
      prev.includes(planId) 
        ? prev.filter(id => id !== planId) 
        : (prev.length >= 2 ? [prev[1], planId] : [...prev, planId])
    );
  };

  const isLoading = !precios || !planesMock;

  return (
    <section className="py-12 bg-background relative min-h-screen">
      <div className="container mx-auto px-4">
        {/* ... (Título y Header igual) */}
        
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <aside className="w-full lg:w-[350px] sticky top-20 self-start z-40">
            <CotizadorSidebar filtros={filtros} setFiltros={setFiltros} />
          </aside>

          <main className="flex-1 w-full">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <p>Cargando planes...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
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

      {/* BARRA DE COMPARACIÓN */}
      <AnimatePresence>
        {selectedPlans.length > 0 && (
          <motion.div initial={{ y: 100, x: "-50%" }} animate={{ y: 0, x: "-50%" }} exit={{ y: 100, x: "-50%" }} className="fixed bottom-8 left-1/2 z-50 w-[90%] max-w-md">
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
                disabled={selectedPlanData.length < 2} // 🛡️ Protección
                className="font-bold rounded-xl"
              >
                <Scale className="w-4 h-4 mr-2" />
                {selectedPlanData.length === 2 ? "Comparar ahora" : "Seleccioná 2"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE COMPARACIÓN */}
      <HomeComparisonModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        plans={selectedPlanData} // 👈 Le pasamos la variable correcta
        onWhatsApp={(name) => window.open(`https://wa.me/5491100000000?text=Consulta`)}
      />
    </section>
  );
};