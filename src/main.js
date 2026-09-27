import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { registerSW } from "virtual:pwa-register";
import "./style.css";

/* =========================================================
   CGI STUDIO - MAIN APPLICATION
   Includes:
   - 3D Studio
   - Starter Cube
   - Actual 3D Human Character
   - Character animation
   - Object selection
   - Projects
   - Gallery
   - Notes
   - Tutorials
   - Settings
   - PWA registration
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
   GLOBAL STATE
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
  }
};


/* =========================================================
   DATA
========================================================= */

const notes = [
  [
    "What is CGI?",
    "Computer-generated imagery uses computers to create or manipulate visual content.",
    "Fundamentals"
  ],
  [
    "3D Coordinates",
    "Three-dimensional scenes use X, Y and Z axes to describe position.",
    "3D"
  ],
  [
    "Polygon Modeling",
    "Polygon modeling builds surfaces from vertices, edges and faces.",
    "Modeling"
  ],
  [
    "Materials",
    "Materials describe how surfaces interact with light.",
    "Materials"
  ],
  [
    "Lighting",
    "Lighting establishes mood, visibility, depth and visual hierarchy.",
    "Lighting"
  ],
  [
    "Animation",
    "Animation creates motion by changing object properties over time.",
    "Animation"
  ],
  [
    "Rendering",
    "Rendering converts a 3D scene into an image or sequence of images.",
    "Rendering"
  ],
  [
    "Compositing",
    "Compositing combines visual elements into a final image.",
    "VFX"
  ]
].map(([title, text, tag]) => ({
  title,
  text,
  tag
}));


const history = [
  [
    "1950s",
    "Early Computer Graphics",
    "Researchers began using computers to create mathematical and graphical imagery."
  ],
  [
    "1960s",
    "Interactive Graphics",
    "Interactive display systems helped establish computer graphics as a practical field."
  ],
  [
    "1970s",
    "3D Foundations",
    "Major advances in 3D geometry, rendering and computer animation emerged."
  ],
  [
    "1980s",
    "CGI Enters Film",
    "Computer-generated imagery began appearing more prominently in film and television."
  ],
  [
    "1990s",
    "Digital Production",
    "Digital effects, animation and 3D software became increasingly important in production."
  ],
  [
    "2000s",
    "Realistic Rendering",
    "Physically based rendering and increasingly powerful GPUs improved realism."
  ],
  [
    "2010s",
    "Real-Time Graphics",
    "Real-time engines became increasingly capable of producing cinematic imagery."
  ],
  [
    "2020s",
    "AI + Real-Time Creation",
    "AI-assisted creation, virtual production and real-time workflows continue to reshape CGI."
  ]
].map(([year, title, text]) => ({
  year,
  title,
  text
}));


const tutorials = [
  [
    "Your First 3D Scene",
    "Beginner",
    "20 min",
    "Tutorial",
    "Learn the basic relationship between objects, cameras and lights."
  ],
  [
    "Build a Human Character",
    "Beginner",
    "30 min",
    "Challenge",
    "Create and inspect a simple low-poly human character."
  ],
  [
    "Lighting a Scene",
    "Beginner",
    "25 min",
    "Tutorial",
    "Experiment with key, fill and environment lighting."
  ],
  [
    "Materials Challenge",
    "Intermediate",
    "35 min",
    "Challenge",
    "Create contrasting surfaces using roughness and metallic properties."
  ],
  [
    "Animation Basics",
    "Intermediate",
    "40 min",
    "Tutorial",
    "Understand keyframes, timing and looping motion."
  ],
  [
    "Create a Sci-Fi Environment",
    "Intermediate",
    "60 min",
    "Challenge",
    "Design a futuristic environment using simple geometric forms."
  ]
].map(([title, level, duration, type, text]) => ({
  title,
  level,
  duration,
  type,
  text
}));


const future = [
  [
    "AI-Assisted CGI",
    "AI tools can assist with ideation, asset generation, animation, compositing and workflow automation."
  ],
  [
    "Real-Time Rendering",
    "Modern GPUs allow increasingly complex visual scenes to be rendered interactively."
  ],
  [
    "Virtual Production",
    "LED stages and real-time environments allow filmmakers to combine physical and digital production."
  ],
  [
    "Procedural Generation",
    "Procedural systems can create complex environments, materials and effects from rules and parameters."
  ],
  [
    "Digital Humans",
    "Character technology continues to advance through better modeling, rigging, simulation and rendering."
  ],
  [
    "Immersive Worlds",
    "VR, AR and spatial computing are creating new contexts for 3D experiences."
  ]
].map(([title, text]) => ({
  title,
  text
}));


const roadmap = [
  [
    "01",
    "Understand 3D",
    "Learn coordinates, geometry, cameras, lights and basic scene structure."
  ],
  [
    "02",
    "Learn Modeling",
    "Practice creating objects from primitives and progressively more complex topology."
  ],
  [
    "03",
    "Learn Materials",
    "Study color, roughness, metalness, transparency and texture mapping."
  ],
  [
    "04",
    "Learn Lighting",
    "Practice key lights, fill lights, rim lights, shadows and environment lighting."
  ],
  [
    "05",
    "Learn Animation",
    "Explore keyframes, timing, interpolation, character movement and simulation."
  ],
  [
    "06",
    "Learn Rendering",
    "Understand resolution, samples, lighting quality, composition and output."
  ],
  [
    "07",
    "Build Projects",
    "Create complete scenes rather than isolated exercises."
  ],
  [
    "08",
    "Build a Portfolio",
    "Select your strongest work and present the process behind each project."
  ]
].map(([phase, title, text]) => ({
  phase,
  title,
  text
}));


const $ = id => document.getElementById(id);


