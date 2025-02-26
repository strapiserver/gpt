#!/bin/bash

BACKUP_DIR=~/strapi_backups
VOLUME_NAME=strapi_strapi-data
CONTAINER_NAME=strapiDB
BACKUP_INTERVAL=43200  # 12h
MAX_BACKUPS=100

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Pull the alpine image if it's not already available
docker pull alpine

# Infinite loop to create backups every 10 minutes
while true; do
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="$BACKUP_DIR/${VOLUME_NAME}_$TIMESTAMP.tar.gz"
    
    # Perform the backup using alpine
    docker run --rm \
        -v "${VOLUME_NAME}:/volume" \
        -v "${BACKUP_DIR}:/backup" \
        alpine \
        sh -c "tar -czf /backup/$(basename "$BACKUP_FILE") -C /volume ."
    
    # Log the backup completion
    echo "[$(date)] Backup completed: $BACKUP_FILE"

    # Limit backups to the latest 5 files
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR" | wc -l)
    if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
        OLDEST_BACKUP=$(ls -1 "$BACKUP_DIR" | head -n 1)
        rm "$BACKUP_DIR/$OLDEST_BACKUP"
        echo "[$(date)] Removed old backup: $OLDEST_BACKUP"
    fi

    # Wait for the specified interval before the next backup
    sleep $BACKUP_INTERVAL
done
