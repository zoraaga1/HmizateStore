import { Menu } from "@/types/Menu";

export const menuData: Menu[] = [

  {
    id: 2,
    title: "Shop",
    newTab: false,
    path: "/shop-without-sidebar",
  },

  {
    id: 6,
    title: "explore",
    newTab: false,
    path: "/",
    submenu: [
      {
        id: 64,
        title: "Checkout",
        newTab: false,
        path: "/checkout",
      },
      {
        id: 65,
        title: "Cart",
        newTab: false,
        path: "/cart",
      },
      {
        id: 66,
        title: "Wishlist",
        newTab: false,
        path: "/wishlist",
      },
      {
        id: 67,
        title: "Sign in",
        newTab: false,
        path: "/signin",
      },
      {
        id: 68,
        title: "Sign up",
        newTab: false,
        path: "/signup",
      },
      {
        id: 69,
        title: "My Account",
        newTab: false,
        path: "/my-account",
      },
      {
        id: 70,
        title: "Contact",
        newTab: false,
        path: "/contact",
      }
    ]
  }
];
