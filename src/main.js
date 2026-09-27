import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { registerSW } from "virtual:pwa-register";

import "./style.css";

/* =========================================================
   PWA
========================================================= */

try {
  registerSW({
    immediate: true,
    onRegistered(registration) {
      if (registration) {
        console.log("CGI Studio PWA registered.");
      }
    },
    onRegisterError(error) {
      console.warn("PWA registration error:", error);
    }
  });
} catch (error) {
  console.warn("PWA registration unavailable:", error);
}


/* =========================================================
   STORAGE
========================================================= */

const STORAGE = {
  projects: "cgi-studio-projects",
  settings: "cgi-studio-settings",
  gallery: "cgi-studio-gallery",
  currentProject: "cgi-studio-current-project"
};


/* =========================================================
   STATE
========================================================= */

const S = {
  scene: null,
  camera: null,
  renderer: null,
  controls: null,

  grid: null,

  objects: [],
  selected: null,

  wire: false,
  playing: false,

  currentProjectId: null,

  projects: [],
  gallery: [],

  settings: {
    reduceMotion: false,
    showGrid: true,
    autoSave: true
  },

  lastTime: 0
};


/* =========================================================
   DATA
========================================================= */

const notes = [
  {
    title: "What is CGI?",
    text: "Computer-generated imagery uses computers to create or manipulate visual content.",
    tag: "Fundamentals"
  },
  {
    title: "3D Coordinates",
    text: "Three-dimensional scenes use X, Y and Z axes to describe position.",
    tag: "3D"
  },
  {
    title: "Polygon Modeling",
    text: "Polygon modeling builds surfaces from vertices, edges and faces.",
    tag: "Modeling"
  },
  {
    title: "Materials",
    text: "Materials describe how surfaces interact with light.",
    tag: "Materials"
  },
  {
    title: "Lighting",
    text: "Lighting establishes mood, visibility, depth and visual hierarchy.",
    tag: "Lighting"
  },
  {
    title: "Animation",
    text: "Animation creates motion by changing object properties over time.",
    tag: "Animation"
  },
  {
    title: "Rendering",
    text: "Rendering converts a 3D scene into an image or sequence of images.",
    tag: "Rendering"
  },
  {
    title: "Compositing",
    text: "Compositing combines visual elements into a final image.",
    tag: "VFX"
  }
];


const history = [
  {
    year: "1950s",
    title: "Early Computer Graphics",
    text: "Researchers began using computers to create mathematical and graphical imagery."
  },
  {
    year: "1960s",
    title: "Interactive Graphics",
    text: "Interactive display systems helped establish computer graphics as a practical field."
  },
  {
    year: "1970s",
    title: "3D Foundations",
    text: "Major advances in 3D geometry, rendering and computer animation emerged."
  },
  {
    year: "1980s",
    title: "CGI Enters Film",
    text: "Computer-generated imagery began appearing more prominently in film and television."
  },
  {
    year: "1990s",
    title: "Digital Production",
    text: "Digital effects, animation and 3D software became increasingly important in production."
  },
  {
    year: "2000s",
    title: "Realistic Rendering",
    text: "Physically based rendering and increasingly powerful GPUs improved realism."
  },
  {
    year: "2010s",
    title: "Real-Time Graphics",
    text: "Real-time engines became increasingly capable of producing cinematic imagery."
  },
  {
    year: "2020s",
    title: "AI + Real-Time Creation",
    text: "AI-assisted creation, virtual production and real-time workflows continue to reshape CGI."
  }
];


const tutorials = [
  {
    title: "Your First 3D Scene",
    level: "Beginner",
    duration: "20 min",
    type: "Tutorial",
    text: "Learn the basic relationship between objects, cameras and lights."
  },
  {
    title: "Build a Human Character",
    level: "Beginner",
    duration: "30 min",
    type: "Challenge",
    text: "Create and inspect a simple low-poly human character."
  },
  {
    title: "Lighting a Scene",
    level: "Beginner",
    duration: "25 min",
    type: "Tutorial",
    text: "Experiment with key, fill and environment lighting."
  },
  {
    title: "Materials Challenge",
    level: "Intermediate",
    duration: "35 min",
    type: "Challenge",
    text: "Create contrasting surfaces using roughness and metallic properties."
  },
  {
    title: "Animation Basics",
    level: "Intermediate",
    duration: "40 min",
    type: "Tutorial",
    text: "Understand keyframes, timing and looping motion."
  },
  {
    title: "Create a Sci-Fi Environment",
    level: "Intermediate",
    duration: "60 min",
    type: "Challenge",
    text: "Design a futuristic environment using simple geometric forms."
  }
];


const future = [
  {
    title: "AI-Assisted CGI",
    text: "AI tools can assist with ideation, asset generation, animation, compositing and workflow automation."
  },
  {
    title: "Real-Time Rendering",
    text: "Modern GPUs allow increasingly complex visual scenes to be rendered interactively."
  },
  {
    title: "Virtual Production",
    text: "LED stages and real-time environments allow filmmakers to combine physical and digital production."
  },
  {
    title: "Procedural Generation",
    text: "Procedural systems can create complex environments, materials and effects from rules and parameters."
  },
  {
    title: "Digital Humans",
    text: "Character technology continues to advance through better modeling, rigging, simulation and rendering."
  },
  {
    title: "Immersive Worlds",
    text: "VR, AR and spatial computing are creating new contexts for 3D experiences."
  }
];


const roadmap = [
  {
    phase: "01",
    title: "Understand 3D",
    text: "Learn coordinates, geometry, cameras, lights and basic scene structure."
  },
  {
    phase: "02",
    title: "Learn Modeling",
    text: "Practice creating objects from primitives and progressively more complex topology."
  },
  {
    phase: "03",
    title: "Learn Materials",
    text: "Study color, roughness, metalness, transparency and texture mapping."
  },
  {
    phase: "04",
    title: "Learn Lighting",
    text: "Practice key lights, fill lights, rim lights, shadows and environment lighting."
  },
  {
    phase: "05",
    title: "Learn Animation",
    text: "Explore keyframes, timing, interpolation, character movement and simulation."
  },
  {
    phase: "06",
    title: "Learn Rendering",
    text: "Understand resolution, samples, lighting quality, composition and output."
  },
  {
    phase: "07",
    title: "Build Projects",
    text: "Create complete scenes rather than isolated exercises."
  },
  {
    phase: "08",
    title: "Build a Portfolio",
    text: "Select your strongest work and present the process behind each project."
  }
];


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (id) => document.getElementById(id);

