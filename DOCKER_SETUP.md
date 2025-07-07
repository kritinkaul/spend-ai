# 🐳 Docker Setup Guide

This guide will help you install Docker to use the full PostgreSQL setup for SpendAI.

## 🎯 Why Docker?

Docker allows you to run PostgreSQL and Redis locally without installing them directly on your system. This is the recommended approach for development as it:

- **Isolates services** - No conflicts with other applications
- **Easy cleanup** - Remove everything with one command
- **Consistent environment** - Works the same on any machine
- **Production-like** - Similar to how you'd deploy in production

## 📦 Installation

### macOS
1. **Download Docker Desktop** from [docker.com](https://www.docker.com/products/docker-desktop/)
2. **Install the .dmg file**
3. **Start Docker Desktop** from Applications
4. **Verify installation**:
   ```bash
   docker --version
   docker-compose --version
   ```

### Windows
1. **Download Docker Desktop** from [docker.com](https://www.docker.com/products/docker-desktop/)
2. **Install Docker Desktop**
3. **Enable WSL 2** (if prompted)
4. **Start Docker Desktop**
5. **Verify installation**:
   ```bash
   docker --version
   docker-compose --version
   ```

### Linux (Ubuntu/Debian)
```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

## 🚀 After Installation

1. **Start Docker Desktop** (macOS/Windows) or **Docker service** (Linux)
2. **Verify Docker is running**:
   ```bash
   docker info
   ```
3. **Run the full setup**:
   ```bash
   ./start-dev.sh
   ```

## 🔧 Alternative: Manual PostgreSQL Installation

If you prefer not to use Docker, you can install PostgreSQL directly:

### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Create database
createdb spendai

# Create user (optional)
createuser -s postgres
```

### Ubuntu/Debian
```bash
# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE spendai;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE spendai TO postgres;
\q
```

### Windows
1. **Download PostgreSQL** from [postgresql.org](https://www.postgresql.org/download/windows/)
2. **Run the installer**
3. **Set password** for postgres user
4. **Create database** using pgAdmin or command line

## 🎯 Quick Test

After installing Docker or PostgreSQL, test the setup:

```bash
# If using Docker
./start-dev.sh

# If using manual PostgreSQL
./start-dev-simple.sh
```

## 🆘 Troubleshooting

### Docker Issues
- **Docker not running**: Start Docker Desktop/Service
- **Permission denied**: Add user to docker group (Linux)
- **Port conflicts**: Stop other services using ports 5432, 6379

### PostgreSQL Issues
- **Connection refused**: Check if PostgreSQL is running
- **Authentication failed**: Check username/password in .env
- **Database not found**: Create the database manually

## 📚 Next Steps

Once Docker is installed and working:

1. **Run the full setup**: `./start-dev.sh`
2. **Explore the application**: http://localhost:3000
3. **Check the database**: Use Prisma Studio or pgAdmin
4. **Deploy to production**: Follow the DEPLOYMENT.md guide

---

**Docker makes development much easier and more professional! 🐳** 