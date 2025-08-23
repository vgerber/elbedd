#!/bin/sh

# Ensure cache directory exists and has proper permissions
mkdir -p /app/cache

# Check if we can write to the cache directory
if [ ! -w /app/cache ]; then
    echo "Warning: Cannot write to /app/cache directory. Cache will be disabled."
    echo "To fix this, ensure the mounted volume has proper permissions:"
    echo "  sudo chown -R 1001:1001 ./cache"
    echo "  OR run: docker run --user 1001:1001 ..."
fi

# Start the Next.js application
exec "$@"
