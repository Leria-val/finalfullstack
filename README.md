# 🎵 Euphonica - Music School Management

**Euphonica** é uma plataforma completa para a gestão de escolas de música, permitindo o controle de usuários, alunos, turmas, matrículas e lançamentos de notas de forma intuitiva e eficiente.

## 🚀 Funcionalidades

### **Administrador**
* **Gestão de Usuários:** Cadastro e controle de perfis (Admin, Professor, Aluno).
* **Controle Acadêmico:** Criação de turmas e disciplinas.
* **Matrículas:** Vinculação de alunos às turmas existentes.
* **Dashboard:** Visão geral com estatísticas em tempo real.

### **Professor**
* **Minhas Turmas:** Visualização das turmas atribuídas.
* **Lançamento de Notas:** Interface para avaliar o desempenho dos alunos por período.

### **Aluno**
* **Boletim:** Consulta de notas e status acadêmico (Aprovado/Recuperação/Reprovado).

---

## 🛠️ Tecnologias Utilizadas

**Frontend:**
* React.js (Vite)
* React Router DOM (Navegação e Rotas Protegidas)
* Axios (Integração com API)
* Context API (Autenticação)

**Backend:**
* Node.js & Express
* Sequelize ORM (PostgreSQL/MySQL)
* JWT (Autenticação via Token)
* UUID (Identificadores únicos globais)

---

## 📦 Como Instalar y Rodar

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/finalfullstack.git
cd finalfullstack
```

### 2. Configurar o Backend
```bash
cd backend
npm install
```
* Crie um arquivo `.env` na pasta `/backend` com as seguintes variáveis:
```env
DB_NAME=euphonica
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_HOST=localhost
JWT_SECRET=sua_chave_secreta
PORT=3000
```
* Rode as migrações: `npx sequelize-cli db:migrate`
* Inicie o servidor: `npm run dev`

### 3. Configurar o Frontend
```bash
cd ../frontend
npm install
npm run dev
```

---

## 🏗️ Estrutura do Banco de Dados

O projeto utiliza um modelo relacional robusto com as seguintes entidades:
* **Users:** Armazena dados de login e permissões.
* **Students:** Dados específicos dos alunos vinculados a um usuário.
* **Classes:** Informações sobre as turmas e instrumentos.
* **Enrollments:** Tabela de ligação N:N entre Alunos e Turmas.
* **Grades:** Registro de avaliações vinculado à matrícula.

---

## ✒️ Autores

* **Valeria Martinez**  -  * **Leonardo Bellorin** 

---

