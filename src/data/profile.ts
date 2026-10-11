/**
 * Single source of truth for all portfolio content.
 * Everything here is taken from Priyank's resumes (Full-Stack Engineer,
 * Software Developer and AxeForce-era versions). Edit here, nowhere else.
 */

export const profile = {
  name: 'Priyank Wadiwala',
  first: 'Priyank',
  last: 'Wadiwala',
  title: 'Full-Stack Engineer',
  stackLine: 'Java, Spring Boot, FastAPI, Next.js, Docker & AI-enabled applications',
  location: 'Vadodara / Anand, Gujarat, India',
  email: 'priyank.wadi7@gmail.com',
  phone: '+91 96623 76086',
  phoneHref: 'tel:+919662376086',
  linkedin: 'https://www.linkedin.com/in/priyank-wadiwala/',
  github: 'https://github.com/13priyaank',
  resume: '/Priyank_Wadiwala_Resume.pdf',
  headline: 'I build the product layer between people, data and AI.',
  intro:
    'Full-stack engineer working across Next.js, FastAPI, Java and PostgreSQL, with a DevOps habit of automating releases and containerising what I ship. Right now I build a healthcare document platform with AI-assisted question answering over medical records.',
}

export const about = {
  paragraphs: [
    'I started in the browser, building interactive virtual walkthroughs, and moved steadily down the stack: Node and Next.js API routes, then FastAPI, SQL and AI-backed workflows.',
    'Today I work on a healthcare platform where patients, doctors and care teams upload medical records, get summaries, and ask questions grounded in the documents. I enjoy the unglamorous parts that make software dependable: validation, versioned migrations, Docker-based environments, and tracing a bug from a click to the database.',
    'Outside work I build in Java too: a Spring Boot real-time ad auction service with concurrent bidding, Redis caching and a JUnit/Mockito test suite, packaged with Docker Compose.',
    'Off the main road, I model in Blender and explore Open3D and Three.js. This page is a small proof of that.',
  ],
  highlights: [
    { label: 'Building for the web since', value: '2024' },
    { label: 'Delivery time cut with automation', value: '10 → 2 days' },
    { label: 'Currently', value: 'Healthcare + AI' },
  ],
}

export type SkillGroup = { title: string; note: string; items: string[] }

export const skills: SkillGroup[] = [
  {
    title: 'Frontend',
    note: 'Interfaces and interactive rendering',
    items: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'HTML', 'CSS'],
  },
  {
    title: 'Backend & APIs',
    note: 'Services, validation, structured data',
    items: ['Node.js', 'FastAPI', 'Spring Boot', 'Express.js', 'Fastify', 'Next.js API Routes', 'REST', 'gRPC', 'Python'],
  },
  {
    title: 'Java & Spring',
    note: 'Typed services and concurrency',
    items: ['Java', 'Spring Boot', 'Spring Data JPA', 'CompletableFuture', 'Maven', 'JUnit', 'Mockito'],
  },
  {
    title: 'Data',
    note: 'Modelling, migrations, storage',
    items: ['PostgreSQL', 'SQL', 'MongoDB', 'SQLAlchemy', 'Alembic', 'Redis'],
  },
  {
    title: 'AI integration',
    note: 'Retrieval and LLM-backed workflows',
    items: ['RAG', 'LLM APIs', 'LangChain', 'LangGraph', 'Prompt engineering', 'Vector databases (basic)'],
  },
  {
    title: '3D & visualization',
    note: 'Meshes, point clouds, web 3D',
    items: ['Three.js', 'Blender', 'Open3D', 'GLTF / GLB', '3D modelling'],
  },
  {
    title: 'DevOps & release',
    note: 'Repeatable environments and delivery',
    items: ['Docker', 'Docker Compose', 'Nginx', 'Git & GitHub', 'Code review', 'Release coordination', 'Workflow automation', 'AWS fundamentals'],
  },
  {
    title: 'Debugging & tools',
    note: 'Root cause, then fix',
    items: ['Log tracing', 'Defect reproduction', 'Root cause analysis', 'IT support fundamentals', 'Postman', 'Jupyter', 'npm', 'VS Code'],
  },
]

export type Job = {
  company: string
  role: string
  period: string
  place: string
  summary?: string
  points: string[]
  metric?: { value: string; label: string }
}

