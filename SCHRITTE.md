# chat_app – Schritte zur Umsetzung

Django-Backend mit Chat-API + Frontend in HTML, CSS und JavaScript.

## Starten

```bash
# Terminal 1 – Backend (http://127.0.0.1:8000)
cd backend
venv/Scripts/python.exe manage.py runserver

# Terminal 2 – Frontend (http://127.0.0.1:5500)
cd frontend
python -m http.server 5500 --bind 127.0.0.1
```

Dann im Browser `http://127.0.0.1:5500` öffnen.

Neu aufsetzen (ohne venv):

```bash
cd backend
python -m venv venv
venv/Scripts/python.exe -m pip install -r requirements.txt
venv/Scripts/python.exe manage.py migrate
```

## Teil 1: Backend

1. **Projekt `core` und App `chat_app` angelegt**
   ```bash
   venv/Scripts/python.exe -m django startproject core .
   venv/Scripts/python.exe manage.py startapp chat_app
   ```
   Merksatz: `core` ist die Zentrale (Einstellungen, Haupt-URLs), `chat_app` ist die App mit dem Chat.

2. **CORS eingerichtet** ([backend/core/settings.py](backend/core/settings.py))
   - `django-cors-headers` installiert
   - `'corsheaders'` und `'chat_app'` in `INSTALLED_APPS`
   - `'corsheaders.middleware.CorsMiddleware'` ganz oben in `MIDDLEWARE`
   - `CORS_ALLOWED_ORIGINS` erlaubt nur das Frontend auf Port 5500

   Merksatz: Frontend (Port 5500) und Backend (Port 8000) sind für den Browser zwei verschiedene Seiten. Ohne CORS blockt er die Antwort.

3. **Model `Chat`** ([backend/chat_app/models.py](backend/chat_app/models.py))
   - `name` – Text, max. 30 Zeichen, mindestens 2 (Validator)
   - `message` – Text, max. 500 Zeichen, darf nicht leer sein
   - `created_at` – Zeitpunkt, wird beim Speichern automatisch gesetzt (`auto_now_add`)

4. **Migrationen**
   ```bash
   venv/Scripts/python.exe manage.py makemigrations chat_app
   venv/Scripts/python.exe manage.py migrate
   ```

5. **View `chat_view`** ([backend/chat_app/views.py](backend/chat_app/views.py))
   - `GET` → alle Nachrichten als JSON-Liste
   - `POST` → JSON lesen, mit `full_clean()` prüfen, speichern, `201` zurück
   - Fehlerhafte Eingabe → `400` mit den Fehlermeldungen
   - Andere Methoden (z. B. `DELETE`) → `405`
   - `@csrf_exempt`, weil das Frontend von einer anderen Adresse kommt und keine Django-Formulare benutzt

6. **URLs**
   - [backend/core/urls.py](backend/core/urls.py): `path('chat/', include('chat_app.urls'))`
   - [backend/chat_app/urls.py](backend/chat_app/urls.py): `path('', views.chat_view)`

   Ergebnis: die API liegt unter `http://127.0.0.1:8000/chat/`.

## Teil 2: Frontend (HTML, CSS, JavaScript)

- [frontend/index.html](frontend/index.html) – Nachrichtenliste + Formular (Name, Nachricht, Senden)
- [frontend/style.css](frontend/style.css) – helles Design, alle Abstände/Rahmen/Radien im 4er-Raster
- [frontend/script.js](frontend/script.js)
  - `loadMessages()` holt per `fetch` (GET) alle Nachrichten und baut sie mit `renderMessages()` in die Liste
  - `sendMessage()` schickt per `fetch` (POST) Name + Nachricht als JSON
  - Fehler vom Backend (`400`) werden unter dem Formular angezeigt
  - alle 3 Sekunden wird neu geladen (`setInterval`), so erscheinen Nachrichten von anderen
  - Text kommt über `textContent` in die Seite, nicht über `innerHTML` – so kann niemand HTML einschleusen
  - der Name wird im `localStorage` gemerkt

## Teil 3: Test

- API mit `curl` geprüft: GET, POST, Validierung (`400`), kaputtes JSON (`400`), `DELETE` (`405`), CORS-Preflight
- Frontend im Browser geprüft: Nachricht senden, Anzeige, Fehlermeldung bei zu kurzem Namen
- Admin-Bereich: `venv/Scripts/python.exe manage.py createsuperuser`, dann `http://127.0.0.1:8000/admin/`