function showToast(message) {
  const toast = $("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}


/* =========================================================
   STORAGE HELPERS
========================================================= */

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (!value) return fallback;

    return JSON.parse(value);
  } catch {
    return fallback;
  }
}


function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Storage error:", error);
  }
}


/* =========================================================
   ROUTER
========================================================= */

function route() {
  const requested = location.hash.replace("#", "") || "home";

  const page = $(
    requested
  );

  document.querySelectorAll(".page").forEach((element) => {
    element.classList.remove("active");
  });

  if (page && page.classList.contains("page")) {
    page.classList.add("active");
  } else {
    $("home")?.classList.add("active");
  }

  document.querySelectorAll(".main-nav a").forEach((link) => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#${requested}`
    );
  });

  $("mainNav")?.classList.remove("open");
  $("menuToggle")?.setAttribute("aria-expanded", "false");

  if (requested === "studio") {
    setTimeout(() => {
      resizeRenderer();
    }, 50);
  }

  window.scrollTo({
    top: 0,
    behavior: S.settings.reduceMotion ? "auto" : "smooth"
  });
}


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function initializeNavigation() {
  $("menuToggle")?.addEventListener("click", () => {
    const nav = $("mainNav");

    if (!nav) return;

    const open = nav.classList.toggle("open");

    $("menuToggle").setAttribute(
      "aria-expanded",
      String(open)
    );
  });

  document.querySelectorAll(".main-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      $("mainNav")?.classList.remove("open");
      $("menuToggle")?.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("hashchange", route);
}


/* =========================================================
   NOTES
========================================================= */

function renderNotes(filter = "") {
  const grid = $("notesGrid");

  if (!grid) return;

  const query = filter.trim().toLowerCase();

  const results = notes.filter((note) => {
    return (
      !query ||
      note.title.toLowerCase().includes(query) ||
      note.text.toLowerCase().includes(query) ||
      note.tag.toLowerCase().includes(query)
    );
  });

  grid.innerHTML = results.length
    ? results.map((note) => `
        <article class="note">
          <small>${escapeHtml(note.tag)}</small>
          <h3>${escapeHtml(note.title)}</h3>
          <p>${escapeHtml(note.text)}</p>
        </article>
      `).join("")
    : `
        <article class="card">
          <h3>No notes found</h3>
          <p>Try a different search term.</p>
        </article>
      `;
}


/* =========================================================
   HISTORY
========================================================= */

function renderHistory() {
  const timeline = $("timeline");

  if (!timeline) return;

  timeline.innerHTML = history.map(item => `
    <article class="timeline-item">
      <span class="year">${escapeHtml(item.year)}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.text)}</p>
    </article>
  `).join("");
}


/* =========================================================
   TUTORIALS
========================================================= */

function renderTutorials() {
  const grid = $("tutorialGrid");

  if (!grid) return;

  grid.innerHTML = tutorials.map(item => `
    <article class="tutorial">
      <div class="eyebrow">${escapeHtml(item.type)}</div>

      <h3>${escapeHtml(item.title)}</h3>

      <p>${escapeHtml(item.text)}</p>

      <div class="tutorial-meta">
        <span>${escapeHtml(item.level)}</span>
        <span>${escapeHtml(item.duration)}</span>
      </div>
    </article>
  `).join("");
}


/* =========================================================
   FUTURE
========================================================= */

function renderFuture() {
  const grid = $("futureGrid");

  if (!grid) return;

  grid.innerHTML = future.map(item => `
    <article class="future">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.text)}</p>
    </article>
  `).join("");
}


/* =========================================================
   BEGINNER GUIDE
========================================================= */

function renderRoadmap() {
  const roadmapElement = $("roadmap");

  if (!roadmapElement) return;

  roadmapElement.innerHTML = roadmap.map(item => `
    <article class="roadmap-item">
      <div class="phase">${escapeHtml(item.phase)}</div>

      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.text)}</p>
      </div>
    </article>
  `).join("");
}


/* =========================================================
   THREE.JS INITIALIZATION
========================================================= */

function initializeThree() {
  const container = $("scene-container");

  if (!container) return;

  S.scene = new THREE.Scene();

  S.scene.background = new THREE.Color(0x050812);

  S.camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );

  S.camera.position.set(7, 5, 9);

  S.renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true
  });

  S.renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );

  S.renderer.setSize(
    container.clientWidth,
    container.clientHeight
  );

  S.renderer.shadowMap.enabled = true;
  S.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.innerHTML = "";
  container.appendChild(S.renderer.domElement);


  S.controls = new OrbitControls(
    S.camera,
    S.renderer.domElement
  );

  S.controls.enableDamping = true;
  S.controls.target.set(0, 0.5, 0);


  /* Lights */

  const ambient = new THREE.HemisphereLight(
    0x9fdcff,
    0x080812,
    2.2
  );

  S.scene.add(ambient);


  const keyLight = new THREE.DirectionalLight(
    0xffffff,
    3
  );

  keyLight.position.set(5, 9, 6);
  keyLight.castShadow = true;

  S.scene.add(keyLight);


  const rimLight = new THREE.PointLight(
    0x22d3ee,
    35,
    30
  );

  rimLight.position.set(-5, 4, -5);

  S.scene.add(rimLight);


  const purpleLight = new THREE.PointLight(
    0xa855f7,
    30,
    25
  );

  purpleLight.position.set(5, 2, -5);

  S.scene.add(purpleLight);


  /* Ground */

  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a1020,
    roughness: 0.85,
    metalness: 0.1
  });

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    groundMaterial
  );

  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.5;

  ground.receiveShadow = true;

  ground.userData.environment = true;

  S.scene.add(ground);


  /* Grid */

  S.grid = new THREE.GridHelper(
    30,
    30,
    0x22d3ee,
    0x172033
  );

  S.grid.position.y = -1.49;

  S.scene.add(S.grid);


  /* Starter object */

  createObject("cube", {
    x: 0,
    y: -0.5,
    z: 0,
    name: "Starter Cube"
  });


  resizeRenderer();

  animate();
}


