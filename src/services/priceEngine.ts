/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/priceEngine.ts

export const getPricesById = async (edad1: number, edad2: number, hijos: number, tipo: string) => {
  // 1. Generamos el ID siguiendo tu regla
  const idStr = `${edad1}${String(edad2).padStart(2, '0')}${String(hijos).padStart(2, '0')}${tipo === 'P' ? '0' : '1'}`;
  const targetId = parseInt(idStr);

  // 2. Buscamos directamente por ID (Es la forma más rápida)
// 1. Importá el JSON normalmente
try {
    // 2. Pedimos el JSON de forma externa (Debe estar en /public/assets/data/)
    // Esto no bloquea la carga inicial de la web
    const response = await fetch('assets/data/cotizaciones_maestras_rows.json');
    const masterQuotes: any[] = await response.json();

    // 3. Buscamos por ID
    const row = masterQuotes.find(q => q.id === targetId);
    
    if (!row || !row.respuesta) {
      console.warn("⚠️ No se encontró cotización para ID:", targetId);
      return [];
    }

    // 4. Devolvemos los precios parseados
    return typeof row.respuesta === 'string' ? JSON.parse(row.respuesta) : row.respuesta;
    
  } catch (error) {
    console.error("❌ Error cargando el motor de precios:", error);
    return [];
  }
};