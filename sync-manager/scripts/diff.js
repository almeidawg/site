#!/usr/bin/env node

/**
 * 🔍 Diff Script
 *
 * Compara dois snapshots e gera relatório detalhado de diferenças.
 *
 * Uso:
 *   npm run sync:diff                           - Compara latest com anterior
 *   npm run sync:diff --from snap1 --to snap2   - Compara específicos
 *   npm run sync:diff --detailed                - Relatório detalhado
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { diffLines } from 'diff';
import chalk from 'chalk';
import ora from 'ora';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

// Configuração
let config;
try {
  config = await fs.readJson(path.join(ROOT_DIR, 'config', 'sync-config.json'));
} catch {
  config = {
    paths: { snapshots: './snapshots', reports: './reports' },
    diff: { ignoreWhitespace: true }
  };
}

const SNAPSHOTS_DIR = path.join(ROOT_DIR, config.paths?.snapshots || 'snapshots');
const REPORTS_DIR = path.join(ROOT_DIR, config.paths?.reports || 'reports');

/**
 * Lista todos os snapshots disponíveis
 */
async function listSnapshots() {
  const snapshots = [];
  const items = await fs.readdir(SNAPSHOTS_DIR);

  for (const item of items) {
    if (item === 'latest') continue; // Ignorar symlink

    const fullPath = path.join(SNAPSHOTS_DIR, item);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      snapshots.push({
        name: item,
        path: fullPath,
        created: stat.birthtime
      });
    }
  }

  return snapshots.sort((a, b) => b.created - a.created);
}

/**
 * Obtém arquivos de um snapshot recursivamente
 */
async function getSnapshotFiles(snapshotPath) {
  const files = [];

  async function walk(dir, relativePath = '') {
    const items = await fs.readdir(dir);

    for (const item of items) {
      if (item.startsWith('_snapshot-')) continue; // Ignorar metadata

      const fullPath = path.join(dir, item);
      const relPath = path.join(relativePath, item);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        await walk(fullPath, relPath);
      } else {
        files.push({
          path: relPath,
          fullPath: fullPath,
          size: stat.size,
          modified: stat.mtime
        });
      }
    }
  }

  await walk(snapshotPath);
  return files;
}

/**
 * Compara dois snapshots
 */
async function compareSnapshots(snapshot1, snapshot2) {
  const spinner = ora('Analisando diferenças...').start();

  const files1 = await getSnapshotFiles(snapshot1.path);
  const files2 = await getSnapshotFiles(snapshot2.path);

  const files1Map = new Map(files1.map(f => [f.path, f]));
  const files2Map = new Map(files2.map(f => [f.path, f]));

  const result = {
    new: [],
    deleted: [],
    modified: [],
    unchanged: []
  };

  // Arquivos em snapshot2 (novo)
  for (const file of files2) {
    if (!files1Map.has(file.path)) {
      result.new.push(file);
    } else {
      const oldFile = files1Map.get(file.path);

      // Comparar conteúdo
      const isModified = await areFilesDifferent(oldFile.fullPath, file.fullPath);

      if (isModified) {
        result.modified.push({
          ...file,
          oldSize: oldFile.size
        });
      } else {
        result.unchanged.push(file);
      }
    }
  }

  // Arquivos deletados (estavam em snapshot1 mas não em snapshot2)
  for (const file of files1) {
    if (!files2Map.has(file.path)) {
      result.deleted.push(file);
    }
  }

  spinner.succeed('Análise concluída');
  return result;
}

/**
 * Verifica se dois arquivos são diferentes
 */
async function areFilesDifferent(file1, file2) {
  try {
    const content1 = await fs.readFile(file1, 'utf-8');
    const content2 = await fs.readFile(file2, 'utf-8');

    if (config.diff?.ignoreWhitespace) {
      return content1.trim() !== content2.trim();
    }

    return content1 !== content2;
  } catch {
    // Se não puder ler (binário), comparar por tamanho
    const stat1 = await fs.stat(file1);
    const stat2 = await fs.stat(file2);
    return stat1.size !== stat2.size;
  }
}

/**
 * Gera relatório markdown
 */
