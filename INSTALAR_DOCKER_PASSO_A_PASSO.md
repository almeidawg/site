# 🐳 INSTALAÇÃO DO DOCKER DESKTOP - GUIA COMPLETO

**Data:** 2025-11-26
**Tempo estimado:** 10-15 minutos + reinicialização

---

## 📋 **MÉTODO 1: Script Automático (RECOMENDADO)**

### **Passo 1: Executar Script**

1. Navegar até: `C:\Users\Atendimento\Documents\wgeasy\01 . WGeasy Sistema`
2. **Duplo clique** em: `instalar_docker.bat`
3. O navegador abrirá automaticamente na página de download

---

## 📋 **MÉTODO 2: Manual (Passo a Passo)**

### **Passo 1: Baixar Docker Desktop**

**Opção A - Link Direto:**
```
https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe
```

**Opção B - Site Oficial:**
1. Abrir: https://www.docker.com/products/docker-desktop/
2. Clicar em **"Download for Windows"**
3. Aguardar download (≈ 500MB)

---

### **Passo 2: Executar Instalador**

1. **Localizar** arquivo baixado: `Docker Desktop Installer.exe`
2. **Botão direito** → **Executar como administrador**
3. **Aguardar** inicialização do instalador

---

### **Passo 3: Configuração da Instalação**

1. **Tela de Boas-vindas:**
   - ✅ Marcar: "Use WSL 2 instead of Hyper-V" (se disponível)
   - ✅ Marcar: "Add shortcut to desktop"
   - Clicar **"Ok"**

2. **Instalação:**
   - Aguardar progresso (2-5 minutos)
   - Não fechar a janela

3. **Conclusão:**
   - Clicar em **"Close and restart"**
   - ⚠️ **Computador irá reiniciar automaticamente**

---

### **Passo 4: Após Reinicialização**

1. **Docker Desktop abrirá automaticamente**
   - Se não abrir, procurar no Menu Iniciar: `Docker Desktop`

2. **Primeira Inicialização:**
   - Tela: "Docker Subscription Service Agreement"
   - **Ler** termos (opcional)
   - Clicar **"Accept"**

3. **Tela de Configuração:**
   - Pergunta: "Sign in or create a Docker account"
   - ✅ **Clicar em "Skip" ou "Continue without signing in"**
   - ⚠️ **Não é necessário criar conta Docker**

4. **Aguardar Inicialização:**
   - Status mostrará: "Starting..."
   - Aguardar até ver: ✅ **"Engine running"**
   - Pode levar 1-2 minutos

---

## ✅ **Verificar Instalação**

### **Método 1: Interface Gráfica**

1. **Abrir Docker Desktop**
2. **Verificar canto inferior esquerdo:**
   - ✅ Verde: "Engine running"
   - ❌ Vermelho: Problema na instalação

### **Método 2: Terminal**

Abrir **PowerShell** ou **CMD**:

```bash
docker --version
```

**✅ Deve mostrar:**
```
Docker version 24.x.x, build xxxxx
```

**Teste adicional:**
```bash
docker ps
```

**✅ Deve mostrar:**
```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
(pode estar vazio, mas não deve dar erro)
```

---

## 🔧 **Requisitos do Sistema**

### **Windows:**
- ✅ Windows 10 64-bit: Pro, Enterprise, ou Education (Build 19041 ou superior)
- ✅ Windows 11 64-bit
- ✅ WSL 2 (Windows Subsystem for Linux) - instalado automaticamente
- ✅ Virtualização habilitada na BIOS

### **Hardware:**
- ✅ 4GB RAM (mínimo) - 8GB recomendado
- ✅ 20GB de espaço em disco livre

---

## ⚙️ **Habilitar Virtualização (se necessário)**

Se aparecer erro "Virtualization is not enabled":

### **Verificar se está habilitada:**

1. **Pressionar** `Ctrl + Shift + Esc` (Gerenciador de Tarefas)
2. **Ir em:** Aba "Desempenho"
3. **Clicar em:** CPU
4. **Verificar:** "Virtualização: Habilitada"

### **Se estiver Desabilitada:**

1. **Reiniciar** computador
2. **Pressionar** `F2` ou `Del` ao ligar (entra na BIOS)
   - Pode variar: F1, F10, F12, Esc
3. **Procurar:** "Virtualization Technology" ou "Intel VT-x" ou "AMD-V"
4. **Alterar para:** Enabled
5. **Salvar:** F10 (Save and Exit)

---

## ❓ **Problemas Comuns**

### **Problema 1: "WSL 2 installation is incomplete"**

**Solução:**
```powershell
# PowerShell como Administrador:
wsl --install
wsl --set-default-version 2
```

Reiniciar computador.

---

### **Problema 2: "Docker Desktop failed to start"**

**Solução:**
1. Desinstalar Docker Desktop (Painel de Controle → Programas)
2. Reiniciar computador
3. Reinstalar Docker Desktop
4. Reiniciar novamente

---

### **Problema 3: "This computer doesn't meet the minimum requirements"**

**Causa:** Windows Home ou versão antiga

**Solução:**
- Atualizar para Windows 10 Pro/Enterprise
- Ou usar Docker Toolbox (versão antiga)

---

### **Problema 4: Docker muito lento**

**Solução:**
1. Abrir Docker Desktop
2. **Settings** (ícone de engrenagem)
3. **Resources:**
   - CPUs: 2 (mínimo) ou 4 (recomendado)
   - Memory: 4GB (mínimo) ou 8GB (recomendado)
4. **Apply & Restart**

---

## 📋 **Após Instalação - Próximos Passos**

### **1. Iniciar Supabase:**

```bash
cd "C:\Users\Atendimento\Documents\wgeasy\01 . WGeasy Sistema\supabase"
supabase start
```

### **2. Aplicar Migrations:**

Executar: `aplicar_migrations.bat` (como administrador)

### **3. Verificar:**

Executar: `verificar_migrations.bat`

### **4. Iniciar Frontend:**

```bash
cd wg-crm
npm run dev
```

---

## 🎯 **Checklist de Instalação**

- [ ] ✅ Docker Desktop baixado
- [ ] ✅ Instalador executado como administrador
- [ ] ✅ Computador reiniciado
- [ ] ✅ Docker Desktop iniciado
- [ ] ✅ "Engine running" visível
- [ ] ✅ Termos aceitos (Skip login)
- [ ] ✅ `docker --version` funciona
- [ ] ✅ `docker ps` funciona
- [ ] ✅ Ícone do Docker na bandeja sem "X"

---

## 📞 **Suporte**

**Documentação Oficial Docker:**
- https://docs.docker.com/desktop/install/windows-install/

**Vídeo Tutorial (YouTube):**
- Buscar: "Como instalar Docker Desktop no Windows"

**Verificar Logs do Docker:**
1. Docker Desktop → ⚙️ Settings
2. Troubleshoot → Show logs

---

## ⏱️ **Tempo Total Estimado**

- Download: 5-10 minutos (depende da internet)
- Instalação: 5 minutos
- Reinicialização: 2-3 minutos
- Primeira inicialização: 2 minutos
- **Total: ≈ 15-20 minutos**

---

## 🎉 **Pronto para Continuar!**

Após Docker instalado e rodando:

1. **Fechar** esta janela
2. **Executar:** `aplicar_migrations.bat`
3. **Testar** o sistema

**Boa instalação!** 🚀
