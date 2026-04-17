# 📚 API REST de Gerenciamento de Livros

Uma API REST completa e profissional para gerenciar uma biblioteca de livros com autenticação JWT, validações robustas, filtros avançados, paginação inteligente e testes automatizados 100% cobrindo todas as funcionalidades.

**Tema**: Biblioteca Digital | **Banco**: SQLite | **Framework**: Express.js | **Auth**: JWT

---

## ✨ Funcionalidades

| Funcionalidade | Status | Detalhes |
|---|---|---|
| **CRUD Completo** | ✅ | Criar, ler, atualizar e deletar livros |
| **Autenticação JWT** | ✅ | Proteção de rotas sensíveis com tokens |
| **Filtros Avançados** | ✅ | Gênero, preço min/max, título, autor |
| **Ordenação** | ✅ | Por título, preço, ano, autor, estoque |
| **Paginação** | ✅ | Limite configurável, sem limite de páginas |
| **Validações** | ✅ | Robustas em todos os campos |
| **Status HTTP** | ✅ | 200, 201, 400, 401, 404, 500 |
| **Relacionamentos** | ✅ | JOINs automáticos livros ↔ autores |
| **Estatísticas** | ✅ | Agregações (total, média, min, max) |
| **Testes** | ✅ | 32 testes automatizados com Jest |
| **Dados Iniciais** | ✅ | 21 livros + 13 autores pré-configurados |

---

## 🚀 Quick Start

### 1️⃣ Instalar Dependências

```bash
npm install
```

**Pacotes instalados:**
- `express` - Framework web
- `sqlite3` - Banco de dados
- `jsonwebtoken` - Autenticação JWT
- `cors` - Headers CORS
- `dotenv` - Variáveis de ambiente
- `jest` + `supertest` - Testes automatizados

### 2️⃣ Popular Banco de Dados

```bash
npm run seed
```

**Output esperado:**
```
✅ Conectado ao SQLite
✅ 13 autores inseridos
✅ 21 livros inseridos
✅ Banco de dados populado com sucesso!
```

### 3️⃣ Iniciar Servidor

```bash
npm start
```

**Output esperado:**
```
✅ Conectado ao SQLite
🚀 API Livros rodando em http://localhost:3000
📚 Para gerar token, POST /auth/login
```

### 4️⃣ Testar Tudo

```bash
npm test
```

**Resultado:** 32 testes passando ✅

---

## 🔐 Autenticação JWT

### Obter Token

Toda request para criar, atualizar ou deletar livros requer um token JWT válido.

**Endpoint:** `POST /auth/login`

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBsaXZyb3MuY29tIn0...",
  "usuario": {
    "id": 1,
    "nome": "Admin",
    "email": "admin@livros.com"
  }
}
```

**Validade:** 7 dias

### Usar Token

Adicione o header `Authorization` em rotas protegidas:

```bash
curl -X POST http://localhost:3000/api/livros \
  -H "Authorization: Bearer {seu-token-aqui}" \
  -H "Content-Type: application/json" \
  -d '{"titulo": "...", "autor_nome": "..."}'
```

---

## 📋 Endpoints da API

### 🔒 Autenticação

#### Login (Público)
```http
POST /auth/login
```
**Response:** Token JWT + dados do usuário

---

### 📖 Livros - Leitura (Público)

#### Listar Todos com Filtros

```bash
GET /api/livros
```

**Query Parameters:**

| Parâmetro | Tipo | Descrição | Exemplo |
|---|---|---|---|
| `genero` | string | Filtro exato por gênero | `?genero=Ficção%20Científica` |
| `preco_min` | number | Preço mínimo | `?preco_min=40` |
| `preco_max` | number | Preço máximo | `?preco_max=60` |
| `titulo` | string | Busca parcial no título | `?titulo=1984` |
| `autor` | string | Busca parcial no autor | `?autor=Orwell` |
| `ordem` | string | Campo: `titulo`, `preco`, `ano`, `autor_nome`, `estoque` | `?ordem=preco` |
| `direcao` | string | `asc` ou `desc` | `?direcao=desc` |
| `pagina` | number | Número da página | `?pagina=2` |
| `limite` | number | Itens por página (máx 100) | `?limite=20` |

**Exemplos:**

```bash
# Listar todos (padrão: 10 por página)
curl http://localhost:3000/api/livros

