# Étape 1 : Build de l'app UI5
FROM node:22.0 AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm install

# Copier le code source
COPY . .

# Build de production
RUN npm run build

# Étape 2 : Serveur Nginx pour servir l'app
FROM nginx:alpine

# Copier le build UI5
COPY --from=builder /app/dist /usr/share/nginx/html


# Exposer le port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
