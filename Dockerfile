# Use Node.js 22 como base
FROM node:22-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Copiar código fonte
COPY . .

# Instalar Prisma CLI globalmente e gerar cliente
RUN npm install -g prisma
RUN npx prisma generate

# Construir a aplicação
RUN npm run build

# Expor porta
EXPOSE 3000

# Comando para executar a aplicação
CMD ["npm", "run", "start:prod"] 