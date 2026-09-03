---
name: fleet
description: >
  Dispatch a high-quality parallel subagent fleet for any substantial task:
  decompose along the independence axis, write self-contained agent prompts
  with machine-readable output contracts, always include ground-truth and
  coverage meta-agents, handle dead agents mechanically, and synthesize from
  returned evidence only. Use this whenever the user asks to spawn
  agents/subagents/multi-agents or to parallelize; whenever they ask for
  thoroughness, "multiple angles", "be comprehensive", or independent
  verification; and whenever a task decomposes into 3+ independent items
  (files, findings, hypotheses, lenses, modules, migrations) — even if the
  user never mentions agents. Also reach for it when you catch yourself
  starting a long sequential grind that independent workers could cover in
  parallel. Do NOT use it for single-file lookups, tightly sequential work, or
  tasks where handing off would lose context you already hold. For verifying
  an external audit/review specifically, use verify-audit — it is this method
  pre-specialized for that case.
---

# /fleet — the craft of spawning subagents well

Spawning agents is a built-in tool. What this skill encodes is the part that
is NOT built in: the five disciplines that separate a fleet whose results can
be trusted and merged from "spawned some agents and got prose back". Sessions
without these disciplines either grind through the work inline (anchored,
tired by item six) or dispatch vague agents whose outputs can't be combined.
Follow the steps in order; each exists because its absence has a specific
failure mode, noted inline.

## When a fleet pays — and when it doesn't

A fleet buys three things: **independence** (each agent sees one item cold —
no anchoring on the framing of item #1), **guaranteed process** (the
meta-agents in Step 4 always run; an inline pass always skips them), and
**parallel wall-clock**. Measured cost in practice: roughly 5–10× tokens and
wall-clock versus an inline pass.

Worth it when: 3+ genuinely independent items; conclusions will drive real
decisions (verification matters); coverage matters (missing one item is
expensive); or the work exceeds what one context can hold carefully.

Not worth it when: the items share state or must be read in sequence; you
already hold all the needed context (handing off loses it); or the whole task
is one careful judgment rather than many independent ones. Scale to the ask:
"quick check" gets a small fleet or none; "audit this thoroughly" gets the
full structure.

## Step 1 — Decompose along the independence axis

Lay the work out as a grid: items × lenses (files × concerns, findings ×
verification modes, hypotheses × evidence types). Fan out along whichever
axis has genuinely independent cells.

The test for independence: **"would agent A's conclusion change what agent B
should do?"** If yes, they are not independent — same agent, or sequential
phases with you reading results in between. Keep ALL sequencing in your own
hands: fleets are fan-out/fan-in; a multi-phase task is several fleets with
the driver thinking between them, never agents coordinating with each other.

## Step 2 — Write each prompt as if the agent knows nothing

Because it does. Subagents see none of your conversation, none of your
reasoning, none of the other agents' work. Every prompt is built from this
anatomy — skipping a part produces a specific failure:

```
ROLE + THE ONE ITEM, VERBATIM
  (paraphrase is where claims silently mutate — quote the item exactly)

CONTEXT the agent cannot cheaply rediscover:
  repo/root paths, the baseline (commit SHA, dirty files and whether they
  are intentional), and 3–6 project facts: invariants, domain rules, where
  decisions are recorded. (Without these, agents misjudge "defect vs
  deliberate" and re-derive state wrongly.)

CONSTRAINTS, explicit:
  read-only or not; which paths are off-limits; never commit; where scratch
  space is. (Without these, agents mutate things you didn't expect.)

METHOD POINTERS, 1–3, item-specific:
  what to read first, a nuance that could flip the conclusion, an existing
  test to crib fixtures from. (This is where your judgment transfers.)

EPISTEMIC STANCE:
  adversarial in BOTH directions (don't rubber-stamp, don't nitpick to
  refute); every claim needs evidence — file:line quotes or measured
  numbers; an empty result is a valid result; label measured vs inferred.
  (Without this, you get confident prose instead of findings.)

OUTPUT CONTRACT:
  "Your final message is parsed by a program, not read by a human. End it
  with exactly one fenced ```json block: {explicit schema, enums for any
  verdict field}". (Without this, synthesis becomes you re-interpreting N
  essays — the single biggest determinism loss.)
