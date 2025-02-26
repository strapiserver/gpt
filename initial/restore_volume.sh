#!/bin/bash

BACKUP_DIR=~/strapi_backups
VOLUME_NAME=strapi_strapi-data
CONTAINER_NAME=strapiDB

# Pull the alpine image if it's not already available
docker pull alpine > /dev/null

# Find the most recent backup file
LATEST_BACKUP=$(ls -t "$BACKUP_DIR" | head -n 1)

if [ -n "$LATEST_BACKUP" ]; then
    # Stop the container to ensure the volume is not in use
    docker stop "$CONTAINER_NAME"
    
    # Restore the backup to the volume
    if docker run --rm \
        -v ${VOLUME_NAME}:/volume \
        -v ${BACKUP_DIR}:/backup \
        alpine \
        sh -c "tar -xzf /backup/$LATEST_BACKUP -C /volume"; then
        echo "[$(date)] Restored from $LATEST_BACKUP"
    else
        echo "[$(date)] Restore failed for $LATEST_BACKUP" >&2
    fi

    # Restart the container
    docker start "$CONTAINER_NAME"
else
    echo "No backup files found in $BACKUP_DIR."
fi
