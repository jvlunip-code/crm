# API de Serviços do Cliente

Documentação dos endpoints REST para gestão de serviços associados a clientes.

---

## Modelo: CustomerService

Cada serviço pertence a um cliente e pode opcionalmente ter sub-serviços (hierarquia via `parent_id`).

| Campo         | Tipo     | Obrigatório | Descrição                                                  |
|---------------|----------|-------------|------------------------------------------------------------|
| `id`          | number   | auto        | Identificador único do serviço (gerado automaticamente)    |
| `customer_id` | number  | sim         | Identificador do cliente associado                         |
| `parent_id`   | number  | não         | Identificador do serviço pai (para sub-serviços)           |
| `acesso`      | string   | sim         | ID de acesso                                               |
| `tarifario`   | string   | sim         | Tarifário                                                  |
| `operadora`   | string   | sim         | Operadora                                                  |
| `valor`       | float    | sim         | Valor do serviço (ex: 20.32)                               |
| `moeda`       | enum     | sim         | Moeda — valores possíveis: `EUR` (predefinido)             |
| `conta`       | string   | sim         | Conta                                                      |
| `cvp`         | string   | sim         | CVP                                                        |
| `data_fim`    | date     | sim         | Data de fim do serviço (formato: `YYYY-MM-DD`)             |
| `num_client`  | string   | sim         | Número de cliente                                          |
| `num_servico` | string   | sim         | Número de serviço                                          |
| `observacoes` | string   | não         | Observações adicionais                                     |
| `created_at`  | datetime | auto        | Data de criação (gerada automaticamente, formato ISO 8601) |

### Enum: Moeda

| Valor | Descrição       |
|-------|-----------------|
| `EUR` | Euro (predefinido) |

---

## Endpoints

### 1. Listar serviços de um cliente

```
GET /api/customers/:customerId/services
```

Retorna todos os serviços associados a um cliente, incluindo sub-serviços.

**Parâmetros de URL:**

| Parâmetro    | Tipo   | Descrição                  |
|--------------|--------|----------------------------|
| `customerId` | number | Identificador do cliente   |

**Resposta de sucesso:** `200 OK`

```json
[
  {
    "id": 1,
    "customer_id": 1,
    "parent_id": null,
    "acesso": "ACC-001",
    "tarifario": "Empresarial Plus",
    "operadora": "MEO",
    "valor": 45.99,
    "moeda": "EUR",
    "conta": "CT-10001",
    "cvp": "CVP-2001",
    "data_fim": "2025-01-15",
    "num_client": "NC-5001",
    "num_servico": "NS-8001",
    "observacoes": "Contrato renovado anualmente",
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 3,
    "customer_id": 1,
    "parent_id": 1,
    "acesso": "ACC-001-A",
    "tarifario": "Extensão VoIP",
    "operadora": "MEO",
    "valor": 12.00,
    "moeda": "EUR",
    "conta": "CT-10001",
    "cvp": "CVP-2001",
    "data_fim": "2025-01-15",
    "num_client": "NC-5001",
    "num_servico": "NS-8003",
    "observacoes": "Sub-serviço VoIP do acesso principal",
    "created_at": "2024-01-20T14:00:00Z"
  }
]
```

**Respostas de erro:**

| Código | Descrição                |
|--------|--------------------------|
| `404`  | Cliente não encontrado   |

---

### 2. Obter um serviço

```
GET /api/customers/:customerId/services/:id
```

Retorna os detalhes de um serviço específico.

**Parâmetros de URL:**

| Parâmetro    | Tipo   | Descrição                  |
|--------------|--------|----------------------------|
| `customerId` | number | Identificador do cliente   |
| `id`         | number | Identificador do serviço   |

**Resposta de sucesso:** `200 OK`

