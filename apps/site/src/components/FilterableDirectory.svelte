<script lang="ts">
  import { onMount, tick } from 'svelte'
  import DoodleIcon from '@/components/ui/notebook/DoodleIcon.svelte'
  import { cn } from '@/lib/cn'
  import { completedArticlesSetStore } from '@/lib/completed-articles-store'
  import type { DirectoryItem, DirectoryTag } from '@/lib/directory'
  import { completionDomHooks, directoryFilterDomHooks, getDataHookAttributes } from '@/lib/dom-hooks'
  import { createResizeObserver } from '@/lib/resize-observer'
  import { readQueryParam, setQueryParam, subscribeToQueryParam } from '@/lib/url-state'
  import { ui } from '@/lib/ui'
  import { directoryLinkVariants, directoryListVariants, filterChipVariants } from '@/lib/ui-variants'

  type Props = {
    allItemsLabel?: string
    articleItemsLabel?: string
    availableFilters?: DirectoryTag[]
    completionStorageKey?: string | null
    fewerFiltersLabel?: string
    filterLabel?: string
    filterQueryKey?: string | null
    items?: DirectoryItem[]
    layout?: 'rows' | 'cards'
    moreFiltersHref?: string | null
    moreFiltersLabel?: string
    noJsMessage?: string
    noteItemsLabel?: string
    sectionLabel?: string
  }

  let {
    items = [],
    filterLabel = '',
    sectionLabel = '',
    completionStorageKey = null,
    layout = 'cards',
    allItemsLabel = 'All',
    articleItemsLabel = 'Articles',
    noteItemsLabel = 'Notes',
    moreFiltersLabel = 'more',
    fewerFiltersLabel = 'Show less',
    moreFiltersHref = null,
    noJsMessage = '',
    availableFilters = [],
    filterQueryKey = null,
  }: Props = $props()

  const filterTones = [
    { dark: 'var(--site-filter-tone-1-dark)', light: 'var(--site-filter-tone-1-light)' },
    { dark: 'var(--site-filter-tone-2-dark)', light: 'var(--site-filter-tone-2-light)' },
    { dark: 'var(--site-filter-tone-3-dark)', light: 'var(--site-filter-tone-3-light)' },
    { dark: 'var(--site-filter-tone-4-dark)', light: 'var(--site-filter-tone-4-light)' },
    { dark: 'var(--site-filter-tone-5-dark)', light: 'var(--site-filter-tone-5-light)' },
    { dark: 'var(--site-filter-tone-6-dark)', light: 'var(--site-filter-tone-6-light)' },
  ]
  const filterLabelClass = ui.filterLabel
  const itemEyebrowClass = ui.metaQuiet
  const measureChipAttr = 'data-measure-chip'
  const measureChipValues = {
    all: 'all',
    category: 'category',
    more: 'more',
    type: 'type',
  } as const
  const rowItemClass = ui.linearRow
  let activeFilter = $state<string | null>(null)
  let activeType = $state<'all' | 'article' | 'note'>('all')
  let showAllFilters = $state(false)
  let visibleCategoryCount = $state(0)
  let completedItemIds = $state(new Set<string>())
  let filterMeasureContainer = $state<HTMLDivElement | null>(null)
  let resizeObserver = $state<ResizeObserver | null>(null)
  let measurementFrame = $state<number | null>(null)
  let measureRun = $state(0)
  let hasInitializedQueryFilter = $state(false)
  let hasMeasuredCollapsedFilters = $state(false)
  let previousCollapsedSignature = $state('')
  let previousMeasurementSignature = $state('')

  let listClass = $derived(directoryListVariants({ layout }))
  let itemLinkClass = $derived(directoryLinkVariants({ layout }))
  let typeScopedItems = $derived.by(() =>
    items.filter((item) => (activeType === 'all' ? true : (item.contentKind ?? 'article') === activeType)),
  )
  let typeScopedFilterIds = $derived.by(
    () => new Set(typeScopedItems.flatMap((item) => item.tags.map((tag) => tag.id))),
  )
  let filters = $derived.by(() =>
    availableFilters.length > 0
      ? availableFilters.filter((filter) => typeScopedFilterIds.has(filter.id))
      : Array.from(
          new Map(typeScopedItems.flatMap((item) => item.tags.map((tag) => [tag.id, tag.label]))).entries(),
        ).map(([id, label]) => ({ id, label })),
  )
  let hasTypeFilters = $derived(
    items.some((item) => item.contentKind === 'note') &&
      items.some((item) => (item.contentKind ?? 'article') !== 'note'),
  )
  let shouldCollapseCategoryFilters = $derived(hasTypeFilters)
  let needsCollapsedMeasurement = $derived(
    shouldCollapseCategoryFilters && !showAllFilters && filters.length > 0,
  )
  let visibleFilters = $derived(
    showAllFilters || !shouldCollapseCategoryFilters ? filters : filters.slice(0, visibleCategoryCount),
  )
  let shouldRenderCategoryFilters = $derived(
    !needsCollapsedMeasurement || hasMeasuredCollapsedFilters,
  )
  let hiddenFiltersCount = $derived(
    shouldCollapseCategoryFilters ? Math.max(filters.length - visibleFilters.length, 0) : 0,
  )
  let visibleItems = $derived.by(() =>
    typeScopedItems.filter((item) => {
      const matchesTag = activeFilter ? item.tags.some((tag) => tag.id === activeFilter) : true

      return matchesTag
    }),
  )
  let collapsedSignature = $derived(
    showAllFilters ? 'expanded' : `${activeType}|${filters.map((filter) => filter.id).join(',')}`,
  )
  let measurementSignature = $derived(
    `${needsCollapsedMeasurement ? 'measure' : 'skip'}|${filterMeasureContainer ? 'ready' : 'pending'}|${filters.map((filter) => filter.id).join(',')}`,
  )

  function toggleFilter(id: string) {
    activeFilter = activeFilter === id ? null : id
  }

  function setActiveType(type: 'all' | 'article' | 'note') {
    activeType = type
  }

  function toggleFilterVisibility() {
    showAllFilters = !showAllFilters
  }

  function setMeasuredCategoryCount(
    categoryChips: HTMLElement[],
    moreChip: HTMLElement | null,
    count: number,
  ) {
    if (!filterMeasureContainer) {
      return
    }

    categoryChips.forEach((chip, index) => {
      chip.style.display = index < count ? '' : 'none'
    })

    if (moreChip) {
      moreChip.style.display = count < categoryChips.length ? '' : 'none'
    }
  }

  function countVisibleRows(chips: HTMLElement[]) {
    let rows = 0
    let previousOffsetTop: number | null = null

    for (const chip of chips) {
      if (chip.style.display === 'none') {
        continue
      }

      if (chip.offsetTop !== previousOffsetTop) {
        rows += 1
        previousOffsetTop = chip.offsetTop
      }
    }

    return rows
  }

  function getMeasureChipAttributes(value: (typeof measureChipValues)[keyof typeof measureChipValues]) {
    return { [measureChipAttr]: value } as Record<typeof measureChipAttr, string>
  }

  function getMeasureChipSelector(value?: (typeof measureChipValues)[keyof typeof measureChipValues]) {
    if (!value) {
      return `[${measureChipAttr}]`
    }

    return `[${measureChipAttr}="${value}"]`
  }

  function measureCollapsedCategoryCount() {
    if (!filterMeasureContainer || !needsCollapsedMeasurement) {
      visibleCategoryCount = filters.length
      hasMeasuredCollapsedFilters = true
      return
    }

    const categoryChips = Array.from(filterMeasureContainer.querySelectorAll<HTMLElement>(getMeasureChipSelector(measureChipValues.category)))
    const allChips = Array.from(filterMeasureContainer.querySelectorAll<HTMLElement>(getMeasureChipSelector()))
    const moreChip = filterMeasureContainer.querySelector<HTMLElement>(getMeasureChipSelector(measureChipValues.more))

    if (categoryChips.length === 0) {
      visibleCategoryCount = 0
      hasMeasuredCollapsedFilters = true
      return
    }

    let low = 0
    let high = categoryChips.length
    let best = 0

    while (low <= high) {
      const count = Math.floor((low + high) / 2)
      setMeasuredCategoryCount(categoryChips, moreChip, count)
      const visibleRows = countVisibleRows(allChips)

      if (visibleRows <= 2) {
        best = count
        low = count + 1
      } else {
        high = count - 1
      }
    }

    visibleCategoryCount = best
    setMeasuredCategoryCount(categoryChips, moreChip, best)
    hasMeasuredCollapsedFilters = true
  }

  async function scheduleCollapsedCategoryMeasurement() {
    if (typeof window === 'undefined') {
      return
    }

    if (!needsCollapsedMeasurement) {
      visibleCategoryCount = filters.length
      hasMeasuredCollapsedFilters = true
      return
    }

    const currentRun = ++measureRun
    await tick()

    if (currentRun !== measureRun) {
      return
    }

    if (measurementFrame !== null) {
      cancelAnimationFrame(measurementFrame)
    }

    await new Promise<void>((resolve) => {
      measurementFrame = requestAnimationFrame(() => {
        measurementFrame = null
        resolve()
      })
    })

    if (currentRun !== measureRun) {
      return
    }

    measureCollapsedCategoryCount()
  }

  function syncMeasurementObserver() {
    resizeObserver?.disconnect()

    if (needsCollapsedMeasurement && filterMeasureContainer?.parentElement) {
      resizeObserver?.observe(filterMeasureContainer.parentElement)
    }
  }

  function isComplete(item: DirectoryItem) {
    return Boolean(item.completionId && completedItemIds.has(item.completionId))
  }

  function getCompletedCtaLabel(item: DirectoryItem) {
    if (item.completedCtaLabel) {
      return item.completedCtaLabel
    }

    if (item.ctaLabel === 'Ler mais') {
      return 'Ler novamente'
    }

    if (item.ctaLabel === 'Read more') {
      return 'Read again'
    }

    return 'Read again'
  }

  function applyFilterFromQuery(queryValue: string | null) {
    if (queryValue && filters.some((filter) => filter.id === queryValue)) {
      activeFilter = queryValue
    } else {
      activeFilter = null
    }

    hasInitializedQueryFilter = true
  }

  onMount(() => {
    const cleanup: Array<() => void> = []

    if (completionStorageKey) {
      cleanup.push(
        completedArticlesSetStore.subscribe((completedSet) => {
          completedItemIds = new Set(completedSet)
        }),
      )
    }

    if (filterQueryKey) {
      cleanup.push(
        subscribeToQueryParam(filterQueryKey, (queryValue) => {
          applyFilterFromQuery(queryValue)
        }),
      )
    } else {
      hasInitializedQueryFilter = true
    }

    resizeObserver = createResizeObserver(() => {
      void scheduleCollapsedCategoryMeasurement()
    })

    if (!resizeObserver) {
      const handleResize = () => {
        void scheduleCollapsedCategoryMeasurement()
      }

      window.addEventListener('resize', handleResize)
      cleanup.push(() => {
        window.removeEventListener('resize', handleResize)
      })
    }

    void scheduleCollapsedCategoryMeasurement()

    return () => {
      cleanup.forEach((callback) => callback())
      if (measurementFrame !== null) {
        cancelAnimationFrame(measurementFrame)
      }
      resizeObserver?.disconnect()
    }
  })

  $effect(() => {
    if (activeFilter && !filters.some((filter) => filter.id === activeFilter)) {
      activeFilter = null
    }
  })

  $effect(() => {
    if (showAllFilters) {
      visibleCategoryCount = filters.length
    }
  })

  $effect(() => {
    if (!shouldCollapseCategoryFilters) {
      visibleCategoryCount = filters.length
      hasMeasuredCollapsedFilters = true
    }
  })

  $effect(() => {
    if (resizeObserver && measurementSignature !== previousMeasurementSignature) {
      previousMeasurementSignature = measurementSignature
      syncMeasurementObserver()
      void scheduleCollapsedCategoryMeasurement()
    }
  })

  $effect(() => {
    if (hasInitializedQueryFilter && typeof window !== 'undefined' && filterQueryKey) {
      const currentQueryValue = readQueryParam(filterQueryKey)

      if (currentQueryValue !== activeFilter) {
        setQueryParam(filterQueryKey, activeFilter)
      }
    }
  })

  $effect(() => {
    if (collapsedSignature !== previousCollapsedSignature) {
      previousCollapsedSignature = collapsedSignature
      hasMeasuredCollapsedFilters = false
    }
  })
