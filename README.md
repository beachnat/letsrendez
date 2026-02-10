# Let's Rendez - Group Trip Planning App

Group travel, elevated.

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

Then:
- Press `w` to open in web browser
- Press `i` to open iOS simulator (requires Xcode)
- Press `a` to open Android emulator (requires Android Studio)
- Scan QR code with Expo Go app on your phone

### Run on Web

```bash
npm run web
```

### Run on Mobile

```bash
# iOS
npm run ios

# Android
npm run android
```

## Project Structure

```
letsrendez/
├── src/
│   ├── screens/          # App screens
│   │   ├── TripCreationScreen.js
│   │   └── DashboardScreen.js
│   ├── components/       # Reusable UI components
│   ├── services/         # API integrations
│   │   ├── firebase.js
│   │   └── flights.js
│   └── navigation/       # Navigation setup
├── App.js                # Entry point
├── app.json              # Expo configuration
└── package.json
```

## Next Steps

1. **Set up Firebase**: Create project at firebase.google.com
2. **Get API credentials**: Sign up for Amadeus, Booking.com, etc.
3. **Add credentials**: Copy `.env.example` to `.env` and fill in values
4. **Build features**: See `/docs` folder for detailed documentation

## Documentation

See `/docs` folder for:
- Business plan
- Tech stack guide
- API integrations
- Next steps

## Support

For questions, see the documentation in `/docs` folder.
