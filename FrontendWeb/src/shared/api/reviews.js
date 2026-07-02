import { restaurantesApi as api } from './axios';

export const createReview = (data) => api.post('/reviews', data);
export const getRestaurantReviews = (restaurantId) => api.get(`/reviews/restaurant/${restaurantId}`);


