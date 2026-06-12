# Codespace Services & Applications Reference

> **Last updated:** 2026-06-12
> **Access:** Via SSH port forwarding — any `localhost:<port>` is accessible from your laptop

---

## 🚀 Quick-Start Commands

| Command | What it does |
|---|---|
| `run openclaw` | Start AI stack (9router + Gateway) |
| `whatsapp` | Start WhatsApp Web client |
| `puter` | Start Puter cloud desktop |

## 🆕 Setting Up a New Codespace (Any Branch)

When you create a new Codespace on any branch, everything auto-installs via `devcontainer.json`.

**But if you need to do it manually:**
```bash
cd /workspaces/codespaces
bash scripts/setup.sh
```

Then set your secrets:
```bash
nano ~/.codespace-secrets
```

**Scripts live in the repo at:** `scripts/` — they're automatically linked to `~/.local/bin/` by the setup script.

---

## 📡 Services & Ports

### 1. OpenClaw AI Stack
| Service | Type | Local Port | Command |
|---|---|---|---|
| **Control UI** | Web UI | **`18789`** | `run openclaw` |
| **9router API** | API | **`20128`** | `run openclaw` |
| **SSH** | Terminal | **`2222`** | Built-in |

**Auto-forwarded via SSH** — `http://localhost:18789` for Control UI.

---

### 2. WhatsApp Web Client
| Service | Type | Local Port | Command |
|---|---|---|---|
| **WhatsApp Web UI** | Web UI | **`3030`** | `whatsapp` |

**Setup:** Run `whatsapp` → open `http://localhost:3030` → scan QR with your phone.
**Built with:** `whatsapp-web.js` + Express + WebSockets.
**Note:** First run generates QR code in the web UI. Scan with WhatsApp (Settings → Linked Devices).

---

### 3. Puter Cloud Desktop (6 Containers)
| Service | Type | Local Port | Internal Port | Command |
|---|---|---|---|---|
| **Puter Web UI** | Web UI | **`4100`** → 80 | `puter` |
| Puter App | Backend | — | 4100/tcp | Docker |
| MariaDB | Database | — | 3306/tcp | Docker |
| Valkey | Cache | — | 6379/tcp | Docker |
| DynamoDB | Key-Value | — | 8000/tcp | Docker |
| S3 Storage | Files | — | 9000-9001/tcp | Docker |

**Login:** Username `admin` | Password `14c2661de681a78cb71e14efda5b6355`
**Access:** `http://localhost:4100`

---

### 4. AI Providers Available

| Provider | Model Count | Key Status | Best For |
|---|---|---|---|
| **9router** | 1 (oc/big-pickle) | ✅ Built-in | General use |
| **Mistral** | 4 | ✅ Working | Large sessions, coding |
| **Groq (key 1)** | 7 | ✅ Working | Quick answers (6k TPM limit) |
| **Groq (key 2)** | 4 | ✅ Working | Quick answers (6k TPM limit) |
| **Gemini (key 1)** | 3 | ✅ Working | Large context (1M tokens) |
| **Gemini (key 2)** | 3 | ✅ Working | Large context (1M tokens) |
| **OpenAI** | — | ❌ Needs billing | — |

**Switch models in:** OpenClaw Control UI → click model name at bottom.

---

### 5. Built-in Codespace Tools

| Tool | Command | What it does |
|---|---|---|
| **VS Code** | `code .` | Web-based code editor |
| **Git** | `git <cmd>` | Version control |
| **Docker** | `docker <cmd>` | Container management |
| **Node.js** | `node` / `npm` | JavaScript runtime (v24.14.0) |
| **Python** | `python3` | Python runtime |
| **Jupyter** | `jupyter-lab` | Notebook server |
| **GH CLI** | `gh` | GitHub management |
| **SSH Server** | port `2222` | Remote terminal access |
| **DebugPy** | `debugpy` | Python debugger |

---

## 📁 Key File Locations

| Path | What it is |
|---|---|
| `/workspaces/codespaces/` | Main workspace (git repo root) |
| `/workspaces/codespaces/Puter/` | Puter cloud desktop files |
| `/workspaces/codespaces/whatsapp-web.js/` | WhatsApp web client |
| `~/.openclaw/workspace/` | My memory, identity, config files |
| `~/.openclaw/openclaw.json` | OpenClaw configuration |
| `~/.openclaw/logs/` | Log files for all services |
| `~/.local/bin/` | Custom commands (run-openclaw, whatsapp, puter, etc.) |

---

## 🔌 Port Forwarding Summary

If you use `gh codespace ports forward`:
```
gh codespace ports forward 18789:18789  # OpenClaw Control UI
gh codespace ports forward 3030:3030     # WhatsApp Web
gh codespace ports forward 4100:4100     # Puter Desktop
```

Or with `ssh`:
```bash
ssh -L 18789:localhost:18789 -L 3030:localhost:3030 -L 4100:localhost:4100 <codespace>
```
