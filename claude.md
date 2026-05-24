# Feature: 1822 Media Gallery for 1822 Lacrosse via c4studio
**Goal:** Build a small business starter template based on the below tech stack 
**Philosophy:** Optimize for Time-to-Market (TTM), Developer Experience (DX), and Typesafety. Delete code. Leverage the ecosystem.

## The Stack (Non-Negotiable)
Do not deviate from these technologies. Do not suggest alternatives.
* **Runtime:** Bun
* **Framework:** Astro (SSR enabled)
* **Frontend interactivity:** State lives in the DOM. NO REACT OR OTHER LIBRARIES.
* **Database & Backend:** Convex (Real-time by default, zero config)
* **Authentication:** Clerk (`@clerk/astro`)
* **Styling:** TailwindCSS
* **Emails:** Resend (*TODO*)
* **Payments:** Stripe (`@convex-dev/stripe`) (https://www.convex.dev/components/stripe/stripe.md)

## Core Architectural Rules
1. **Astro Islands:** Astro handles the static shell, routing, and layouts.
2. **Typesafety:** `any` is forbidden. Define Zod schemas for Convex inputs/outputs.
3. **No Auth Boilerplate:** Clerk handles all user profiles, settings, and sign-ins. Do not build custom profile pages.
4. **Optimistic UI:** All Convex mutations (like toggling a task status) must reflect instantly in the UI without waiting for server confirmation.
5. **Context-Preserving UX:** Keep users on the main board. Use inline inputs for new tasks and modals for new clients. Only change the URL route for deep-dive client details.

## Important Files for Claude Agent
* **Claude:** `cladue.md` contains project information and rules. If no file exists, create one.
* **Prompt:** `prompt-instructions.md` contains your specific prompt instructions for a specific task. If no file exists, create one.
* **Agent Debug Loop Directive:** `debug-loop-directive.md` contains your specific error loop instructions. If your agent hits a compilation error, type mismatch, or Convex schema boundary mismatch during the conversion, do not print debug. Pipe your terminal outputs straight back into the agent context using this protocol.
* **Memory:** `memory.md` contains your memory and is the source of truth. This is currently a blank file that you will iterate on. If no file exists, create one.
* **User:** `user.md` contains information about the developer you are interacting with. This is currently a blank file that you will build as we interact. If no file exists, create one.
* **Identity:** `identity.md` contains information about your identity and who you are. This is currently a blank file that you will build as we interact. If no file exists, create one.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
