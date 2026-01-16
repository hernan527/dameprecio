/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import { Plan } from '@/core/interfaces/plan/planes';
import { Clinica } from '@/core/interfaces/plan/clinicas';
import { PlanEmpresa } from '@/core/interfaces/plan/empresas';

export function usePlans() {
  return useQuery({
    queryKey: ['plans-optimized'],
    queryFn: async () => {
      // 1. Extraemos las tablas puras del Mock
      // 1. Cargamos el JSON de forma externa (Debe estar en /public/assets/data/)
      const response = await fetch('./assets/data/planes_mock.json');
      if (!response.ok) throw new Error("Error al cargar planes_mock.json");
      const mockData = await response.json();

const { planes, tabla_empresas, tabla_clinicas, tabla_plan_clinica } = mockData;

      // 2. Creamos Mapas (Diccionarios) para acceso instantáneo O(1)
      const empresasMap = new Map(tabla_empresas.map((e: any) => [e.id, e]));
      const clinicasMap = new Map(tabla_clinicas.map((c: any) => [c.id, c]));

      // 3. Procesamos los planes inyectando sus relaciones reales
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
     const planesProcesados = planes.map((plan: any) => {
        const empresa = empresasMap.get(plan.empresa_id) || null;

        const planClinicas = tabla_plan_clinica
          .filter((rel: any) => rel.plan_id === plan.id)
          .map((rel: any) => {
            const clinicaInfo = clinicasMap.get(rel.clinica_id);
            return clinicaInfo ? { clinicas: clinicaInfo } : null;
          })
          .filter(Boolean);

       return {
          ...plan,
          empresas: empresa,
          plan_clinica: planClinicas,
        } as Plan;
      });

      return planesProcesados;
    },
    staleTime: Infinity, 
  });
}