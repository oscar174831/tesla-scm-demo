import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const suppliers = {
  magna: {
    name: "Magna benchmark",
    shortName: "Magna",
    ticker: "MGA",
    type: "Public body structures benchmark",
    note:
      "Use as a public benchmark for body structures and stamping research. Do not present this as Tesla confidential supplier knowledge.",
    quote: 18.42,
    baseCost: { material: 7.22, stamping: 3.48, assembly: 2.35, logistics: 1.08, overhead: 2.15 },
    tooling: 1.8,
    capacity: 1.18,
    quality: 84,
    financial: 78,
    capability: 91,
    activeStage: "buyoff",
    filings: [
      ["SEC", "https://www.sec.gov/edgar/browse/?CIK=749098"],
      ["Annual report", "https://magna-ap.magna.com/docs/default-source/financial-reports-public-filings/annual-reports/2024-annual-report---magna---aoda.pdf"],
      ["IR page", "https://www.magna.com/company/investors"],
    ],
    questions: [
      "What assumptions drive your blank size, yield, die amortization, and freight?",
      "Which press line is allocated, and what is the real available capacity through SOP plus service ramp?",
      "Which open dimensional risks remain after buyoff, and what evidence closes them?",
    ],
  },
  gestamp: {
    name: "Gestamp benchmark",
    shortName: "Gestamp",
    ticker: "BME:GEST",
    type: "Public metal components benchmark",
    note:
      "Useful for public research on hot stamping, body-in-white structures, investment intensity, and EV platform exposure.",
    quote: 17.95,
    baseCost: { material: 7.05, stamping: 3.64, assembly: 2.28, logistics: 1.28, overhead: 2.05 },
    tooling: 2.25,
    capacity: 1.07,
    quality: 81,
    financial: 70,
    capability: 93,
    activeStage: "machining",
    filings: [
      ["Annual info", "https://www.gestamp.com/Investors-Shareholders/Economic-Financial-information/Annual-Information"],
      ["Corporate", "https://www.gestamp.com/Investors-Shareholders/Corporate-Governance/Corporate-Reports"],
      ["Sustainability", "https://www.gestamp.com/sustainability/sustainability-report"],
    ],
    questions: [
      "How much of the quote is driven by hot-stamping cycle time, energy, and tool maintenance?",
      "What is the contingency plan if the assigned die shop misses machining or tryout milestones?",
      "Can you support engineering changes without resetting the launch timeline?",
    ],
  },
  martinrea: {
    name: "Martinrea benchmark",
    shortName: "Martinrea",
    ticker: "TSX:MRE",
    type: "Public lightweight structures benchmark",
    note:
      "Good benchmark for lightweight structures, customer concentration, operational improvement, and supplier risk review.",
    quote: 18.88,
    baseCost: { material: 7.36, stamping: 3.55, assembly: 2.42, logistics: 1.16, overhead: 2.22 },
    tooling: 1.65,
    capacity: 0.98,
    quality: 77,
    financial: 74,
    capability: 86,
    activeStage: "tryout",
    filings: [
      ["IR page", "https://www.martinrea.com/investor-relations/"],
      ["Annual report", "https://www.martinrea.com/wp-content/uploads/Q4-2024-Annual-Report.pdf"],
      ["Sustainability", "https://www.martinrea.com/news-release/martinrea-international-inc-publishes-2024-sustainability-report/"],
    ],
    questions: [
      "What capacity cushion exists if service demand spikes or quality containment consumes good inventory?",
      "Which customer/platform concentration risks could affect priority during a launch conflict?",
      "What corrective-action evidence will you provide before controlled release?",
    ],
  },
};

