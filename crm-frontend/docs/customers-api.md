# API de Clientes

Documentação dos endpoints REST para gestão de clientes.

---

## Modelo: Customer

| Campo        | Tipo     | Obrigatório | Descrição                                                  |
|--------------|----------|-------------|------------------------------------------------------------|
| `id`         | number   | auto        | Identificador único do cliente (gerado automaticamente)    |
| `name`       | string   | sim         | Nome completo do cliente                                   |
| `email`      | string   | sim         | Endereço de email                                          |
| `phone`      | string   | sim         | Número de telefone                                         |
| `company`    | string   | sim         | Empresa associada                                          |
| `status`     | enum     | sim         | Estado do cliente — valores possíveis: `active`, `inactive`|
| `created_at` | datetime | auto        | Data de criação (gerada automaticamente, formato ISO 8601) |

### Enum: Status

| Valor      | Descrição          |
|------------|--------------------|
| `active`   | Cliente ativo      |
| `inactive` | Cliente inativo    |

---

## Endpoints

### 1. Listar todos os clientes

```
GET /api/customers
```

Retorna todos os clientes registados no sistema.

**Resposta de sucesso:** `200 OK`

```json
[
  {
    "id": 1,
    "name": "John Smith",
    "email": "john.smith@example.com",
    "phone": "+351 912 345 678",
    "company": "TechCorp",
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "name": "Sarah Johnson",
    "email": "sarah.j@example.com",
    "phone": "+351 923 456 789",
    "company": "DesignHub",
    "status": "active",
    "created_at": "2024-02-20T14:15:00Z"
  }
]
```

---

### 2. Obter um cliente

```
GET /api/customers/:id
```

Retorna os detalhes de um cliente específico.

**Parâmetros de URL:**

| Parâmetro | Tipo   | Descrição                  |
|-----------|--------|----------------------------|
| `id`      | number | Identificador do cliente   |

**Resposta de sucesso:** `200 OK`

```json
{
  "id": 1,
  "name": "John Smith",
  "email": "john.smith@example.com",
  "phone": "+351 912 345 678",
  "company": "TechCorp",
  "status": "active",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Respostas de erro:**

| Código | Descrição                |
|--------|--------------------------|
| `404`  | Cliente não encontrado   |

---

### 3. Criar um cliente

```
POST /api/customers
```

Cria um novo cliente no sistema.

**Corpo do pedido:**

```json
{
  "name": "Maria Silva",
  "email": "maria.silva@example.com",
  "phone": "+351 934 567 890",
  "company": "SoluçõesPT",
  "status": "active"
}
```

**Campos obrigatórios:** `name`, `email`, `phone`, `company`, `status`

**Resposta de sucesso:** `201 Created`

```json
{
  "id": 16,
  "name": "Maria Silva",
  "email": "maria.silva@example.com",
  "phone": "+351 934 567 890",
  "company": "SoluçõesPT",
  "status": "active",
  "created_at": "2026-01-30T12:00:00Z"
}
```

**Respostas de erro:**

| Código | Descrição                                   |
|--------|---------------------------------------------|
| `400`  | Dados inválidos (campo obrigatório em falta)|

---

### 4. Atualizar um cliente

```
PUT /api/customers/:id
```

Atualiza os dados de um cliente existente. Todos os campos enviados serão atualizados (atualização parcial suportada).

**Parâmetros de URL:**

| Parâmetro | Tipo   | Descrição                  |
|-----------|--------|----------------------------|
| `id`      | number | Identificador do cliente   |

**Corpo do pedido (parcial — apenas campos a atualizar):**

```json
{
  "phone": "+351 961 234 567",
  "status": "inactive"
}
```

**Resposta de sucesso:** `200 OK`

```json
{
  "id": 1,
  "name": "John Smith",
  "email": "john.smith@example.com",
  "phone": "+351 961 234 567",
  "company": "TechCorp",
  "status": "inactive",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Respostas de erro:**

| Código | Descrição                |
|--------|--------------------------|
| `400`  | Dados inválidos          |
| `404`  | Cliente não encontrado   |

---

### 5. Eliminar um cliente

```
DELETE /api/customers/:id
```

Elimina um cliente do sistema.

**Parâmetros de URL:**

| Parâmetro | Tipo   | Descrição                  |
|-----------|--------|----------------------------|
| `id`      | number | Identificador do cliente   |

**Resposta de sucesso:** `204 No Content`

**Respostas de erro:**

| Código | Descrição                |
|--------|--------------------------|
| `404`  | Cliente não encontrado   |

---

## Exemplos de Utilização

### Listar todos os clientes

```bash
curl /api/customers
```

### Obter um cliente específico

```bash
curl /api/customers/1
```

### Criar um novo cliente

```bash
curl -X POST /api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Silva",
    "email": "maria.silva@example.com",
    "phone": "+351 934 567 890",
    "company": "SoluçõesPT",
    "status": "active"
  }'
```

### Atualizar um cliente

```bash
curl -X PUT /api/customers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+351 961 234 567",
    "status": "inactive"
  }'
```

### Eliminar um cliente

```bash
curl -X DELETE /api/customers/1
```
