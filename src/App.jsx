import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import CinematicCursor from "./components/CinematicCursor";
import {
  contacts,
  projects,
  sections,
  skillClusters,
  storyBeats,
  timeline,
} from "./data/content";

const SceneCanvas = lazy(() => import("./components/SceneCanvas"));

const reveal = {
  initial: { opacity: 0, y: 48 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
};

function SectionHeading({ index, label, title, text }) {
  return (
    <motion.div className="section-heading" {...reveal}>
      <div className="section-heading__meta">
        <span>{index}</span>
        <span>{label}</span>
      </div>
      <h2>{title}</h2>
      <p>{text}</p>
    </motion.div>
  );
}

function ProjectMission({ project, active, onOpen }) {
  return (
    <motion.article
      layout
      className={`mission-card ${active ? "is-active" : ""} mission-card--${project.mood}`}
      {...reveal}
    >
      <div className="mission-card__topline">
        <span>{project.tag}</span>
        <span>{project.year}</span>
      </div>
      <h3>{project.title}</h3>
      <p>{project.role}</p>
      <button
        type="button"
        className="mission-card__button"
        onClick={onOpen}
        data-magnetic
        data-cursor-label={active ? "Collapse" : "View Details"}
      >
        {active ? "Hide Details" : "View Details"}
      </button>
      <AnimatePresence initial={false}>
        {active ? (
          <motion.div
            key="detail"
            className="mission-card__detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div>
              <span>Problem</span>
              <p>{project.problem}</p>
            </div>
            <div>
              <span>Approach</span>
              <p>{project.approach}</p>
            </div>
            <div>
              <span>Impact</span>
              <p>{project.impact}</p>
            </div>
            <div className="mission-card__stack">
              {project.stack.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <div className="mission-card__proof">
              {project.highlights.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
            {project.links.length ? (
              <div className="mission-card__links">
                {project.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-magnetic
                    data-cursor-label={link.label}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}

export default function App() {
  const heroRef = useRef(null);
  const sectionRefs = useRef({});
  const [activeSection, setActiveSection] = useState("intro");
  const [activeProject, setActiveProject] = useState(projects[0].title);
  const [isCompact, setIsCompact] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const { scrollYProgress } = useScroll();

  const heroShift = useTransform(scrollYProgress, [0, 0.25], [0, -120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0.15]);

  useEffect(() => {
    const mediaCompact = window.matchMedia("(max-width: 900px)");
    const mediaPointer = window.matchMedia("(pointer: coarse)");
    const mediaReduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMode = () => {
      setIsCompact(mediaCompact.matches || mediaPointer.matches);
      setReduceMotion(mediaReduced.matches);
    };

    updateMode();
    mediaCompact.addEventListener("change", updateMode);
    mediaPointer.addEventListener("change", updateMode);
    mediaReduced.addEventListener("change", updateMode);

    return () => {
      mediaCompact.removeEventListener("change", updateMode);
      mediaPointer.removeEventListener("change", updateMode);
      mediaReduced.removeEventListener("change", updateMode);
    };
  }, []);

  useLayoutEffect(() => {
    if (!heroRef.current || reduceMotion) {
      return undefined;
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .from(".hero-panel__eyebrow", { opacity: 0, y: 20, duration: 0.7 })
        .from(
          ".hero-panel__title-line",
          { opacity: 0, y: 65, stagger: 0.12, duration: 1 },
          "-=0.35",
        )
        .from(".hero-panel__copy", { opacity: 0, y: 24, duration: 0.8 }, "-=0.45")
        .from(".hero-panel__actions > *", {
          opacity: 0,
          y: 20,
          stagger: 0.1,
          duration: 0.6,
        });
    }, heroRef);

    return () => context.revert();
  }, [reduceMotion]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: "-25% 0px -25% 0px", threshold: [0.2, 0.45, 0.7] },
    );

    const refs = Object.values(sectionRefs.current);
    refs.forEach((section) => section && observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const currentProgress = useMemo(() => {
    const index = sections.findIndex((item) => item.id === activeSection);
    return index <= 0 ? 0 : index / (sections.length - 1);
  }, [activeSection]);

  const scrollToSection = (id) => {
    sectionRefs.current[id]?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const activeMission = projects.find((project) => project.title === activeProject);

  return (
    <div className={`app-shell app-shell--${activeSection}`}>
      <div className="scanner-overlay" />

      {!isCompact && !reduceMotion ? (
        <Suspense fallback={<div className="scene-canvas scene-canvas--fallback" />}>
          <SceneCanvas progress={currentProgress} activeSection={activeSection} />
        </Suspense>
      ) : (
        <div className="scene-canvas scene-canvas--fallback" aria-hidden="true" />
      )}

      <CinematicCursor
        disabled={isCompact || reduceMotion}
        progress={currentProgress}
        phase={activeSection}
      />

      <nav className="world-nav" aria-label="Journey Navigation">
        <div className="world-nav__label">Journey Map</div>
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            className={activeSection === section.id ? "is-active" : ""}
            onClick={() => scrollToSection(section.id)}
            data-magnetic
            data-cursor-label={section.label}
          >
            <span>{section.short}</span>
            <span>{section.label}</span>
          </button>
        ))}
      </nav>

      <main className="experience">
        <motion.section
          id="intro"
          ref={(node) => {
            sectionRefs.current.intro = node;
          }}
          className="hero"
          style={{ y: heroShift, opacity: heroOpacity }}
        >
          <div className="hero__background-grid" aria-hidden="true" />
          <div className="hero-layout">
            <div ref={heroRef} className="hero-panel glass-panel">
              <span className="hero-panel__eyebrow">Portfolio</span>
              <div className="hero-panel__title">
                <span className="hero-panel__title-line">Naman Sharma</span>
                <span className="hero-panel__title-line">
                  Software Engineer focused on product and AI work.
                </span>
              </div>
              <p className="hero-panel__copy">
                Builds full-stack applications and applied ML projects with an
                emphasis on clear implementation, useful features, and polished
                frontend execution.
              </p>
              <div className="hero-panel__strip">
                <span>React + Node.js</span>
                <span>Applied machine learning</span>
                <span>Product-minded engineering</span>
              </div>
              <div className="hero-panel__actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => scrollToSection("projects")}
                  data-magnetic
                  data-cursor-label="Projects"
                >
                  View Projects
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => scrollToSection("contact")}
                  data-magnetic
                  data-cursor-label="Contact"
                >
                  Contact / Links
                </button>
              </div>
            </div>

            <div className="hero-stage">
              <div className="hero-stage__frame glass-panel">
                <span>Overview</span>
                <strong>Strong frontend execution. Content still needs proof.</strong>
                <p>
                  The interface quality is already strong. The next step is making
                  the project details, links, metrics, and experience entries just
                  as concrete.
                </p>
              </div>

              <div className="hero-stats">
                <div className="hero-stat glass-panel">
                  <span>Focus</span>
                  <strong>Full-stack applications</strong>
                </div>
                <div className="hero-stat glass-panel">
                  <span>Interest</span>
                  <strong>Applied ML and product UX</strong>
                </div>
                <div className="hero-stat glass-panel">
                  <span>Needs Next</span>
                  <strong>Repos, demos, screenshots, measurable results</strong>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <section
          id="about"
          ref={(node) => {
            sectionRefs.current.about = node;
          }}
          className="story-section"
        >
          <SectionHeading
            index="02"
            label="About"
            title="Clearer positioning, less performance art."
            text="The goal here is simple: explain what Naman builds, how he works, and what still needs stronger evidence before this becomes a fully convincing public portfolio."
          />

          <div className="story-zone">
            <motion.div className="story-command glass-panel" {...reveal}>
              <span>Summary</span>
              <h3>Good portfolios earn trust fast.</h3>
              <p>
                The visuals can stay ambitious, but the content needs to stay
                grounded. This pass keeps the design while making the message more
                direct and believable.
              </p>
              <div className="story-command__signals">
                <span>Clearer copy</span>
                <span>Less hype</span>
                <span>More proof</span>
              </div>
            </motion.div>

            <div className="story-grid">
              {storyBeats.map((beat) => (
                <motion.article
                  key={beat.title}
                  className="story-card glass-panel"
                  {...reveal}
                >
                  <span>{beat.eyebrow}</span>
                  <h3>{beat.title}</h3>
                  <p>{beat.text}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="skills"
          ref={(node) => {
            sectionRefs.current.skills = node;
          }}
          className="skills-section"
        >
          <SectionHeading
            index="03"
            label="Skills"
            title="Skills should line up with visible work."
            text="This list is narrower and easier to defend. The best next improvement is to connect each tool to a project, repo, or concrete result."
          />

          <div className="skills-stage">
            <motion.div className="skills-reactor glass-panel" {...reveal}>
              <div className="skills-reactor__core">
                <span>Core Focus</span>
                <strong>Frontend, backend, and applied ML</strong>
              </div>
              <div className="skills-reactor__rings" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </motion.div>

            <div className="skills-orbit">
              {skillClusters.map((cluster, clusterIndex) => (
                <motion.article
                  key={cluster.name}
                  className={`skills-cluster glass-panel skills-cluster--${cluster.accent}`}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: clusterIndex * 0.08 }}
                >
                  <div className="skills-cluster__header">
                    <span>{cluster.name}</span>
                    <span>{String(cluster.items.length).padStart(2, "0")}</span>
                  </div>
                  <div className="skills-cluster__items">
                    {cluster.items.map((item, itemIndex) => (
                      <span
                        key={item}
                        className="skills-pill"
                        style={{ "--pill-index": itemIndex }}
                        data-magnetic
                        data-cursor-label={item}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="projects"
          ref={(node) => {
            sectionRefs.current.projects = node;
          }}
          className="projects-section"
        >
          <SectionHeading
            index="04"
            label="Projects"
            title="The work matters more than the framing."
            text="These projects are more useful when they explain the build, the stack, and the result in plain language. Public repos, demos, screenshots, and metrics should be the next additions."
          />

          <div className="projects-layout">
            <div className="mission-list">
              {projects.map((project) => (
                <ProjectMission
                  key={project.title}
                  project={project}
                  active={activeProject === project.title}
                  onOpen={() =>
                    setActiveProject((current) =>
                      current === project.title ? "" : project.title,
                    )
                  }
                />
              ))}
            </div>

            <motion.aside className="mission-preview glass-panel" {...reveal}>
              <span className="mission-preview__eyebrow">Selected Project</span>
              <div className="mission-preview__chamber" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              {activeMission ? (
                <>
                  <h3>{activeMission.title}</h3>
                  <p>{activeMission.approach}</p>
                  <div className="mission-preview__metrics">
                    <div>
                      <span>Category</span>
                      <strong>{activeMission.tag}</strong>
                    </div>
                    <div>
                      <span>Primary Stack</span>
                      <strong>{activeMission.stack[0]}</strong>
                    </div>
                    <div>
                      <span>What Improves This</span>
                      <strong>Repo, demo, screenshots, metrics</strong>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3>Select a project</h3>
                  <p>
                    Open any card to review the implementation summary and the
                    proof points that still need to be added.
                  </p>
                </>
              )}
            </motion.aside>
          </div>
        </section>

        <section
          id="experience"
          ref={(node) => {
            sectionRefs.current.experience = node;
          }}
          className="timeline-section"
        >
          <SectionHeading
            index="05"
            label="Experience"
            title="Facts will do more than atmosphere here."
            text="The visual treatment stays, but the content is now explicit about where exact role, timeline, and outcome details still need to be filled in."
          />

          <div className="timeline">
            {timeline.map((item, index) => (
              <motion.article
                key={item.title}
                className="timeline-entry glass-panel"
                {...reveal}
                transition={{ ...reveal.transition, delay: index * 0.08 }}
              >
                <div className="timeline-entry__index">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <span>{item.period}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section
          id="contact"
          ref={(node) => {
            sectionRefs.current.contact = node;
          }}
          className="contact-section"
        >
          <motion.div className="contact-terminal glass-panel" {...reveal}>
            <span className="contact-terminal__eyebrow">Contact</span>
            <h2>Public links first. Direct contact details next.</h2>
            <p>
              The placeholder email is gone. For now, GitHub is the reliable public
              point of contact shown in this build.
            </p>

            <div className="contact-terminal__grid">
              {contacts.map((contact) => (
                <a
                  key={contact.label}
                  className="contact-link"
                  href={contact.href}
                  target={contact.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    contact.href.startsWith("http")
                      ? "noreferrer noopener"
                      : undefined
                  }
                  data-magnetic
                  data-cursor-label={contact.label}
                >
                  <span>{contact.label}</span>
                  <strong>{contact.value}</strong>
                </a>
              ))}
            </div>

            <div className="contact-terminal__signal" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>

            <button
              type="button"
              className="primary-button primary-button--wide"
              onClick={() =>
                window.open(
                  "https://github.com/NamanS-2005",
                  "_blank",
                  "noopener,noreferrer",
                )
              }
              data-magnetic
              data-cursor-label="GitHub"
            >
              Open GitHub Profile
            </button>

            <div className="contact-terminal__footer">
              <span>Add real email and LinkedIn before launch.</span>
              <span>Keep the design. Strengthen the proof.</span>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