/* =========================================================
   HUMAN CHARACTER
========================================================= */

function createHumanCharacter(data = {}) {
  const root = new THREE.Group();

  root.name = data.name || "Human Character";

  /*
   * Important:
   * The root is positioned at y = 0.68 so the feet sit
   * naturally on the Studio ground at approximately -1.5.
   */

  root.position.set(
    data.x ?? 0,
    data.y ?? 0.68,
    data.z ?? 0
  );

  root.rotation.y = data.rotationY ?? 0;

  root.userData.type = "Human";
  root.userData.selectableRoot = true;
  root.userData.character = true;


  const skin = new THREE.MeshStandardMaterial({
    color: 0xf0b58e,
    roughness: 0.65
  });

  const shirt = new THREE.MeshStandardMaterial({
    color: data.color ?? 0x2563eb,
    roughness: 0.7
  });

  const pants = new THREE.MeshStandardMaterial({
    color: 0x18243d,
    roughness: 0.75
  });

  const shoes = new THREE.MeshStandardMaterial({
    color: 0x101010,
    roughness: 0.6
  });

  const hair = new THREE.MeshStandardMaterial({
    color: 0x17120f,
    roughness: 0.9
  });

  const eyeWhite = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25
  });

  const pupil = new THREE.MeshStandardMaterial({
    color: 0x050505,
    roughness: 0.2
  });


  function mesh(geometry, material, name) {
    const object = new THREE.Mesh(
      geometry,
      material
    );

    object.name = name;

    object.castShadow = true;
    object.receiveShadow = true;

    return object;
  }


  /* Torso */

  const torso = mesh(
    new THREE.BoxGeometry(1.35, 1.65, 0.72),
    shirt,
    "Torso"
  );

  torso.position.y = 1.55;

  root.add(torso);


  /* Pelvis */

  const pelvis = mesh(
    new THREE.BoxGeometry(1.15, 0.55, 0.68),
    pants,
    "Pelvis"
  );

  pelvis.position.y = 0.55;

  root.add(pelvis);


  /* Neck */

  const neck = mesh(
    new THREE.CylinderGeometry(
      0.22,
      0.22,
      0.32,
      16
    ),
    skin,
    "Neck"
  );

  neck.position.y = 2.52;

  root.add(neck);


  /* Head */

  const head = mesh(
    new THREE.SphereGeometry(
      0.62,
      24,
      18
    ),
    skin,
    "Head"
  );

  head.scale.set(0.92, 1.08, 0.92);
  head.position.y = 3.22;

  root.add(head);


  /* Hair */

  const hairMesh = mesh(
    new THREE.SphereGeometry(
      0.65,
      24,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.58
    ),
    hair,
    "Hair"
  );

  hairMesh.scale.set(0.94, 1.05, 0.94);
  hairMesh.position.y = 3.43;

  root.add(hairMesh);


  /* Eyes */

  [-0.22, 0.22].forEach((x, index) => {
    const eye = mesh(
      new THREE.SphereGeometry(0.105, 16, 12),
      eyeWhite,
      `Eye ${index + 1}`
    );

    eye.position.set(
      x,
      3.25,
      0.57
    );

    root.add(eye);


    const pupilMesh = mesh(
      new THREE.SphereGeometry(0.048, 12, 10),
      pupil,
      `Pupil ${index + 1}`
    );

    pupilMesh.position.set(
      x,
      3.25,
      0.66
    );

    root.add(pupilMesh);
  });


  /* Nose */

  const nose = mesh(
    new THREE.ConeGeometry(
      0.07,
      0.22,
      12
    ),
    skin,
    "Nose"
  );

  nose.rotation.x = Math.PI / 2;

  nose.position.set(
    0,
    3.05,
    0.63
  );

  root.add(nose);


  /* Shoulders / arms */

  const leftShoulder = new THREE.Group();
  leftShoulder.name = "Left Arm";

  leftShoulder.position.set(
    -0.82,
    2.18,
    0
  );

  root.add(leftShoulder);


  const leftUpperArm = mesh(
    new THREE.CapsuleGeometry(
      0.18,
      0.65,
      8,
      12
    ),
    shirt,
    "Left Upper Arm"
  );

  leftUpperArm.position.y = -0.38;

  leftShoulder.add(leftUpperArm);


  const leftElbow = new THREE.Group();

  leftElbow.position.y = -0.76;

  leftShoulder.add(leftElbow);


  const leftLowerArm = mesh(
    new THREE.CapsuleGeometry(
      0.16,
      0.62,
      8,
      12
    ),
    skin,
    "Left Lower Arm"
  );

  leftLowerArm.position.y = -0.34;

  leftElbow.add(leftLowerArm);


  const leftHand = mesh(
    new THREE.SphereGeometry(0.2, 16, 12),
    skin,
    "Left Hand"
  );

  leftHand.position.y = -0.72;

  leftElbow.add(leftHand);


  const rightShoulder = new THREE.Group();

  rightShoulder.name = "Right Arm";

  rightShoulder.position.set(
    0.82,
    2.18,
    0
  );

  root.add(rightShoulder);


  const rightUpperArm = mesh(
    new THREE.CapsuleGeometry(
      0.18,
      0.65,
      8,
      12
    ),
    shirt,
    "Right Upper Arm"
  );

  rightUpperArm.position.y = -0.38;

  rightShoulder.add(rightUpperArm);


  const rightElbow = new THREE.Group();

  rightElbow.position.y = -0.76;

  rightShoulder.add(rightElbow);


  const rightLowerArm = mesh(
    new THREE.CapsuleGeometry(
      0.16,
      0.62,
      8,
      12
    ),
    skin,
    "Right Lower Arm"
  );

  rightLowerArm.position.y = -0.34;

  rightElbow.add(rightLowerArm);


  const rightHand = mesh(
    new THREE.SphereGeometry(0.2, 16, 12),
    skin,
    "Right Hand"
  );

  rightHand.position.y = -0.72;

  rightElbow.add(rightHand);


  /* Legs */

  const leftHip = new THREE.Group();

  leftHip.name = "Left Leg";

  leftHip.position.set(
    -0.34,
    0.3,
    0
  );

  root.add(leftHip);


  const leftThigh = mesh(
    new THREE.CapsuleGeometry(
      0.23,
      0.72,
      8,
      12
    ),
    pants,
    "Left Thigh"
  );

  leftThigh.position.y = -0.48;

  leftHip.add(leftThigh);


  const leftKnee = new THREE.Group();

  leftKnee.position.y = -0.94;

  leftHip.add(leftKnee);


  const leftShin = mesh(
    new THREE.CapsuleGeometry(
      0.18,
      0.75,
      8,
      12
    ),
    pants,
    "Left Shin"
  );

  leftShin.position.y = -0.42;

  leftKnee.add(leftShin);


  const leftFoot = mesh(
    new THREE.BoxGeometry(
      0.42,
      0.22,
      0.72
    ),
    shoes,
    "Left Foot"
  );

  leftFoot.position.set(
    0,
    -0.88,
    0.18
  );

  leftKnee.add(leftFoot);


  const rightHip = new THREE.Group();

  rightHip.name = "Right Leg";

  rightHip.position.set(
    0.34,
    0.3,
    0
  );

  root.add(rightHip);


  const rightThigh = mesh(
    new THREE.CapsuleGeometry(
      0.23,
      0.72,
      8,
      12
    ),
    pants,
    "Right Thigh"
  );

  rightThigh.position.y = -0.48;

  rightHip.add(rightThigh);


  const rightKnee = new THREE.Group();

  rightKnee.position.y = -0.94;

  rightHip.add(rightKnee);


  const rightShin = mesh(
    new THREE.CapsuleGeometry(
      0.18,
      0.75,
      8,
      12
    ),
    pants,
    "Right Shin"
  );

  rightShin.position.y = -0.42;

  rightKnee.add(rightShin);


  const rightFoot = mesh(
    new THREE.BoxGeometry(
      0.42,
      0.22,
      0.72
    ),
    shoes,
    "Right Foot"
  );

  rightFoot.position.set(
    0,
    -0.88,
    0.18
  );

  rightKnee.add(rightFoot);


  root.userData.animation = {
    leftArm: leftShoulder,
    rightArm: rightShoulder,
    leftLeg: leftHip,
    rightLeg: rightHip,
    torso
  };


  root.traverse(child => {
    if (child.isMesh) {
      child.userData.selectableRoot = false;
    }
  });


  return root;
}


