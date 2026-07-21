import { Stack } from 'expo-router';
import 'react-native-reanimated';


export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
 return (
    <Stack
      screenOptions={{
        headerShown: false, // Hides the top header bar if you want a clean full-screen view
      }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}


