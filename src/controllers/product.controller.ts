import { FastifyRequest, FastifyReply } from 'fastify'
import { ProductService } from '../services/product.service'
import { 
  createProductSchema, 
  updateProductSchema, 
  productQuerySchema 
} from '../schemas/product.schema'

const productService = new ProductService()

export class ProductController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = createProductSchema.parse(request.body)
      const product = await productService.create(data)
      
      return reply.status(201).send({
        success: true,
        message: 'Produto criado com sucesso',
        data: product
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message
      })
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = productQuerySchema.parse(request.query)
      const result = await productService.findAll(query)
      
      return reply.send({
        success: true,
        data: result.products,
        pagination: result.pagination
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message
      })
    }
  }

  async findById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const product = await productService.findById(id)
      
      return reply.send({
        success: true,
        data: product
      })
    } catch (error: any) {
      const status = error.message === 'Produto não encontrado' ? 404 : 400
      return reply.status(status).send({
        success: false,
        error: error.message
      })
    }
  }

  async findBySlug(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { slug } = request.params as { slug: string }
      const product = await productService.findBySlug(slug)
      
      return reply.send({
        success: true,
        data: product
      })
    } catch (error: any) {
      const status = error.message === 'Produto não encontrado' ? 404 : 400
      return reply.status(status).send({
        success: false,
        error: error.message
      })
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const data = updateProductSchema.parse(request.body)
      const product = await productService.update(id, data)
      
      return reply.send({
        success: true,
        message: 'Produto atualizado com sucesso',
        data: product
      })
    } catch (error: any) {
      const status = error.message === 'Produto não encontrado' ? 404 : 400
      return reply.status(status).send({
        success: false,
        error: error.message
      })
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      await productService.delete(id)
      
      return reply.send({
        success: true,
        message: 'Produto deletado com sucesso'
      })
    } catch (error: any) {
      const status = error.message === 'Produto não encontrado' ? 404 : 400
      return reply.status(status).send({
        success: false,
        error: error.message
      })
    }
  }

  async toggleActive(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const product = await productService.toggleActive(id)
      
      return reply.send({
        success: true,
        message: `Produto ${product.active ? 'ativado' : 'desativado'} com sucesso`,
        data: product
      })
    } catch (error: any) {
      const status = error.message === 'Produto não encontrado' ? 404 : 400
      return reply.status(status).send({
        success: false,
        error: error.message
      })
    }
  }

  async getByCategory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { category } = request.params as { category: string }
      const products = await productService.getByCategory(category)
      
      return reply.send({
        success: true,
        data: products
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message
      })
    }
  }

  async getBySubcategory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { subcategory } = request.params as { subcategory: string }
      const products = await productService.getBySubcategory(subcategory)
      
      return reply.send({
        success: true,
        data: products
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message
      })
    }
  }
}