/* =========================================================
   TOAST
========================================================= */

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

    return value
      ? JSON.parse(value)
      : fallback;
  } catch {
    return fallback;
  }
}


function writeStorage(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  } catch (error) {
    console.warn(
      "Storage error:",
      error
    );
  }
}


/* =========================================================
   ROUTER
========================================================= */

function route() {
  const requested =
    location.hash.replace("#", "") ||
    "home";

  const page = $(requested);

  document
    .querySelectorAll(".page")
    .forEach(element => {
      element.classList.remove("active");
    });

  if (
    page &&
    page.classList.contains("page")
  ) {
    page.classList.add("active");
  } else {
    $("home")?.classList.add("active");
  }

  document
    .querySelectorAll(".main-nav a")
    .forEach(link => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") ===
          `#${requested}`
      );
    });

  $("mainNav")?.classList.remove("open");

  $("menuToggle")?.setAttribute(
    "aria-expanded",
    "false"
  );

  if (requested === "studio") {
    setTimeout(
      resizeRenderer,
      50
    );
  }

  window.scrollTo({
    top: 0,
    behavior: S.settings.reduceMotion
      ? "auto"
      : "smooth"
  });
}


/* =========================================================
   NAVIGATION
========================================================= */

function initializeNavigation() {
  $("menuToggle")?.addEventListener(
    "click",
    () => {
      const nav = $("mainNav");

      if (!nav) return;

      const open =
        nav.classList.toggle("open");

      $("menuToggle").setAttribute(
        "aria-expanded",
        String(open)
      );
    }
  );

  document
    .querySelectorAll(".main-nav a")
    .forEach(link => {
      link.addEventListener(
        "click",
        () => {
          $("mainNav")?.classList.remove(
            "open"
          );

          $("menuToggle")?.setAttribute(
            "aria-expanded",
            "false"
          );
        }
      );
    });

  window.addEventListener(
    "hashchange",
    route
  );
}


/* =========================================================
   NOTES
========================================================= */

function renderNotes(filter = "") {
  const grid = $("notesGrid");

  if (!grid) return;

  const q =
    filter.trim().toLowerCase();

  const results =
    notes.filter(note => {
      return (
        !q ||
        note.title
          .toLowerCase()
          .includes(q) ||
        note.text
          .toLowerCase()
          .includes(q) ||
        note.tag
          .toLowerCase()
          .includes(q)
      );
    });

  grid.innerHTML =
    results.length
      ? results
          .map(
            note => `
              <article class="note">
                <small>
                  ${escapeHtml(note.tag)}
                </small>

                <h3>
                  ${escapeHtml(note.title)}
                </h3>

                <p>
                  ${escapeHtml(note.text)}
                </p>
              </article>
            `
          )
          .join("")
      : `
          <article class="card">
            <h3>No notes found</h3>
            <p>
              Try a different search term.
            </p>
          </article>
        `;
}


/* =========================================================
   HISTORY
========================================================= */

function renderHistory() {
  const element =
    $("timeline");

  if (!element) return;

  element.innerHTML =
    history
      .map(
        item => `
          <article class="timeline-item">

            <span class="year">
              ${escapeHtml(item.year)}
            </span>

            <h3>
              ${escapeHtml(item.title)}
            </h3>

            <p>
              ${escapeHtml(item.text)}
            </p>

          </article>
        `
      )
      .join("");
}


/* =========================================================
   TUTORIALS
========================================================= */

function renderTutorials() {
  const element =
    $("tutorialGrid");

  if (!element) return;

  element.innerHTML =
    tutorials
      .map(
        item => `
          <article class="tutorial">

            <div class="eyebrow">
              ${escapeHtml(item.type)}
            </div>

            <h3>
              ${escapeHtml(item.title)}
            </h3>

            <p>
              ${escapeHtml(item.text)}
            </p>

            <div class="tutorial-meta">
              <span>
                ${escapeHtml(item.level)}
              </span>

              <span>
                ${escapeHtml(item.duration)}
              </span>
            </div>

          </article>
        `
      )
      .join("");
}


/* =========================================================
   FUTURE
========================================================= */

function renderFuture() {
  const element =
    $("futureGrid");

  if (!element) return;

  element.innerHTML =
    future
      .map(
        item => `
          <article class="future">

            <h3>
              ${escapeHtml(item.title)}
            </h3>

            <p>
              ${escapeHtml(item.text)}
            </p>

          </article>
        `
      )
      .join("");
}


/* =========================================================
   ROADMAP
========================================================= */

function renderRoadmap() {
  const element =
    $("roadmap");

  if (!element) return;

  element.innerHTML =
    roadmap
      .map(
        item => `
          <article class="roadmap-item">

            <div class="phase">
              ${escapeHtml(item.phase)}
            </div>

            <div>

              <h3>
                ${escapeHtml(item.title)}
              </h3>

              <p>
                ${escapeHtml(item.text)}
              </p>

            </div>

          </article>
        `
      )
      .join("");
}


/* =========================================================
   THREE.JS INITIALIZATION
========================================================= */

