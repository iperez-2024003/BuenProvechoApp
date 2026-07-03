import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

const RestaurantDetailScreen = ({ navigation, route }) => {
  const { id } = route.params;

  useEffect(() => {
    navigation.replace('RestaurantMenu', { id });
  }, [navigation, id]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fffaf3' }}>
      <ActivityIndicator size="large" color="#1c1712" />
      <Text style={{ marginTop: 16, fontSize: 12, fontWeight: '700', color: '#6b5e4e' }}>Cargando...</Text>
    </View>
  );
};

export default RestaurantDetailScreen;
