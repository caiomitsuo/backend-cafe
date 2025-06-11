import { FastifyInstance } from 'fastify'
import { AuthController } from '../controllers/auth.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const authController = new AuthController()

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', authController.register)
  fastify.post('/login', authController.login)

  fastify.register(async function(fastify) {
    fastify.addHook('preHandler', authMiddleware)
    fastify.get('/me', authController.me)
  })
}