function initializeThree() {
  const container =
    $("scene-container");

  if (!container) {
    console.warn(
      "scene-container was not found."
    );

    return;
  }


  /* -------------------------------------------------------
     SCENE
  ------------------------------------------------------- */

  S.scene =
    new THREE.Scene();

  S.scene.background =
    new THREE.Color(
      0x050812
    );


  /* -------------------------------------------------------
     CAMERA
  ------------------------------------------------------- */

  const width =
    Math.max(
      container.clientWidth,
      320
    );

  const height =
    Math.max(
      container.clientHeight,
      420
    );

  S.camera =
    new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      1000
    );

  S.camera.position.set(
    8,
    4.5,
    10
  );


  /* -------------------------------------------------------
     RENDERER
  ------------------------------------------------------- */

  S.renderer =
    new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true
    });

  S.renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      2
    )
  );

  S.renderer.setSize(
    width,
    height
  );

  S.renderer.shadowMap.enabled =
    true;

  S.renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


  container.innerHTML = "";

  container.appendChild(
    S.renderer.domElement
  );


  /* -------------------------------------------------------
     ORBIT CONTROLS
  ------------------------------------------------------- */

  S.controls =
    new OrbitControls(
      S.camera,
      S.renderer.domElement
    );

  S.controls.enableDamping =
    true;

  S.controls.target.set(
    0,
    1.0,
    0
  );


  /* -------------------------------------------------------
     LIGHTING
  ------------------------------------------------------- */

  const hemisphere =
    new THREE.HemisphereLight(
      0x9fdcff,
      0x080812,
      2.2
    );

  S.scene.add(
    hemisphere
  );


  const key =
    new THREE.DirectionalLight(
      0xffffff,
      3
    );

  key.position.set(
    5,
    9,
    6
  );

  key.castShadow =
    true;

  S.scene.add(key);


  const rim =
    new THREE.PointLight(
      0x22d3ee,
      35,
      30
    );

  rim.position.set(
    -5,
    4,
    -5
  );

  S.scene.add(rim);


  const purple =
    new THREE.PointLight(
      0xa855f7,
      30,
      25
    );

  purple.position.set(
    5,
    2,
    -5
  );

  S.scene.add(purple);


  /* -------------------------------------------------------
     GROUND
  ------------------------------------------------------- */

  const ground =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        30,
        30
      ),
      new THREE.MeshStandardMaterial({
        color: 0x0a1020,
        roughness: 0.85,
        metalness: 0.1
      })
    );

  ground.rotation.x =
    -Math.PI / 2;

  ground.position.y =
    -1.5;

  ground.receiveShadow =
    true;

  ground.userData.environment =
    true;

  S.scene.add(
    ground
  );


  /* -------------------------------------------------------
     GRID
  ------------------------------------------------------- */

  S.grid =
    new THREE.GridHelper(
      30,
      30,
      0x22d3ee,
      0x172033
    );

  S.grid.position.y =
    -1.49;

  S.scene.add(
    S.grid
  );


  /* =======================================================
     STARTER CUBE
  ======================================================= */

  createObject(
    "cube",
    {
      x: -2.2,
      y: -0.9,
      z: 0,

      name: "Starter Cube",

      color: 0x22d3ee
    }
  );


  /* =======================================================
     ACTUAL 3D HUMAN CHARACTER
     IMPORTANT:
     The character is intentionally created here so that
     it appears automatically when Studio opens.
  ======================================================= */

  createObject(
    "human",
    {
      x: 2.0,

      /*
        The human is raised above the ground so its
        complete body, legs and feet are visible.
      */
      y: 1.4,

      z: 0,

      name: "Human Character"
    }
  );


  /* -------------------------------------------------------
     CAMERA TARGET
  ------------------------------------------------------- */

  S.camera.position.set(
    8,
    4.5,
    10
  );

  S.controls.target.set(
    0,
    1.0,
    0
  );

  S.controls.update();


  resizeRenderer();

  animate();
}


/* =========================================================
   HUMAN CHARACTER
   =========================================================
   This creates the actual visible 3D person.

   Body parts:
   - Head
   - Hair
   - Eyes
   - Pupils
   - Nose
   - Neck
   - Torso
   - Pelvis
   - Arms
   - Hands
   - Legs
   - Feet
========================================================= */

