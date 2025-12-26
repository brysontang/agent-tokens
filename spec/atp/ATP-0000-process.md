# ATP-0000 — Agent Tokens Proposal Process

ATP = **A**gent **T**okens **P**roposal.

This repo uses ATPs to evolve the wire format without turning the core into a kitchen sink.

## States
- Draft
- Review
- Accepted
- Implemented (in reference libs)
- Deprecated

## When you need an ATP
- any new core field in the envelope
- any breaking change to the envelope
- any new package namespace reserved under `at.*`

## What an ATP must contain
- Motivation (what pain does it solve?)
- Non-goals
- Wire format (JSON schema-ish + examples)
- Security / privacy considerations
- Backwards compatibility
- Reference implementation notes

## Numbering
- ATPs are numbered sequentially (ATP-0001, ATP-0002, ...)
