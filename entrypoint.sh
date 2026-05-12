#!/bin/sh
set -e

echo "Waiting for database to be ready..."

# Extract host and port from DATABASE_URL
# Example: postgresql://user:pass@hms-db:5432/dbname
DB_HOST=$(echo $DATABASE_URL | sed -n 's|.*@\([^:]*\):.*|\1|p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's|.*:\([0-9]*\)/.*|\1|p')

if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ]; then
    echo "ERROR: Could not parse DATABASE_URL. Ensure it is in format: postgresql://user:pass@host:port/db"
    exit 1
fi

echo "Checking connection to $DB_HOST:$DB_PORT"

# Use nc (netcat) to check if the port is open. 
# If nc is not available, use node's net module.
until node -e "
const net = require('net');
const client = new net.Socket();
client.setTimeout(2000);
client.connect($DB_PORT, '$DB_HOST', () => {
  console.log('Connected to DB');
  client.destroy();
  process.exit(0);
});
client.on('error', (err) => {
  console.error('Connection failed:', err.message);
  process.exit(1);
});
" 2>/dev/null; do
  echo "Database not ready, retrying in 2s..."
  sleep 2
done

echo "Database is ready. Running migrations..."
./node_modules/.bin/prisma migrate deploy

echo "Starting Next.js server..."
exec node server.js