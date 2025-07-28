import { Tabs } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useEffect } from 'react';
import { getUserRole } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';

export default function DesignerTabsLayout() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const role = await getUserRole();
      if (role !== 'designer') {
        router.replace('/home');
      }
    })();
  }, []);
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#487eb0',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { backgroundColor: '#fff', height: 60 },
        tabBarLabelStyle: { fontSize: 12, marginBottom: 6 },
        headerShown: false,
        tabBarIcon: ({ color }) => {
          if (route.name === 'uploadDesigns') return <MaterialIcons name="cloud-upload" size={24} color={color} />;
          if (route.name === 'bookings') return <Ionicons name="calendar-outline" size={24} color={color} />;
          if (route.name === 'myDesigns') return <FontAwesome5 name="images" size={22} color={color} />;
          if (route.name === 'me') return <Ionicons name="person-outline" size={24} color={color} />;
          return <Ionicons name="ellipse-outline" size={24} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="uploadDesigns" options={{ title: 'Upload' }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings' }} />
      <Tabs.Screen name="myDesigns" options={{ title: 'My Designs' }} />
      <Tabs.Screen name="me" options={{ title: 'Me' }} />
    </Tabs>
  );
}