function createHumanCharacter(
  data = {}
) {
  const root =
    new THREE.Group();


  root.name =
    data.name ||
    "Human Character";


  root.position.set(
    data.x ?? 0,
    data.y ?? 1.4,
    data.z ?? 0
  );


  root.rotation.y =
    data.rotationY ?? 0;


  root.userData.type =
    "Human";


  root.userData.selectableRoot =
    true;


  root.userData.character =
    true;


  /* -------------------------------------------------------
     MATERIALS
  ------------------------------------------------------- */

  const skin =
    new THREE.MeshStandardMaterial({
      color: 0xf0b58e,
      roughness: 0.65
    });


  const shirt =
    new THREE.MeshStandardMaterial({
      color:
        data.color ??
        0x2563eb,
      roughness: 0.7
    });


  const pants =
    new THREE.MeshStandardMaterial({
      color: 0x18243d,
      roughness: 0.75
    });


  const shoes =
    new THREE.MeshStandardMaterial({
      color: 0x101010,
      roughness: 0.6
    });


  const hair =
    new THREE.MeshStandardMaterial({
      color: 0x17120f,
      roughness: 0.9
    });


  const eyeWhite =
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25
    });


  const pupil =
    new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.2
    });


  /* -------------------------------------------------------
     MESH HELPER
  ------------------------------------------------------- */

  function mesh(
    geometry,
    material,
    name
  ) {
    const object =
      new THREE.Mesh(
        geometry,
        material
      );

    object.name =
      name;

    object.castShadow =
      true;

    object.receiveShadow =
      true;

    return object;
  }


  /* =======================================================
     TORSO
  ======================================================= */

  const torso =
    mesh(
      new THREE.BoxGeometry(
        1.35,
        1.65,
        0.72
      ),
      shirt,
      "Torso"
    );

  torso.position.y =
    1.55;

  root.add(
    torso
  );


  /* =======================================================
     PELVIS
  ======================================================= */

  const pelvis =
    mesh(
      new THREE.BoxGeometry(
        1.15,
        0.55,
        0.68
      ),
      pants,
      "Pelvis"
    );

  pelvis.position.y =
    0.55;

  root.add(
    pelvis
  );


  /* =======================================================
     NECK
  ======================================================= */

  const neck =
    mesh(
      new THREE.CylinderGeometry(
        0.22,
        0.22,
        0.32,
        16
      ),
      skin,
      "Neck"
    );

  neck.position.y =
    2.52;

  root.add(
    neck
  );


  /* =======================================================
     HEAD
  ======================================================= */

  const head =
    mesh(
      new THREE.SphereGeometry(
        0.62,
        24,
        18
      ),
      skin,
      "Head"
    );

  head.scale.set(
    0.92,
    1.08,
    0.92
  );

  head.position.y =
    3.22;

  root.add(
    head
  );


  /* =======================================================
     HAIR
  ======================================================= */

  const hairMesh =
    mesh(
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

  hairMesh.scale.set(
    0.94,
    1.05,
    0.94
  );

  hairMesh.position.y =
    3.43;

  root.add(
    hairMesh
  );


  /* =======================================================
     EYES
  ======================================================= */

  [-0.22, 0.22].forEach(
    (x, index) => {

      const eye =
        mesh(
          new THREE.SphereGeometry(
            0.105,
            16,
            12
          ),
          eyeWhite,
          `Eye ${index + 1}`
        );

      eye.position.set(
        x,
        3.25,
        0.57
      );

      root.add(
        eye
      );


      const pupilMesh =
        mesh(
          new THREE.SphereGeometry(
            0.048,
            12,
            10
          ),
          pupil,
          `Pupil ${index + 1}`
        );

      pupilMesh.position.set(
        x,
        3.25,
        0.66
      );

      root.add(
        pupilMesh
      );
    }
  );


  /* =======================================================
     NOSE
  ======================================================= */

  const nose =
    mesh(
      new THREE.ConeGeometry(
        0.07,
        0.22,
        12
      ),
      skin,
      "Nose"
    );

  nose.rotation.x =
    Math.PI / 2;

  nose.position.set(
    0,
    3.05,
    0.63
  );

  root.add(
    nose
  );


  /* =======================================================
     ARMS
  ======================================================= */

  function makeArm(
    side,
    x
  ) {
    const shoulder =
      new THREE.Group();

    shoulder.name =
      `${side} Arm`;

    shoulder.position.set(
      x,
      2.18,
      0
    );

    root.add(
      shoulder
    );


    const upper =
      mesh(
        new THREE.CylinderGeometry(
          0.18,
          0.18,
          0.82,
          16
        ),
        shirt,
        `${side} Upper Arm`
      );

    upper.position.y =
      -0.40;

    shoulder.add(
      upper
    );


    const elbow =
      new THREE.Group();

    elbow.position.y =
      -0.80;

    shoulder.add(
      elbow
    );


    const lower =
      mesh(
        new THREE.CylinderGeometry(
          0.16,
          0.16,
          0.76,
          16
        ),
        skin,
        `${side} Lower Arm`
      );

    lower.position.y =
      -0.38;

    elbow.add(
      lower
    );


    const hand =
      mesh(
        new THREE.SphereGeometry(
          0.2,
          16,
          12
        ),
        skin,
        `${side} Hand`
      );

    hand.position.y =
      -0.78;

    elbow.add(
      hand
    );


    return shoulder;
  }


  const leftArm =
    makeArm(
      "Left",
      -0.82
    );


  const rightArm =
    makeArm(
      "Right",
      0.82
    );


  /* =======================================================
     LEGS
  ======================================================= */

  function makeLeg(
    side,
    x
  ) {
    const hip =
      new THREE.Group();

    hip.name =
      `${side} Leg`;

    hip.position.set(
      x,
      0.3,
      0
    );

    root.add(
      hip
    );


    const thigh =
      mesh(
        new THREE.CylinderGeometry(
          0.23,
          0.23,
          0.95,
          16
        ),
        pants,
        `${side} Thigh`
      );

    thigh.position.y =
      -0.48;

    hip.add(
      thigh
    );


    const knee =
      new THREE.Group();

    knee.position.y =
      -0.94;

    hip.add(
      knee
    );


    const shin =
      mesh(
        new THREE.CylinderGeometry(
          0.18,
          0.18,
          0.98,
          16
        ),
        pants,
        `${side} Shin`
      );

    shin.position.y =
      -0.42;

    knee.add(
      shin
    );


    const foot =
      mesh(
        new THREE.BoxGeometry(
          0.42,
          0.22,
          0.72
        ),
        shoes,
        `${side} Foot`
      );

    foot.position.set(
      0,
      -0.88,
      0.18
    );

    knee.add(
      foot
    );


    return hip;
  }


  const leftLeg =
    makeLeg(
      "Left",
      -0.34
    );


  const rightLeg =
    makeLeg(
      "Right",
      0.34
    );


  /* =======================================================
     CHARACTER ANIMATION REFERENCES
  ======================================================= */

  root.userData.animation = {
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    torso
  };


  /* -------------------------------------------------------
     Make all meshes children of the character root for
     selection purposes.
  ------------------------------------------------------- */

  root.traverse(
    child => {
      if (child.isMesh) {
        child.userData.selectableRoot =
          false;
      }
    }
  );


  return root;
}


/* =========================================================
   PRIMITIVES
========================================================= */

