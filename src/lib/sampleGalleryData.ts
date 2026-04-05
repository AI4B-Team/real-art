/* 50 sample images per gallery tab on /create */

const UNSPLASH_PHOTOS = [
  "photo-1618005182384-a83a8bd57fbe", "photo-1558618666-fcd25c85cd64",
  "photo-1541701494587-cb58502866ab", "photo-1549880338-65ddcdfd017b",
  "photo-1557682250-33bd709cbe85", "photo-1506905925346-21bda4d32df4",
  "photo-1604881991720-f91add269bed", "photo-1462275646964-a0e3386b89fa",
  "photo-1579546929518-9e396f3cc809", "photo-1547036967-23d11aacaee0",
  "photo-1518020382113-a7e8fc38eac9", "photo-1576091160550-2173dba999ef",
  "photo-1470071459604-3b5ec3a7fe05", "photo-1501854140801-50d01698950b",
  "photo-1465146344425-f00d5f5c8f07", "photo-1500534314209-a25ddb2bd429",
  "photo-1493246507139-91e8fad9978e", "photo-1483728642387-6c3bdd6c93e5",
  "photo-1519681393784-d120267933ba", "photo-1483728642387-6c3bdd6c93e5",
  "photo-1507400492013-162706c8c05e", "photo-1516117172878-fd2c41f4a759",
  "photo-1531297484001-80022131f5a1", "photo-1451187580459-43490279c0fa",
  "photo-1488590528505-98d2b5aba04b", "photo-1518770660439-4636190af475",
  "photo-1526374965328-7f61d4dc18c5", "photo-1550751827-4bd374c3f58b",
  "photo-1535016120720-40c646be5580", "photo-1525547719571-a2d4ac8945e2",
  "photo-1558591710-4b4a1ae0f04d", "photo-1551434678-e076c223a692",
  "photo-1487058792275-0ad4aaf24ca7", "photo-1509718443690-d8e2fb3474b7",
  "photo-1534972195531-d756b9bfa9f2", "photo-1517694712202-14dd9538aa97",
  "photo-1504384308090-c894fdcc538d", "photo-1550439062-609e1531270e",
  "photo-1544256718-3bcf237f3974", "photo-1496181133206-80ce9b88a853",
  "photo-1536148935331-408321065b18", "photo-1563089145-599997674d42",
  "photo-1501862700950-18382cd41497", "photo-1542831371-29b0f74f9713",
  "photo-1555949963-ff9fe0c870eb", "photo-1523821741446-edb2b68bb7a0",
  "photo-1520962880247-cfaf541c8724", "photo-1494548162494-384bba4ab999",
  "photo-1500462918059-b1a0cb512f1d", "photo-1444464666168-49d633b86797",
  "photo-1414609245224-afa02bfb3fda", "photo-1506744038136-46273834b3fb",
  "photo-1472214103451-9374bd1c798e", "photo-1490730141103-6cac27aaab94",
];

const TITLES = [
  "Cosmic Dreamscape", "Digital Nebula", "Molten Abstract", "Mountain Vista",
  "Neon Boulevard", "Sunset Peak", "Digital Bloom", "Celestial Dance",
  "Chromatic Drift", "Holographic Portrait", "Ocean Depths", "Abstract Fluid",
  "Nature's Canvas", "Autumn Path", "Wild Meadow", "Horizon Line",
  "Stellar Nova", "Crystal Matrix", "Arctic Aurora", "Tropical Glow",
  "Circuit Dreams", "Silk Threads", "Code Rain", "Galaxy Spiral",
  "Binary Sunset", "Silicon Valley", "Pixel Storm", "Quantum Leap",
  "Neon Jungle", "Glass Horizon", "Vapor Trail", "Team Sync",
  "Retro Wave", "Data Stream", "Gradient Flux", "Terminal Green",
  "Cloud Nine", "Neural Path", "Deep Focus", "Light Leak",
  "Steel Bloom", "Prism Shift", "Shadow Play", "Ink Drop",
  "Fractal Bloom", "Echo Chamber", "Dusk Rider", "Solar Flare",
  "Iron Moss", "Tide Pool",
  "Velvet Dusk", "Sky Nomad", "Ember Glow", "Still Water",
];

const CREATORS = [
  "xavierml", "neonvision", "arcanist", "cyberself", "luminos",
  "dawnrise", "wabi_sabi", "forestmind", "pixelpoet", "synthwave",
  "glitchart", "voidwalker", "chromakey", "dreamcore", "nebulaink",
];

const MODELS = [
  "Flux Pro", "Midjourney v6", "DALL-E 3", "Seedream 4.0",
  "Imagen 4 Ultra", "Flux Max", "Grok Imagine", "Stable Diffusion XL",
];

const CATEGORIES = ["Design", "Content", "Video", "Image", "Audio"];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function makeSamples(count: number, idPrefix: string, indexOffset: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `${idPrefix}${i + 1}`,
    photo: pick(UNSPLASH_PHOTOS, i + indexOffset),
    title: pick(TITLES, i + indexOffset),
    creator: pick(CREATORS, i + indexOffset),
    likes: Math.floor(Math.random() * 5000) + 100,
    model: pick(MODELS, i + indexOffset),
    category: pick(CATEGORIES, i + indexOffset),
    uses: `${(Math.random() * 10 + 0.5).toFixed(1)}k`,
  }));
}

export const SAMPLE_CREATIONS = makeSamples(54, "cr-", 0);
export const SAMPLE_FAVORITES = makeSamples(54, "fv-", 7);
export const SAMPLE_COLLECTIONS = makeSamples(54, "cl-", 13);
export const SAMPLE_COMMUNITY = makeSamples(54, "cm-", 19);
export const SAMPLE_TEMPLATES = makeSamples(54, "tp-", 31);
