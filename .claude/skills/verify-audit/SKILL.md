---
name: verify-audit
description: >
  Adversarially verify an external code audit, review, or list of findings by
  dispatching a parallel subagent fleet — one skeptic per finding, disposable
  git worktrees for empirical checks, a gates re-run, and a coverage sweep for
  what the audit missed — then synthesize a verdict report. Use this whenever
  the user pastes or points at findings that someone ELSE produced (another
  model, a reviewer, a security scan, a PR review) and asks what you make of
  them, whether they're right, to check/verify/vet/assess them, or to "review
  this review" — even if they never say the word "audit". Also use it BEFORE
  acting on any set of external findings: "fix everything this review found"
  starts with verifying the review. Do not use it for reviewing a diff you
  yourself just wrote (that is /code-review's job).
---

# /verify-audit — adversarial verification fleet for external findings

You have been handed someone else's findings about this codebase. Your job is
NOT to fix them, and NOT to nod along. It is to establish, with evidence, which
findings are true, which are overstated or wrong, whether the severities are
calibrated, and what the audit failed to find. The deliverable is a verdict
report.

## Why a fleet instead of checking inline

Resist the pull to "just read the cited files and form an impression." That
inline pass has three failure modes, and they compound:

1. **Anchoring.** Reading finding #1's framing colors how you read the code for
   findings #2–#8. Independent verifiers each see ONE claim and the code, cold.
2. **Budget exhaustion.** Verifying N findings properly means reading N regions
   deeply, re-running gates, and sweeping for misses. Done inline, the later
   findings get a fraction of the attention the first ones got — precisely the
   opposite of what you want, since audits usually order by severity.
3. **No coverage check.** The most valuable output is often what the audit
   MISSED. An inline pass never budgets for that; a dedicated sweep agent does
   nothing else.

**Proportionality (measured in real use — a per-commit review gate produces
many SMALL audits):** the full fleet is sized for a multi-finding audit. Scale
down honestly, never silently:

- **1–2 findings** → one verifier per finding; keep the sweep on the FIRST
  round for a given diff (it out-found the external reviewer in practice);
  fold the gates re-run into your own gate discipline if you just ran them,
  and say so in the report.
- **Delta rounds** (the reviewer re-reviews a diff whose ancestor a fleet
  already verified and swept) → verifier(s) only; a second sweep of an
  already-swept surface is where the cost stops paying.
- **Code-evident single findings** (the claim is mechanically demonstrable in
  a few lines — a vacuous guard, a missing API variant): the regression test
  that pins the fix IS the empirical verification. Write it first, watch it
  demonstrate the claim, then fix. Record that you chose test-as-verification
  instead of a fleet round — the choice must be visible, not implicit.

The full fleet is: **one verifier per finding + one gates agent + one sweep agent**,
all dispatched in parallel. Follow the steps below in order. Do not skip the
sweep — in practice it finds issues that outrank the audit's own list.

---

## Step 0 — Parse the audit and record the baseline

1. Split the audit into discrete findings. One finding = one claim. Number them
   F1..Fn in the audit's order. Keep each finding's text **verbatim** — you will
   paste it into the verifier prompt unedited, because your paraphrase is
   exactly where the audit's claim can silently mutate.
2. For each finding record: severity as the audit rated it, cited files/lines,
   and the claim's *kind* (behavior vs text — used in Step 1).
3. Pull out the audit's meta-claims — gates it says it ran ("tests pass",
   "clippy clean", "worktree clean") — for the gates agent.
4. Record the baseline: `git rev-parse HEAD` and `git status --porcelain`.
   If the tree is dirty, list the dirty files and decide (or ask) whether they
   are intentional; verifiers must be told "verify against THIS state" and
   which files not to touch.

## Step 1 — Triage each finding: static or empirical

The question that decides the mode: **can reading alone decide this claim?**