/* =========================================================
   PRIMITIVES
========================================================= */

function createPrimitive(type, data = {}) {
  let geometry;

  switch (type) {
    case "sphere":
      geometry = new THREE.SphereGeometry(
        data.size ?? 0.8,
        32,
        20
      );
      break;

    case "cone":
      geometry = new THREE.ConeGeometry(
        data.size ?? 0.8,
        data.height ?? 1.5,
        32
      );
      break;

    case "torus":
      geometry = new THREE.TorusGeometry(
        data.size ?? 0.85,
        data.tube ?? 0.22,
        16,
        48
      );
      break;

    case "cube":
    case "box":
    default:
      geometry = new THREE.BoxGeometry(
        data.width ?? 1.2,
        data.height ?? 1.2,
        data.depth ?? 1.2
      );
      break;
  }


  const material = new THREE.MeshStandardMaterial({
    color: data.color ?? randomColor(),
    roughness: 0.5,
    metalness: 0.15
  });


  const object = new THREE.Mesh(
    geometry,
    material
  );

  object.castShadow = true;
  object.receiveShadow = true;

  object.position.set(
    data.x ?? 0,
    data.y ?? 0,
    data.z ?? 0
  );

  object.rotation.set(
    data.rotationX ?? 0,
    data.rotationY ?? 0,
    data.rotationZ ?? 0
  );

  object.name =
    data.name ||
    `${capitalize(type)} ${S.objects.length + 1}`;

  object.userData.type = capitalize(type);
  object.userData.selectableRoot = true;

  return object;
}


/* =========================================================
   CREATE OBJECT
========================================================= */

function createObject(type, data = {}) {
  if (!S.scene) {
    showToast("3D Studio is still loading.");
    return null;
  }


  let object;


  if (
    type === "human" ||
    type === "character" ||
    type === "human character"
  ) {
    object = createHumanCharacter(data);
  } else {
    object = createPrimitive(type, data);
  }


  if (!object) return null;


  S.scene.add(object);

  S.objects.push(object);

  selectObject(object);

  updateObjectList();

  if (S.settings.autoSave) {
    saveCurrentProject(false);
  }

  return object;
}


/* =========================================================
   SELECTION
========================================================= */

function getSelectableRoot(object) {
  let current = object;

  while (current) {
    if (current.userData?.selectableRoot) {
      return current;
    }

    current = current.parent;
  }

  return null;
}


function selectObject(object) {
  S.selected = object;

  updateObjectList();
  renderProperties();
}


/* =========================================================
   STUDIO CLICK
========================================================= */

function initializeSceneSelection() {
  const container = $("scene-container");

  if (!container) return;


  container.addEventListener("pointerdown", event => {
    if (!S.renderer || !S.camera) return;

    const rect = S.renderer.domElement.getBoundingClientRect();

    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );


    const raycaster = new THREE.Raycaster();

    raycaster.setFromCamera(
      mouse,
      S.camera
    );


    const hits = raycaster.intersectObjects(
      S.objects,
      true
    );


    if (!hits.length) {
      S.selected = null;
      updateObjectList();
      renderProperties();
      return;
    }


    const selected = getSelectableRoot(
      hits[0].object
    );


    if (selected) {
      selectObject(selected);
    }
  });
}


/* =========================================================
   OBJECT LIST
========================================================= */

