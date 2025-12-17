#!/bin/bash
# monitor.sh - Remote Logging & PPI Censorship
# Runs on MgMt VM (VM 4), watches Backend VM (VM 2)
# Requirement: Log requests and censor PPI 
# Requirement: Log Requests and Returns with timestamps [cite: 13]

# --- CONFIGURATION ---
BACKEND_IP="192.168.10.20"
# CHANGE THIS to the username you use to log into your Backend VM (e.g., student, admin, ubuntu)
BACKEND_USER="backend-vm"  
REMOTE_LOG_FILE="/home/backend-vm/ecommerce-project/backend/server.log"        # The file your Node.js server writes to
LOCAL_SECURE_LOG="secure_audit.log" # The file we save on this MgMt VM
# ---------------------

echo ">>> Starting Remote Monitor Service..."
echo ">>> Connecting to Backend ($BACKEND_IP)..."
echo ">>> Logging clean data to: $LOCAL_SECURE_LOG"

# We use SSH to run 'tail' on the remote machine and pipe the data back here
ssh $BACKEND_USER@$BACKEND_IP "tail -f $REMOTE_LOG_FILE" | while read line; do

    # 1. Capture current Timestamp
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

    # 2. Censor PPI (Emails)
    # Your app logs emails (e.g. login/register), so we must censor them.
    # This regex finds 'text@text.com' and replaces it with [EMAIL REDACTED]
    CENSORED_LINE=$(echo "$line" | sed -E 's/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/[EMAIL REDACTED]/g')

    # 3. Output to the secure log with timestamp
    echo "[$TIMESTAMP] $CENSORED_LINE" >> "$LOCAL_SECURE_LOG"
    
    # 4. Print to screen so you can see it working
    echo "[$TIMESTAMP] SECURED: $CENSORED_LINE"

done
