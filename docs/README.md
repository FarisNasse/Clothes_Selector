# Documentation

Use this page as the entry point for engineering and product documentation. The root [README](../README.md) covers the product at a glance and the shortest path to run it.

## Engineering

- [Architecture](engineering/architecture.md) — runtime boundaries, data flow, and current implementation limits.
- [Data model and migrations](engineering/data-model.md) — persisted entities, ownership, and schema change workflow.
- [Security and privacy](security/security-and-privacy.md) — client configuration, access controls, photo handling, and release obligations.
- [Local development](development/local-development.md) — prerequisites, setup, environments, and common workflows.
- [Contributing](../CONTRIBUTING.md) — branch, change, review, and documentation expectations.
- [Release process](operations/release.md) — build profiles, validation, and release controls.
- [Launch readiness](operations/launch-readiness.md) — work that remains before a public beta or store release.

## Product

- [Product overview](product/product-overview.md) — current goals, supported user journeys, and explicit non-goals.
- [Design philosophy](product/design-philosophy.md) — how a recommendation should answer the wearer's day and explain its actual pieces.
- [Demo script](product/demo-script.md) — a walkthrough of the currently implemented experience.
- [Engineering roadmap](operations/product-engineering-roadmap.md) — the supplied prioritized plan and release gates.
- [September implementation status](operations/implementation-status-2026-09-28.md) — what this revision implements, verifies, and still needs.

## Historical material

- [Archive guide](archive/README.md) explains how to interpret older proposals, patch notes, roadmaps, and redesign notes.

## Keeping docs reliable

Documentation should distinguish **implemented behavior**, **planned work**, and **unverified behavior**. Update the relevant guide in the same change as code or configuration changes. Avoid copying credentials, project secrets, real user data, or signed media URLs into docs or examples.

- [Impressive experience implementation](operations/impressive-experience-implementation.md) — visual redesign summary and remaining native validation.