```

Tell agents their final message IS the return value. Prefer schemas with
enum verdicts (`"CONFIRMED" | "REFUTED" | ...`) over free text — enums force
agents to actually decide.

## Step 3 — Triage isolation, effort, and batching

- **Disposable git worktree** iff the agent must *modify tracked files*
  (scratch tests, instrumentation): `git worktree add --detach <scratch>/fleet-<label> HEAD`.
  Everything else runs in the main checkout, read-only, with throwaway dirs
  under the scratchpad for anything it needs to run. Worktrees cost a full
  rebuild — don't hand them out for reading jobs.
- **Empirical-first**: for any claim about runtime behavior, an agent that
  builds and runs the deciding fixture beats one that reasons about the code.
  Reading persuades; only measurement decides. If the task suggests a test
  fixture, have the agent build exactly that — a confirmed fixture is a
  ready-made regression pin.
- **Effort/model tiers**, if the harness supports them: high for empirical
  and judgment-heavy agents and the sweep; low for mechanical/text checks.
- **Batching**: judgment-heavy items never share an agent (each deserves an
  unanchored look). Mechanical or text-only items may share, up to ~3.

## Step 4 — Always include the two meta-agents

These are the highest-value agents in the fleet because they check the frame
rather than the items. Inline passes always skip them; that is measurably
where inline passes lose:

1. **Ground-truth / gates agent**: re-run whatever the inputs *claim* is true
   (tests pass, build is clean, "N items affected"). Never inherit a claimed
   baseline. In A/B measurements, skill-less sessions asserted gate status
   from inference 3 of 3 times; fleets re-ran them 3 of 3.
2. **Sweep / completeness agent**: what is MISSING — same-class siblings of
   the known items, prose contradicted by newer code, and the newest /
   least-reviewed ground (where any prior analysis was lightest). Instruct it
   to reproduce what it can and that an empty list is valid. Expect
   probabilistic catch behavior (measured: a real defect caught in 2 of 3
   runs) — the structure guarantees the sweep RUNS, not what it finds; run it
   every time and it pays over the long run.

## Step 5 — Dispatch everything in ONE message

All independent agents go out in a single message so they run concurrently.
Give each a short label (`verify:F3`, `sweep`, `gates`). Then wait — do not
also start the work inline; a driver that "helps" duplicates effort and
anchors the synthesis before results arrive.

## Step 6 — Dead agents: mechanical policy, no improvisation

An agent has failed if its call errored, returned nothing, or its final
message has no parseable JSON block.

- **First failure → retry once, same prompt, fresh agent.** Exception:
  permission denials mean the user declined something — adjust the prompt to
  avoid the denied action (or downgrade empirical→static) and note the gap.
- **Second failure → the item is UNCOVERED in your report, with the reason.**
  Never fabricate its result; never silently drop it. Both corrupt the
  synthesis in ways the reader cannot detect.
- **Malformed-but-present JSON**: salvage what parses, mark it "(salvaged)".
- **Debris**: an interrupted run (crash, turn cap, abort) dies before
  cleanup. Check `git worktree list` for stale entries before dispatching;
  remove your own worktrees after synthesis.

## Step 7 — Synthesize from returned evidence only

- Every claim in your synthesis traces to an agent's evidence field. If you
  find yourself writing a conclusion no JSON block supports, that item is
  UNCOVERED, not "probably fine".
- Lead with the answer. Then a per-item table (enum verdicts, one-line plain
  notes), a deep dive only on items whose outcome changes what the reader
  does, corrections in BOTH directions (overstated and understated), what the
  sweep found (or that it found nothing — that is evidence too), the
  ground-truth results, and an Uncovered section (omit if empty).
- Report numbers, not adjectives. "ΔF flipped −0.32 → +1.0" survives
  scrutiny; "significantly worse" doesn't.

## Pattern library — compose by task

- **Adversarial verify**: N independent skeptics per claim, each prompted to
  REFUTE it; majority refutation kills it. For claims that must not be
  plausible-but-wrong.
- **Perspective-diverse verify**: same, but each verifier gets a distinct
  lens (correctness / security / does-it-reproduce) — diversity catches what
  redundancy can't.
- **Judge panel**: N independent attempts from different angles, parallel
  judges score, synthesize from the winner grafting runners-up's best ideas.
  For wide solution spaces (design, naming, architecture).
- **Loop-until-dry**: for unknown-size discovery, keep dispatching finders
  until K consecutive rounds return nothing new; dedupe against everything
  seen (not just accepted) or it never converges.
- **Completeness critic**: a final agent asking "what's missing — angle not
  tried, claim unverified, source unread?" Its findings are the next round.

## Worked micro-example

"Vet these 8 review findings" → 8 verifiers (finding text verbatim, enum
verdicts, one gets a worktree to build the review's own suggested fixture) +
gates agent (re-run the claimed 178-test suite) + sweep (same-class siblings,
newest code). One message, 10 agents. Two die → one retry each → one still
dead → reported UNCOVERED. Synthesis: 6 confirmed, 1 refuted with measured
numbers, 1 overstated, sweep found a live defect outranking the list. That
last item is the fleet's signature move — and it is exactly what inline
passes never budget for. (The fully-specialized version of this example is
the verify-audit skill; prefer it for external findings.)
