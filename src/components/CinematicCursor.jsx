import { useEffect, useMemo, useRef, useState } from "react";

const trailCount = 10;
const phaseHue = {
  intro: 190,
  about: 205,
  skills: 145,
  projects: 280,
  experience: 42,
  contact: 12,
};

export default function CinematicCursor({
  disabled,
  progress,
  phase = "intro",
  interactiveSelector = "[data-magnetic]",
}) {
  const cursorRef = useRef(null);
  const trailRefs = useRef([]);
  const rafRef = useRef(0);
  const position = useRef({
    x: typeof window === "undefined" ? 0 : window.innerWidth / 2,
    y: typeof window === "undefined" ? 0 : window.innerHeight / 2,
  });
  const target = useRef({ ...position.current });
  const trail = useRef(
    Array.from({ length: trailCount }, () => ({ ...position.current })),
  );
  const [waves, setWaves] = useState([]);
  const [label, setLabel] = useState("");
  const [interactive, setInteractive] = useState(false);

  const hue = useMemo(() => {
    const base = phaseHue[phase] ?? 190;
    return base + progress * 26;
  }, [phase, progress]);
  const scale = useMemo(() => 1 + progress * 0.35, [progress]);

  useEffect(() => {
    if (disabled) {
      document.documentElement.style.removeProperty("--cursor-x");
      document.documentElement.style.removeProperty("--cursor-y");
      return undefined;
    }

    const animate = () => {
      position.current.x += (target.current.x - position.current.x) * 0.18;
      position.current.y += (target.current.y - position.current.y) * 0.18;

      trail.current = trail.current.map((point, index) => {
        const source = index === 0 ? position.current : trail.current[index - 1];

        return {
          x: point.x + (source.x - point.x) * 0.35,
          y: point.y + (source.y - point.y) * 0.35,
        };
      });

      if (cursorRef.current) {
        cursorRef.current.style.setProperty(
          "--cursor-left",
          `${position.current.x}px`,
        );
        cursorRef.current.style.setProperty(
          "--cursor-top",
          `${position.current.y}px`,
        );
        cursorRef.current.style.setProperty("--cursor-hue", `${hue}`);
        cursorRef.current.style.setProperty("--cursor-scale", `${scale}`);
      }

      trail.current.forEach((point, index) => {
        const node = trailRefs.current[index];
        if (!node) {
          return;
        }

        node.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) scale(${
          1 - index * 0.07
        })`;
      });

      document.documentElement.style.setProperty(
        "--cursor-x",
        `${position.current.x}px`,
      );
      document.documentElement.style.setProperty(
        "--cursor-y",
        `${position.current.y}px`,
      );
      document.documentElement.style.setProperty(
        "--scanner-x",
        `${position.current.x}px`,
      );
      document.documentElement.style.setProperty(
        "--scanner-y",
        `${position.current.y}px`,
      );
      document.documentElement.style.setProperty("--scanner-hue", `${hue}`);

      rafRef.current = window.requestAnimationFrame(animate);
    };

    const handleMove = (event) => {
      target.current = { x: event.clientX, y: event.clientY };
    };

    const handleClick = () => {
      const wave = {
        id: Date.now(),
        x: target.current.x,
        y: target.current.y,
      };

      setWaves((current) => [...current, wave]);
      window.setTimeout(() => {
        setWaves((current) => current.filter((item) => item.id !== wave.id));
      }, 700);
    };

    const activateMagnet = (element) => {
      const labelText = element.getAttribute("data-cursor-label") ?? "Engage";
      setInteractive(true);
      setLabel(labelText);
    };

    const clearMagnet = (element) => {
      element.style.removeProperty("transform");
      setInteractive(false);
      setLabel("");
    };

    const handleTargetMove = (event) => {
      const element = event.currentTarget;
      const rect = element.getBoundingClientRect();
      const offsetX = event.clientX - (rect.left + rect.width / 2);
      const offsetY = event.clientY - (rect.top + rect.height / 2);
      const x = offsetX * 0.09;
      const y = offsetY * 0.09;
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const interactiveNodes = [...document.querySelectorAll(interactiveSelector)];
    const listeners = interactiveNodes.map((element) => {
      const enter = () => activateMagnet(element);
      const leave = () => clearMagnet(element);
      const move = (event) => handleTargetMove(event);

      element.addEventListener("mouseenter", enter);
      element.addEventListener("mouseleave", leave);
      element.addEventListener("mousemove", move);

      return { element, enter, leave, move };
    });

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("click", handleClick);
    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("click", handleClick);
      listeners.forEach(({ element, enter, leave, move }) => {
        element.removeEventListener("mouseenter", enter);
        element.removeEventListener("mouseleave", leave);
        element.removeEventListener("mousemove", move);
        element.style.removeProperty("transform");
      });
    };
  }, [disabled, hue, interactiveSelector, scale]);

  if (disabled) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className={`cinematic-cursor ${interactive ? "is-interactive" : ""}`}
      aria-hidden="true"
    >
      <div className="cinematic-cursor__field" />
      <div className="cinematic-cursor__core" />
      <div className="cinematic-cursor__ring" />
      {trail.current.map((point, index) => (
        <span
          key={index}
          ref={(node) => {
            trailRefs.current[index] = node;
          }}
          className="cinematic-cursor__trail"
        />
      ))}
      {label ? <span className="cinematic-cursor__label">{label}</span> : null}
      {waves.map((wave) => (
        <span
          key={wave.id}
          className="cinematic-cursor__wave"
          style={{
            left: wave.x,
            top: wave.y,
          }}
        />
      ))}
    </div>
  );
}