</script>

{#if sectionLabel || filters.length > 0 || hasTypeFilters}
  <div class="mb-3 mt-4 grid justify-items-start gap-4">
    {#if sectionLabel}
      <p class={filterLabelClass}>{sectionLabel}</p>
    {/if}
    {#if filters.length > 0 || hasTypeFilters}
      <div class="relative grid justify-items-start gap-2">
        {#if filterLabel}
          <p class={filterLabelClass} data-js-only="true">{filterLabel}</p>
        {/if}
        {#if noJsMessage}
          <p
            class="text-sm leading-6 text-site-ink-soft"
            data-no-js-only="true"
            {...getDataHookAttributes(directoryFilterDomHooks.noJsNote)}
          >
            {noJsMessage}
          </p>
        {/if}
        <div class="flex flex-wrap justify-start gap-2.5" data-js-only="true">
          {#if hasTypeFilters}
            <button
              aria-pressed={activeType === 'all'}
              class={filterChipVariants({ active: activeType === 'all' })}
              onclick={() => setActiveType('all')}
              type="button"
            >
              <span>{allItemsLabel}</span>
            </button>
            <button
              aria-pressed={activeType === 'article'}
              class={filterChipVariants({ active: activeType === 'article' })}
              onclick={() => setActiveType('article')}
              type="button"
            >
              <span>{articleItemsLabel}</span>
            </button>
            <button
              aria-pressed={activeType === 'note'}
              class={filterChipVariants({ active: activeType === 'note' })}
              onclick={() => setActiveType('note')}
              type="button"
            >
              <span>{noteItemsLabel}</span>
            </button>
            {#if filters.length > 0}
              <span aria-hidden="true" class="self-center text-sm text-site-ink-muted">|</span>
            {/if}
          {:else if filters.length > 0}
            <button
              aria-pressed={!activeFilter}
              class={filterChipVariants({ active: !activeFilter })}
              onclick={() => (activeFilter = null)}
              type="button"
            >
              <span>{allItemsLabel}</span>
            </button>
          {/if}
          {#if shouldRenderCategoryFilters}
            {#each visibleFilters as filter, index}
              {@const tone = filterTones[index % filterTones.length]}
              <button
                aria-pressed={filter.id === activeFilter}
                class={filterChipVariants({ active: filter.id === activeFilter })}
                onclick={() => toggleFilter(filter.id)}
                style={`--chip-accent: ${tone.light}; --chip-accent-dark: ${tone.dark};`}
                type="button"
              >
                <span>{filter.label}</span>
              </button>
            {/each}
            {#if hiddenFiltersCount > 0}
              {#if moreFiltersHref && !showAllFilters}
                <a
                  class={filterChipVariants({ active: false })}
                  href={moreFiltersHref}
                >
                  <span>+{hiddenFiltersCount} {moreFiltersLabel}</span>
                </a>
              {:else}
                <button
                  aria-expanded={showAllFilters}
                  class={filterChipVariants({ active: showAllFilters })}
                  onclick={toggleFilterVisibility}
                  type="button"
                >
                  <span>{showAllFilters ? fewerFiltersLabel : `+${hiddenFiltersCount} ${moreFiltersLabel}`}</span>
                </button>
              {/if}
            {/if}
          {/if}
        </div>
        {#if needsCollapsedMeasurement}
          <div
            aria-hidden="true"
            bind:this={filterMeasureContainer}
            class="pointer-events-none invisible absolute left-0 top-0 -z-10 flex w-full flex-wrap justify-start gap-2.5 overflow-hidden"
            data-js-only="true"
          >
            {#if hasTypeFilters}
              <button class={filterChipVariants({ active: activeType === 'all' })} {...getMeasureChipAttributes(measureChipValues.type)} type="button">
                <span>{allItemsLabel}</span>
              </button>
              <button class={filterChipVariants({ active: activeType === 'article' })} {...getMeasureChipAttributes(measureChipValues.type)} type="button">
                <span>{articleItemsLabel}</span>
              </button>
              <button class={filterChipVariants({ active: activeType === 'note' })} {...getMeasureChipAttributes(measureChipValues.type)} type="button">
                <span>{noteItemsLabel}</span>
              </button>
            {:else if filters.length > 0}
              <button class={filterChipVariants({ active: !activeFilter })} {...getMeasureChipAttributes(measureChipValues.all)} type="button">
                <span>{allItemsLabel}</span>
              </button>
            {/if}
            {#each filters as filter, index}
              {@const tone = filterTones[index % filterTones.length]}
              <button
                class={filterChipVariants({ active: false })}
                {...getMeasureChipAttributes(measureChipValues.category)}
                style={`--chip-accent: ${tone.light}; --chip-accent-dark: ${tone.dark};`}
                type="button"
              >
                <span>{filter.label}</span>
              </button>
            {/each}
            <button class={filterChipVariants({ active: false })} {...getMeasureChipAttributes(measureChipValues.more)} type="button">
              <span>+{filters.length} {moreFiltersLabel}</span>
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<div class={listClass}>
  {#each visibleItems as item}
    {#if layout === 'rows'}
      <article class={cn('content-directory-item', rowItemClass, 'relative', isComplete(item) && 'is-complete')} {...getDataHookAttributes(completionDomHooks.item, item.completionId)}>
        {#if item.href}
          <a class={itemLinkClass} href={item.href}>
            {#if item.completionId}
              <span
                aria-hidden="true"
                class={cn('content-directory-complete-badge', ui.completionBadgeLinear)}
                {...getDataHookAttributes(completionDomHooks.completeBadge)}
              >
                <DoodleIcon name="check" size={16} />
              </span>
            {/if}
            {#if item.eyebrow || item.badgeLabel}
              <div class="flex flex-wrap items-center gap-2">
                {#if item.eyebrow}
                  <p class={itemEyebrowClass}>{item.eyebrow}</p>
                {/if}
                {#if item.badgeLabel}
                  {#if item.eyebrow}
                    <span aria-hidden="true" class={itemEyebrowClass}>•</span>
                  {/if}
                  <p class={itemEyebrowClass}>{item.badgeLabel}</p>
                {/if}
              </div>
            {/if}
            <div class="grid min-w-0 gap-2">
              <h3 class={cn('content-directory-title', ui.linearItemTitle, 'transition-colors duration-150')} {...getDataHookAttributes(completionDomHooks.title)}>
                {item.title}
              </h3>
            </div>
            {#if item.description}
              <p class={ui.cardDescription}>{item.description}</p>
            {/if}
            {#if item.ctaLabel}
              {#if isComplete(item)}
                <span class={cn('content-directory-mobile-complete-text', ui.inlineCta, 'md:hidden')}>
                  <span>{getCompletedCtaLabel(item)}</span>
                  <DoodleIcon name="arrow-right" size={15} />
                </span>
                <span class={ui.completionRailLg}>
                  <span class={cn('content-directory-complete-text', ui.completionDesktopCtaInteractive)} {...getDataHookAttributes(completionDomHooks.completeText)}>
                    <span>{getCompletedCtaLabel(item)}</span>
                    <DoodleIcon name="arrow-right" size={15} />
                  </span>
                </span>
              {:else}
                <span class={cn('content-directory-mobile-default-cta', ui.inlineCta, 'md:hidden')}>
                  <span>{item.ctaLabel}</span>
                  <DoodleIcon name="arrow-right" size={15} />
                </span>
                <span class={ui.completionRailInlineMd}>
                  <span class={cn('content-directory-default-cta', ui.completionDesktopCtaInteractive)}>
                    <span>{item.ctaLabel}</span>
                    <DoodleIcon name="arrow-right" size={15} />
                  </span>
                </span>
              {/if}
            {/if}
          </a>
        {:else}
          <div class={itemLinkClass}>
            {#if item.eyebrow || item.badgeLabel}
              <div class="flex flex-wrap items-center gap-2">
                {#if item.eyebrow}
                  <p class={itemEyebrowClass}>{item.eyebrow}</p>
                {/if}
                {#if item.badgeLabel}
                  {#if item.eyebrow}
                    <span aria-hidden="true" class={itemEyebrowClass}>•</span>
                  {/if}
                  <p class={itemEyebrowClass}>{item.badgeLabel}</p>
                {/if}
              </div>
            {/if}
            <div class="grid min-w-0 gap-2">
              <h3 class={cn('content-directory-title', ui.linearItemTitle)} {...getDataHookAttributes(completionDomHooks.title)}>
                {item.title}
              </h3>
            </div>
            {#if item.description}
              <p class={ui.cardDescription}>{item.description}</p>
            {/if}
            {#if item.meta}
              <p class={ui.cardMeta}>{item.meta}</p>
            {/if}
          </div>
        {/if}
      </article>
    {:else}
      {#if item.href}
        <a class={cn('content-directory-item', itemLinkClass, 'relative', isComplete(item) && 'is-complete')} href={item.href} {...getDataHookAttributes(completionDomHooks.item, item.completionId)}>
          {#if item.completionId}
            <span
              aria-hidden="true"
              class={cn('content-directory-complete-badge', ui.completionBadgeCard)}
              {...getDataHookAttributes(completionDomHooks.completeBadge)}
            >
              <DoodleIcon name="check" size={16} />
            </span>
          {/if}
          <div class="grid gap-2">
            <div class="flex items-center justify-between gap-4">
              <h2 class={cn('content-directory-title', ui.linkCardTitle)}>{item.title}</h2>
              {#if item.completionId}
                <span class="content-directory-trailing-arrow">
                  <DoodleIcon className="shrink-0 text-site-ink-muted transition-colors duration-150 group-hover:text-site-link-hover group-focus-within:text-site-link-hover" name="arrow-right" size={19} />
                </span>
                <span class="content-directory-trailing-complete-icon">
                  <DoodleIcon className="shrink-0 text-site-success" name="check" size={17} />
                </span>
              {:else}
                <DoodleIcon className="shrink-0 text-site-ink-muted transition-colors duration-150 group-hover:text-site-link-hover group-focus-within:text-site-link-hover" name="arrow-right" size={19} />
              {/if}
            </div>
            {#if item.description}
              <p class={ui.cardDescription}>{item.description}</p>
            {/if}
            {#if item.meta}
              <p class={ui.cardMeta}>{item.meta}</p>
            {/if}
          </div>
        </a>
      {:else}
        <div class={cn('content-directory-item', itemLinkClass, 'relative')} {...getDataHookAttributes(completionDomHooks.item, item.completionId)}>
          <div class="grid gap-2">
            <div class="flex items-center justify-between gap-4">
              <h2 class={cn('content-directory-title', ui.linkCardTitle)}>{item.title}</h2>
            </div>
            {#if item.description}
              <p class={ui.cardDescription}>{item.description}</p>
            {/if}
            {#if item.meta}
              <p class={ui.cardMeta}>{item.meta}</p>
            {/if}
          </div>
        </div>
      {/if}
    {/if}
  {/each}
</div>
