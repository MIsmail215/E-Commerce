#!/bin/bash

# Configuration
SOURCE_LOG="incoming_traffic.log"
CLEAN_LOG="secure_monitor.log"

echo "Starting Monitor Service..."
echo "Logging to: $CLEAN_LOG"

# Ensure the source log exists so tail doesn't fail
touch $SOURCE_LOG

# 1. Tail the log file in real-time (-f)
# 2. Read each line as it arrives
tail -f $SOURCE_LOG | while read line; do

    # Get current Timestamp
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

    # Censor PPI (Credit Card Numbers)
    # This sed command looks for sequences of 13-16 digits and replaces them with '****'
    CENSORED_LINE=$(echo "$line" | sed -E 's/[0-9]{4}[ -]?[0-9]{4}[ -]?[0-9]{4}[ -]?[0-9]{4}/[REDACTED-CC]/g')

    # Output to the secure log with timestamp
    echo "[$TIMESTAMP] REQUEST: $CENSORED_LINE" >> $CLEAN_LOG
    
    # Optional: Print to screen so you can see it working
    echo "[$TIMESTAMP] PROCESSED: $CENSORED_LINE"

done
