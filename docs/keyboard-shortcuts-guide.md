# ⌨️ Manual de Atalhos de Teclado & Paleta de Comandos — Trex HTTP Client

O **Trex HTTP Client** possui um sistema global, integrado e altamente acessível de atalhos de teclado, projetado para elevar a produtividade dos desenvolvedores permitindo navegar, disparar requisições, gerenciar abas e alternar configurações sem depender do mouse.

---

## 1. Visão Geral da Arquitetura

O sistema de atalhos foi projetado seguindo os princípios de Clean Code, SOLID e 100% Orientação a Objetos:

- **Central Dispatcher (`ShortcutRegistryService`):** Registro centralizado de ações e despachante de eventos globais de teclado com guardas contra concorrência e disparo reentrante.
- **Detecção de Plataforma (`PlatformService`):** Adaptação dinâmica de modificadores para macOS (`⌘`, `⌥`, `⇧`, `⌃`) e Windows/Linux (`Ctrl`, `Alt`, `Shift`, `Win`).
- **Matcher e Canonicalização (`ShortcutMatcherService`):** Normalização de combinações de teclas, suporte a letras maiúsculas/minúsculas, aliases para teclas direcionais e prevenção de digitação em campos de texto (`input`, `textarea`, `contenteditable`, editores CodeMirror) a menos que a ação declare explicitamente `allowInInputs: true`.
- **Prevenção de IME (Composition Events):** Eventos de composição de métodos de entrada internacionais (IME) são ignorados de forma segura para não disparar atalhos acidentalmente durante digitação em outros idiomas.
- **Persistência Local Offline:** Atalhos personalizados são persistidos de forma segura no IndexedDB / LocalStorage através da entidade `SettingsEntity` (`ClientSettings.customShortcuts`).

---

## 2. Paleta de Comandos (`Command Palette`)

A paleta de comandos permite pesquisar e acionar qualquer ação da aplicação digitando seu nome ou descrição:

- **Atalho de Abertura:** `Ctrl + Shift + P` (Linux/Windows) ou `⌘ + Shift + P` (macOS).
- **Busca Rápida:** Filtra comandos em tempo real por título, descrição, categoria ou tecla de atalho.
- **Navegação via Teclado:**
  - `ArrowDown` (↓) / `ArrowUp` (↑): Navega sequencialmente entre os comandos.
  - `Enter`: Executa imediatamente o comando selecionado e fecha a paleta.
  - `Escape`: Cancela e fecha a paleta sem executar nenhuma ação.

---

## 3. Catálogo Oficial de Atalhos

A tabela abaixo relaciona todos os comandos disponíveis organizados por domínio:

### ⚙️ Geral
| Ação | Identificador | Tecla Padrão (Win/Linux) | Tecla Padrão (macOS) | Permitido em Inputs |
| :--- | :--- | :--- | :--- | :---: |
| **Paleta de Comandos** | `open-command-palette` | `Ctrl + Shift + P` | `⌘ + Shift + P` | Sim |
| **Ajuda de Atalhos** | `open-shortcuts-help` | `Ctrl + /` | `⌘ + /` | Não |
| **Configurações** | `open-settings` | `Ctrl + ,` | `⌘ + ,` | Não |
| **Alternar Tema Visual** | `toggle-theme` | `Ctrl + Shift + L` | `⌘ + Shift + L` | Não |
| **Alternar Barra Lateral** | `toggle-sidebar` | `Ctrl + B` | `⌘ + B` | Não |
| **Fechar / Cancelar** | `close-or-cancel` | `Escape` | `Escape` | Sim |

### 🚀 Requisições HTTP
| Ação | Identificador | Tecla Padrão (Win/Linux) | Tecla Padrão (macOS) | Permitido em Inputs |
| :--- | :--- | :--- | :--- | :---: |
| **Enviar Requisição** | `send-request` | `Ctrl + Enter` | `⌘ + Enter` | Sim |
| **Focar Campo de URL** | `focus-url` | `Ctrl + L` | `⌘ + L` | Não |
| **Duplicar Requisição** | `duplicate-request` | `Ctrl + Shift + D` | `⌘ + Shift + D` | Não |
| **Salvar Alterações** | `save-request` | `Ctrl + S` | `⌘ + S` | Sim |
| **Formatar JSON Body** | `format-body` | `Ctrl + Shift + F` | `⌘ + Shift + F` | Sim |
| **Cancelar Requisição** | `cancel-request` | `Escape` | `Escape` | Sim |

