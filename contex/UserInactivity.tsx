import { useRouter, usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'UserInactivity' });

const LOCK_TIME = 3 * 1000;

// interface Props {
//   children?: ReactNode;
//   // any props that come into the component
// }

// export const UserInactivityProvider = ({ children }: Props) => {
export const UserInactivityProvider = ({ children }: any) => {
  const appStat = useRef(AppState.currentState);
  const router = useRouter();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = (nextAppState: any) => {
    console.log('appState', appStat.current, nextAppState);

    if (nextAppState === 'inactive') {
      router.push('/(modals)/white');
      console.log('inactive');
    } else {
      if (router.canGoBack()) {
        router.back();
      }
    }

    if (nextAppState === 'background') {
      recordStartTime();
    } else if (nextAppState === 'active' && appStat.current.match(/background/)) {
      const elapsedTime = Date.now() - (storage.getNumber('startTime') || 0);

      if (elapsedTime > LOCK_TIME) {
        router.push('/(modals)/lock');
      }
    }

    appStat.current = nextAppState;
  };

  const recordStartTime = () => {
    storage.set('startTime', Date.now());
  };

  return children;
};
