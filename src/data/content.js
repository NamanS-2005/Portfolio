export const sections = [
  { id: "intro", label: "Intro", short: "01" },
  { id: "about", label: "About", short: "02" },
  { id: "skills", label: "Skills", short: "03" },
  { id: "projects", label: "Projects", short: "04" },
  { id: "experience", label: "Experience", short: "05" },
  { id: "contact", label: "Contact", short: "06" },
];

export const storyBeats = [
  {
    eyebrow: "What He Builds",
    title: "Full-stack products with practical AI use cases",
    text:
      "Naman's work sits at the intersection of product engineering and applied machine learning, with a focus on building things that are useful and shippable.",
  },
  {
    eyebrow: "How He Works",
    title: "Strong execution with a bias toward clarity",
    text:
      "He enjoys taking a problem apart, picking the right tools for it, and turning rough ideas into working software without overcomplicating the stack.",
  },
  {
    eyebrow: "What This Site Tries To Show",
    title: "Frontend craft backed by real engineering interests",
    text:
      "This portfolio leans visual, but the goal is straightforward: show product sense, implementation ability, and the range to move between UI, backend, and ML work.",
  },
];

export const skillClusters = [
  {
    name: "Languages",
    accent: "cyan",
    items: ["C++", "Python", "JavaScript", "TypeScript", "SQL"],
  },
  {
    name: "Frontend",
    accent: "violet",
    items: ["React", "Next.js", "Framer Motion", "GSAP", "Vite"],
  },
  {
    name: "Backend / Data",
    accent: "amber",
    items: ["Node.js", "Express", "FastAPI", "PostgreSQL", "MongoDB"],
  },
  {
    name: "ML / Tools",
    accent: "emerald",
    items: ["PyTorch", "OpenCV", "Scikit-learn", "Git", "Docker", "Linux"],
  },
];

export const projects = [
  {
    title: "Brain Tumor Detection",
    tag: "Applied ML",
    year: "2025",
    role: "Python, PyTorch, image preprocessing, model evaluation",
    problem:
      "Build a classifier for MRI-based brain tumor detection and present the work clearly enough that the training pipeline, evaluation flow, and assumptions are easy to inspect.",
    approach:
      "Worked on image preprocessing, model experimentation, and evaluation so the project could move beyond a notebook demo into a cleaner end-to-end ML workflow.",
    impact:
      "Best presented as an applied ML project that demonstrates model-building fundamentals, medical-image preprocessing, and the ability to structure an experimental pipeline.",
    stack: ["PyTorch", "OpenCV", "NumPy", "Python"],
    highlights: [
      "MRI preprocessing and classification workflow",
      "Model training and evaluation loop",
      "Good candidate for adding metrics, repo links, and sample outputs next",
    ],
    links: [],
    mood: "signal",
  },
  {
    title: "DivNey",
    tag: "Full-Stack App",
    year: "2025",
    role: "React, Node.js, database design, AI-assisted features",
    problem:
      "Create a product that combines a modern frontend, backend workflows, and AI-backed interactions in one usable experience.",
    approach:
      "Built the application across the stack, focusing on frontend experience, server-side logic, and the way AI features fit into the product instead of overwhelming it.",
    impact:
      "Shows broader product engineering ability than a single ML project: interface work, backend wiring, and feature integration in one build.",
    stack: ["React", "Node.js", "PostgreSQL", "AI APIs"],
    highlights: [
      "Frontend and backend developed as one product surface",
      "AI used as a feature layer rather than a gimmick",
      "Would benefit from public demo links and measurable usage or performance notes",
    ],
    links: [],
    mood: "nebula",
  },
  {
    title: "Thinkistry",
    tag: "Platform Work",
    year: "2024",
    role: "TypeScript, APIs, platform engineering, developer workflow",
    problem:
      "Support a platform setup that can handle ongoing product work without slowing future iteration.",
    approach:
      "Focused on engineering structure: APIs, platform flows, and the sort of implementation choices that make future work easier to maintain and extend.",
    impact:
      "Useful as a systems-oriented project because it shows an interest in maintainability, platform thinking, and developer experience.",
    stack: ["TypeScript", "APIs", "CI/CD", "Cloud Services"],
    highlights: [
      "Platform-minded engineering rather than single-screen UI work",
      "Attention to maintainability and development workflow",
      "Another section that becomes much stronger with links and concrete outcomes",
    ],
    links: [],
    mood: "matrix",
  },
];

export const timeline = [
  {
    title: "IIT Bombay",
    period: "Research work",
    description:
      "This is an important credibility point, but it needs the exact role, team, timeline, and contribution details added before the portfolio is final.",
  },
  {
    title: "Hackathons",
    period: "Builds under pressure",
    description:
      "Hackathons are worth keeping only if the final version includes event names, team size, project built, and any placements or outcomes.",
  },
  {
    title: "LeetCode",
    period: "Problem-solving practice",
    description:
      "A useful supporting signal when paired with a rating, solved count, or contest performance. Without numbers, it should stay secondary to projects.",
  },
];

export const contacts = [
  {
    label: "GitHub",
    value: "github.com/NamanS-2005",
    href: "https://github.com/NamanS-2005",
  },
  {
    label: "Portfolio Repo",
    value: "github.com/NamanS-2005/Portfolio",
    href: "https://github.com/NamanS-2005/Portfolio",
  },
];