# Filtrar por gênero
curl "http://localhost:3000/api/livros?genero=Ficção%20Científica"

# Filtrar por preço e ordenar
curl "http://localhost:3000/api/livros?preco_min=40&preco_max=60&ordem=preco&direcao=asc"

# Buscar por autor com paginação
curl "http://localhost:3000/api/livros?autor=Asimov&pagina=1&limite=5"
```

**Response:**
```json
{
  "dados": [
    {
      "id": 1,
      "titulo": "1984",
      "autor_id": 1,
      "ano": 1949,
      "genero": "Ficção Científica",
      "preco": 45.90,
      "estoque": 12,
      "descricao": null,
      "autor_nome": "George Orwell"
    }
  ],
  "paginacao": {
    "pagina_atual": 1,
    "itens_por_pagina": 10,
    "total_itens": 8,
    "total_paginas": 1
  }
}
```

---

#### Buscar Livro por ID

```bash
GET /api/livros/:id
```

**Exemplo:**
```bash
curl http://localhost:3000/api/livros/1
```

**Response (200):**
```json
{
  "id": 1,
  "titulo": "O Cortiço",
  "autor_id": 3,
  "ano": 1890,
  "genero": "Realismo",
  "preco": 42.00,
  "estoque": 5,
  "descricao": null,
  "data_criacao": "2026-04-16 10:30:00",
  "autor_nome": "Aluísio Azevedo",
  "autor_pais": "Brasil"
}
```

**Error (404):**
```json
{ "erro": "Livro não encontrado" }
```

---

### 📖 Livros - Escrita (Protegido 🔒)

#### Criar Livro

```bash
POST /api/livros
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "titulo": "Clean Code",
  "autor_nome": "Robert C. Martin",
  "ano": 2008,
  "genero": "Desenvolvimento",
  "preco": 89.90,
  "estoque": 5,
  "descricao": "Um guia para escrever código melhor"
}
```

**Curl:**
```bash
curl -X POST http://localhost:3000/api/livros \
  -H "Authorization: Bearer {seu-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Clean Code",
    "autor_nome": "Robert C. Martin",
    "ano": 2008,
    "genero": "Desenvolvimento",
    "preco": 89.90,
    "estoque": 5
  }'
```

**Response (201):**
```json
{
  "id": 22,
  "titulo": "Clean Code",
  "autor_id": 14,
  "ano": 2008,
  "genero": "Desenvolvimento",
  "preco": 89.90,
  "estoque": 5,
  "descricao": "Um guia para escrever código melhor"
}
```

**Validações:**
- ❌ Título ausente ou < 2 caracteres
- ❌ Autor ausente ou < 2 caracteres
- ❌ Ano < 1000 ou > ano atual
- ❌ Preço ≤ 0
- ❌ Estoque < 0
- ❌ Token inválido/expirado

---

#### Atualizar Livro

```bash
PUT /api/livros/:id
Authorization: Bearer {token}
Content-Type: application/json
```

**Exemplo (atualizar preço):**
```bash
curl -X PUT http://localhost:3000/api/livros/1 \
  -H "Authorization: Bearer {seu-token}" \
  -H "Content-Type: application/json" \
  -d '{ "preco": 50.00 }'
```

**Response (200):**
```json
{
  "id": 1,
  "preco": 50.00
}
```

---

#### Deletar Livro

```bash
DELETE /api/livros/:id
Authorization: Bearer {token}
```

**Exemplo:**
```bash
curl -X DELETE http://localhost:3000/api/livros/22 \
  -H "Authorization: Bearer {seu-token}"
