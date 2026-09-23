"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { DotCMSEditableText } from "@dotcms/react";
import { getUVEState } from "@dotcms/uve";
import { DotCMSBasicContentlet } from "@dotcms/types";
import DotCMSImage, { type DotCMSImageSrc } from "@/components/DotCMSImage";

type BannerProps = DotCMSBasicContentlet & {
  title: string;
  caption: string;
  image?: DotCMSImageSrc;
  link?: string;
  buttonText?: string;
};

// Whether the page is open inside UVE doesn't change while it's loaded.
const noSubscribe = () => () => {};
const isInEditor = () => getUVEState() !== undefined;

export default function Banner(props: BannerProps) {
  const { title, image, link, buttonText } = props;
  // Visitors (and search/AI crawlers) get a real <h1>. Inside the UVE editor the
  // title becomes inline-editable instead: DotCMSEditableText mounts TinyMCE as
  // a block-level element, which is invalid inside <h1>/<p>. The switch happens
  // on the client only (the server snapshot is false), so hydration stays clean.
  const inEditor = useSyncExternalStore(noSubscribe, isInEditor, () => false);

  return (
    <section className="banner">
      <div className="banner__content">
        {inEditor ? (
          <div className="banner__title">
            <DotCMSEditableText contentlet={props} fieldName="title" />
          </div>
        ) : (
          <h1 className="banner__title">{title}</h1>
        )}
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
