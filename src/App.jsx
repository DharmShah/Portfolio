import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sky, Sparkles } from "@react-three/drei";
import {
  FaArrowUp,
  FaBriefcase,
  FaCode,
  FaEnvelope,
  FaGithub,
  FaGraduationCap,
  FaLinkedin,
  FaPhone,
} from "react-icons/fa";
import * as THREE from "three";
import "./App.css";

const PROJECTS = [
  {
    title: "E-Waiter",
    description:
      "A complete role-based restaurant management system with User, Waiter, Admin, and Chef panels. Features include table booking, order management, billing, daily revenue calculation, and filtered account reports.",
    tech: "PHP, CodeIgniter",
    link: "https://github.com/DharmShah/E-Waiter2.0.git",
  },
  {
    title: "Resume Builder",
    description:
      "A static resume builder platform focused on creating ATS-friendly and corporate-standard resumes. Includes structured resume templates and simple customization to improve resume presentation and formatting.",
    tech: "React",
    link: "https://github.com/DharmShah/ResumeBuilder.git",
  },
  {
    title: "ChatBot Platform",
    description:
      "An AI-powered chatbot system supporting plain text input, voice-to-text, file upload, and image upload. Implemented using Retrieval-Augmented Generation (RAG), OCR, APIs, and Whisper for intelligent and context-aware responses.",
    tech: "React (Frontend), Python Flask (Backend), Vector Database",
    link: "https://github.com/DharmShah/ChatBot.git",
  },
  {
    title: "AI Detector and Humanizer Chatbot",
    description:
      "A chatbot that analyzes content to estimate AI-generated versus human-written text and converts AI-generated content into more natural, human-like language using LLMs, agents, and prompt engineering techniques.",
    tech: "LLMs, Agents, Prompt Engineering",
    link: "https://github.com/DharmShah/AI_Detector_Humanizer.git",
  },
];

const SKILL_GROUPS = [
  {
    title: "Programming Languages",
    items: ["Python", "Java", "JavaScript", "C#", "PHP"],
  },
  {
    title: "Frameworks and Libraries",
    items: [
      "Django",
      "Flask",
      "FastAPI",
      "Spring Boot",
      "React",
      "React Native",
      "CodeIgniter",
      "Laravel",
    ],
  },
  {
    title: "Databases",
    items: ["MySQL", "MongoDB", "MyAdmin (XAMPP)"],
  },
  {
    title: "Generative AI and ML Tools",
    items: [
      "LangChain",
      "LangGraph",
      "LLM Agents",
      "NumPy",
      "Pandas",
      "Scikit-learn",
      "Matplotlib",
      "Seaborn",
    ],
  },
];

const CONTACTS = [
  {
    label: "GitHub",
    value: "github.com/DharmShah",
    href: "https://github.com/DharmShah",
    icon: <FaGithub aria-hidden="true" />,
  },
  {
    label: "LinkedIn",
    value: "in.linkedin.com/in/dharmgautamshah",
    href: "https://in.linkedin.com/in/dharmgautamshah",
    icon: <FaLinkedin aria-hidden="true" />,
  },
  {
    label: "LeetCode",
    value: "leetcode.com/u/DharmShah",
    href: "https://leetcode.com/u/DharmShah/",
    icon: <FaCode aria-hidden="true" />,
  },
  {
    label: "Email",
    value: "dharmshah2004@gmail.com",
    href: "mailto:dharmshah2004@gmail.com",
    icon: <FaEnvelope aria-hidden="true" />,
  },
  {
    label: "Phone",
    value: "+91 9409553510",
    href: "tel:+919409553510",
    icon: <FaPhone aria-hidden="true" />,
  },
];

const PRIMARY_TERRAIN = {
  size: 26,
  segments: 240,
  peakHeight: 8.2,
  ridgeHeight: 2.4,
  detailHeight: 0.95,
  skirtDepth: 3.6,
  radius: 0.95,
};

