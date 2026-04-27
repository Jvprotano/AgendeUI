# Guia de Testes - Correções Implementadas

## 🧪 Como Testar as Correções

### Pré-requisitos
```bash
npm install
ng serve --open
```

---

## 1️⃣ Teste do Layout do Calendário

### Desktop (1200px+)
- [ ] Acessar `/company/schedule`
- [ ] Verificar se o calendário respeita o espaço do sidebar
- [ ] Calendário não deve sobrepor o sidebar
- [ ] Sidebar deve estar visível ao lado do calendário

### Mobile (<768px)
- [ ] Redimensionar para mobile
- [ ] Verificar se o carrossel de dias aparece
- [ ] Sidebar deve estar oculto

---

## 2️⃣ Teste da Visualização de Dia

### Desktop
- [ ] Clicar em um dia no calendário
- [ ] Deve abrir modal com eventos do dia
- [ ] Modal deve mostrar lista de eventos
- [ ] Deve haver botão "Novo Agendamento"
- [ ] Clicar em um evento deve abrir detalhes
- [ ] Clicar em "Novo Agendamento" deve abrir modal de criação

### Mobile
- [ ] Clicar em um dia no carrossel
- [ ] Deve abrir OffCanvas com eventos do dia
- [ ] Deve haver botão "+" para novo agendamento

---

## 3️⃣ Teste dos Modais Padronizados

### Verificar Estilo
- [ ] Header com gradiente verde-conci → dark-blue
- [ ] Título em tamanho 1.5rem
- [ ] Footer com background cinza
- [ ] Botão X visível e funcional
- [ ] Espaçamento consistente

### Modais a Testar
- [ ] Modal de detalhes do agendamento
- [ ] Modal de criação de agendamento
- [ ] Modal de visualização do dia

---

## 4️⃣ Teste do Calendário Mobile

### Carrossel de Dias
- [ ] Redimensionar para mobile (<768px)
- [ ] Deve aparecer carrossel com 5 dias
- [ ] Hoje deve estar pré-selecionado (com gradiente)
- [ ] Clicar em outro dia deve mudar seleção
- [ ] Deve mostrar contagem de eventos por dia
- [ ] Carrossel deve ser arrastável

### Eventos do Dia
- [ ] Clicar em um dia deve mostrar eventos
- [ ] Eventos devem aparecer em OffCanvas
- [ ] Deve haver botão "+" para novo agendamento

---

## 5️⃣ Teste do OffCanvas

### Verificar X de Fechamento
- [ ] OffCanvas deve ter X visível no header
- [ ] X deve estar alinhado à direita
- [ ] Clicar em X deve fechar o OffCanvas

### Animação
- [ ] OffCanvas deve deslizar de baixo para cima
- [ ] Overlay deve aparecer suavemente
- [ ] Fechamento deve ser suave
- [ ] Background não deve sair antes do conteúdo

---

## 6️⃣ Teste da Navegação Mobile

### Menu Hamburger
- [ ] Redimensionar para mobile
- [ ] Abrir menu hamburger
- [ ] Deve aparecer link "Acessar Negócio" (se logado)
- [ ] Link deve estar separado com borda superior
- [ ] Clicar deve levar para `/user/companies`

---

## 7️⃣ Teste do Botão de Adicionar Empresa

### Página de Empresas
- [ ] Acessar `/user/companies`
- [ ] Deve aparecer botão "Adicionar Empresa" no header
- [ ] Botão deve estar ao lado do título
- [ ] Não deve haver card com borda tracejada
- [ ] Clicar no botão deve abrir modal de criação

### Responsividade
- [ ] Desktop: Botão ao lado do título
- [ ] Mobile: Botão em linha separada abaixo do título

---

## 8️⃣ Teste do Step Indicator e Checkbox

### Modal de Criar Empresa
- [ ] Acessar modal de criar empresa
- [ ] Verificar step indicator no header
- [ ] Step deve estar destacado corretamente

### Horários de Funcionamento
- [ ] Ir para passo 2 (Horários)
- [ ] Verificar checkboxes dos dias
- [ ] Marcar segunda-feira deve mostrar inputs de hora
- [ ] Desmarcar deve ocultar inputs
- [ ] Checkbox deve estar correto (não invertido)

---

## 9️⃣ Teste da URL de Compartilhamento

### Pré-preenchimento
- [ ] Abrir modal de criar empresa
- [ ] Preencher nome: "Meu Salão"
- [ ] Ir para passo 3 (Finalizar)
- [ ] Campo "Url de compartilhamento" deve estar pré-preenchido
- [ ] Deve conter: "meu-salao"
- [ ] Testar com outros nomes:
  - "Salão de Beleza" → "salao-de-beleza"
  - "Dr. João Silva" → "dr-joao-silva"

---

## 📋 Checklist Final

### Funcionalidade
- [ ] Calendário respeita sidebar
- [ ] Day view modal funciona
- [ ] Modais padronizados
- [ ] Carrossel mobile funciona
- [ ] OffCanvas fecha corretamente
- [ ] Menu mobile tem link de negócio
- [ ] Botão de adicionar empresa funciona
- [ ] Checkbox funciona corretamente
- [ ] URL pré-preenchida

### Design
- [ ] Cores consistentes
- [ ] Espaçamento uniforme
- [ ] Animações suaves
- [ ] Responsividade perfeita

### Performance
- [ ] Sem erros no console
- [ ] Sem warnings
- [ ] Carregamento rápido
- [ ] Animações suaves

---

## 🐛 Troubleshooting

### Problema: Calendário sobrepõe sidebar
**Solução**: Verificar se `min-width: 0` está em `.schedule-content`

### Problema: X do OffCanvas não aparece
**Solução**: Verificar se `btn-close-custom` está no HTML

### Problema: Carrossel não aparece no mobile
**Solução**: Verificar se `isMobile` está true (< 768px)

### Problema: URL não pré-preenchida
**Solução**: Verificar se `prefillUrlFromCompanyName()` é chamado em `ngOnInit`

---

**Última atualização**: 2025-10-22

