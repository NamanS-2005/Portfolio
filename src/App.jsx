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
        data-cursor-label={active ? "Collapse" : "Open Mission"}
      >
        {active ? "Collapse Mission" : "Open Mission"}
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
  const activeMeta = sections.find((section) => section.id === activeSection) ?? sections[0];

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

      <aside className="journey-hud glass-panel" aria-label="Journey Status">
        <span className="journey-hud__eyebrow">World State</span>
        <strong>{activeMeta.label}</strong>
        <p>
          Scroll is driving the camera through Naman&apos;s cinematic system map.
        </p>
        <div className="journey-hud__meter">
          <motion.span style={{ scaleY: scrollYProgress }} />
        </div>
      </aside>

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
              <span className="hero-panel__eyebrow">Interactive Film Portfolio</span>
              <div className="hero-panel__title">
                <span className="hero-panel__title-line">Naman Sharma</span>
                <span className="hero-panel__title-line">
                  Engineer. Builder. Problem Solver.
                </span>
              </div>
              <p className="hero-panel__copy">
                A guided digital universe where machine intelligence, product craft,
                and systems thinking unfold like a cinematic mission campaign.
              </p>
              <div className="hero-panel__strip">
                <span>Scroll-driven camera</span>
                <span>Interactive missions</span>
                <span>Immersive system worlds</span>
              </div>
              <div className="hero-panel__actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => scrollToSection("projects")}
                  data-magnetic
                  data-cursor-label="Enter Missions"
                >
                  Enter the Journey
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => scrollToSection("contact")}
                  data-magnetic
                  data-cursor-label="Transmit"
                >
                  Initiate Connection
                </button>
              </div>
            </div>

            <div className="hero-stage">
              <div className="hero-stage__frame glass-panel">
                <span>Scene 01 / Identity Core</span>
                <strong>Systems, stories, and sharp execution aligned.</strong>
                <p>
                  The opening scene establishes Naman as a builder who moves from
                  research depth to product impact without losing clarity.
                </p>
              </div>

              <div className="hero-stats">
                <div className="hero-stat glass-panel">
                  <span>Mode</span>
                  <strong>Cinematic + Interactive</strong>
                </div>
                <div className="hero-stat glass-panel">
                  <span>Focus</span>
                  <strong>AI, full-stack systems, product execution</strong>
                </div>
                <div className="hero-stat glass-panel">
                  <span>Feel</span>
                  <strong>IMAX-scale, game-aware, emotionally clean</strong>
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
            label="Exploration Phase"
            title="The journey is built like a world, not a resume."
            text="Scroll behaves like a camera move through Naman's mindset, methods, and motivations. Every zone is a layer of the same system: meaningful problem solving with strong execution."
          />

          <div className="story-zone">
            <motion.div className="story-command glass-panel" {...reveal}>
              <span>Guided Sequence</span>
              <h3>Software, treated like scene design.</h3>
              <p>
                Naman&apos;s edge is not just technical range. It&apos;s the ability to
                make difficult systems feel intentional, coherent, and useful.
              </p>
              <div className="story-command__signals">
                <span>Research-minded</span>
                <span>Product-aware</span>
                <span>Execution-first</span>
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
            label="Deep Dive Zone"
            title="A systems matrix tuned for shipping ambitious ideas."
            text="The skill map is organized like a live engine room: languages power the core, frameworks shape the interface, AI drives intelligence, and systems keep everything dependable under pressure."
          />

          <div className="skills-stage">
            <motion.div className="skills-reactor glass-panel" {...reveal}>
              <div className="skills-reactor__core">
                <span>Core Engine</span>
                <strong>Adaptive technical range</strong>
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
            label="Mission Control"
            title="Projects are presented as missions with stakes, choices, and outcomes."
            text="Each build is framed as a narrative arc: what challenge existed, how Naman engineered through it, and why the result mattered. This keeps the work concrete and memorable."
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
              <span className="mission-preview__eyebrow">Live Mission Feed</span>
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
                      <span>Mission Type</span>
                      <strong>{activeMission.tag}</strong>
                    </div>
                    <div>
                      <span>Primary Focus</span>
                      <strong>{activeMission.stack[0]}</strong>
                    </div>
                    <div>
                      <span>Impact Lens</span>
                      <strong>Outcome-driven engineering</strong>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3>Select a mission</h3>
                  <p>
                    Open any project card to shift into its detailed view and inspect
                    the problem, approach, and impact.
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
            label="Impact Timeline"
            title="Experience framed as momentum, not chronology."
            text="The timeline focuses on signals of capability: research rigor, competitive building under pressure, and the steady discipline that sharpens technical instincts over time."
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
            <span className="contact-terminal__eyebrow">Final Scene</span>
            <h2>You are connecting to Naman&apos;s system.</h2>
            <p>
              If the mission is building something sharp, fast, intelligent, and
              memorable, the transmission channel is open.
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
              onClick={() => window.open("mailto:naman.sharma.dev@example.com", "_self")}
              data-magnetic
              data-cursor-label="Transmit"
            >
              Enter Transmission
            </button>

            <div className="contact-terminal__footer">
              <span>Signal received.</span>
              <span>Let&apos;s build the impossible.</span>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
