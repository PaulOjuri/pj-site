import type { MDXComponents } from 'mdx/types'
import { proseComponents } from './src/lib/prose-components'

export { proseComponents }

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...proseComponents, ...components }
}
