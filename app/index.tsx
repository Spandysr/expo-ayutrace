import { Redirect } from 'expo-router';

export default function Index() {
  // In a real app, you'd check actual auth state here
  // For now, always redirect to welcome
  return <Redirect href="/(auth)/welcome" />;
}