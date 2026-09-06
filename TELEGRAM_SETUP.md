# Надсилання заявок у Telegram

Форма на сайті надсилає `POST /api/contact`. Файл `api/contact.js` — це serverless-функція для Vercel: вона тримає токен бота на сервері та пересилає заявку в Telegram-групу.

## Налаштування

1. Імпортуйте цей репозиторій у Vercel та розгорніть сайт. Якщо сайт і функція працюють на одному Vercel-домені, у `index.html` нічого змінювати не треба.
2. Створіть бота через [@BotFather](https://t.me/BotFather), додайте його в потрібну Telegram-групу та дозвольте йому надсилати повідомлення.
3. Надішліть у групі команду для бота, відкрийте `https://api.telegram.org/botВАШ_ТОКЕН/getUpdates` і знайдіть значення `chat.id` групи. Для супергруп воно зазвичай починається з `-100`.
4. У Vercel → **Settings → Environment Variables** додайте значення з `.env.example`:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
5. Перерозгорніть сайт і надішліть тестову форму.

## Якщо сайт лишається на GitHub Pages

Розгорніть цей самий репозиторій також у Vercel лише для endpoint. Потім замініть у `index.html` значення:

```html
data-endpoint="https://ВАШ-VERCEL-ПРОЄКТ.vercel.app/api/contact"
```

та додайте домен GitHub Pages, наприклад `https://username.github.io`, у змінну `ALLOWED_ORIGINS` на Vercel.

Не вставляйте токен бота в HTML або JavaScript: тоді будь-хто зможе його побачити та використати.
