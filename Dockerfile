# Etapa 1: Construcción (Build)
FROM node:20.9.0-alpine AS builder

WORKDIR /app

# Habilitar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Instalar dependencias primero para cachear la capa
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copiar el resto del código
COPY . .

# --- ESTO ES LO QUE AGREGAMOS ---
# Definimos que el build aceptará estas variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_SERVICE_ROLE_KEY

# Las pasamos al entorno del contenedor para que el script las vea
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_SERVICE_ROLE_KEY=$VITE_SUPABASE_SERVICE_ROLE_KEY
# --------------------------------

# Construir la aplicación
RUN pnpm run build

### Etapa 2: Servidor de Producción (Nginx)
FROM nginx:1.25.3-alpine-slim

# Configuración de Nginx para React (Manejo de rutas SPA)
COPY config/default.conf /etc/nginx/conf.d/default.conf

# Limpiar directorio por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copiar los archivos construidos desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Permisos
RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]