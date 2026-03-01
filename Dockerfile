# Étape 1 : Build de l'app UI5
FROM node:22.0 AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm install

# Copier le code source
COPY . .

RUN echo "📦 Installation des dépendances..."

RUN node --stack-size=65536 node_modules/.bin/ui5 build \
    --config=ui5.yaml \
    --clean-dest \
    --dest dist

# Build de production
RUN npm run build

# Étape 2 : Serveur Nginx pour servir l'app
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copier le build UI5
COPY --from=builder /app/dist /usr/share/nginx/html


# Exposer le port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