function createPrimitive(
  type,
  data = {}
) {
  let geometry;


  switch (type) {

    case "sphere":

      geometry =
        new THREE.SphereGeometry(
          data.size ?? 0.8,
          32,
          20
        );

      break;


    case "cone":

      geometry =
        new THREE.ConeGeometry(
          data.size ?? 0.8,
          data.height ?? 1.5,
          32
        );

      break;


    case "torus":

      geometry =
        new THREE.TorusGeometry(
          data.size ?? 0.85,
          data.tube ?? 0.22,
          16,
          48
        );

      break;


    case "cube":
    case "box":

    default:

      geometry =
        new THREE.BoxGeometry(
          data.width ?? 1.2,
          data.height ?? 1.2,
          data.depth ?? 1.2
        );

      break;
  }


  const material =
    new THREE.MeshStandardMaterial({
      color:
        data.color ??
        randomColor(),

      roughness: 0.5,

      metalness: 0.15
    });


  const object =
    new THREE.Mesh(
      geometry,
      material
    );


  object.castShadow =
    true;


  object.receiveShadow =
    true;


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


  object.userData.type =
    capitalize(type);


  object.userData.selectableRoot =
    true;


  return object;
}


/* =========================================================
   CREATE OBJECT
========================================================= */

function createObject(
  type,
  data = {}
) {
  if (!S.scene) {
    showToast(
      "3D Studio is still loading."
    );

    return null;
  }


  const normalized =
    String(type || "cube")
      .toLowerCase();


  const object =
    [
      "human",
      "character",
      "human character"
    ].includes(normalized)

      ? createHumanCharacter(
          data
        )

      : createPrimitive(
          normalized,
          data
        );


  if (!object) {
    return null;
  }


  S.scene.add(
    object
  );


  S.objects.push(
    object
  );


  selectObject(
    object
  );


  updateObjectList();


  if (S.settings.autoSave) {
    saveCurrentProject(false);
  }


  return object;
}


/* =========================================================
   SELECTION
========================================================= */

function getSelectableRoot(
  object
) {
  let current =
    object;


  while (current) {

    if (
      current.userData?.selectableRoot
    ) {
      return current;
    }


    current =
      current.parent;
  }


  return null;
}


function selectObject(
  object
) {
  S.selected =
    object;


  updateObjectList();

  renderProperties();
}


/* =========================================================
   SCENE SELECTION
========================================================= */

function initializeSceneSelection() {
  const container =
    $("scene-container");

  if (!container) {
    return;
  }


  container.addEventListener(
    "pointerdown",
    event => {

      if (
        !S.renderer ||
        !S.camera
      ) {
        return;
      }


      const rect =
        S.renderer.domElement.getBoundingClientRect();


      const mouse =
        new THREE.Vector2(

          (
            (
              event.clientX -
              rect.left
            ) /
            rect.width
          ) * 2 - 1,


          -(
            (
              (
                event.clientY -
                rect.top
              ) /
              rect.height
            ) * 2 - 1
          )
        );


      const raycaster =
        new THREE.Raycaster();


      raycaster.setFromCamera(
        mouse,
        S.camera
      );


      const hits =
        raycaster.intersectObjects(
          S.objects,
          true
        );


      if (!hits.length) {

        S.selected =
          null;

        updateObjectList();

        renderProperties();

        return;
      }


      const selected =
        getSelectableRoot(
          hits[0].object
        );


      if (selected) {
        selectObject(
          selected
        );
      }
    }
  );
}


/* =========================================================
   OBJECT LIST
========================================================= */

function updateObjectList() {
  const list =
    $("objectList");

  const count =
    $("objectCount");


  if (!list) {
    return;
  }


  if (count) {
    count.textContent =
      String(
        S.objects.length
      );
  }


  if (!S.objects.length) {

    list.innerHTML = `
      <p class="muted">
        No objects in the scene.
      </p>
    `;

    return;
  }


  list.innerHTML =
    S.objects
      .map(
        (object, index) => `
          <div
            class="object-item ${
              S.selected === object
                ? "selected"
                : ""
            }"
            data-object-id="${object.uuid}"
          >

            <span class="object-index">
              ${index + 1}
            </span>

            <span class="object-name">
              ${escapeHtml(
                object.name
              )}
            </span>

          </div>
        `
      )
      .join("");


  list
    .querySelectorAll(
      ".object-item"
    )
    .forEach(item => {

      item.addEventListener(
        "click",
        () => {

          const object =
            S.objects.find(
              candidate =>
                candidate.uuid ===
                item.dataset.objectId
            );


          if (object) {
            selectObject(
              object
            );
          }
        }
      );
    });
}


/* =========================================================
   PROPERTIES
========================================================= */

function renderProperties() {
  const panel =
    $("properties");


  if (!panel) {
    return;
  }


  if (!S.selected) {

    panel.innerHTML = `
      <p class="muted">
        Select an object to edit its properties.
      </p>
    `;

    return;
  }


  const object =
    S.selected;


  panel.innerHTML = `

    <div class="property">

      <label>Name</label>

      <input
        id="propName"
        value="${escapeAttribute(
          object.name
        )}"
      />

    </div>


    <div class="property">

      <label>Type</label>

      <input
        value="${escapeAttribute(
          object.userData.type ||
          "Object"
        )}"
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
          value="${object.position.x.toFixed(
            2
          )}"
        />

        <input
          id="posY"
          type="number"
          step="0.1"
          value="${object.position.y.toFixed(
            2
          )}"
        />

        <input
          id="posZ"
          type="number"
          step="0.1"
          value="${object.position.z.toFixed(
            2
          )}"
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
          value="${object.rotation.x.toFixed(
            2
          )}"
        />

        <input
          id="rotY"
          type="number"
          step="0.1"
          value="${object.rotation.y.toFixed(
            2
          )}"
        />

        <input
          id="rotZ"
          type="number"
          step="0.1"
          value="${object.rotation.z.toFixed(
            2
          )}"
        />

      </div>

    </div>
  `;


  $("propName")?.addEventListener(
    "input",
    event => {

      object.name =
        event.target.value ||
        "Object";


      updateObjectList();


      if (S.settings.autoSave) {
        saveCurrentProject(false);
      }
    }
  );


  [
    ["posX", "x", "position"],
    ["posY", "y", "position"],
    ["posZ", "z", "position"],

    ["rotX", "x", "rotation"],
    ["rotY", "y", "rotation"],
    ["rotZ", "z", "rotation"]

  ].forEach(
    ([id, axis, property]) => {

      $(id)?.addEventListener(
        "input",
        event => {

          object[property][axis] =
            Number(
              event.target.value
            ) || 0;


          if (
            S.settings.autoSave
          ) {
            saveCurrentProject(
              false
            );
          }
        }
      );
    }
  );
}


