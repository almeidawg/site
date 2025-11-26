========================================
🚀 APLICAÇÃO RÁPIDA - WG CRM
========================================

📁 LOCALIZAÇÃO:
C:\Users\Atendimento\Documents\wgeasy\01 . WGeasy Sistema

========================================
⚡ INÍCIO RÁPIDO (3 CLIQUES)
========================================

1️⃣ APLICAR MIGRATIONS:
   → Botão direito em: aplicar_migrations.bat
   → Executar como administrador
   → Aguardar "MIGRATIONS APLICADAS COM SUCESSO!"

2️⃣ VERIFICAR:
   → Duplo clique em: verificar_migrations.bat
   → Verificar mensagens de OK

3️⃣ INICIAR FRONTEND:
   → Abrir terminal
   → cd wg-crm
   → npm run dev

========================================
📋 ORDEM DE EXECUÇÃO
========================================

PASSO 1: Iniciar Docker Desktop
   └─ Aguardar "Engine running"

PASSO 2: Executar aplicar_migrations.bat
   └─ Como administrador

PASSO 3: Executar verificar_migrations.bat
   └─ Verificar se tudo OK

PASSO 4: Atualizar App.jsx
   └─ Contratos → ContratosSupabase

PASSO 5: Iniciar frontend
   └─ cd wg-crm && npm run dev

========================================
🧪 TESTES
========================================

✅ Upload de Avatar:
   Pessoas → Nova Pessoa → Carregar Foto

✅ Criar Contrato:
   Contratos → Novo Contrato → Preencher → Salvar

✅ Aprovar Contrato (AUTOMÁTICO):
   Contratos → Clicar ícone ✓ verde → Confirmar
   → Sistema gera Projeto + Cobranças automaticamente

✅ Rejeitar Contrato:
   Contratos → Clicar ícone ✗ vermelho → Motivo → Confirmar

========================================
📄 DOCUMENTAÇÃO
========================================

📘 PASSO_A_PASSO_APLICAR.md
   → Guia completo ilustrado

📘 INSTRUCOES_IMPLEMENTACAO_CONTRATOS.md
   → Documentação técnica detalhada

📘 APLICAR_AGORA.md
   → Guia rápido de aplicação

========================================
❓ PROBLEMAS COMUNS
========================================

❌ "Docker não está rodando"
   → Iniciar Docker Desktop
   → Aguardar completar
   → Tentar novamente

❌ "Erro ao aplicar migration"
   → Verificar: docker ps
   → Verificar: supabase status
   → Tentar método manual

❌ "Função não encontrada"
   → Reaplicar: 20251126151000_funcoes_aprovacao_contratos.sql

❌ "Bucket não existe"
   → Criar manualmente em: http://127.0.0.1:54323
   → Storage → New bucket → avatars

========================================
📞 SUPORTE
========================================

Logs do Supabase:
   docker logs supabase_db_WG -f

Logs do Frontend:
   Console do navegador (F12)

Testar no banco:
   docker exec -it supabase_db_WG psql -U postgres -d postgres

========================================
✅ RESULTADO ESPERADO
========================================

Após aplicação bem-sucedida:

✓ Avatar funciona em cadastros
✓ Contratos podem ser criados
✓ Aprovação gera projeto automaticamente
✓ Aprovação gera cobranças automaticamente
✓ UI mostra status visual (✓/✗/⏰)
✓ Fluxo completo: Contrato → Cronograma → Financeiro

========================================
🎯 PRÓXIMOS PASSOS
========================================

1. Aplicar migrations
2. Testar todas as funcionalidades
3. Validar fluxo automático
4. Deploy em LIVE (quando aprovado)

========================================

Boa sorte! 🚀

Data: 2025-11-26
Versão: 1.0
