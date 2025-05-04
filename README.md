# Minimalexperiment Webapp mit Neo4j, FastAPI und Angular in Docker

Dieses Projekt demonstriert einen minimalen Setup für eine Webanwendung, die eine Neo4j-Datenbank im Backend (FastAPI) nutzt und ein Angular-Frontend bereitstellt. Alle drei Komponenten laufen in separaten Docker-Containern.

## Voraussetzungen

- Docker und Docker Compose müssen installiert sein.

## Installation und Start

1. Klone dieses Repository.
2. Navigiere zum Hauptverzeichnis des Projekts.
3. Starte die Container mit Docker Compose:
   ```bash
   docker-compose up -d

## Setup Produktionsserver
Auf dem Produktionsserver sind ein paar Dinge zu beachten:
* Um auf die Webanwendung über https zugreifen zu können, ist ein reverse proxy wie nginx sinnvoll. Eine mögliche Konfigurationsdatei liegt im Ordner [nginx](nginx/wengenmayr-ahnentafel.backup). Das Zertifikat wird mit Certbot verwaltet.
* Damit die Anfragen aufs Backend mit einem reverse proxy funktionieren, müssen die api URIs in angular relativ statt absolut angegeben werden, also statt "<domain>:8080/api/..." nur "/api/...". Dafür die entsprechende Zeile im api-config Service im [Service](frontend/src/app/api-config.service.ts) nutzen und die Basis URI der Entwicklungsumgebung löschen oder auskommentieren.
* Das Passwort für die Datenbank sollte im Produktivsystem angepasst werden, es wir im [docker-compose file](docker-compose.yml) gesetzt.

In der Nusschale:
1. base-URI im [api-config service](frontend/src/app/api-config.service.ts) auf "/" setzen
2. neo4j Passwort in [docker-compose.yml](docker-compose.yml) neu setzen
