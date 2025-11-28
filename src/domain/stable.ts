// Domain types for Stable entity

export interface Stable {
  id: number;
  name: string;
  description?: string;
  location: string;
  capacity: number;
  ownerUsername: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStableRequest {
  name: string;
  description?: string;
  location: string;
  capacity: number;
}

export interface StableResponse extends Stable {}
