import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { HeroVideoPlayer } from '@/components/hero-video-player';
import { TestimonialsCarousel } from '@/components/testimonials-carousel';
import { SchoolMap } from '@/components/school-map';

export const metadata: Metadata = {
  title: 'TalentsLounge - Digitale Grundbildung für Schulen | Kostenlos',
  description: 'TalentsLounge macht digitale Grundbildung einfach, interaktiv und effektiv. Über 20+ Lektionen, kostenlos für Lehrkräfte und Schüler:innen. Von der KPH Wien/Krems anerkannte Fortbildung.',
  keywords: [
    'Digitale Grundbildung',
    'Coding für Schulen',
    'Programmieren lernen',
    'Scratch Unterricht',
    'Digitale Kompetenzen',
    'KPH Wien',
    'Lernplattform Österreich',
    'Gratis Lernplattform',
    'Schule digital',
  ],
  openGraph: {
    title: 'TalentsLounge - Digitale Grundbildung für Schulen',
    description: 'Kostenlose Lernplattform für digitale Grundbildung. Über 20+ interaktive Lektionen für Lehrkräfte und Schüler:innen.',
    url: 'https://talentslounge.com',
    siteName: 'TalentsLounge',
    images: [
      {
        url: 'https://talentslounge.com/wp-content/uploads/2025/11/TalentsLounge-Digitale-Grundbildung-Coding-1.jpg',
        width: 1200,
        height: 630,
        alt: 'TalentsLounge - Digitale Grundbildung',
      },
    ],
    locale: 'de_AT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TalentsLounge - Digitale Grundbildung für Schulen',
    description: 'Kostenlose Lernplattform für digitale Grundbildung. Über 20+ interaktive Lektionen.',
    images: ['https://talentslounge.com/wp-content/uploads/2025/11/TalentsLounge-Digitale-Grundbildung-Coding-1.jpg'],
  },
  alternates: {
    canonical: 'https://talentslounge.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-[#4182FF]">
        <path d="M12 7v14"></path>
        <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
      </svg>
    ),
    stat: '100%',
    title: 'Lehrplan-Konformität',
    description: 'Unsere Kurse decken den Inhalt des Pflichtfachs Digitale Grundbildung ab und wurden von erfahrenen Lehrkräften entwickelt.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-[#4182FF]">
        <path d="M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z"></path>
        <path d="M20.054 15.987H3.946"></path>
      </svg>
    ),
    stat: '20+',
    title: 'Spielerisch lernen',
    description: 'Über 20 interaktive DigiGrubi- und Coding-Lektionen machen das Lernen im Unterricht spielerisch und effektiv.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-[#4182FF]">
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
        <path d="M9 18h6"></path>
        <path d="M10 22h4"></path>
      </svg>
    ),
    stat: 'Null',
    title: 'Keine Vorkenntnisse nötig',
    description: 'Als Lehrkraft benötigen Sie keine Programmiervorkenntnisse. Die Plattform unterstützt Sie umfassend bei der Vermittlung.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-[#4182FF]">
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
        <path d="M12 11h4"></path>
        <path d="M12 16h4"></path>
        <path d="M8 11h.01"></path>
        <path d="M8 16h.01"></path>
      </svg>
    ),
    stat: '15 UE',
    title: 'Anerkannte Fortbildung',
    description: 'In Zusammenarbeit mit der KPH Wien/Niederösterreich – ideal zur digitalen Stärkung von Lehrkräften und Schülern.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-[#4182FF]">
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
        <path d="m9 12 2 2 4-4"></path>
      </svg>
    ),
    stat: '100%',
    title: 'Anonymität & Datenschutz',
    description: 'Schüler:innen registrieren sich anonym mit einem individuellen Code, um maximale Privatsphäre zu gewährleisten.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-[#4182FF]">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
      </svg>
    ),
    checkmark: true,
    title: 'Zukunftsfit',
    description: 'Unser didaktisches Konzept basiert auf internationalen Standards (K-12) und trägt das offizielle Lernapp-Gütesiegel.',
  },
];