function updateObjectList() {
  const list = $("objectList");
  const count = $("objectCount");

  if (!list) return;

  if (count) {
    count.textContent = String(S.objects.length);
  }


  if (!S.objects.length) {
    list.innerHTML = `
      <p class="muted">
        No objects in the scene.
      </p>
    `;

    return;
  }


  list.innerHTML = S.objects.map((object, index) => `
    <div
      class="object-item ${S.selected === object ? "selected" : ""}"
      data-object-id="${object.uuid}"
    >
      <span class="object-index">
        ${index + 1}
      </span>

      <span class="object-name">
        ${escapeHtml(object.name)}
      </span>
    </div>
  `).join("");


  list.querySelectorAll(".object-item").forEach(item => {
    item.addEventListener("click", () => {
      const object = S.objects.find(
        candidate =>
          candidate.uuid === item.dataset.objectId
      );

      if (object) {
        selectObject(object);
      }
    });
  });
}


/* =========================================================
   PROPERTIES
========================================================= */

function renderProperties() {
  const panel = $("properties");

  if (!panel) return;


  if (!S.selected) {
    panel.innerHTML = `
      <p class="muted">
        Select an object to edit its properties.
      </p>
    `;

    return;
  }


  const object = S.selected;

  panel.innerHTML = `
    <div class="property">
      <label>Name</label>

      <input
        id="propName"
        value="${escapeAttribute(object.name)}"
      />
    </div>


    <div class="property">
      <label>Type</label>

      <input
        value="${escapeAttribute(object.userData.type || "Object")}"
        disabled
      />
    </div>


    <div class="prop-group">

      <h4>Position</h4>

      <div class="prop-grid">

        <input
          id="posX"
          type="number"
          step="0.1"
          value="${object.position.x.toFixed(2)}"
        />

        <input
          id="posY"
          type="number"
          step="0.1"
          value="${object.position.y.toFixed(2)}"
        />

        <input
          id="posZ"
          type="number"
          step="0.1"
          value="${object.position.z.toFixed(2)}"
        />

      </div>

    </div>


    <div class="prop-group">

      <h4>Rotation</h4>

      <div class="prop-grid">

        <input
          id="rotX"
          type="number"
          step="0.1"
          value="${object.rotation.x.toFixed(2)}"
        />

        <input
          id="rotY"
          type="number"
          step="0.1"
          value="${object.rotation.y.toFixed(2)}"
        />

        <input
          id="rotZ"
          type="number"
          step="0.1"
          value="${object.rotation.z.toFixed(2)}"
        />

      </div>

    </div>
  `;


  $("propName")?.addEventListener("input", event => {
    object.name = event.target.value || "Object";

    updateObjectList();

    if (S.settings.autoSave) {
      saveCurrentProject(false);
    }
  });


  [
    ["posX", "x", "position"],
    ["posY", "y", "position"],
    ["posZ", "z", "position"],
    ["rotX", "x", "rotation"],
    ["rotY", "y", "rotation"],
    ["rotZ", "z", "rotation"]
  ].forEach(([id, axis, property]) => {
    $(id)?.addEventListener("input", event => {
      object[property][axis] =
        Number(event.target.value) || 0;

      if (S.settings.autoSave) {
        saveCurrentProject(false);
      }
    });
  });
}


/* =========================================================
   REMOVE OBJECT
========================================================= */

function removeObject(object) {
  if (!object || !S.scene) return;

  S.scene.remove(object);

  disposeObject(object);

  S.objects = S.objects.filter(
    candidate => candidate !== object
  );

  if (S.selected === object) {
    S.selected = null;
  }

  updateObjectList();
  renderProperties();

  if (S.settings.autoSave) {
    saveCurrentProject(false);
  }
}


/* =========================================================
   DUPLICATE
========================================================= */

function duplicateSelected() {
  if (!S.selected) {
    showToast("Select an object first.");
    return;
  }


  const original = S.selected;


  if (original.userData.character) {
    const cloneData = serializeObject(original);

    cloneData.name =
      `${original.name} Copy`;

    cloneData.x =
      original.position.x + 1.5;

    createObject("human", cloneData);

    return;
  }


  const clone = original.clone(true);

  clone.name =
    `${original.name} Copy`;

  clone.position.x += 1.5;

  clone.userData = {
    ...original.userData
  };


  clone.traverse(child => {
    if (child.isMesh) {
      child.material =
        child.material.clone();
    }
  });


  S.scene.add(clone);

  S.objects.push(clone);

  selectObject(clone);

  updateObjectList();

  showToast("Object duplicated.");
}


/* =========================================================
   CLEAR SCENE
========================================================= */

function clearScene() {
  if (!S.scene) return;

  [...S.objects].forEach(object => {
    S.scene.remove(object);
    disposeObject(object);
  });

  S.objects = [];
  S.selected = null;

  updateObjectList();
  renderProperties();

  showToast("Scene cleared.");
}


/* =========================================================
   RESET
========================================================= */

function resetScene() {
  S.camera.position.set(
    7,
    5,
    9
  );

  S.controls?.target.set(
    0,
    0.5,
    0
  );

  S.controls?.update();

  S.objects.forEach(object => {
    object.position.set(
      0,
      object.userData.character ? 0.68 : 0,
      0
    );

    object.rotation.set(0, 0, 0);
  });

  showToast("Scene reset.");
}


/* =========================================================
   WIREFRAME
========================================================= */

function toggleWireframe() {
  S.wire = !S.wire;

  S.objects.forEach(object => {
    object.traverse(child => {
      if (child.isMesh && child.material) {
        child.material.wireframe =
          S.wire;
      }
    });
  });

  showToast(
    S.wire
      ? "Wireframe enabled."
      : "Wireframe disabled."
  );
}


/* =========================================================
   PLAY / PAUSE
========================================================= */

function setPlaying(value) {
  S.playing = value;

  showToast(
    value
      ? "Animation playing."
      : "Animation paused."
  );
}


