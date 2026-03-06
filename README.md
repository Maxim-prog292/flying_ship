# Flying Ship (kiosk prototype)

Минимальный фронтенд-проект на **Vite + TypeScript** для киоск-сценария `1920x1080`.

## Модульная структура

- `src/app` — state machine экранов (`attract`, `build`, `trial`, `result`, `auto-reset`).
- `src/ui` — overlay-интерфейс и touch-first кнопки.
- `src/scene` — базовая Three.js сцена.
- `src/game` — игровые механики/переходы состояний.
- `src/config` — JSON-данные экранов.

## Команды

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Запуск

1. Установить зависимости: `npm install`.
2. Запустить dev-сервер: `npm run dev`.
3. Открыть `http://localhost:5173`.

Для киоска в Full HD рекомендуется полноэкранный режим браузера. Макет фиксируется в пропорции `16:9` и масштабируется под доступную область экрана.
