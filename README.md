# 🐔 Controle de Caixa — Granja

Um aplicativo simples e leve para **controle de caixa de uma granja**, desenvolvido para facilitar o registro e acompanhamento das movimentações financeiras do dia a dia.

O sistema funciona diretamente pelo navegador e pode ser instalado no celular como um **aplicativo (PWA)**, tanto no Android quanto no iPhone.

## 📱 Principais características

- 💰 Registro de entradas e saídas
- 📊 Relatórios financeiros
- 🏷️ Organização de gastos por categoria
- 📅 Acompanhamento das movimentações
- 💾 Dados armazenados localmente no próprio dispositivo
- 📶 Pode funcionar sem internet depois de instalado
- 📲 Pode ser instalado como aplicativo
- 🤖 Compatível com Android
- 🍎 Compatível com iPhone

## 🔒 Armazenamento dos dados

Os dados cadastrados no aplicativo são armazenados **localmente no próprio celular**, utilizando o armazenamento do navegador (`localStorage`).

Isso significa que os dados não são enviados para um servidor ou banco de dados externo.

### ⚠️ Importante

Como os dados ficam armazenados no dispositivo, é importante fazer **backups periódicos** caso os registros sejam importantes.

Se os dados do navegador forem apagados, o armazenamento do site também poderá ser apagado.

Recomenda-se realizar um backup pelo menos **uma vez por mês**.

---

# 📲 Como instalar

O aplicativo é uma **PWA (Progressive Web App)**. Não é necessário baixar pela Play Store ou App Store.

## 🤖 Android

A instalação pode ser feita pelo **Google Chrome**.

1. Abra o site do aplicativo no Chrome.
2. Acesse a página principal do aplicativo.
3. Toque nos **três pontos (⋮)** no canto superior direito.
4. Procure por **"Adicionar à tela inicial"** ou **"Instalar aplicativo"**.
5. Toque em **"Instalar"** ou confirme a adição.
6. O ícone do aplicativo aparecerá na tela inicial.

Depois disso, basta tocar no ícone para abrir o aplicativo como um app normal.

### 💡 Dica

Dependendo da versão do Android e do Chrome, a opção pode aparecer como:

- `Instalar aplicativo`
- `Adicionar à tela inicial`
- `Instalar`

---

## 🍎 iPhone

No iPhone, a instalação deve ser feita pelo **Safari**.

1. Abra o site do aplicativo no **Safari**.
2. Acesse a página principal do aplicativo.
3. Toque no botão **Compartilhar**  
   (ícone de um quadrado com uma seta para cima).
4. Role o menu para baixo.
5. Toque em **"Adicionar à Tela de Início"**.
6. Escolha o nome que deseja para o aplicativo.
7. Toque em **"Adicionar"**.

O ícone aparecerá na tela inicial do iPhone.

Depois, basta tocar no ícone para abrir o aplicativo.

> ⚠️ No iPhone, utilize o **Safari** para fazer a instalação da PWA. Outros navegadores podem não apresentar a opção de adicionar o aplicativo à tela de início da mesma maneira.

---

# 💻 Também funciona no computador

O aplicativo também pode ser utilizado diretamente pelo navegador em computadores.

Dependendo do navegador, também é possível instalar a PWA no computador.

---

# 🛠️ Tecnologias

O projeto utiliza tecnologias web simples:

- HTML
- CSS
- JavaScript
- PWA
- LocalStorage

Não é necessário instalar um aplicativo tradicional para utilizar o sistema.

---

# 🌐 Funcionamento

O aplicativo foi desenvolvido para ser simples e funcionar diretamente no dispositivo do usuário.

```text
                    ┌─────────────────┐
                    │   Aplicativo    │
                    │     Granja      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   LocalStorage  │
                    │   do dispositivo│
                    └─────────────────┘
