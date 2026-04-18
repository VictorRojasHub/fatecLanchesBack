# Documentação básica dos endpoints (exemplos com Fastify)

Este arquivo descreve os endpoints existentes na API e mostra exemplos de como documentá-los/registrá-los com Fastify (incluindo schemas para gerar Swagger/OpenAPI).

Base URLs (exemplos)
- Local: `http://localhost:3000`
- Produção (Render/ngrok/etc): `https://seu-host.aqui`

Prefixos observados no projeto atual
- Rotas de usuário: `/usuarios`
- Rotas de produtos: `/api/produtos`

Endpoints

1) Registrar usuário
- Método: `POST`
- URL: `/usuarios/registrar`
- Body (JSON):
  - `nome` (string)
  - `email` (string)
  - `senha` (string)
- Exemplo de request body:
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "senha123"
}
```
- Resposta esperada: `201 Created` com JSON `{ "mensagem": "Usuário criado" }`

2) Login (obter JWT)
- Método: `POST`
- URL: `/usuarios/login`
- Body (JSON):
  - `email` (string)
  - `senha` (string)
- Exemplo de response esperado:
```json
{
  "token": "<JWT_TOKEN_AQUI>"
}
```

3) Listar produtos
- Método: `GET`
- URL: `/api/produtos`
- Query params opcionais:
  - `categoria` (string) — filtra por categoria (ex.: `Lanche`, `Bebida`, `Acompanhamento`)
  - `ordem` (string) — `asc` (padrão) ou `desc` para ordenar pelo preço
- Resposta: `200 OK` com array de produtos

4) Criar produto (protegido por JWT)
- Método: `POST`
- URL: `/api/produtos`
- Headers:
  - `Authorization: Bearer <TOKEN>`
- Body (JSON): campos do modelo `Produto`:
  - `nome` (string, required)
  - `descricao` (string)
  - `preco` (number, required)
  - `imagemUrl` (string)
  - `disponivel` (boolean)
  - `categoria` (enum: `Lanche`, `Bebida`, `Acompanhamento`)
- Resposta: `201 Created` com o objeto criado


Como documentar e expor via Fastify (exemplo mínimo)

1) Instalação (no seu projeto atual):

```bash
npm install fastify @fastify/swagger @fastify/swagger-ui
```

2) Exemplo de servidor Fastify com Swagger e as rotas documentadas (arquivo de exemplo `fastify_docs_example.js`):

```javascript
// fastify_docs_example.js
const Fastify = require('fastify');
const fastify = Fastify({ logger: true });

// Plugin Swagger/OpenAPI
fastify.register(require('@fastify/swagger'), {
  openapi: { info: { title: 'FatecLanches API', version: '1.0.0' } }
});
fastify.register(require('@fastify/swagger-ui'), {
  routePrefix: '/docs', // caminho onde a UI ficará disponível
  uiConfig: { docExpansion: 'list' }
});

// Schema exemplo para POST /usuarios/registrar
const registrarSchema = {
  body: {
    type: 'object',
    required: ['nome', 'email', 'senha'],
    properties: {
      nome: { type: 'string' },
      email: { type: 'string' },
      senha: { type: 'string' }
    }
  },
  response: {
    201: { type: 'object', properties: { mensagem: { type: 'string' } } }
  }
};

fastify.post('/usuarios/registrar', { schema: registrarSchema }, async (request, reply) => {
  // aqui você chamaria a lógica existente (controller)
  return reply.code(201).send({ mensagem: 'Usuário criado' });
});

// Schema exemplo para POST /usuarios/login
const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'senha'],
    properties: { email: { type: 'string' }, senha: { type: 'string' } }
  },
  response: { 200: { type: 'object', properties: { token: { type: 'string' } } } }
};

fastify.post('/usuarios/login', { schema: loginSchema }, async (request) => {
  // lógica: validar usuário e retornar token
  return { token: 'eyJ...exemplo' };
});

// Schema e rota de produtos (GET)
fastify.get('/api/produtos', {
  schema: {
    querystring: {
      type: 'object',
      properties: { categoria: { type: 'string' }, ordem: { type: 'string' } }
    }
  }
}, async (request) => {
  return [];
});

// Inicialização
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    fastify.log.info(`Servidor Fastify rodando`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
```

3) Abrir a documentação gerada

- Rode o exemplo (ou seu servidor Fastify que registrar o plugin):
```bash
node fastify_docs_example.js
```
- Acesse a UI do Swagger em: `http://localhost:3000/docs`

Observações / dicas
- Você não precisa migrar todo o projeto para Fastify para gerar documentação — pode criar um pequeno servidor Fastify apenas para expor a documentação (usando os mesmos schemas), ou integrar o plugin diretamente quando migrar.
- Fastify usa JSON Schema para descrever requests/responses — isso permite gerar OpenAPI automaticamente.
- Se preferir continuar com Express, existem alternativas para gerar Swagger (ex.: `swagger-jsdoc` + `swagger-ui-express`).

Comandos resumidos para instalar dependências necessárias:

```bash
npm install fastify @fastify/swagger @fastify/swagger-ui
```

Se quiser que eu:
- Adicione o arquivo `fastify_docs_example.js` ao repositório com as rotas/documentação já montadas (podemos exportar os schemas diretamente a partir dos controllers existentes),
- Ou gere a documentação Swagger a partir do Express atual (usar `swagger-jsdoc` + `swagger-ui-express`),

me diga qual opção prefere e eu aplico a mudança aqui no repositório.
