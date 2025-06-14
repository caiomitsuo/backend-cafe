export class SlugUtils {
  static generate(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  static generateUnique(text: string, existingSlugs: string[] = []): string {
    let baseSlug = this.generate(text)
    let finalSlug = baseSlug
    let counter = 1

    while (existingSlugs.includes(finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`
      counter++
    }

    return finalSlug
  }

  static validate(slug: string): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    return slugRegex.test(slug)
  }
}