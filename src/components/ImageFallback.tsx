'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'

interface ImageFallbackProps extends Omit<ImageProps, 'src'> {
  src: string
  fallbackSrc?: string
}

const ImageFallback = ({ src, fallbackSrc = '/images/placeholder.jpg', alt, ...props }: ImageFallbackProps) => {
  const [imgSrc, setImgSrc] = useState(src)

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => {
        setImgSrc(fallbackSrc)
      }}
    />
  )
}

export default ImageFallback 