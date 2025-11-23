import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_TOKEN = 'FTL87elC6kZeDU6RaWp2nwNWlrKYxMqVR5mAjYIDfc0c8bd4';
const API_BASE_URL = 'api.hostinger.com';

// Função para fazer requisições à API do Hostinger
function apiRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE_URL,
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve(body);
          }
        } else {
          reject(new Error(`API Error: ${res.statusCode} - ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function deployToHostinger() {
  try {
    console.log('🚀 Iniciando deploy para Hostinger...\n');

    // 1. Listar websites
    console.log('📋 Buscando informações do website...');
    const websites = await apiRequest('/v1/websites');
    console.log('Websites encontrados:', websites);

    // Por enquanto, vamos apenas verificar a conexão
    // Para upload de arquivos via FTP, ainda precisaremos usar FTP
    console.log('\n⚠️  Nota: A API do Hostinger fornece gerenciamento, mas para upload de arquivos ainda é necessário FTP.');
    console.log('📁 Arquivos compilados estão em: dist/');
    console.log('\nPor favor, forneça a senha correta do FTP para completar o deploy.');

  } catch (error) {
    console.error('❌ Erro no deploy:', error.message);
    process.exit(1);
  }
}

deployToHostinger();
