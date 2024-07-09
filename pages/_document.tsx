import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en" data-theme="light">
      <Head>
          <link href="https://cdn.zyrosite.com/u1/google-fonts/font-faces?family=Nunito:wght@400;600;700&amp;family=Nunito+Sans:wght@400;600;700&amp;display=swap" rel="preconnect" crossOrigin="anonymous" />
          <link href="https://cdn.zyrosite.com/u1/google-fonts/font-faces?family=Nunito:wght@400;600;700&amp;family=Nunito+Sans:wght@400;600;700&amp;display=swap" rel="preload" as="style" />
          <link href="https://cdn.zyrosite.com/u1/google-fonts/font-faces?family=Nunito:wght@400;600;700&amp;family=Nunito+Sans:wght@400;600;700&amp;display=swap" rel="stylesheet" referrerPolicy="no-referrer" />
        </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
