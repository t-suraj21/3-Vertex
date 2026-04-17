import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="selection" />
      <Stack.Screen name="student/login" />
      <Stack.Screen name="student/register" />
      <Stack.Screen name="company/login" />
      <Stack.Screen name="company/register" />
      <Stack.Screen name="admin/login" />
    </Stack>
  );
}