const scenarios = {
  baseline: {
    label: "Launch watch",
    stage: "buyoff",
    accent: 0xe31937,
    quoteMultiplier: 1,
    scrapAdd: 0,
    capacityPenalty: 0,
    speed: 1,
    actions: [
      "Run DFM with two finalists before final nomination.",
      "Separate piece price from tooling and capex in the negotiation record.",
      "Confirm planner demand versus supplier press-line capacity through SOP and service ramp.",
    ],
  },
  quoteShock: {
    label: "Cost challenge",
    stage: "simulation",
    accent: 0xffb84d,
    quoteMultiplier: 1.12,
    scrapAdd: 1.5,
    capacityPenalty: 0,
    speed: 1.15,
    actions: [
      "Request a cost bridge for material index, blank utilization, scrap, margin, and logistics.",
      "Run VAVE options: blank nesting, secondary-operation reduction, packaging density, and freight mode.",
      "Use should-cost to negotiate fact by fact, not by asking for an arbitrary discount.",
    ],
  },
  toolingDelay: {
    label: "Tooling recovery",
    stage: "machining",
    accent: 0xffb84d,
    quoteMultiplier: 1.04,
    scrapAdd: 0.8,
    capacityPenalty: 0.08,
    speed: 1.42,
    actions: [
      "Find the exact bottleneck: simulation, die design, machining, assembly, tryout, buyoff, or homeline.",
      "Build a recovery plan with SIE, supplier owners, dates, evidence, and escalation thresholds.",
      "Quantify impact to RC2, pilot, SOP, and service/collision-center readiness.",
    ],
  },
  qualityContainment: {
    label: "Quality hold",
    stage: "tryout",
    accent: 0x63b3ff,
    quoteMultiplier: 1.06,
    scrapAdd: 3.5,
    capacityPenalty: 0.16,
    speed: 0.85,
    actions: [
      "Contain lots, open orders, service inventory, and collision-center exposure before debating blame.",
      "Pull SIE and quality into root cause: die wear, springback, material variation, setup, or inspection.",
      "Require scan data, capability evidence, corrective action owner, and due date before release.",
    ],
  },
};

const stages = ["simulation", "dieDesign", "machining", "tryout", "buyoff", "homeline"];
const state = {
  supplier: "magna",
  scenario: "baseline",
  materialIndex: 108,
  scrapRate: 7,
  logisticsMiles: 420,
  annualVolume: 90000,
};

const els = {
  selectedSupplier: document.querySelector("#selectedSupplier"),
  programStatus: document.querySelector("#programStatus"),
  gapMetric: document.querySelector("#gapMetric"),
  riskMetric: document.querySelector("#riskMetric"),
  supplierPicker: document.querySelector("#supplierPicker"),
  supplierNote: document.querySelector("#supplierNote"),
  sourceLinks: document.querySelector("#sourceLinks"),
  piecePrice: document.querySelector("#piecePrice"),
  shouldCost: document.querySelector("#shouldCost"),
  toolingCost: document.querySelector("#toolingCost"),
  capacityCover: document.querySelector("#capacityCover"),
  costStack: document.querySelector("#costStack"),
  actionList: document.querySelector("#actionList"),
  questionList: document.querySelector("#questionList"),
  scenarioButtons: [...document.querySelectorAll(".scenario-button")],
  stageButtons: [...document.querySelectorAll(".stage")],
  sliders: {
    materialIndex: document.querySelector("#materialIndex"),
    scrapRate: document.querySelector("#scrapRate"),
    logisticsMiles: document.querySelector("#logisticsMiles"),
    annualVolume: document.querySelector("#annualVolume"),
  },
  sliderValues: {
    materialIndex: document.querySelector("#materialIndexValue"),
    scrapRate: document.querySelector("#scrapRateValue"),
    logisticsMiles: document.querySelector("#logisticsMilesValue"),
    annualVolume: document.querySelector("#annualVolumeValue"),
  },
};

const canvas = document.querySelector("#heroScene");
const host = document.querySelector("#sceneHost");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x050506, 9, 28);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(6.4, 4.3, 8.4);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.maxDistance = 15;
controls.minDistance = 5;
controls.target.set(0.2, 0.8, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.58));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.25);
keyLight.position.set(3.2, 6, 4.2);
keyLight.castShadow = true;
scene.add(keyLight);
const accentLight = new THREE.PointLight(0xe31937, 4.4, 19);
accentLight.position.set(-4, 2.7, 3);
scene.add(accentLight);
const coolLight = new THREE.PointLight(0x63b3ff, 1.9, 16);
coolLight.position.set(4, 2.8, -4);
scene.add(coolLight);