const steps = [
  {
    number: '1',
    title: 'Kostenlos anmelden',
    description: 'Sichern Sie sich online eine Gratis-Jahreslizenz für Ihre Klasse oder Schule.',
  },
  {
    number: '2',
    title: 'Info-Webinar',
    description: 'Lernen Sie alle Inhalte und Funktionen der Plattform für den Unterricht kennen. Nach dem Webinar erhalten Sie Ihre kostenlose Jahreslizenz.',
  },
  {
    number: '3',
    title: 'Lehrer Dashboard-Funktion',
    description: 'Erhalten Sie Zugang zum Lehrer-Dashboard zur Fortschrittskontrolle Ihrer Schüler:innen.',
  },
  {
    number: '4',
    title: 'Weiterbildung',
    description: 'Nehmen Sie bequem von Zuhause an der Weiterbildung teil und bereiten Sie sich optimal vor.',
  },
];

const projects = [
  {
    image: 'https://talentslounge.com/wp-content/uploads/2024/11/Corona-Game-2-2.png',
    author: 'Physics Pro 13',
    school: '3B, NMS Demoschule',
    authorImage: 'https://talentslounge.com/wp-content/uploads/ultimatemember/2232/profile_photo-40x40.png?1763127656',
    title: 'Corona Game',
    description: 'Hilf Dani dabei, ihr Immunsystem zu stärken und weiche den Viren aus. Für Händewaschen mit Seife, Händedesinfektion und gesunde Ernährung erhältst du Punkte, die dein Immunsystem stärken. Aber Vorsicht: du hast nur 3 Leben! Schaffst du es ins dritte Level?',
    link: 'https://talentslounge.com/project/corona-game/',
  },
  {
    image: 'https://talentslounge.com/wp-content/uploads/2024/09/Innovationsrennen.png',
    author: 'Physics Pro 13',
    school: '3B, NMS Demoschule',
    authorImage: 'https://talentslounge.com/wp-content/uploads/ultimatemember/2232/profile_photo-40x40.png?1763127656',
    title: 'Innovationswettrennen',
    description: 'STEUERUNG: Spielerin Rot wird über die Tasten W, A, S und D gesteuert. Spielerin Blau über die Pfeiltasten deiner Tastatur. BESCHREIBUNG: Die Pfeile sind Innovationspunkte und vergrößern eure Motivation. Je mehr Innovationspunkte ihr sammelt, um so länger könnt ihr spielen und um so höher ist die Innovationskraft, die ihr gemeinsam erreicht.',
    link: 'https://talentslounge.com/project/innovationswettrennen/',
  },
  {
    image: 'https://talentslounge.com/wp-content/uploads/2024/09/flappyBird.png',
    author: 'Data Profi 48',
    school: '4A, NMS Demoschule',
    authorImage: 'https://talentslounge.com/wp-content/uploads/ultimatemember/2226/profile_photo-40x40.png?1763127662',
    title: 'FlappyBird',
    description: 'Flappy Bird ist ein einfaches Spiel, bei dem du einen kleinen Vogel durch eine Reihe von Hindernissen steuerst. Du benutzt die Leertaste auf deiner Tastatur, um den Vogel fliegen zu lassen. Dein Ziel ist es, so lange wie möglich durch die Hindernisse zu fliegen, ohne dagegen zu stoßen.',
    link: 'https://talentslounge.com/project/flappybird/',
  },
];