```

**Response (200):**
```json
{
  "mensagem": "Livro removido com sucesso",
  "livro": {
    "id": 22,
    "titulo": "Clean Code",
    "autor_id": 14,
    "ano": 2008,
    "genero": "Desenvolvimento",
    "preco": 89.90,
    "estoque": 5
  }
}
```

---

### 👥 Autores (Público)

#### Listar Todos

```bash
GET /api/autores
```

**Response:**
```json
[
  {
    "id": 1,
    "nome": "George Orwell",
    "pais": "Reino Unido",
    "data_criacao": "2026-04-16 10:30:00",
    "total_livros": 2
  },
  {
    "id": 6,
    "nome": "Isaac Asimov",
    "pais": "EUA",
    "data_criacao": "2026-04-16 10:30:00",
    "total_livros": 3
  }
]
```

---

#### Livros de um Autor

```bash
GET /api/autores/:id/livros
```

**Exemplo:**
```bash
curl http://localhost:3000/api/autores/1/livros
```

**Response:**
```json
[
  {
    "id": 1,
    "titulo": "1984",
    "autor_id": 1,
    "ano": 1949,
    "genero": "Ficção Científica",
    "preco": 45.90,
    "estoque": 12
  },
  {
    "id": 9,
    "titulo": "A Revolução dos Bichos",
    "autor_id": 1,
    "ano": 1945,
    "genero": "Ficção Política",
    "preco": 39.90,
    "estoque": 11
  }
]
```

---

### 📊 Estatísticas (Público)

```bash
GET /api/stats
```

**Response:**
```json
{
  "total_livros": 21,
  "total_autores": 13,
  "preco_medio": 51.48,
  "preco_minimo": 35.50,
  "preco_maximo": 85.00,
  "estoque_total": 253
}
```

---

## 🧪 Testes Automatizados

**32 testes** cobrindo 100% das funcionalidades:

```bash
npm test
```

**Cobertura:**

| Módulo | Testes | Status |
|---|---|---|
| 🔐 Autenticação | 1 | ✅ |
| 📖 GET /livros | 9 | ✅ |
| 📖 GET /livros/:id | 3 | ✅ |
| 📝 POST /livros | 7 | ✅ |
| ✏️ PUT /livros/:id | 5 | ✅ |
| 🗑️ DELETE /livros/:id | 3 | ✅ |
| 👥 Autores | 2 | ✅ |
| 📊 Estatísticas | 1 | ✅ |
| ❌ Erros | 1 | ✅ |
| **TOTAL** | **32** | **✅** |

---

## 📦 Estrutura do Projeto

```
api-produtos/
├── index.js                      # API principal (Express)
├── seed.js                       # Script para popular dados
├── test.js                       # Testes automatizados (Jest)
├── package.json                  # Dependências e scripts
├── .env                          # Variáveis de ambiente
├── livros.db                     # Banco SQLite
├── readme.md                     # Este arquivo
├── Livros.postman_collection.json # Collection Postman
└── node_modules/                 # Dependências instaladas
```

---

## 📊 Banco de Dados

### Tabelas

**autores**
```sql
CREATE TABLE autores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT UNIQUE NOT NULL,
  pais TEXT,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**livros**
```sql
CREATE TABLE livros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  autor_id INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  genero TEXT NOT NULL,
  preco REAL NOT NULL,
  estoque INTEGER NOT NULL,
  descricao TEXT,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (autor_id) REFERENCES autores(id)
)
```

### Dados Iniciais

- **13 Autores**: Brasil, EUA, Reino Unido, França, Israel
- **21 Livros**: Ficção Científica, Romance, Fantasia, Desenvolvimento, etc.
- **Preços**: R$ 35,50 a R$ 85,00
- **Estoque**: 5 a 20 unidades por livro

---

## ✅ Validações

| Campo | Regras | Exemplo Inválido |
|---|---|---|
| **titulo** | Obrigatório, string, ≥ 2 caracteres | `""`, `"A"` |
| **autor_nome** | Obrigatório, string, ≥ 2 caracteres | `""`, `null` |
| **ano** | Obrigatório, 1000 ≤ ano ≤ 2026 | `500`, `2030` |
| **genero** | Obrigatório, string, ≥ 2 caracteres | `""`, `"X"` |
| **preco** | Obrigatório, number > 0 | `-50`, `0` |
| **estoque** | Obrigatório, integer ≥ 0 | `-5`, `3.5` |

---

## 🔄 Fluxo Típico

```
1. POST /auth/login
   ↓ Recebe token
   
2. GET /api/livros?genero=Ficção
   ↓ Lista livros (sem token)
   
3. POST /api/livros (com token)
   ↓ Cria novo livro
   
4. PUT /api/livros/:id (com token)
   ↓ Atualiza livro
   
5. DELETE /api/livros/:id (com token)
   ↓ Deleta livro
```

