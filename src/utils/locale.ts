export type Locale = "de" | "en";

export interface ExperienceEntry {
  title: string;
  period: string;
  icon: string;
  description: string;
  tags: string[];
  active?: boolean;
}

export interface LocaleStrings {
  nav: {
    home: string;
    blog: string;
    about: string;
    contact: string;
    openMenu: string;
  };
  blog: {
    pageTitle: string;
    heading: string;
    lead: string;
    filterAll: string;
    loadMore: string;
    published: string;
    readSuffix: string;
    readInOtherLang: string;
  };
  home: {
    heroBefore: string;
    heroAfter: string;
    heroLead: string;
    heroCta: string;
    portraitAlt: string;
    introWord1: string;
    introWord2: string;
    introConnector: string;
    introLead: string;
    latestTitle: string;
    latestMore: string;
  };
  footer: {
    socials: string;
    legal: string;
  };
  about: {
    heroTitle: string;
    heroParagraph1: string;
    heroParagraph2: string;
    timelineTitle: string;
    portraitAlt: string;
    experience: ExperienceEntry[];
  };
}

export const strings: Record<Locale, LocaleStrings> = {
  de: {
    nav: {
      home: "Startseite",
      blog: "Blog",
      about: "Über mich",
      contact: "Kontakt",
      openMenu: "Menü öffnen",
    },
    blog: {
      pageTitle: "Blog – Gedanken & Tech-Themen",
      heading: "Gedanken & Tech-Themen",
      lead: "Technologie, Design und das Leben als Entwickler – technische Deep-Dives und Erfahrungen aus dem Alltag.",
      filterAll: "Alle Beiträge",
      loadMore: "Mehr laden",
      published: "Veröffentlicht",
      readSuffix: "Lesezeit",
      readInOtherLang: "Auf Englisch lesen",
    },
    home: {
      heroBefore: "Hey ich bin ",
      heroAfter: ", Entwickler mit Leidenschaft",
      heroLead:
        "Ich schreibe hier über alles was mich im Arbeitsalltag und im Entwickler-Leben beschäftigt. Das sind einerseits neue Technologien und Entwicklungen, andererseits aber auch Wege wie ich persönlich versuche Balance in das Leben als Entwickler in diesen turbulenten Zeiten zu bringen.",
      heroCta: "Meine Erfahrungen",
      portraitAlt: "Portrait von Tobi",
      introWord1: "Technologie",
      introWord2: "Leben",
      introConnector: "in Balance",
      introLead:
        "Ich hoffe, dass andere etwas aus meinen Erfahrungen mitnehmen können und dass ich durch das Schreiben selbst dazulerne. Der Blog ist aktuell noch ein 'Work in Progress' - lass uns gemeinsam herausfinden in welche Richtung es geht!",
      latestTitle: "Neueste Gedanken",
      latestMore: "Alle ansehen",
    },
    footer: {
      socials: "Soziale Profile",
      legal: "Rechtliche Hinweise",
    },
    about: {
      heroTitle: "Mein Weg als Entwickler",
      heroParagraph1: "paragraph 1",
      heroParagraph2: "paragraph 2",
      timelineTitle: "Mein Weg",
      portraitAlt: "Portrait von Tobi",
      experience: [
        {
          title: "Frontend-Entwicklung für Webseiten großer Marken",
          period: "2025 – Heute",
          icon: "monitor",
          description:
            "In meinem aktuellen Job darf ich moderne Web-Frontends für große Marken im Enterprise-Umfeld umsetzen – mit Fokus auf saubere Architektur, Barrierefreiheit, Performance und die Wiederverwendbarkeit von Komponenten.",
          tags: ["TypeScript", "Vue.js", "UI/UX", "SSR", "Vitest"],
          active: true,
        },
        {
          title: "Frontend-Entwicklung für eine komplexe Webanwendung",
          period: "2023 – 2025",
          icon: "code_blocks",
          description:
            "Ich war hauptverantwortlich für die Frontend-Entwicklung und -Architektur einer komplexen Business-Anwendung im Schadenmanagement – inklusive Design, API-Integration und der Etablierung von Qualitätsstandards.",
          tags: ["TypeScript", "Vue.js", "State Management", "REST", "Testing"],
        },
        {
          title: "Studium angewandte Informatik – Web-Entwicklung, Apps & KI",
          period: "2016 – 2023",
          icon: "school",
          description:
            "Im Studium habe ich praxisnah Web- und App-Entwicklung sowie KI und Machine Learning vertieft – unter anderem Reinforcement Learning und Datenvisualisierung.",
          tags: [
            "Angular",
            "Flutter",
            "Python",
            "Machine Learning",
            "Data Science",
          ],
        },
      ],
    },
  },
  en: {
    nav: {
      home: "Home",
      blog: "Blog",
      about: "About",
      contact: "Contact",
      openMenu: "Open menu",
    },
    blog: {
      pageTitle: "Blog – Thoughts & Tutorials",
      heading: "Thoughts & Tutorials",
      lead: "Technology, design, and life as a developer – technical deep-dives and day-to-day experiences.",
      filterAll: "All Posts",
      loadMore: "Load More",
      published: "Published",
      readSuffix: "read",
      readInOtherLang: "Auf Deutsch lesen",
    },
    home: {
      heroBefore: "Hey, I'm ",
      heroAfter: ", a developer writing here about my experiences.",
      heroLead:
        "I'm a passionate software engineer focused on clean architectures and user-centred design. In my daily work I try to meet complex problems with simple, elegant solutions and to keep growing continuously.",
      heroCta: "My CV",
      portraitAlt: "Developer portrait",
      introWord1: "Technology",
      introWord2: "Humanity",
      introConnector: "in Harmony",
      introLead:
        "Here I write about technology and life as a developer in these turbulent times. I hope others can take something from my experiences – or that I learn myself through the exchange. The blog is openly a work in progress and I'm still figuring out exactly where it's headed.",
      latestTitle: "Latest Thoughts",
      latestMore: "View All",
    },
    footer: {
      socials: "Social Profiles",
      legal: "Legal",
    },
    about: {
      heroTitle: "My path as a developer",
      heroParagraph1:
        "I approach software development much like tending to a garden. It requires patience, careful architectural planning, and a nurturing environment to grow resilient systems. My philosophy centres on building digital spaces that feel human, organic, and deeply grounded.",
      heroParagraph2:
        "Over the past decade, I've cultivated expertise in creating tactile interfaces and robust backend structures, always aiming for a soft-modernist aesthetic that invites interaction rather than demanding it.",
      timelineTitle: "My Experience",
      portraitAlt: "Developer portrait",
      experience: [
        {
          title: "Frontend for Major Brands",
          period: "2021 – Present",
          icon: "monitor",
          description:
            "I build modern web frontends for major brands – focusing on clean architecture, accessibility, performance, and reusable component design.",
          tags: ["TypeScript", "Vue.js", "UI/UX", "SSR", "Vitest", "Cypress"],
          active: true,
        },
        {
          title: "Lead Frontend – Complex Application",
          period: "2018 – 2021",
          icon: "code_blocks",
          description:
            "I was the primary frontend developer and architect for a complex business application in claims management – including the design system, API integration, and establishing quality standards.",
          tags: ["TypeScript", "Vue.js", "State Management", "REST", "Testing"],
        },
        {
          title: "Computer Science – Web, App & AI",
          period: "2015 – 2018",
          icon: "school",
          description:
            "During my studies I deepened my skills in web and app development as well as AI and machine learning – including reinforcement learning and data visualisation.",
          tags: [
            "Python",
            "Machine Learning",
            "Flutter",
            "Firebase",
            "Data Science",
          ],
        },
      ],
    },
  },
};

/** Returns the UI strings for the given locale. */
export function getUi(locale: Locale): LocaleStrings {
  return strings[locale];
}
