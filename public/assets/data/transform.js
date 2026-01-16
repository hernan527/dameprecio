import { readFileSync, writeFileSync } from 'fs';

// 1. Cargamos el archivo pesado
console.log("⏳ Leyendo archivo de 8MB...");
const rawData = readFileSync('cotizaciones_maestras_rows2.json', 'utf8');
const quotes = JSON.parse(rawData);

const result = {};

console.log("🛠️ Transformando datos...");

quotes.forEach((fila) => {
  const interno = {};
  
  // Si 'r' es string, lo parseamos aquí una sola vez
  let planesArray = [];
  if (typeof fila.r === 'string') {
    try {
      planesArray = JSON.parse(fila.r);
    } catch (e) {
      planesArray = [];
    }
  } else {
    planesArray = fila.r || [];
  }

  // Convertimos el array de planes en un objeto de llaves
  if (Array.isArray(planesArray)) {
    planesArray.forEach((plan) => {
      if (plan.i) {
        interno[plan.i] = {
          p: plan.p,
          v: plan.v
        };
      }
    });
  }

  // Usamos el ID de la fila como llave principal
  result[fila.id] = interno;
});

// 2. Guardamos el nuevo archivo optimizado
console.log("💾 Guardando resultado optimizado...");
writeFileSync('precios_optimizados.json', JSON.stringify(result));
console.log("✅ ¡Listo! Usa 'precios_optimizados.json' en tu app.");