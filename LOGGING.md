# Sistema de Logging - Brain Ag

Este documento descreve o sistema de logging implementado para garantir a observabilidade da aplicação Brain Ag.

## Visão Geral

O sistema de logging foi implementado usando **Winston** com integração ao NestJS através do **nest-winston**. Ele captura automaticamente:

- Requisições HTTP (entrada e saída)
- Operações de banco de dados
- Execução de casos de uso (lógica de negócio)
- Erros e exceções
- Inicialização e encerramento da aplicação
- Validações e regras de negócio

## Configuração

### Variáveis de Ambiente

- `LOG_LEVEL`: Define o nível de logging (error, warn, info, debug, verbose)
- `NODE_ENV`: Altera o formato de saída dos logs

### Níveis de Log

1. **ERROR**: Erros críticos que impedem o funcionamento
2. **WARN**: Avisos importantes (ex: validações falhadas)
3. **INFO**: Informações gerais de operações (padrão)
4. **DEBUG**: Informações detalhadas para desenvolvimento
5. **VERBOSE**: Informações muito detalhadas

## Saídas de Log

### Desenvolvimento
- **Console**: Logs coloridos e formatados para leitura humana
- **Arquivo**: `logs/app.log` (todos os logs) e `logs/error.log` (apenas erros)

### Produção
- **Console**: Logs em formato JSON estruturado
- **Arquivo**: Mesma estrutura do desenvolvimento

## Tipos de Logs Capturados

### 1. HTTP Requests/Responses
```json
{
  "timestamp": "2025-01-27 10:30:15",
  "level": "info",
  "message": "HTTP Request recebida",
  "context": "HttpRequest",
  "method": "POST",
  "url": "/producers",
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1"
}
```

### 2. Operações de Banco de Dados
```json
{
  "timestamp": "2025-01-27 10:30:16",
  "level": "info",
  "message": "Operação de banco de dados",
  "context": "Database",
  "operation": "create",
  "entity": "producers",
  "duration": "25ms",
  "recordId": "uuid-do-registro"
}
```

### 3. Lógica de Negócio
```json
{
  "timestamp": "2025-01-27 10:30:16",
  "level": "info",
  "message": "Execução de caso de uso",
  "context": "BusinessLogic",
  "useCase": "CreateProducerUseCase",
  "action": "Produtor criado com sucesso",
  "data": {
    "producerId": "uuid",
    "cpfCnpj": "12345678901",
    "name": "João Silva"
  }
}
```

### 4. Erros e Exceções
```json
{
  "timestamp": "2025-01-27 10:30:17",
  "level": "error",
  "message": "Exceção capturada: Formato de documento inválido",
  "context": "ExceptionFilter",
  "statusCode": 409,
  "method": "POST",
  "url": "/producers",
  "stack": "ConflictException: Formato...",
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1"
}
```

## Monitoramento

### Arquivos de Log
- `logs/app.log` - Todos os logs
- `logs/error.log` - Apenas erros

### Métricas Importantes
- Tempo de resposta das requisições
- Duração das operações de banco
- Frequência de erros por endpoint
- Padrões de uso da API

## Configuração de Produção

Para produção, recomenda-se:

```bash
# .env
NODE_ENV=production
LOG_LEVEL=warn
```

Isso reduzirá o volume de logs mantendo informações críticas. 