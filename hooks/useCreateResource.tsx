import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import { NewProduct } from "@/types/product";

// interface CreateProductPayload extends Omit<NewProduct, 'category'> {
//   category: string; // Now accepts category name instead of ID
// }

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newProduct: NewProduct) => {
      // First, try to get or create the category
      // let categoryId: number;
      
      // try {
      //   // Try to get existing categories first
      //   const categoriesResponse = await axiosInstance.get("/categories");
      //   const categories = categoriesResponse.data;
        
      //   // Check if category exists
      //   const existingCategory = categories.find(
      //     (cat: any) => cat.name.toLowerCase() === newProduct.category.toLowerCase()
      //   );
        
      //   if (existingCategory) {
      //     categoryId = existingCategory.id;
      //   } else {
      //     // Create new category
      //     const categoryResponse = await axiosInstance.post("/category", {
      //       name: newProduct.category,
      //       description: `${newProduct.category} category`
      //     });
      //     categoryId = categoryResponse.data.id;
      //   }
      // } catch (error) {
      //   // If getting categories fails, try to create the category directly
      //   try {
      //     const categoryResponse = await axiosInstance.post("/category", {
      //       name: newProduct.category,
      //       description: `${newProduct.category} category`
      //     });
      //     categoryId = categoryResponse.data.id;
      //   } catch (createError) {
      //     console.error("Error handling category:", createError);
      //     throw new Error("Failed to handle category");
      //   }
      // }
      
      // Create the product with the category ID
      const productPayload = {
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        image_url: newProduct.image_url,
        stock: newProduct.stock
      };
      
      const response = await axiosInstance.post(`/products/product`, productPayload);
      return response.data;
    },
    onSuccess: () => {
      console.log("Product created successfully");
      // Invalidate categories query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      console.error("Error creating product:", error);
      // You can add more specific error handling here
      throw error;
    },
  });
};
