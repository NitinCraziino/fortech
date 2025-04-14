import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useToast } from "@/hooks/use-toast"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getPageTitle = (pathname: string): string => {
  const routeTitles: { [key: string]: string } = {
    "/products": "Products",
    "/orders": "Orders",
    "/create-product": "Create Product",
    "/edit-product": "Edit Product",
    "/view-product": "View Product",
    "/view-order": "View Order",
    "/create-order": "Create Order",
    "/customers": "Customers",
    "/customer-prices/": "Customer Products",
  };

  const matchedRoute = Object.keys(routeTitles).find((route) => pathname.includes(route));

  return matchedRoute ? routeTitles[matchedRoute] : "Page Not Found";
};

export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options);
};


export const useToastActions = () => {
  const { toast } = useToast();

  const success = (message: string, title?: string) => {
    toast({
      title: title || "Success",
      description: message,
      variant: "success",
    });
  };

  const errorToast = (message: string, title?: string) => {
    toast({
      title: title || "Error",
      description: message,
      variant: "destructive",
    });
  };

  const info = (message: string, title?: string) => {
    toast({
      title: title || "Info",
      description: message,
      variant: "default",
    });
  };

  return { success, errorToast, info };
};


