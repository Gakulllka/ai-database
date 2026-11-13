---
name: seo
description: Audit, plan, and implement SEO improvements across technical SEO, on-page optimization, structured data, Core Web Vitals, and content strategy. Use when the user wants better search visibility, SEO remediation, schema markup, sitemap/robots work, or keyword mapping.
metadata:
  origin: ECC
---

# SEO

Improve search visibility through technical correctness, performance, and content relevance, not gimmicks.

## When to Use

Use this skill when:
- auditing crawlability, indexability, canonicals, or redirects
- improving title tags, meta descriptions, and heading structure
- adding or validating structured data
- improving Core Web Vitals
- doing keyword research and mapping keywords to URLs
- planning internal linking or sitemap / robots changes

## How It Works

### Principles

1. Fix technical blockers before content optimization.
2. One page should have one clear primary search intent.
3. Prefer long-term quality signals over manipulative patterns.
4. Mobile-first assumptions matter because indexing is mobile-first.
5. Recommendations should be page-specific and implementable.

### Technical SEO checklist

#### Crawlability

- `robots.txt` should allow important pages and block low-value surfaces
- no important page should be unintentionally `noindex`
- important pages should be reachable within a shallow click depth
- avoid redirect chains longer than two hops
- canonical tags should be self-consistent and non-looping

#### Indexability

- preferred URL format should be consistent
- multilingual pages need correct hreflang if used
- sitemaps should reflect the intended public surface
- no duplicate URLs should compete without canonical control

#### Performance

- LCP < 2.5s
- INP < 200ms
- CLS < 0.1
- common fixes: preload hero assets, reduce render-blocking work, reserve layout space, trim heavy JS

#### Structured data

- homepage: organization or business schema where appropriate
- editorial pages: `Article` / `BlogPosting`
- product pages: `Product` and `Offer`
- interior pages: `BreadcrumbList`
- Q&A sections: `FAQPage` only when the content truly matches

### On-page rules

#### Title tags

- aim for roughly 50-60 characters
- put the primary keyword or concept near the front
- make the title legible to humans, not stuffed for bots

#### Meta descriptions

- aim for roughly 120-160 characters
- describe the page honestly
- include the main topic naturally

#### Heading structure

- one clear `H1`
- `H2` and `H3` should reflect actual content hierarchy
- do not skip structure just for visual styling

### Keyword mapping

1. define the search intent
2. gather realistic keyword variants
3. prioritize by intent match, likely value, and competition
4. map one primary keyword/theme to one URL
5. detect and avoid cannibalization

### Measure search outcomes when data is available

Use authorized Search Console (GSC), Analytics (GA4), ads exports or existing
connections for an audit that includes traffic or ranking claims. Confirm the
property/account and available tools; a connector's marketing page is not its
live schema. If data or access is missing, complete the technical audit and name
the unmeasured questions without inventing results or adding a service.

1. Record source, retrieval time, date windows, timezone, data freshness,
   dimensions, filters and aggregation. Compare equal, complete periods with
   matching search type, country/device and brand segmentation where relevant;
   explain seasonality or tracking changes before attributing an algorithm effect.
2. Match rows at the same grain. Query-only and page-only totals do not establish
   a query-to-page relationship; request that joint breakdown when needed. Retain
   source URLs and reconcile canonical/landing-page differences before joining.
   Keep GSC clicks, GA4 sessions and ad conversions distinct. Compute aggregate
   CTR from total clicks / total impressions, not an average of row percentages.
3. Inspect pagination, row caps, omitted/anonymized queries, partial dates and
   analytics quality diagnostics. GSC can return only top rows even after paging.
   A missing row means unobserved in this export, not proven zero, deindexed or
   newly ranked. Label new/lost rows relative to the observed sample and verify
   important page/indexing claims separately. Report the collection limits.
4. Interpret GSC average position as an aggregate of topmost appearances for the
   selected scope, not a fixed rank for every user. Prioritize material changes
   using clicks, impressions, conversions and actual page inspection; position
   movement or a low-volume CTR change alone does not establish a cause.
5. Label GA4 AI-source visits as attributed traffic. Referrers/UTMs can be absent
   or misclassified; landing-page sessions establish neither a citation in an AI
   answer nor total AI visibility. For citation claims, inspect answer evidence
   with its source, prompt/context and observation time. Zero referrals do not
   prove zero mentions. Treat a pattern on high-traffic pages as a hypothesis to
   test, not a proven citation recipe.
6. Paid/organic query overlap identifies an investigation candidate. Organic
   position plus ad spend does not establish wasted spend or recoverable savings.
   Assess conversion value and a suitable incremental/holdout experiment before
   recommending a budget cut; label assumptions and uncertainty. A reporting
   request alone does not authorize changing ads, negatives or site content.

Return page/query-specific findings with before/after values, denominator,
coverage limits, proposed action and verification measure. Separate observed
facts from hypotheses and unmeasured outcomes. Recheck provider semantics when
implementing an integration: [GSC query limits](https://developers.google.com/webmaster-tools/v1/searchanalytics/query),
[GSC metric definitions](https://support.google.com/webmasters/answer/7042828?hl=en)
and [GA4 missing attribution](https://support.google.com/analytics/answer/15258820?hl=en).

### Internal linking

- link from strong pages to pages you want to rank
- use descriptive anchor text
- avoid generic anchors when a more specific one is possible
- backfill links from new pages to relevant existing ones

## Examples

### Title formula

```text
Primary Topic - Specific Modifier | Brand
```

### Meta description formula

```text
Action + topic + value proposition + one supporting detail
```

### JSON-LD example

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Page Title Here",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Brand Name"
  }
}
```

### Audit output shape

```text
[HIGH] Duplicate title tags on product pages
Location: src/routes/products/[slug].tsx
Issue: Dynamic titles collapse to the same default string, which weakens relevance and creates duplicate signals.
Fix: Generate a unique title per product using the product name and primary category.
```

## Anti-Patterns

| Anti-pattern | Fix |
| --- | --- |
| keyword stuffing | write for users first |
| thin near-duplicate pages | consolidate or differentiate them |
| schema for content that is not actually present | match schema to reality |
| content advice without checking the actual page | read the real page first |
| generic “improve SEO” outputs | tie every recommendation to a page or asset |

## Related Skills

- `seo-specialist`
- `frontend-patterns`
- `brand-voice`
- `market-research`
