import type { ImageLoaderProps } from "next/image";

const dotcmsOrigin = new URL(process.env.NEXT_PUBLIC_DOTCMS_HOST!).origin;

const ImageLoader = ({ src, width = 250 }: ImageLoaderProps): string => {
  const imageSRC = src.includes("/dA/") ? src : `/dA/${src}`;
  return `${dotcmsOrigin}${imageSRC}/${width}w`;
};

export default ImageLoader;
