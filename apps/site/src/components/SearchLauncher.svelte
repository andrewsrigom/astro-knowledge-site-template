<script lang="ts">
  import { install as installHotkey } from '@github/hotkey'
  import { Command, Dialog } from 'bits-ui'
  import { onMount } from 'svelte'
  import DoodleIcon from '@/components/ui/notebook/DoodleIcon.svelte'
  import { getDataHookAttributes, searchLauncherDomHooks } from '@/lib/dom-hooks'

  import {
    filterSiteSearchResultsByPrefixes,
    getSearchResultGroupLabel,
    runSiteSearch,
    shouldOpenSearchWithShortcut,
    type SiteSearchResult,
    type SiteSearchSection,
  } from '@/lib/site-search'

  type SearchLauncherCopy = {
    close: string
    error: string
    hint: string
    loading: string
    noResults: string
    noJsFallback: string
    placeholder: string
    shortcut: string
    title: string
    unavailable: string
  }

  type Props = {
    copy: SearchLauncherCopy
    desktopTriggerClass?: string
    dialogClass?: string
    dialogHintClass?: string
    emptyState?: string
    fallbackGroupLabel?: string
    isDev?: boolean
    mobileTriggerClass?: string
    noJsHref?: string
    noJsLabel?: string
    resultUrlPrefixes?: string[]
    searchableSections?: SiteSearchSection[]
    searchResultLinkClass?: string
  }

  let {
    copy,
    desktopTriggerClass = '',
    dialogClass = '',
    dialogHintClass = '',
    emptyState = '',
    fallbackGroupLabel = '',
    isDev = false,
    mobileTriggerClass = '',
    noJsHref = '/',
    noJsLabel = '',
    resultUrlPrefixes = [],
    searchableSections = [],
    searchResultLinkClass = '',
  }: Props = $props()

  let desktopTriggerEl = $state<HTMLButtonElement | null>(null)
  let inputEl = $state<HTMLInputElement | null>(null)
  let isOpen = $state(false)
  let isSearching = $state(false)
  let results = $state<SiteSearchResult[]>([])
  let searchRunId = $state(0)
  let searchStatus = $state('')
  let searchTerm = $state('')
  let lastFocusedElement = $state<HTMLElement | null>(null)

  function getInitialSearchStatus() {
    return isDev ? copy.unavailable : emptyState
  }

  function getOpen() {
    return isOpen
  }

  function invalidateSearch() {
    searchRunId += 1
    isSearching = false
  }

  function resetSearchState() {
    invalidateSearch()
    searchTerm = ''
    results = []
    searchStatus = getInitialSearchStatus()
  }

  function setOpen(nextOpen: boolean) {
    if (nextOpen && !isOpen && document.activeElement instanceof HTMLElement) {
      lastFocusedElement = document.activeElement
    }

    isOpen = nextOpen

    if (!nextOpen) {
      resetSearchState()
    }
  }

  function getGroupLabel(url: string) {
    return getSearchResultGroupLabel(url, searchableSections, fallbackGroupLabel)
  }

  async function runSearch(term: string, currentRunId: number) {
    if (isDev) {
      results = []
      searchStatus = copy.unavailable
      invalidateSearch()
      return
    }

    const query = term.trim()

    if (!query) {
      results = []
      searchStatus = emptyState
      invalidateSearch()
      return
    }

    isSearching = true
    searchStatus = copy.loading

    try {
      const searchLimit = resultUrlPrefixes.length > 0 ? 40 : 8
      const searchResults = filterSiteSearchResultsByPrefixes(
        await runSiteSearch(query, searchLimit),
        resultUrlPrefixes,
      )

      if (currentRunId !== searchRunId) {
        return
      }

      results = searchResults
      isSearching = false
      searchStatus = results.length > 0 ? '' : copy.noResults
    } catch {
      if (currentRunId !== searchRunId) {
        return
      }

      results = []
      isSearching = false
      searchStatus = copy.error
    }
  }

  function handleDocumentKeydown(event: KeyboardEvent) {
    if (shouldOpenSearchWithShortcut(event)) {
      event.preventDefault()
      setOpen(true)
    }
  }

  function handleCloseAutoFocus(event: Event) {
    event.preventDefault()
    lastFocusedElement?.focus()
  }

  function handleOpenAutoFocus(event: Event) {
    event.preventDefault()
    inputEl?.focus()
  }

  onMount(() => {
    searchStatus = getInitialSearchStatus()

    if (desktopTriggerEl) {
      installHotkey(desktopTriggerEl)
    }

    document.addEventListener('keydown', handleDocumentKeydown)

    return () => {
      document.removeEventListener('keydown', handleDocumentKeydown)
    }
  })

  $effect(() => {
    if (!isOpen) {
      return
    }

    const term = searchTerm
    const timer = window.setTimeout(() => {
      const currentRunId = searchRunId + 1
      searchRunId = currentRunId
      void runSearch(term, currentRunId)
    }, 120)

    return () => {
      window.clearTimeout(timer)
    }
  })
</script>

