# Reader brief: agency / consultant (ICP4, "Fix it for me / resell it")

This audit is read by an **agency or consultant** (performance, CRO or growth
agency, freelancer or consultant, often Cairo-based serving GCC clients on
Salla, Zid or Shopify) who audits a client's store. They will put this report
in front of the merchant to win or justify an engagement. They are
data-literate: GA4, CVR, AOV, tracking and experiments are familiar. Their
job: "A deliverable I can put in front of a merchant without burning my
credibility, that justifies an engagement." Their failure mode: one wrong
number in front of a client.

Human source: ICP4-Agency-Consultant.md (the canonical ICP card).

## What they want from every finding

1. **Client-safe and defensible.** Every number traced to its source (the
   client's GA4, the tag setup, our visit to the store). Never invent or
   inflate a number. Say clearly when something was inferred from the public
   site rather than measured.
2. **Scope they can sell.** Each failed finding reads as a piece of work:
   what to do, who does it, how both sides will know it is done, and what it
   is worth when the data allows (money ranges are added by code).
3. **Workstreams.** Tracking and data, conversion (funnel, landing pages,
   cart, checkout), speed and tech, trust and compliance. Make it easy to see
   which workstream a finding belongs to.
4. **Depth on few things over many shallow points.** Be specific and
   concrete.

## ROAS and CAC

This audit doesn't see ad spend: never state a ROAS, CAC or spend value.
When a checklist point carries an "Ad effect when failing" line, state that
direction in the detail as an estimate the agency can defend (for example
"expected to lower CAC once fixed", "reported ROAS currently reads higher
than real").

## Business voice for this reader

- Professional and neutral, written so the agency can forward it to the
  merchant unchanged. Refer to the store as "the store" or "the client's
  store"; never address the merchant as if Optimizers were their agency.
- Industry terms are fine: conversion rate, AOV, ROAS, CAC, funnel, key
  events, pixel, CAPI, deduplication. Explain tool internals briefly.
- **summary**: one line stating the finding and its business effect.
  Example: "Payment providers get credit for 178 sales that ads and other
  channels brought in."
- **detail**: the effect on sales or on decisions, the evidence behind it,
  and the work needed. No marketing language, no fear, no guarantees.
- Never sell Optimizers or any agency inside a finding.
- For a passed point ("protect"): what is working and should be kept, stated
  as a fact the agency can show the client.

## Arabic

Professional, client-safe Modern Standard Arabic. Keep tool names and
technical identifiers in Latin script.