const materials = {
  floor: new THREE.MeshStandardMaterial({ color: 0x151517, roughness: 0.78, metalness: 0.2 }),
  metal: new THREE.MeshStandardMaterial({ color: 0xb7bbc2, roughness: 0.28, metalness: 0.82 }),
  darkMetal: new THREE.MeshStandardMaterial({ color: 0x24262b, roughness: 0.32, metalness: 0.78 }),
  accent: new THREE.MeshStandardMaterial({ color: 0xe31937, roughness: 0.42, metalness: 0.32 }),
  sheet: new THREE.MeshStandardMaterial({ color: 0xdfe3ea, roughness: 0.2, metalness: 0.88 }),
  risk: new THREE.MeshBasicMaterial({ color: 0xe31937, transparent: true, opacity: 0.22 }),
  stageOff: new THREE.MeshStandardMaterial({ color: 0x33363c, roughness: 0.4, metalness: 0.6 }),
};

const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), materials.floor);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);
const grid = new THREE.GridHelper(18, 28, 0x3c3c40, 0x202024);
grid.position.y = 0.01;
scene.add(grid);

const press = new THREE.Group();
scene.add(press);
function cube(name, size, position, material, parent = press) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

cube("pressBase", [4.7, 0.34, 2.7], [0, 0.18, 0], materials.darkMetal);
cube("pressTop", [4.9, 0.55, 2.8], [0, 3.15, 0], materials.darkMetal);
cube("leftColumn", [0.42, 2.8, 0.42], [-2.05, 1.65, -1.06], materials.metal);
cube("rightColumn", [0.42, 2.8, 0.42], [2.05, 1.65, -1.06], materials.metal);
cube("leftColumnBack", [0.42, 2.8, 0.42], [-2.05, 1.65, 1.06], materials.metal);
cube("rightColumnBack", [0.42, 2.8, 0.42], [2.05, 1.65, 1.06], materials.metal);
const ram = cube("movingRam", [3.45, 0.34, 1.78], [0, 2.15, 0], materials.accent);
cube("upperDie", [2.9, 0.22, 1.45], [0, 1.78, 0], materials.metal);
cube("lowerDie", [2.9, 0.22, 1.45], [0, 0.72, 0], materials.metal);

const sheet = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.035, 1.05), materials.sheet);
sheet.position.set(-4, 0.98, 0);
sheet.castShadow = true;
scene.add(sheet);
const stampedPart = new THREE.Mesh(new THREE.TorusKnotGeometry(0.55, 0.07, 90, 10), materials.sheet);
stampedPart.position.set(4.35, 1.08, 0);
stampedPart.rotation.set(Math.PI / 2, 0.2, 0);
stampedPart.castShadow = true;
scene.add(stampedPart);

const riskHalo = new THREE.Mesh(
  new THREE.TorusGeometry(2.6, 0.018, 8, 100),
  new THREE.MeshBasicMaterial({ color: 0xe31937, transparent: true, opacity: 0.28 })
);
riskHalo.rotation.x = Math.PI / 2;
riskHalo.position.set(0, 1.02, 0);
scene.add(riskHalo);

const stageGroup = new THREE.Group();
stageGroup.position.set(-3.3, 0.12, 3.2);
scene.add(stageGroup);
const stageMeshes = {};
stages.forEach((stage, i) => {
  const block = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.12, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x34363d, roughness: 0.38, metalness: 0.54 })
  );
  block.position.set(i * 0.84, 0, 0);
  block.castShadow = true;
  stageGroup.add(block);
  stageMeshes[stage] = block;
});