| The claim is about... | Mode | Why |
|---|---|---|
| Runtime behavior: wrong values, state divergence, a code path doing something other than intended | **EMPIRICAL** (worktree) | Reading persuades; only a measurement decides. Plausible-but-wrong survives reading. |
| The audit proposes a specific test or fixture ("add a test with X and Y") | **EMPIRICAL** | Build the audit's own fixture — it is the crispest possible check, and if confirmed it becomes the regression pin for the fix. |
| Docs, comments, rustdoc/docstrings, version strings, status headers, stale prose | **STATIC** | Reading both sides of the mismatch decides it. |
| Counts and inventories (test counts, "N files affected") | **STATIC** | `grep -c` decides it. |
| CLI/tool behavior checkable by running the *existing* binary against scratch directories | **STATIC + run** | No source modification needed; the verifier runs the built artifact against throwaway dirs (in the harness scratchpad or `/tmp`), never against real data. |

**The worktree rule:** a finding gets a disposable git worktree if and only if
verifying it requires *modifying tracked files* — adding a scratch test,
instrumenting code. Everything else runs read-only in the main checkout.
Worktrees cost a full rebuild; don't hand them out for doc checks.

**Effort weighting:** if your harness supports per-agent model/effort settings,
give empirical verifiers and the sweep the high setting and doc-check verifiers
the low one. If it doesn't, ignore this.

**Batching:** behavioral findings NEVER share a verifier (each deserves an
unanchored look). Pure text findings may be batched up to 3 per verifier when
the audit has more than ~10 findings — they don't contaminate each other.

## Step 2 — Dispatch the whole fleet in ONE message

Before dispatching, create one worktree per empirical finding:

```bash
git worktree add --detach <scratch>/verify-F<N> HEAD
```

(`--detach` means no branch to clean up later; `<scratch>` is your harness
scratchpad or `/tmp` — not inside the repo.)

**Verifying an UNCOMMITTED diff** (a pre-commit review of your own working
tree — the common case when an external reviewer gates each commit): a bare
`worktree add HEAD` gives the verifier the WRONG state, silently missing the
very changes under review. Apply the diff into the worktree first, and tell
the verifier the diff is already applied:

```bash
git worktree add --detach <scratch>/verify-F<N> HEAD
git diff -- <paths under review> | git -C <scratch>/verify-F<N> apply
```