```json
{
  "id": 1,
  "customer_id": 1,
  "parent_id": null,
  "acesso": "ACC-001",
  "tarifario": "Empresarial Plus",
  "operadora": "MEO",
  "valor": 45.99,
  "moeda": "EUR",
  "conta": "CT-10001",
  "cvp": "CVP-2001",
  "data_fim": "2025-01-15",
  "num_client": "NC-5001",
  "num_servico": "NS-8001",
  "observacoes": "Contrato renovado anualmente",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Respostas de erro:**

| Código | Descrição                |
|--------|--------------------------|
| `404`  | Serviço não encontrado   |

---

### 3. Criar um serviço

```
POST /api/customers/:customerId/services
```

Cria um novo serviço para o cliente. Para criar um sub-serviço, incluir o campo `parent_id`.

**Parâmetros de URL:**

| Parâmetro    | Tipo   | Descrição                  |
|--------------|--------|----------------------------|
| `customerId` | number | Identificador do cliente   |

**Corpo do pedido:**

```json
{
  "parent_id": null,
  "acesso": "ACC-010",
  "tarifario": "Empresarial Plus",
  "operadora": "MEO",
  "valor": 45.99,
  "moeda": "EUR",
  "conta": "CT-10001",
  "cvp": "CVP-2001",
  "data_fim": "2026-01-15",
  "num_client": "NC-5001",
  "num_servico": "NS-9001",
  "observacoes": "Novo contrato empresarial"
}
```

**Campos obrigatórios:** `acesso`, `tarifario`, `operadora`, `valor`, `moeda`, `conta`, `cvp`, `data_fim`, `num_client`, `num_servico`

**Campos opcionais:** `parent_id`, `observacoes`

**Resposta de sucesso:** `201 Created`

```json
{
  "id": 9,
  "customer_id": 1,
  "parent_id": null,
  "acesso": "ACC-010",
  "tarifario": "Empresarial Plus",
  "operadora": "MEO",
  "valor": 45.99,
  "moeda": "EUR",
  "conta": "CT-10001",
  "cvp": "CVP-2001",
  "data_fim": "2026-01-15",
  "num_client": "NC-5001",
  "num_servico": "NS-9001",
  "observacoes": "Novo contrato empresarial",
  "created_at": "2026-01-30T12:00:00Z"
}
```

**Respostas de erro:**

| Código | Descrição                                      |
|--------|-------------------------------------------------|
| `400`  | Dados inválidos (campo obrigatório em falta)    |
| `404`  | Cliente não encontrado                          |
| `404`  | Serviço pai não encontrado (se `parent_id` fornecido) |

**Notas sobre sub-serviços:**
- O `parent_id` deve referenciar um serviço existente do mesmo cliente
- Sub-serviços não podem ter os seus próprios sub-serviços (apenas um nível de hierarquia)

---

### 4. Atualizar um serviço

```
PUT /api/customers/:customerId/services/:id
```

Atualiza os dados de um serviço existente. Todos os campos enviados serão atualizados (atualização parcial suportada).

**Parâmetros de URL:**

| Parâmetro    | Tipo   | Descrição                  |
|--------------|--------|----------------------------|
| `customerId` | number | Identificador do cliente   |
| `id`         | number | Identificador do serviço   |

**Corpo do pedido (parcial — apenas campos a atualizar):**

```json
{
  "valor": 49.99,
  "observacoes": "Valor atualizado após renovação"
}
```

**Resposta de sucesso:** `200 OK`

```json
{
  "id": 1,
  "customer_id": 1,
  "parent_id": null,
  "acesso": "ACC-001",
  "tarifario": "Empresarial Plus",
  "operadora": "MEO",
  "valor": 49.99,
  "moeda": "EUR",
  "conta": "CT-10001",
  "cvp": "CVP-2001",
  "data_fim": "2025-01-15",
  "num_client": "NC-5001",
  "num_servico": "NS-8001",
  "observacoes": "Valor atualizado após renovação",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Respostas de erro:**

| Código | Descrição                |
|--------|--------------------------|
| `400`  | Dados inválidos          |
| `404`  | Serviço não encontrado   |

---

### 5. Eliminar um serviço

```
DELETE /api/customers/:customerId/services/:id
```

Elimina um serviço. Se o serviço tiver sub-serviços, estes são eliminados em cascata.

**Parâmetros de URL:**

| Parâmetro    | Tipo   | Descrição                  |
|--------------|--------|----------------------------|
| `customerId` | number | Identificador do cliente   |
| `id`         | number | Identificador do serviço   |

**Resposta de sucesso:** `204 No Content`

**Respostas de erro:**

| Código | Descrição                |
|--------|--------------------------|
| `404`  | Serviço não encontrado   |

**Comportamento de cascata:**
- Ao eliminar um serviço pai, todos os sub-serviços (`parent_id` = id do serviço eliminado) são automaticamente eliminados.

---

## Exemplos de Utilização

### Criar um serviço principal

```bash
curl -X POST /api/customers/1/services \
  -H "Content-Type: application/json" \
  -d '{
    "acesso": "ACC-020",
    "tarifario": "Fibra Negócio 1Gbps",
    "operadora": "NOS",
    "valor": 89.99,
    "moeda": "EUR",
    "conta": "CT-10001",
    "cvp": "CVP-2010",
    "data_fim": "2027-01-01",
    "num_client": "NC-5001",
    "num_servico": "NS-9010",
    "observacoes": "Instalação agendada"
  }'
```

### Criar um sub-serviço

```bash
curl -X POST /api/customers/1/services \
  -H "Content-Type: application/json" \
  -d '{
    "parent_id": 1,
    "acesso": "ACC-001-B",
    "tarifario": "Extensão IP Fixo",
    "operadora": "MEO",
    "valor": 5.00,
    "moeda": "EUR",
    "conta": "CT-10001",
    "cvp": "CVP-2001",
    "data_fim": "2025-01-15",
    "num_client": "NC-5001",
    "num_servico": "NS-9011",
    "observacoes": "IP fixo adicional"
  }'
```

### Listar serviços de um cliente

```bash
curl /api/customers/1/services
```

### Atualizar valor de um serviço

```bash
curl -X PUT /api/customers/1/services/1 \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 49.99,
    "observacoes": "Preço atualizado"
  }'
```

### Eliminar um serviço

```bash
curl -X DELETE /api/customers/1/services/1
```
