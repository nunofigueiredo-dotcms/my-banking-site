import { ComponentType } from "react";
import ArticleAdvise from "./ArticleAdvise";
import BankCard from "./BankCard";
import BankProduct from "./BankProduct";
import Banner from "./Banner";
import BlogCard from "./BlogCard";
import ProductCard from "./ProductCard";
import SectionHeading from "./SectionHeading";
import WebPageContent from "./WebPageContent";

// Each content-type component declares its own narrower props (BannerProps,
// Blog, WebPageContentProps). Because component props are contravariant, no
// single concrete type accepts all of them, and DotCMSLayoutBody's own
// `components` prop is typed with `ComponentType<any>` for this reason.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const pageComponents: Record<string, ComponentType<any>> = {
  ArticleAdvise,
  Banner,
  BankCard,
  BankProduct,
  Blog: BlogCard,
  Product: ProductCard,
  SectionHeading,
  webPageContent: WebPageContent,
};
