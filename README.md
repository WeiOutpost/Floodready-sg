# FloodReady SG

A gamified flash flood preparedness app for Singapore, built with React Native and Expo.

Developed for **CM3070 Final Project**, using template **10.1: Developing a Mobile App for Local Disaster Preparedness and Response** (CM3050 Mobile Development).

## Snack Link
(https://snack.expo.dev/@kwhtan001/dd6a5a)

## Features
- **Live rainfall** from your nearest NEA weather station, with light, moderate and heavy rain labels
- **Live flood alerts** from PUB, with a clear error state if the data can't be loaded
- **Location-based notifications** for flood alerts within 5 km and for heavy rain near you
- **Gamified learning:** quizzes in 5 categories, XP, levels and badges
- **Preparedness checklist** and a preparedness score combining learning and real-world actions
- **Resource Hub** with flood safety guidance for before, during and after a flood
- **Flood map** with regional rainfall

## Tech stack
- React Native 0.81 with Expo SDK 54 (JavaScript)
- React Navigation (native stack)
- AsyncStorage for local persistence
- expo-location, expo-notifications, react-native-maps, react-native-svg
- data.gov.sg real-time APIs (NEA rainfall, PUB flood alerts)
- There is no custom backend: live data is fetched directly from the APIs, and user progress is stored on the device.

## Project structurescreens/ UI screens
- services/ API calls, location, storage and notifications
- utils/ Pure logic: gamification, preparedness score, distance, alert filtering
- data/ Quiz questions, checklist, Resource Hub content and mock data for demos
- styles/ Shared styling
- tests/ Unit tests


## Running the app
1. Install **Expo Go for SDK 54** on your phone:
   - **iPhone:** install Expo Go from the App Store.
   - **Android:** the Play Store version may be newer than SDK 54. Install the SDK 54 build from [expo.dev/go](https://expo.dev/go).
2. Open the Snack on your phone: [https://snack.expo.dev/@kwhtan001/dd6a5a]
3. Allow location and notification permissions when asked.

The **Simulate flood alert** and **Simulate heavy rain** buttons on the Home screen send test data through the same notification pipeline used for live data, so the alerts can be demonstrated without a real flood.

## Running the tests
Requires **Node.js 22 or later**. From the project folder:
node --test --experimental-test-coverage


The suite has 37 unit tests covering the utility modules, with test cases chosen by boundary value analysis and equivalence partitioning.

## limitations
- Notifications are only checked while the app is open. Background checking or server push notifications would need a development build and a backend.
- Progress is stored on the device, so it doesn't sync across devices.

## Author
Keon Tan Wei Han, University of London BSc Computer Science
