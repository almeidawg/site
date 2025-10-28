#!/usr/bin/env node

/**
 * 📸 Snapshot Script
 *
 * Cria um snapshot (versão timestamped) de um export do app do cliente.
 *
 * Uso:
 *   npm run sync:snapshot /path/to/export.zip
 *   npm run sync:snapshot /path/to/extracted-folder
 *   npm run sync:snapshot --force /path/to/export.zip
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import ora from 'ora';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

// Configuração
let config;
try {
  config = await fs.readJson(path.join(ROOT_DIR, 'config', 'sync-config.json'));
} catch {
  console.log(chalk.yellow('⚠️  sync-config.json não encontrado. Usando configuração padrão...'));
  config = {
    sync: { autoCommit: true, snapshotFormat: 'YYYY-MM-DD_HH-mm' },
    paths: { snapshots: './snapshots', temp: './temp' }
  };
}

const SNAPSHOTS_DIR = path.join(ROOT_DIR, config.paths?.snapshots || 'snapshots');
const TEMP_DIR = path.join(ROOT_DIR, config.paths?.temp || 'temp');

/**
 * Gera nome de snapshot com timestamp
 */
function generateSnapshotName() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}_${hours}-${minutes}`;
}

/**
 * Extrai ZIP se necessário
 */
async function extractIfZip(sourcePath) {
  const spinner = ora('Verificando tipo de arquivo...').start();

  if (sourcePath.endsWith('.zip')) {
    spinner.text = 'Extraindo arquivo ZIP...';

    // Criar diretório temp se não existe
    await fs.ensureDir(TEMP_DIR);

    // Extrair ZIP
    const extractPath = path.join(TEMP_DIR, 'extracted');
    await fs.ensureDir(extractPath);

    try {
      await execAsync(`unzip -q "${sourcePath}" -d "${extractPath}"`);
      spinner.succeed('ZIP extraído com sucesso');
      return extractPath;
    } catch (error) {
      spinner.fail('Erro ao extrair ZIP');
      throw new Error(`Falha ao extrair ZIP: ${error.message}`);
    }
  }

  spinner.succeed('Pasta detectada (não é ZIP)');
  return sourcePath;
}

/**
 * Cria snapshot do código
 */
async function createSnapshot(sourcePath) {
  const snapshotName = generateSnapshotName();
  const snapshotDir = path.join(SNAPSHOTS_DIR, snapshotName);

  console.log(chalk.blue(`\n📸 Criando snapshot: ${snapshotName}\n`));

  // Garantir que diretório de snapshots existe
  await fs.ensureDir(SNAPSHOTS_DIR);

  // Verificar se snapshot já existe
  if (await fs.pathExists(snapshotDir)) {
    const force = process.argv.includes('--force');
    if (!force) {
      throw new Error(
        `Snapshot ${snapshotName} já existe!\n` +
        `Use --force para sobrescrever.`
      );
    }
    await fs.remove(snapshotDir);
  }

  // Copiar arquivos
  const spinner = ora('Copiando arquivos...').start();
  try {
    await fs.copy(sourcePath, snapshotDir, {
      filter: (src) => {
        // Ignorar node_modules, .git, etc
        const ignorePatterns = [
          'node_modules',
          '.git',
          'dist',
          'build',
          '.DS_Store',
          '*.log'
        ];

        const shouldIgnore = ignorePatterns.some(pattern =>
          src.includes(pattern)
        );

        return !shouldIgnore;
      }
    });
    spinner.succeed(`Arquivos copiados para: ${snapshotDir}`);
  } catch (error) {
    spinner.fail('Erro ao copiar arquivos');
    throw error;
  }

  // Criar arquivo de metadata
  const metadata = {
    timestamp: new Date().toISOString(),
    snapshotName,
    sourcePath,
    createdBy: 'sync-manager',
    files: await countFiles(snapshotDir)
  };

  await fs.writeJson(
    path.join(snapshotDir, '_snapshot-metadata.json'),
    metadata,
    { spaces: 2 }
  );

  console.log(chalk.green(`\n✅ Snapshot criado com sucesso!`));
  console.log(chalk.gray(`   Arquivos: ${metadata.files}`));

  return { snapshotName, snapshotDir, metadata };
}

/**
 * Conta arquivos no diretório
 */
async function countFiles(dir) {
  let count = 0;

  async function walk(currentDir) {
    const files = await fs.readdir(currentDir);

    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        await walk(filePath);
      } else {
        count++;
      }
    }
  }

  await walk(dir);
  return count;
}

/**
 * Atualiza symlink 'latest'
 */
async function updateLatestSymlink(snapshotName) {
  const spinner = ora('Atualizando symlink latest...').start();

  const latestPath = path.join(SNAPSHOTS_DIR, 'latest');
  const targetPath = snapshotName; // Relativo

  try {
    // Remover symlink antigo se existir
    if (await fs.pathExists(latestPath)) {
      await fs.remove(latestPath);
    }

    // Criar novo symlink
    await fs.symlink(targetPath, latestPath, 'dir');
    spinner.succeed('Symlink latest atualizado');
  } catch (error) {
    spinner.warn(`Aviso: Não foi possível criar symlink (${error.message})`);
  }
}

/**
 * Commita snapshot no Git
 */
async function gitCommit(snapshotName) {
  if (!config.sync?.autoCommit) {
    console.log(chalk.gray('\nAutoCommit desabilitado. Pulando...'));
    return;
  }

  const spinner = ora('Commitando no Git...').start();

  try {
    // Verificar se está em repo Git
    await execAsync('git rev-parse --git-dir', { cwd: ROOT_DIR });

    // Add snapshot
    await execAsync(`git add snapshots/${snapshotName}`, { cwd: ROOT_DIR });

    // Commit
    const commitMessage = `snapshot: ${snapshotName}`;
    await execAsync(`git commit -m "${commitMessage}"`, { cwd: ROOT_DIR });

    spinner.succeed('Snapshot commitado no Git');
  } catch (error) {
    spinner.warn('Aviso: Git commit falhou (talvez não esteja em repo Git)');
  }
}

/**
 * Limpa arquivos temporários
 */
async function cleanup() {
  const spinner = ora('Limpando arquivos temporários...').start();

  try {
    if (await fs.pathExists(TEMP_DIR)) {
      await fs.remove(TEMP_DIR);
    }
    spinner.succeed('Limpeza concluída');
  } catch (error) {
    spinner.warn('Aviso: Falha ao limpar temp');
  }
}

/**
 * Main
 */
async function main() {
  console.log(chalk.bold.blue('\n🔄 Sync Manager - Snapshot Creator\n'));

  // Validar argumentos
  const sourcePath = process.argv[2];
  if (!sourcePath) {
    console.error(chalk.red('❌ Erro: Path do export não fornecido\n'));
    console.log(chalk.gray('Uso:'));
    console.log(chalk.gray('  npm run sync:snapshot /path/to/export.zip'));
    console.log(chalk.gray('  npm run sync:snapshot /path/to/folder\n'));
    process.exit(1);
  }

  // Verificar se path existe
  if (!await fs.pathExists(sourcePath)) {
    console.error(chalk.red(`❌ Erro: Path não encontrado: ${sourcePath}\n`));
    process.exit(1);
  }

  try {
    // 1. Extrair se for ZIP
    const extractedPath = await extractIfZip(sourcePath);

    // 2. Criar snapshot
    const { snapshotName, snapshotDir, metadata } = await createSnapshot(extractedPath);

    // 3. Atualizar symlink latest
    await updateLatestSymlink(snapshotName);

    // 4. Commit no Git
    await gitCommit(snapshotName);

    // 5. Limpar temp
    await cleanup();

    // Sucesso!
    console.log(chalk.bold.green('\n✨ Snapshot criado com sucesso!\n'));
    console.log(chalk.gray('Próximos passos:'));
    console.log(chalk.gray('  1. npm run sync:diff      - Ver diferenças'));
    console.log(chalk.gray('  2. npm run sync:analyze   - Análise detalhada'));
    console.log(chalk.gray('  3. npm run sync:apply     - Aplicar mudanças\n'));

  } catch (error) {
    console.error(chalk.red(`\n❌ Erro: ${error.message}\n`));
    process.exit(1);
  }
}

main();
