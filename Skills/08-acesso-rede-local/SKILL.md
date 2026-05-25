# Skill 08 — Acesso Rede Local

## Objetivo
Expor o servidor Ollama na rede local para que outros computadores (PC de desenvolvimento, notebook) possam consumir os modelos do servidor central.

---

## Topologia de Referência

```
[Servidor AgonIA]          [PC Dev / Notebook]
 GPU + Ollama              Cursor / TRAE / Continue.dev
 192.168.1.100:11434  ←→  192.168.1.XXX
```

---

## 1. Configurar Ollama para Aceitar Conexões Externas

Por padrão, o Ollama escuta apenas `127.0.0.1` (loopback). É preciso mudar para `0.0.0.0`.

### Linux (systemd)

```bash
# Editar o serviço
sudo systemctl edit ollama.service
```

Inserir no arquivo (editor abre vazio — adicione entre os comentários):
```ini
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
```

```bash
# Aplicar e reiniciar
sudo systemctl daemon-reload
sudo systemctl restart ollama

# Verificar
sudo systemctl status ollama
```

### Linux (sem systemd / iniciado manualmente)

```bash
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

### Windows

```powershell
# Definir variável de ambiente permanente (PowerShell como Admin)
[System.Environment]::SetEnvironmentVariable("OLLAMA_HOST", "0.0.0.0:11434", "Machine")

# Reiniciar o Ollama (fechar e abrir o app, ou via serviço)
```

Ou temporariamente no terminal:
```cmd
set OLLAMA_HOST=0.0.0.0:11434
ollama serve
```

### macOS

```bash
# No terminal, antes de iniciar o Ollama
OLLAMA_HOST=0.0.0.0:11434 ollama serve

# Ou editar o launchd plist se instalado como serviço
```

### Docker

```bash
# Já exposto por padrão ao mapear a porta:
docker run -d -v ollama:/root/.ollama \
  -p 11434:11434 \
  -e OLLAMA_HOST=0.0.0.0 \
  --name ollama ollama/ollama
```

---

## 2. Descobrir o IP do Servidor

### Linux
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
# Exemplo de saída: inet 192.168.1.100/24
```

### Windows
```cmd
ipconfig | findstr "IPv4"
```

### macOS
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

---

## 3. Abrir Firewall no Servidor

### Linux (ufw)
```bash
sudo ufw allow 11434/tcp
sudo ufw reload
sudo ufw status
```

### Linux (firewalld)
```bash
sudo firewall-cmd --permanent --add-port=11434/tcp
sudo firewall-cmd --reload
```

### Windows Defender Firewall
```powershell
# PowerShell como Admin
New-NetFirewallRule -DisplayName "Ollama AI Server" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 11434 `
  -Action Allow
```

---

## 4. Testar Conectividade

Do computador de desenvolvimento (não do servidor):

```bash
# Testar se porta está acessível
curl http://192.168.1.100:11434/api/tags

# Testar endpoint OpenAI-compatible
curl http://192.168.1.100:11434/v1/models

# Testar geração
curl http://192.168.1.100:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ollama" \
  -d '{"model":"deepseek-coder-v2","messages":[{"role":"user","content":"oi"}]}'
```

---

## 5. Configurar IP nos Clientes

Substitua `localhost` pelo IP do servidor em cada ferramenta:

### Cursor
```
OpenAI Base URL: http://192.168.1.100:11434/v1
```

### TRAE
```
API Endpoint: http://192.168.1.100:11434/v1
```

### Continue.dev (config.json)
```json
{
  "models": [{
    "provider": "ollama",
    "model": "deepseek-coder-v2",
    "apiBase": "http://192.168.1.100:11434"
  }],
  "embeddingsProvider": {
    "provider": "ollama",
    "model": "nomic-embed-text",
    "apiBase": "http://192.168.1.100:11434"
  }
}
```

---

## Segurança da Rede Local

> ⚠️ O Ollama **não tem autenticação** por padrão. Qualquer pessoa na rede pode usar os modelos.

### Medidas recomendadas:

**Opção A: Restringir por IP no firewall**
```bash
# Permitir apenas seu IP de desenvolvimento (Linux/ufw)
sudo ufw allow from 192.168.1.50 to any port 11434
sudo ufw deny 11434
```

**Opção B: Usar Nginx como proxy reverso com autenticação básica**
```nginx
# /etc/nginx/sites-available/ollama
server {
    listen 11435;

    auth_basic "Ollama Private";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location / {
        proxy_pass http://127.0.0.1:11434;
        proxy_set_header Host $host;
    }
}
```

```bash
# Criar arquivo de senhas
sudo apt install apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd seu_usuario
```

**Opção C: Túnel SSH (mais seguro, sem expor porta)**
```bash
# No PC de desenvolvimento — criar túnel SSH para o servidor
ssh -L 11434:localhost:11434 usuario@192.168.1.100 -N

# Agora use localhost:11434 normalmente — o tráfego passa por SSH criptografado
```

---

## IP Fixo (Recomendado para o Servidor)

Para não precisar atualizar o IP nos clientes toda vez:

### Linux (netplan — Ubuntu 20.04+)
```yaml
# /etc/netplan/00-installer-config.yaml
network:
  ethernets:
    eth0:
      dhcp4: no
      addresses: [192.168.1.100/24]
      gateway4: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 1.1.1.1]
  version: 2
```
```bash
sudo netplan apply
```

### Router (mais simples)
Configure o DHCP do roteador para sempre entregar o mesmo IP para o MAC address do servidor.

---

## Próxima Etapa
Consulte **Skill 09 — Open WebUI** para instalar uma interface gráfica de gerenciamento dos modelos.