---

## 🌐 Postman Collection

### Importar Collection

1. Abra o **Postman**
2. Clique em **Import**
3. Selecione `Livros.postman_collection.json`
4. Pronto! Todas as rotas importadas

### Usar Tokens

A collection inclui um **pre-request script** que:
- Executa login automaticamente
- Extrai o token
- Adiciona em todas as rotas protegidas

---

## 🚀 Deploy

### Render.com

```bash
# 1. Faça push para GitHub
git push origin main

# 2. Conecte no Render
# Dashboard → New Web Service → GitHub

# 3. Configure variáveis:
PORT=3000
SECRET_KEY=sua-chave-super-secreta-aqui
NODE_ENV=production

# 4. Deploy automático!
```

**URL:** `https://api-livros-xxx.onrender.com`

### Railway.app

```bash
# 1. Instale CLI
npm install -g @railway/cli

# 2. Conecte
railway link

# 3. Deploy
railway up

# 4. Adicione variáveis no dashboard
```

---

## 🐛 Troubleshooting

| Problema | Solução |
|---|---|
| `Cannot find module 'sqlite3'` | `npm install sqlite3` |
| `EADDRINUSE :::3000` | `PORT=4000 npm start` |
| `Token expirado` | `POST /auth/login` para novo token |
| `Livro não encontrado` | Verifique o ID, use `GET /api/livros` |
| `401 Unauthorized` | Adicione header `Authorization: Bearer {token}` |

---

## 📝 Scripts NPM

```bash
npm start      # Iniciar servidor (porta 3000)
npm run seed   # Popular banco de dados
npm test       # Rodar testes
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Buscar livros caros

```bash
curl "http://localhost:3000/api/livros?preco_min=70&ordem=preco&direcao=desc"
```

### Exemplo 2: Listar fantasias em ordem alfabética

```bash
curl "http://localhost:3000/api/livros?genero=Fantasia&ordem=titulo&direcao=asc"
```

### Exemplo 3: Adicionar novo livro (com token)

```bash
TOKEN="seu-token-aqui"

curl -X POST http://localhost:3000/api/livros \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Dune",
    "autor_nome": "Frank Herbert",
    "ano": 1965,
    "genero": "Ficção Científica",
    "preco": 99.90,
    "estoque": 7
  }'
```

### Exemplo 4: Estatísticas da biblioteca

```bash
curl http://localhost:3000/api/stats | json_pp
```

---

## 📞 Suporte

Para dúvidas:
1. Verifique o [README.md](readme.md) acima
2. Rode `npm test` para validar ambiente
3. Confira as validações esperadas
4. Teste endpoints com curl ou Postman

---

## 📄 Licença

ISC - Use livremente!

#### 1. Listar Livros (Público)

```http
GET /api/livros?genero=Ficção%20Científica&ordem=preco&direcao=asc&pagina=1&limite=10
```

**Query Parameters:**
- `genero` - Filtro por gênero (opcional)
- `preco_min` - Preço mínimo (opcional)
- `preco_max` - Preço máximo (opcional)
- `titulo` - Filtro por título (busca parcial, opcional)
- `autor` - Filtro por autor (busca parcial, opcional)
- `ordem` - Campo para ordenar: `titulo`, `preco`, `ano`, `autor_nome`, `estoque` (padrão: `titulo`)
- `direcao` - `asc` ou `desc` (padrão: `asc`)
- `pagina` - Número da página (padrão: 1)
- `limite` - Itens por página (padrão: 10, máx: 100)

**Response (200):**
```json
{
  "dados": [
    {
      "id": 1,
      "titulo": "1984",
      "autor_id": 1,
      "ano": 1949,
      "genero": "Ficção Científica",
      "preco": 45.90,
      "estoque": 12,
      "descricao": null,
      "data_criacao": "2024-01-15 10:30:00",
      "autor_nome": "George Orwell"
    }
  ],
  "paginacao": {
    "pagina_atual": 1,
    "itens_por_pagina": 10,
    "total_itens": 21,
    "total_paginas": 3
  }
}
```

---

#### 2. Buscar Livro por ID (Público)

```http
GET /api/livros/1
```

**Response (200):**
```json
{
  "id": 1,
  "titulo": "1984",
  "autor_id": 1,
  "ano": 1949,
  "genero": "Ficção Científica",
  "preco": 45.90,
  "estoque": 12,
  "descricao": null,
  "data_criacao": "2024-01-15 10:30:00",
  "autor_nome": "George Orwell",
  "autor_pais": "Reino Unido"
}
```

**Erro (404):**
```json
{
  "erro": "Livro não encontrado"
}
```

---

#### 3. Criar Livro (Protegido - JWT)

```http
POST /api/livros
Authorization: Bearer {token}
Content-Type: application/json

