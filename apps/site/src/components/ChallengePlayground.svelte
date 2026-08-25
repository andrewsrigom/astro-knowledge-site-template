<script lang="ts">
  import type { EditorView } from '@codemirror/view'
  import { onMount, onDestroy } from 'svelte'
  import DoodleIcon from '@/components/ui/notebook/DoodleIcon.svelte'
  import { copyTextToClipboard } from '@/lib/clipboard'
  import { cn } from '@/lib/cn'
  import { markChallengeSolved } from '@/lib/challenge-progress'
  import { challengePlaygroundDomHooks, getDataHookAttributes } from '@/lib/dom-hooks'
  import {
    hasLocalStorageAccess,
    readLocalStorageString,
    removeLocalStorageString,
    writeLocalStorageString,
  } from '@/lib/local-storage'
  import { siteStorageKeys } from '@/lib/site-config'
  import { getSiteCopy, type SiteLocale } from '@/lib/site-copy'
  import { buildUrlWithQueryParam, encodeBase64UrlValue, readBase64QueryParam } from '@/lib/url-state'

  type TestCase = {
    description: string
    input: unknown[]
    expected: unknown
  }

  type TestResult = {
    description: string
    pass: boolean
    actual?: unknown
    expected?: unknown
    error?: string
  }

  type EfficiencyMessagePart =
    | { type: 'text'; value: string }
    | { type: 'time' | 'space' | 'solutionLabel'; value: string }

  type Props = {
    className?: string
    challengeId?: string
    complexity?: { time: string; space: string } | null
    hints?: string[]
    locale?: SiteLocale
    solutionLanguage?: 'javascript' | 'typescript' | 'python'
    starterCode: string
    testCases?: TestCase[]
  }

  let {
    className = '',
    starterCode,
    testCases = [],
    solutionLanguage = 'typescript',
    locale = 'en',
    challengeId = '',
    hints = [],
    complexity = null,
  }: Props = $props()

  let editorEl = $state<HTMLDivElement | null>(null)
  let editorView = $state<EditorView | null>(null)
  let activeWorker = $state<Worker | null>(null)

  let code = $state('')
  let results = $state<TestResult[]>([])
  let running = $state(false)
  let hasRun = $state(false)
  let hasResolvedInitialCode = $state(false)
  let compileError = $state('')
  let mountError = $state('')
  let runTimer = $state<ReturnType<typeof setTimeout> | null>(null)
  let shareCopiedTimer = $state<ReturnType<typeof setTimeout> | null>(null)
  let attemptCount = $state(0)
  let unlockedHints = $state(0)
  let solvedAtAttempt = $state<number | null>(null)
  let shareCopied = $state(false)
  let shareFallbackUrl = $state('')
  let storageAvailable = $state(true)

  let supportsExecution = $derived(
    solutionLanguage === 'javascript' || solutionLanguage === 'typescript',
  )
  let copy = $derived(getSiteCopy(locale))
  let playgroundCopy = $derived(copy.challengePlayground)
  let passCount = $derived(results.filter((result) => result.pass).length)
  let failCount = $derived(results.filter((result) => !result.pass).length)
  let allPass = $derived(hasRun && !compileError && failCount === 0 && passCount > 0)

  function getCodeStorageKey() {
    return challengeId ? `${siteStorageKeys.challengeCodePrefix}.${challengeId}.v1` : ''
  }

  function getLegacyCodeStorageKey() {
    return challengeId ? `challenge-code-${challengeId}` : ''
  }

  function syncStorageAvailability() {
    storageAvailable = !challengeId || hasLocalStorageAccess()
  }

  function resolveInitialCode() {
    const sharedCode = readBase64QueryParam('code')

    if (sharedCode) {
      return sharedCode
    }

    const codeStorageKey = getCodeStorageKey()

    if (!codeStorageKey) {
      return starterCode
    }

    return readLocalStorageString(codeStorageKey)
      ?? readLocalStorageString(getLegacyCodeStorageKey())
      ?? starterCode
  }

  function persistCode(nextCode: string) {
    const codeStorageKey = getCodeStorageKey()

    if (!codeStorageKey) {
      return
    }

    if (!writeLocalStorageString(codeStorageKey, nextCode)) {
      storageAvailable = false
    }
  }

  function getFunctionName(code: string): string {
    const match = code.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)/)
    return match?.[1] ?? 'solution'
  }

  function formatCopy(template: string, values: Record<string, string | number>) {
    return Object.entries(values).reduce(
      (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
      template,
    )
  }

  function formatAttemptCountLabel(count: number) {
    return formatCopy(
      count === 1 ? playgroundCopy.attemptsSingular : playgroundCopy.attemptsPlural,
      { count },
    )
  }

  function formatHintStatus(revealed: number, total: number) {
    if (revealed === 0) {
      return playgroundCopy.hintAvailable
    }

    if (revealed >= total) {
      return playgroundCopy.allHintsRevealed
    }

    return formatCopy(
      revealed === 1 ? playgroundCopy.hintsRevealedSingular : playgroundCopy.hintsRevealedPlural,
      { count: revealed, total },
    )
  }

  function formatSolvedAtAttempt(attempt: number) {
    return attempt === 1
      ? playgroundCopy.solvedFirstAttempt
      : formatCopy(playgroundCopy.solvedNthAttempt, { attempt })
  }

  function formatPassingResultsLabel(passing: number, total: number) {
    return formatCopy(playgroundCopy.resultsPassing, {
      passCount: passing,
      totalCount: total,
    })
  }

  function getEfficiencyMessageParts(template: string, values: Record<'time' | 'space' | 'solutionLabel', string>) {
    const parts: EfficiencyMessagePart[] = []
    const tokenPattern = /\{(time|space|solutionLabel)\}/g
    let lastIndex = 0

    for (const match of template.matchAll(tokenPattern)) {
      const matchIndex = match.index ?? 0

      if (matchIndex > lastIndex) {
        parts.push({
          type: 'text',
          value: template.slice(lastIndex, matchIndex),
        })
      }

      const token = match[1] as keyof typeof values
      parts.push({
        type: token,
        value: values[token],
      })
      lastIndex = matchIndex + match[0].length
    }

    if (lastIndex < template.length) {
      parts.push({
        type: 'text',
        value: template.slice(lastIndex),
      })
    }

    return parts
  }

  /**
   * Minimal TypeScript → JavaScript type stripper.
   * Handles common patterns in algorithmic challenge code.
   * Not a full transpiler — just removes type annotations.
   */
  function stripTypes(code: string): string {
    let s = code

    // 1. Remove `export` modifiers
    s = s.replace(/\bexport\s+/g, '')

    // 2. Remove generic type params from function declarations: function foo<T, K>(
    s = s.replace(/\b(function\s+\w+)\s*<[^(]*>/g, '$1')

    // 3. Remove return type annotations: ): SomeType | null {
    //    Critical: do NOT include \{...\} — that would eat the function body.
    //    Only match up to (but not including) the opening brace.
    s = s.replace(/\)\s*:\s*(?:[^{(;\n=]|\[[^\]]*\])*(?=\s*[{;=\n])/g, ')')

    // 4. Remove optional+typed params: name?: SomeType  (before comma or close-paren)
    s = s.replace(/(\w+)\?:\s*(?:[\w<>\[\]|&. ]+?)(?=[,)])/g, '$1 = undefined')

    // 5. Remove typed params: name: SomeType  (before comma or close-paren)
    s = s.replace(/(\w+):\s*(?:[\w<>\[\]|&. ]+?)(?=[,)])/g, '$1')

    // 6. Remove type annotations in variable declarations: const x: Type =
    s = s.replace(/((?:const|let|var)\s+\w+)\s*:\s*[^\n=]+(?==)/g, '$1')

    // 7. Remove generic type args (handles nested generics one level deep)
    s = s.replace(/\b(\w+)<(?:[^<>(){}]|<[^<>(){}]*>)*>/g, '$1')

    // 8. Remove `as Type` assertions
    s = s.replace(/\s+as\s+[\w<>\[\]|& ]+/g, '')

    // 9. Remove non-null assertions: value! or expr()! → value / expr()
    //    Preceding char can be a word char OR closing ) or ]
    s = s.replace(/([)\]\w])!(?=[.[\]),; \t\n])/g, '$1')

    return s
  }

  function clearRunTimeout() {
    if (runTimer) {
      clearTimeout(runTimer)
      runTimer = null
    }
  }

  function clearShareCopiedTimeout() {
    if (shareCopiedTimer) {
      clearTimeout(shareCopiedTimer)
      shareCopiedTimer = null
    }
  }

  function disposeWorker(worker: Worker | null = activeWorker) {
    worker?.terminate()

    if (worker === activeWorker) {
      activeWorker = null
    }
  }

  function buildWorkerScript(jsCode: string, fnName: string, cases: TestCase[]): string {
    return `
${jsCode}

const __cases = ${JSON.stringify(cases)};
(async () => {
  const __results = await Promise.all(__cases.map(async ({ description, input, expected }) => {
    try {
      const actual = await Promise.resolve(${fnName}(...input));
      const pass = JSON.stringify(actual) === JSON.stringify(expected);
      return { description, pass, actual, expected };
    } catch (e) {
      return { description, pass: false, error: String(e) };
    }
  }));

  postMessage({ __type: 'test-results', results: __results });
})().catch((error) => {
  postMessage({
    __type: 'worker-error',
    error: error instanceof Error ? error.message : String(error),
  });
});
`.trim()
  }

  onMount(async () => {
    syncStorageAvailability()
    code = resolveInitialCode()
    hasResolvedInitialCode = true

    try {
      if (!editorEl) {
        mountError = playgroundCopy.editorUnavailable
        return
      }

      const isTypeScript = solutionLanguage === 'typescript'

      const [
        { EditorState },
        { EditorView, lineNumbers, highlightActiveLine },
        javascriptModule,
        { oneDark },
      ] = await Promise.all([
        import('@codemirror/state'),
        import('@codemirror/view'),
        supportsExecution ? import('@codemirror/lang-javascript') : Promise.resolve(null),
        import('@codemirror/theme-one-dark'),
      ])

      editorView = new EditorView({
        state: EditorState.create({
          doc: code,
          extensions: [
            lineNumbers(),
            highlightActiveLine(),
            ...(javascriptModule ? [javascriptModule.javascript({ typescript: isTypeScript })] : []),
            oneDark,
            EditorView.lineWrapping,
            EditorView.updateListener.of((update) => {
              if (update.docChanged) {
                code = update.state.doc.toString()
                shareCopied = false
                shareFallbackUrl = ''
                clearShareCopiedTimeout()
                persistCode(code)
              }
            }),
            EditorView.domEventHandlers({
              keydown(e) {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  run()
                }
              },
            }),
            EditorView.theme({
              '&': { fontSize: '0.875rem' },
              '.cm-scroller': {
                fontFamily: 'var(--cad-font-mono)',
              },
              '.cm-content': { padding: '12px 0' },
            }),
          ],
        }),
        parent: editorEl,
      })
    } catch (e) {
      mountError = e instanceof Error ? e.message : String(e)
    }
  })

  function reset() {
    code = starterCode
    const codeStorageKey = getCodeStorageKey()
    const legacyCodeStorageKey = getLegacyCodeStorageKey()

    if (codeStorageKey && !removeLocalStorageString(codeStorageKey)) {
      storageAvailable = false
    }

    if (legacyCodeStorageKey && !removeLocalStorageString(legacyCodeStorageKey)) {
      storageAvailable = false
    }
    if (editorView) {
      editorView.dispatch({
        changes: { from: 0, to: editorView.state.doc.length, insert: starterCode },
      })
    }
    results = []
    hasRun = false
    compileError = ''
    shareCopied = false
    shareFallbackUrl = ''
  }

  onDestroy(() => {
    clearRunTimeout()
    clearShareCopiedTimeout()
    disposeWorker()
    editorView?.destroy()
  })

  function run() {
    if (running) return
    if (!supportsExecution) {
      results = []
      compileError = playgroundCopy.interactiveExecutionOnly
      hasRun = true
      return
    }

    clearRunTimeout()

    running = true
    hasRun = false
    results = []
    compileError = ''
    attemptCount += 1

    disposeWorker()

    const fnName = getFunctionName(code)

    let jsCode: string
    if (solutionLanguage === 'javascript') {
      jsCode = code
    } else {
      try {
        jsCode = stripTypes(code)
      } catch (e) {
        compileError = e instanceof Error ? e.message : playgroundCopy.processTypeScriptError
        running = false
        hasRun = true
        return
      }
    }

    const workerScript = buildWorkerScript(jsCode, fnName, testCases)

    let blob: Blob
    let blobUrl: string
    try {
      blob = new Blob([workerScript], { type: 'application/javascript' })
      blobUrl = URL.createObjectURL(blob)
    } catch (e) {
      compileError = playgroundCopy.createExecutionEnvironmentError
      running = false
      hasRun = true
      return
    }

    const worker = new Worker(blobUrl)
    URL.revokeObjectURL(blobUrl)
    activeWorker = worker

    worker.onmessage = (event) => {
      if (event.data?.__type === 'test-results') {
        results = event.data.results
        running = false
        hasRun = true
        compileError = ''
        clearRunTimeout()
        disposeWorker(worker)

        const allPassed = results.length > 0 && results.every((r) => r.pass)
        if (allPassed) {
          if (solvedAtAttempt === null) solvedAtAttempt = attemptCount
          if (!markChallengeSolved(challengeId)) {
            storageAvailable = false
          }
        }
      } else if (event.data?.__type === 'worker-error') {
        compileError = event.data.error ?? playgroundCopy.executionError
        running = false
        hasRun = true
        clearRunTimeout()
        disposeWorker(worker)
      }
    }

    worker.onerror = (error) => {
      const msg = error.message ?? playgroundCopy.executionError
      const line = error.lineno
      // lineno maps directly to the user's code since jsCode is prepended first
      compileError = line && line > 0 ? formatCopy(playgroundCopy.lineMessage, { line, message: msg }) : msg
      running = false
      hasRun = true
      clearRunTimeout()
      disposeWorker(worker)
    }

    runTimer = setTimeout(() => {
      if (running) {
        running = false
        hasRun = true
        compileError = playgroundCopy.executionTimeout
        disposeWorker(worker)
      }
    }, 10000)
  }

  function unlockHint() {
    if (unlockedHints < hints.length) unlockedHints += 1
  }

  async function shareCode() {
    const url = buildUrlWithQueryParam('code', encodeBase64UrlValue(code))

    if (!url) {
      return
    }

    const shareUrl = url.toString()

    if (await copyTextToClipboard(shareUrl)) {
      shareFallbackUrl = ''
      shareCopied = true
      clearShareCopiedTimeout()
      shareCopiedTimer = setTimeout(() => {
        shareCopied = false
        shareCopiedTimer = null
      }, 2000)
      return
    }

    shareCopied = false
    shareFallbackUrl = shareUrl
  }

  function handleFallbackInput(event: Event) {
    persistCode((event.currentTarget as HTMLTextAreaElement).value)
  }
