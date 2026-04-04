import { useEffect, useRef } from "react";
import * as THREE from "three";

const phasePalette = {
  intro: { key: "#7cf2ff", fill: "#8578ff", fog: "#02040d" },
  about: { key: "#78d8ff", fill: "#3fb4ff", fog: "#02050e" },
  skills: { key: "#75ffd7", fill: "#59a9ff", fog: "#01060c" },
  projects: { key: "#a78bff", fill: "#7cf2ff", fog: "#04030d" },
  experience: { key: "#ffc872", fill: "#8ac7ff", fog: "#0b0908" },
  contact: { key: "#ff8f72", fill: "#a78bff", fog: "#0a0407" },
};

const cameraPath = [
  {
    t: 0,
    position: new THREE.Vector3(0, 0.5, 18),
    lookAt: new THREE.Vector3(0, 0, 0),
  },
  {
    t: 0.16,
    position: new THREE.Vector3(-1.8, 0.2, 13),
    lookAt: new THREE.Vector3(0, 0, -2),
  },
  {
    t: 0.34,
    position: new THREE.Vector3(-5.2, -1.6, 11),
    lookAt: new THREE.Vector3(-5.5, -1.6, -12),
  },
  {
    t: 0.52,
    position: new THREE.Vector3(2.6, -3.7, 10),
    lookAt: new THREE.Vector3(4, -4, -22),
  },
  {
    t: 0.72,
    position: new THREE.Vector3(0.3, -6.2, 10),
    lookAt: new THREE.Vector3(0, -7, -34),
  },
  {
    t: 0.88,
    position: new THREE.Vector3(-2.5, -9.7, 11),
    lookAt: new THREE.Vector3(-4, -10, -46),
  },
  {
    t: 1,
    position: new THREE.Vector3(0, -12.4, 13),
    lookAt: new THREE.Vector3(0, -13, -58),
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function smooth(t) {
  return t * t * (3 - 2 * t);
}

function interpolatePath(value, key) {
  for (let index = 0; index < cameraPath.length - 1; index += 1) {
    const current = cameraPath[index];
    const next = cameraPath[index + 1];

    if (value >= current.t && value <= next.t) {
      const local = smooth((value - current.t) / (next.t - current.t));
      return current[key].clone().lerp(next[key], local);
    }
  }

  return cameraPath[cameraPath.length - 1][key].clone();
}

function createEnergyTexture(colors) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");

  const gradient = context.createRadialGradient(128, 128, 12, 128, 128, 128);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(0.4, colors[1]);
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);

  for (let index = 0; index < 90; index += 1) {
    context.beginPath();
    context.strokeStyle = `rgba(255,255,255,${Math.random() * 0.16})`;
    context.lineWidth = Math.random() * 2 + 0.2;
    context.moveTo(Math.random() * 256, Math.random() * 256);
    context.lineTo(Math.random() * 256, Math.random() * 256);
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createGridTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");

  context.fillStyle = "#08111e";
  context.fillRect(0, 0, 512, 512);

  for (let step = 0; step <= 512; step += 32) {
    context.strokeStyle = "rgba(133, 221, 255, 0.18)";
    context.lineWidth = step % 128 === 0 ? 2 : 1;
    context.beginPath();
    context.moveTo(step, 0);
    context.lineTo(step, 512);
    context.stroke();

    context.beginPath();
    context.moveTo(0, step);
    context.lineTo(512, step);
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 30);
  texture.needsUpdate = true;
  return texture;
}

function createPlane(width, height, material) {
  return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
}

function disposeMaterial(material) {
  if (Array.isArray(material)) {
    material.forEach(disposeMaterial);
    return;
  }

  Object.keys(material).forEach((key) => {
    const value = material[key];
    if (value && typeof value.dispose === "function") {
      value.dispose();
    }
  });

  material.dispose();
}

export default function SceneCanvas({ progress, activeSection = "intro" }) {
  const mountRef = useRef(null);
  const progressRef = useRef(progress);
  const phaseRef = useRef(activeSection);
  const pointerRef = useRef({ x: 0, y: 0, hovering: false, impulse: 0 });

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    phaseRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      46,
      window.innerWidth / window.innerHeight,
      0.1,
      140,
    );
    camera.position.copy(cameraPath[0].position);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    scene.fog = new THREE.FogExp2("#02040d", 0.032);

    const ambient = new THREE.AmbientLight("#6dc8ff", 0.65);
    scene.add(ambient);

    const keyLight = new THREE.PointLight("#7cf2ff", 3.2, 55);
    keyLight.position.set(5, 6, 10);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight("#8578ff", 2.8, 70);
    fillLight.position.set(-7, -2, 8);
    scene.add(fillLight);

    const beamLight = new THREE.SpotLight("#a3ecff", 4, 90, Math.PI / 7, 0.7, 1);
    beamLight.position.set(0, 8, 14);
    beamLight.target.position.set(0, 0, -10);
    scene.add(beamLight);
    scene.add(beamLight.target);

    const world = new THREE.Group();
    scene.add(world);

    const pointerPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 20);
    const raycaster = new THREE.Raycaster();
    const pointerWorld = new THREE.Vector3();
    const pointerTarget = new THREE.Vector3();
    const clickOrigin = new THREE.Vector3();

    const textures = [
      createEnergyTexture(["rgba(255,255,255,1)", "rgba(120,220,255,0.45)"]),
      createEnergyTexture(["rgba(255,240,210,0.9)", "rgba(255,116,84,0.34)"]),
      createGridTexture(),
    ];

    const [coolGlowTexture, warmGlowTexture, gridTexture] = textures;

    const floor = createPlane(
      42,
      92,
      new THREE.MeshBasicMaterial({
        map: gridTexture,
        transparent: true,
        opacity: 0.14,
        color: "#67d6ff",
        side: THREE.DoubleSide,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -15.5, -30);
    world.add(floor);

    const introGroup = new THREE.Group();
    introGroup.position.set(0, 0, 0);
    world.add(introGroup);

    const introShell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.6, 1),
      new THREE.MeshPhysicalMaterial({
        color: "#8ce8ff",
        emissive: "#176b9d",
        wireframe: true,
        transparent: true,
        opacity: 0.66,
        metalness: 0.78,
        roughness: 0.18,
      }),
    );
    introGroup.add(introShell);

    const portalOuter = new THREE.Mesh(
      new THREE.TorusGeometry(5.2, 0.14, 24, 180),
      new THREE.MeshPhysicalMaterial({
        color: "#77deff",
        emissive: "#2a87c1",
        transparent: true,
        opacity: 0.55,
      }),
    );
    portalOuter.rotation.x = Math.PI / 2.15;
    introGroup.add(portalOuter);

    const portalInner = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.5, 0.12, 120, 16),
      new THREE.MeshPhysicalMaterial({
        color: "#cbeeff",
        emissive: "#438ac0",
        transparent: true,
        opacity: 0.72,
        wireframe: true,
      }),
    );
    introGroup.add(portalInner);

    const introGlow = createPlane(
      9,
      9,
      new THREE.MeshBasicMaterial({
        map: coolGlowTexture,
        transparent: true,
        opacity: 0.34,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    introGlow.position.z = -0.3;
    introGroup.add(introGlow);

    const introShards = [];
    const introShardBases = [];
    for (let index = 0; index < 14; index += 1) {
      const shard = new THREE.Mesh(
        new THREE.TetrahedronGeometry(0.22 + Math.random() * 0.55, 0),
        new THREE.MeshPhysicalMaterial({
          color: index % 2 === 0 ? "#8ce8ff" : "#9b88ff",
          emissive: index % 2 === 0 ? "#165d9d" : "#3520aa",
          transparent: true,
          opacity: 0.58,
          wireframe: true,
        }),
      );
      const angle = (index / 14) * Math.PI * 2;
      const radius = 3.6 + Math.random() * 2.6;
      shard.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 1.4) * 1.2,
        Math.sin(angle) * radius * 0.35,
      );
      introShards.push(shard);
      introShardBases.push(shard.position.clone());
      introGroup.add(shard);
    }

    const aboutGroup = new THREE.Group();
    aboutGroup.position.set(-5.5, -1.7, -12);
    world.add(aboutGroup);

    const monolithMaterial = new THREE.MeshPhysicalMaterial({
      color: "#77d4ff",
      emissive: "#11486f",
      transparent: true,
      opacity: 0.24,
      transmission: 0.78,
      roughness: 0.12,
      thickness: 1.2,
    });

    const aboutMonoliths = [];
    for (let index = 0; index < 5; index += 1) {
      const monolith = new THREE.Mesh(
        new THREE.BoxGeometry(1.15, 4 + index * 0.45, 0.2),
        monolithMaterial.clone(),
      );
      monolith.position.set(index * 1.45 - 2.9, index % 2 === 0 ? 0.4 : -0.4, -index * 1.2);
      monolith.rotation.y = 0.18 - index * 0.05;
      aboutMonoliths.push(monolith);
      aboutGroup.add(monolith);
    }

    const aboutHalo = createPlane(
      8,
      8,
      new THREE.MeshBasicMaterial({
        map: coolGlowTexture,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    aboutHalo.position.set(0, 0.3, -2);
    aboutGroup.add(aboutHalo);

    const skillsGroup = new THREE.Group();
    skillsGroup.position.set(4, -4, -22);
    world.add(skillsGroup);

    const reactorCore = new THREE.Mesh(
      new THREE.SphereGeometry(1.9, 48, 48),
      new THREE.MeshPhysicalMaterial({
        color: "#88ffe1",
        emissive: "#1d8f7f",
        map: coolGlowTexture,
        transparent: true,
        opacity: 0.75,
        roughness: 0.15,
        metalness: 0.42,
      }),
    );
    skillsGroup.add(reactorCore);

    const skillRings = [3.2, 4.6, 6].map((radius, index) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.04 + index * 0.01, 20, 180),
        new THREE.MeshBasicMaterial({
          color: index === 1 ? "#80e5ff" : "#75ffd7",
          transparent: true,
          opacity: 0.44 - index * 0.08,
        }),
      );
      ring.rotation.set(Math.PI / (2.3 + index * 0.2), index * 0.3, 0);
      skillsGroup.add(ring);
      return ring;
    });

    const skillNodes = [];
    const skillNodeBases = [];
    for (let index = 0; index < 10; index += 1) {
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.2 + (index % 3) * 0.04, 20, 20),
        new THREE.MeshBasicMaterial({
          color: index % 2 === 0 ? "#8ce8ff" : "#7cf2ca",
        }),
      );
      skillNodes.push(node);
      skillNodeBases.push(new THREE.Vector3());
      skillsGroup.add(node);
    }

    const projectsGroup = new THREE.Group();
    projectsGroup.position.set(0, -7, -34);
    world.add(projectsGroup);

    const missionPlatform = new THREE.Mesh(
      new THREE.CylinderGeometry(7, 8.8, 0.18, 64),
      new THREE.MeshPhysicalMaterial({
        color: "#0d1830",
        emissive: "#12284b",
        transparent: true,
        opacity: 0.88,
        roughness: 0.35,
        metalness: 0.55,
      }),
    );
    missionPlatform.position.y = -1.8;
    projectsGroup.add(missionPlatform);

    const missionGlow = createPlane(
      16,
      16,
      new THREE.MeshBasicMaterial({
        map: coolGlowTexture,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    missionGlow.rotation.x = -Math.PI / 2;
    missionGlow.position.y = -1.65;
    projectsGroup.add(missionGlow);

    const capsules = [];
    const capsuleBases = [];
    [-4.4, 0, 4.4].forEach((x, index) => {
      const capsule = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.95, 2.5, 10, 24),
        new THREE.MeshPhysicalMaterial({
          color: index === 1 ? "#9b8eff" : "#8ce8ff",
          emissive: index === 1 ? "#3f31c9" : "#15638e",
          transparent: true,
          opacity: 0.42,
          roughness: 0.08,
          transmission: 0.65,
        }),
      );
      const cage = new THREE.Mesh(
        new THREE.CapsuleGeometry(1.05, 2.65, 8, 16),
        new THREE.MeshPhysicalMaterial({
          color: "#d8f6ff",
          emissive: "#257eb1",
          transparent: true,
          opacity: 0.35,
          wireframe: true,
        }),
      );
      capsule.position.set(x, 0, index * -1.1);
      capsule.add(body);
      capsule.add(cage);
      capsules.push(capsule);
      capsuleBases.push(capsule.position.clone());
      projectsGroup.add(capsule);
    });

    const experienceGroup = new THREE.Group();
    experienceGroup.position.set(-4, -10, -46);
    world.add(experienceGroup);

    const experienceColumns = [];
    for (let index = 0; index < 4; index += 1) {
      const column = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 5 + index * 1.4, 0.55),
        new THREE.MeshPhysicalMaterial({
          color: "#ffd27c",
          emissive: "#8d5a0f",
          transparent: true,
          opacity: 0.45,
          roughness: 0.18,
          metalness: 0.3,
        }),
      );
      column.position.set(index * 2.1, index * 0.35, -index * 2.6);
      experienceColumns.push(column);
      experienceGroup.add(column);
    }

    const experienceBridge = new THREE.Mesh(
      new THREE.TorusGeometry(4.8, 0.08, 12, 120, Math.PI * 1.15),
      new THREE.MeshBasicMaterial({
        color: "#ffc872",
        transparent: true,
        opacity: 0.42,
      }),
    );
    experienceBridge.rotation.set(Math.PI / 3.1, 0.2, 1.08);
    experienceBridge.position.set(2.6, 1.7, -3.2);
    experienceGroup.add(experienceBridge);

    const contactGroup = new THREE.Group();
    contactGroup.position.set(0, -13, -58);
    world.add(contactGroup);

    const contactBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.65, 7.8, 32),
      new THREE.MeshBasicMaterial({
        color: "#ff8f72",
        transparent: true,
        opacity: 0.36,
      }),
    );
    contactBeam.position.y = 1.7;
    contactGroup.add(contactBeam);

    const contactGlow = createPlane(
      10,
      10,
      new THREE.MeshBasicMaterial({
        map: warmGlowTexture,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    contactGlow.position.y = 1.5;
    contactGroup.add(contactGlow);

    const contactRings = [1.8, 3.2, 4.6].map((radius, index) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.06, 16, 180),
        new THREE.MeshBasicMaterial({
          color: index === 0 ? "#ff9d7f" : "#a78bff",
          transparent: true,
          opacity: 0.55 - index * 0.1,
        }),
      );
      ring.rotation.x = Math.PI / (2.15 + index * 0.14);
      contactGroup.add(ring);
      return ring;
    });

    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 2200;
    const starPositions = new Float32Array(starCount * 3);
    for (let index = 0; index < starCount; index += 1) {
      const spread = 70;
      starPositions[index * 3] = (Math.random() - 0.5) * spread;
      starPositions[index * 3 + 1] = (Math.random() - 0.5) * spread - 6;
      starPositions[index * 3 + 2] = -Math.random() * 90 + 18;
    }
    starsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3),
    );
    const stars = new THREE.Points(
      starsGeometry,
      new THREE.PointsMaterial({
        color: "#def5ff",
        size: 0.08,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    scene.add(stars);

    const reactiveField = new THREE.Group();
    scene.add(reactiveField);

    const reactiveMotes = [];
    const reactiveMaterial = new THREE.MeshBasicMaterial({
      color: "#dff8ff",
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const reactiveGeometry = new THREE.SphereGeometry(0.08, 10, 10);

    for (let index = 0; index < 110; index += 1) {
      const mote = new THREE.Mesh(reactiveGeometry, reactiveMaterial.clone());
      const base = new THREE.Vector3(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10,
        -6 - Math.random() * 10,
      );
      mote.position.copy(base);
      reactiveField.add(mote);
      reactiveMotes.push({
        mesh: mote,
        base,
        velocity: new THREE.Vector3(),
        noise: Math.random() * Math.PI * 2,
      });
    }

    let smoothJourney = progressRef.current;
    const lookTarget = new THREE.Vector3();
    const desiredKey = new THREE.Color();
    const desiredFill = new THREE.Color();
    const desiredFog = new THREE.Color();
    const ndc = new THREE.Vector2();
    const projected = new THREE.Vector3();
    const repel = new THREE.Vector3();
    const localImpulse = new THREE.Vector3();
    const pointerDelta = new THREE.Vector2();
    const inverseMatrix = new THREE.Matrix4();
    const clock = new THREE.Clock();

    const updatePointerWorld = () => {
      ndc.set(pointerRef.current.x, pointerRef.current.y);
      raycaster.setFromCamera(ndc, camera);
      raycaster.ray.intersectPlane(pointerPlane, pointerTarget);
    };

    const handleMouseMove = (event) => {
      pointerRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      pointerRef.current.hovering = true;
    };

    const handleMouseLeave = () => {
      pointerRef.current.hovering = false;
    };

    const handleClick = () => {
      updatePointerWorld();
      clickOrigin.copy(pointerTarget);
      pointerRef.current.impulse = 1;
    };

    const addClickImpulse = (localPosition, parent, radius, strength, minimum = 0.6) => {
      if (pointerRef.current.impulse <= 0.05) {
        return;
      }

      repel.copy(localPosition).applyMatrix4(parent.matrixWorld).sub(clickOrigin);
      const clickDistance = Math.max(repel.length(), minimum);
      if (clickDistance >= radius) {
        return;
      }

      localImpulse.copy(repel).normalize();
      inverseMatrix.copy(parent.matrixWorld).invert();
      localImpulse.transformDirection(inverseMatrix);
      localImpulse.multiplyScalar(
        (radius - clickDistance) * strength * pointerRef.current.impulse,
      );
      localPosition.add(localImpulse);
    };

    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    let frameId = 0;
    const render = () => {
      const elapsed = clock.getElapsedTime();
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollJourney = docHeight > 0 ? window.scrollY / docHeight : progressRef.current;
      const journey = clamp(scrollJourney, 0, 1);
      smoothJourney += (journey - smoothJourney) * 0.06;

      const phase = phasePalette[phaseRef.current] ?? phasePalette.intro;
      desiredKey.set(phase.key);
      desiredFill.set(phase.fill);
      desiredFog.set(phase.fog);

      keyLight.color.lerp(desiredKey, 0.05);
      fillLight.color.lerp(desiredFill, 0.05);
      beamLight.color.lerp(desiredKey, 0.05);
      scene.fog.color.lerp(desiredFog, 0.04);

      const targetPosition = interpolatePath(smoothJourney, "position");
      const targetLookAt = interpolatePath(smoothJourney, "lookAt");
      targetPosition.x += Math.sin(elapsed * 0.21) * 0.3;
      targetPosition.y += Math.cos(elapsed * 0.17) * 0.15;
      targetLookAt.x += Math.sin(elapsed * 0.11) * 0.18;

      camera.position.lerp(targetPosition, 0.08);
      lookTarget.lerp(targetLookAt, 0.08);
      camera.lookAt(lookTarget);
      pointerPlane.constant = -mix(camera.position.z - 20, camera.position.z - 14, smoothJourney);
      updatePointerWorld();

      if (!pointerRef.current.hovering) {
        pointerRef.current.x *= 0.92;
        pointerRef.current.y *= 0.92;
      }
      pointerRef.current.impulse *= 0.92;

      introShell.rotation.x = elapsed * 0.2 + smoothJourney * 0.9;
      introShell.rotation.y = elapsed * 0.3 + smoothJourney * 1.2;
      portalOuter.rotation.z = elapsed * 0.09;
      portalInner.rotation.x = elapsed * 0.32;
      portalInner.rotation.y = elapsed * 0.22;
      introGlow.lookAt(camera.position);
      introGlow.material.opacity = 0.24 + Math.sin(elapsed * 1.4) * 0.05;
      introGroup.position.y = Math.sin(elapsed * 0.65) * 0.35;

      introShards.forEach((shard, index) => {
        const orbit = elapsed * 0.22 + index * 0.5;
        const radius = 4 + (index % 3) * 0.65;
        introShardBases[index].set(
          Math.cos(orbit) * radius,
          Math.sin(orbit * 1.4) * 1.6,
          Math.sin(orbit) * 1.1,
        );
        shard.position.copy(introShardBases[index]);
        projected.copy(shard.position).applyMatrix4(introGroup.matrixWorld).project(camera);
        pointerDelta.set(projected.x - pointerRef.current.x, projected.y - pointerRef.current.y);
        const pointerDistance = Math.max(pointerDelta.length(), 0.0001);
        if (pointerDistance < 0.35) {
          const force = (0.35 - pointerDistance) * 1.35;
          shard.position.x += (pointerDelta.x / pointerDistance) * force * 2.1;
          shard.position.y += (pointerDelta.y / pointerDistance) * force * 1.5;
        }
        addClickImpulse(shard.position, introGroup, 10, 0.08, 0.5);
        shard.rotation.x += 0.01;
        shard.rotation.y += 0.015;
      });

      aboutMonoliths.forEach((monolith, index) => {
        monolith.position.y = Math.sin(elapsed * 0.9 + index * 0.8) * 0.4;
        monolith.material.opacity = 0.2 + (index / 10) + Math.sin(elapsed + index) * 0.03;
      });
      aboutHalo.lookAt(camera.position);

      reactorCore.rotation.y = elapsed * 0.24;
      reactorCore.material.emissiveIntensity = 0.9 + Math.sin(elapsed * 1.3) * 0.2;
      skillRings.forEach((ring, index) => {
        ring.rotation.z += 0.002 + index * 0.0012;
      });
      skillNodes.forEach((node, index) => {
        const angle = elapsed * (0.38 + index * 0.015) + index;
        const radius = 3 + (index % 3) * 1.1;
        skillNodeBases[index].set(
          Math.cos(angle) * radius,
          Math.sin(angle * 1.3) * 1.4,
          Math.sin(angle) * (1.6 + index * 0.08),
        );
        node.position.copy(skillNodeBases[index]);
        projected.copy(node.position).applyMatrix4(skillsGroup.matrixWorld).project(camera);
        pointerDelta.set(projected.x - pointerRef.current.x, projected.y - pointerRef.current.y);
        const pointerDistance = Math.max(pointerDelta.length(), 0.0001);
        if (pointerDistance < 0.28) {
          const force = (0.28 - pointerDistance) * 1.8;
          node.position.x += (pointerDelta.x / pointerDistance) * force * 2.2;
          node.position.y += (pointerDelta.y / pointerDistance) * force * 1.6;
        }
      });

      missionPlatform.rotation.y = elapsed * 0.04;
      missionGlow.material.opacity = 0.12 + Math.sin(elapsed * 1.8) * 0.03;
      capsules.forEach((capsule, index) => {
        capsule.position.copy(capsuleBases[index]);
        capsule.position.y += Math.sin(elapsed * 1.1 + index * 0.7) * 0.5;
        projected.copy(capsule.position).applyMatrix4(projectsGroup.matrixWorld).project(camera);
        pointerDelta.set(projected.x - pointerRef.current.x, projected.y - pointerRef.current.y);
        const pointerDistance = Math.max(pointerDelta.length(), 0.0001);
        if (pointerDistance < 0.34) {
          const force = (0.34 - pointerDistance) * 1.5;
          capsule.position.x += (pointerDelta.x / pointerDistance) * force * 1.8;
          capsule.position.y += (pointerDelta.y / pointerDistance) * force * 1.1;
        }
        addClickImpulse(capsule.position, projectsGroup, 12, 0.06, 0.6);
        capsule.rotation.y = elapsed * (0.25 + index * 0.06);
      });

      experienceColumns.forEach((column, index) => {
        column.scale.y = 0.92 + Math.sin(elapsed * 1.2 + index) * 0.08;
        column.material.opacity = 0.34 + (index / 20) + Math.sin(elapsed + index) * 0.03;
      });
      experienceBridge.rotation.z = 1.08 + Math.sin(elapsed * 0.5) * 0.08;

      contactBeam.material.opacity = 0.24 + Math.sin(elapsed * 1.6) * 0.08;
      contactBeam.scale.y = 0.94 + Math.sin(elapsed * 1.1) * 0.1;
      contactGlow.lookAt(camera.position);
      contactGlow.material.opacity = 0.22 + Math.sin(elapsed * 1.3) * 0.05;
      contactRings.forEach((ring, index) => {
        ring.rotation.z += 0.003 + index * 0.0014;
        ring.rotation.y += 0.001 + index * 0.0008;
      });

      reactiveMotes.forEach((mote, index) => {
        const base = mote.base;
        mote.mesh.position.x = base.x + Math.sin(elapsed * 0.8 + mote.noise) * 0.3;
        mote.mesh.position.y = base.y + Math.cos(elapsed * 0.7 + mote.noise) * 0.24;
        mote.mesh.position.z = base.z + Math.sin(elapsed * 0.45 + index) * 0.18;

        projected.copy(mote.mesh.position).project(camera);
        pointerDelta.set(projected.x - pointerRef.current.x, projected.y - pointerRef.current.y);
        const hoverDistance = Math.max(pointerDelta.length(), 0.0001);

        if (hoverDistance < 0.26) {
          const strength = (0.26 - hoverDistance) * 0.02;
          mote.velocity.x += (pointerDelta.x / hoverDistance) * strength;
          mote.velocity.y += (pointerDelta.y / hoverDistance) * strength;
        }

        if (pointerRef.current.impulse > 0.05) {
          repel.copy(mote.mesh.position).sub(clickOrigin);
          const clickDistance = Math.max(repel.length(), 0.3);
          if (clickDistance < 11) {
            mote.velocity.add(
              repel.normalize().multiplyScalar((11 - clickDistance) * 0.012 * pointerRef.current.impulse),
            );
          }
        }

        mote.velocity.multiplyScalar(0.92);
        mote.mesh.position.add(mote.velocity);
        mote.mesh.scale.setScalar(0.85 + pointerRef.current.impulse * 0.45);
        mote.mesh.material.opacity = 0.48 + (0.26 - Math.min(hoverDistance, 0.26)) * 0.9;
      });

      floor.material.opacity = 0.1 + smoothJourney * 0.05;
      stars.rotation.y = elapsed * 0.01;
      stars.rotation.x = Math.sin(elapsed * 0.05) * 0.05;

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleClick);
    frameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
      mount.removeChild(renderer.domElement);

      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          disposeMaterial(object.material);
        }
      });

      textures.forEach((texture) => texture.dispose());
      reactiveGeometry.dispose();
      reactiveMotes.forEach((mote) => mote.mesh.material.dispose());
      starsGeometry.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="scene-canvas" aria-hidden="true" />;
}
