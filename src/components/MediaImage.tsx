import Image from 'next/image'

interface MediaImageProps {
  src?: string
  alt: string
  width: number
  height: number
  seed?: string
  className?: string
  priority?: boolean
  sizes?: string
  fill?: boolean
}

export function MediaImage({
  src,
  alt,
  width,
  height,
  seed = 'portfolio',
  className,
  priority,
  sizes,
  fill,
}: MediaImageProps) {
  if (!src) {
    const url = `https://picsum.photos/seed/${seed}/${width}/${height}`
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt}
          className={`${className ?? ''} object-cover w-full h-full`}
          loading={priority ? 'eager' : 'lazy'}
        />
      )
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
      />
    )
  }
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={`${className ?? ''} object-cover`}
        priority={priority}
        sizes={sizes}
      />
    )
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
    />
  )
}
