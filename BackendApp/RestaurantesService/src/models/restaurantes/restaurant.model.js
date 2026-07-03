'use strict';

import { Schema, model } from 'mongoose';

const restaurantSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del restaurante es requerido'],
      trim: true,
      maxLength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    description: {
      type: String,
      maxLength: [1000, 'La descripción no puede exceder 1000 caracteres'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'La dirección es requerida'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'El teléfono es requerido'],
      match: [/^[\d\s\-\+\(\)]+$/, 'Formato de teléfono inválido'],
    },
    email: {
      type: String,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido'],
    },
    category: {
      type: String,
      enum: ['casual', 'fine_dining', 'fast_food', 'cafe', 'bakery', 'bar', 'food_truck', 'buffet', 'family_style', 'gourmet', 'other'],
      default: 'casual',
    },
    cuisineType: {
      type: String,
      trim: true,
    },
    priceRange: {
      type: String,
      enum: ['$', '$$', '$$$', '$$$$'],
      default: '$$',
    },
    averagePrice: {
      type: Number,
      min: [0, 'El precio debe ser positivo'],
    },
    capacity: {
      type: Number,
      required: [true, 'La capacidad es requerida'],
      min: [1, 'La capacidad debe ser al menos 1'],
      default: 50,
    },
    openingTime: {
      type: String,
      default: '08:00',
    },
    closingTime: {
      type: String,
      default: '22:00',
    },
    operatingDays: [String],
    acceptsReservations: {
      type: Boolean,
      default: true,
    },
    acceptsTakeout: {
      type: Boolean,
      default: true,
    },
    acceptsDelivery: {
      type: Boolean,
      default: false,
    },
    parkingAvailable: Boolean,
    wifiAvailable: Boolean,
    outdoorSeating: Boolean,
    petFriendly: Boolean,
    wheelchairAccessible: Boolean,
    latitude: Number,
    longitude: Number,
    websiteUrl: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
    },
    paymentMethods: [String],
    specialFeatures: [String],
    adminId: {
      type: String,
      required: true,
    },
    parentRestaurantId: String,
    logoUrl: String,
    coverImageUrl: String,
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDate: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índices para optimizar búsquedas
restaurantSchema.index({ isActive: 1 });
restaurantSchema.index({ category: 1 });
restaurantSchema.index({ adminId: 1 });
restaurantSchema.index({ name: 'text', description: 'text' });

export const Restaurant = model('Restaurant', restaurantSchema);
export default Restaurant;
