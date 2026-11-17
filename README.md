# Nest Microservices

API REST de consulta de usuários desenvolvida para a Unidade Curricular de Programação Web 2.

## 1. Descrição

O projeto demonstra como separar uma API HTTP da lógica de consulta e da persistência. Clientes HTTP, como aplicações web ou ferramentas de teste, consultam os usuários pelo API Gateway. O Users Service executa as consultas em PostgreSQL.

## 2. Funcionalidades

- Listar os usuários em ordem crescente de ID.
- Consultar um usuário pelo ID.
- Validar o ID recebido via HTTP e responder com os códigos de erro correspondentes.
- Encaminhar as consultas ao Users Service por TCP.

## 3. Tecnologias utilizadas

Node.js, TypeScript, NestJS 12, RxJS, Prisma ORM 7, PostgreSQL, Jest e Supertest.

## 4. Arquitetura e organização do projeto

```mermaid
flowchart LR
    Cliente[Cliente HTTP] -->|HTTP| Gateway[API Gateway]
    Gateway -->|TCP| Users[Users Service]
    Users --> Prisma[Prisma]
    Prisma --> DB[(PostgreSQL)]
```

```text
apps/
├── api-gateway/
│   ├── src/             # Rotas HTTP e cliente TCP
│   └── test/            # Testes HTTP
├── users/
│   ├── src/             # Handlers TCP, consultas e conexão com o banco
│   ├── prisma/          # Esquema e migrations
│   └── test/            # Testes TCP
└── nest-microservices/  # Aplicação inicial do monorepo Nest
.env.example
nest-cli.json
prisma.config.ts
```

O gateway usa `ClientProxy.send()` para enviar `users.findAll` e `users.findOne`. O Users Service recebe esses padrões com `@MessagePattern()` e usa o Prisma para consultar o banco.

## 5. Pré-requisitos

- Node.js 24.15 ou superior na série 24, com npm.
- PostgreSQL em execução e um banco vazio para a aplicação.
- Git, se for clonar o repositório.

## 6. Instalação

Abra a pasta do projeto e instale as dependências. Se precisar clonar, use a URL do repositório fornecida com a atividade.

```sh
npm ci
npm run prisma:generate
```

## 7. Variáveis de ambiente

Se já existir um `.env` na raiz, acrescente as variáveis abaixo ao arquivo existente. Para criar o arquivo a partir do exemplo no PowerShell, use `Copy-Item .env.example .env`.

Crie o banco com `CREATE DATABASE nest_users;` no PostgreSQL e ajuste `DATABASE_URL` com as credenciais locais. Se já tiver criado um banco para a atividade, use o nome dele na URL.

| Variável | Uso | Valor no exemplo |
| --- | --- | --- |
| `PORT` | Porta HTTP do API Gateway | `3000` |
| `USERS_HOST` | Endereço TCP usado pelos dois processos locais | `127.0.0.1` |
| `USERS_PORT` | Porta TCP do Users Service | `3001` |
| `DATABASE_URL` | Conexão PostgreSQL do Users Service e do Prisma CLI | `postgresql://postgres:troque_esta_senha@127.0.0.1:5432/nest_users?schema=public` |

O Git ignora o arquivo `.env`, que guarda as credenciais locais.

## 8. Execução do projeto

Aplique a migration ao banco configurado.

```sh
npm run db:migrate
```

Para reproduzir os exemplos em um banco vazio, execute uma vez no PostgreSQL.

```sql
INSERT INTO "User" ("name") VALUES ('Ana'), ('Carlos');
```

Em desenvolvimento, inicie o Users Service e o gateway em terminais separados, na raiz do projeto.

```sh
npm run start:dev -- users
```

```sh
npm run start:dev -- api-gateway
```

O gateway fica disponível em `http://localhost:3000`.

Para rodar a versão compilada, gere o cliente Prisma e compile as duas aplicações.

```sh
npm run prisma:generate
npm run build:services
```

Execute cada processo em um terminal separado.

```sh
node --env-file=.env dist/apps/users/main.js
node --env-file=.env dist/apps/api-gateway/main.js
```

## 9. Endpoints da API

| Método | Caminho | Resposta |
| --- | --- | --- |
| GET | `/` | Resposta padrão do gateway |
| GET | `/users` | Lista de usuários em ordem de ID |
| GET | `/users/:id` | Usuário com o ID informado |

## 10. Exemplos de requisição e resposta

```sh
curl http://localhost:3000/users
```

```json
[
  { "id": 1, "name": "Ana" },
  { "id": 2, "name": "Carlos" }
]
```

```sh
curl http://localhost:3000/users/1
```

```json
{ "id": 1, "name": "Ana" }
```

## 11. Autenticação

As rotas da atividade são públicas.

## 12. Tratamento de erros

| Status HTTP | Situação |
| --- | --- |
| 400 | ID que não representa um inteiro positivo de até 32 bits |
| 404 | Usuário inexistente |
| 500 | Erro interno ao processar a consulta |
| 503 | Falha de conexão TCP com o Users Service |
| 504 | O Users Service excedeu o prazo de resposta de 5 segundos |

```json
{
  "message": "Usuário não encontrado.",
  "error": "Not Found",
  "statusCode": 404
}
```

## 13. Testes

```sh
npm test
npm run test:e2e -- --runInBand
npm run test:cov
```

Os testes cobrem os handlers do Users Service, as consultas via TCP e as respostas HTTP do gateway, incluindo IDs inválidos e inexistentes. Os testes usam dados simulados e dispensam uma instância PostgreSQL.

## 14. Documentação da API

Consulte as seções 9, 10 e 12 para ver rotas, parâmetros, exemplos e códigos HTTP.

## 15. Modelo de dados

```mermaid
erDiagram
    User {
        int id PK
        string name
    }
```

`id` é gerado pelo PostgreSQL. `name` é obrigatório.

## 16. Regras de negócio

- A consulta individual aceita IDs inteiros de `1` a `2147483647`.
- A listagem retorna `[]` quando o banco está vazio.
- Uma consulta por ID inexistente retorna HTTP 404.

## 17. Extras — Programação Web 2

- Testes automatizados exercitam as interfaces HTTP e TCP.
- O gateway limita a espera por cada consulta TCP a cinco segundos.

## 18. Versionamento e organização das branches

O fluxo acadêmico prevê uma branch semanal criada a partir da `main`, no formato `branch_yyyymmdd`. Use commits descritivos e integre a atividade à `main` ao concluir a semana.

## 19. Autor

Eliakim Oliveira · Programação Web 2

## 20. Licença e uso acadêmico

Projeto desenvolvido para avaliação e acompanhamento acadêmico na Unidade Curricular de Programação Web 2 — Senac RJ.

Atualizado em 17 de novembro de 2026.
