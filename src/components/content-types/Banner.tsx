"use client";

import Link from "next/link";
import { DotCMSEditableText } from "@dotcms/react";
import { DotCMSBasicContentlet } from "@dotcms/types";
import DotCMSImage, { type DotCMSImageSrc } from "@/components/DotCMSImage";

type BannerProps = DotCMSBasicContentlet & {
  title: string;
  caption: string;
  image?: DotCMSImageSrc;
  link?: string;
  buttonText?: string;
};

export default function Banner(props: BannerProps) {
  const { title, image, link, buttonText } = props;
  return (
    <section className="banner">
      <div className="banner__content">
        {/* Divs, not h1/p: DotCMSEditableText mounts TinyMCE as a block-level
            element, which is invalid inside <p> and breaks hydration. */}
        <div className="banner__title">
          <DotCMSEditableText contentlet={props} fieldName="title" />
        </div>
        <div className="banner__caption">
          <DotCMSEditableText contentlet={props} fieldName="caption" />
        </div>
        {link && buttonText && (
          <Link href={link}>{buttonText}</Link>
        )}
      </div>
      {image && (
        <div className="banner__image">
          <DotCMSImage src={image} width={1200} height={500} alt={title || "Banner"} />
        </div>
      )}
    </section>
  );
}