Then issue **all** subagent calls (Task tool, or your harness's equivalent) in
a single message so they run concurrently: one per finding, plus gates, plus
sweep. If your harness has a workflow-orchestration tool with schema-enforced
agent outputs, prefer it; the templates below work either way.

### Template: SHARED_CONTEXT (prepended to every verifier prompt)

Fill this once. The PROJECT FACTS matter: a verifier that doesn't know the
project's invariants will misjudge "defect vs decision" — give it the 3–6 facts
it cannot cheaply rediscover (architecture invariants, domain rules, where
design decisions are recorded, what the authoritative project log is).

```
REPO: {{ABS_REPO_ROOT}} ({{language / build system}}; decision records: {{doc paths}})
BASELINE: commit {{SHA}}; working tree {{clean | dirty: <files> — intentional, do not touch}}.
Verify against this state, not the state the audit may have seen.
PROJECT FACTS: {{3–6 bullets of invariants/domain rules/where decisions live}}

You are verifying ONE finding from an external audit of this codebase. Cited
line numbers may have drifted — locate by content, not line. Judge three things:
(1) factual accuracy — does the cited code/doc actually say or do what the
    audit claims?
(2) defect vs decision — is the state a genuine defect, or deliberate and
    documented? Check code comments, the decision records above, and
    git log / git blame before calling anything an accident.
(3) severity — is the audit's rating fair, in BOTH directions? An audit can
    understate as easily as overstate.
Be adversarial both ways: do not rubber-stamp the audit; do not nitpick to
refute it. Do not modify the repository — the only exception is a disposable
worktree your per-finding instructions explicitly give you.
Your final message is parsed by a program. End it with exactly one fenced
```json block:
{
  "finding_id": "F{{N}}",
  "verdict": "CONFIRMED" | "PARTIALLY_CONFIRMED" | "REFUTED",
  "evidence": "file:line quotes and/or measured results that decide the verdict",
  "severity_fair": true | false,
  "deliberate_or_documented": "where the behavior is documented as intentional, or 'none found'",
  "corrections": "anything the audit got wrong, imprecise, or overstated ('' if nothing)",
  "notes": "anything the synthesizer should know"
}
```

### Template: STATIC verifier

```
{{SHARED_CONTEXT}}

FINDING F{{N}} ({{audit's severity}}), verbatim from the audit:
"{{FULL FINDING TEXT, UNEDITED}}"

Locate every artifact the finding cites (search by content if line numbers
drifted) and QUOTE the decisive text in your evidence. If the claim is a
mismatch between two artifacts (doc vs code, comment vs behavior, header vs
body), quote both sides. You may run read-only commands — grep, counts, and
the existing built binary against scratch directories under {{SCRATCH_DIR}} —
but never modify tracked files or real data.
{{1–3 finding-specific pointers: which files to read, a nuance that could flip
the verdict, established terminology the audit may have misread}}
```

### Template: EMPIRICAL verifier

```
{{SHARED_CONTEXT}}

FINDING F{{N}} ({{audit's severity}}), verbatim from the audit:
"{{FULL FINDING TEXT, UNEDITED}}"

You have a DISPOSABLE git worktree copy of the repo at {{WORKTREE_PATH}} — do
all work there. Add scratch tests freely; never commit; the worktree is deleted
after you report. Verify EMPIRICALLY — measure before concluding:
1. Read the implicated code end to end and establish from the code what it
   actually does at each step the claim touches.
2. Establish intent: decision records, code comments, git log — is the behavior
   a documented decision or an unexamined accident?
3. MEASURE. If the audit proposes a fixture or test, build exactly that.
   Otherwise construct the minimal fixture that makes the claim decidable.
   Run it and report the ACTUAL numbers/output — including a control run
   without the suspect condition when that isolates the effect. Crib fixture
   patterns from existing tests ({{pointer to a relevant test if you know one}}).
4. Weigh severity from what you measured, not from the audit's rhetoric. Note
   mitigating structure (bias in a fail-safe direction, later gates that still
   catch it) and aggravating structure (silent, permanent, hits the primary
   use case).
```

### Template: GATES agent

```
Working directory: {{BUILD_DIR}}. An external audit claims these gates are
green: {{quote the audit's gate claims}}. Re-run each and report facts, not
judgments:
{{one line per gate: the exact command, e.g. `cargo test`, `cargo clippy
--all-targets -- -D warnings`, `npm test`}}
Also report the total test count, and the per-suite count for any suite the
audit cites by number. Constraints: read-only apart from build artifacts; do
not commit, revert, or touch {{intentionally-dirty files, if any}}.
End with one fenced ```json block:
{"gates": [{"command": "...", "green": true|false, "detail": "counts or errors"}],
 "notes": "anything that contradicts the audit's claims"}
```

### Template: SWEEP agent (do not skip this one)

```
{{REPO / BASELINE / PROJECT FACTS exactly as in SHARED_CONTEXT}}

An external audit of this repo reported {{N}} findings, summarized:
{{one line per finding — enough to recognize, not re-litigate}}

Your job is to find what the audit MISSED. Do NOT re-report the findings above.
Sweep three lenses; support every claim with file:line evidence you actually
read; reproduce runtime claims where cheap (scratch dirs under {{SCRATCH_DIR}};
read-only otherwise):
(a) SAME-CLASS: for each class of finding above, hunt for sibling instances
    elsewhere in the codebase. An audit that cites files individually has
    checked those files — the siblings it didn't cite are unchecked.
(b) STALENESS: grep for prose that newer code contradicts — version strings,
    status headers, "not yet implemented", references to retired designs.
(c) NEWEST / LEAST-REVIEWED CODE: audits are consistently lightest where the
    code is newest. Identify the most recently changed areas (git log --stat)
    and read them against their own documented contracts and pinned
    invariants — check the pins actually hold.
An empty list is a valid result — only report what you can support.
End with one fenced ```json block:
{"missed": [{"severity": "P1|P2|P3|P4", "title": "...", "location": "file:line",
 "why_material": "...", "reproduced": true|false}],
 "checked": "what you examined and found sound", "notes": "..."}
```

## Step 3 — Collect results and handle failures

A verifier has **failed** if its call errored, returned nothing, or its final
message has no parseable `json` block. Handle it mechanically:

- **First failure → retry once** with the identical prompt (fresh agent).
  Exception: if the failure was a *permission denial*, the user declined
  something — do not retry verbatim. Either adjust the prompt to avoid the
  denied action, or downgrade EMPIRICAL → STATIC and note in the report that
  the empirical check did not run.
- **Second failure → verdict `UNVERIFIED`** for that finding, with the reason,
  in a dedicated report section. Never fabricate a verdict for a finding whose
  verifier died, and never silently drop the finding — both corrupt the report
  in ways the reader cannot detect.
- **Malformed-but-present JSON:** salvage the fields you can, mark the entry
  "(salvaged)" in the report.

After synthesis, clean up every worktree:

```bash
git worktree remove --force <scratch>/verify-F<N>
```

Also check `git worktree list` BEFORE dispatching: an interrupted earlier run
(crash, turn cap, user abort) dies before its cleanup step and leaves stale
`verify-F*` entries registered against the repo — remove those first, or your
`worktree add` calls will collide with them.

## Step 4 — Synthesize the report

Verdicts come ONLY from verifier evidence — if you find yourself writing a
verdict the JSON blocks don't support, that finding is UNVERIFIED, not
"probably fine". Use exactly this structure:

```markdown
## Verdict on the audit: <one line — trustworthy? calibrated? complete?>

<2–4 sentences: confirmed/partial/refuted counts, whether cited locations were
accurate, whether the claimed gates reproduced, and the audit's main weakness.>

| # | Verdict | Severity fair? | Note |
|---|---------|----------------|------|
<one row per finding; notes in plain language, no invented shorthand>

## <Deep dive: the consequential finding(s)>
<Only findings whose verdict changes what the reader should do. Mechanism,
measured numbers, whether the behavior was documented, and the fix direction
the evidence supports. Quote the verifier's measurements — numbers, not
adjectives.>

## What the audit missed
<Sweep findings, most severe first: location, why material, whether reproduced.
If the sweep found nothing, say so explicitly — it is load-bearing evidence of
the audit's completeness.>

## Corrections to the audit
<Where it overstated, understated, or misread something — per finding, only
where it matters. "Understated" entries are as important as "overstated".>

## Gates
<Claimed vs re-run, with counts.>

## Unverified
<Findings whose verifiers failed twice, with reasons. Omit the section if none.>
```

Two calibration rules for the top-line verdict:

- An audit whose findings all confirm but which **missed** something worse than
  anything it found is "accurate but incomplete" — say that plainly.
- CONFIRMED-but-deliberate is not a defect confirmed. If the behavior is
  documented as a decision, the finding's practical verdict is "true claim,
  wrong implication" — put that in the table note.

## Step 5 — After the report

**Report and stop.** The user asked what you make of the audit; verifying is
not authorization to fix. Offer next steps: fix in severity order, adopt the
verifiers' fixtures as regression pins (an empirical verifier's fixture is a
ready-made test), and — if the fixes are substantial — run an adversarial
review of your own diff before committing, because the fixer needs the same
skepticism the auditor got.

If the project keeps a development memory or decision log, record the
verification outcome there per that project's protocol.

---

## Worked micro-example (one finding, compressed)

Audit says: *"[P2] `cluster_support()` includes non-durable edges, so a weak
provisional edge depresses schema support."* Cited code computes a min over
`cluster_internal_edges(...)` with no tier filter → the claim is about runtime
values → **EMPIRICAL**. The verifier gets a worktree, builds the audit's own
fixture (two durable edges + one provisional chord), and measures: support
10 → 1 with the chord present, decision value flips sign from −0.32 to +2.5 —
confirmed, and *understated*: the flip is a permanent veto, not a "depression".
Verdict: CONFIRMED, severity fair, `deliberate_or_documented: none found`
(plan doc actually says the opposite), correction: "understates impact". That
correction — audit right, but righter than it knew — is the kind of thing only
a measurement produces, and it is what makes the fleet worth its cost.
