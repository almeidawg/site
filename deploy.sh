#!/usr/bin/env bash

set -e  # se der erro em qualquer etapa, para tudo

### CONFIGURAÇÕES – AJUSTE AQUI

# Caminho do projeto na sua máquina
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Dados do servidor (SSH – recomendado)
SSH_USER="SEU_USUARIO_SSH"
SSH_HOST="seu-servidor.hostinghorizons.com.br"
SSH_PORT=22

# Pasta remota onde o sistema será publicado
REMOTE_DIR="/home/SEU_USUARIO/public_html/sistema"

### 1) Build de produção

echo "👉 Instalando dependências..."
cd "$PROJECT_DIR"
npm install

echo "👉 Gerando build de produção..."
npm run build

### 2) Envio para o servidor (rsync via SSH)

echo "👉 Enviando pasta dist/ para o servidor..."
rsync -avz --delete \
  "$PROJECT_DIR/dist/" \
  -e "ssh -p $SSH_PORT" \
  "$SSH_USER@$SSH_HOST:$REMOTE_DIR/"

### 3) Ajuste de permissões (opcional, mas recomendado)

echo "👉 Ajustando permissões no servidor..."
ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "chmod -R 755 $REMOTE_DIR"

echo "✅ Deploy concluído com sucesso!"