const nodeGroup = new THREE.Group();
scene.add(nodeGroup);
const supplierNodes = {};
const supplierKeys = Object.keys(suppliers);
supplierKeys.forEach((key, i) => {
  const angle = (i / supplierKeys.length) * Math.PI * 2 + 0.7;
  const radius = 5.45;
  const group = new THREE.Group();
  group.userData.supplierKey = key;
  group.position.set(Math.cos(angle) * radius, 1.18 + i * 0.18, Math.sin(angle) * radius);
  const node = new THREE.Mesh(
    new THREE.SphereGeometry(0.23, 28, 28),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.22, metalness: 0.55 })
  );
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.46, 0.014, 8, 54),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.48 })
  );
  ring.rotation.x = Math.PI / 2;
  group.add(node, ring);
  nodeGroup.add(group);
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 1.5, 0), group.position.clone()]),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 })
  );
  scene.add(line);
  supplierNodes[key] = { group, node, ring, line };
});

const flowMarkers = [];
const flowMaterial = new THREE.MeshBasicMaterial({ color: 0xe31937, transparent: true, opacity: 0.9 });
for (let i = 0; i < 10; i += 1) {
  const marker = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 14), flowMaterial.clone());
  marker.userData.offset = i / 10;
  scene.add(marker);
  flowMarkers.push(marker);
}

const outboundMarkers = [];
for (let i = 0; i < 6; i += 1) {
  const marker = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.1), materials.sheet.clone());
  marker.userData.offset = i / 6;
  scene.add(marker);
  outboundMarkers.push(marker);
}

const particles = new THREE.Group();
scene.add(particles);
for (let i = 0; i < 72; i += 1) {
  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.025, 8, 8),
    new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0xe31937 : 0xffffff, transparent: true, opacity: 0.56 })
  );
  dot.position.set((Math.random() - 0.5) * 12, Math.random() * 4.2 + 0.25, (Math.random() - 0.5) * 9);
  particles.add(dot);
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let currentAccent = new THREE.Color(0xe31937);
let currentRiskScore = 45;
let currentSpeed = 1;

function money(value) {
  return `$${value.toFixed(2)}`;
}

function percent(value) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function riskLabel(score) {
  if (score >= 72) return "High";
  if (score >= 46) return "Medium";
  return "Low";
}

function calculateModel() {
  const supplier = suppliers[state.supplier];
  const scenario = scenarios[state.scenario];
  const scrapRate = state.scrapRate + scenario.scrapAdd;
  const capacity = Math.max(0.72, supplier.capacity - scenario.capacityPenalty);
  const material = supplier.baseCost.material * (state.materialIndex / 100);
  const stamping = supplier.baseCost.stamping * (1 + scrapRate / 100);
  const assembly = supplier.baseCost.assembly;
  const logistics = supplier.baseCost.logistics * (0.74 + state.logisticsMiles / 900);
  const toolingCarry = (supplier.tooling * 1000000) / (state.annualVolume * 45);
  const overhead = supplier.baseCost.overhead;
  const shouldCost = material + stamping + assembly + logistics + toolingCarry + overhead;
  const quote = supplier.quote * scenario.quoteMultiplier;
  const gap = ((quote - shouldCost) / shouldCost) * 100;
  const riskScore =
    Math.max(0, gap) * 2.1 +
    Math.max(0, 1.08 - capacity) * 75 +
    (100 - supplier.quality) * 0.45 +
    (100 - supplier.financial) * 0.28 +
    (state.scrapRate - 4) * 1.6;
  const total = material + stamping + assembly + logistics + overhead + toolingCarry;
  return {
    supplier,
    scenario,
    quote,
    shouldCost,
    gap,
    capacity,
    riskScore: Math.round(Math.min(99, Math.max(12, riskScore))),
    costParts: {
      Material: material,
      Stamping: stamping,
      Assembly: assembly,
      Logistics: logistics,
      "Tool carry": toolingCarry,
      OH: overhead,
    },
    total,
  };
}

function renderSupplierPicker() {
  els.supplierPicker.innerHTML = supplierKeys
    .map((key) => {
      const supplier = suppliers[key];
      return `<button class="supplier-card ${key === state.supplier ? "active" : ""}" data-supplier="${key}">
        <strong>${supplier.shortName}</strong>
        <span>${supplier.type}</span>
      </button>`;
    })
    .join("");
  els.supplierPicker.querySelectorAll("[data-supplier]").forEach((button) => {
    button.addEventListener("click", () => {
      state.supplier = button.dataset.supplier;
      updateAll();
    });
  });
}

