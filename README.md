# Offline-First Ionic Capacitor App (Angular PWA → Mobile)

## Overview

This project demonstrates how to convert an **Angular PWA with offline support** into a **native mobile application** using **Ionic + Capacitor**.

The application supports:

* Offline data storage using **IndexedDB**
* Automatic data synchronization when internet returns
* Native mobile builds for **Android** and **iOS**
* Local development using **json-server**

This architecture is commonly used in **offline-first mobile applications** such as:

* Survey apps
* Field service apps
* Delivery apps
* Banking agent apps

---

# Architecture

```
Angular Form
     ↓
SyncService
     ↓
API Service
     ↓
json-server / Backend
```

Offline flow:

```
User submits form
       ↓
If offline → save to IndexedDB
       ↓
Network returns
       ↓
SyncService.syncOfflineUsers()
       ↓
Send stored data to server
```

---

# Tech Stack

* Angular
* Ionic Framework
* Capacitor
* ngx-indexeddb
* json-server
* Capacitor Network Plugin

---

# Project Structure

```
src/
 ├── app/
 │    ├── components/
 │    │     └── form/
 │    ├── services/
 │    │     ├── api.service.ts
 │    │     ├── indexeddb.service.ts
 │    │     └── sync.service.ts
 │    ├── app.component.ts
 │    └── app.module.ts
 ├── environments
 └── main.ts
```

---

# Offline Storage

Offline users are stored in **IndexedDB**.

Database configuration:

```
Database Name: OFFLINEDB
Store Name: offlineUsers
```

Data is saved when:

```
navigator.onLine === false
```

---

# Synchronization Logic

When internet returns:

```
Network Listener
      ↓
syncOfflineUsers()
      ↓
Send all stored users to API
      ↓
Clear IndexedDB
```

---

# Converting Angular PWA → Ionic + Capacitor

## 1 Install Ionic

```
npm install @ionic/angular
npm install ionicons
```

Update `app.module.ts`:

```
import { IonicModule } from '@ionic/angular';

IonicModule.forRoot()
```

Update root component:

```
<ion-app>
  <router-outlet></router-outlet>
</ion-app>
```

---

# Install Capacitor

```
npm install @capacitor/core @capacitor/cli
```

Initialize Capacitor:

```
npx cap init
```

Example configuration:

```
App name: OfflineApp
App id: com.example.app
Web directory: dist/offline-pwa-app
```

---

# Build Angular Application

```
ng build
```

---

# Add Android Platform

```
npx cap add android
```

Open Android Studio:

```
npx cap open android
```

---

# Add iOS Platform

(macOS required)

```
npx cap add ios
npx cap open ios
```

---

# Mixed Content Issue (HTTP API Fix)

Capacitor serves the app from:

```
https://localhost
```

But json-server runs on:

```
http://localhost:3000
```

Android blocks this by default.

Fix in:

```
android/app/src/main/java/.../MainActivity.java
```

Add:

```
webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
```

Also enable cleartext traffic:

```
android:usesCleartextTraffic="true"
```

in

```
AndroidManifest.xml
```

---

# Running json-server

Install globally:

```
npm install -g json-server
```

Create `db.json`:

```
{
  "users": []
}
```

Start server:

```
json-server --watch db.json --host 0.0.0.0 --port 3000
```

API endpoint:

```
http://localhost:3000/users
```

---

# Android Emulator Networking

The emulator cannot access `localhost`.

Instead use:

```
http://10.0.2.2:3000
```

Mapping:

```
localhost (host machine)
       ↓
10.0.2.2 (Android emulator)
```

---

# Install Capacitor Network Plugin

```
npm install @capacitor/network
npx cap sync
```

Example usage:

```
Network.addListener('networkStatusChange', status => {

  if(status.connected){
     syncOfflineUsers()
  }

});
```

---

# Offline Testing

## Test Offline Mode

1 Disable internet in emulator
2 Submit form
3 Data is saved in IndexedDB

Check IndexedDB using:

```
chrome://inspect
```

Application → IndexedDB → `OFFLINEDB`

---

## Test Sync

1 Turn internet back ON
2 Network listener triggers
3 Offline data syncs to server
4 UI refreshes

---

# Build Android APK

```
ng build
npx cap copy
npx cap open android
```

Then build APK from Android Studio.

---

# Build iOS App

(macOS required)

```
ng build
npx cap copy
npx cap open ios
```

Build from Xcode.

---

# Final Architecture

```
Angular + Ionic UI
        ↓
IndexedDB (Offline Queue)
        ↓
Capacitor Network Plugin
        ↓
SyncService
        ↓
Backend API
```

---

# Features

* Offline form submission
* IndexedDB storage
* Automatic sync when internet returns
* Android and iOS builds
* PWA compatibility

---

# Future Improvements

* SQLite storage for large datasets
* Request queue system
* Background sync tasks
* Push notifications
* Conflict resolution

---

# Author

**Vivek Kumar Biswal**
