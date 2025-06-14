import { prisma } from '../lib/prisma'
import { CreateProductInput, UpdateProductInput, ProductQueryInput } from '../schemas/product.schema'
import { SlugUtils } from '../utils/slug.utils'
import { UploadService } from './upload.service'

export class ProductService {
  private uploadService: UploadService

  constructor() {
    this.uploadService = new UploadService()
  }
  async create(data: CreateProductInput) {
    let slug = data.slug

    if (!slug) {
      const existingSlugs = await prisma.product.findMany({
        select: { slug: true }
      }).then(products => products.map(p => p.slug))
      
      slug = SlugUtils.generateUnique(data.name, existingSlugs)
    } else {
      const existingSlug = await prisma.product.findUnique({
        where: { slug }
      })

      if (existingSlug) {
        throw new Error('Slug já existe')
      }
    }

    return await prisma.product.create({
      data: {
        ...data,
        slug,
        galleryImages: data.galleryImages || []
      },
      include: {
        subcategory: {
          include: {
            category: true
          }
        }
      }
    })
  }

  async findAll(query: ProductQueryInput) {
    const { page, limit, search, category, subcategory, active } = query
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (active !== undefined) {
      where.active = active
    }

    if (subcategory) {
      where.subcategory = {
        slug: subcategory
      }
    } else if (category) {
      where.subcategory = {
        category: {
          slug: category
        }
      }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          subcategory: {
            include: {
              category: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  async findById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        subcategory: {
          include: {
            category: true
          }
        }
      }
    })

    if (!product) {
      throw new Error('Produto não encontrado')
    }

    return product
  }

  async findBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        subcategory: {
          include: {
            category: true
          }
        }
      }
    })

    if (!product) {
      throw new Error('Produto não encontrado')
    }

    return product
  }

  async update(id: string, data: UpdateProductInput) {
    const existingProduct = await this.findById(id)

    if (data.slug && data.slug !== existingProduct.slug) {
      const existingSlug = await prisma.product.findUnique({
        where: { slug: data.slug }
      })

      if (existingSlug) {
        throw new Error('Slug já existe')
      }
    }

    return await prisma.product.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        subcategory: {
          include: {
            category: true
          }
        }
      }
    })
  }

  async delete(id: string) {
    const product = await this.findById(id)

    if (product.mainImageUrl) {
      try {
        await this.uploadService.deleteFile(product.mainImageUrl)
      } catch (error) {
        console.error('Erro ao deletar imagem principal:', error)
      }
    }

    if (product.galleryImages && Array.isArray(product.galleryImages)) {
      try {
        await this.uploadService.deleteMultipleFiles(product.galleryImages as string[])
      } catch (error) {
        console.error('Erro ao deletar galeria:', error)
      }
    }

    return await prisma.product.delete({
      where: { id }
    })
  }

  async toggleActive(id: string) {
    const product = await this.findById(id)

    return await prisma.product.update({
      where: { id },
      data: {
        active: !product.active,
        updatedAt: new Date()
      }
    })
  }

  async getByCategory(categorySlug: string) {
    return await prisma.product.findMany({
      where: {
        active: true,
        subcategory: {
          category: {
            slug: categorySlug
          }
        }
      },
      include: {
        subcategory: {
          include: {
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async getBySubcategory(subcategorySlug: string) {
    return await prisma.product.findMany({
      where: {
        active: true,
        subcategory: {
          slug: subcategorySlug
        }
      },
      include: {
        subcategory: {
          include: {
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }
}