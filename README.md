# Glimmer

Браузерная 2D игра-платформер.

## Установка Node.js

1. Скачай Node.js: https://nodejs.org
2. Установи

## Установка MongoDB

1. Скачай MongoDB: https://www.mongodb.com/try/download/community
2. Установи
3. Запусти БД: `net start MongoDB`

## Настройка окружения

Создай файл `.env` в папке `server` и добавь в него:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/glimmer_db
```

## Как запустить
```bash
cd server
npm install
npm run dev

cd client
npm install
npm run dev