{
  "titulo": "Clean Code",
  "autor_nome": "Robert C. Martin",
  "ano": 2008,
  "genero": "Desenvolvimento",
  "preco": 89.90,
  "estoque": 5,
  "descricao": "Um guia essencial para escrever código melhor"
}
```

**Response (201):**
```json
{
  "id": 22,
  "titulo": "Clean Code",
  "autor_id": 14,
  "ano": 2008,
  "genero": "Desenvolvimento",
  "preco": 89.90,
  "estoque": 5,
  "descricao": "Um guia essencial para escrever código melhor"
}
```

**Erros (400):**
```json
{
  "erro": "Título é obrigatório (mín. 2 caracteres)"
}
```

---

#### 4. Atualizar Livro (Protegido - JWT)

```http
PUT /api/livros/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "preco": 50.00,
  "estoque": 15
}
```

**Response (200):**
```json
{
  "id": 1,
  "preco": 50.00,
  "estoque": 15
}
```

---

#### 5. Deletar Livro (Protegido - JWT)

```http
DELETE /api/livros/1
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "mensagem": "Livro removido com sucesso",
  "livro": {
    "id": 1,
    "titulo": "1984",
    "autor_id": 1,
    "ano": 1949,
    "genero": "Ficção Científica",
    "preco": 45.90,
    "estoque": 12
  }
}
```

---

### 👥 Autores

#### 1. Listar Autores com Total de Livros (Público)

```http
GET /api/autores
```

**Response (200):**
```json
[
  {
    "id": 1,
    "nome": "George Orwell",
    "pais": "Reino Unido",
    "data_criacao": "2024-01-15 10:30:00",
    "total_livros": 2
  },
  {
    "id": 2,
    "nome": "Isaac Asimov",
    "pais": "EUA",
    "data_criacao": "2024-01-15 10:30:00",
    "total_livros": 3
  }
]
```

---

#### 2. Livros de um Autor Específico (Público)

```http
GET /api/autores/1/livros
```

**Response (200):**
```json
[
  {
    "id": 1,
    "titulo": "1984",
    "autor_id": 1,
    "ano": 1949,
    "genero": "Ficção Científica",
    "preco": 45.90,
    "estoque": 12
  },
  {
    "id": 9,
    "titulo": "A Revolução dos Bichos",
    "autor_id": 1,
    "ano": 1945,
    "genero": "Ficção Política",
    "preco": 39.90,
    "estoque": 11
  }
]
```

---

### 📊 Estatísticas

#### Obter Estatísticas Gerais (Público)

```http
GET /api/stats
```

**Response (200):**
```json
{
  "total_livros": 21,
  "total_autores": 13,
  "preco_medio": 51.48,
  "preco_minimo": 35.50,
  "preco_maximo": 85.00,
  "estoque_total": 253
}
```

---

## 🧪 Testes com Postman

### Importar Collection

1. Abra o Postman
2. Clique em **Import**
3. Selecione o arquivo `Livros.postman_collection.json`
4. As rotas estarão prontas para testar!

### Workflow de Testes

1. **Gerar Token:**
   - POST `/auth/login` → Copie o token

2. **Adicionar ao Header:**
   - Selecione a pasta "Rotas Protegidas"
   - Acesse a aba **Pre-request Script**
   - O token será enviado automaticamente

3. **Testar Rotas:**
   - Listar, buscar, criar, atualizar, deletar

---

## 🔍 Exemplos de Uso

### Exemplo 1: Filtrar por Preço e Ordenar

```bash
curl "http://localhost:3000/api/livros?preco_min=40&preco_max=60&ordem=preco&direcao=asc&limite=5"
```

### Exemplo 2: Buscar por Gênero com Paginação

```bash
curl "http://localhost:3000/api/livros?genero=Romance&pagina=2&limite=5"
```

### Exemplo 3: Criar Livro com JWT

```bash
curl -X POST http://localhost:3000/api/livros \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Padrões de Design",
    "autor_nome": "Gang of Four",
    "ano": 1994,
    "genero": "Programação",
    "preco": 120.00,
    "estoque": 3
  }'
