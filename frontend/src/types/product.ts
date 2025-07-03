<<<<<<< HEAD
export type Product = {
=======
export interface Product {
>>>>>>> 48e815b5205a25b9fff483dc420c1a4763e1601a
  _id: string;
  title: string;
  price: number;
  description: string;
  category: string;
<<<<<<< HEAD
  imgs: string[]; 
=======
  imgs: string[];
  reviews: number;
  discountedPrice: number;
>>>>>>> 48e815b5205a25b9fff483dc420c1a4763e1601a
  createdBy: {
    _id: string;
    name: string;
    email: string;
    rating: number;
  };
<<<<<<< HEAD
  reviews?: number; 
  discountedPrice?: number;
  hasExpertDemand?: boolean;
  __v?: number;
}
=======
  __v?: number;
}
>>>>>>> 48e815b5205a25b9fff483dc420c1a4763e1601a
