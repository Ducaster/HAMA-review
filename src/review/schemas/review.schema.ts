export interface Review {
  id: string; // ✅ DynamoDB의 Primary Key
  name: string;
  description: string;
  ageGroup: string;
  purchaseLink: string;
  recommended: boolean;
  imageUrls: string[];
  thumbnailUrls: string[];
  googleId: string;
  userId?: string;
  content?: string;
  rating?: number;
}
