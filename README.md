**Step 1: Prepare Your Server

**# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Verify installations
docker --version
docker-compose --version

**STEP 2 : Create Project Structure
# Create project directory

mkdir ~/blue-green-deployment
cd ~/blue-green-deployment

# Create necessary folder

mkdir nginx

**STEP 3 : Create .env File

**STEP 4: Create Docker Compose File

**STEP 5 : Create Nginx Configuration Template

**STEP 6 : Create Nginx Entrypoint Script

**STEP 7 : Create the application file Javascript

**STEP 8 : # Test configuration

nginx -t

# Start nginx
exec nginx -g 'daemon off;'

*Save and exit.
# Make it executable
chmod +x nginx/entrypoint.sh

**STEP 9 : Deploy the Application
**Start all services

docker-compose up -d

# Check if containers are running
docker-compose ps

# Check logs if needed
docker-compose logs -f

**Step 10: Test the Deployment
# Test basic connectivity (should show blue)

curl http://localhost:8080/version

# Check headers
curl -i http://localhost:8080/version

# Simulate Blue failure
curl -X POST http://localhost:8081/chaos/start?mode=error

# Test again (should auto-switch to green)
curl http://localhost:8080/version

# Stop chaos
curl -X POST http://localhost:8081/chaos/stop
