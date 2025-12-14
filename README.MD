# Struktura projektu

```
projekt/
├── docker-compose.yml
├── db/
│   ├── init.sql
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── main.py
└── frontend/
    ├── Dockerfile
    └── index.html
```

# Uruchomienie

1. Utwórz powyższą strukturę folderów
2. Skopiuj pliki do odpowiednich lokalizacji
3. Uruchom:

```bash
docker-compose up --build
```

4. Otwórz przeglądarkę: `http://localhost`

# Zatrzymanie

```bash
docker-compose down
```

# Usunięcie danych

```bash
docker-compose down -v
```