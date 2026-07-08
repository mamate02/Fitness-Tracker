# Trainings-Tracker (PWA)

Eine installierbare Web-App zum Tracken von Krafttraining: Trainings erstellen,
Übungen mit beliebig vielen Sätzen (inkl. Gewicht) erfassen, Trainingsverlauf
einsehen und Fortschritt pro Übung als Diagramm ansehen.

Alle Daten werden **lokal im Browser** gespeichert (kein Server, kein Account
nötig). Läuft komplett offline, sobald die Seite einmal geladen wurde.

## Struktur

```
fitness-pwa/
  index.html            App-Grundgerüst + Navigation
  manifest.json          PWA-Konfiguration (Name, Icon, Startbildschirm)
  service-worker.js       Offline-Caching
  css/style.css           Design
  js/
    app.js                Routing zwischen den 4 Ansichten
    db.js                 Datenhaltung (localStorage)
    views/
      home.js             Startseite: "Neues Training" + Wochenstatistik
      training.js          Aktives Training: Übungen + Sätze erfassen
      activities.js         Trainingsverlauf (Aktivitäten)
      statistics.js         Diagramme pro Übung
  icons/                  App-Icons (192px, 512px)
```

## So bringst du die App online (GitHub Pages)

### 1. Neues GitHub-Repository erstellen

1. Auf github.com einloggen, oben rechts auf **"+"** → **"New repository"**
2. Name vergeben, z. B. `fitness-tracker`
3. Auf **"Create repository"** klicken (Repo kann public oder private sein –
   GitHub Pages funktioniert bei beiden, bei privaten Repos ist eventuell ein
   bezahlter Plan nötig, daher empfiehlt sich **public**)

### 2. Dateien hochladen

Am einfachsten über die Weboberfläche:
1. Im leeren Repository auf **"uploading an existing file"** klicken
2. Den kompletten Inhalt dieses `fitness-pwa`-Ordners hineinziehen
   (Ordnerstruktur bleibt beim Drag & Drop erhalten)
3. Unten auf **"Commit changes"** klicken

Alternativ über die Kommandozeile:
```bash
cd fitness-pwa
git init
git add .
git commit -m "Erste Version"
git branch -M main
git remote add origin https://github.com/<dein-username>/fitness-tracker.git
git push -u origin main
```

### 3. GitHub Pages aktivieren

1. Im Repository auf **"Settings"** gehen
2. Links im Menü **"Pages"** auswählen
3. Unter **"Build and deployment"** → **"Source"**: **"Deploy from a branch"** wählen
4. Branch: **"main"**, Ordner: **"/ (root)"** auswählen, dann **"Save"**
5. Nach ca. 1 Minute erscheint oben eine URL wie:
   `https://<dein-username>.github.io/fitness-tracker/`

### 4. App auf dem iPhone installieren

1. Die URL aus Schritt 3 in **Safari** öffnen (wichtig: Safari, nicht Chrome)
2. Auf das **Teilen-Symbol** (Quadrat mit Pfeil nach oben) tippen
3. **"Zum Home-Bildschirm"** auswählen
4. Bestätigen

Die App liegt danach mit eigenem Icon auf deinem Homescreen, startet im
Vollbild (ohne Safari-Leiste) und funktioniert auch offline.

## Änderungen später aktualisieren

Einfach die geänderten Dateien im GitHub-Repo committen/hochladen – GitHub
Pages aktualisiert die Seite automatisch innerhalb von ca. einer Minute.
Da die App einen Service Worker nutzt, kann es auf dem Handy helfen, sie
einmal komplett zu schließen und neu zu öffnen, damit die neue Version
geladen wird.

## Datenmodell (falls du weiterbauen willst)

```js
exercises: [{ id, name }]
workouts: [{
  id,
  date,               // YYYY-MM-DD
  entries: [{
    exerciseId,
    sets: [{ weight }] // beliebig viele Sätze, je mit eigenem Gewicht
  }]
}]
```

Die Statistik-Ansicht berechnet pro Training und Übung:
- **Sätze** = Anzahl der Sätze in diesem Training
- **Gesamtgewicht** = Summe aller Satzgewichte in diesem Training (kumulativ)

Beide Werte werden im gleichen Diagramm überlagert dargestellt (Balken für
Sätze, Linie für Gesamtgewicht, mit zwei y-Achsen).