function animateCharacters(time) {
  if (!S.playing) return;

  const t = time * 0.004;

  S.objects.forEach(object => {
    if (!object.userData.character) return;

    const animation =
      object.userData.animation;

    if (!animation) return;

    const walk = Math.sin(t * 2);

    animation.leftArm.rotation.x =
      walk * 0.45;

    animation.rightArm.rotation.x =
      -walk * 0.45;

    animation.leftLeg.rotation.x =
      -walk * 0.32;

    animation.rightLeg.rotation.x =
      walk * 0.32;

    animation.torso.rotation.z =
      Math.sin(t * 2) * 0.025;
  });
}


/* =========================================================
   RENDER LOOP
========================================================= */

function animate(time = 0) {
  requestAnimationFrame(animate);

  animateCharacters(time);

  S.controls?.update();

  if (S.renderer && S.scene && S.camera) {
    S.renderer.render(
      S.scene,
      S.camera
    );
  }
}


/* =========================================================
   RESIZE
========================================================= */

function resizeRenderer() {
  const container = $("scene-container");

  if (
    !container ||
    !S.renderer ||
    !S.camera
  ) {
    return;
  }


  const width =
    container.clientWidth;

  const height =
    container.clientHeight;


  if (!width || !height) return;


  S.camera.aspect =
    width / height;

  S.camera.updateProjectionMatrix();


  S.renderer.setSize(
    width,
    height,
    false
  );
}


/* =========================================================
   PROJECT SERIALIZATION
========================================================= */

function serializeObject(object) {
  const data = {
    name: object.name,
    type: object.userData.character
      ? "human"
      : String(object.userData.type || "cube").toLowerCase(),

    x: object.position.x,
    y: object.position.y,
    z: object.position.z,

    rotationX: object.rotation.x,
    rotationY: object.rotation.y,
    rotationZ: object.rotation.z
  };


  if (object.userData.character) {
    data.type = "human";
  }


  return data;
}


function serializeScene() {
  return S.objects.map(
    serializeObject
  );
}


/* =========================================================
   LOAD SCENE
========================================================= */

function loadScene(objects = []) {
  clearScene();

  objects.forEach(data => {
    createObject(
      data.type,
      data
    );
  });

  S.selected = null;

  updateObjectList();
  renderProperties();
}


/* =========================================================
   PROJECT MANAGEMENT
========================================================= */

function createProject(name = "Untitled CGI Project") {
  const project = {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,

    name,

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString(),

    objects: [],

    thumbnail: null
  };


  S.projects.unshift(project);

  S.currentProjectId =
    project.id;

  writeStorage(
    STORAGE.projects,
    S.projects
  );

  writeStorage(
    STORAGE.currentProject,
    S.currentProjectId
  );

  renderProjects();

  showToast(
    `Project "${name}" created.`
  );

  return project;
}


function getCurrentProject() {
  return S.projects.find(
    project =>
      project.id === S.currentProjectId
  );
}


function saveCurrentProject(showMessage = true) {
  let project =
    getCurrentProject();


  if (!project) {
    const inputName =
      $("projectName")?.value.trim();

    project = createProject(
      inputName ||
      "Untitled CGI Project"
    );
  }


  project.objects =
    serializeScene();

  project.updatedAt =
    new Date().toISOString();


  if (S.renderer) {
    try {
      project.thumbnail =
        S.renderer.domElement.toDataURL(
          "image/jpeg",
          0.72
        );
    } catch {
      project.thumbnail = null;
    }
  }


  writeStorage(
    STORAGE.projects,
    S.projects
  );

  writeStorage(
    STORAGE.currentProject,
    S.currentProjectId
  );


  renderProjects();


  if (showMessage) {
    showToast(
      `Saved "${project.name}".`
    );
  }
}


function openProject(id) {
  const project =
    S.projects.find(
      item => item.id === id
    );

  if (!project) return;


  S.currentProjectId =
    project.id;

  $("projectName").value =
    project.name;


  loadScene(
    project.objects || []
  );


  writeStorage(
    STORAGE.currentProject,
    project.id
  );


  location.hash = "#studio";

  showToast(
    `Opened "${project.name}".`
  );
}


function renameProject(id) {
  const project =
    S.projects.find(
      item => item.id === id
    );

  if (!project) return;


  const newName =
    prompt(
      "Enter the new project name:",
      project.name
    );


  if (!newName?.trim()) return;


  project.name =
    newName.trim();

  project.updatedAt =
    new Date().toISOString();


  if (
    S.currentProjectId ===
    project.id
  ) {
    $("projectName").value =
      project.name;
  }


  writeStorage(
    STORAGE.projects,
    S.projects
  );

  renderProjects();

  showToast("Project renamed.");
}


function duplicateProject(id) {
  const original =
    S.projects.find(
      item => item.id === id
    );

  if (!original) return;


  const duplicate = {
    ...original,

    id:
      crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,

    name:
      `${original.name} Copy`,

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString(),

    objects:
      JSON.parse(
        JSON.stringify(
          original.objects
        )
      )
  };


  S.projects.unshift(
    duplicate
  );

  writeStorage(
    STORAGE.projects,
    S.projects
  );

  renderProjects();

  showToast(
    "Project duplicated."
  );
}


function deleteProject(id) {
  const project =
    S.projects.find(
      item => item.id === id
    );

  if (!project) return;


  const confirmed =
    confirm(
      `Delete "${project.name}"?`
    );

  if (!confirmed) return;


  S.projects =
    S.projects.filter(
      item => item.id !== id
    );


  if (
    S.currentProjectId === id
  ) {
    S.currentProjectId = null;

    clearScene();

    $("projectName").value = "";
  }


  writeStorage(
    STORAGE.projects,
    S.projects
  );

  writeStorage(
    STORAGE.currentProject,
    S.currentProjectId
  );

  renderProjects();

  showToast("Project deleted.");
}


/* =========================================================
   PROJECT UI
========================================================= */

