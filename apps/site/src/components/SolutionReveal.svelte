<script lang="ts">
  import { Dialog } from 'bits-ui'
  import type { Snippet } from 'svelte'
  import { onMount, tick } from 'svelte'
  import { cn } from '@/lib/cn'
  import DoodleIcon from '@/components/ui/notebook/DoodleIcon.svelte'
  import { readChallengeSolvedState } from '@/lib/challenge-progress'
  import { getDataHookAttributes, solutionRevealDomHooks } from '@/lib/dom-hooks'
  import { siteEvents } from '@/lib/site-config'

  type SolutionRevealCopy = {
    buttonLabel: string
    cancel: string
    confirmSolved: string
    confirmUnsolved: string
    noJsDetailsLabel: string
    noJsMessage: string
    solutionLabel: string
    solvedMessage: string
    solvedTitle: string
    unsolvedMessage: string
    unsolvedTitle: string
  }

  type Props = {
    className?: string
    challengeId: string
    children?: Snippet
    copy: SolutionRevealCopy
  }

  let { className = '', challengeId, children, copy }: Props = $props()
  let solved = $state(false)
  let revealed = $state(false)
  let showDialog = $state(false)
  let solutionHeadingEl = $state<HTMLParagraphElement | null>(null)

  function getOpen() {
    return showDialog
  }

  async function setOpen(nextOpen: boolean) {
    showDialog = nextOpen
  }

  onMount(() => {
    solved = readChallengeSolvedState(challengeId)

    window.addEventListener(siteEvents.challengeSolved, onChallengeSolved)
    return () => {
      window.removeEventListener(siteEvents.challengeSolved, onChallengeSolved)
    }
  })

  function onChallengeSolved(e: Event) {
    if (!(e instanceof CustomEvent)) {
      return
    }

    const detail = e.detail as { challengeId?: string } | null

    if (detail?.challengeId === challengeId) {
      solved = true
    }
  }

  async function confirm() {
    revealed = true
    await setOpen(false)
    await tick()
    solutionHeadingEl?.focus()
  }

  function handleCloseAutoFocus(event: Event) {
    if (!revealed) {
      return
    }

    event.preventDefault()
  }
</script>