function generateMarkdownReport(snapshot1, snapshot2, diff) {
  const timestamp = new Date().toISOString();

  let report = `# 📊 Relatório de Diferenças - Sync Manager

**Data:** ${timestamp}
**De:** ${snapshot1.name}
**Para:** ${snapshot2.name}

---

## 📈 Resumo

| Categoria | Quantidade |
|-----------|------------|
| ✅ Novos arquivos | ${diff.new.length} |
| ❌ Arquivos deletados | ${diff.deleted.length} |
| ✏️  Arquivos modificados | ${diff.modified.length} |
| ⚪ Arquivos inalterados | ${diff.unchanged.length} |
| **📦 Total** | **${diff.new.length + diff.deleted.length + diff.modified.length + diff.unchanged.length}** |

---
`;

  if (diff.new.length > 0) {
    report += `\n## ✅ Novos Arquivos (${diff.new.length})\n\n`;
    diff.new.forEach(file => {
      report += `- \`${file.path}\` (${formatSize(file.size)})\n`;
    });
  }

  if (diff.deleted.length > 0) {
    report += `\n## ❌ Arquivos Deletados (${diff.deleted.length})\n\n`;
    diff.deleted.forEach(file => {
      report += `- \`${file.path}\`\n`;
    });
  }

  if (diff.modified.length > 0) {
    report += `\n## ✏️ Arquivos Modificados (${diff.modified.length})\n\n`;
    diff.modified.forEach(file => {
      const sizeDiff = file.size - file.oldSize;
      const sizeIndicator = sizeDiff > 0 ? `+${formatSize(sizeDiff)}` : formatSize(sizeDiff);
      report += `- \`${file.path}\` (${sizeIndicator})\n`;
    });
  }

  // Categorizar por tipo de arquivo
  const byType = categorizeFilesByType(diff);

  report += `\n---\n\n## 📁 Por Categoria\n\n`;

  Object.entries(byType).forEach(([type, files]) => {
    if (files.new + files.modified + files.deleted > 0) {
      report += `### ${type}\n`;
      report += `- Novos: ${files.new}\n`;
      report += `- Modificados: ${files.modified}\n`;
      report += `- Deletados: ${files.deleted}\n\n`;
    }
  });

  // Recomendações
  report += `\n---\n\n## 💡 Recomendações\n\n`;

  const recommendations = generateRecommendations(diff);
  recommendations.forEach((rec, i) => {
    report += `${i + 1}. ${rec}\n`;
  });

  report += `\n---\n\n## 🚀 Próximos Passos\n\n`;
  report += `1. Revise as mudanças acima\n`;
  report += `2. Execute: \`npm run sync:analyze\` para análise detalhada\n`;
  report += `3. Aplique mudanças: \`npm run sync:apply --components NomeDoComponente\`\n`;
  report += `4. Teste localmente: \`cd ../wg-crm && npm run dev\`\n`;

  return report;
}

/**
 * Categoriza arquivos por tipo
 */
function categorizeFilesByType(diff) {
  const categories = {
    'Componentes React': { new: 0, modified: 0, deleted: 0 },
    'Páginas': { new: 0, modified: 0, deleted: 0 },
    'Estilos (CSS)': { new: 0, modified: 0, deleted: 0 },
    'APIs/Services': { new: 0, modified: 0, deleted: 0 },
    'Configuração': { new: 0, modified: 0, deleted: 0 },
    'Assets': { new: 0, modified: 0, deleted: 0 },
    'Outros': { new: 0, modified: 0, deleted: 0 }
  };

  function categorize(file, action) {
    const filepath = file.path.toLowerCase();

    if (filepath.includes('component') || filepath.endsWith('.jsx') || filepath.endsWith('.tsx')) {
      categories['Componentes React'][action]++;
    } else if (filepath.includes('page') || filepath.includes('route')) {
      categories['Páginas'][action]++;
    } else if (filepath.endsWith('.css') || filepath.endsWith('.scss') || filepath.endsWith('.sass')) {
      categories['Estilos (CSS)'][action]++;
    } else if (filepath.includes('api') || filepath.includes('service')) {
      categories['APIs/Services'][action]++;
    } else if (filepath.includes('config') || filepath.includes('.json')) {
      categories['Configuração'][action]++;
    } else if (filepath.match(/\.(png|jpg|jpeg|svg|gif|ico)$/)) {
      categories['Assets'][action]++;
    } else {
      categories['Outros'][action]++;
    }
  }

  diff.new.forEach(f => categorize(f, 'new'));
  diff.modified.forEach(f => categorize(f, 'modified'));
  diff.deleted.forEach(f => categorize(f, 'deleted'));

  return categories;
}

/**
 * Gera recomendações baseadas no diff
 */
