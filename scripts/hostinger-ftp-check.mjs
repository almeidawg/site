import https from 'https';

const API_TOKEN = 'FTL87elC6kZeDU6RaWp2nwNWlrKYxMqVR5mAjYIDfc0c8bd4';

// Função para fazer requisições à API do Hostinger
function apiRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.hostinger.com',
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
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${body}`);
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

async function checkHostinger() {
  try {
    console.log('🔍 Verificando configurações da Hostinger...\n');

    // Tentar diferentes endpoints da API
    console.log('1. Tentando /v1/websites...');
    try {
      const websites = await apiRequest('/v1/websites');
      console.log('✅ Websites:', JSON.stringify(websites, null, 2));
    } catch (e) {
      console.log('❌ Erro:', e.message);
    }

    console.log('\n2. Tentando /v1/domains...');
    try {
      const domains = await apiRequest('/v1/domains');
      console.log('✅ Domains:', JSON.stringify(domains, null, 2));
    } catch (e) {
      console.log('❌ Erro:', e.message);
    }

    console.log('\n3. Tentando /v1/hosting...');
    try {
      const hosting = await apiRequest('/v1/hosting');
      console.log('✅ Hosting:', JSON.stringify(hosting, null, 2));
    } catch (e) {
      console.log('❌ Erro:', e.message);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkHostinger();