```

### Exemplo 4: Atualizar Preço de um Livro

```bash
curl -X PUT http://localhost:3000/api/livros/5 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "preco": 42.00
  }'
```

### Exemplo 5: Deletar Livro

```bash
curl -X DELETE http://localhost:3000/api/livros/15 \
  -H "Authorization: Bearer {token}"
```

---

## 📊 Banco de Dados

### Estrutura

**Tabela: autores**
```sql
CREATE TABLE autores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT UNIQUE NOT NULL,
  pais TEXT,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Tabela: livros**
```sql
CREATE TABLE livros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  autor_id INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  genero TEXT NOT NULL,
  preco REAL NOT NULL,
  estoque INTEGER NOT NULL,
  descricao TEXT,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (autor_id) REFERENCES autores(id)
)
```

### Dados Iniciais

- 21 livros variados
- 13 autores nacionais e internacionais
- Preços entre R$ 35,50 e R$ 85,00
- Estoque variado (5-20 unidades)

---

## ✅ Validações Implementadas

| Campo | Validação |
|-------|-----------|
| **titulo** | Obrigatório, string, mín. 2 caracteres |
| **autor_nome** | Obrigatório, string, mín. 2 caracteres |
| **ano** | Obrigatório, número, entre 1000 e ano atual |
| **genero** | Obrigatório, string, mín. 2 caracteres |
| **preco** | Obrigatório, número positivo |
| **estoque** | Obrigatório, inteiro, não negativo |
| **ID** | Numérico válido |

---

## 🌐 Deploy

### Render.com

1. Crie uma conta em https://render.com
2. Conecte seu repositório Git
3. Configure variáveis de ambiente:
   - `SECRET_KEY` - Chave JWT segura
   - `NODE_ENV` - "production"
4. Deploy automático!

**URL Sugerida:** `https://api-livros-xxx.onrender.com`

### Railway.app

1. Crie uma conta em https://railway.app
2. Crie novo projeto
3. Conecte repositório GitHub
4. Adicione variáveis no dashboard
5. Deploy em um clique

**URL Sugerida:** `https://api-livros-prod.up.railway.app`

### Configuração Production

```env
PORT=3000
SECRET_KEY=use-uma-chave-forte-aleatorea-aqui
NODE_ENV=production
```

---

## 📝 Notas

- O banco de dados SQLite é criado automaticamente no primeiro start
- 20+ livros são inseridos automaticamente na primeira execução
- Tokens JWT expiram em 7 dias
- Limite máximo de itens por página: 100
- Todas as respostas incluem headers CORS

---

## 👨‍💻 Desenvolvimento

### Estrutura do Projeto

```
api-produtos/
├── index.js                           # API principal
├── livros.db                          # Banco SQLite
├── .env                               # Variáveis de ambiente
├── package.json                       # Dependências
├── README.md                          # Documentação
├── Livros.postman_collection.json     # Collection Postman
└── test.js                            # Testes automatizados
```

### Scripts Disponíveis

```bash
npm start          # Iniciar servidor
npm test           # Executar testes
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'sqlite3'"

```bash
npm install sqlite3 --save
```

### Erro: "EADDRINUSE: address already in use :::3000"

A porta 3000 já está em uso. Mude:

```bash
PORT=4000 npm start
```

### Erro de Token JWT

- Verifique se o token foi copiado corretamente
- Verifique se expirou (7 dias)
- Gere um novo token com `/auth/login`

---

## 📄 Licença

ISC

---

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Documentação acima
2. Collection Postman (exemplos práticos)
3. Logs do console do servidor