/* =========================================================
   REMOVE OBJECT
========================================================= */

function removeObject(
  object
) {
  if (
    !object ||
    !S.scene
  ) {
    return;
  }


  S.scene.remove(
    object
  );


  disposeObject(
    object
  );


  S.objects =
    S.objects.filter(
      candidate =>
        candidate !== object
    );


  if (
    S.selected === object
  ) {
    S.selected =
      null;
  }


  updateObjectList();

  renderProperties();


  if (
    S.settings.autoSave
  ) {
    saveCurrentProject(
      false
    );
  }
}


/* =========================================================
   DUPLICATE OBJECT
========================================================= */

function duplicateSelected() {
  if (!S.selected) {

    showToast(
      "Select an object first."
    );

    return;
  }


  const original =
    S.selected;


  if (
    original.userData.character
  ) {

    const data =
      serializeObject(
        original
      );


    data.name =
      `${original.name} Copy`;


    data.x =
      original.position.x +
      1.5;


    createObject(
      "human",
      data
    );


    return;
  }


  const clone =
    original.clone(
      true
    );


  clone.name =
    `${original.name} Copy`;


  clone.position.x +=
    1.5;


  clone.userData = {
    ...original.userData
  };


  clone.traverse(
    child => {

      if (
        child.isMesh
      ) {
        child.material =
          child.material.clone();
      }
    }
  );


  S.scene.add(
    clone
  );


  S.objects.push(
    clone
  );


  selectObject(
    clone
  );


  updateObjectList();


  showToast(
    "Object duplicated."
  );
}


/* =========================================================
   CLEAR SCENE
========================================================= */

function clearScene() {
  if (!S.scene) {
    return;
  }


  [...S.objects].forEach(
    object => {

      S.scene.remove(
        object
      );

      disposeObject(
        object
      );
    }
  );


  S.objects = [];

  S.selected = null;


  updateObjectList();

  renderProperties();


  showToast(
    "Scene cleared."
  );
}


/* =========================================================
   RESET SCENE
========================================================= */

function resetScene() {
  if (!S.camera) {
    return;
  }


  S.camera.position.set(
    8,
    4.5,
    10
  );


  S.controls?.target.set(
    0,
    1.0,
    0
  );


  S.controls?.update();


  S.objects.forEach(
    object => {

      object.position.set(
        object.userData.character
          ? 2.0
          : -2.2,

        object.userData.character
          ? 1.4
          : -0.9,

        0
      );


      object.rotation.set(
        0,
        0,
        0
      );
    }
  );


  showToast(
    "Scene reset."
  );
}


/* =========================================================
   WIREFRAME
========================================================= */

function toggleWireframe() {
  S.wire =
    !S.wire;


  S.objects.forEach(
    object => {

      object.traverse(
        child => {

          if (
            child.isMesh &&
            child.material
          ) {

            child.material.wireframe =
              S.wire;
          }
        }
      );
    }
  );


  showToast(
    S.wire
      ? "Wireframe enabled."
      : "Wireframe disabled."
  );
}


/* =========================================================
   PLAY / PAUSE
========================================================= */

function setPlaying(
  value
) {
  S.playing =
    value;


  showToast(
    value
      ? "Animation playing."
      : "Animation paused."
  );
}


/* =========================================================
   CHARACTER ANIMATION
========================================================= */

function animateCharacters(
  time
) {
  if (!S.playing) {
    return;
  }


  const t =
    time * 0.004;


  S.objects.forEach(
    object => {

      if (
        !object.userData.character ||
        !object.userData.animation
      ) {
        return;
      }


      const animation =
        object.userData.animation;


      const walk =
        Math.sin(
          t * 2
        );


      animation.leftArm.rotation.x =
        walk * 0.45;


      animation.rightArm.rotation.x =
        -walk * 0.45;


      animation.leftLeg.rotation.x =
        -walk * 0.32;


      animation.rightLeg.rotation.x =
        walk * 0.32;


      animation.torso.rotation.z =
        Math.sin(
          t * 2
        ) * 0.025;
    }
  );
}


/* =========================================================
   RENDER LOOP
========================================================= */