</script>

<div
  class={cn('article-utility-shell mx-auto mt-10 w-full rounded-md border border-dashed border-site-line-strong bg-site-panel p-5', className)}
  data-no-js-only="true"
  data-pagefind-ignore
  {...getDataHookAttributes(challengePlaygroundDomHooks.noJsFallback)}
>
  <div class="grid gap-4">
    <p class="[font-family:var(--cad-font-book)] text-sm leading-6 text-site-ink-soft">
      {playgroundCopy.noJsDescription}
    </p>
    <div class="grid gap-2">
      <p class="[font-family:var(--cad-font-hand)] text-(--cad-hand-sm) font-semibold uppercase tracking-[0.12em] text-site-ink-muted">
        {playgroundCopy.noJsCodeLabel}
      </p>
      <pre class="overflow-x-auto rounded-md border border-dashed border-site-line-strong bg-site-bg px-4 py-3 text-sm leading-6 text-site-ink"><code>{starterCode}</code></pre>
    </div>
  </div>
</div>

<div
  class={cn('article-utility-shell mx-auto mt-10 w-full', className)}
  data-js-only="true"
  {...getDataHookAttributes(challengePlaygroundDomHooks.root)}
>
  <div class="challenge-playground-shell overflow-hidden rounded-md border border-dashed border-site-line-strong">
    <!-- Toolbar -->
    <div class="challenge-playground-toolbar flex items-center justify-between gap-4 border-b border-dashed px-4 py-2.5">
      <div class="flex items-center gap-3">
        <span class="challenge-playground-filename font-mono text-xs">
          {solutionLanguage === 'typescript'
            ? 'solution.ts'
            : solutionLanguage === 'javascript'
              ? 'solution.js'
              : 'solution.py'}
        </span>
        {#if hasResolvedInitialCode && code !== starterCode}
          <button
            onclick={reset}
            title={playgroundCopy.resetTitle}
            class="challenge-playground-toolbar-action inline-flex items-center gap-1.5 rounded-md px-2 py-1 [font-family:var(--cad-font-hand)] text-(--cad-hand-xs) transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dashed focus-visible:outline-site-link-hover"
          >
            <DoodleIcon name="reset" size={14} />
            {playgroundCopy.reset}
          </button>
        {/if}
      </div>
      <div class="flex items-center gap-3">
        {#if attemptCount > 0}
          <span class="challenge-playground-meta text-xs">
            {formatAttemptCountLabel(attemptCount)}
          </span>
        {/if}
        <button
          onclick={run}
          disabled={running || !supportsExecution}
          title={supportsExecution ? playgroundCopy.runTitle : playgroundCopy.interactiveExecutionOnly}
          {...getDataHookAttributes(challengePlaygroundDomHooks.runButton)}
          class="challenge-playground-primary inline-flex items-center gap-2 rounded-md border border-dashed border-site-line-strong px-4 py-1.5 [font-family:var(--cad-font-hand)] text-(--cad-hand-sm) font-medium transition-opacity hover:opacity-90 active:opacity-75 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dashed focus-visible:outline-site-link-hover"
        >
          {#if running}
            <DoodleIcon className="animate-spin" name="reset" size={16} />
            {playgroundCopy.running}
          {:else if supportsExecution}
            <DoodleIcon name="arrow-right" size={16} />
            {playgroundCopy.run}
          {:else}
            {playgroundCopy.runUnavailable}
          {/if}
        </button>
      </div>
    </div>

    {#if !storageAvailable}
      <div
        class="challenge-playground-panel border-b border-dashed px-4 py-3"
        {...getDataHookAttributes(challengePlaygroundDomHooks.storageWarning)}
      >
        <div class="challenge-playground-warning-card flex items-start gap-2.5 rounded-md px-3 py-2">
          <DoodleIcon className="challenge-playground-warning-ink mt-0.5 shrink-0" name="exclamation" size={16} />
          <p class="challenge-playground-warning-copy text-xs">
            {playgroundCopy.storageUnavailable}
          </p>
        </div>
      </div>
    {/if}

    <!-- CodeMirror editor (or fallback textarea) -->
    {#if mountError}
      <div class="challenge-playground-editor-error border-b border-dashed p-3 font-mono text-xs">
        {playgroundCopy.editorErrorPrefix}: {mountError}
      </div>
    {/if}
    <div bind:this={editorEl} class="max-h-[480px] min-h-48 overflow-auto"></div>
    {#if mountError}
      <textarea
        class="challenge-playground-fallback min-h-48 w-full resize-y p-4 font-mono text-sm outline-none"
        bind:value={code}
        oninput={handleFallbackInput}
        spellcheck="false"
      ></textarea>
    {/if}

    <!-- Hints panel -->
    {#if hints.length > 0 && !allPass}
      <div class="challenge-playground-panel border-t border-dashed px-4 py-3">
        <div class="flex items-center justify-between">
          <span class="challenge-playground-meta text-xs">
            {formatHintStatus(unlockedHints, hints.length)}
          </span>
          {#if unlockedHints < hints.length}
            <button
              onclick={unlockHint}
              class="challenge-playground-toolbar-action challenge-playground-outline-action inline-flex items-center gap-1.5 rounded-md border border-dashed border-site-line-strong px-2.5 py-1 [font-family:var(--cad-font-hand)] text-(--cad-hand-xs) font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dashed focus-visible:outline-site-link-hover"
            >
              <DoodleIcon name="lightbulb" size={14} />
              {unlockedHints === 0 ? playgroundCopy.showHint : playgroundCopy.nextHint}
            </button>
          {/if}
        </div>
        {#if unlockedHints > 0}
          <ul class="mt-3 grid gap-2">
            {#each hints.slice(0, unlockedHints) as hint, i}
              <li class="challenge-playground-hint flex gap-2.5 rounded-md px-3 py-2">
                <span class="challenge-playground-hint-index shrink-0 font-mono text-xs font-medium">{i + 1}.</span>
                <p class="challenge-playground-body text-xs">{hint}</p>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}

    <!-- Results panel -->
    {#if hasRun}
      <div class="challenge-playground-panel border-t border-dashed p-4">
        {#if compileError}
          <div class="flex items-start gap-2.5">
            <span class="challenge-playground-issue-ink mt-0.5">
              <DoodleIcon name="bug" size={17} />
            </span>
            <div>
              <p class="challenge-playground-issue-title text-sm font-medium">{playgroundCopy.executionErrorTitle}</p>
              <p class="challenge-playground-body mt-1 font-mono text-xs">{compileError}</p>
            </div>
          </div>
        {:else}
          <div class="mb-3 flex items-center gap-3">
            <span
              class="text-xs font-medium {allPass
                ? 'challenge-playground-success-ink'
                : 'challenge-playground-issue-ink'}"
            >
              {formatPassingResultsLabel(passCount, results.length)}
            </span>
            {#if allPass}
              <span
                class="badge-allpass challenge-playground-success-badge inline-flex items-center gap-1 rounded-md border border-dashed border-site-line-strong px-2 py-0.5 [font-family:var(--cad-font-hand)] text-(--cad-hand-xs) font-medium"
                {...getDataHookAttributes(challengePlaygroundDomHooks.allPassingBadge)}
              >
                <DoodleIcon name="check" size={14} />
                {playgroundCopy.testsAllPassing}
              </span>
            {/if}
          </div>

          {#if allPass}
            <div class="mb-3 grid gap-2">
              <div class="challenge-playground-success-card flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed px-3 py-2">
                <div class="flex flex-wrap items-center gap-4">
                  {#if solvedAtAttempt !== null}
                    <span class="challenge-playground-success-copy text-xs font-medium">
                      {formatSolvedAtAttempt(solvedAtAttempt)}
                    </span>
                  {/if}
                </div>
                <button
                  onclick={shareCode}
                  title={playgroundCopy.shareTitle}
                  class="challenge-playground-share inline-flex items-center gap-1.5 rounded-md border border-dashed px-2.5 py-1 [font-family:var(--cad-font-hand)] text-(--cad-hand-xs) font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dashed focus-visible:outline-site-link-hover"
                >
                  {#if shareCopied}
                    <DoodleIcon name="check" size={14} />
                    {playgroundCopy.linkCopied}
                  {:else}
                    <DoodleIcon name="note" size={14} />
                    {playgroundCopy.share}
                  {/if}
                </button>
              </div>
              {#if shareFallbackUrl}
                <div class="grid gap-2 rounded-md border border-dashed border-site-line-strong px-3 py-2">
                  <p class="challenge-playground-meta text-xs">
                    {playgroundCopy.shareManualCopy}
                  </p>
                  <input
                    class="challenge-playground-fallback rounded-md border border-dashed border-site-line-strong bg-transparent px-3 py-2 font-mono text-xs outline-none focus:border-site-link-hover focus:outline-2 focus:outline-offset-2 focus:outline-dashed focus:outline-site-link-hover"
                    readonly
                    type="text"
                    value={shareFallbackUrl}
                    onclick={(event) => (event.currentTarget as HTMLInputElement).select()}
                    onfocus={(event) => (event.currentTarget as HTMLInputElement).select()}
                    {...getDataHookAttributes(challengePlaygroundDomHooks.shareUrl)}
                  />
                </div>
              {/if}
              {#if complexity}
                <div class="challenge-playground-warning-card flex items-start gap-2.5 rounded-md border border-dashed px-3 py-2">
                  <DoodleIcon className="challenge-playground-warning-ink mt-0.5 shrink-0" name="gauge" size={16} />
                  <p class="challenge-playground-warning-copy text-xs">
                    {#each getEfficiencyMessageParts(playgroundCopy.successfulButMoreEfficient, {
                      time: complexity.time,
                      space: complexity.space,
                      solutionLabel: copy.solutionReveal.buttonLabel,
                    }) as part}
                      {#if part.type === 'text'}
                        {part.value}
                      {:else if part.type === 'solutionLabel'}
                        <strong>{part.value}</strong>
                      {:else}
                        <strong class="font-mono">{part.value}</strong>
                      {/if}
                    {/each}
                  </p>
                </div>
              {/if}
            </div>
          {/if}

          <ul class="grid gap-2">
            {#each results as result}
              <li
                class="challenge-playground-result-card flex items-start gap-2.5 rounded-md border border-dashed px-3 py-2.5 {result.pass
                  ? 'challenge-playground-result-card--pass'
                  : 'challenge-playground-result-card--fail'}"
              >
                <span
                  class="mt-0.5 shrink-0 {result.pass
                    ? 'challenge-playground-success-ink'
                    : 'challenge-playground-issue-ink'}"
                >
                  {#if result.pass}
                    <DoodleIcon name="check" size={17} />
                  {:else}
                    <DoodleIcon name="cross" size={17} />
                  {/if}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="challenge-playground-body text-sm">{result.description}</p>
                  {#if !result.pass}
                    <div class="mt-1.5 grid gap-1">
                      {#if result.error}
                        <p class="challenge-playground-error-copy font-mono text-xs">{playgroundCopy.errorLabel}: {result.error}</p>
                      {:else}
                        <p class="challenge-playground-meta font-mono text-xs">
                          {playgroundCopy.expectedLabel}:
                          <span class="challenge-playground-body">{JSON.stringify(result.expected)}</span>
                        </p>
                        <p class="challenge-playground-meta font-mono text-xs">
                          {playgroundCopy.receivedLabel}:
                          <span class="challenge-playground-error-copy">{JSON.stringify(result.actual)}</span>
                        </p>
                      {/if}
                    </div>
                  {/if}
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  @keyframes pulse-green {
    0% {
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--site-success) 40%, transparent);
    }

    70% {
      box-shadow: 0 0 0 6px transparent;
    }

    100% {
      box-shadow: 0 0 0 0 transparent;
    }
  }

  .badge-allpass {
    animation: pulse-green 0.6s ease-out 1;
  }

  .challenge-playground-shell {
    --challenge-success-ink: var(--site-success);
    --challenge-success-bg: color-mix(in srgb, var(--site-success) 12%, transparent);
    --challenge-success-ring: color-mix(in srgb, var(--site-success) 26%, transparent);
    --challenge-warning-ink: color-mix(
      in srgb,
      var(--site-highlight-badge-ink) 76%,
      var(--site-base-ink-bright) 24%
    );
    --challenge-warning-bg: color-mix(in srgb, var(--site-highlight-badge-ink) 8%, transparent);
    --challenge-warning-ring: color-mix(in srgb, var(--site-highlight-badge-ink) 22%, transparent);
    --challenge-issue-ink: color-mix(
      in srgb,
      var(--site-link-hover) 72%,
      var(--site-highlight-badge-ink) 28%
    );
    --challenge-issue-bg: color-mix(in srgb, var(--site-link-hover) 8%, transparent);
    --challenge-issue-ring: color-mix(in srgb, var(--site-link-hover) 20%, transparent);
    background: var(--site-panel);
  }

  .challenge-playground-toolbar,
  .challenge-playground-panel,
  .challenge-playground-editor-error {
    border-color: color-mix(in srgb, var(--site-line-strong) 62%, transparent);
  }

  .challenge-playground-panel {
    background: color-mix(in srgb, var(--site-surface) 36%, var(--site-bg));
  }

  .challenge-playground-filename,
  .challenge-playground-body {
    color: color-mix(in srgb, var(--site-ink) 82%, var(--site-base-ink-bright) 18%);
  }

  .challenge-playground-meta,
  .challenge-playground-toolbar-action {
    color: color-mix(in srgb, var(--site-ink-muted) 90%, transparent);
  }

  .challenge-playground-toolbar-action:hover {
    color: var(--site-ink);
  }

  .challenge-playground-outline-action {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--site-line-strong) 70%, transparent);
  }

  .challenge-playground-outline-action:hover {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--site-link-hover) 54%, transparent);
  }

  .challenge-playground-primary {
    background: var(--site-accent);
    color: var(--site-base-ink-bright);
  }

  .challenge-playground-editor-error,
  .challenge-playground-issue-title,
  .challenge-playground-issue-ink,
  .challenge-playground-error-copy {
    color: var(--challenge-issue-ink);
  }

  .challenge-playground-fallback {
    background: transparent;
    color: color-mix(in srgb, var(--site-ink) 82%, var(--site-base-ink-bright) 18%);
  }

  .challenge-playground-hint {
    background: var(--challenge-warning-bg);
    box-shadow: inset 0 0 0 1px var(--challenge-warning-ring);
  }

  .challenge-playground-hint-index,
  .challenge-playground-warning-ink {
    color: var(--challenge-warning-ink);
  }

  .challenge-playground-success-ink {
    color: var(--challenge-success-ink);
  }

  .challenge-playground-success-badge {
    background: var(--challenge-success-bg);
    color: var(--challenge-success-ink);
  }

  .challenge-playground-success-card {
    border-color: var(--challenge-success-ring);
    background: var(--challenge-success-bg);
  }

  .challenge-playground-success-copy {
    color: color-mix(in srgb, var(--challenge-success-ink) 82%, var(--site-base-ink-bright) 18%);
  }

  .challenge-playground-share {
    color: var(--challenge-success-ink);
    border-color: color-mix(in srgb, var(--challenge-success-ink) 42%, transparent);
  }

  .challenge-playground-share:hover {
    background: color-mix(in srgb, var(--challenge-success-ink) 10%, transparent);
  }

  .challenge-playground-warning-card {
    border-color: var(--challenge-warning-ring);
    background: var(--challenge-warning-bg);
  }

  .challenge-playground-warning-copy {
    color: color-mix(in srgb, var(--challenge-warning-ink) 80%, var(--site-base-ink-bright) 20%);
  }

  .challenge-playground-result-card {
    border-color: color-mix(in srgb, var(--site-line-strong) 70%, transparent);
  }

  .challenge-playground-result-card--pass {
    background: color-mix(in srgb, var(--challenge-success-ink) 10%, transparent);
  }

  .challenge-playground-result-card--fail {
    background: var(--challenge-issue-bg);
  }
</style>
