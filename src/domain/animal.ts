// Domain types for Animal entity

export interface Animal {
  id: number;
  tag: string;
  breed: string;
  weight: number;
  age: number;
  status: string;
  feedLevel: number | null;
  ownerUsername: string;
  stableId: number;
}

export interface AnimalRequest {
  tag: string;
  breed: string;
  weight: number;
  age: number;
  status: string;
  feedLevel?: number;
  stableId: number;
}

export interface AnimalResponse extends Animal {}
