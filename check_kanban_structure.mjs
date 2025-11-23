import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ahlqzzkxuutwoepirpzr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NzEyNDMsImV4cCI6MjA3NjE0NzI0M30.gLz5lpB5YlQpTfxzJjmILZwGp_H_XsT81nM2vXDbs7Y';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

console.log('🔍 Verificando estrutura das tabelas Kanban...\n');

// Tentar buscar um registro de cada tabela para ver os campos
const tables = ['kanban_cards', 'kanban_boards', 'kanban_listas', 'kanban_colunas'];

for (const table of tables) {
  console.log(`\n📊 Tabela: ${table}`);
  console.log('='.repeat(50));

  const { data, error } = await supabase
    .from(table)
    .select('*')
    .limit(1);

  if (error) {
    console.log(`❌ Erro: ${error.message}`);
  } else if (data && data.length > 0) {
    console.log('✅ Colunas encontradas:');
    console.log(Object.keys(data[0]).join(', '));
    console.log('\n📝 Exemplo de registro:');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('⚠️  Tabela vazia (sem registros)');
    console.log('💡 Tentando inserir e remover um registro vazio para ver a estrutura...');

    // Tentar fazer um select com head para ver o schema
    const { error: schemaError } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (schemaError) {
      console.log(`Schema error: ${schemaError.message}`);
    } else {
      console.log('✅ Tabela existe, mas está vazia');
    }
  }
}

console.log('\n\n✨ Verificação concluída!');
