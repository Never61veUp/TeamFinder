# Start up
Для запуска всех 3 сервисов **запустите docker-compse в /backend**:
```$env:TELEGRAM_BOT_TOKEN="token"
$env:JWT_KEY="at_least_32_chars"
$env:ASPNETCORE_ENVIRONMENT = ""
$env:GITHUB_CLIENT_SECRET=""
$env:GITHUB_CLIENT_ID=""
$env:ENABLE_DEV_AUTH=""
docker compose -f compose.yaml up --build 
```
# Backend (C#)

## 🚀 Технологии

### **Основной стек**

* ASP.NET Core Web API (.NET 10)
* Entity Framework Core + PostgreSQL

### **Инфраструктура**

* Docker / Docker Compose
* Npgsql

---

## 📦 Архитектура

Проект разделён на слои:

```
TeamFinder.Host         → Web API (Controllers, DI)
TeamFinder.Application  → Логика, сервисы, use-cases
TeamFinder.Core         → Доменные модели (Profile, Team, Review)
TeamFinder.Postgresql   → EF Core, DbContext, Entity-конфигурация

```
