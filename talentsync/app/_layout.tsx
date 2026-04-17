import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as StoreProvider, useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { store, RootState } from '../src/store';
import { theme } from '../src/theme';
import { setLoading } from '../src/store/slices/authSlice';

function RootLayoutNav() {
  const { isAuthenticated, role, isLoading } = useSelector((state: RootState) => state.auth);
  const segments = useSegments();
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    // Simulate token check
    dispatch(setLoading(false));
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated) {
      if (!inAuthGroup && segments[0]) {
        // Redirect to selection/landing (app/index.tsx) or auth flow
        router.replace('/');
      }
    } else {
      if (inAuthGroup || segments[0] === '' || !segments[0]) {
        if (role === 'student') router.replace('/(student)');
        else if (role === 'company') router.replace('/(company)');
        else if (role === 'admin') router.replace('/(admin)');
      }
    }
  }, [isAuthenticated, role, segments, isLoading]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <StoreProvider store={store}>
      <PaperProvider theme={theme}>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </PaperProvider>
    </StoreProvider>
  );
}
