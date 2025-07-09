export interface Product {
  _id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  imgs: string[];
  reviews: number;
  discountedPrice: number;
  region: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    rating: number;
  };
  __v?: number;
}
