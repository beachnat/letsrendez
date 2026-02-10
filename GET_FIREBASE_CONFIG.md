# Quick Guide: Get Your Firebase Config

## Option 1: If you already have a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the **gear icon** (⚙️) → **Project Settings**
4. Scroll down to **Your apps** section
5. If you see a **Web app** (</> icon), click on it
6. You'll see your config in a code block like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

**Copy all 6 values!**

## Option 2: If you need to create a Web app

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the **gear icon** (⚙️) → **Project Settings**
4. Scroll to **Your apps** section
5. Click **Add app** → **Web** (</> icon)
6. Register app with nickname: **"Let's Rendez Web"**
7. **Don't check** "Also set up Firebase Hosting" (we'll use Vercel)
8. Click **Register app**
9. Copy the `firebaseConfig` object shown

## Enable Google Sign-In (if not done yet)

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Google**
3. Toggle **Enable**
4. Enter your project support email
5. Click **Save**

## Next: Paste your config below

Once you have your config values, I'll help you add them to the app!
