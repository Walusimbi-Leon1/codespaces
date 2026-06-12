#!/bin/bash
# config.sh — Load local secrets/config for codespace scripts
# Source this from other scripts: source "$(dirname $0)/lib/config.sh"

CONFIG_FILE="$HOME/.codespace-secrets"

# Default values (overridden by config file)
PUTER_USERNAME="admin"
PUTER_PASSWORD="change-me-on-first-login"

# Load config file if it exists
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
fi
