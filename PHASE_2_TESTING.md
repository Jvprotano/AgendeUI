# 🧪 Guia de Testes - Fase 2

## 📋 Como Testar

### Pré-requisitos
```bash
npm install
ng serve --open
```

---

## 🧪 Testes de Profissionais

### 1. Acessar Página de Profissionais
- [ ] Navegar para `/company/1/professionals`
- [ ] Página deve carregar com spinner
- [ ] Deve mostrar 2 profissionais de exemplo
- [ ] Grid deve estar responsivo

### 2. Adicionar Profissional
- [ ] Clicar em "Adicionar Profissional"
- [ ] Modal deve abrir com título "Adicionar Profissional"
- [ ] Preencher formulário:
  - Nome: "João Silva"
  - Email: "joao@example.com"
  - Telefone: "(11) 98765-4321"
- [ ] Adicionar especialidades:
  - Selecionar "Corte"
  - Clicar em "+"
  - Selecionar "Barba"
  - Clicar em "+"
- [ ] Clicar em "Adicionar"
- [ ] Toast de sucesso deve aparecer
- [ ] Novo profissional deve aparecer na lista

### 3. Editar Profissional
- [ ] Clicar em botão "Editar" (lápis) em um card
- [ ] Modal deve abrir com título "Editar Profissional"
- [ ] Formulário deve estar pré-preenchido
- [ ] Modificar nome: "João Silva Junior"
- [ ] Clicar em "Atualizar"
- [ ] Toast de sucesso deve aparecer
- [ ] Profissional deve estar atualizado na lista

### 4. Ativar/Desativar Profissional
- [ ] Clicar em botão "Olho" em um card
- [ ] Status deve mudar (Ativo → Inativo ou vice-versa)
- [ ] Card deve ficar com opacidade reduzida se inativo
- [ ] Toast deve informar a ação

### 5. Deletar Profissional
- [ ] Clicar em botão "Deletar" (lixo) em um card
- [ ] Confirmação deve aparecer
- [ ] Clicar em "OK"
- [ ] Toast de sucesso deve aparecer
- [ ] Profissional deve desaparecer da lista

### 6. Validações
- [ ] Tentar adicionar sem preencher nome
  - [ ] Erro deve aparecer: "Nome é obrigatório"
- [ ] Tentar adicionar com nome muito curto
  - [ ] Erro deve aparecer: "Nome deve ter pelo menos 3 caracteres"
- [ ] Tentar adicionar com email inválido
  - [ ] Erro deve aparecer: "Email inválido"
- [ ] Botão "Adicionar" deve estar desabilitado se formulário inválido

---

## 🧪 Testes de Serviços

### 1. Acessar Página de Serviços
- [ ] Navegar para `/company/1/services`
- [ ] Página deve carregar com spinner
- [ ] Deve mostrar 3 serviços de exemplo
- [ ] Grid deve estar responsivo

### 2. Adicionar Serviço
- [ ] Clicar em "Adicionar Serviço"
- [ ] Modal deve abrir com título "Adicionar Serviço"
- [ ] Preencher formulário:
  - Nome: "Corte Premium"
  - Descrição: "Corte profissional com acabamento perfeito"
  - Preço: "75.00"
  - Duração: "45"
  - Ícone: "scissors"
- [ ] Clicar em "Adicionar"
- [ ] Toast de sucesso deve aparecer
- [ ] Novo serviço deve aparecer na lista

### 3. Editar Serviço
- [ ] Clicar em botão "Editar" em um card
- [ ] Modal deve abrir com título "Editar Serviço"
- [ ] Formulário deve estar pré-preenchido
- [ ] Modificar preço: "85.00"
- [ ] Clicar em "Atualizar"
- [ ] Toast de sucesso deve aparecer
- [ ] Serviço deve estar atualizado na lista

### 4. Ativar/Desativar Serviço
- [ ] Clicar em botão "Olho" em um card
- [ ] Status deve mudar (Ativo → Inativo ou vice-versa)
- [ ] Card deve ficar com opacidade reduzida se inativo
- [ ] Toast deve informar a ação

### 5. Deletar Serviço
- [ ] Clicar em botão "Deletar" em um card
- [ ] Confirmação deve aparecer
- [ ] Clicar em "OK"
- [ ] Toast de sucesso deve aparecer
- [ ] Serviço deve desaparecer da lista

### 6. Validações
- [ ] Tentar adicionar sem preencher nome
  - [ ] Erro deve aparecer
- [ ] Tentar adicionar com preço negativo
  - [ ] Erro deve aparecer: "Preço deve ser maior que 0"
- [ ] Tentar adicionar com duração menor que 5
  - [ ] Erro deve aparecer: "Duração deve ser pelo menos 5 minutos"
- [ ] Botão "Adicionar" deve estar desabilitado se formulário inválido

---

## 📱 Testes de Responsividade

### Desktop (1200px+)
- [ ] Grid com 3 colunas
- [ ] Cards em tamanho normal
- [ ] Todos os detalhes visíveis
- [ ] Header com botão ao lado

### Tablet (768px - 1199px)
- [ ] Grid com 2 colunas
- [ ] Cards adaptados
- [ ] Detalhes reduzidos
- [ ] Header com botão em linha separada

### Mobile (<768px)
- [ ] Grid com 1 coluna
- [ ] Cards em layout horizontal
- [ ] Ações em coluna
- [ ] Header com botão em linha separada
- [ ] Tudo otimizado para toque

---

## 🎨 Testes de Design

### Cores
- [ ] Gradiente verde-conci → dark-blue nos headers
- [ ] Cores consistentes com paleta da aplicação
- [ ] Badges com cores apropriadas (verde = ativo, vermelho = inativo)

### Animações
- [ ] Hover effects suaves nos cards
- [ ] Transições suaves ao abrir/fechar modals
- [ ] Spinner ao carregar dados
- [ ] Toasts com animação

### Acessibilidade
- [ ] Labels associados aos inputs
- [ ] Titles nos botões
- [ ] Contraste adequado
- [ ] Teclado navegável

---

## ✅ Checklist Final

- [ ] Todos os testes de profissionais passaram
- [ ] Todos os testes de serviços passaram
- [ ] Responsividade testada em 3 breakpoints
- [ ] Design consistente
- [ ] Sem erros no console
- [ ] Sem warnings
- [ ] Performance adequada
- [ ] Acessibilidade OK

---

## 🐛 Troubleshooting

### Problema: Componentes não aparecem
**Solução**: Verificar se as rotas estão corretas em `company.routes.ts`

### Problema: Modal não abre
**Solução**: Verificar se `NgbModal` está importado

### Problema: Validações não funcionam
**Solução**: Verificar se `ReactiveFormsModule` está importado

### Problema: Estilos não aplicam
**Solução**: Verificar se CSS está no arquivo correto e se `::ng-deep` está sendo usado para estilos globais

---

**Última atualização**: 2025-10-22

