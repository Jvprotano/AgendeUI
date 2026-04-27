# Guia de Testes - Melhorias Implementadas

## 🧪 Como Testar as Melhorias

### Pré-requisitos
```bash
npm install
ng serve --open
```

---

## 1️⃣ Teste do Menu Superior (Header)

### Desktop (1200px+)
- [ ] Verificar alinhamento dos botões no lado direito
- [ ] Verificar logo e ícone no lado esquerdo
- [ ] Verificar seletor de idioma
- [ ] Verificar botão de login/logout
- [ ] Testar hover effects nos links

### Mobile (< 768px)
- [ ] Verificar menu colapsado
- [ ] Verificar ícone de menu hamburger
- [ ] Verificar botões alinhados corretamente
- [ ] Testar responsividade ao redimensionar

---

## 2️⃣ Teste dos Cards de Empresas

### Funcionalidade
- [ ] Acessar página de empresas (`/user/companies`)
- [ ] Verificar cards com border-radius arredondado
- [ ] Testar hover effect (shadow e transform)
- [ ] Clicar no card "Adicionar Empresa"
- [ ] Verificar modal de criação abre

### Responsividade
- [ ] Desktop: 3-4 cards por linha
- [ ] Tablet: 2 cards por linha
- [ ] Mobile: 1 card por linha
- [ ] Verificar espaçamento em todos os tamanhos

---

## 3️⃣ Teste do Modal de Adicionar Empresa

### Passo 1: Informações Básicas
- [ ] Preencher nome da empresa
- [ ] Preencher email
- [ ] Preencher CNPJ (opcional)
- [ ] Fazer upload de imagem
- [ ] Clicar "Próximo"

### Passo 2: Horários
- [ ] Verificar checkboxes dos dias da semana
- [ ] Selecionar dias (segunda a sexta por padrão)
- [ ] Preencher horários de abertura e fechamento
- [ ] Verificar animação de slide dos inputs
- [ ] Clicar "Próximo"

### Passo 3: Finalizar
- [ ] Preencher website (opcional)
- [ ] Preencher Instagram (opcional)
- [ ] Preencher descrição
- [ ] Clicar "Salvar Empresa"

### Responsividade
- [ ] Desktop: Modal com 3 passos visíveis
- [ ] Tablet: Modal adaptado
- [ ] Mobile: Modal em tela cheia

---

## 4️⃣ Teste do Calendário Customizado

### Funcionalidade
- [ ] Acessar página de agendamentos (`/company/schedule`)
- [ ] Verificar calendário exibindo mês atual
- [ ] Clicar em "Próximo" para ir ao próximo mês
- [ ] Clicar em "Anterior" para voltar ao mês anterior
- [ ] Clicar em "Hoje" para voltar ao mês atual
- [ ] Verificar dia atual destacado

### Eventos
- [ ] Verificar eventos exibidos no calendário
- [ ] Clicar em um evento para visualizar detalhes
- [ ] Verificar cores dos eventos

### Idiomas
- [ ] Verificar nomes dos meses em português
- [ ] Verificar nomes dos dias da semana

### Responsividade
- [ ] Desktop: Calendário completo com sidebar
- [ ] Tablet: Calendário adaptado
- [ ] Mobile: Calendário em tela cheia

---

## 5️⃣ Teste dos Modais de Eventos

### Desktop (Modal)
- [ ] Clicar em uma data no calendário
- [ ] Verificar modal de criação abre
- [ ] Preencher dados do evento
- [ ] Clicar "Salvar"
- [ ] Clicar em um evento existente
- [ ] Verificar modal de detalhes abre
- [ ] Clicar "Editar"
- [ ] Clicar "Deletar"

### Mobile (OffCanvas)
- [ ] Redimensionar para mobile (< 768px)
- [ ] Verificar FAB (Floating Action Button) aparece
- [ ] Clicar no FAB
- [ ] Verificar OffCanvas abre de baixo
- [ ] Preencher dados do evento
- [ ] Clicar "Salvar"
- [ ] Clicar em um evento
- [ ] Verificar OffCanvas em modo "view"
- [ ] Clicar "Editar"
- [ ] Clicar "Deletar"

### Responsividade
- [ ] Desktop: Modal centralizado
- [ ] Mobile: OffCanvas em tela cheia
- [ ] Verificar transições suaves

---

## 🔍 Testes de Responsividade

### Breakpoints a Testar
```
- 1920px (Desktop Grande)
- 1200px (Desktop)
- 992px (Tablet Grande)
- 768px (Tablet)
- 480px (Mobile)
- 320px (Mobile Pequeno)
```

### Ferramentas
```bash
# Chrome DevTools
F12 -> Toggle device toolbar (Ctrl+Shift+M)

# Firefox DevTools
F12 -> Responsive Design Mode (Ctrl+Shift+M)
```

---

## 📋 Checklist Final

### Funcionalidade
- [ ] Menu funciona em desktop e mobile
- [ ] Cards de empresas responsivos
- [ ] Modal de empresa funciona
- [ ] Calendário exibe eventos
- [ ] Modais/OffCanvas funcionam

### Design
- [ ] Cores consistentes
- [ ] Espaçamento uniforme
- [ ] Hover effects suaves
- [ ] Transições animadas

### Responsividade
- [ ] Desktop: 1200px+
- [ ] Tablet: 768px-1199px
- [ ] Mobile: < 768px
- [ ] Sem scroll horizontal

### Performance
- [ ] Sem erros no console
- [ ] Sem warnings
- [ ] Carregamento rápido
- [ ] Animações suaves

---

## 🐛 Troubleshooting

### Problema: Modal não abre
**Solução**: Verificar se NgbModal está importado em schedule.component.ts

### Problema: OffCanvas não aparece
**Solução**: Verificar se isMobile está true (< 768px)

### Problema: Calendário não exibe eventos
**Solução**: Verificar se events array tem dados

### Problema: Estilos não aplicados
**Solução**: Limpar cache do navegador (Ctrl+Shift+Delete)

---

## 📞 Suporte

Para reportar bugs ou sugerir melhorias, abra uma issue no repositório.

---

**Última atualização**: 2025-10-22