function updateSources(supplier) {
  els.supplierNote.textContent = supplier.note;
  els.sourceLinks.innerHTML = supplier.filings
    .map(
      ([label, url]) =>
        `<a href="${url}" target="_blank" rel="noopener"><i data-lucide="external-link"></i><span>${label}</span></a>`
    )
    .join("");
}

function updateCostStack(model) {
  els.costStack.innerHTML = Object.entries(model.costParts)
    .map(([label, value]) => {
      const share = Math.round((value / model.total) * 100);
      return `<div class="bar-row">
        <span>${label}</span>
        <div><b style="width:${Math.min(100, share * 1.65)}%"></b></div>
        <em>${share}%</em>
      </div>`;
    })
    .join("");
}

function updateStages(activeStage, riskScore) {
  els.stageButtons.forEach((button) => {
    const active = button.dataset.stage === activeStage;
    button.classList.toggle("active", active);
    button.classList.toggle("warning", active && riskScore >= 55);
  });
  stages.forEach((stage) => {
    const mesh = stageMeshes[stage];
    const active = stage === activeStage;
    mesh.material.color.set(active ? currentAccent : 0x34363d);
    mesh.scale.y = active ? 2.2 : 1;
  });
}

function update3D(model) {
  currentAccent = new THREE.Color(model.scenario.accent);
  currentRiskScore = model.riskScore;
  currentSpeed = model.scenario.speed * (model.capacity < 1 ? 0.82 : 1);
  materials.accent.color.lerp(currentAccent, 0.55);
  accentLight.color.copy(currentAccent);
  accentLight.intensity = 3.4 + model.riskScore / 18;
  riskHalo.material.color.copy(currentAccent);
  riskHalo.material.opacity = 0.12 + model.riskScore / 420;
  riskHalo.scale.setScalar(0.9 + model.riskScore / 105);
  Object.entries(supplierNodes).forEach(([key, item]) => {
    const selected = key === state.supplier;
    item.node.material.color.set(selected ? model.scenario.accent : 0xffffff);
    item.node.scale.setScalar(selected ? 1.5 : 1);
    item.ring.material.color.set(selected ? model.scenario.accent : 0xffffff);
    item.ring.material.opacity = selected ? 0.95 : 0.34;
    item.line.material.color.set(selected ? model.scenario.accent : 0xffffff);
    item.line.material.opacity = selected ? 0.58 : 0.15;
  });
  updateStages(model.scenario.stage || model.supplier.activeStage, model.riskScore);
}

function updateAll() {
  const model = calculateModel();
  const riskText = riskLabel(model.riskScore);
  els.selectedSupplier.textContent = model.supplier.name;
  els.programStatus.textContent = model.scenario.label;
  els.gapMetric.textContent = percent(model.gap);
  els.riskMetric.textContent = riskText;
  els.piecePrice.textContent = money(model.quote);
  els.shouldCost.textContent = money(model.shouldCost);
  els.toolingCost.textContent = `$${model.supplier.tooling.toFixed(2)}M`;
  els.capacityCover.textContent = `${model.capacity.toFixed(2)}x`;
  els.sliderValues.materialIndex.textContent = `${state.materialIndex}%`;
  els.sliderValues.scrapRate.textContent = `${state.scrapRate}%`;
  els.sliderValues.logisticsMiles.textContent = `${state.logisticsMiles} mi`;
  els.sliderValues.annualVolume.textContent = `${Math.round(state.annualVolume / 1000)}k`;
  els.actionList.innerHTML = model.scenario.actions.map((action) => `<li>${action}</li>`).join("");
  els.questionList.innerHTML = model.supplier.questions.map((question) => `<li>${question}</li>`).join("");
  els.scenarioButtons.forEach((button) => button.classList.toggle("active", button.dataset.scenario === state.scenario));
  renderSupplierPicker();
  updateSources(model.supplier);
  updateCostStack(model);
  update3D(model);
  if (window.lucide) window.lucide.createIcons();
}