export const experience: Job[] = [
  {
    company: 'OnePrism LLP',
    role: 'Full-Stack Engineer',
    period: 'Jul 2026 – Present',
    place: 'Vadodara · On-site, full-time',
    points: [
      'Contribute to MedChaaya, a healthcare document management platform for patients, doctors and care teams, using Next.js and FastAPI.',
      'Build and maintain REST APIs with request/response validation and role-based access control, backed by PostgreSQL and SQLAlchemy.',
      'Manage database change control with Alembic versioned migrations, keeping schema changes traceable and repeatable across environments.',
      'Resolve defects across frontend, backend and data layers by tracing logs, reproducing issues and shipping reliable fixes, in a Git/GitHub workflow with peer code review.',
      'Support AI-enabled document workflows: records are uploaded, summarised, and used to answer questions grounded in the stored documents.',
    ],
  },
  {
    company: 'AxeForce Technologies (SmartWalk.io)',
    role: 'Junior Software Developer',
    period: 'Apr 2024 – Jun 2026',
    place: 'Anand',
    points: [
      'Developed JavaScript and React features for SmartWalk, a web-based virtual walkthrough platform: scene rendering, hotspot navigation, dynamic content.',
      'Wrote backend logic with Node.js and Next.js API routes: API integration, validation, configuration handling, structured JSON generation.',
      'Built metadata-driven automation that cut delivery timelines from roughly 10 days to 2 days, removing repetitive manual steps from the release pipeline.',
      'Diagnosed production issues across frontend–backend interactions and improved maintainability through refactoring and reusable logic.',
    ],
    metric: { value: '10 → 2', label: 'days, delivery timeline after automation' },
  },
]

export type Project = {
  index: string
  name: string
  kind: string
  purpose: string
  contributions: string[]
  stack: string[]
}

export const projects: Project[] = [
  {
    index: '01',
    name: 'MedChaaya',
    kind: 'Healthcare · Current work at OnePrism',
    purpose:
      'A document management platform for patients, doctors and care teams, with role-based workflows and AI-assisted question answering over medical records.',
    contributions: [
      'Backend APIs, database workflows and structured data models',
      'Ticket resolution across the frontend and backend',
      'AI-enabled upload, summary and document Q&A flows',
    ],
    stack: ['Next.js', 'FastAPI', 'PostgreSQL', 'SQLAlchemy', 'Alembic'],
  },
  {
    index: '02',
    name: 'SmartWalk Studio',
    kind: 'Virtual tour authoring platform',
    purpose:
      'A web platform for creating and managing 360° virtual tours, built as part of a 5-member engineering team.',
    contributions: [
      'Scene management, hotspot linking and metadata handling',
      'JSON configuration and interactive rendering workflows',
      'Automation that took delivery from ~10 days to ~2 days',
    ],
    stack: ['JavaScript', 'React', 'Next.js API', 'Node.js'],
  },
  {
    index: '03',
    name: 'BidPitch',
    kind: 'Real-time ad auction · Java project',
    purpose:
      'A Spring Boot service modelled on OpenRTB: it fans a bid request out to multiple bidders concurrently and settles a second-price auction inside a fixed response deadline.',
    contributions: [
      'Concurrent fan-out with CompletableFuture and per-bidder timeouts',
      'Spring Data JPA models, Redis-cached budgets, floor prices and budget checks',
      'JUnit and Mockito tests, packaged with Docker Compose',
    ],
    stack: ['Java', 'Spring Boot', 'PostgreSQL', 'Redis', 'Docker'],
  },
  {
    index: '04',
    name: 'MindDaily',
    kind: 'AI psychologist · Team project',
    purpose:
      'An AI-driven journaling system that analyses user-written text and turns it into structured insights.',
    contributions: [
      'Text preprocessing, validation and structured formatting in FastAPI',
      'Integration of NLP and LLM pipeline output with application logic',
      'Careful handling of data privacy and correctness',
    ],
    stack: ['Python', 'FastAPI', 'LangChain', 'LangGraph', 'RAG'],
  },
  {
    index: '05',
    name: 'AI Knowledge Assistant',
    kind: 'Personal project',
    purpose:
      'A document question-answering app that retrieves from uploaded content and answers grounded in it.',
    contributions: [
      'API endpoints for prompt handling and response generation',
      'Retrieval and contextual Q&A with RAG',
      'Experiments with LangGraph agent workflows',
    ],
    stack: ['FastAPI', 'LangChain', 'LangGraph', 'RAG', 'LLM APIs'],
  },
  {
    index: '06',
    name: '3D Modelling & Visualization',
    kind: 'Exploration',
    purpose:
      'Hands-on 3D work: vehicle models in Blender, and programmatic mesh and point-cloud processing for the web.',
    contributions: [
      'Created and processed 3D vehicle models in Blender',
      'Mesh processing, point clouds and visualization with Open3D',
      'GLTF/GLB asset preparation and rendering with Three.js',
    ],
    stack: ['Blender', 'Open3D', 'Three.js', 'GLTF / GLB', 'Python'],
  },
]

export const education = [
  {
    title: 'Master of Computer Applications',
    place: 'SVIT, Vasad',
    period: '2024 – 2026',
    score: 'CGPA 8.54',
  },
  {
    title: 'Bachelor of Computer Applications',
    place: 'CHARUSAT',
    period: '2021 – 2024',
    score: 'CGPA 9.18',
  },
]

export const certifications = [
  { title: 'AWS Academy — Cloud Computing', detail: '' },
]

export const achievements = [
  'Built automation that reduced project delivery from about 10 days to 2 days.',
  'Packaged services with Docker and Docker Compose, and managed versioned database migrations across environments.',
  'Contributed to production applications across healthcare and virtual walkthrough platforms.',
  'Integrated LLM and RAG workflows, document Q&A and backend APIs into real-world applications.',
]

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
]
