#!/bin/sh

# Para o script se qualquer comando falhar
set -e

echo ">>> ENTRYPOINT: Executando migrações do banco de dados..."

# Executa as migrações do Prisma
npx prisma migrate deploy

echo ">>> ENTRYPOINT: Migrações finalizadas com sucesso."
echo ">>> ENTRYPOINT: Iniciando a aplicação..."

# Inicia a aplicação
exec "$@" 