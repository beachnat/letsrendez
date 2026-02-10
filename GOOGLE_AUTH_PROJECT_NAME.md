# Google Auth Project Name - Should You Change It?

## What You're Seeing

**"project-746411749598"** - This is likely the **OAuth consent screen project name** that appears when users sign in with Google.

## Will Users See This?

**YES** - Users WILL see this when they:
1. Click "Sign in with Google"
2. See the Google sign-in popup
3. The popup shows: "project-746411749598 wants to access your Google account"

**This looks unprofessional and confusing!** 😬

## Should You Change It?

### ✅ **YES - Change It to "Let's Rendez"**

**Why:**
- Users see this during sign-in
- "project-746411749598" looks like a technical error
- "Let's Rendez" is professional and matches your brand
- Builds trust with users

## How to Change It

### Step 1: Go to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Make sure you're in the **letsrendez** project
3. If you don't see it, select it from the project dropdown at the top

### Step 2: Configure OAuth Consent Screen

1. In the left menu, go to **APIs & Services** → **OAuth consent screen**
2. Or go directly to:
   ```
   https://console.cloud.google.com/apis/credentials/consent?project=letsrendez
   ```

### Step 3: Update App Information

**User Type:**
- Select **External** (unless you have a Google Workspace account)
- Click **Create**

**App Information:**
- **App name:** `Let's Rendez` ← Change this!
- **User support email:** Your email
- **App logo:** (Optional - can add later)
- **App domain:** (Optional for now)
- **Developer contact:** Your email

**Scopes:**
- Click **Add or Remove Scopes**
- You should see default scopes (email, profile, openid)
- Click **Update** then **Save and Continue**

**Test users:** (Optional for now)
- Click **Save and Continue**

**Summary:**
- Review and click **Back to Dashboard**

## What Users Will See After

**Before:**
- "project-746411749598 wants to access your Google account" ❌

**After:**
- "Let's Rendez wants to access your Google account" ✅

Much better!

## Important Notes

**OAuth Consent Screen Status:**
- **Testing:** Only you and test users can sign in (good for development)
- **In Production:** Anyone can sign in (needed for public launch)

**For MVP/Testing:**
- Keep it in "Testing" mode
- Add yourself as a test user
- This is fine for now

**For Public Launch:**
- Submit for verification (if needed)
- Or keep it simple and don't request sensitive scopes
- Email/profile scopes usually don't need verification

## Quick Checklist

- [ ] Go to Google Cloud Console
- [ ] Navigate to OAuth consent screen
- [ ] Change app name to "Let's Rendez"
- [ ] Add your email as support email
- [ ] Save changes
- [ ] Test sign-in - should now show "Let's Rendez" ✅

## Bottom Line

**YES, change it!** Users will see this name, so make it professional:
- Change from: "project-746411749598"
- Change to: "Let's Rendez"

This takes 2 minutes and makes a huge difference in user trust! 🚀
