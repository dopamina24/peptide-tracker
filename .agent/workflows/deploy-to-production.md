---
description: Deploy PeptideTracker to production (Vercel + Supabase)
---

# Deploy PeptideTracker a Producción

## Stack
- **Frontend**: Next.js 15 → Vercel (gratis)
- **Backend/DB**: Supabase (ya en la nube)
- **App móvil**: PWA (instalar desde el navegador) o Capacitor (APK/IPA nativo)

---

## PASO 1 — Preparar el repositorio en GitHub

1. Crear cuenta en https://github.com si no tienes
2. Crear repo nuevo (privado o público)
3. Subir el código:
```
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/peptide-tracker.git
git push -u origin main
```

---

## PASO 2 — Deploy en Vercel (gratis, automático)

1. Ir a https://vercel.com → Sign up con GitHub
2. Click "Add New Project"
3. Importar tu repositorio `peptide-tracker`
4. En **"Root Directory"** escribir: `apps/web`
5. En **"Environment Variables"** agregar:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://TU_PROYECTO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = tu_anon_key_aqui
   NEXT_PUBLIC_SITE_URL = https://TU_APP.vercel.app
   ```
6. Click **Deploy**
7. ¡Listo! Vercel te da una URL tipo `peptide-tracker-xxx.vercel.app`

> Cada vez que hagas `git push` a main, Vercel redespliega automáticamente.

---

## PASO 3 — Configurar dominio propio (opcional, ~$12/año)

1. Comprar dominio en https://namecheap.com o https://porkbun.com
2. En Vercel → Settings → Domains → agregar tu dominio
3. Apuntar los DNS según indique Vercel (tarda 1-24h)

---

## PASO 4 — Actualizar Supabase con tu URL de producción

En Supabase Dashboard:
1. **Authentication → URL Configuration**
   - Site URL: `https://tu-dominio.com` (o URL de Vercel)
   - Redirect URLs: agregar `https://tu-dominio.com/auth/callback`

2. **Authentication → Providers → Google**
   - Añadir tu URL de producción a las URIs autorizadas en Google Console

---

## PASO 5 — Instalar como App (PWA — "instalar en pantalla de inicio")

La app ya funciona como PWA. Para mejorar la experiencia:

```
npm install next-pwa --save-dev
```

Agregar `manifest.json` para que iOS/Android muestren el ícono correcto.

### En iPhone/iPad:
1. Abrir la web en Safari
2. Botón compartir (cuadrado con flecha) → "Agregar a pantalla de inicio"
3. La app aparece como ícono nativo

### En Android:
1. Abrir en Chrome
2. Menú ⋮ → "Agregar a pantalla de inicio" o banner automático

---

## PASO 6 (opcional) — App nativa con Capacitor

Si quieres publicar en App Store / Google Play:

```
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init PeptideTracker com.tuempresa.peptidetracker
npm run build
npx cap add ios
npx cap add android
npx cap sync
npx cap open ios      # Abre Xcode
npx cap open android  # Abre Android Studio
```

Requisitos:
- iOS: Mac + Xcode + cuenta Apple Developer ($99/año)
- Android: Android Studio (gratis, Google Play ~$25 único pago)
