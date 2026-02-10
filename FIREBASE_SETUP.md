# Firebase Google Authentication Setup

## Step 1: Enable Google Sign-In in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create one named "letsrendez")
3. Go to **Authentication** → **Sign-in method**
4. Click on **Google**
5. Toggle **Enable**
6. Enter your project support email
7. Click **Save**

## Step 2: Get Your Firebase Config

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click **Add app** → **Web** (</> icon)
4. Register your app with nickname: "Let's Rendez Web"
5. Copy the `firebaseConfig` object

## Step 3: Add Config to Your App

Open `src/services/firebase.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 4: Configure Authorized Domains (for Web)

1. In Firebase Console → **Authentication** → **Settings**
2. Scroll to **Authorized domains**
3. Add your domains:
   - `localhost` (for local development)
   - `letsrendez.app` (your production domain)
   - `letsrendez.vercel.app` (if using Vercel)

## Step 5: Test It!

```bash
npm start
# Press 'w' for web
# Or scan QR code with Expo Go on mobile
```

Click "Sign in with Google" and you should see the Google sign-in popup!

## Troubleshooting

**"Popup blocked" error:**
- Make sure you're testing on `localhost` or an authorized domain
- Check browser popup blocker settings

**"Invalid API key" error:**
- Double-check your Firebase config values
- Make sure you copied the Web app config (not iOS/Android)

**Mobile doesn't work:**
- For Expo Go, Google Sign-In uses web redirect
- For production builds, you'll need to configure native Google Sign-In

## Next Steps

After authentication works:
1. Save user data to Firestore
2. Create user profile screen
3. Link trips to user accounts
4. Add group member invitations
