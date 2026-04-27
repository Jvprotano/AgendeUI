# Guia de Uso - Novas Funcionalidades

## 🎯 Visão Geral

Este guia descreve como usar as novas funcionalidades implementadas na aplicação Scheduler.

---

## 1. Menu Superior (Header)

### Funcionalidades
- **Logo**: Clique para voltar à home
- **Links de Navegação**: Acesso rápido às principais seções
- **Seletor de Idioma**: Mude entre português, inglês e espanhol
- **Botão de Login**: Acesse sua conta
- **Botão de Logout**: Saia da sua conta

### Comportamento Responsivo
- **Desktop**: Menu completo com todos os elementos visíveis
- **Mobile**: Menu colapsado com ícone hamburger

---

## 2. Página de Empresas

### Visualizar Empresas
1. Acesse `/user/companies`
2. Veja todos os cards de empresas
3. Cada card mostra:
   - Logo da empresa
   - Nome
   - Email
   - Ações (editar, deletar)

### Adicionar Nova Empresa
1. Clique no card "Adicionar Empresa" (com ícone +)
2. Preencha os dados em 3 passos:
   - **Passo 1**: Informações básicas (nome, email, CNPJ, imagem)
   - **Passo 2**: Horários de funcionamento (dias e horários)
   - **Passo 3**: Informações adicionais (website, Instagram, descrição)
3. Clique "Salvar Empresa"

### Editar Empresa
1. Clique no card da empresa
2. Clique em "Editar"
3. Modifique os dados
4. Clique "Salvar"

---

## 3. Calendário de Agendamentos

### Navegação
- **Próximo Mês**: Clique na seta direita
- **Mês Anterior**: Clique na seta esquerda
- **Hoje**: Clique no botão "Hoje" para voltar ao mês atual

### Criar Agendamento
**Desktop:**
1. Clique em uma data no calendário
2. Preencha os dados no modal
3. Clique "Salvar"

**Mobile:**
1. Clique no botão + (FAB) no canto inferior direito
2. Preencha os dados no OffCanvas
3. Clique "Salvar"

### Visualizar Agendamento
1. Clique em um evento no calendário
2. Veja os detalhes do agendamento

### Editar Agendamento
**Desktop:**
1. Clique no evento
2. Clique "Editar" no modal
3. Modifique os dados
4. Clique "Salvar"

**Mobile:**
1. Clique no evento
2. Clique "Editar" no OffCanvas
3. Modifique os dados
4. Clique "Salvar"

### Deletar Agendamento
**Desktop:**
1. Clique no evento
2. Clique "Deletar" no modal
3. Confirme a exclusão

**Mobile:**
1. Clique no evento
2. Clique "Deletar" no OffCanvas
3. Confirme a exclusão

---

## 4. Formulário de Agendamento

### Campos Disponíveis
- **Serviço**: Selecione o tipo de serviço
- **Data**: Escolha a data do agendamento
- **Início**: Hora de início
- **Fim**: Hora de término
- **Descrição**: Detalhes adicionais
- **Cor**: Escolha uma cor para o evento

### Cores Disponíveis
- 🔵 Azul (padrão)
- 🟡 Amarelo
- 🟢 Verde
- 🔴 Vermelho
- 🟣 Roxo

---

## 5. Sidebar de Agendamentos (Desktop)

### Seções
1. **Botão "Novo Agendamento"**: Cria um novo agendamento
2. **Serviços**: Lista de serviços disponíveis
3. **Próximos Agendamentos**: Lista dos 5 próximos agendamentos

### Interações
- Clique em um agendamento para visualizar detalhes
- Clique no botão para criar novo agendamento

---

## 6. Floating Action Button (Mobile)

### Localização
- Canto inferior direito da tela
- Apenas visível em dispositivos mobile (< 768px)

### Funcionalidade
- Clique para criar um novo agendamento
- Abre o OffCanvas com formulário de criação

---

## 7. OffCanvas (Mobile)

### Modos
1. **Criar**: Formulário para novo agendamento
2. **Visualizar**: Detalhes do agendamento
3. **Editar**: Formulário para editar agendamento

### Navegação
- **Fechar**: Clique no X ou fora do OffCanvas
- **Cancelar**: Clique no botão "Cancelar"
- **Salvar**: Clique no botão "Salvar"
- **Editar**: Clique no botão "Editar" (modo visualizar)
- **Deletar**: Clique no botão "Deletar" (modo visualizar)

---

## 8. Responsividade

### Desktop (1200px+)
- Menu completo
- Sidebar visível
- Modais centralizados
- Calendário com espaço total

### Tablet (768px - 1199px)
- Menu adaptado
- Sidebar pode ser oculta
- Modais redimensionados
- Calendário responsivo

### Mobile (< 768px)
- Menu colapsado
- Sidebar oculta
- OffCanvas em tela cheia
- FAB visível
- Calendário otimizado

---

## 9. Dicas e Truques

### Atalhos
- **Ctrl+Shift+M**: Ativar modo responsivo (DevTools)
- **F12**: Abrir DevTools

### Boas Práticas
1. Sempre preencha os campos obrigatórios (*)
2. Verifique os horários antes de salvar
3. Use cores diferentes para serviços diferentes
4. Adicione descrições para melhor organização

### Performance
- Calendário carrega eventos automaticamente
- Sidebar atualiza em tempo real
- Sem necessidade de refresh manual

---

## 10. Troubleshooting

### Agendamento não aparece
- Verifique se a data está correta
- Verifique se o horário está preenchido
- Recarregue a página (F5)

### OffCanvas não abre
- Verifique se está em mobile (< 768px)
- Tente clicar novamente no FAB
- Limpe o cache do navegador

### Cores não aparecem
- Verifique se selecionou uma cor
- Recarregue a página
- Tente outra cor

### Modal não fecha
- Clique no X no canto superior direito
- Clique fora do modal
- Pressione ESC

---

## 📱 Compatibilidade

### Navegadores Suportados
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Dispositivos
- ✅ Desktop (Windows, Mac, Linux)
- ✅ Tablet (iPad, Android)
- ✅ Mobile (iPhone, Android)

---

## 🆘 Suporte

Para dúvidas ou problemas:
1. Consulte este guia
2. Verifique o TESTING_GUIDE.md
3. Abra uma issue no repositório

---

**Última atualização**: 2025-10-22