function renderProjects() {
  const grid =
    $("projectGrid");

  if (!grid) return;


  if (!S.projects.length) {
    grid.innerHTML = `
      <article class="card">
        <h3>No projects yet</h3>
        <p>
          Create your first project and start building a scene
          in the 3D Studio.
        </p>
      </article>
    `;

    return;
  }


  grid.innerHTML =
    S.projects.map(project => `
      <article class="project-card">

        <div class="project-preview">
          ${
            project.thumbnail
              ? `<img
                   src="${project.thumbnail}"
                   alt="${escapeAttribute(project.name)} preview"
                 />`
              : `<span class="muted">3D Scene</span>`
          }
        </div>

        <h3>
          ${escapeHtml(project.name)}
        </h3>

        <p>
          ${project.objects?.length || 0}
          object${project.objects?.length === 1 ? "" : "s"}
        </p>

        <p class="muted">
          Updated
          ${formatDate(project.updatedAt)}
        </p>

        <div class="project-actions">

          <button
            class="btn"
            data-project-action="open"
            data-project-id="${project.id}"
          >
            Open
          </button>

          <button
            class="btn"
            data-project-action="rename"
            data-project-id="${project.id}"
          >
            Rename
          </button>

          <button
            class="btn"
            data-project-action="duplicate"
            data-project-id="${project.id}"
          >
            Duplicate
          </button>

          <button
            class="btn"
            data-project-action="delete"
            data-project-id="${project.id}"
          >
            Delete
          </button>

        </div>

      </article>
    `).join("");


  grid.querySelectorAll(
    "[data-project-action]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const action =
          button.dataset.projectAction;

        const id =
          button.dataset.projectId;


        if (action === "open") {
          openProject(id);
        }

        if (action === "rename") {
          renameProject(id);
        }

        if (action === "duplicate") {
          duplicateProject(id);
        }

        if (action === "delete") {
          deleteProject(id);
        }
      }
    );

  });
}


/* =========================================================
   GALLERY
========================================================= */

function renderGallery(filter = "all") {
  const grid =
    $("galleryGrid");

  if (!grid) return;


  let items =
    S.gallery;


  if (filter !== "all") {
    items =
      items.filter(
        item =>
          item.category === filter
      );
  }


  if (!items.length) {
    grid.innerHTML = `
      <article class="card">
        <h3>Your gallery is empty.</h3>

        <p>
          Export a scene from the Studio or save a project
          to begin building your showcase.
        </p>
      </article>
    `;

    return;
  }


  grid.innerHTML =
    items.map(item => `
      <article class="gallery-card">

        ${
          item.image
            ? `
              <img
                src="${item.image}"
                alt="${escapeAttribute(item.title)}"
              />
            `
            : `
              <div class="gallery-placeholder">
                3D Artwork
              </div>
            `
        }

        <div class="gallery-card-content">

          <h3>
            ${escapeHtml(item.title)}
          </h3>

          <p>
            ${escapeHtml(item.description || "")}
          </p>

        </div>

      </article>
    `).join("");
}


/* =========================================================
   EXPORT
========================================================= */

function exportPNG() {
  if (!S.renderer) return;


  S.renderer.render(
    S.scene,
    S.camera
  );


  const link =
    document.createElement("a");

  link.download =
    `cgi-studio-${Date.now()}.png`;

  link.href =
    S.renderer.domElement.toDataURL(
      "image/png"
    );

  link.click();


  saveGalleryImage();

  showToast(
    "PNG exported and added to Gallery."
  );
}


function saveGalleryImage() {
  if (!S.renderer) return;


  const project =
    getCurrentProject();


  const image =
    S.renderer.domElement.toDataURL(
      "image/jpeg",
      0.8
    );


  S.gallery.unshift({
    id:
      `${Date.now()}-${Math.random()}`,

    title:
      project?.name ||
      "CGI Studio Render",

    description:
      "Rendered from CGI Studio.",

    category:
      project?.objects?.some(
        object => object.type === "human"
      )
        ? "character"
        : "3d",

    image,

    createdAt:
      new Date().toISOString()
  });


  S.gallery =
    S.gallery.slice(0, 40);


  writeStorage(
    STORAGE.gallery,
    S.gallery
  );


  renderGallery();
}


/* =========================================================
   CREATE MENU
========================================================= */

function initializeStudioControls() {
  const createButton =
    $("createObjectBtn");

  const objectMenu =
    $("objectMenu");


  createButton?.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      objectMenu?.classList.toggle(
        "open"
      );
    }
  );


  objectMenu?.querySelectorAll(
    "[data-object-type]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      event => {

        event.stopPropagation();

        const type =
          button.dataset.objectType;

        createObject(type);

        objectMenu.classList.remove(
          "open"
        );
      }
    );

  });


  document.addEventListener(
    "click",
    event => {

      if (
        !objectMenu ||
        !createButton
      ) {
        return;
      }


      if (
        !objectMenu.contains(event.target) &&
        !createButton.contains(event.target)
      ) {
        objectMenu.classList.remove(
          "open"
        );
      }
    }
  );


  $("playButton")?.addEventListener(
    "click",
    () => setPlaying(true)
  );


  $("pauseButton")?.addEventListener(
    "click",
    () => setPlaying(false)
  );


  $("resetButton")?.addEventListener(
    "click",
    resetScene
  );


  $("wireframeButton")?.addEventListener(
    "click",
    toggleWireframe
  );


  $("clearSceneButton")?.addEventListener(
    "click",
    () => {

      if (
        confirm(
          "Clear the entire scene?"
        )
      ) {
        clearScene();
      }

    }
  );


  $("exportButton")?.addEventListener(
    "click",
    exportPNG
  );


  $("duplicateButton")?.addEventListener(
    "click",
    duplicateSelected
  );


  $("deleteObjectButton")?.addEventListener(
    "click",
    () => {

      if (!S.selected) {
        showToast(
          "Select an object first."
        );

        return;
      }

      removeObject(
        S.selected
      );
    }
  );
}


/* =========================================================
   PROJECT CONTROLS
========================================================= */

function initializeProjectControls() {
  $("newProjectButton")?.addEventListener(
    "click",
    () => {

      const name =
        $("projectName")?.value.trim();

      createProject(
        name ||
        "Untitled CGI Project"
      );

      clearScene();

      location.hash = "#studio";
    }
  );


  $("saveProjectButton")?.addEventListener(
    "click",
    () => {
      saveCurrentProject(true);
    }
  );
}


