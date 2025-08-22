import 'dotenv/config';

export default {
expo: {
name: 'AIShortCut',
slug: 'AIShortCut',
version: '1.0.0',
orientation: 'portrait',
icon: './assets/AIShortCut_logo-removebg.png',
userInterfaceStyle: 'automatic',
newArchEnabled: true,
splash: {
image: './assets/splash-icon.png',
resizeMode: 'contain',
backgroundColor: '#ffffff'
},
ios: {
supportsTablet: true
},
android: {
package: 'in.pythonhub.aishortcut',
adaptiveIcon: {
foregroundImage: './assets/adaptive-icon.png',
backgroundColor: '#ffffff'
},
edgeToEdgeEnabled: true,
permissions: [],
minSdkVersion: 23
// targetSdkVersion: 35
},
web: {
favicon: './assets/favicon.png'
},
scheme: 'aishortcut',
extra: {
apiKey: process.env.API_KEY,
authDomain: process.env.AUTH_DOMAIN,
projectId: process.env.PROJECT_ID,
storageBucket: process.env.STORAGE_BUCKET,
messagingSenderId: process.env.MESSAGING_SENDER_ID,
appId: process.env.APP_ID,
measurementId: process.env.MEASUREMENT_ID,
policyUrls: {
privacy: 'https://copyassignment.com/privacy-policy-aishortcut/',
terms: 'https://copyassignment.com/terms-of-service-aishortcut/',
supportEmail: 'admin@copyassignment.com'
},
eas: {
projectId: 'c5b28119-e389-45a6-a311-41340f510307'
}
}
}
};