els.scenarioButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.scenario = button.dataset.scenario;
    updateAll();
  });
});

const stageScenarioMap = {
  simulation: "quoteShock",
  dieDesign: "toolingDelay",
  machining: "toolingDelay",
  tryout: "qualityContainment",
  buyoff: "baseline",
  homeline: "baseline",
};

els.stageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.scenario = stageScenarioMap[button.dataset.stage] || "baseline";
    updateAll();
  });
});

Object.entries(els.sliders).forEach(([key, input]) => {
  input.addEventListener("input", () => {
    state[key] = Number(input.value);
    updateAll();
  });
});

canvas.addEventListener("pointerdown", (event) => {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(Object.values(supplierNodes).map((item) => item.node), false);
  if (!hits.length) return;
  const hitGroup = hits[0].object.parent;
  if (hitGroup?.userData?.supplierKey) {
    state.supplier = hitGroup.userData.supplierKey;
    updateAll();
  }
});

function resize() {
  const rect = host.getBoundingClientRect();
  const width = Math.max(320, rect.width);
  const height = Math.max(420, rect.height);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize);
resize();
updateAll();

const clock = new THREE.Clock();
function animate() {
  const elapsed = clock.getElapsedTime();
  controls.update();
  const ramTravel = Math.sin(elapsed * 2.2 * currentSpeed) * 0.16;
  ram.position.y = 2.1 + ramTravel;
  sheet.position.x = -4 + ((elapsed * 0.8 * currentSpeed) % 8);
  stampedPart.rotation.z += 0.006 * currentSpeed;
  stampedPart.position.y = 1.06 + Math.sin(elapsed * 1.4) * 0.05;
  particles.children.forEach((dot, index) => {
    dot.position.y += 0.005 * currentSpeed * (1 + currentRiskScore / 95);
    dot.material.opacity = 0.25 + Math.abs(Math.sin(elapsed + index)) * 0.42;
    if (dot.position.y > 4.8) dot.position.y = 0.25;
  });
  Object.values(supplierNodes).forEach((item, index) => {
    item.ring.rotation.z += 0.01 + index * 0.002;
    item.group.position.y += Math.sin(elapsed * 1.4 + index) * 0.0009;
  });
  const activeNode = supplierNodes[state.supplier]?.group;
  if (activeNode) {
    const start = activeNode.position.clone();
    const dieEntry = new THREE.Vector3(-1.2, 1.08, 0);
    const pressCenter = new THREE.Vector3(0, 1.25, 0);
    flowMarkers.forEach((marker) => {
      const t = (elapsed * 0.23 * currentSpeed + marker.userData.offset) % 1;
      const curveLift = Math.sin(t * Math.PI) * (0.7 + currentRiskScore / 140);
      marker.position.lerpVectors(start, dieEntry, t);
      marker.position.y += curveLift;
      marker.material.color.copy(currentAccent);
      marker.material.opacity = 0.45 + currentRiskScore / 150;
      marker.scale.setScalar(0.72 + currentRiskScore / 120);
    });
    outboundMarkers.forEach((marker) => {
      const t = (elapsed * 0.18 * currentSpeed + marker.userData.offset) % 1;
      marker.position.lerpVectors(pressCenter, new THREE.Vector3(4.6, 1.04, 0), t);
      marker.position.y += Math.sin(t * Math.PI) * 0.28;
      marker.rotation.y = elapsed * 0.8 + t;
      marker.material.color.set(currentRiskScore > 65 ? 0xffb84d : 0xdfe3ea);
      marker.scale.setScalar(currentRiskScore > 65 ? 1.25 : 1);
    });
  }
  riskHalo.rotation.z += 0.008 * currentSpeed;
  stageGroup.children.forEach((mesh, index) => {
    mesh.position.y = Math.sin(elapsed * 1.8 + index) * 0.02;
  });
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
