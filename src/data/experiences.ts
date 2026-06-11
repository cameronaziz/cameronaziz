export interface Attachment {
  name: string
  size: string
  color: string
  type: 'file' | 'link' | 'video'
}

export interface Experience {
  id: string
  title: string
  company: string
  date: string
  logo: string
  body: string
  attachments: readonly Attachment[]
  themes: readonly string[]
}

// Base64 logos extracted from the production bundle
const AXLE_LOGO =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAE9WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDEgNzkuMTQ2Mjg5OTc3NywgMjAyMy8wNi8yNS0yMzo1NzoxNCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI1LjMgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDI1LTA1LTEwVDAzOjU2OjQ1KzA2OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNS0wNS0xMFQwNDowMDoyOCswNjowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNS0wNS0xMFQwNDowMDoyOCswNjowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ZWIyNGJiYTMtMDhmYy00NzhlLWE4YTMtNDk5NTkxM2NjZTE1IiB4bXBNTTpEb2N1bWVu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'

const EVIDENTLY_LOGO =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAHdSURBVHgB7VbbccJADFw59x9KoINQAiWkBKgAA5PJJ+Y7EwwVkFQAJSQd0AFOBxQAp+hs48TY50cMM/nwzvDjY5FOuysDtGjRBC53wk8DOPgLpKgzPXl0x3sQHtAACnUx5T6B1wzq4gqo3sAzd+mINcB9XBHlDZhx32mPjzzCDVDoAWdyco3OMu784oxAPl+5Z0aqqd7LBXoogLKSgRkXjJuZPGissKRD6uCJe6ThJ1IR7lG5gXDc8KXwwEZg4AMnGkrhIMsVqXQ9qZIGTKyk8EgKdCyVA7n1AD59Xh4ZqZhYJka1d4KKRsYbKdy1fOcgP+xhQavMSRRJmRjsOts98ijcmYr0yi8uN16KzvOMzhUiGUrl0BivF1LF/jpzVSH5hXapg0hnN45kPanOHkHaI6oS2WDCAyIzbqvOh3himWT8+CvLVWXkTKxywMxv0M44w03WtsVfcmElhyuJ1S4TqxhFxUOptBjUd9ITq+oRTUMlJtmiPkwyXOG+p55WWdsXMtd9G9p1Lt8FEXdB898PKzdg3YCxR0rWdn6cqzTAFBb2cpMB4xHewLZHEo/kc0M+GkLeeJxTOWAKl1Cpv+r/IyqGPc63bkDGsBWpxrY436yBsLCWWxfo3KLFv8Y3U7EkdhyQcsEAAAAASUVORK5CYII='

export const EXPERIENCES: Experience[] = [
  {
    id: 'axle',
    title: 'Staff Engineer',
    company: 'Axle Health',
    date: '2025–Present',
    logo: AXLE_LOGO,
    body: `Hey — thanks for reaching out. I've been at Axle about a year now, working primarily on the partner platform (React/TypeScript) and our clinician mobile app (React Native/Expo).

Most of my time has gone into modernizing two codebases that had accumulated a lot of tech debt without losing release velocity. A few things I'm proud of: redesigning our GPS tracking service to eliminate location data loss regardless of app state, rebuilding our decision support UI around a latency-heavy clinical endpoint with progressive loading, and leading launch logistics for several enterprise clients.`,
    attachments: [
      { name: 'axle-case-study.pdf', size: '2.1 MB', color: 'text-red-500 bg-red-50', type: 'file' },
      { name: 'dashboard-v2.png', size: '380 KB', color: 'text-blue-500 bg-blue-50', type: 'file' },
      { name: 'github.com/caleb/axle-pr-483', size: 'Link', color: 'text-gray-600 bg-gray-100', type: 'link' },
      { name: 'loom.com/share/axle-walkthrough', size: 'Video', color: 'text-purple-500 bg-purple-50', type: 'video' },
    ],
    themes: ['AI/ML', 'DX'],
  },
  {
    id: 'evidently',
    title: 'Staff Engineer',
    company: 'Evidently',
    date: '2022–2025',
    logo: EVIDENTLY_LOGO,
    body: `At Evidently, I led the transition from a monolithic backend to a deployed medical AI architecture. A large portion of my work involved integrating the Ask Evidently LLM with Gemini, strictly within HIPAA context.

We faced significant challenges around deterministic responses and patient data sanitization, which led to a robust prompt abstraction layer. It allowed clinical teams to update logic without engineering overhead. I ultimately reduced the time-to-deployment for new AI models from weeks to days while keeping compliance tight.`,
    attachments: [
      { name: 'evidently-architecture.pdf', size: '1.4 MB', color: 'text-red-500 bg-red-50', type: 'file' },
      { name: 'github.com/evidently/llm-gateway', size: 'Link', color: 'text-gray-600 bg-gray-100', type: 'link' },
      { name: 'model-pipeline.png', size: '850 KB', color: 'text-blue-500 bg-blue-50', type: 'file' },
    ],
    themes: ['AI/ML', 'Platform'],
  },
  {
    id: 'tkww',
    title: 'Lead Engineer',
    company: 'The Knot Worldwide',
    date: '2020–2022',
    logo: '/logos/tkww.webp',
    body: `Hey! During my time at TKWW, I led a massive reliability initiative that took our core platform from 95% to 99.8% uptime.

This wasn't just a fix; it was a fundamental rebuild. I guided the frontend team through a complete TypeScript migration and introduced a unified A/B testing framework that significantly reduced CLS and client-side errors. We also built an internal developer portal that cut down environment spin-up times by 70%, completely changing the culture around rapid prototyping.`,
    attachments: [
      { name: 'reliability-report.pdf', size: '900 KB', color: 'text-red-500 bg-red-50', type: 'file' },
      { name: 'dev-portal-loom.com', size: 'Video', color: 'text-purple-500 bg-purple-50', type: 'video' },
    ],
    themes: ['Platform', 'DX'],
  },
  {
    id: 'dv01',
    title: 'Lead Frontend Engineer',
    company: 'dv01',
    date: '2019–2020',
    logo: '/logos/dv01.png',
    body: `At dv01, I mentored junior engineers and established coding standards that resulted in a 30% reduction in production bugs. I collaborated closely with backend, data pipeline, and data integrity teams to accelerate data release cycles by 50%.

One of the bigger wins was engineering the trademark SaaS application that enabled the company's transition from enterprise-only to a scalable SaaS business model — a meaningful shift in how the product could grow.`,
    attachments: [
      { name: 'saas-launch-deck.pdf', size: '1.1 MB', color: 'text-red-500 bg-red-50', type: 'file' },
    ],
    themes: ['Platform'],
  },
  {
    id: 'chrome-river',
    title: 'Software Engineer',
    company: 'Chrome River Technologies',
    date: '2015–2017',
    logo: '/logos/chrome-river.png',
    body: `Chrome River was where I got my footing working directly with enterprise clients — gathering requirements, deploying customized application instances, and making sure teams actually knew how to use what we built.

I delivered technical training to both customers and internal teams on application features and administration, which gave me an early appreciation for the gap between shipping software and software that gets adopted.`,
    attachments: [],
    themes: ['Platform'],
  },
]
