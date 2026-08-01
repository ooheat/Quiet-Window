---
name: step-by-step-implementation
description: "Use when implementing or debugging this project with the user in a beginner-friendly loop: implement one step at a time, report what changed on screen first, wait for user verification, and if it fails separate expected behavior vs actual behavior before continuing. Trigger phrases: 단계별 구현, 한 단계씩, 화면에서 뭐가 달라졌는지, 직접 확인, 기대한 것과 실제, 안 되면 원인 확인."
---

# Step-by-Step Implementation Loop

## Purpose
Apply a strict implementation loop for this project so changes stay small, visible, and easy to verify.

## When To Use
- The user asks to implement features gradually.
- UI or interaction changes must be confirmed by the user after each step.
- The user is a beginner and needs clear progress checkpoints.

## Core Rule
Always follow this order:
1. Implement exactly one step.
2. First report what changed on screen.
3. Wait for the user to verify directly.
4. If it did not work, collect and separate:
- expected behavior
- actual behavior
5. Then fix only that gap and repeat.

## Hard Constraints
- Do not batch multiple feature steps in one cycle.
- Do not proceed to the next step until the user confirms verification.
- Keep explanations short and plain.
- If technical terms are needed, add a short parenthetical meaning.

## Response Template After Each Step
Use this exact order in the response:
1. Screen change first:
- "What changed on screen"
2. Verification request:
- "Please check this now"
3. If user reports failure, ask in two buckets:
- "Expected behavior"
- "Actual behavior"

## Failure Handling Template
When the user says it is not working, respond with:
1. Expected behavior:
- (user statement)
2. Actual behavior:
- (user statement)
3. Next single fix step:
- (one concrete action)

## Out Of Scope For This Skill
- Large refactors across multiple modules in one pass.
- Multi-feature implementation without user checkpoints.