### 📑 Gerenciamento de Abas
| Ação | Identificador | Tecla Padrão (Win/Linux) | Tecla Padrão (macOS) | Permitido em Inputs |
| :--- | :--- | :--- | :--- | :---: |
| **Nova Requisição em Branco** | `new-tab` | `Ctrl + Alt + N` | `⌘ + ⌥ + N` | Não |
| **Próxima Aba** | `next-tab` | `Ctrl + Alt + Right` | `⌘ + ⌥ + Right` | Não |
| **Aba Anterior** | `prev-tab` | `Ctrl + Alt + Left` | `⌘ + ⌥ + Left` | Não |
| **Fechar Aba Atual** | `close-tab` | `Ctrl + Alt + W` | `⌘ + ⌥ + W` | Não |
| **Fechar Todas as Abas** | `close-all-tabs` | `Ctrl + Shift + W` | `⌘ + Shift + W` | Não |

### 📁 Coleções
| Ação | Identificador | Tecla Padrão (Win/Linux) | Tecla Padrão (macOS) | Permitido em Inputs |
| :--- | :--- | :--- | :--- | :---: |
| **Buscar / Filtrar Coleções** | `focus-search` | `Ctrl + K` | `⌘ + K` | Não |
| **Nova Coleção** | `new-collection` | `Ctrl + Shift + C` | `⌘ + Shift + C` | Não |

### 🌐 Ambientes e Variáveis
| Ação | Identificador | Tecla Padrão (Win/Linux) | Tecla Padrão (macOS) | Permitido em Inputs |
| :--- | :--- | :--- | :--- | :---: |
| **Gerenciar Ambientes** | `open-env-manager` | `Ctrl + Alt + E` | `⌘ + ⌥ + E` | Não |

### 🎨 Layout e Visualização
| Ação | Identificador | Tecla Padrão (Win/Linux) | Tecla Padrão (macOS) | Permitido em Inputs |
| :--- | :--- | :--- | :--- | :---: |
| **Alternar Orientação (Horizontal/Vertical)** | `toggle-orientation` | `Ctrl + Shift + O` | `⌘ + Shift + O` | Não |
| **Alternar Densidade (Confortável/Compacto)**| `toggle-density` | `Ctrl + Shift + U` | `⌘ + Shift + U` | Não |

---

## 4. Como Personalizar Combinações de Teclas

1. Abra o painel de **Configurações** (`Ctrl + ,` ou clique no ícone de engrenagem).
2. Selecione a aba **Atalhos**.
3. Localize o atalho desejado utilizando o campo de busca ou os filtros por categoria (Geral, Requisições, Abas, etc.).
4. Clique no botão **Alterar**.
5. Pressione a combinação de teclas desejada no teclado físico.
6. Se a combinação já estiver sendo usada por outro comando, um aviso de conflito será exibido na tela indicando qual comando possui a mesma tecla.
7. Clique em **Salvar** para confirmar ou **Cancelar** para descartar.
8. Para voltar ao valor padrão de um comando específico, clique em **Restaurar**.
9. Para restaurar todos os atalhos para os valores de fábrica, clique no botão **Restaurar Padrões** no cabeçalho.

---

## 5. Acessibilidade e Boas Práticas (WCAG 2.1)

- O modal da **Paleta de Comandos** implementa `role="dialog"`, `aria-modal="true"` e rótulos `aria-label`.
- As listas e botões de atalhos possuem indicações claras de foco visível e contraste adequado em todos os temas.
- O foco é automaticamente direcionado ao campo de busca ao abrir a paleta de comandos e retornado ao elemento anterior ao fechar.

