#!/bin/bash

# Find the process ID of the running backup script
PID=$(ps aux | grep '[b]ackup_volume.sh' | awk '{print $2}')

if [ -n "$PID" ]; then
    echo "Stopping backup process with PID $PID"
    kill "$PID"
else
    echo "Backup process not running."
fi
