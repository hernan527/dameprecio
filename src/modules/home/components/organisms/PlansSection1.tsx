/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomePlanCard, HomePlanData } from "./HomePlanCard";
import { HomeComparisonModal } from "./HomeComparisonModal";
import { CotizadorSidebar } from "./CotizadorSidebar"; 
import { normalizeLogoPath } from "@/lib/supabase-helpers";

// Skeleton para carga
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
        {[1, 2, 3, 4].map((i) => <div key={i} className="bg-slate-50 h-[90px] rounded-2xl" />)}
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

  const [filtros, setFiltros] = useState({
    edad1: 18,
    edad2: 0,
    hijos: 0,
    sueldo: 0,
    tipo: '0'
  });

  // Carga de Datos
  useEffect(() => {
    fetch('/assets/data/precios_optimizados.json?v=2').then(res => res.json()).then(setPrecios).catch(console.error);
    fetch('/assets/data/planes_mock.json').then(res => res.json()).then(setPlanesMock).catch(console.error);
  }, []);

  // Generador de ID
  const currentTargetId = useMemo(() => {
    const e1 = String(filtros.edad1).padStart(2, '0');
    const e2 = String(filtros.edad2 || '00').padStart(2, '0');
    const h = String(filtros.hijos).padStart(2, '0');
    const t = filtros.sueldo > 300000 ? '1' : '0';
    return `${e1}${e2}${h}${t}`;
  }, [filtros]);

  // Lógica de "Vendedor Experto" y Matching
  const livePlans = useMemo(() => {
  if (!precios || !planesMock) return [];
  
  const idFila = String(currentTargetId);
  const dataFila = precios[idFila];
  const aporte = filtros.sueldo > 0 ? Math.round(filtros.sueldo * 0.0765) : 0;

  return (planesMock.planes || []).map((plan: any) => {
    const precioInfo = dataFila ? dataFila[plan.item_id] : null;

    // Mensajes dinámicos si no hay precio
    let mensajeCustom = "Precio a medida";
    if (!precioInfo) {
      if (filtros.sueldo > 0) mensajeCustom = "Cotizar con aportes";
      else if (filtros.edad2 > 0) mensajeCustom = "Plan Matrimonial";
      else if (filtros.hijos > 0) mensajeCustom = "Plan Familiar";
      else mensajeCustom = "Plan Individual";
    }

    return {
      ...plan, // Esto trae el id original y otras props de la DB
      id: String(plan.id),
      name: plan.nombre_plan || plan.name, // 👈 ASEGURAMOS QUE NAME EXISTA
      price: precioInfo ? Math.max(0, (precioInfo.p || 0) - aporte) : null,
      originalPrice: precioInfo ? (precioInfo.p || 0) : null,
      logo: normalizeLogoPath(plan.logo || plan.empresas?.logo_url), // 👈 ASEGURAMOS EL LOGO
      empresa: plan.empresa_nombre || plan.empresas?.nombre || "Prepaga",
      tienePrecio: !!precioInfo,
      mensajePersonalizado: mensajeCustom
    };
  });
}, [planesMock, currentTargetId, filtros, precios]);

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
      .filter((p): p is any => p !== undefined);
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
          <h2 className="text-4xl md:text-5xl font-black italic text-foreground leading-tight">
            Versus <span className="text-primary">Prepagas</span>
          </h2>
        </div>

        {/* ESTRUCTURA FLEX: items-start es la clave del sticky */}
        <div className="flex flex-col lg:flex-row gap-8 items-start relative pt-0">
          
          {/* SIDEBAR COLUMNA */}
          <aside className="w-full lg:w-[350px] relative shrink-0">
            <div className="lg:sticky lg:top-24 z-40 transition-all">
              <CotizadorSidebar filtros={filtros} setFiltros={setFiltros} />
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 w-full min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => <HomePlanSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-40">
                <AnimatePresence mode="popLayout">
                  {livePlans.map((plan, index) => (
                    <HomePlanCard
                      key={plan.id}
                      plan={plan}
                      index={index}
                      isSelected={selectedPlans.includes(plan.id)}
                      onSelect={() => togglePlan(plan.id)}
                      // Si no tiene precio, el botón de la card debería llevar a WhatsApp directamente
                      onWhatsApp={() => {
                        const texto = `Hola! Quiero cotizar el plan ${plan.name} de ${plan.empresa}. Perfil: Titular ${filtros.edad1} años${filtros.edad2 ? ', Cónyuge ' + filtros.edad2 : ''}${filtros.hijos ? ', ' + filtros.hijos + ' hijos' : ''}.`;
                        window.open(`https://wa.me/5491100000000?text=${encodeURIComponent(texto)}`);
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* BARRA COMPARADORA */}
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
                className="font-bold rounded-xl h-10 px-6 uppercase text-xs"
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
        onWhatsApp={(name) => {
          const texto = `Hola! Me interesa comparar el plan ${name}.`;
          window.open(`https://wa.me/5491100000000?text=${encodeURIComponent(texto)}`);
        }}
      />
    </section>
  );
};