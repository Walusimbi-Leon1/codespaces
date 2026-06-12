#!/bin/bash
# setup.sh — One-time setup for codespace scripts
# Run this once after creating a new codespace on any branch

set -e

BINDIR="$HOME/.local/bin"
SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG_FILE="$HOME/.codespace-secrets"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     ${BOLD}Codespace Scripts Setup${NC}${CYAN}             ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# ─── 1. Link scripts to ~/.local/bin ─────────────────────────
mkdir -p "$BINDIR"
echo -e "${BOLD}1. Installing scripts...${NC}"

for script in "$SCRIPTS_DIR"/run-openclaw "$SCRIPTS_DIR"/stop-openclaw "$SCRIPTS_DIR"/puter "$SCRIPTS_DIR"/whatsapp "$SCRIPTS_DIR"/run; do
    if [ -f "$script" ]; then
        name=$(basename "$script")
        ln -sf "$script" "$BINDIR/$name"
        chmod +x "$script"
        echo -e "  ${GREEN}✓${NC} $name"
    fi
done

echo ""

# ─── 2. Create secrets config if needed ─────────────────────
echo -e "${BOLD}2. Secrets...${NC}"
if [ ! -f "$CONFIG_FILE" ]; then
    cat > "$CONFIG_FILE" << 'SECEOF'
# Codespace Secrets — local-only, never committed
# Edit with your actual credentials

# Puter cloud desktop
PUTER_USERNAME="admin"
PUTER_PASSWORD="change-me-on-first-login"
SECEOF
    chmod 600 "$CONFIG_FILE"
    echo -e "  ${YELLOW}⚠  Created $CONFIG_FILE — edit it with your credentials${NC}"
    echo -e "  ${YELLOW}   Run: nano $CONFIG_FILE${NC}"
else
    echo -e "  ${GREEN}✓${NC} Config file exists"
fi

echo ""

# ─── 3. Install Docker if missing ─────────────────────────────
echo -e "${BOLD}3. Docker...${NC}"
if command -v docker &>/dev/null; then
    echo -e "  ${GREEN}✓${NC} Docker available"
else
    echo -e "  ${YELLOW}→${NC} Installing Docker..."
    sudo apt-get update -qq && sudo apt-get install -y -qq docker.io 2>&1 | tail -1
    echo -e "  ${GREEN}✓${NC} Docker installed"
fi

echo ""

# ─── 4. Verify PATH ─────────────────────────────────────────
echo -e "${BOLD}4. PATH check...${NC}"
if echo "$PATH" | grep -q "$BINDIR"; then
    echo -e "  ${GREEN}✓${NC} $BINDIR is in PATH"
else
    echo -e "  ${YELLOW}→${NC} Adding $BINDIR to PATH in ~/.bashrc..."
    echo "export PATH=\"\$HOME/.local/bin:\$PATH\"" >> "$HOME/.bashrc"
    echo -e "  ${GREEN}✓${NC} Added — restart terminal or run: source ~/.bashrc"
fi

echo ""
echo -e "${GREEN}${BOLD}✅ Setup complete!${NC}"
echo ""
echo -e "  ${BOLD}Commands now available:${NC}"
echo -e "    ${CYAN}run openclaw${NC}     — Start AI stack"
echo -e "    ${CYAN}puter${NC}            — Start cloud desktop"
echo -e "    ${CYAN}whatsapp${NC}         — Start WhatsApp web client"
echo ""
echo -e "  ${YELLOW}Next:${NC}"
echo -e "    ${CYAN}nano ~/.codespace-secrets${NC}  — Set your Puter password"
echo ""
