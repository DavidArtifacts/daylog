'use client';

import { getImageUrlOrFile } from '@/utils/image';
import { truncateWord } from '@/utils/text';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';

type PageHeader = {
  title?: string | null;
  imageUrl?: string | null;
  breadcrumbs?: Array<{ name: string; href: string }>;
};

export default function PageHeader({
  ...props
}: PropsWithChildren<PageHeader>) {
  const pathname = usePathname();

  function isCurrentUrl(href: string): boolean {
    return href === pathname;
  }

  return (
    <div className="page-header">
      <div className="row align-items-center">
        <div className="col">
          {props.breadcrumbs && (
            <ol className="breadcrumb breadcrumb-muted">
              {props.breadcrumbs.map(async (item, index) => (
                <li
                  className={`breadcrumb-item ${
                    isCurrentUrl(item.href) ? 'active' : null
                  }`}
                  key={index}
                >
                  <Link href={item.href} title={item.name}>
                    {truncateWord(item.name, 30)}
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="d-flex flex-row gap-1 mt-1">
          {props.imageUrl ? (
            <div
              className="rounded rounded-sm border shadow overflow-hidden"
              style={{
                minHeight: 38,
              }}
            >
              <Image
                width={60}
                height={0}
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                  maxWidth: '38px',
                  height: '100%',
                }}
                src={getImageUrlOrFile(props.imageUrl)}
                alt={`Preview image of ${props.title}`}
                priority={true}
              />
            </div>
          ) : (
            <div style={{ minHeight: 38 }} />
          )}
          <h2 className="page-title" title={props.title ?? ''}>
            {truncateWord(props.title ?? '', 50) ?? (
              <div className="text-secondary">
                Loading<span className="animated-dots"></span>
              </div>
            )}
          </h2>
          <div className="ms-auto">{props.children}</div>
        </div>
      </div>
    </div>
  );
}
