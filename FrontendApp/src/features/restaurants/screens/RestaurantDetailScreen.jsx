import { useEffect } from 'react';

const RestaurantDetailScreen = ({ navigation, route }) => {
  const { id } = route.params;

  useEffect(() => {
    navigation.replace('RestaurantMenu', { id });
  }, [navigation, id]);

  return null;
};

export default RestaurantDetailScreen;
