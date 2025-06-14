import { FastifyInstance } from 'fastify'
import { ProductController } from '../controllers/product.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const productController = new ProductController()

export async function productRoutes(fastify: FastifyInstance) {
  
  fastify.register(async function publicRoutes(fastify) {
    fastify.get('/public/category/:category', productController.getByCategory)
    fastify.get('/public/subcategory/:subcategory', productController.getBySubcategory)
    fastify.get('/public/:slug', productController.findBySlug)
  })

  fastify.register(async function protectedRoutes(fastify) {
    fastify.addHook('preHandler', authMiddleware)
    
    fastify.post('/', productController.create)
    fastify.get('/', productController.findAll)
    fastify.get('/:id', productController.findById)
    fastify.put('/:id', productController.update)
    fastify.delete('/:id', productController.delete)
    fastify.patch('/:id/toggle-active', productController.toggleActive)
  })
}