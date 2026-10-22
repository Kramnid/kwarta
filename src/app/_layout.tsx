import React from 'react';
import { Stack, DarkTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { useDatabase } from '@/hooks/useDatabase';
import '../../global.css';

// Disable Reanimated strict-mode warning triggered during render by external libraries (NativeWind / React Navigation)
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

const kwartaDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#10B981',
    background: '#0B1220',
    card: '#151F30',
    text: '#F8FAFC',
    border: '#334155',
    notification: '#10B981',
  },
};

export default function RootLayout() {
  // Centralized SQLite initialization on app startup
  useDatabase();

  return (
    <ThemeProvider value={kwartaDarkTheme}>
      <View className="flex-1 bg-[#0B1220]">
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#151F30',
            },
            headerTintColor: '#F8FAFC',
            headerTitleStyle: {
              fontWeight: '600',
            },
            contentStyle: {
              backgroundColor: '#0B1220',
            },
            animation: 'slide_from_right',
          }}
        >
          {/* Welcome Screen */}
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />

          {/* Main Tab Navigation */}
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />

          {/* Add Transaction Modal */}
          <Stack.Screen
            name="add-transaction"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />

          {/* Edit Transaction Modal */}
          <Stack.Screen
            name="transaction/[id]"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />

          {/* Add Budget Modal */}
          <Stack.Screen
            name="add-budget"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />

          {/* Edit Budget Modal */}
          <Stack.Screen
            name="budget/[id]"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />

          {/* Settings Screens */}
          <Stack.Screen
            name="settings/index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="settings/profile"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="settings/appearance"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="settings/currency"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="settings/categories"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="settings/backup"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="settings/privacy"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="settings/about"
            options={{
              headerShown: false,
            }}
          />

          {/* Create Savings Goal Modal */}
          <Stack.Screen
            name="savings/create"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />

          {/* Savings Goal Details Screen */}
          <Stack.Screen
            name="savings/[id]/index"
            options={{
              headerShown: false,
            }}
          />

          {/* Edit Savings Goal Modal */}
          <Stack.Screen
            name="savings/[id]/edit"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
        </Stack>
      </View>
    </ThemeProvider>
  );
}