function animate(
  time = 0
) {
  requestAnimationFrame(
    animate
  );


  animateCharacters(
    time
  );


  S.controls?.update();


  if (
    S.renderer &&
    S.scene &&
    S.camera
  ) {

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
  const container =
    $("scene-container");


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


  if (
    !width ||
    !height
  ) {
    return;
  }


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
   SERIALIZATION
========================================================= */

function serializeObject(
  object
) {
  return {

    name:
      object.name,

    type:
      object.userData.character
        ? "human"
        : String(
            object.userData.type ||
              "cube"
          ).toLowerCase(),

    x:
      object.position.x,

    y:
      object.position.y,

    z:
      object.position.z,

    rotationX:
      object.rotation.x,

    rotationY:
      object.rotation.y,

    rotationZ:
      object.rotation.z
  };
}


function serializeScene() {
  return S.objects.map(
    serializeObject
  );
}


/* =========================================================
   LOAD SCENE
========================================================= */

function loadScene(
  objects = []
) {
  clearScene();


  objects.forEach(
    data => {

      createObject(
        data.type,
        data
      );
    }
  );


  S.selected =
    null;


  updateObjectList();

  renderProperties();
}


/* =========================================================
   PROJECT MANAGEMENT
========================================================= */

function createProject(
  name =
    "Untitled CGI Project"
) {

  const project = {

    id:
      typeof crypto !== "undefined" &&
      crypto.randomUUID
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


  S.projects.unshift(
    project
  );


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


/* =========================================================
   CURRENT PROJECT
========================================================= */

function getCurrentProject() {
  return S.projects.find(
    project =>
      project.id ===
      S.currentProjectId
  );
}


/* =========================================================
   SAVE PROJECT
========================================================= */

function saveCurrentProject(
  showMessage = true
) {
  let project =
    getCurrentProject();


  if (!project) {

    project =
      createProject(
        $("projectName")
          ?.value.trim() ||
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

      project.thumbnail =
        null;
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


/* =========================================================
   OPEN PROJECT
========================================================= */

function openProject(
  id
) {
  const project =
    S.projects.find(
      item =>
        item.id === id
    );


  if (!project) {
    return;
  }


  S.currentProjectId =
    project.id;


  if ($("projectName")) {

    $("projectName").value =
      project.name;
  }


  loadScene(
    project.objects || []
  );


  writeStorage(
    STORAGE.currentProject,
    project.id
  );


  location.hash =
    "#studio";


  showToast(
    `Opened "${project.name}".`
  );
}


/* =========================================================
   RENAME PROJECT
========================================================= */

function renameProject(
  id
) {
  const project =
    S.projects.find(
      item =>
        item.id === id
    );


  if (!project) {
    return;
  }


  const newName =
    prompt(
      "Enter the new project name:",
      project.name
    );


  if (
    !newName?.trim()
  ) {
    return;
  }


  project.name =
    newName.trim();


  project.updatedAt =
    new Date().toISOString();


  if (
    S.currentProjectId ===
    project.id
  ) {

    if ($("projectName")) {

      $("projectName").value =
        project.name;
    }
  }


  writeStorage(
    STORAGE.projects,
    S.projects
  );


  renderProjects();


  showToast(
    "Project renamed."
  );
}


/* =========================================================
   DUPLICATE PROJECT
========================================================= */

function duplicateProject(
  id
) {
  const original =
    S.projects.find(
      item =>
        item.id === id
    );


  if (!original) {
    return;
  }


  const duplicate = {

    ...original,

    id:
      typeof crypto !== "undefined" &&
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
          original.objects || []
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


/* =========================================================
   DELETE PROJECT
========================================================= */

function deleteProject(
  id
) {
  const project =
    S.projects.find(
      item =>
        item.id === id
    );


  if (!project) {
    return;
  }


  if (
    !confirm(
      `Delete "${project.name}"?`
    )
  ) {
    return;
  }


  S.projects =
    S.projects.filter(
      item =>
        item.id !== id
    );


  if (
    S.currentProjectId === id
  ) {

    S.currentProjectId =
      null;


    clearScene();


    if ($("projectName")) {
      $("projectName").value =
        "";
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


  showToast(
    "Project deleted."
  );
}


/* =========================================================
   PROJECT UI
========================================================= */

function renderProjects() {
  const grid =
    $("projectGrid");


  if (!grid) {
    return;
  }


  if (!S.projects.length) {

    grid.innerHTML = `

      <article class="card">

        <h3>
          No projects yet
        </h3>

        <p>
          Create your first project and start building a scene
          in the 3D Studio.
        </p>

      </article>

    `;

    return;
  }


  grid.innerHTML =
    S.projects
      .map(
        project => `

          <article class="project-card">

            <div class="project-preview">

              ${
                project.thumbnail

                  ? `
                    <img
                      src="${project.thumbnail}"
                      alt="${escapeAttribute(
                        project.name
                      )} preview"
                    />
                  `

                  : `
                    <span class="muted">
                      3D Scene
                    </span>
                  `
              }

            </div>


            <h3>
              ${escapeHtml(
                project.name
              )}
            </h3>


            <p>
              ${
                project.objects?.length ||
                0
              }
              object${
                project.objects?.length ===
                1
                  ? ""
                  : "s"
              }
            </p>


            <p class="muted">

              Updated

              ${formatDate(
                project.updatedAt
              )}

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

        `
      )
      .join("");


  grid
    .querySelectorAll(
      "[data-project-action]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const action =
            button.dataset
              .projectAction;


          const id =
            button.dataset
              .projectId;


          if (
            action === "open"
          ) {
            openProject(id);
          }


          if (
            action === "rename"
          ) {
            renameProject(id);
          }


          if (
            action === "duplicate"
          ) {
            duplicateProject(id);
          }


          if (
            action === "delete"
          ) {
            deleteProject(id);
          }
        }
      );
    });
}


/* =========================================================
   GALLERY
========================================================= */

function renderGallery(
  filter = "all"
) {
  const grid =
    $("galleryGrid");


  if (!grid) {
    return;
  }


  const items =
    filter === "all"

      ? S.gallery

      : S.gallery.filter(
          item =>
            item.category ===
            filter
        );


  if (!items.length) {

    grid.innerHTML = `

      <article class="card">

        <h3>
          Your gallery is empty.
        </h3>

        <p>
          Export a scene from the Studio or save a project
          to begin building your showcase.
        </p>

      </article>

    `;

    return;
  }


  grid.innerHTML =
    items
      .map(
        item => `

          <article class="gallery-card">

            ${
              item.image

                ? `
                  <img
                    src="${item.image}"
                    alt="${escapeAttribute(
                      item.title
                    )}"
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
                ${escapeHtml(
                  item.title
                )}
              </h3>


              <p>
                ${escapeHtml(
                  item.description ||
                    ""
                )}
              </p>

            </div>

          </article>

        `
      )
      .join("");
}


/* =========================================================
   EXPORT PNG
========================================================= */

function exportPNG() {
  if (!S.renderer) {
    return;
  }


  S.renderer.render(
    S.scene,
    S.camera
  );


  const link =
    document.createElement(
      "a"
    );


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


/* =========================================================
   SAVE GALLERY IMAGE
========================================================= */

function saveGalleryImage() {
  if (!S.renderer) {
    return;
  }


  const project =
    getCurrentProject();


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
        object =>
          object.type ===
          "human"
      )
        ? "character"
        : "3d",

    image:
      S.renderer.domElement.toDataURL(
        "image/jpeg",
        0.8
      ),

    createdAt:
      new Date().toISOString()
  });


  S.gallery =
    S.gallery.slice(
      0,
      40
    );


  writeStorage(
    STORAGE.gallery,
    S.gallery
  );


  renderGallery();
}


/* =========================================================
   STUDIO CONTROLS
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


  objectMenu
    ?.querySelectorAll(
      "[data-object-type]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        event => {

          event.stopPropagation();


          createObject(
            button.dataset
              .objectType
          );


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
        objectMenu &&
        createButton &&
        !objectMenu.contains(
          event.target
        ) &&
        !createButton.contains(
          event.target
        )
      ) {

        objectMenu.classList.remove(
          "open"
        );
      }
    }
  );


  $("playButton")?.addEventListener(
    "click",
    () =>
      setPlaying(true)
  );


  $("pauseButton")?.addEventListener(
    "click",
    () =>
      setPlaying(false)
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
        $("projectName")
          ?.value.trim();


      createProject(
        name ||
        "Untitled CGI Project"
      );


      clearScene();


      location.hash =
        "#studio";
    }
  );


  $("saveProjectButton")?.addEventListener(
    "click",
    () =>
      saveCurrentProject(true)
  );
}


/* =========================================================
   GALLERY CONTROLS
========================================================= */

function initializeGalleryControls() {

  document
    .querySelectorAll(
      "[data-gallery-filter]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(
              "[data-gallery-filter]"
            )
            .forEach(item => {

              item.classList.remove(
                "active"
              );
            });


          button.classList.add(
            "active"
          );


          renderGallery(
            button.dataset
              .galleryFilter
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


  if ($("reduceMotion")) {

    $("reduceMotion").checked =
      S.settings.reduceMotion;
  }


  if ($("showGrid")) {

    $("showGrid").checked =
      S.settings.showGrid;
  }


  if ($("autoSave")) {

    $("autoSave").checked =
      S.settings.autoSave;
  }


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

      if (
        !confirm(
          "Delete all CGI Studio local data?"
        )
      ) {
        return;
      }


      Object.values(
        STORAGE
      ).forEach(
        key =>
          localStorage.removeItem(
            key
          )
      );


      S.projects = [];

      S.gallery = [];

      S.currentProjectId =
        null;


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
        $("contactName")
          ?.value.trim();


      const email =
        $("contactEmail")
          ?.value.trim();


      const subject =
        $("contactSubject")
          ?.value.trim();


      const message =
        $("contactMessage")
          ?.value.trim();


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


      window.location.href =
        `mailto:?subject=${encodeURIComponent(
          subject
        )}&body=${encodeURIComponent(
          `Name: ${name}\nEmail: ${email}\n\n${message}`
        )}`;


      showToast(
        "Opening your email application."
      );
    }
  );
}


/* =========================================================
   AUTO SAVE
========================================================= */

setInterval(
  () => {

    if (
      S.settings.autoSave &&
      S.currentProjectId &&
      S.objects.length
    ) {

      saveCurrentProject(
        false
      );
    }

  },
  15000
);


/* =========================================================
   UTILITIES
========================================================= */

function capitalize(
  value
) {
  return (
    String(value)
      .charAt(0)
      .toUpperCase() +
    String(value).slice(1)
  );
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
      Math.random() *
      colors.length
    )
  ];
}


function formatDate(
  date
) {

  if (!date) {
    return "Unknown";
  }


  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  ).format(
    new Date(date)
  );
}


function escapeHtml(
  value
) {
  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}


function escapeAttribute(
  value
) {
  return escapeHtml(
    value
  );
}


/* =========================================================
   DISPOSE
========================================================= */

function disposeObject(
  object
) {

  object.traverse(
    child => {

      if (child.geometry) {
        child.geometry.dispose();
      }


      if (child.material) {

        const materials =
          Array.isArray(
            child.material
          )
            ? child.material
            : [child.material];


        materials.forEach(
          material => {

            if (
              material.map
            ) {
              material.map.dispose();
            }


            if (
              material.normalMap
            ) {
              material.normalMap.dispose();
            }


            if (
              material.roughnessMap
            ) {
              material.roughnessMap.dispose();
            }


            if (
              material.metalnessMap
            ) {
              material.metalnessMap.dispose();
            }


            material.dispose();
          }
        );
      }
    }
  );
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

    S.currentProjectId =
      null;
  }
}


/* =========================================================
   INITIALIZE APPLICATION
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


  /* IMPORTANT:
     This creates the 3D cube AND human. */

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


  if (
    S.currentProjectId
  ) {

    const project =
      getCurrentProject();


    if (
      project &&
      $("projectName")
    ) {

      $("projectName").value =
        project.name;
    }
  }


  console.log(
    "CGI Studio initialized successfully."
  );
}


/* =========================================================
   START APPLICATION
========================================================= */

initialize();
