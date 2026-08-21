import { siteConfig } from '@/lib/site-config'
import { getDefaultLocale, normalizeSiteLocale } from '@/lib/locale-config'

export type SiteLocale = string
type ArticleLevel = 'advanced' | 'beginner' | 'intermediate'
type ChallengeLevel = 'advanced' | 'beginner' | 'intermediate'

type SiteCopy = {
  locale: {
    dateLocale: string
    giscusLang: string
    lowerCaseLocale: string
  }
  article: {
    categoryLabel: string
    chatShare: string
    comments: string
    completed: string
    exploreRelated: string
    finishedArticle: string
    confirmBody: string
    confirmCancel: string
    confirmConfirm: string
    confirmTitle: string
    copyLink: string
    copyLinkError: string
    copyLinkManual: string
    copyLinkSuccess: string
    levelLabel: string
    markCompleted: string
    markUnread: string
    nextReads: string
    practice: string
    practiceChecklist: string
    practiceChecklistTitle: string
    practiceInApp: string
    practiceInAppTitle: string
    partOfTrack: string
    quickSummary: string
    quickSummaryTitle: string
    readingTimeLabel: string
    share: string
    shareArticleTitle: string
    shareDescription: string
    shareFallback: string
    shareOnLinkedIn: string
    shareOnTwitter: string
    shareOnWhatsApp: string
    shareTitle: string
    tableOfContents: string
    nextStep: string
    openComments: string
    updatedPrefix: string
  }
  articleMeta: {
    categoryLabels: Record<string, string>
    levelLabels: Record<ArticleLevel, string>
  }
  footer: {
    description: string
    glossary: string
    home: string
    newsletterDisclaimerAfterLinks: string
    newsletterDisclaimerBeforeLinks: string
    newsletterDisclaimerBetweenLinks: string
    learn: string
    newsletterInputPlaceholder: string
    newsletterSubmitLabel: string
    newsletterCopy: string
    newsletterTitle: string
    privacy: string
    practice: string
    rss: string
    rights: string
    search: string
    startHere: string
    terms: string
    tracks: string
    title: string
    topics: string
  }
  articlesIndex: {
    allItems: string
    browseTopicsLabel: string
    comingSoon: string
    copy: string
    filterLabel: string
    articleItems: string
    noteItems: string
    title: string
    viewAllLabel: string
  }
  challengeIndex: {
    allItems: string
    copy: string
    emptyState: string
    filterLabel: string
    more: string
    showLess: string
    title: string
  }
  challenge: {
    commonMistakes: string
    complexity: string
    complexitySpaceLabel: string
    complexityTimeLabel: string
    estimatedTime: string
    levelLabel: string
    nextChallenge: string
    previousChallenge: string
    readChallenge: string
    relatedChallenges: string
    relatedArticles: string
    solutionLanguage: string
    typeLabel: string
    whatToNotice: string
  }
  challengeMeta: {
    levelLabels: Record<ChallengeLevel, string>
  }
  challengePlayground: {
    allHintsRevealed: string
    attemptsPlural: string
    attemptsSingular: string
    createExecutionEnvironmentError: string
    editorErrorPrefix: string
    editorUnavailable: string
    errorLabel: string
    executionError: string
    executionErrorTitle: string
    executionTimeout: string
    expectedLabel: string
    hintAvailable: string
    hintsRevealedPlural: string
    hintsRevealedSingular: string
    interactiveExecutionOnly: string
    lineMessage: string
    linkCopied: string
    nextHint: string
    processTypeScriptError: string
    receivedLabel: string
    reset: string
    resetTitle: string
    resultsPassing: string
    run: string
    runTitle: string
    runUnavailable: string
    running: string
    share: string
    shareManualCopy: string
    shareTitle: string
    showHint: string
    solvedFirstAttempt: string
    solvedNthAttempt: string
    noJsCodeLabel: string
    noJsDescription: string
    storageUnavailable: string
    successfulButMoreEfficient: string
    testsAllPassing: string
  }
  conceptsIndex: {
    copy: string
    title: string
  }
  directory: {
    allItems: string
    articleCountPlural: string
    articleCountSingular: string
    filterByConcept: string
    filterBySubtopic: string
    filterByTag: string
    filterByTopic: string
    articleItems: string
    more: string
    nextPage: string
    noteItems: string
    noteBadge: string
    filtersRequireJavaScript: string
    page: string
    previousPage: string
    readAgain: string
    readMore: string
    relatedArticles: string
    showLess: string
  }
  glossaryIndex: {
    copy: string
    title: string
  }
  header: {
    brand: string
    closeMenu: string
    explore: string
    menu: string
    primaryNav: string
    languageSwitcher: string
    skipToContent: string
  }
  startHere: {
    articleLabel: string
    backToRoadmap: string
    browseLibrary: string
    completedCountSuffix: string
    continueWhereLeftOff: string
    conceptLabel: string
    copy: string
    exploreFurther: string
    glossary: string
    inThisTrack: string
    introEyebrow: string
    linearHeading: string
    nextArticle: string
    nextTrack: string
    otherTracks: string
    previousArticle: string
    progressLabel: string
    roadmapEyebrow: string
    reviewTrack: string
    stepLabel: string
    stepsLabel: string
    supportCopy: string
    supportHeading: string
    trackCompleted: string
    title: string
    topics: string
  }
  learn: string
  layout: {
    articles: string
    concepts: string
    glossary: string
    home: string
    practice: string
    search: string
    startHere: string
    themeToggle: string
    tracks: string
    topics: string
  }
  recentUpdates: {
    description: string
    publishedLabel: string
    title: string
    updatedLabel: string
  }
  notFound: {
    eyebrow: string
    homeLabel: string
    sectionHeading: string
    title: string
    description: string
  }
  search: {
    copy: string
    devNotice: string
    title: string
  }
  searchLauncher: {
    close: string
    emptyNoSections: string
    emptyWithSections: string
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
  siteLabels: Record<string, string>
  solutionReveal: {
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
  trackProgress: {
    continueTrack: string
    nextLabel: string
    noJsDescription: string
    ofLabel: string
  }
  topicIndex: {
    copy: string
    title: string
    viewAllLabel: string
  }
  tracksIndex: {
    copy: string
    filterLabel: string
    title: string
  }
}

const siteCopy: Record<string, SiteCopy> = {
  en: {
    locale: {
      dateLocale: 'en-US',
      giscusLang: 'en',
      lowerCaseLocale: 'en-US',
    },
    article: {
      categoryLabel: 'Category',
      chatShare: 'Share in chat',
      comments: 'Comments',
      completed: 'Completed',
      exploreRelated: 'Or explore related',
      finishedArticle: 'You finished this article',
      confirmBody:
        'When you mark this article as complete, it will stop showing up in suggestions. You can still practice the topic later. Do you want to continue?',
      confirmCancel: 'Cancel',
      confirmConfirm: 'Yes, continue',
      confirmTitle: 'Mark this article as completed?',
      copyLink: 'Copy link',
      copyLinkError: 'This browser could not copy the link.',
      copyLinkManual: 'Copy the link manually from the field below.',
      copyLinkSuccess: 'Link copied. You can paste it into any chat.',
      levelLabel: 'Level',
      markCompleted: 'Mark as completed',
      markUnread: 'Mark as unread',
      nextReads: 'Next reads',
      practice: 'Practice',
      practiceChecklist: 'Practice checklist',
      practiceChecklistTitle: 'Use this when you answer',
      practiceInApp: 'Practice in the app',
      practiceInAppTitle: 'Turn this idea into reps',
      partOfTrack: 'Part of the track',
      quickSummary: 'Quick summary',
      quickSummaryTitle: 'What to keep in your head',
      readingTimeLabel: 'Reading time',
      share: 'Share',
      shareArticleTitle: 'Share this page',
      shareDescription: 'Share this page directly from the site, open it in chat, or copy the link.',
      shareFallback: 'This browser could not open the share menu. Use copy link instead.',
      shareOnLinkedIn: 'Share on LinkedIn',
      shareOnTwitter: 'Share on X',
      shareOnWhatsApp: 'Share on WhatsApp',
      shareTitle: 'Share this page',
      tableOfContents: 'On this page',
      nextStep: 'Next step',
      openComments: 'View comments',
      updatedPrefix: 'Updated on ',
    },
    articleMeta: {
      categoryLabels: {
        frontend: 'Frontend',
        systems: 'Systems',
        thinking: 'Thinking',
      },
      levelLabels: {
        advanced: 'Advanced',
        beginner: 'Beginner',
        intermediate: 'Intermediate',
      },
    },
    footer: {
      description: 'Organized content and easy-to-understand explanations for people who want to think better before they solve.',
      glossary: 'Glossary',
      home: 'Home',
      newsletterDisclaimerAfterLinks: '',
      newsletterDisclaimerBeforeLinks: 'By subscribing, you agree to the ',
      newsletterDisclaimerBetweenLinks: ' and the ',
      learn: 'Articles',
      newsletterInputPlaceholder: 'Your main email',
      newsletterSubmitLabel: 'Subscribe',
      newsletterCopy: 'Sign up to receive important insights about senior growth. No spam.',
      newsletterTitle: 'Subscribe to our newsletter',
      privacy: 'Privacy policy',
      practice: 'Practice',
      rss: 'RSS feed',
      rights: 'All rights reserved.',
      search: 'Search',
      startHere: 'Start Here',
      terms: 'Terms and conditions',
      tracks: 'Tracks',
      title: siteConfig.site.name,
      topics: 'Topics',
    },
    header: {
      brand: siteConfig.site.name,
      closeMenu: 'Close menu',
      explore: 'Explore',
      menu: 'Menu',
      primaryNav: 'Primary navigation',
      languageSwitcher: 'Language switcher',
      skipToContent: 'Skip to main content',
    },
    startHere: {
      articleLabel: 'Article',
      backToRoadmap: 'Back to track',
      browseLibrary: 'Explore articles',
      completedCountSuffix: 'completed',
      continueWhereLeftOff: 'Continue where you left off',
      conceptLabel: 'Concept',
      copy:
        'A guided reading track for thinking better before you jump into solutions, interviews, or coding-style challenges.',
      exploreFurther: 'Explore further',
      glossary: 'Look up a term',
      inThisTrack: 'In this track',
      introEyebrow: 'Track',
      linearHeading: 'Follow the reading in order',
      nextArticle: 'Next article',
      nextTrack: 'Next track',
      otherTracks: 'Other tracks',
      previousArticle: 'Previous article',
      progressLabel: 'Track progress',
      roadmapEyebrow: 'Track',
      reviewTrack: 'Review the track',
      stepLabel: 'Step',
      stepsLabel: 'Steps',
      supportCopy: 'When you want to browse more freely, use articles, topics, or the glossary as support.',
      supportHeading: 'Keep exploring',
      trackCompleted: 'Track completed',
      title: 'How to think before you solve',
      topics: 'Explore topics',
    },
    articlesIndex: {
      allItems: 'All',
      browseTopicsLabel: 'Browse topics',
      comingSoon: 'Coming soon',
      copy: 'Articles, notes, and tracks to help you understand better and decide with more clarity.',
      filterLabel: 'Choose a theme',
      articleItems: 'Articles',
      noteItems: 'Notes',
      title: 'Explaining the things people pretend to understand',
      viewAllLabel: 'View all articles',
    },
    challengeIndex: {
      allItems: 'All',
      copy: 'Step-by-step explanations to help you learn how to solve coding tests and pass live coding interviews.',
      emptyState: 'No challenges have been published here yet.',
      filterLabel: 'Filter by type or level',
      more: 'more',
      showLess: 'Show less',
      title: 'Challenges',
    },
    challenge: {
      commonMistakes: 'Common mistakes',
      complexity: 'Final complexity',
      complexitySpaceLabel: 'Space',
      complexityTimeLabel: 'Time',
      estimatedTime: 'Estimated time',
      levelLabel: 'Level',
      nextChallenge: 'Next challenge',
      previousChallenge: 'Previous challenge',
      readChallenge: 'Open challenge',
      relatedArticles: 'Related articles',
      relatedChallenges: 'Related challenges',
      solutionLanguage: 'Solution language',
      typeLabel: 'Type',
      whatToNotice: 'What to notice before coding',
    },
    challengeMeta: {
      levelLabels: {
        advanced: 'Advanced',
        beginner: 'Beginner',
        intermediate: 'Intermediate',
      },
    },
    challengePlayground: {
      allHintsRevealed: 'All hints revealed',
      attemptsPlural: '{count} attempts',
      attemptsSingular: '{count} attempt',
      createExecutionEnvironmentError: 'Could not create execution environment',
      editorErrorPrefix: 'Editor error',
      editorUnavailable: 'Editor unavailable',
      errorLabel: 'Error',
      executionError: 'Execution error',
      executionErrorTitle: 'Execution error',
      executionTimeout: 'Time limit exceeded. Check for infinite loops.',
      expectedLabel: 'expected',
      hintAvailable: 'Stuck? Hints available.',
      hintsRevealedPlural: '{count}/{total} hints revealed',
      hintsRevealedSingular: '{count}/{total} hint revealed',
      interactiveExecutionOnly: 'Interactive execution is available only for JavaScript and TypeScript.',
      lineMessage: 'Line {line}: {message}',
      linkCopied: 'Link copied!',
      nextHint: 'Next hint',
      processTypeScriptError: 'Could not process TypeScript types',
      receivedLabel: 'received',
      reset: 'Reset',
      resetTitle: 'Reset to the starter code',
      resultsPassing: '{passCount}/{totalCount} tests passing',
      run: 'Run',
      runTitle: 'Run (Ctrl+Enter)',
      runUnavailable: 'Execution unavailable',
      running: 'Running...',
      share: 'Share',
      shareManualCopy: 'Copy the link manually from the field below.',
      shareTitle: 'Copy a link with your solution',
      showHint: 'Show hint',
      solvedFirstAttempt: 'Solved on the first attempt!',
      solvedNthAttempt: 'Solved on attempt {attempt}',
      noJsCodeLabel: 'Starter code',
      noJsDescription:
        'The interactive editor needs JavaScript. You can still read the prompt and copy the starter code below.',
      storageUnavailable:
        'This browser is blocking local storage. Your code and solved state will not persist after reload.',
      successfulButMoreEfficient:
        'Your solution passes. A more efficient version exists: optimal time {time} and space {space}. See "{solutionLabel}".',
      testsAllPassing: 'All passing',
    },
    conceptsIndex: {
      copy: 'Master the most important concepts to grow your understanding.',
      title: 'Concepts',
    },
    directory: {
      allItems: 'All',
      articleCountPlural: 'articles',
      articleCountSingular: 'article',
      filterByConcept: 'Filter by concept',
      filterBySubtopic: 'Filter by subtopic',
      filterByTag: 'Filter by tag',
      filterByTopic: 'Filter by topic',
      articleItems: 'Articles',
      more: 'more',
      nextPage: 'Next page',
      noteItems: 'Notes',
      noteBadge: 'Note',
      filtersRequireJavaScript: 'Filters need JavaScript. You can still browse the full list below.',
      page: 'Page',
      previousPage: 'Previous page',
      readAgain: 'Read again',
      readMore: 'Read more',
      relatedArticles: 'Related articles',
      showLess: 'Show less',
    },
    glossaryIndex: {
      copy: 'Short reference entries for concepts that keep showing up across articles and interviews.',
      title: 'Glossary',
    },
    learn: 'Articles',
    layout: {
      articles: 'Articles',
      concepts: 'Concepts',
      glossary: 'Glossary',
      home: 'Home',
      practice: 'Practice',
      search: 'Search',
      startHere: 'Start Here',
      themeToggle: 'Toggle theme',
      tracks: 'Tracks',
      topics: 'Topics',
    },
    recentUpdates: {
      description: 'Fresh edits and recent additions worth revisiting from across the site.',
      publishedLabel: 'New',
      title: 'Recently updated',
      updatedLabel: 'Updated',
    },
    notFound: {
      eyebrow: '404',
      homeLabel: 'Go to homepage',
      sectionHeading: 'Start again from one of the main sections',
      title: 'Page not found',
      description:
        'This page may have moved, been removed, or never existed in this locale. Start again from the homepage or jump into one of the main sections.',
    },
    search: {
      copy: 'Search across articles, topics, and glossary entries from one place.',
      devNotice: 'Search index is generated during build. Use preview/build to test Pagefind locally.',
      title: 'Search the site',
    },
    searchLauncher: {
      close: 'Close search',
      emptyNoSections: 'No searchable sections are enabled right now.',
      emptyWithSections: 'Type to search across {sections}.',
      error: 'Search is currently unavailable.',
      hint: 'Site search',
      loading: 'Searching...',
      noResults: 'No results found.',
      noJsFallback: 'Browse content',
      placeholder: 'Search',
      shortcut: 'Ctrl K',
      title: 'Search',
      unavailable: 'Search is only available in preview/build.',
    },
    siteLabels: {
      'Thinking Like a Senior': 'Thinking Like a Senior',
      'Problem Breakdown': 'Problem Breakdown',
      'Trade-offs and Constraints': 'Trade-offs and Constraints',
      'Code for Humans': 'Code for Humans',
      'Runtime & Execution': 'Runtime & Execution',
      'Event Loop and Execution Order': 'Event loop and execution order',
      'Concurrency and Parallelism': 'Concurrency and parallelism',
      'Memory Basics': 'Memory Basics',
      'Problem Solving & Interview Thinking': 'Problem Solving & Interview Thinking',
      'Approach and Framing': 'Approach and Framing',
      'Pattern Recognition': 'Pattern Recognition',
      'Communicating Solutions': 'Communicating Solutions',
      'State & UI Thinking': 'State & UI Thinking',
      'State Ownership': 'State Ownership',
      'Effects and Side Effects': 'Effects without the mess',
      'Server and Client Thinking': 'Server and Client Thinking',
      'System Thinking': 'System Thinking',
      'AI Systems and Retrieval': 'AI, retrieval, and context',
      'Execution & Communication': 'Execution and communication',
      'Estimation and Risk': 'Estimation and risk',
      'Communication in Work and Interviews': 'Communication at work and in interviews',
      'coding-interview': 'Coding interview',
      agents: 'Agents',
      api: 'API',
      backend: 'Backend',
      browser: 'Browser',
      'distributed-systems': 'Distributed systems',
      devops: 'DevOps',
      evals: 'Evals',
      frontend: 'Frontend',
      integrations: 'Integrations',
      llm: 'LLM',
      messaging: 'Messaging',
      objects: 'Objects',
      observability: 'Observability',
      promises: 'Promises',
      protocols: 'Protocols',
      reliability: 'Reliability',
      rendering: 'Rendering',
      runtime: 'Runtime',
      search: 'Search',
      'software-engineering': 'Software engineering',
      ssr: 'SSR',
      streams: 'Streams',
      systems: 'Systems',
      'system-design': 'System Design',
      testing: 'Testing',
      'ai-engineering': 'AI Engineering',
      'Pensar como senior': 'Thinking Like a Senior',
      'Quebrar o problema': 'Problem Breakdown',
      'Trade-offs e limites': 'Trade-offs and Constraints',
      'Codigo para humanos': 'Code for Humans',
      'Como o codigo roda': 'Runtime & Execution',
      'Event loop e ordem de execucao': 'Event Loop and Execution Order',
      'Concorrencia e paralelismo': 'Concurrency and Parallelism',
      'Memoria': 'Memory Basics',
      'Pensamento de entrevista e resolucao de problemas': 'Problem Solving & Interview Thinking',
      'Abordagem': 'Approach and Framing',
      'Reconhecer padroes': 'Pattern Recognition',
      'Explicar solucoes': 'Communicating Solutions',
      'Estrutura de system design': 'System Design Framework',
      'Estimativa de capacidade': 'Capacity Estimation',
      'Simulacoes': 'Mock Interviews',
      'Estado e interface': 'State & UI Thinking',
      'Estado': 'State Ownership',
      'Effects e side effects': 'Effects and Side Effects',
      'Cliente e servidor': 'Server and Client Thinking',
      'Dados e armazenamento': 'Data & Persistence',
      'Modelagem de dados': 'Data Modeling',
      'SQL vs NoSQL': 'SQL vs NoSQL',
      'Cache e consistencia': 'Cache and Consistency',
      'Sistemas na pratica': 'System Thinking',
      'Escala e gargalos': 'Scalability and Bottlenecks',
      'APIs e servicos': 'API and Service Design',
      'IA, busca e contexto': 'AI Systems and Retrieval',
      'Mensageria e filas': 'Messaging and Queues',
      'Replicacao e sharding': 'Replication and Sharding',
      'Rate limiting': 'Rate Limiting',
      'Load balancing e roteamento de trafego': 'Load Balancing and Traffic Routing',
      'Teorema CAP': 'CAP Theorem',
      'Modelos de consistencia': 'Consistency Models',
      'Idempotencia': 'Idempotency',
      'Consistent hashing': 'Consistent Hashing',
      'Debug e producao': 'Debugging & Production Thinking',
      'Falhas em producao': 'Production Failures',
      'Logs e observabilidade': 'Logs and Observability',
      'Bugs assincronos e race conditions': 'Async and Race Bugs',
      'Rodadas de debugging': 'Debugging Rounds',
      'Padroes que ajudam de verdade': 'Patterns That Actually Matter',
      'Composicao vs abstracao': 'Composition vs Abstraction',
      'Reuso e complexidade': 'Reuse vs Complexity',
      'Evitar overengineering': 'Avoiding Overengineering',
      'Performance sem achismo': 'Performance That Makes Sense',
      'Onde esta o gargalo': 'Bottleneck Detection',
      'Renderizacao, rede e CPU': 'Rendering, Network, and CPU',
      'Medir antes de otimizar': 'Measurement Before Optimization',
      'Seguranca na pratica': 'Security Thinking',
      'Limites de confianca': 'Trust Boundaries',
      'Autenticacao e autorizacao': 'Auth and Authorization',
      'Entradas e APIs mais seguras': 'Input and API Safety',
      'Acessibilidade que importa': 'Accessibility That Actually Matters',
      'Semantica e estrutura': 'Semantics and Structure',
      'Teclado e foco': 'Keyboard and Focus',
      'Componentes React acessiveis': 'Accessible React Components',
      'Execucao e comunicacao': 'Execution & Communication',
      'Tickets e tarefas': 'Ticket and Task Thinking',
      'Estimativa e risco': 'Estimation and Risk',
      'Formas de trabalhar': 'Ways of Working',
      'Comunicacao no trabalho e em entrevistas': 'Communication in Work and Interviews',
      'Processo de contratacao e carreira': 'Hiring Process and Career',
      'Comunicacao tecnica em ingles': 'Technical Communication in English',
      'Entrevista em ingles': 'Interviewing in English',
      'Escrita e comunicacao assincrona': 'Writing and Async Communication',
      'Cenarios reais': 'Real-World Scenarios',
      'Cenarios de API em escala': 'Scalable API Scenarios',
      'Falha e recuperacao': 'Failure and Recovery Scenarios',
      'Cenarios com IA': 'AI Feature Scenarios',
      'Design de feed': 'Social Media Feed System Design',
      'Design de encurtador de URL': 'URL Shortener System Design',
      'Design de notificacoes': 'Notification System Design',
      'Design de upload e processamento': 'File Upload and Processing System Design',
      'Design de busca': 'Search System Design',
      'Lideranca tecnica na pratica': 'Technical Leadership in Practice',
      'Delegacao e alavancagem': 'Delegation and Leverage',
      'Coaching e crescimento': 'Coaching and Growth',
      'Elevar o padrao tecnico': 'Raising the Bar',
      'Arquitetura frontend na pratica': 'Frontend Architecture in Practice',
      'Fronteiras e estado': 'Boundaries and State',
      'Composicao e escala': 'Composition and Scaling',
      'Design system e consistencia': 'Design Systems and Consistency',
      'Medicao e experimentacao de produto': 'Product Measurement and Experimentation',
      'Instrumentacao e eventos': 'Instrumentation and Events',
      'Metricas e guardrails': 'Metrics and Guardrails',
      'Experimentos e aprendizado': 'Experiments and Learning',
      'Arquitetura backend na pratica': 'Backend Architecture in Practice',
      'Fronteiras e responsabilidades': 'Boundaries and Responsibilities',
      'Forma do fluxo': 'Flow Shape',
      'Monolito modular': 'Modular Monoliths',
    },
    solutionReveal: {
      buttonLabel: 'View solution',
      cancel: "I'll keep trying",
      confirmSolved: 'View anyway',
      confirmUnsolved: 'View anyway',
      noJsDetailsLabel: 'Open the reference solution',
      noJsMessage: 'Without JavaScript, the reference solution is shown inline instead of in a dialog.',
      solutionLabel: 'Solution',
      solvedMessage: 'You already solved this challenge. Want to see the reference solution?',
      solvedTitle: 'Challenge solved!',
      unsolvedMessage: "Viewing the solution now may reduce learning. It's worth trying a bit more.",
      unsolvedTitle: "Haven't solved it yet?",
    },
    trackProgress: {
      continueTrack: 'Continue on this track',
      nextLabel: 'Next',
      noJsDescription: 'Progress tracking needs JavaScript. You can still follow the track from the first step.',
      ofLabel: 'of',
    },
    topicIndex: {
      copy: 'Content organized by theme. Explore articles and deepen your understanding without confusion.',
      title: 'Topics',
      viewAllLabel: 'View all topics',
    },
    tracksIndex: {
      copy: 'Content organized in sequence to make your progress easier.',
      filterLabel: 'Filter by tag',
      title: 'Tracks to grow with consistency',
    },
  },
  'pt-br': {
    locale: {
      dateLocale: 'pt-BR',
      giscusLang: 'pt',
      lowerCaseLocale: 'pt-BR',
    },
    article: {
      categoryLabel: 'Categoria',
      chatShare: 'Compartilhar no chat',
      comments: 'Comentários',
      completed: 'Concluído',
      exploreRelated: 'Ou explore relacionados',
      finishedArticle: 'Você concluiu este artigo',
      confirmBody:
        'Quando você marcar este artigo como concluído, ele para de aparecer nas sugestões. Ainda será possível praticar o tema depois. Quer continuar?',
      confirmCancel: 'Cancelar',
      confirmConfirm: 'Sim, continuar',
      confirmTitle: 'Marcar este artigo como concluído?',
      copyLink: 'Copiar link',
      copyLinkError: 'Este navegador não conseguiu copiar o link.',
      copyLinkManual: 'Copie o link manualmente no campo abaixo.',
      copyLinkSuccess: 'Link copiado. Agora você pode colar em qualquer chat.',
      levelLabel: 'Nível',
      markCompleted: 'Marcar como concluído',
      markUnread: 'Marcar como não lido',
      nextReads: 'Próximas leituras',
      practice: 'Praticar',
      practiceChecklist: 'Checklist de pratica',
      practiceChecklistTitle: 'Use isto ao responder',
      practiceInApp: 'Pratique no app',
      practiceInAppTitle: 'Transforme esta ideia em repeticoes',
      partOfTrack: 'Parte da trilha',
      quickSummary: 'Resumo rápido',
      quickSummaryTitle: 'O que vale manter na cabeça',
      readingTimeLabel: 'Tempo de leitura',
      share: 'Compartilhar',
      shareArticleTitle: 'Compartilhar esta página',
      shareDescription: 'Compartilhe esta página direto do site, abra no chat ou copie o link.',
      shareFallback: 'Este navegador não conseguiu abrir o menu de compartilhamento. Use copiar link.',
      shareOnLinkedIn: 'Compartilhar no LinkedIn',
      shareOnTwitter: 'Compartilhar no X',
      shareOnWhatsApp: 'Compartilhar no WhatsApp',
      shareTitle: 'Compartilhar esta página',
      tableOfContents: 'Nesta página',
      nextStep: 'Próximo passo',
      openComments: 'Ver comentarios',
      updatedPrefix: 'Atualizado em ',
    },
    articleMeta: {
      categoryLabels: {
        frontend: 'Frontend',
        systems: 'Sistemas',
        thinking: 'Pensamento',
      },
      levelLabels: {
        advanced: 'Avancado',
        beginner: 'Iniciante',
        intermediate: 'Intermediario',
      },
    },
    footer: {
      description: 'Conteúdo organizado e explicações fáceis de entender pra quem quer pensar melhor antes de resolver.',
      glossary: 'Glossário',
      home: 'Inicio',
      newsletterDisclaimerAfterLinks: '',
      newsletterDisclaimerBeforeLinks: 'Ao se inscrever, você concorda com os ',
      newsletterDisclaimerBetweenLinks: ' e ',
      learn: 'Artigos',
      newsletterInputPlaceholder: 'Seu email principal',
      newsletterSubmitLabel: 'Inscrever-se',
      newsletterCopy: 'Cadastre-se para receber insights importantes sobre senioridade. Sem spam.',
      newsletterTitle: 'Inscreva-se na nossa newsletter',
      privacy: 'Política de privacidade',
      practice: 'Praticar',
      rss: 'Feed RSS',
      rights: 'Todos os direitos reservados.',
      search: 'Busca',
      startHere: 'Comece aqui',
      terms: 'Termos e condições',
      tracks: 'Trilhas',
      title: siteConfig.site.name,
      topics: 'Tópicos',
    },
    header: {
      brand: siteConfig.site.name,
      closeMenu: 'Fechar menu',
      explore: 'Explorar',
      menu: 'Menu',
      primaryNav: 'Principal',
      languageSwitcher: 'Alternar idioma',
      skipToContent: 'Pular para o conteudo principal',
    },
    startHere: {
      articleLabel: 'Artigo',
      backToRoadmap: 'Voltar para a trilha',
      browseLibrary: 'Explorar artigos',
      completedCountSuffix: 'concluídos',
      continueWhereLeftOff: 'Continuar de onde você parou',
      conceptLabel: 'Conceito',
      copy:
        'Uma trilha guiada de leitura para pensar melhor antes de pular para soluções, entrevistas ou desafios de código.',
      exploreFurther: 'Explore mais',
      glossary: 'Consultar um termo',
      inThisTrack: 'Nesta trilha',
      introEyebrow: 'Trilha',
      linearHeading: 'Siga a leitura em ordem',
      nextArticle: 'Próximo artigo',
      nextTrack: 'Próxima trilha',
      otherTracks: 'Outras trilhas',
      previousArticle: 'Artigo anterior',
      progressLabel: 'Progresso da trilha',
      roadmapEyebrow: 'Trilha',
      reviewTrack: 'Rever a trilha',
      stepLabel: 'Etapa',
      stepsLabel: 'Etapas',
      supportCopy: 'Quando você quiser explorar com mais liberdade, use os artigos, os tópicos e o glossário como apoio.',
      supportHeading: 'Continue explorando',
      trackCompleted: 'Trilha concluída',
      title: 'Como pensar antes de resolver',
      topics: 'Explorar tópicos',
    },
    articlesIndex: {
      allItems: 'Tudo',
      browseTopicsLabel: 'Explorar tópicos',
      comingSoon: 'Em breve',
      copy: 'Artigos, notas e trilhas para ajudar você a entender melhor e decidir com mais clareza.',
      filterLabel: 'Escolha um tema',
      articleItems: 'Artigos',
      noteItems: 'Notas',
      title: 'Explicando as coisas que as pessoas fingem entender',
      viewAllLabel: 'Ver todos os artigos',
    },
    challengeIndex: {
      allItems: 'Tudo',
      copy: 'Passo a passo explicado para voce aprender a resolver testes e passar nas entrevistas de live coding.',
      emptyState: 'Ainda nao ha desafios publicados aqui.',
      filterLabel: 'Filtrar por tipo ou nivel',
      more: 'mais',
      showLess: 'Mostrar menos',
      title: 'Desafios',
    },
    challenge: {
      commonMistakes: 'Erros comuns',
      complexity: 'Complexidade final',
      complexitySpaceLabel: 'Espaço',
      complexityTimeLabel: 'Tempo',
      estimatedTime: 'Tempo estimado',
      levelLabel: 'Nivel',
      nextChallenge: 'Proximo desafio',
      previousChallenge: 'Desafio anterior',
      readChallenge: 'Abrir desafio',
      relatedArticles: 'Artigos relacionados',
      relatedChallenges: 'Desafios relacionados',
      solutionLanguage: 'Linguagem da solucao',
      typeLabel: 'Tipo',
      whatToNotice: 'O que perceber antes de codar',
    },
    challengeMeta: {
      levelLabels: {
        advanced: 'Avancado',
        beginner: 'Iniciante',
        intermediate: 'Intermediario',
      },
    },
    challengePlayground: {
      allHintsRevealed: 'Todas as dicas reveladas',
      attemptsPlural: '{count} tentativas',
      attemptsSingular: '{count} tentativa',
      createExecutionEnvironmentError: 'Erro ao criar ambiente de execução',
      editorErrorPrefix: 'Erro do editor',
      editorUnavailable: 'Editor indisponivel',
      errorLabel: 'Erro',
      executionError: 'Erro de execução',
      executionErrorTitle: 'Erro de execução',
      executionTimeout: 'Tempo limite excedido. Verifique se ha loops infinitos.',
      expectedLabel: 'esperado',
      hintAvailable: 'Travado? Dicas disponiveis.',
      hintsRevealedPlural: '{count}/{total} dicas reveladas',
      hintsRevealedSingular: '{count}/{total} dica revelada',
      interactiveExecutionOnly: 'Execução interativa disponível apenas para JavaScript e TypeScript.',
      lineMessage: 'Linha {line}: {message}',
      linkCopied: 'Link copiado!',
      nextHint: 'Proxima dica',
      processTypeScriptError: 'Erro ao processar tipos TypeScript',
      receivedLabel: 'recebido',
      reset: 'Reiniciar',
      resetTitle: 'Voltar ao codigo inicial',
      resultsPassing: '{passCount}/{totalCount} testes passando',
      run: 'Executar',
      runTitle: 'Executar (Ctrl+Enter)',
      runUnavailable: 'Execução indisponível',
      running: 'Executando...',
      share: 'Compartilhar',
      shareManualCopy: 'Copie o link manualmente no campo abaixo.',
      shareTitle: 'Copiar link com sua solucao',
      showHint: 'Ver dica',
      solvedFirstAttempt: 'Resolvido na primeira tentativa!',
      solvedNthAttempt: 'Resolvido na {attempt}ª tentativa',
      noJsCodeLabel: 'Codigo inicial',
      noJsDescription:
        'O editor interativo precisa de JavaScript. Voce ainda pode ler o desafio e copiar o codigo inicial abaixo.',
      storageUnavailable:
        'Este navegador esta bloqueando o local storage. Seu codigo e seu progresso nao vao persistir apos recarregar.',
      successfulButMoreEfficient:
        'Sua solucao passa. Existe uma versao mais eficiente: solucao otima em tempo {time} e espaco {space}. Veja em "{solutionLabel}".',
      testsAllPassing: 'Todos passando',
    },
    conceptsIndex: {
      copy: 'Domine os conceitos mais importantes para evoluir seu conhecimento.',
      title: 'Conceitos',
    },
    directory: {
      allItems: 'Tudo',
      articleCountPlural: 'artigos',
      articleCountSingular: 'artigo',
      filterByConcept: 'Filtrar por conceito',
      filterBySubtopic: 'Filtrar por subtema',
      filterByTag: 'Filtrar por tag',
      filterByTopic: 'Filtrar por tópico',
      articleItems: 'Artigos',
      more: 'mais',
      nextPage: 'Próxima página',
      noteItems: 'Notas',
      noteBadge: 'Nota',
      filtersRequireJavaScript: 'Os filtros precisam de JavaScript. Ainda assim, a lista completa continua navegavel abaixo.',
      page: 'Página',
      previousPage: 'Página anterior',
      readAgain: 'Ler novamente',
      readMore: 'Ler mais',
      relatedArticles: 'Artigos relacionados',
      showLess: 'Mostrar menos',
    },
    glossaryIndex: {
      copy: 'Entradas curtas de referência para conceitos que aparecem o tempo todo em artigos e entrevistas.',
      title: 'Glossário',
    },
    learn: 'Artigos',
    layout: {
      articles: 'Artigos',
      concepts: 'Conceitos',
      glossary: 'Glossário',
      home: 'Inicio',
      practice: 'Praticar',
      search: 'Busca',
      startHere: 'Comece aqui',
      themeToggle: 'Alternar tema',
      tracks: 'Trilhas',
      topics: 'Tópicos',
    },
    recentUpdates: {
      description: 'Edicoes recentes e entradas novas que valem uma revisita em secoes diferentes do site.',
      publishedLabel: 'Novo',
      title: 'Recentemente atualizado',
      updatedLabel: 'Atualizado',
    },
    notFound: {
      eyebrow: '404',
      homeLabel: 'Ir para a home',
      sectionHeading: 'Recomece por uma das principais secoes',
      title: 'Pagina nao encontrada',
      description:
        'Esta pagina pode ter mudado de endereco, sido removida ou nunca ter existido neste locale. Recomece pela home ou entre por uma das principais secoes.',
    },
    search: {
      copy: 'Busque em artigos, tópicos e termos do glossário em um único lugar.',
      devNotice: 'O índice de busca é gerado no build. Use preview/build para testar o Pagefind localmente.',
      title: 'Buscar no site',
    },
    searchLauncher: {
      close: 'Fechar busca',
      emptyNoSections: 'Nenhuma area pesquisavel esta habilitada.',
      emptyWithSections: 'Digite para buscar em {sections}.',
      error: 'A busca não está disponível no momento.',
      hint: 'Busca no site',
      loading: 'Buscando...',
      noResults: 'Nenhum resultado encontrado.',
      noJsFallback: 'Explorar conteudo',
      placeholder: 'Buscar',
      shortcut: 'Ctrl K',
      title: 'Buscar',
      unavailable: 'A busca só fica disponível em preview/build.',
    },
    siteLabels: {
      'Thinking Like a Senior': 'Pensar como senior',
      'Problem Breakdown': 'Quebrar o problema',
      'Trade-offs and Constraints': 'Trade-offs e limites',
      'Code for Humans': 'Codigo para humanos',
      'Runtime & Execution': 'Como o codigo roda',
      'Event Loop and Execution Order': 'Event loop e ordem de execucao',
      'Concurrency and Parallelism': 'Concorrencia e paralelismo',
      'Memory Basics': 'Memoria',
      'Problem Solving & Interview Thinking': 'Pensamento de entrevista e resolucao de problemas',
      'Approach and Framing': 'Abordagem',
      'Pattern Recognition': 'Reconhecer padroes',
      'Communicating Solutions': 'Explicar solucoes',
      'State & UI Thinking': 'Estado e interface',
      'State Ownership': 'Estado',
      'Effects and Side Effects': 'Effects sem bagunca',
      'Server and Client Thinking': 'Cliente e servidor',
      'Data & Persistence': 'Dados e armazenamento',
      'Data Modeling': 'Modelagem de dados',
      'SQL vs NoSQL': 'SQL vs NoSQL',
      'Cache and Consistency': 'Cache e consistencia',
      'System Thinking': 'Sistemas na pratica',
      'Scalability and Bottlenecks': 'Escala e gargalos',
      'API and Service Design': 'APIs e servicos',
      'AI Systems and Retrieval': 'IA, busca e contexto',
      'Debugging & Production Thinking': 'Debug e producao',
      'Production Failures': 'Falhas em producao',
      'Logs and Observability': 'Logs e observabilidade',
      'Async and Race Bugs': 'Bugs assincronos e race conditions',
      'Patterns That Actually Matter': 'Padroes que ajudam de verdade',
      'Composition vs Abstraction': 'Composicao ou abstracao',
      'Reuse vs Complexity': 'Reuso sem complicar',
      'Avoiding Overengineering': 'Sem overengineering',
      'Performance That Makes Sense': 'Performance sem achismo',
      'Bottleneck Detection': 'Onde esta o gargalo',
      'Rendering, Network, and CPU': 'Renderizacao, rede e CPU',
      'Measurement Before Optimization': 'Medir antes de otimizar',
      'Security Thinking': 'Seguranca na pratica',
      'Trust Boundaries': 'Limites de confianca',
      'Auth and Authorization': 'Autenticacao e permissao',
      'Input and API Safety': 'Entradas e APIs mais seguras',
      'Accessibility That Actually Matters': 'Acessibilidade que importa',
      'Semantics and Structure': 'Semantica e estrutura',
      'Keyboard and Focus': 'Teclado e foco',
      'Accessible React Components': 'Componentes React acessiveis',
      'Execution & Communication': 'Execucao e comunicacao',
      'Ticket and Task Thinking': 'Tickets e tarefas',
      'Estimation and Risk': 'Estimativa e risco',
      'Communication in Work and Interviews': 'Comunicacao no trabalho e em entrevistas',
      'Real-World Scenarios': 'Cenarios reais',
      'Scalable API Scenarios': 'Cenarios de API em escala',
      'Failure and Recovery Scenarios': 'Falha e recuperacao',
      'AI Feature Scenarios': 'Cenarios com IA',
      'AI Engineering': 'Engenharia de IA',
      'Coding Challenges': 'Desafios de Codigo',
      Delivery: 'Entrega',
      Leadership: 'Lideranca',
      'System Design': 'Design de Sistemas',
      'Tech English': 'Ingles para Tech',
      'Problem Solving': 'Resolucao de Problemas',
      React: 'React',
      JavaScript: 'JavaScript',
      Node: 'Node',
      javascript: 'JavaScript',
      react: 'React',
      node: 'Node',
      async: 'assincrono',
      'event loop': 'event loop',
      state: 'estado',
      rendering: 'renderizacao',
      'coding-interview': 'entrevista de codigo',
      agents: 'agentes',
      api: 'API',
      backend: 'backend',
      browser: 'browser',
      'distributed-systems': 'sistemas distribuidos',
      devops: 'DevOps',
      evals: 'evals',
      frontend: 'frontend',
      integrations: 'integracoes',
      llm: 'LLM',
      messaging: 'mensageria',
      objects: 'objetos',
      observability: 'observabilidade',
      promises: 'Promises',
      protocols: 'protocolos',
      reliability: 'confiabilidade',
      runtime: 'runtime',
      search: 'busca',
      'software-engineering': 'engenharia de software',
      ssr: 'SSR',
      streams: 'streams',
      systems: 'sistemas',
      'system-design': 'System Design',
      testing: 'testes',
      'ai-engineering': 'Engenharia de IA',
      'coding interview': 'entrevista de codigo',
      'senior-thinking': 'pensamento senior',
      'problem-solving': 'resolucao de problemas',
      interviews: 'entrevistas',
      rag: 'rag',
      retrieval: 'retrieval',
      llms: 'llms',
      delivery: 'entrega',
      communication: 'comunicacao',
      risk: 'risco',
    },
    solutionReveal: {
      buttonLabel: 'Ver solução',
      cancel: 'Vou tentar mais',
      confirmSolved: 'Ver mesmo assim',
      confirmUnsolved: 'Ver mesmo assim',
      noJsDetailsLabel: 'Abrir a solucao de referencia',
      noJsMessage: 'Sem JavaScript, a solucao de referencia aparece inline em vez de um dialogo.',
      solutionLabel: 'Solução',
      solvedMessage: 'Você já resolveu este desafio. Quer ver a solução de referência?',
      solvedTitle: 'Desafio resolvido!',
      unsolvedMessage: 'Ver a solução agora pode reduzir o aprendizado. Vale a pena tentar mais um pouco.',
      unsolvedTitle: 'Ainda não resolveu?',
    },
    trackProgress: {
      continueTrack: 'Continue nesta trilha',
      nextLabel: 'Próximo',
      noJsDescription: 'O acompanhamento de progresso precisa de JavaScript. Mesmo assim, voce pode seguir a trilha desde o primeiro passo.',
      ofLabel: 'de',
    },
    topicIndex: {
      copy: 'Conteúdos organizados por tema. Explore artigos e aprofunde seu entendimento sem confusão.',
      title: 'Tópicos',
      viewAllLabel: 'Ver todos os tópicos',
    },
    tracksIndex: {
      copy: 'Conteúdo organizado em sequência pra facilitar seu progresso.',
      filterLabel: 'Filtrar por tag',
      title: 'Trilhas pra evoluir com consistência',
    },
  },
}

export function getSiteLocale(value?: string | null): SiteLocale {
  return normalizeSiteLocale(value)
}

export function getSiteCopy(value?: string | null) {
  const locale = getSiteLocale(value)

  return siteCopy[locale] ?? siteCopy[getDefaultLocale()]
}

export function getSiteDateLocale(value?: string | null) {
  return getSiteCopy(value).locale.dateLocale
}

export function getSiteLowerCaseLocale(value?: string | null) {
  return getSiteCopy(value).locale.lowerCaseLocale
}

export function getSiteGiscusLang(value?: string | null) {
  return getSiteCopy(value).locale.giscusLang
}

export function getSearchLauncherEmptyState(value: string | null | undefined, sections: string) {
  const copy = getSiteCopy(value)
  return sections
    ? copy.searchLauncher.emptyWithSections.replace('{sections}', sections)
    : copy.searchLauncher.emptyNoSections
}
