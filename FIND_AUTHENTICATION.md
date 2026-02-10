# How to Find Authentication in Firebase Console

## Step-by-Step Navigation

### Option 1: Left Sidebar Menu

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Make sure you're logged in with your Google account
3. Select your **letsrendez** project from the project list
4. Look at the **left sidebar menu** - you should see:
   - 🏠 Overview
   - 🔥 Build (expandable)
   - 📊 Analytics (expandable)
   - ⚙️ Settings (gear icon)

5. Under **Build**, click on **Authentication**
   - If you don't see "Build", it might be collapsed - click to expand it
   - Or look for icons: Authentication usually has a 🔐 or 👤 icon

### Option 2: Direct URL

Try going directly to:
```
https://console.firebase.google.com/project/letsrendez/authentication
```

Replace `letsrendez` with your exact project ID if different.

### Option 3: Search Bar

1. In Firebase Console, look for a **search bar** at the top
2. Type "Authentication" or "auth"
3. Click on the Authentication result

### Option 4: If You Don't See It

**If Authentication is missing entirely:**

1. Go to **⚙️ Settings** → **Project Settings**
2. Check that you're in the correct project
3. Make sure you have **Editor** or **Owner** permissions
4. Try refreshing the page
5. Try a different browser or incognito mode

**If you see "Get Started" instead:**

1. Click **Get Started** or **Enable Authentication**
2. This will set up Authentication for your project
3. Then you'll see the Authentication dashboard

## What You Should See

Once you're in Authentication, you should see tabs:
- **Users** (list of users)
- **Sign-in method** ← **This is what you need!**
- **Templates**
- **Usage**

Click on **Sign-in method** tab.

## Enable Google Sign-In

1. In the **Sign-in method** tab, you'll see a list of providers
2. Find **Google** in the list
3. Click on **Google** (or the pencil/edit icon)
4. Toggle the **Enable** switch to ON
5. Enter your project support email (or leave default)
6. Click **Save**

## Still Can't Find It?

**Check:**
- Are you logged into the correct Google account?
- Is this the right Firebase project?
- Do you have permission to edit the project?
- Try clearing browser cache and refreshing

**Alternative:**
- Ask someone with project access to enable it
- Or create a new Firebase project if this one has issues

## Screenshot Locations

The Authentication menu item is typically:
- In the left sidebar under "Build" section
- Or in the main navigation menu
- Look for icons: 🔐 👤 🔑 or text "Authentication"

Let me know what you see in your Firebase Console and I can help further!
