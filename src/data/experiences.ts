import AXLE_LOGO from '../assets/images/axle.png'
import EVIDENTLY_LOGO from '../assets/images/evidently.png'
import TKWW_LOGO from '../assets/images/tkww.webp'
import DV01_LOGO from '../assets/images/dv01.png'
import CHROMERIVER_LOGO from '../assets/images/chromeriver.png'
import PORTOS_LOGO from '../assets/images/portos.png'
import EAGLERIDER_LOGO from '../assets/images/eaglerider.jpg'

export interface Attachment {
  name: string
  size: string
  color: string
  type: 'file' | 'link' | 'video'
  url?: string
  description?: string
}

export interface Experience {
  id: string
  title: string
  company: string
  startDate: string
  endDate: string
  logo: string
  body: string
  attachments: readonly Attachment[]
  themes: readonly string[]
}

export const EXPERIENCES: Experience[] = [
  {
    id: 'axle',
    title: 'Staff Engineer',
    company: 'Axle Health',
    startDate: 'Nov 2025',
    endDate: 'Apr 2026',
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
    startDate: 'Apr 2022',
    endDate: 'Feb 2025',
    logo: EVIDENTLY_LOGO,
    body: `At Evidently I built Ask Evidently from the ground up. It's an AI chat interface embedded directly in the EHR that reads the entire patient chart (clinical notes, outside records, scanned documents) and answers clinical questions in natural language. Today it's deployed at health systems including Allina Health and the University of Iowa Health Care.

The hard part wasn't the LLM. It was the data. Patient charts contain thousands of unstructured records across disconnected sources, and getting reliable, traceable answers out of that required RAG pipelines, semantic caching, and a prompt abstraction layer that let clinical teams update logic without needing an engineering deploy. HIPAA and SOC 2 Type II compliance were built into every layer from day one, which became a meaningful differentiator in enterprise sales.

The product was central to a $15M Series A and the company's first deployments at major US health networks.`,
    attachments: [
      { name: 'Ask Evidently', size: 'Link', color: 'text-gray-600 bg-gray-100', type: 'link', url: 'https://www.evidently.com/ask-evidently', description: 'the AI chat product I built' },
      { name: 'Value-Based Care', size: 'Link', color: 'text-gray-600 bg-gray-100', type: 'link', url: 'https://www.evidently.com/solutions/value-based-care', description: 'clinical data intelligence product' },
    ],
    themes: ['AI/ML', 'Platform'],
  },
  {
    id: 'tkww',
    title: 'Lead Engineer',
    company: 'The Knot Worldwide',
    startDate: 'Feb 2020',
    endDate: 'Apr 2022',
    logo: TKWW_LOGO,
    body: `The Knot Worldwide is one of the largest wedding marketplaces in the world. When I joined, the core platform had a reliability problem: uptime was hovering around 95%. Over the next year I led the effort to redesign CI/CD with automated circuit breakers and canary deployments, and pushed uptime to 99.8% across a platform serving over 30 million monthly sessions.

The other major project was experimentation infrastructure. I built a unified A/B testing framework that let product teams run concurrent experiments without stepping on each other, which directly improved conversion and engagement across the platform. The repo linked below is a working sample of the consent and test-group assignment system we used.

I also built an internal developer platform (IDE extensions, linting frameworks, debugging tools) that cut onboarding time significantly and standardized workflows across distributed teams.`,
    attachments: [
      { name: 'github.com/cameronaziz/tkww-interview', size: 'Link', color: 'text-gray-600 bg-gray-100', type: 'link', url: 'https://github.com/cameronaziz/tkww-interview', description: 'A/B testing consent framework' },
      { name: 'Platform features press release', size: 'Link', color: 'text-gray-600 bg-gray-100', type: 'link', url: 'https://www.theknotww.com/press-releases/the-knot-worldwide-announces-new-platform-features-to-drive-wedding-vendor-success', description: 'built on the platform I worked on' },
      { name: 'theknotww.com', size: 'Link', color: 'text-gray-600 bg-gray-100', type: 'link', url: 'https://www.theknotww.com' },
    ],
    themes: ['Platform', 'DX'],
  },
  {
    id: 'dv01',
    title: 'Lead Frontend Engineer',
    company: 'dv01',
    startDate: 'Jan 2019',
    endDate: 'Feb 2020',
    logo: DV01_LOGO,
    body: `dv01 is a structured finance data platform. When I joined, the core product was enterprise-only. I architected the SaaS transition to a self-serve model, which opened the platform to a much broader market and fundamentally changed how the company could grow.

The product I built is Tape Cracker, a tool for loan tape analysis that normalizes messy structured finance data, runs cashflow projections, and lets buy-side teams collaborate on due diligence in one place. The kind of workflow that used to require a Bloomberg terminal and a dedicated data team, made self-serve.

On the engineering side, I improved throughput 50% through platform investment and tooling, and reduced production regressions 30% through standards and mentorship.`,
    attachments: [
      { name: 'dv01 Tape Cracker', size: 'Link', color: 'text-gray-600 bg-gray-100', type: 'link', url: 'https://www.dv01.co/offerings/tape-cracker/', description: 'the product I built' },
    ],
    themes: ['Platform'],
  },
  {
    id: 'chrome-river',
    title: 'Software Engineer',
    company: 'Chrome River Technologies',
    startDate: 'Oct 2015',
    endDate: 'Nov 2017',
    logo: CHROMERIVER_LOGO,
    body: `Chrome River was enterprise expense management software. I worked directly with clients, gathered requirements, deployed customized instances, and trained both end users and internal teams. Early career work, but it taught me something that stuck: shipping software is one problem, and getting people to actually use it is a different one.`,
    attachments: [],
    themes: ['Platform'],
  },
  {
    id: 'portos',
    title: 'Project Manager and Business Analyst',
    company: "Porto's Bakery",
    startDate: 'Apr 2014',
    endDate: 'Sep 2015',
    logo: PORTOS_LOGO,
    body: `Porto's is a multi-location LA bakery with the kind of scale that creates real operations problems. I came in as a project manager and business analyst. The first big project was implementing a human capital management system to standardize how the company tracked and managed staff across locations.

I also oversaw development of the public-facing Drupal website and wrote Ruby, JavaScript, and MySQL for internal tooling. On the process side, I built onboarding workflows for new employees and put together custom reports on staff utilization and operational inefficiencies.`,
    attachments: [],
    themes: ['Platform'],
  },
  {
    id: 'eaglerider',
    title: 'Product Manager',
    company: 'EagleRider',
    startDate: 'Oct 2012',
    endDate: 'Feb 2014',
    logo: EAGLERIDER_LOGO,
    body: `\
EagleRider is the largest motorcycle rental company in the world.\
I was the product manager for their eCommerce and rental websites, with ownership over content, design, and user experience.\
I was also doing the development: ASP.NET, Ruby on Rails, and PHP across MSSQL and MySQL depending on the system.

Most of my decisions ran through analytics.\
I reviewed traffic data and ran A/B tests before committing to changes, which is how a 15% traffic increase translated to a 20% lift in page views.\
I also owned SEO and SEM strategy and managed a small team of developers, designers, and sysadmins on Scrum.`,
    attachments: [],
    themes: ['Platform'],
  },
]
