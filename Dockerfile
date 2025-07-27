# Stage 1: Build a aplicação
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

# Stage 2: Instala apenas as dependências de produção
FROM node:22-alpine AS installer

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --omit=dev

# Stage 3: Imagem final de produção
FROM node:22-alpine

WORKDIR /usr/src/app

COPY --from=installer /usr/src/app/package*.json ./
COPY --from=installer /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/node_modules/.prisma/client ./node_modules/.prisma/client
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/src/database/prisma/schema.prisma ./src/database/prisma/schema.prisma
COPY --from=builder /usr/src/app/src/database/prisma/migrations ./src/database/prisma/migrations
COPY --from=builder /usr/src/app/src/database/prisma/models ./src/database/prisma/models


EXPOSE 3000

# Copia o script de entrypoint e o torna executável
COPY entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh

ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
CMD ["npm", "run", "start:prod"]
