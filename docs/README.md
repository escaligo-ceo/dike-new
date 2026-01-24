# Dike

- node: 22.14.0 (">=22.14.0 <23")
- yarn: 4.9.4

## Installation

### NVM

Node Version Manager

### curl command

'''bash
sudo apt install curl
''''

then run:

'''bash'
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
''''

### Node

nvm install 22.14.0
nvm use 22.14.0

### Yarn

corepack enable
corepack prepare yarn@4.9.4 --activate

### Postgres

Install PostgreSQL from https://pgadmin-archive.postgresql.org/pgadmin4/apt/trixie/dists/pgadmin4/main/binary-amd64/index.html download:

- [pgadmin4-desktop_9.10_amd64.deb](https://pgadmin-archive.postgresql.org/pgadmin4/apt/trixie/dists/pgadmin4/main/binary-amd64/pgadmin4-desktop_9.10-1.trixie_amd64.deb)
- [pgadmin4-server_9.10_amd64.deb](https://pgadmin-archive.postgresql.org/pgadmin4/apt/trixie/dists/pgadmin4/main/binary-amd64/pgadmin4-server_9.10-1.trixie_amd64.deb)

Then install it with:

```bash
sudo apt install ./pgadmin4-server_9.10_amd64.deb ./pgadmin4-desktop_9.10_amd64.deb
```

### NestJS CLI

```bash
npm install -g @nestjs/cli
```

### Docker

follow instructions at https://docs.docker.com/engine/install/ubuntu/

### .env files

Run the following commands to create the necessary .env files:

```bash
./scripts/copy-env-files.sh
```

### Angular CLI

Il frontend uses Angular, so you need to install the Angular CLI globally:

```bash
npm install -g @angular/cli
```
