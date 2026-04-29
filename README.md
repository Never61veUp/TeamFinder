# TeamFinder Telegram Mini App

[MiniApp](https://t.me/fasddfsgfdbot)

[Сайт ](https://teamfinder.mixdev.me) (1 dev user на всех, из за отстуствия TgId)

[Документация](https://api.teamfinder.mixdev.me/scalar/)

## Структура
**[/backend]()** - бэкэнд для веб приложения

**[/frontend]()** - веб приложение

# Start up
Для запуска всех 2 сервисов **запустите docker-compse в /backend**:
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
TeamFinder.API          → Web API (Controllers, DI)
TeamFinder.Application  → Логика, сервисы, use-cases
TeamFinder.Core         → Доменные модели (Profile, Team, Review)
TeamFinder.Postgresql   → EF Core, DbContext, Entity-конфигурация
TeamFinder.Contracts   → Record resonse/request

```
