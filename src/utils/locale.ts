export type Locale = 'de' | 'en'

export interface LocaleStrings {
  nav: {
    home: string
    blog: string
    about: string
    contact: string
    openMenu: string
  }
  blog: {
    pageTitle: string
    heading: string
    lead: string
    filterAll: string
    loadMore: string
    published: string
    readSuffix: string
    readInOtherLang: string
  }
  home: {
    heroBefore: string
    heroAfter: string
    heroLead: string
    heroCta: string
    portraitAlt: string
    introWord1: string
    introWord2: string
    introConnector: string
    introLead: string
    latestTitle: string
    latestMore: string
  }
  footer: {
    socials: string
    legal: string
  }
  about: {
    heroTitle: string
    heroParagraph1: string
    heroParagraph2: string
    timelineTitle: string
    portraitAlt: string
  }
}

export const strings: Record<Locale, LocaleStrings> = {
  de: {
    nav: {
      home: 'Startseite',
      blog: 'Blog',
      about: 'Über mich',
      contact: 'Kontakt',
      openMenu: 'Menü öffnen',
    },
    blog: {
      pageTitle: 'Blog – Gedanken & Tutorials',
      heading: 'Gedanken & Tutorials',
      lead: 'Technologie, Design und das Leben als Entwickler – technische Deep-Dives und Erfahrungen aus dem Alltag.',
      filterAll: 'Alle Beiträge',
      loadMore: 'Mehr laden',
      published: 'Veröffentlicht',
      readSuffix: 'Lesezeit',
      readInOtherLang: 'Auf Englisch lesen',
    },
    home: {
      heroBefore: 'Hey ich bin ',
      heroAfter: ', Entwickler und schreibe hier über meine Erfahrungen als Entwickler.',
      heroLead: 'Ich bin leidenschaftlicher Software Engineer mit einem Fokus auf saubere Architekturen und nutzerzentriertes Design. In meiner täglichen Arbeit versuche ich, komplexen Problemen mit einfachen und eleganten Lösungen zu begegnen und mein Wissen kontinuierlich zu erweitern.',
      heroCta: 'Mein CV',
      portraitAlt: 'Portrait des Entwicklers',
      introWord1: 'Technologie',
      introWord2: 'Menschlichkeit',
      introConnector: 'im Einklang',
      introLead: "Hier schreibe ich über Technologie und das Leben als Entwickler in diesen turbulenten Zeiten. Ich hoffe, dass andere etwas aus meinen Erfahrungen mitnehmen können oder dass ich durch den Austausch selbst dazulerne. Der Blog ist ganz offen ein 'Work in Progress' und ich finde gerade noch heraus, in welche Richtung er sich genau entwickeln wird.",
      latestTitle: 'Neueste Gedanken',
      latestMore: 'Alle ansehen',
    },
    footer: {
      socials: 'Soziale Profile',
      legal: 'Rechtliche Hinweise',
    },
    about: {
      heroTitle: 'Mein Weg als Entwickler',
      heroParagraph1: 'Ich nähre mich der Softwareentwicklung ähnlich wie der Pflege eines Gartens. Es braucht Geduld, durchdachte Architektur und ein förderliches Umfeld, damit belastbare Systeme wachsen können. Meine Philosophie dreht sich darum, digitale Räume zu schaffen, die sich menschlich, organisch und geerdet anfühlen.',
      heroParagraph2: 'Im vergangenen Jahrzehnt habe ich Expertise in der Gestaltung taktiler Oberflächen und robuster Backend-Strukturen aufgebaut – stets mit einem weich-modernistischen Ästhetikansatz, der zur Interaktion einlädt statt sie zu fordern.',
      timelineTitle: 'Mein Werdegang',
      portraitAlt: 'Portrait des Entwicklers',
    },
  },
  en: {
    nav: {
      home: 'Home',
      blog: 'Blog',
      about: 'About',
      contact: 'Contact',
      openMenu: 'Open menu',
    },
    blog: {
      pageTitle: 'Blog – Thoughts & Tutorials',
      heading: 'Thoughts & Tutorials',
      lead: 'Technology, design, and life as a developer – technical deep-dives and day-to-day experiences.',
      filterAll: 'All Posts',
      loadMore: 'Load More',
      published: 'Published',
      readSuffix: 'read',
      readInOtherLang: 'Auf Deutsch lesen',
    },
    home: {
      heroBefore: "Hey, I'm ",
      heroAfter: ', a developer writing here about my experiences.',
      heroLead: "I'm a passionate software engineer focused on clean architectures and user-centred design. In my daily work I try to meet complex problems with simple, elegant solutions and to keep growing continuously.",
      heroCta: 'My CV',
      portraitAlt: 'Developer portrait',
      introWord1: 'Technology',
      introWord2: 'Humanity',
      introConnector: 'in Harmony',
      introLead: "Here I write about technology and life as a developer in these turbulent times. I hope others can take something from my experiences – or that I learn myself through the exchange. The blog is openly a work in progress and I'm still figuring out exactly where it's headed.",
      latestTitle: 'Latest Thoughts',
      latestMore: 'View All',
    },
    footer: {
      socials: 'Social Profiles',
      legal: 'Legal',
    },
    about: {
      heroTitle: 'My path as a developer',
      heroParagraph1: 'I approach software development much like tending to a garden. It requires patience, careful architectural planning, and a nurturing environment to grow resilient systems. My philosophy centres on building digital spaces that feel human, organic, and deeply grounded.',
      heroParagraph2: "Over the past decade, I've cultivated expertise in creating tactile interfaces and robust backend structures, always aiming for a soft-modernist aesthetic that invites interaction rather than demanding it.",
      timelineTitle: 'My Experience',
      portraitAlt: 'Developer portrait',
    },
  },
}

/** Returns the UI strings for the given locale. */
export function getUi(locale: Locale): LocaleStrings {
  return strings[locale]
}