function generateRecommendations(diff) {
  const recommendations = [];

  if (diff.new.length > 0) {
    const newComponents = diff.new.filter(f =>
      f.path.toLowerCase().includes('component') ||
      f.path.endsWith('.jsx') ||
      f.path.endsWith('.tsx')
    );

    if (newComponents.length > 0) {
      recommendations.push(
        `📦 ${newComponents.length} novos componentes detectados. ` +
        `Revise e aplique com: \`npm run sync:apply --components [nome]\``
      );
    }
  }

  if (diff.modified.length > 5) {
    recommendations.push(
      `⚠️  ${diff.modified.length} arquivos modificados. ` +
      `Faça backup antes de aplicar: \`git checkout -b sync-backup\``
    );
  }

  if (diff.deleted.length > 0) {
    recommendations.push(
      `🗑️ ${diff.deleted.length} arquivos deletados. ` +
      `Verifique se podem ser removidos com segurança.`
    );
  }

  const configChanges = diff.modified.filter(f =>
    f.path.includes('package.json') ||
    f.path.includes('config')
  );

  if (configChanges.length > 0) {
    recommendations.push(
      `⚙️  Arquivos de configuração modificados. ` +
      `Revise mudanças antes de aplicar.`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('✨ Poucas mudanças detectadas. Pode aplicar com segurança.');
  }

  return recommendations;
}

/**
 * Formata tamanho de arquivo
 */
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
}

/**
 * Salva relatório
 */
async function saveReport(report, snapshot1, snapshot2) {
  await fs.ensureDir(REPORTS_DIR);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `diff_${snapshot1.name}_to_${snapshot2.name}_${timestamp}.md`;
  const filepath = path.join(REPORTS_DIR, filename);

  await fs.writeFile(filepath, report, 'utf-8');

  // Criar symlink para latest
  const latestPath = path.join(REPORTS_DIR, 'latest-diff.md');
  if (await fs.pathExists(latestPath)) {
    await fs.remove(latestPath);
  }
  await fs.symlink(filename, latestPath);

  return filepath;
}

/**
 * Main
 */
async function main() {
  console.log(chalk.bold.blue('\n🔍 Sync Manager - Diff Analyzer\n'));

  // Listar snapshots disponíveis
  const snapshots = await listSnapshots();

  if (snapshots.length < 2) {
    console.error(chalk.red('❌ Erro: Precisa de pelo menos 2 snapshots para comparar\n'));
    console.log(chalk.gray('Crie um snapshot primeiro:'));
    console.log(chalk.gray('  npm run sync:snapshot /path/to/export\n'));
    process.exit(1);
  }

  // Determinar snapshots para comparar
  let snapshot1, snapshot2;

  const fromArg = process.argv.find((arg, i) => process.argv[i-1] === '--from');
  const toArg = process.argv.find((arg, i) => process.argv[i-1] === '--to');

  if (fromArg && toArg) {
    snapshot1 = snapshots.find(s => s.name === fromArg);
    snapshot2 = snapshots.find(s => s.name === toArg);

    if (!snapshot1 || !snapshot2) {
      console.error(chalk.red('❌ Erro: Snapshot não encontrado\n'));
      process.exit(1);
    }
  } else {
    // Por padrão: compara os dois mais recentes
    snapshot1 = snapshots[1]; // Penúltimo
    snapshot2 = snapshots[0]; // Último
  }

  console.log(chalk.gray(`Comparando:`));
  console.log(chalk.gray(`  De:   ${snapshot1.name}`));
  console.log(chalk.gray(`  Para: ${snapshot2.name}\n`));

  // Comparar
  const diff = await compareSnapshots(snapshot1, snapshot2);

  // Gerar relatório
  const report = generateMarkdownReport(snapshot1, snapshot2, diff);

  // Salvar relatório
  const reportPath = await saveReport(report, snapshot1, snapshot2);

  // Exibir resumo no console
  console.log(chalk.bold.green('\n✅ Análise concluída!\n'));
  console.log(chalk.blue('📊 Resumo:'));
  console.log(chalk.green(`  ✅ Novos:        ${diff.new.length}`));
  console.log(chalk.red(`  ❌ Deletados:    ${diff.deleted.length}`));
  console.log(chalk.yellow(`  ✏️  Modificados:  ${diff.modified.length}`));
  console.log(chalk.gray(`  ⚪ Inalterados:  ${diff.unchanged.length}\n`));

  console.log(chalk.blue(`📄 Relatório salvo em:`));
  console.log(chalk.gray(`  ${reportPath}\n`));

  console.log(chalk.gray('Próximos passos:'));
  console.log(chalk.gray('  1. cat reports/latest-diff.md    - Ver relatório completo'));
  console.log(chalk.gray('  2. npm run sync:analyze          - Análise detalhada'));
  console.log(chalk.gray('  3. npm run sync:apply            - Aplicar mudanças\n'));
}

main();