/* =========================================================
   GALLERY CONTROLS
========================================================= */

function initializeGalleryControls() {
  document.querySelectorAll(
    "[data-gallery-filter]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document.querySelectorAll(
          "[data-gallery-filter]"
        ).forEach(item => {
          item.classList.remove(
            "active"
          );
        });


        button.classList.add(
          "active"
        );


        renderGallery(
          button.dataset.galleryFilter
        );
      }
    );

  });
}


/* =========================================================
   SETTINGS
========================================================= */

function loadSettings() {
  S.settings = {
    ...S.settings,
    ...readStorage(
      STORAGE.settings,
      {}
    )
  };


  $("reduceMotion").checked =
    S.settings.reduceMotion;

  $("showGrid").checked =
    S.settings.showGrid;

  $("autoSave").checked =
    S.settings.autoSave;


  applySettings();
}


function saveSettings() {
  writeStorage(
    STORAGE.settings,
    S.settings
  );
}


function applySettings() {
  document.documentElement.style.scrollBehavior =
    S.settings.reduceMotion
      ? "auto"
      : "smooth";


  if (S.grid) {
    S.grid.visible =
      S.settings.showGrid;
  }
}


function initializeSettings() {
  $("reduceMotion")?.addEventListener(
    "change",
    event => {

      S.settings.reduceMotion =
        event.target.checked;

      saveSettings();
      applySettings();
    }
  );


  $("showGrid")?.addEventListener(
    "change",
    event => {

      S.settings.showGrid =
        event.target.checked;

      saveSettings();
      applySettings();
    }
  );


  $("autoSave")?.addEventListener(
    "change",
    event => {

      S.settings.autoSave =
        event.target.checked;

      saveSettings();
    }
  );


  $("clearData")?.addEventListener(
    "click",
    () => {

      const confirmed =
        confirm(
          "Delete all CGI Studio local data?"
        );

      if (!confirmed) return;


      localStorage.removeItem(
        STORAGE.projects
      );

      localStorage.removeItem(
        STORAGE.settings
      );

      localStorage.removeItem(
        STORAGE.gallery
      );

      localStorage.removeItem(
        STORAGE.currentProject
      );


      S.projects = [];
      S.gallery = [];
      S.currentProjectId = null;


      clearScene();

      renderProjects();
      renderGallery();

      showToast(
        "Local CGI Studio data cleared."
      );
    }
  );
}


/* =========================================================
   CONTACT
========================================================= */

function initializeContact() {
  $("contactForm")?.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const name =
        $("contactName").value.trim();

      const email =
        $("contactEmail").value.trim();

      const subject =
        $("contactSubject").value.trim();

      const message =
        $("contactMessage").value.trim();


      if (
        !name ||
        !email ||
        !subject ||
        !message
      ) {
        showToast(
          "Please complete all fields."
        );

        return;
      }


      /*
       * This is a frontend-only contact form.
       * Connect it to your preferred backend/email service
       * when deploying.
       */

      const mailto =
        `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
          `Name: ${name}\nEmail: ${email}\n\n${message}`
        )}`;


      window.location.href =
        mailto;

      showToast(
        "Opening your email application."
      );
    }
  );
}


/* =========================================================
   AUTO SAVE
========================================================= */

setInterval(() => {

  if (
    S.settings.autoSave &&
    S.currentProjectId &&
    S.objects.length
  ) {
    saveCurrentProject(false);
  }

}, 15000);


/* =========================================================
   UTILITIES
========================================================= */

function capitalize(value) {
  return String(value)
    .charAt(0)
    .toUpperCase() +
    String(value).slice(1);
}


function randomColor() {
  const colors = [
    0x22d3ee,
    0xa855f7,
    0x34d399,
    0xfb923c,
    0xfb7185,
    0x60a5fa
  ];

  return colors[
    Math.floor(
      Math.random() * colors.length
    )
  ];
}


function formatDate(date) {
  if (!date) return "Unknown";

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  ).format(new Date(date));
}


function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function escapeAttribute(value) {
  return escapeHtml(value);
}


function disposeObject(object) {
  object.traverse(child => {

    if (child.geometry) {
      child.geometry.dispose();
    }


    if (child.material) {

      const materials =
        Array.isArray(child.material)
          ? child.material
          : [child.material];


      materials.forEach(material => {

        if (material.map) {
          material.map.dispose();
        }

        if (material.normalMap) {
          material.normalMap.dispose();
        }

        if (material.roughnessMap) {
          material.roughnessMap.dispose();
        }

        if (material.metalnessMap) {
          material.metalnessMap.dispose();
        }

        material.dispose();
      });
    }

  });
}


/* =========================================================
   INITIAL DATA
========================================================= */

function loadApplicationData() {
  S.projects =
    readStorage(
      STORAGE.projects,
      []
    );

  S.gallery =
    readStorage(
      STORAGE.gallery,
      []
    );

  S.currentProjectId =
    readStorage(
      STORAGE.currentProject,
      null
    );


  if (
    S.currentProjectId &&
    !S.projects.some(
      project =>
        project.id ===
        S.currentProjectId
    )
  ) {
    S.currentProjectId = null;
  }
}


/* =========================================================
   INITIALIZE
========================================================= */

function initialize() {
  loadApplicationData();

  loadSettings();

  initializeNavigation();

  renderNotes();
  renderHistory();
  renderTutorials();
  renderFuture();
  renderRoadmap();
  renderProjects();
  renderGallery();

  $("noteSearch")?.addEventListener(
    "input",
    event => {
      renderNotes(
        event.target.value
      );
    }
  );

  initializeThree();
  initializeSceneSelection();
  initializeStudioControls();
  initializeProjectControls();
  initializeGalleryControls();
  initializeSettings();
  initializeContact();

  window.addEventListener(
    "resize",
    resizeRenderer
  );

  route();

  if (S.currentProjectId) {
    const project =
      getCurrentProject();

    if (project) {
      $("projectName").value =
        project.name;
    }
  }

  console.log(
    "CGI Studio initialized successfully."
  );
}


initialize();