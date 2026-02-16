import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { ExpenseProvider } from '../src/contexts/ExpenseContext';
import { theme } from '../src/theme';

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <ExpenseProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.primary },
            headerTintColor: '#fff',
          }}
        >
          <Stack.Screen name="index" options={{ title: '固定費管理' }} />
          <Stack.Screen name="expenses/index" options={{ title: '固定費一覧' }} />
          <Stack.Screen name="expenses/new" options={{ title: '固定費を追加' }} />
          <Stack.Screen name="expenses/[id]" options={{ title: '固定費詳細' }} />
        </Stack>
      </ExpenseProvider>
    </PaperProvider>
  );
}
