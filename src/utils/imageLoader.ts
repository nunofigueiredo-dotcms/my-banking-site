import type { ImageLoaderProps } from "next/image";

// Images are served as same-origin paths and resolved by the /dA/ rewrite in
// next.config.ts. Keeping them relative rather than pointing at the dotCMS
// origin directly matters for demo capture: Navattic (and any tool that
// snapshots the DOM) cannot fetch a cross-origin localhost URL, and works
// around it by injecting crossorigin attributes before React hydrates, which
// breaks hydration. Same-origin paths sidestep that entirely.
const ImageLoader = ({ src, width = 250 }: ImageLoaderProps): string => {
  const imageSRC = src.includes("/dA/") ? src : `/dA/${src}`;
  return `${imageSRC}/${width}w`;
};

export default ImageLoader;
