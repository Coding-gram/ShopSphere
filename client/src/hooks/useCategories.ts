import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/categories';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
    staleTime: 5 * 60 * 1000, // categories change rarely — cache 5 min
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoryService.getCategory(slug),
    enabled: !!slug,
  });
}
