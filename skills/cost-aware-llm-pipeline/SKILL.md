---
name: cost-aware-llm-pipeline
description: Cost optimization patterns for LLM API usage — model routing by task complexity, budget tracking, retry logic, and prompt caching. Use when LLM spend needs to come down, or when routing tasks across model tiers and budgets.
metadata:
  origin: ECC
---

# Cost-Aware LLM Pipeline

Patterns for controlling LLM API costs while maintaining quality. Combines model routing, budget tracking, retry logic, and prompt caching into a composable pipeline.

## When to Activate

- Building applications that call LLM APIs (Claude, GPT, etc.)
- Processing batches of items with varying complexity
- Need to stay within a budget for API spend
- Optimizing cost without sacrificing quality on complex tasks

## Core Concepts

### 1. Model Routing by Task Complexity

Automatically select cheaper models for simple tasks, reserving expensive models for complex ones.

```python
MODEL_SONNET = "claude-sonnet-5"
MODEL_HAIKU = "claude-haiku-4-5-20251001"

_SONNET_TEXT_THRESHOLD = 10_000  # chars
_SONNET_ITEM_THRESHOLD = 30     # items

def select_model(
    text_length: int,
    item_count: int,
    force_model: str | None = None,
) -> str:
    """Select model based on task complexity."""
    if force_model is not None:
        return force_model
    if text_length >= _SONNET_TEXT_THRESHOLD or item_count >= _SONNET_ITEM_THRESHOLD:
        return MODEL_SONNET  # Complex task
    return MODEL_HAIKU  # Simple task (3-4x cheaper)
```

### 2. Immutable Cost Tracking

Track cumulative spend with frozen dataclasses. Each API call returns a new tracker — never mutates state.

```python
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class CostRecord:
    model: str
    input_tokens: int
    output_tokens: int
    cost_usd: float

@dataclass(frozen=True, slots=True)
class CostTracker:
    budget_limit: float = 1.00
    records: tuple[CostRecord, ...] = ()

    def add(self, record: CostRecord) -> "CostTracker":
        """Return new tracker with added record (never mutates self)."""
        return CostTracker(
            budget_limit=self.budget_limit,
            records=(*self.records, record),
        )

    @property
    def total_cost(self) -> float:
        return sum(r.cost_usd for r in self.records)

    @property
    def over_budget(self) -> bool:
        return self.total_cost > self.budget_limit
```

This tracker reports recorded spend; it is not admission control. A call can
exceed the remaining budget even when `over_budget` is false, and independent
immutable copies do not coordinate concurrent workers.

### 3. Narrow Retry Logic

Retry only on transient errors. Fail fast on authentication or bad request errors.

```python
from anthropic import (
    APIConnectionError,
    InternalServerError,
    RateLimitError,
)

_RETRYABLE_ERRORS = (APIConnectionError, RateLimitError, InternalServerError)
_MAX_RETRIES = 3

def call_with_retry(func, *, max_retries: int = _MAX_RETRIES):
    """Retry only on transient errors, fail fast on others."""
    for attempt in range(max_retries):
        try:
            return func()
        except _RETRYABLE_ERRORS:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)  # Exponential backoff
    # AuthenticationError, BadRequestError etc. → raise immediately
```

### 4. Prompt Caching

Cache long system prompts to avoid resending them on every request.

```python
messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": system_prompt,
                "cache_control": {"type": "ephemeral"},  # Cache this
            },
            {
                "type": "text",
                "text": user_input,  # Variable part
            },
        ],
    }
]
```

## Composition

Place budget admission and accounting around **each provider attempt**, inside
the retry callback. Checking once before `call_with_retry` and recording only
its final response misses intermediate attempts and their possible charges.

For pipelines that require a hard ceiling:

1. Define the unit and scope of each limit: logical model turns, provider
   attempts, tool executions, tokens or money; per invocation, persistent thread
   or shared account. Restarting a run must not reset a persistent allowance.
   A logical-call counter may wrap several retries; verify middleware ordering
   and SDK-internal retries before claiming an attempt limit is enforced.
2. Route the model, then obtain a conservative bound for the next attempt from
   current pricing and enforced input/output limits, including supported reasoning,
   cache and tool charges. An average estimate is not a hard upper bound. If a
   bound is unavailable, stop before dispatch when a hard ceiling is required;
   continue with a clearly labeled soft budget only if that tradeoff is authorized.
3. Before dispatch, atomically admit the attempt only when recorded spend plus
   outstanding reservations plus its bound fits every applicable allowance.
   Use a shared admission authority for concurrent workers; do not let each copy
   of `CostTracker` independently spend the same remaining balance.
4. Settle each admitted attempt once using its identity and authoritative usage,
   including a billable failure. Retain a conservative pending reservation when
   delivery or usage is unknown; a timeout or cancellation does not prove zero
   charge. Release unused capacity only after reconciliation. Record usage before
   parsing the application result so a parse failure cannot erase incurred cost.
5. Recheck admission for every retry or model fallback. Preserve transient-only
   retry rules; budget denial and permanent authentication/validation failures
   are terminal. Do not retry a side-effecting tool merely because budget remains:
   reconcile its outcome or use a verified idempotency contract first.

When a limit stops execution, preserve verified partial results and identify
what was blocked, completed or still uncertain. This workflow describes required
integration behavior; the snippets above do not implement a shared budget service.
Verify the actual adapter with exact-boundary, retry/fallback, concurrent admission,
unknown-usage and duplicate-settlement cases before claiming a hard ceiling.

## Pricing Reference (2026)

Treat this table as illustrative; verify current provider pricing before using
prices for admission or billing reconciliation.

| Model | Input ($/1M tokens) | Output ($/1M tokens) | Relative Cost |
|-------|---------------------|----------------------|---------------|
| Haiku 3.5 (legacy) | $0.80 | $4.00 | 0.8x |
| Haiku 4.5 | $1.00 | $5.00 | 1x |
| Sonnet 5 | $2.00 | $10.00 | 2x |
| Sonnet 4.6 | $3.00 | $15.00 | 3x |
| Opus 4.8 | $5.00 | $25.00 | 5x |
| Fable 5 / Mythos 5 | $10.00 | $50.00 | 10x |
| Opus 4.0 / 4.1 (legacy) | $15.00 | $75.00 | 15x |

## Best Practices

- **Start with the cheapest model** and only route to expensive models when complexity thresholds are met
- **Set explicit budget limits** before processing batches — fail early rather than overspend
- **Log model selection decisions** so you can tune thresholds based on real data
- **Use prompt caching** for system prompts over 1024 tokens — saves both cost and latency
- **Never retry on authentication or validation errors** — only transient failures (network, rate limit, server error)

## Anti-Patterns to Avoid

- Using the most expensive model for all requests regardless of complexity
- Retrying on all errors (wastes budget on permanent failures)
- Mutating cost tracking state (makes debugging and auditing difficult)
- Hardcoding model names throughout the codebase (use constants or config)
- Ignoring prompt caching for repetitive system prompts

## When to Use

- Any application calling Claude, OpenAI, or similar LLM APIs
- Batch processing pipelines where cost adds up quickly
- Multi-model architectures that need intelligent routing
- Production systems that need budget guardrails
