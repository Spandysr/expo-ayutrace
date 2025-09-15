# AyuTrack - Ayurvedic Product Tracking App

## Overview

AyuTrack is a React Native mobile application built with Expo that enables users to track and verify Ayurvedic products using QR code scanning and blockchain technology. The app provides complete transparency and authenticity verification for Ayurvedic products throughout their supply chain journey. Users can scan QR codes, create product batches, view detailed product histories with geographic tracking, and manage their product portfolios through an intuitive interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK v53
- **Routing**: File-based routing using expo-router v5 with typed routes
- **UI Components**: Custom themed components with automatic dark/light mode support
- **State Management**: React hooks and local component state (no global state management currently implemented)
- **Styling**: StyleSheet-based styling with responsive design principles

### Navigation Structure
- **Authentication Flow**: Welcome screen and login with stack navigation
- **Main App**: Tab-based navigation with 4 primary tabs (Home, Scan, History, Profile)
- **Feature Screens**: Modal/stack screens for batch management, product details, settings, and analytics
- **Route Protection**: Basic redirect logic from index to authentication flow

### Key Features
- **QR Code Scanning**: Camera-based barcode scanning using expo-camera and expo-barcode-scanner
- **Product Tracking**: Detailed product journey tracking with timeline and map integration
- **Batch Management**: Create and manage product batches with geo-tagging capabilities
- **History Tracking**: Comprehensive scan history with verification status
- **User Profile**: Settings, analytics, and account management

### Device Capabilities Integration
- **Camera Access**: QR code scanning with flash control and permission handling
- **Location Services**: Geo-tagging for batch creation using expo-location
- **Haptic Feedback**: Touch feedback on iOS devices using expo-haptics
- **Cross-Platform**: Support for iOS, Android, and web deployment

### UI/UX Design Patterns
- **Theme System**: Automatic light/dark mode adaptation with custom color schemes
- **Component Library**: Reusable themed components (ThemedText, ThemedView) for consistency
- **Responsive Design**: Adaptive layouts using Dimensions API
- **Animation**: React Native Reanimated for smooth transitions and micro-interactions

## External Dependencies

### Core Expo Modules
- **expo-camera**: QR code scanning and camera functionality
- **expo-barcode-scanner**: Barcode scanning capabilities
- **expo-location**: Geographic location services for batch geo-tagging
- **expo-router**: File-based navigation system
- **expo-image**: Optimized image handling and display

### React Native Libraries
- **@react-navigation/bottom-tabs**: Tab navigation implementation
- **@react-navigation/native**: Core navigation functionality
- **react-native-reanimated**: Animation library for smooth UI transitions
- **react-native-gesture-handler**: Touch gesture handling
- **react-native-maps**: Map integration for product journey visualization
- **react-native-qrcode-svg**: QR code generation capabilities

### Development Tools
- **TypeScript**: Type safety with strict mode enabled
- **ESLint**: Code linting with Expo configuration
- **Jest**: Testing framework setup
- **Metro**: JavaScript bundler for React Native

### Platform-Specific Features
- **iOS**: SF Symbols integration via expo-symbols for native icon appearance
- **Android**: Material Icons fallback for consistent cross-platform iconography
- **Web**: Metro bundler with static output for web deployment

### Authentication & Data (Planned)
- Currently uses placeholder authentication flow
- No database integration implemented yet (architecture prepared for future Drizzle ORM integration)
- Blockchain integration mentioned in concept but not yet implemented