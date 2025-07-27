## Descrição

API de gerenciamento de cadastro de produtores rurais

## Instalar as dependências do projeto

```bash
npm install
```

## Configuração de Ambiente

1. Copie o arquivo `.env.example` para `.env`
2. Ajuste as variáveis conforme necessário
3. Para desenvolvimento local, use:
   ```
   DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/brain_ag_dev?schema=public"
   ```

## Executar o projeto

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Executar os testes

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Docker


### 1. Comandos principais

```bash
# Subir os serviços em modo produção
docker-compose up -d

# Ver logs da aplicação
docker-compose logs -f app

# Parar os serviços
docker-compose down
```

### 2. Comandos Úteis

```bash
# Rebuild da aplicação
docker-compose build app

# Executar migrations do Prisma
docker-compose exec app npx prisma migrate deploy

# Executar seed do banco
docker-compose exec app npm run run-seed

# Acessar bash da aplicação
docker-compose exec app sh

# Acessar PostgreSQL
docker-compose exec postgres psql -U postgres -d brain_ag
```

### 5. Primeiro Setup

```bash
# 1. Subir apenas o banco de dados
docker-compose up -d postgres

# 2. Executar as migrations
docker-compose exec app npx prisma migrate deploy

# 3. Executar seed (opcional)
docker-compose exec app npm run run-seed

# 4. Subir a aplicação
docker-compose up -d app
```

## Documentação da API (Swagger)

A documentação interativa da API está disponível através do Swagger UI:

**URL:** http://localhost:3000/docs

Através da documentação você pode:
- Visualizar todos os endpoints disponíveis
- Testar as rotas diretamente no navegador
- Ver os schemas de request/response
- Entender os códigos de status retornados

## Logging

Para mais detalhes sobre a estratégia de logging da aplicação, consulte o documento [LOGGING.md](./LOGGING.md).

## Arquitetura do Banco de Dados

O sistema utiliza PostgreSQL como banco de dados principal e o Prisma como ORM. A arquitetura foi projetada seguindo boas práticas.

### Diagrama de Entidade-Relacionamento (DER)

![DER - Diagrama de Entidade-Relacionamento](docs/images/DER.png)

### Descrição das Entidades

#### **Producer (Produtor)**
- Entidade principal que representa os produtores rurais
- Possui CPF/CNPJ único para identificação
- Um produtor pode ter múltiplas fazendas

#### **Farm (Fazenda)**
- Representa as propriedades rurais de um produtor
- Contém informações de localização (cidade, estado)
- Armazena dados de área total, área agricultável e área de vegetação
- Relaciona-se com um único produtor (N:1)

#### **Planting (Plantio)**
- Representa a associação entre uma fazenda, uma safra e uma cultura
- Contém informações específicas do plantio (área plantada, datas, observações)
- Possui constraint único para evitar duplicação (fazenda + safra + cultura)
- Relaciona-se com Farm, Season e Crop (N:1 cada)

#### **Crop (Cultura)**
- Cadastro de culturas agrícolas (ex: Soja, Milho, Algodão)
- Nome único para evitar duplicação
- Pode incluir descrição e categoria

#### **Season (Safra)**
- Representa períodos de produção agrícola
- Contém nome, ano e período de vigência
- Constraint único para nome + ano
- Campo 'active' para controle de safras ativas

## Rotas da API

### Dashboard
- `GET /dashboard` - Buscar dados consolidados do dashboard

### Produtores (Producers)
- `POST /producers` - Cadastrar um novo produtor
- `GET /producers/all` - Buscar todos os produtores
- `GET /producers/:id` - Buscar produtor por ID
- `PATCH /producers` - Atualizar dados de um produtor
- `DELETE /producers/:id` - Deletar um produtor

### Fazendas (Farms)
- `POST /farms` - Criar uma nova fazenda

### Safras (Seasons)
- `POST /seasons` - Criar uma nova safra

### Culturas (Crops)
- `POST /crops` - Criar uma nova cultura

### Plantios (Plantings)
- `POST /plantings` - Criar um novo plantio

## Portas Utilizadas

- **Aplicação**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Swagger Docs**: http://localhost:3000/docs