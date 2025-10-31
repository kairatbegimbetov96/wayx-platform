

## CRM + Биржа (добавлено)
- `/market` — публичная биржа заявок
- `/requests/new` — ручное создание заявки (упрощённая/расширенная, параметры по каждому виду транспорта)
- `/crm` — домашняя CRM
- `/crm/requests` и `/crm/requests/[id]` — список и карточка заявки с приёмом ставок, принятием ставки и созданием сделки
- `/crm/bids` — мои ставки
- `/crm/deals` — мои сделки

### Требуемые ENV (Vercel → Settings → Environment Variables)
- NEXT_PUBLIC_APP_NAME
- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET (формат `<project-id>.appspot.com`)
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

### Firestore коллекции
- `requests` (заявки)
- `bids` (ставки)
- `deals` (сделки)

> Права доступа зависят от ваших `firestore.rules`. Для быстрых тестов можно разрешить автору создавать/читать свои заявки, а всем авторизованным — создавать ставки; прод-правила настройте строже.
