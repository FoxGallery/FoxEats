import { Tabs } from 'expo-router';
import { Home, Search, Receipt, User } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0B3D91',
        tabBarInactiveTintColor: '#5B6478',
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#EEEFF2' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Accueil', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="browse"
        options={{ title: 'Explorer', tabBarIcon: ({ color, size }) => <Search color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: 'Commandes', tabBarIcon: ({ color, size }) => <Receipt color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: 'Compte', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  );
}