<div data-js-only="true">
  <Dialog.Root bind:open={getOpen, setOpen}>
    <button
      bind:this={desktopTriggerEl}
      aria-controls="site-search-dialog"
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      class={desktopTriggerClass}
      data-hotkey="Mod+k"
      onclick={() => setOpen(true)}
      {...getDataHookAttributes(searchLauncherDomHooks.desktopTrigger)}
      type="button"
    >
      <span class="inline-flex items-center gap-2">
        <DoodleIcon name="search" size={17} />
        <span>{copy.placeholder}</span>
      </span>
      <span class="rounded-md border border-dashed border-site-line-strong bg-site-surface px-1.5 py-0.5 [font-family:var(--cad-font-ui)] text-xs font-semibold uppercase tracking-[0.08em] text-site-ink-muted lg:px-2 lg:py-[0.35rem]">
        {copy.shortcut}
      </span>
    </button>

    <button
      aria-controls="site-search-dialog"
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      class={mobileTriggerClass}
      onclick={() => setOpen(true)}
      {...getDataHookAttributes(searchLauncherDomHooks.mobileTrigger)}
      type="button"
    >
      <DoodleIcon name="search" size={17} />
      <span class="sr-only">{copy.title}</span>
    </button>

    <Dialog.Portal>
      <Dialog.Overlay class="search-launcher-backdrop fixed inset-0 z-40 bg-site-overlay/70 backdrop-blur-[2px]" />
      <Dialog.Content
        class={`${dialogClass} fixed inset-0 z-50 flex max-h-dvh overflow-hidden p-0 nav:left-1/2 nav:top-1/2 nav:inset-auto nav:w-[calc(100%-3rem)] nav:-translate-x-1/2 nav:-translate-y-1/2`}
        id="site-search-dialog"
        onCloseAutoFocus={handleCloseAutoFocus}
        onOpenAutoFocus={handleOpenAutoFocus}
        {...getDataHookAttributes(searchLauncherDomHooks.dialog)}
      >
        <Dialog.Title class="sr-only">{copy.title}</Dialog.Title>
        <Dialog.Description class="sr-only">{copy.hint}</Dialog.Description>

      <Command.Root
        class="flex h-full min-h-0 flex-1 flex-col"
        label={copy.title}
        shouldFilter={false}
      >
        <div class="flex items-center gap-3 border-b border-dashed border-site-line-strong px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] lg:gap-3.5 lg:px-5 lg:py-3.5">
          <DoodleIcon className="shrink-0 text-site-ink-muted" name="search" size={17} />
          <Command.Input
            bind:ref={inputEl}
            bind:value={searchTerm}
            class="min-w-0 flex-1 bg-transparent [font-family:var(--cad-font-book)] text-[1rem] text-site-ink outline-none placeholder:text-site-ink-muted lg:text-[1.08rem]"
            placeholder={copy.placeholder}
            {...getDataHookAttributes(searchLauncherDomHooks.input)}
          />
          <Dialog.Close
            class={`${mobileTriggerClass} nav:inline-flex`}
            type="button"
          >
            <DoodleIcon name="cross" size={17} />
            <span class="sr-only">{copy.close}</span>
          </Dialog.Close>
        </div>

        <div class="flex min-h-0 flex-1 flex-col gap-3 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:gap-3.5 lg:px-5 lg:py-5">
          <p class={dialogHintClass}>{copy.hint}</p>
          <Command.List class="min-h-0 flex-1 overflow-hidden">
            <Command.Viewport class="grid h-full min-h-0 flex-1 gap-2 overflow-y-auto overscroll-contain pr-1">
              {#if isSearching}
                <Command.Loading forceMount class="m-0 text-sm text-site-ink-muted lg:text-[0.96rem]">
                  {copy.loading}
                </Command.Loading>
              {:else if results.length > 0}
                {#each results as result (result.url)}
                  <Command.LinkItem
                    class={`${searchResultLinkClass} data-selected:border-site-accent/60 data-selected:bg-site-surface-raised`}
                    href={result.url}
                    onSelect={() => setOpen(false)}
                    value={result.url}
                    {...getDataHookAttributes(searchLauncherDomHooks.resultLink)}
                  >
                    <span class="[font-family:var(--cad-font-ui)] text-xs font-semibold uppercase tracking-[0.12em] text-site-ink-muted">{getGroupLabel(result.url)}</span>
                    <span class="[font-family:var(--cad-font-book)] text-base font-semibold leading-[1.3] text-site-ink lg:text-[1.08rem]">{result.meta?.title ?? result.url}</span>
                    {#if result.excerpt}
                      <span class="[font-family:var(--cad-font-book)] text-sm leading-6 text-site-ink-soft lg:text-[0.98rem] [&_mark]:bg-[linear-gradient(transparent_58%,var(--cad-post-it-lemon-bg)_59%_92%,transparent_93%)] [&_mark]:font-semibold [&_mark]:text-site-ink">
                        {@html result.excerpt}
                      </span>
                    {/if}
                  </Command.LinkItem>
                {/each}
              {:else}
                <Command.Empty forceMount class="m-0 text-sm text-site-ink-muted lg:text-[0.96rem]">
                  {searchStatus}
                </Command.Empty>
              {/if}
            </Command.Viewport>
          </Command.List>
        </div>
      </Command.Root>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</div>

<div class="flex items-center gap-2" data-no-js-only="true">
  <a
    class={desktopTriggerClass}
    href={noJsHref}
    {...getDataHookAttributes(searchLauncherDomHooks.noJsFallback)}
  >
    <span class="inline-flex items-center gap-2">
      <DoodleIcon name="search" size={17} />
      <span>{noJsLabel}</span>
    </span>
  </a>
  <a
    aria-label={noJsLabel}
    class={mobileTriggerClass}
    href={noJsHref}
  >
    <DoodleIcon name="search" size={17} />
    <span class="sr-only">{noJsLabel}</span>
  </a>
</div>