const courses = [
  {
    href: 'https://talentslounge.com/courses/digitale-grundbildung/',
    image: 'https://talentslounge.com/wp-content/uploads/2025/10/TalentsLounge-Digitale-Grundbildung-Sek.-1-1024x576.png',
    title: 'ABC der Digitalen Grundbildung',
    description: 'Dieser Kurs deckt das gesamte ABC der digitalen Grundbildung ab – von modernen Arbeitsmethoden und Bildrechten bis hin zu sozialen Medien und technischer Problemlösungskompetenz.',
  },
  {
    href: 'https://talentslounge.com/courses/coding-kurs-1/',
    image: 'https://talentslounge.com/wp-content/uploads/2025/10/TalentsLounge-Coding-und-Game-Design-mit-Scratch-Grundkurs-Sek.-1-1024x576.png',
    title: 'Grundkurs: Coding & Game Design mit Scratch',
    description: 'In diesem Kurs erwerben Schüler:innen die Grundlagen des informatischen Denkens durch die Programmierung eines eigenen Minispiels.',
    badge: 'Zur Testlektion',
  },
  {
    href: 'https://talentslounge.com/courses/coding-kurs-2/',
    image: 'https://talentslounge.com/wp-content/uploads/2025/10/TalentsLounge-Coding-und-Game-Design-mit-Scratch-Aufbaukurs-Sek.-1-1024x576.png',
    title: 'Aufbaukurs: Coding & Game Design mit Scratch',
    description: 'In diesem Kurs vertiefen Schüler:innen die im Grundkurs erworbenen Informatikkenntnisse. Gemeinsam programmieren sie ein komplexes Labyrinth-Spiel.',
  },
];

const certifications = [
  { href: 'https://www.guetesiegel-lernapps.at/lern-apps/talentslounge', src: 'https://talentslounge.com/wp-content/uploads/2025/06/Logo_Guetesiegel_Lern-Apps_RGB_lang.svg', alt: 'Gütesiegel Lern-Apps' },
  { href: 'https://www.bmbwf.gv.at', src: 'https://talentslounge.com/wp-content/uploads/2025/06/bmb_logo-1024x280.png', alt: 'Bundesministerium für Bildung' },
  { href: 'https://www.oead.at', src: 'https://talentslounge.com/wp-content/uploads/2025/11/OeAD_logo.png', alt: 'Österreichischer Austauschdienst' },
  { href: 'https://www.digitalaustria.gv.at', src: 'https://talentslounge.com/wp-content/uploads/2025/11/digital_austria.png', alt: 'Digital Austria' },
];

