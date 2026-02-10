# Authentication Providers Setup Guide

## Who Uses This?

**End users of your Let's Rendez app** - the people who will:
- Create trips
- Plan group vacations
- Sign in to access their trips
- Invite friends to trips

This is NOT just for you as the developer. Every user who downloads/uses your app will sign in with these providers.

## Which Providers to Enable

### ✅ **Google Sign-In** (REQUIRED - Enable This!)

**Why:** This is what we've built into the app. It's the primary sign-in method.

**How to enable:**
1. In Authentication → Sign-in method
2. Click on **Google**
3. Toggle **Enable** to ON
4. Enter your project support email (or leave default)
5. Click **Save**

**User experience:**
- Users click "Sign in with Google"
- They see Google's sign-in popup
- They choose their Google account
- They're signed in instantly

### ✅ **Email/Password** (RECOMMENDED - Enable This Too!)

**Why:** Some users prefer email/password over Google. Good backup option.

**How to enable:**
1. In Authentication → Sign-in method
2. Click on **Email/Password**
3. Toggle **Enable** to ON
4. Click **Save**

**Note:** We haven't built the email/password UI yet, but enabling it now is good for future.

### ⚠️ **Apple Sign-In** (OPTIONAL - For Later)

**Why:** Required if you want to submit to iOS App Store (Apple's requirement)

**When to enable:** 
- When you're ready to build iOS app
- Not needed for web or MVP testing

**How to enable:**
1. Requires Apple Developer account ($99/year)
2. Need to configure in Apple Developer Console first
3. Then enable in Firebase

**For now:** Skip this - you can add it later.

### ❌ **Other Providers** (Skip for Now)

- Facebook, Twitter, GitHub, etc.
- You can add these later if users request them
- Not needed for MVP

## Recommended Setup for MVP

**Enable these two:**
1. ✅ **Google Sign-In** ← Primary method (already built)
2. ✅ **Email/Password** ← Backup option (can build UI later)

**Skip for now:**
- Apple Sign-In (add when building iOS app)
- Other providers (add if needed later)

## What Happens When Users Sign In?

1. **User opens your app** (web or mobile)
2. **Sees AuthScreen** with "Sign in with Google" button
3. **Clicks button** → Google popup appears
4. **Chooses Google account** → Signs in
5. **Redirected to Dashboard** → Can create trips

## Security Note

Firebase handles all the security:
- Passwords are encrypted
- Google OAuth is secure
- User data is protected
- You don't store passwords yourself

## Next Steps After Enabling

1. ✅ Enable Google Sign-In in Firebase Console
2. ✅ Test it: Run `npm start` → Press 'w' → Click "Sign in with Google"
3. ✅ Verify: You should see your email in the Dashboard after signing in

That's it! Once Google Sign-In is enabled, your app authentication will work.