const RIDGE_TERRAINS = [
  {
    size: 42,
    segments: 160,
    peakHeight: 4.8,
    ridgeHeight: 1.8,
    detailHeight: 0.7,
    skirtDepth: 2,
    radius: 1.15,
    position: [-8, -4.5, -14],
    rotation: [0, -0.4, 0],
  },
  {
    size: 36,
    segments: 150,
    peakHeight: 4.2,
    ridgeHeight: 1.4,
    detailHeight: 0.6,
    skirtDepth: 1.6,
    radius: 1.08,
    position: [10, -4.8, -18],
    rotation: [0, 0.3, 0],
  },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function smoothstep(min, max, value) {
  const x = clamp((value - min) / (max - min), 0, 1);
  return x * x * (3 - 2 * x);
}

function sampleMountainHeight(x, z, config) {
  const radialDistance = Math.sqrt(x * x + z * z) / (config.size * 0.5);
  const falloff = Math.max(
    0,
    1 - Math.pow(radialDistance / config.radius, 1.8),
  );
  const ridgeWave =
    Math.sin(x * 0.36) * 0.65 +
    Math.cos(z * 0.31) * 0.5 +
    Math.sin((x + z) * 0.24) * 0.35 +
    Math.cos((x - z) * 0.18) * 0.22;
  const sharpPeak =
    Math.exp(-((x * 0.16) ** 2 + (z * 0.11) ** 2)) +
    Math.exp(-(((x + 2.2) * 0.2) ** 2 + ((z - 1.6) * 0.18) ** 2)) * 0.45;
  const ravine = Math.sin((x - z) * 0.12) * 0.6 * (1 - falloff);
  const detail =
    Math.sin(x * 1.2) * Math.cos(z * 1.15) * 0.2 +
    Math.sin((x + z) * 0.95) * 0.12;

  const plateau = Math.pow(falloff, 1.15) * config.peakHeight;
  const ridges = ridgeWave * config.ridgeHeight * falloff;
  const microDetail = detail * config.detailHeight * falloff;
  const skirt = -Math.pow(1 - falloff, 2) * config.skirtDepth;

  return plateau + sharpPeak * 2.6 + ridges + microDetail + ravine + skirt;
}

function createMountainGeometry(config) {
  const geometry = new THREE.PlaneGeometry(
    config.size,
    config.size,
    config.segments,
    config.segments,
  );
  geometry.rotateX(-Math.PI / 2);

  const positions = geometry.attributes.position;
  const colors = [];
  const color = new THREE.Color();

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const z = positions.getZ(index);
    const height = sampleMountainHeight(x, z, config);
    positions.setY(index, height);

    if (height > 7) {
      color.setRGB(0.97, 0.98, 1);
    } else if (height > 5.6) {
      color.setRGB(0.72, 0.74, 0.77);
    } else if (height > 3.4) {
      color.setRGB(0.47, 0.43, 0.39);
    } else if (height > 1.4) {
      color.setRGB(0.37, 0.39, 0.25);
    } else {
      color.setRGB(0.23, 0.2, 0.17);
    }

    const lightnessShift = clamp((x + z) * 0.003, -0.08, 0.08);
    color.offsetHSL(0, 0, lightnessShift);
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function MountainMesh({
  config,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) {
  const geometry = useMemo(() => createMountainGeometry(config), [config]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh
      geometry={geometry}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <meshStandardMaterial
        vertexColors
        roughness={0.96}
        metalness={0.04}
        envMapIntensity={0.35}
      />
    </mesh>
  );
}

function TreeField() {
  const trees = useMemo(() => {
    const items = [];

    for (let index = 0; index < 70; index += 1) {
      const angle = index * 0.37 + (index % 5) * 0.19;
      const radius = 5.6 + (index % 9) * 0.52 + (index % 3) * 0.28;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const terrainHeight = sampleMountainHeight(x, z, PRIMARY_TERRAIN) - 2.1;
      const scale = 0.55 + (index % 4) * 0.14;

      items.push({
        position: [x, terrainHeight, z],
        scale,
        rotation: angle + Math.PI,
      });
    }

    return items;
  }, []);

  return (
    <group>
      {trees.map((tree, index) => (
        <group
          key={`tree-${index}`}
          position={tree.position}
          rotation={[0, tree.rotation, 0]}
          scale={tree.scale}
        >
          <mesh position={[0, 0.24, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.48, 8]} />
            <meshStandardMaterial color="#4a3428" roughness={1} />
          </mesh>
          <mesh position={[0, 0.74, 0]}>
            <coneGeometry args={[0.45, 0.92, 9]} />
            <meshStandardMaterial color="#263425" roughness={0.92} />
          </mesh>
          <mesh position={[0, 1.04, 0]}>
            <coneGeometry args={[0.34, 0.72, 9]} />
            <meshStandardMaterial color="#314230" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CloudBank() {
  const cloudGroups = useMemo(
    () => [
      [-6, 8.5, -7, 1.1],
      [-1, 9.2, -10, 1.4],
      [4.8, 8.7, -6.5, 1],
      [8.6, 9.4, -11.2, 1.3],
    ],
    [],
  );

  return (
    <group>
      {cloudGroups.map(([x, y, z, scale], index) => (
        <Float
          key={`cloud-${index}`}
          speed={0.45 + index * 0.12}
          rotationIntensity={0.06}
          floatIntensity={0.22}
        >
          <group position={[x, y, z]} scale={scale}>
            <mesh position={[-0.8, 0, 0]}>
              <sphereGeometry args={[1.15, 24, 24]} />
              <meshStandardMaterial
                color="#f5efe6"
                roughness={1}
                transparent
                opacity={0.86}
              />
            </mesh>
            <mesh position={[0.2, 0.2, 0.3]}>
              <sphereGeometry args={[1.45, 24, 24]} />
              <meshStandardMaterial
                color="#fff7ec"
                roughness={1}
                transparent
                opacity={0.9}
              />
            </mesh>
            <mesh position={[1.3, -0.1, 0]}>
              <sphereGeometry args={[1.05, 24, 24]} />
              <meshStandardMaterial
                color="#efe8de"
                roughness={1}
                transparent
                opacity={0.82}
              />
            </mesh>
          </group>
        </Float>
      ))}
    </group>
  );
}

function MountainWorld({ scrollProgressRef }) {
  const rig = useRef(null);
  const drift = useRef(null);
  const targetYaw = useRef(0);
  const { camera, size } = useThree();

  useEffect(() => {
    const handleWheel = (event) => {
      const dominantDelta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;

      if (Math.abs(dominantDelta) < 2) {
        return;
      }

      targetYaw.current += clamp(dominantDelta * 0.0035, -0.55, 0.55);
    };

    window.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useFrame((state, delta) => {
    const progress = scrollProgressRef.current;
    const introProgress = smoothstep(0, 0.22, progress);
    const revealProgress = smoothstep(0.12, 0.95, progress);
    const cinematicSpin = progress * Math.PI * 1.75;
    const targetRotation = targetYaw.current + cinematicSpin;
    const isMobile = size.width < 768;
    const isTablet = size.width >= 768 && size.width < 1100;

    if (rig.current) {
      rig.current.rotation.y = THREE.MathUtils.lerp(
        rig.current.rotation.y,
        targetRotation,
        0.05,
      );
      rig.current.position.y = THREE.MathUtils.lerp(
        -2.7,
        -5.05,
        revealProgress,
      );
      rig.current.position.x = Math.sin(progress * Math.PI * 1.1) * 0.45;
      const rigScale = isMobile ? 0.88 : isTablet ? 0.94 : 1;
      rig.current.scale.x = THREE.MathUtils.lerp(
        rig.current.scale.x,
        rigScale,
        0.08,
      );
      rig.current.scale.y = THREE.MathUtils.lerp(
        rig.current.scale.y,
        rigScale,
        0.08,
      );
      rig.current.scale.z = THREE.MathUtils.lerp(
        rig.current.scale.z,
        rigScale,
        0.08,
      );
    }

    if (drift.current) {
      drift.current.rotation.y += delta * 0.03;
    }

    const startY = isMobile ? 5.8 : isTablet ? 5.1 : 4.6;
    const endY = isMobile ? 7.3 : isTablet ? 6.8 : 6.35;
    const startZ = isMobile ? 14.2 : isTablet ? 12.8 : 11.4;
    const endZ = isMobile ? 15.6 : isTablet ? 14.5 : 13.1;
    const desiredY = THREE.MathUtils.lerp(startY, endY, revealProgress);
    const desiredZ = THREE.MathUtils.lerp(startZ, endZ, revealProgress);
    const desiredX =
      Math.sin(introProgress * Math.PI) * (isMobile ? 0.18 : 0.32);
    const lookAtY = THREE.MathUtils.lerp(
      isMobile ? 1.15 : 1.35,
      isMobile ? 2.2 : 2.55,
      revealProgress,
    );

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, desiredX, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, desiredY, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, desiredZ, 0.05);
    camera.lookAt(0, lookAtY, 0);
  });

  return (
    <group ref={drift}>
      <Sky
        distance={450000}
        sunPosition={[3, 1.15, -4]}
        inclination={0.55}
        azimuth={0.2}
        turbidity={6}
        mieCoefficient={0.012}
        mieDirectionalG={0.86}
        rayleigh={1.15}
      />
      <fog attach="fog" args={["#bfd0dd", 18, 56]} />
      <ambientLight intensity={1.25} color="#e7edf2" />
      <hemisphereLight intensity={0.85} groundColor="#564235" color="#f7f4ea" />
      <directionalLight
        position={[8, 14, 6]}
        intensity={2.3}
        color="#fff4d1"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <Sparkles
        count={120}
        scale={[28, 14, 28]}
        size={1.4}
        speed={0.18}
        color="#f8f2e8"
      />

      <group ref={rig}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.8, 0]}>
          <circleGeometry args={[17, 80]} />
          <meshStandardMaterial
            color="#5e6f67"
            roughness={1}
            metalness={0.04}
          />
        </mesh>

        <mesh position={[0, -4.55, 0]}>
          <cylinderGeometry args={[8.4, 10.2, 1.25, 48]} />
          <meshStandardMaterial
            color="#685446"
            roughness={0.96}
            metalness={0.02}
          />
        </mesh>

        <MountainMesh config={PRIMARY_TERRAIN} position={[0, -2.1, 0]} />
        <TreeField />
        <CloudBank />

        {RIDGE_TERRAINS.map((terrain, index) => (
          <MountainMesh
            key={`ridge-${index}`}
            config={terrain}
            position={terrain.position}
            rotation={terrain.rotation}
            scale={1.05}
          />
        ))}
      </group>
    </group>
  );
}

function App() {
  const scrollProgressRef = useRef(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      );
      scrollProgressRef.current = clamp(window.scrollY / maxScroll, 0, 1);
    };

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, []);

  const scrollToSection = (sectionId, block = "start") => {
    const target = document.getElementById(sectionId);

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block,
      inline: "nearest",
    });
  };

  return (
    <div className="app">
      <Canvas
        camera={{ position: [0, 4.6, 11.4], fov: 43 }}
        dpr={[1, 2]}
        shadows
      >
        <color attach="background" args={["#d3dee7"]} />
        <MountainWorld scrollProgressRef={scrollProgressRef} />
      </Canvas>

      <div className="scroll-root">
              <section className="panel hero" id="top">
                <div className="hero-grid">
                  <div className="hero-copy">
                    <p className="eyebrow">Mountain Portfolio</p>
                    <h1 className="title">Dharm Gautam Shah</h1>
                    <p className="subtitle">
                      A 360-degree mountain portfolio that opens with a full
                      alpine view and then unfolds into projects, skills,
                      education, and contact details.
                    </p>
                    <div className="meta-row">
                      <span className="meta-chip">Name: Dharm Gautam Shah</span>
                      <span className="meta-chip">DOB: 15/11/2004</span>
                      <span className="meta-chip">MCA (Generative AI)</span>
                    </div>
                    <div className="cta-row">
                      <button
                        className="cta"
                        type="button"
                        onClick={() => scrollToSection("projects")}
                      >
                        Explore Projects
                      </button>
                      <button
                        className="cta ghost"
                        type="button"
                        onClick={() => scrollToSection("contact", "start")}
                      >
                        Contact Details
                      </button>
                    </div>
                    <div className="signal">
                      <span /> Scroll in either direction to orbit the mountain
                      panorama, then continue down into the portfolio.
                    </div>
                  </div>
                  <div className="hero-side">
                    <div className="altitude-card">
                      <p className="eyebrow small">Viewpoint</p>
                      <p>
                        A cinematic portfolio built around a scroll-driven
                        mountain, blending software development, generative AI,
                        and immersive web design.
                      </p>
                    </div>
                    <div className="hero-tags">
                      <div className="tag">React</div>
                      <div className="tag">Three.js</div>
                      <div className="tag">Generative AI</div>
                      <div className="tag">Software Development</div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="panel" id="profile">
                <div className="panel-inner split-panel">
                  <div>
                    <p className="eyebrow">Profile Snapshot</p>
                    <h2 className="section-title">
                      Academic focus with product-building experience.
                    </h2>
                    <p className="section-copy">
                      I am currently pursuing MCA in Generative AI after
                      completing B.Sc. IT in Software Development, with hands-on
                      work across AI systems, web products, and client-facing
                      delivery.
                    </p>
                  </div>
                  <div className="overview-grid">
                    <article className="mini-card">
                      <FaGraduationCap aria-hidden="true" />
                      <h3>Education</h3>
                      <p>Gujarat University and Alliance University</p>
                    </article>
                    <article className="mini-card">
                      <FaBriefcase aria-hidden="true" />
                      <h3>Experience</h3>
                      <p>Internship and freelance web development</p>
                    </article>
                    <article className="mini-card">
                      <FaCode aria-hidden="true" />
                      <h3>Core Domain</h3>
                      <p>
                        Generative AI, backend services, full-stack web apps
                      </p>
                    </article>
                  </div>
                </div>
              </section>

              <section className="panel" id="education">
                <div className="panel-inner">
                  <p className="eyebrow">Education</p>
                  <h2 className="section-title">
                    Focused on software foundations and generative intelligence.
                  </h2>
                  <div className="card-grid">
                    <article className="card">
                      <h3>Graduation</h3>
                      <p>B.Sc. IT (Software Development), Gujarat University</p>
                      <span className="card-meta">2022 - 2025</span>
                    </article>
                    <article className="card">
                      <h3>Post-Graduation</h3>
                      <p>MCA (Generative AI), Alliance University</p>
                      <span className="card-meta">2025 - 2027</span>
                    </article>
                  </div>
                </div>
              </section>

              <section className="panel" id="projects">
                <div className="panel-inner">
                  <p className="eyebrow">Projects</p>
                  <h2 className="section-title">
                    Projects built for operations, AI workflows, and practical
                    delivery.
                  </h2>
                  <div className="card-grid">
                    {PROJECTS.map((project) => (
                      <article
                        className="card project-card"
                        key={project.title}
                      >
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                        <div className="card-actions">
                          <span className="card-meta">{project.tech}</span>
                          <a
                            className="link"
                            href={project.link}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Project Link
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section className="panel" id="skills">
                <div className="panel-inner">
                  <p className="eyebrow">Skills</p>
                  <h2 className="section-title">
                    Tools across backend systems, interfaces, and intelligent
                    applications.
                  </h2>
                  <div className="skill-grid">
                    {SKILL_GROUPS.map((group) => (
                      <article className="card skill-card" key={group.title}>
                        <h3>{group.title}</h3>
                        <ul className="pill-list">
                          {group.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section className="panel" id="experience">
                <div className="panel-inner">
                  <p className="eyebrow">Experience</p>
                  <h2 className="section-title">
                    Hands-on work in generative AI and client-focused delivery.
                  </h2>
                  <div className="card-grid">
                    <article className="card">
                      <h3>Internship</h3>
                      <p>
                        Generative AI Developer Intern (Summer Internship),
                        Let&apos;s Enkindle
                      </p>
                      <span className="card-meta">
                        Worked on LLM-based backend services,
                        Retrieval-Augmented Generation pipelines, embeddings,
                        vector databases, and prompt engineering.
                      </span>
                    </article>
                    <article className="card">
                      <h3>Freelance Web Developer</h3>
                      <p>
                        Designed and developed a static real estate website for
                        a client with responsive layout, structured navigation,
                        and a clean user interface aligned with business
                        requirements.
                      </p>
                      <span className="card-meta">Freelance Experience</span>
                    </article>
                  </div>
                </div>
              </section>

              <section className="panel footer" id="contact">
                <div className="panel-inner">
                  <p className="eyebrow">Contact</p>
                  <h2 className="section-title">
                    Let&apos;s connect for software, AI, and product-focused
                    work.
                  </h2>
                  <div className="contact-grid">
                    {CONTACTS.map((contact) => (
                      <a
                        className="contact-card"
                        href={contact.href}
                        target={
                          contact.href.startsWith("http") ? "_blank" : undefined
                        }
                        rel={
                          contact.href.startsWith("http")
                            ? "noreferrer"
                            : undefined
                        }
                        key={contact.label}
                      >
                        <span className="contact-icon">{contact.icon}</span>
                        <div>
                          <p className="contact-label">{contact.label}</p>
                          <span className="contact-link">{contact.value}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                  <div className="footer-actions">
                    <button
                      className="cta"
                      type="button"
                      onClick={() => scrollToSection("top")}
                    >
                      <FaArrowUp aria-hidden="true" /> Back to Top
                    </button>
                    <button
                      className="cta ghost"
                      type="button"
                      onClick={() => scrollToSection("profile")}
                    >
                      Return to Profile
                    </button>
                  </div>
                </div>
              </section>
      </div>
    </div>
  );
}

export default App;