export default function Home() {
  return (
    <>

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden pt-16 pb-16 lg:py-16 bg-gradient-to-b from-white via-blue-50/30 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-neutral-900 mb-6 text-balance leading-tight">
                Willkommen in der <span className="text-[#4182FF]">Talentslounge</span>
              </h1>
              <p className="text-lg lg:text-xl text-neutral-600 mb-10 max-w-xl leading-relaxed">
                TalentsLounge macht digitale Grundbildung einfach, interaktiv und effektiv. Für Lehrkräfte und Schüler:innen – völlig kostenlos.
              </p>
              <div className="space-y-4 mb-12">
                {[
                  'Über 20+ interaktive Lektionen mit Wissenchecks',
                  'Von der KPH Wien/Krems als offiziell anerkannte Fortbildung anerkannt',
                  'Ausgezeichnet mit Gütesiegel für Lern-Apps vom Bundesministerium',
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-green-600">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="m9 12 2 2 4-4"></path>
                      </svg>
                    </div>
                    <span className="text-neutral-700 font-medium">{text}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 group bg-[#4182FF] text-white text-lg font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-[#2d6bff] transition-all duration-300">
                  Kostenlos voranmelden
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Link>
                <a href="#features" className="inline-flex items-center justify-center bg-white text-gray-700 text-lg font-semibold px-8 py-4 rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300">
                  Mehr erfahren
                </a>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-4">Zertifiziert von:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 items-center justify-items-center">
                  {certifications.map((logo, i) => (
                    <a
                      key={i}
                      href={logo.href}
                      target="_blank"
                      rel="noopener"
                      className="hover:opacity-80 transition-opacity flex justify-center items-center w-full h-12 sm:h-14 lg:h-16"
                    >
                      <img
                        src={logo.src}
                        alt={logo.alt}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                        style={{ width: 'auto', height: '100%' }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <HeroVideoPlayer />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-24 bg-gradient-to-b from-blue-50/30 via-blue-50/70 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 mb-6 text-balance">
            Die beste Wahl für <span className="text-[#4182FF]">Digitale Grundbildung</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Wir machen die Vermittlung digitaler Kompetenzen einfach, interaktiv und effektiv – für Lehrkräfte und Schüler:innen gleichermaßen.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="card-base p-8 group text-left">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors icon-container">
                    {feature.icon}
                  </div>
                  {feature.stat && <span className="text-2xl font-bold text-[#4182FF]">{feature.stat}</span>}
                  {feature.checkmark && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-[#4182FF]">
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">{feature.title}</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-16">
            <Link href="/register" className="inline-flex items-center justify-center bg-[#4182FF] text-white text-lg font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-[#2d6bff] transition-all duration-300">
              Ihre Schule digital stärken
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-3 w-5 h-5">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* KPH Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-blue-50 via-blue-50/50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 mb-6 text-balance">
                Let&apos;s code! Fortbildung mit der <span className="text-[#4182FF]">KPH Wien/Krems</span>
              </h2>
              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                Die KPH Wien/Krems bietet in Kooperation mit der TalentsLounge eine Fortbildung <strong>&quot;Let&apos;s code! Informatische Bildung praxisorientiert im Unterricht einsetzen&quot;</strong> im Bereich der Digitalen Grundbildung für Lehrkräfte an. Nach erfolgreichem Abschluss werden bis zu <strong>15 Unterrichtseinheiten (UE)</strong> als Fortbildung angerechnet.
              </p>
              <div className="space-y-6 mb-10">
                {[
                  { title: 'Für Anfänger:innen gemacht', desc: 'Keine Programmierkenntnisse nötig' },
                  { title: 'Flexibles Lernen', desc: 'Von zuhause, im eigenen Tempo' },
                  { title: 'Umfassende Unterstützung', desc: 'Materialien, Videos und Live-Support' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                      <span className="text-green-600 font-bold text-sm">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">{item.title}</p>
                      <p className="text-neutral-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/register" className="inline-flex items-center justify-center gap-2 group bg-[#4182FF] text-white text-lg font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-[#2d6bff] transition-all duration-300">
                Kostenlos anmelden und starten
              </Link>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <Image
                src="https://talentslounge.com/wp-content/uploads/2025/03/Lernmaterialien-fuer-Digitale-Grundbildung.png"
                alt="Lernmaterialien für Digitale Grundbildung"
                width={600}
                height={400}
                className="w-full max-w-md"
                loading="lazy"
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4 Steps Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-white via-blue-50/40 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-16">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 mb-6 text-balance">
              In nur <span className="text-[#4182FF]">4 Schritten</span> starten
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {steps.map((step, i) => (
              <div key={i} className="p-6 lg:p-8 bg-white rounded-2xl shadow-xl border border-blue-100 flex flex-col items-center text-center card-hover">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-[#4182FF]">
                  <span className="text-2xl font-bold">{step.number}</span>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">{step.title}</h3>
                <p className="text-gray-700 text-sm lg:text-base">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schools Map Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-blue-50 via-gray-50/40 to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 mb-6 text-balance">
              Über <span className="text-[#4182FF]">120 Schulen</span> vertrauen bereits auf TalentsLounge
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Von Wien bis Vorarlberg. TalentsLounge ist die Plattform für digitale Grundbildung in Österreich.
            </p>
          </div>
          <SchoolMap />
        </div>
      </section>

      {/* How it works for teachers */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 via-gray-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative flex justify-center lg:justify-start">
            <Image
              src="https://talentslounge.com/wp-content/uploads/2023/07/Talentslounge-fuer-Lehrkraefte-e1692634983593.png"
              alt="TalentsLounge für Lehrkräfte"
              width={600}
              height={400}
              className="w-full max-w-md"
              loading="lazy"
              unoptimized
            />
          </div>
          <div className="text-center lg:text-left">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 mb-6 text-balance">
              Wie funktioniert der Unterricht mit <span className="text-[#4182FF]">TalentsLounge?</span>
            </h2>
            <ul className="text-lg text-gray-700 space-y-4 mb-10">
              {[
                '45-minütige, flexible Unterrichtseinheiten',
                '20+ anpassbare Lektionen im Kompetenzbereich Produktion',
                'Web-basiert und für alle Geräte geeignet',
                'Interaktive Videos, Lernkarten, Projekte & Quizze',
                'Lehrkraft-Dashboard zur Fortschrittskontrolle',
                'Entwickelt von Lehrkräften für Lehrkräfte, basierend auf K-12 Standards',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#4182FF] flex-shrink-0 mt-1">
                    <path d="M8 2v4"></path>
                    <path d="M16 2v4"></path>
                    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                    <path d="M3 10h18"></path>
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/register" className="inline-flex items-center justify-center bg-[#4182FF] text-white text-lg font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-[#2d6bff] transition-all duration-300">
              Kostenlos voranmelden
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-3 w-5 h-5">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works for students */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 via-blue-50/40 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left order-2 lg:order-1">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 mb-6 text-balance">
              Schüler:innen ♥️ den Unterricht mit <span className="text-[#4182FF]">TalentsLounge!</span>
            </h2>
            <ul className="text-lg text-gray-700 space-y-4 mb-10">
              {[
                'Fokus auf genderneutrale Technikvermittlung',
                'Individualisiertes und selbstbestimmtes Lernen',
                'DSGVO-konforme Anmeldung für Sicherheit',
                'Offizielles DigCom 2.3 Zertifikat nach Abschluss',
                'Optional: Teilnahme am YouthHackathon',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#4182FF] flex-shrink-0 mt-1">
                    <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
                    <path d="M20 2v4"></path>
                    <path d="M22 4h-4"></path>
                    <circle cx="4" cy="20" r="2"></circle>
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative flex justify-center lg:justify-end order-1 lg:order-2">
            <Image
              src="https://talentslounge.com/wp-content/uploads/2025/11/tl_student_4.png"
              alt="TalentsLounge genderneutrale Technikvermittlung"
              width={600}
              height={400}
              className="w-full max-w-md rounded-2xl"
              loading="lazy"
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-16 lg:py-24 bg-gradient-to-b from-blue-50 via-blue-50/60 to-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 mb-6 text-balance">
            Entdecken Sie unsere <span className="text-[#4182FF]">Projektbeispiele</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            So könnten die Projekte der Schüler:innen aussehen! Einfach ausprobieren und kreativ werden. Unsere Plattform bietet zahlreiche Vorlagen und Ideen, die leicht in den Unterricht integriert werden können.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col card-hover">
                <div className="relative h-60 bg-gray-200 overflow-hidden group">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-600 flex-shrink-0">
                      <img src={project.authorImage} alt={project.author} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-neutral-900 mb-3">{project.author}</h4>
                      <p className="text-sm text-gray-500">{project.school}</p>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-4 text-left">{project.title}</h3>
                  <p className="text-sm text-gray-600 overflow-y-auto max-h-24 mb-4">{project.description}</p>
                  <div className="mt-auto flex justify-start items-center pt-4 border-t border-gray-100">
                    <a href={project.link} target="_blank" rel="noopener" className="bg-[#4182FF] text-white px-5 py-2 rounded-lg font-medium text-sm hover:bg-[#2d6bff] transition-colors">
                      Spielen
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-16 lg:py-24 bg-gradient-to-b from-white via-blue-50/40 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 mb-6 text-balance">
            Entdecken Sie unsere <span className="text-[#4182FF]">20+ Lektionen</span> zur Digitalen Grundbildung!
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            In nur 5 Minuten sind Sie und Ihre Klasse bereit für das spannendste Coding-Erlebnis. Keine Sorge, Programmierkenntnisse sind nicht erforderlich.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, i) => (
              <a key={i} href={course.href} target="_blank" rel="noopener" className="block bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col card-hover group">
                <div className="relative h-52 bg-gray-200 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-2xl font-bold text-neutral-900 mb-4">{course.title}</h3>
                  <p className="text-sm text-gray-700 flex-grow mb-4">{course.description}</p>
                  {course.badge && (
                    <div className="mt-auto">
                      <span className="inline-flex items-center justify-center bg-blue-100 text-[#4182FF] text-sm font-medium px-4 py-2 rounded-full mt-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 w-4 h-4">
                          <path d="M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z"></path>
                          <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                        {course.badge}
                      </span>
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 lg:py-24 bg-gradient-to-b from-blue-50 via-blue-50/30 to-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 mb-6 text-balance">
            Was <span className="text-[#4182FF]">Lehrkräfte</span> sagen
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Echte Erfahrungen von Lehrkräften, die TalentsLounge im Unterricht nutzen.
          </p>
          <TestimonialsCarousel />
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">
              Deine Schule ist die <span className="text-[#4182FF]">Nächste</span>
            </h3>
            <p className="text-base text-gray-600 mb-6">
              Schließe dich hunderten zufriedenen Lehrkräften an und bringe digitale Bildung in deinen Unterricht.
            </p>
            <Link href="/register" className="inline-flex items-center justify-center gap-2 group bg-[#4182FF] text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:bg-[#2d6bff] transition-all duration-300">
              Kostenlos voranmelden
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 w-4 h-4">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Certification Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-white via-blue-50/30 to-blue-50/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 mb-12 text-balance">
            OFFIZIELL <span className="text-[#4182FF]">ZERTIFIZIERT</span>
          </h2>
          <div className="flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-12 mb-10">
            {certifications.slice(0, 2).map((cert, i) => (
              <div key={i} className="flex-shrink-0 w-full max-w-xs lg:max-w-sm">
                <img src={cert.src} alt={cert.alt} className="h-20 lg:h-24 w-full max-w-full object-contain mx-auto" loading="lazy" />
              </div>
            ))}
          </div>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-10">
            TalentsLounge erfüllt die vom Bundesministerium für Bildung geprüften Kriterien für Qualität, Datenschutz und Pädagogik.
          </p>
          <a href="https://www.guetesiegel-lernapps.at/lern-apps/talentslounge" target="_blank" rel="noopener" className="inline-flex items-center justify-center bg-[#4182FF] text-white text-lg font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-[#2d6bff] transition-all duration-300">
            Geprüfte Qualität: Details ansehen
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-3 w-5 h-5">
              <path d="M15 3h6v6"></path>
              <path d="M10 14 21 3"></path>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            </svg>
          </a>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 lg:py-24 bg-gradient-to-b from-blue-50/50 via-gray-50/40 to-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 mb-6 text-balance">
              Über <span className="text-[#4182FF]">uns</span>
            </h2>
            <ul className="text-lg text-gray-700 space-y-6 mb-10">
              {[
                'Mit der DaVinciLab TalentsLounge unterstützen wir engagierte Lehrkräfte der Sek. 1, das Programmieren-Lernen im Fach "Digitale Grundbildung" einfach und ohne Aufwand umzusetzen.',
                'Wir setzen uns dafür ein, allen jungen Menschen den Zugang zu hochwertiger Bildung zu ermöglichen, unabhängig von Geschlecht oder sozialer Herkunft. Dabei legen wir großen Wert auf genderneutrale Technologievermittlung, um Mädchen für MINT-Fächer zu begeistern und dem Fachkräftemangel entgegenzuwirken.',
                'Dank der Kooperation mit dem Verein MadeByKids und der Unterstützung durch Spenden zahlreicher Partner:innen aus der Wirtschaft streben wir an, österreichweit kostenlosen Programmierunterricht in jeder Schule zu ermöglichen.',
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#4182FF] flex-shrink-0 mt-1">
                    <path d="M12 19h8"></path>
                    <path d="m4 17 6-6-6-6"></path>
                  </svg>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <div className="w-full max-w-md aspect-video bg-gray-200 rounded-3xl overflow-hidden shadow-2xl relative">
              <iframe
                className="w-full h-full object-cover"
                src="https://www.youtube-nocookie.com/embed/DSw8XkxFkDg?controls=1&rel=0&showinfo=0&modestbranding=1"
                frameBorder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Über TalentsLounge Video"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
