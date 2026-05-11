export interface Address {
  id: number;
  userId: number;
  label: string;
  detail: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: string;
}
