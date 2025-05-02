'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { useMutation, useQuery } from '@tanstack/react-query';

import { orpc } from '@/lib/orpc';

import styles from './page.module.css';

type Props = Omit<ImageProps, 'src'> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className='imgLight' />
      <Image {...rest} src={srcDark} className='imgDark' />
    </>
  );
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  const { data } = useQuery(orpc.masterData.customers.all.queryOptions());

  const createUserMutation = useMutation(orpc.users.create.mutationOptions());

  console.log('data =>', data);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <ThemeImage
          className={styles.logo}
          srcLight='turborepo-dark.svg'
          srcDark='turborepo-light.svg'
          alt='Turborepo logo'
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>apps/web/app/page.tsx</code>
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <input
          type='file'
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
          }}
        />

        <div className={styles.ctas}>
          <button
            type='button'
            className={styles.primary}
            onClick={() => {
              if (!file) return;

              createUserMutation.mutate({ name: 'Ahok', file });
            }}
          >
            <Image
              className={styles.logo}
              src='/vercel.svg'
              alt='Vercel logomark'
              width={20}
              height={20}
            />
            Deploy now
          </button>
          <a
            href='https://turborepo.com/docs?utm_source'
            target='_blank'
            rel='noopener noreferrer'
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
        <button type='button' className={styles.secondary}>
          Open alert
        </button>
      </main>
      <footer className={styles.footer}>
        <a
          href='https://vercel.com/templates?search=turborepo&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app'
          target='_blank'
          rel='noopener noreferrer'
        >
          <Image
            aria-hidden
            src='/window.svg'
            alt='Window icon'
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href='https://turborepo.com?utm_source=create-turbo'
          target='_blank'
          rel='noopener noreferrer'
        >
          <Image
            aria-hidden
            src='/globe.svg'
            alt='Globe icon'
            width={16}
            height={16}
          />
          Go to turborepo.com →
        </a>
      </footer>
    </div>
  );
}
