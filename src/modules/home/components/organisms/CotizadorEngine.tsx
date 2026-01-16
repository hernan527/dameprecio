/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from 'react';
import { CotizadorSidebar } from './CotizadorSidebar';
import { HomePlanCard } from './HomePlanCard'; 
// Importamos y casteamos para evitar el error .find

const calcularAporteObraSocial = (sueldo: number) => {
  const UMBRAL_D = 300000;
  if (sueldo < UMBRAL_D) return 0;
  return Math.round(sueldo * 0.0765);
};

export default function CotizadorEngine() {
  const [filtros, setFiltros] = useState({
    edadTitular: 30,
    edadConyuge: 0,
    hijos: 0,
    sueldo: 0
  });

  const [datos, setDatos] = useState(null);
const [loadingPrices, setLoadingPrices] = useState(true); // Nuevo estado

useEffect(() => {
    fetch('assets/data/cotizaciones_maestras_rows.json')
      .then(res => res.json())
      .then(data => {
        setDatos(data);
        setLoadingPrices(false); // Ya tenemos los precios
      });
  }, []);

// UseMemo sigue igual, pero ahora "datos" puede ser null al principio
  const planesEnriquecidos = useMemo(() => {
    // Si no hay datos, devolvemos una estructura vacía o un mock básico
    if (!datos) return Array(4).fill({ isPlaceholder: true }); 

    const escenario = (datos as any[]).find(c => 
      c.edad_1 === filtros.edadTitular && c.hijos === filtros.hijos
    );

    if (!escenario) return [];

    try {
      const listaPlanes = typeof escenario.respuesta === 'string' 
        ? JSON.parse(escenario.respuesta) 
        : escenario.respuesta;

      const aporte = calcularAporteObraSocial(filtros.sueldo);

      return listaPlanes.map((p: any) => ({
        // Adaptamos los datos del JSON a lo que espera HomePlanCard
        id: p.item_id,
        name: p.name,
        item_id: p.item_id,
        empresa: p.empresa_nombre || "Prepaga",
        logo: p.logo,
        price: Math.max(0, p.precio - aporte), // Precio con descuento
        originalPrice: p.precio,               // Precio de lista
        attributes: p.atributos?.map((a: any) => a.etiqueta) || [],
        clinics: p.clinics?.map((c: any) => c.nombre_abreviado || c.nombre) || [],
        clinicsData: p.clinics || [],
        copago: p.copago || false,
        modalidad: filtros.sueldo > 300000 ? 'D' : 'P', // Se lo pasamos dentro del objeto
        isLoading: false
      }));
    } catch (e) {
      return [];
    }
  },[filtros, datos]);; // Agregamos 'datos' a las dependencias



return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <CotizadorSidebar filtros={filtros} setFiltros={setFiltros} />
        <div className="flex-1 w-full space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {planesEnriquecidos.map((planData: any, index: number) => (
              <HomePlanCard 
                key={planData.item_id || index} 
                plan={planData} 
                index={index}
                isLoading={loadingPrices} // Pasamos el estado de carga 
                isSelected={false}
                onSelect={() => {}}
                onWhatsApp={() => {}}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}