import { Helmet } from "react-helmet-async";

const DEFAULTS = {
  siteName: "XertiQ",
  titleSuffix: " | XertiQ",
  description:
    "Blockchain-powered document verification and certificate issuance platform. Issue, manage, and verify digital certificates anchored on the Solana blockchain.",
  ogImage: "/icons/xertiq_og.png",
  siteUrl: "https://xertiq.com",
};

export default function SEOHead({
  title,
  description = DEFAULTS.description,
  ogImage = DEFAULTS.ogImage,
  canonical,
  jsonLd,
  noindex = false,
}) {
  const fullTitle = title ? `${title}${DEFAULTS.titleSuffix}` : DEFAULTS.siteName;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={DEFAULTS.siteName} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
