import { NextSeo } from "next-seo";

export default function NextSeoWrapper({ title, description, url }: { title: string; description: string; url: string }) {
  return (
    <NextSeo
      title={title}
      description={description}
      titleTemplate="%s - AlQuran"
      defaultTitle="AlQuran"
      openGraph={{
        type: "website",
        url: `https://${url}`,
        title,
        description,
        siteName: "AlQuran",
        images: [
          {
            url: "https://al-qur-an-one.vercel.app/og.webp",
            width: 1200,
            height: 630,
            alt: "AlQuran",
          },
        ],
      }}
      robotsProps={{ noimageindex: true }}
      twitter={{
        handle: "@patradinata",
        cardType: "summary_large_image",
        site: "@patradinata",
      }}
      additionalMetaTags={[
        {
          name: "Charset",
          content: "UTF-8",
        },
        {
          name: "Distribution",
          content: "Global",
        },
        {
          name: "Rating",
          content: "General",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, shrink-to-fit=no",
        },
      ]}
    />
  );
}
