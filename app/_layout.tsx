import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { ExpenseProvider } from '../src/contexts/ExpenseContext';
import { TagProvider } from '../src/contexts/TagContext';
import { theme } from '../src/theme';

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <TagProvider>
        <ExpenseProvider>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: theme.colors.primary },
              headerTintColor: '#fff',
            }}
          >
            <Stack.Screen name="index" options={{ title: '固定費管理' }} />
            <Stack.Screen name="expenses/new" options={{ title: '固定費を追加' }} />
            <Stack.Screen name="expenses/[id]" options={{ title: '固定費詳細' }} />
            <Stack.Screen name="tags/index" options={{ title: 'タグ管理' }} />
            <Stack.Screen name="tags/new" options={{ title: 'タグを追加' }} />
            <Stack.Screen name="tags/[id]" options={{ title: 'タグを編集' }} />
          </Stack>
        </ExpenseProvider>
      </TagProvider>
    </PaperProvider>
  );
}