<div data-js-only="true">
  <Dialog.Root bind:open={getOpen, setOpen}>
    <div class={cn('article-utility-shell mx-auto mt-10 w-full', className)}>
      {#if !revealed}
        <div class="solution-reveal-note flex flex-col items-center gap-4 rounded-md border border-dashed border-site-line-strong bg-site-panel px-6 py-8 text-center">
          <div
            class="solution-reveal-state flex size-10 items-center justify-center rounded-[48%_52%_46%_54%] border border-dashed border-site-line-strong {solved
              ? 'solution-reveal-state--solved'
              : 'solution-reveal-state--warning'}"
          >
            <DoodleIcon className="text-site-ink-muted" name={solved ? 'check' : 'exclamation'} size={21} />
          </div>
          <div class="grid gap-1">
            <p class="[font-family:var(--cad-font-hand)] text-(--cad-hand-md) font-semibold text-site-ink">
              {solved ? copy.solvedTitle : copy.unsolvedTitle}
            </p>
            <p class="[font-family:var(--cad-font-book)] text-sm leading-6 text-site-ink-soft">
              {solved ? copy.solvedMessage : copy.unsolvedMessage}
            </p>
          </div>
          <Dialog.Trigger
            aria-haspopup="dialog"
            class="inline-flex items-center gap-2 rounded-md border border-dashed border-site-line-strong bg-site-surface px-4 py-2 [font-family:var(--cad-font-hand)] text-(--cad-hand-sm) font-medium text-site-ink-soft transition-colors duration-150 hover:border-site-link-hover hover:text-site-link-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-dashed focus-visible:outline-site-link-hover"
            {...getDataHookAttributes(solutionRevealDomHooks.triggerButton)}
          >
            <DoodleIcon name="search" size={16} />
            {copy.buttonLabel}
          </Dialog.Trigger>
        </div>
      {:else}
        <div class="border-t border-dashed border-site-line-strong pt-10" {...getDataHookAttributes(solutionRevealDomHooks.content)}>
          <p bind:this={solutionHeadingEl} class="mb-6 [font-family:var(--cad-font-hand)] text-(--cad-hand-sm) font-semibold uppercase tracking-[0.12em] text-site-ink-muted" tabindex="-1">
            {copy.solutionLabel}
          </p>
          {@render children?.()}
        </div>
      {/if}
    </div>

    <Dialog.Portal>
      <Dialog.Overlay class="fixed inset-0 z-50 bg-site-overlay/70 backdrop-blur-[2px]" />
      <Dialog.Content
        class="solution-reveal-dialog fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-md border border-dashed border-site-line-strong bg-site-surface p-6 shadow-(--site-shadow-overlay)"
        onCloseAutoFocus={handleCloseAutoFocus}
      >
        <div
          class="solution-reveal-state mb-4 flex size-10 items-center justify-center rounded-[48%_52%_46%_54%] border border-dashed border-site-line-strong {solved
            ? 'solution-reveal-state--solved'
            : 'solution-reveal-state--warning'}"
        >
          <DoodleIcon
            className={solved
              ? 'solution-reveal-state-icon solution-reveal-state-icon--solved'
              : 'solution-reveal-state-icon solution-reveal-state-icon--warning'}
            name={solved ? 'check' : 'exclamation'}
            size={21}
          />
        </div>
        <Dialog.Title class="mb-2 [font-family:var(--cad-font-book)] text-[1.08rem] font-semibold leading-snug text-site-ink">
          {solved ? copy.solvedTitle : copy.unsolvedTitle}
        </Dialog.Title>
        <Dialog.Description class="mb-6 [font-family:var(--cad-font-book)] text-sm leading-6 text-site-ink-soft">
          {solved ? copy.solvedMessage : copy.unsolvedMessage}
        </Dialog.Description>

        <div class="flex flex-col gap-2">
          {#if !solved}
            <button
              class="solution-reveal-primary inline-flex items-center justify-center gap-2 rounded-md border border-dashed border-site-line-strong px-4 py-2.5 [font-family:var(--cad-font-hand)] text-(--cad-hand-sm) font-medium transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-dashed focus-visible:outline-site-link-hover"
              onclick={() => setOpen(false)}
              type="button"
            >
              {copy.cancel}
            </button>
          {/if}
          <button
            class="inline-flex items-center justify-center rounded-md border border-dashed border-site-line-strong px-4 py-2.5 [font-family:var(--cad-font-hand)] text-(--cad-hand-sm) font-medium text-site-ink-soft transition-colors duration-150 hover:border-site-link-hover hover:text-site-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-dashed focus-visible:outline-site-link-hover"
            onclick={() => void confirm()}
            {...getDataHookAttributes(solutionRevealDomHooks.confirmButton)}
            type="button"
          >
            {solved ? copy.confirmSolved : copy.confirmUnsolved}
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</div>

<details
  class={cn('article-utility-shell mx-auto mt-10 w-full rounded-md border border-dashed border-site-line-strong bg-site-panel', className)}
  data-no-js-only="true"
  data-pagefind-ignore
  {...getDataHookAttributes(solutionRevealDomHooks.noJsDetails)}
>
  <summary class="cursor-pointer list-none px-6 py-4 [font-family:var(--cad-font-hand)] text-(--cad-hand-md) font-semibold text-site-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-dashed focus-visible:outline-site-link-hover">
    {copy.noJsDetailsLabel}
  </summary>
  <div class="border-t border-dashed border-site-line-strong px-6 py-5">
    <p class="mb-6 [font-family:var(--cad-font-book)] text-sm leading-6 text-site-ink-soft">{copy.noJsMessage}</p>
    <div class="border-t border-dashed border-site-line-strong pt-6">
      <p class="mb-6 [font-family:var(--cad-font-hand)] text-(--cad-hand-sm) font-semibold uppercase tracking-[0.12em] text-site-ink-muted">
        {copy.solutionLabel}
      </p>
      {@render children?.()}
    </div>
  </div>
</details>

<style>
  .solution-reveal-state--solved {
    background: color-mix(in srgb, var(--site-success) 12%, transparent);
  }

  .solution-reveal-state--warning {
    background: color-mix(in srgb, var(--site-highlight-badge-ink) 8%, transparent);
  }

  .solution-reveal-state-icon--solved {
    color: var(--site-success);
  }

  .solution-reveal-state-icon--warning {
    color: color-mix(
      in srgb,
      var(--site-highlight-badge-ink) 76%,
      var(--site-base-ink-bright) 24%
    );
  }

  .solution-reveal-primary {
    background: var(--site-accent);
    color: var(--site-base-ink-bright);
  }

  .solution-reveal-note,
  .solution-reveal-dialog {
    position: relative;
  }

  .solution-reveal-note::before,
  .solution-reveal-dialog::before {
    content: '';
    position: absolute;
    top: -0.45rem;
    left: 50%;
    width: 4rem;
    height: 0.9rem;
    background: var(--book-tape);
    transform: translateX(-50%) rotate(-1deg);
  }
</style>
