import { FastifyInstance } from 'fastify'
import { UploadController } from '../controllers/upload.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const uploadController = new UploadController()

export async function uploadRoutes(fastify: FastifyInstance) {
  fastify.register(async function protectedRoutes(fastify) {
    fastify.addHook('preHandler', authMiddleware)
    
    fastify.post('/single', uploadController.uploadSingle)
    fastify.post('/multiple', uploadController.uploadMultiple)
    fastify.delete('/delete', uploadController.deleteImage)
    fastify.post('/presigned-url', uploadController.generatePresignedUrl)
  })
}