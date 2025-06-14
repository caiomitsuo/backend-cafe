import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  mainImageUrl: z.string().url().optional(),
  galleryImages: z.array(z.string().url()).optional(),
  intensityLevel: z.number().min(1).max(5).optional(),
  roastLevel: z.number().min(1).max(5).optional(),
  grindLevel: z.number().min(1).max(5).optional(),
  subcategoryId: z.string().min(1, 'Subcategoria é obrigatória'),
  active: z.boolean().default(true)
})

export const updateProductSchema = createProductSchema.partial()

export const productQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val)).default('1'),
  limit: z.string().transform(val => parseInt(val)).default('10'),
  search: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  active: z.string().transform(val => val === 'true').optional()
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductQueryInput = z.infer<typeof productQuerySchema>