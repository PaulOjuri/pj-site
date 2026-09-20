export interface BookData {
  id: string
  title: string
  author: string
  cover?: string
  description?: string
}

export function getBook(id: string): BookData | undefined {
  return { id, title: id, author: '' }
}
