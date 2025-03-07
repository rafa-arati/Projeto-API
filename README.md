# 🌟 Sistema de Gerenciamento de Atividades de Voluntariado

## 📋 Descrição
Este projeto implementa um sistema completo para gerenciamento de atividades de voluntariado, com uma API REST usando Node.js no backend e JavaScript puro no frontend. O sistema permite que usuários se cadastrem, visualizem atividades disponíveis e registrem sua participação, enquanto administradores podem gerenciar essas atividades.

## 🛠️ Tecnologias Utilizadas
- **Backend**: Node.js, Express.js
- **Frontend**: JavaScript puro (sem frameworks)
- **Banco de Dados**: RocksDB
- **Autenticação**: JWT (JSON Web Tokens)
- **CSS**: Estilização customizada

## 🔐 Autenticação e Controle de Acesso
O sistema implementa autenticação baseada em JWT, com dois níveis de acesso:

### 👤 Usuário Comum
- Criar conta e fazer login
- Consultar atividades disponíveis
- Inscrever-se em atividades com vagas disponíveis
- Cancelar inscrição (antes do início da atividade)
- Visualizar atividades em que está inscrito

### 👑 Administrador
Além das permissões de usuário comum:
- Criar novas atividades
- Editar atividades existentes
- Excluir atividades
- Visualizar lista de participantes por atividade

## 📝 Gerenciamento de Atividades
Cada atividade contém:
- Título
- Descrição
- Data
- Local
- Número máximo de participantes

O sistema controla automaticamente o número de participantes e impede novas inscrições quando o limite é atingido.

## 🏗️ Estrutura do Projeto
```
PROJETOAPI/
├── db_data/                     # Dados do banco RocksDB
│   ├── activities/              # Dados das atividades
│   ├── users/                   # Dados dos usuários
│   └── userActivities/          # Relação entre usuários e atividades
├── node_modules/
├── public/                      # Frontend - arquivos estáticos
│   ├── js/
│   │   ├── activities.js        # Gerenciamento de atividades no frontend
│   │   ├── api.js               # Cliente para comunicação com a API
│   │   ├── auth.js              # Autenticação no frontend
│   │   ├── main.js              # Inicialização da aplicação
│   │   └── ui.js                # Componentes de interface
│   ├── index.html               # Página principal da aplicação
│   └── styles.css               # Estilos CSS
└── src/                         # Backend
├── controllers/             # Controladores para requisições HTTP
│   ├── userController.js    # Controle de usuários
│   └── activityController.js # Controle de atividades
├── services/                # Lógica de negócio
│   ├── userService.js
│   └── activityService.js
├── repositories/            # Acesso ao banco de dados
│   ├── userRepository.js
│   └── activityRepository.js
├── database/
│   └── db.js                # Conexão com RocksDB
├── middlewares/
│   └── authMiddleware.js    # Middleware de autenticação
├── routes/                  # Rotas da API
│   ├── routes.js
│   ├── userRoutes.js
│   └── activityRoutes.js
└── utils/                   # Utilitários
├── validation.js        # Validação de dados
├── hashPassword.js      # Hash de senhas
├── comparePassword.js   # Comparação de senhas
└── jwtUtils.js          # Utilitários para JWT
```
## 🚀 Como Executar

### Pré-requisitos
- Node.js instalado
- NPM ou Yarn

### Instalação
1. Clone o repositório: 
```git clone [URL_DO_REPOSITÓRIO]```
2. Instale as dependências: 
```npm install```
3. Configure o arquivo .env na raiz do projeto: 
``JWT_SECRET=sua_chave_secreta``,``PORT=3000``
5. Inicie o servidor: 
``npm start``
6. Acesse a aplicação em http://localhost:3000

## 👥 Usuários Padrão
Para facilitar testes, você pode usar:

- **Administrador**:
- Email: admin@example.com
- Senha: (crie uma senha com pelo menos 8 caracteres)

- **Usuário comum**:
- Registre um novo usuário através da interface

## 📱 Funcionalidades da Interface

### Página Inicial
- Login/Registro de usuários
- Visualização de atividades disponíveis

### Área de Usuário
- Lista de atividades disponíveis
- Minhas atividades (atividades em que o usuário está inscrito)
- Botões para inscrição/cancelamento

### Área de Administrador
- Criação de novas atividades
- Edição e exclusão de atividades existentes
- Visualização de participantes por atividade

## 🔒 Validação de Dados
O sistema implementa validação manual para:
- Email válido no cadastro
- Senha com nível mínimo de segurança
- Campos obrigatórios nas atividades
- Prevenção de inscrições duplicadas

## 📜 Licença
Este projeto é para fins educacionais.

## 👨‍💻 Desenvolvedor
Desenvolvido por Rafael Arati

---

📝 *Este sistema foi desenvolvido como parte de um desafio proposto pela Alpha Edtech para demonstrar habilidades em desenvolvimento web com Node.js.*
