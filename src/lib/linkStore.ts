// Link Store — per-image and per-collection external/affiliate links

export interface ImageLink {
  imageId: string;
  url: string;
  label: string;
  price?: string;
  site?: string;
  isAffiliate: boolean;
  clicks: number;
  createdAt: string;
}

export interface CollectionLink {
  collectionId: string;
  defaultUrl: string;
  defaultLabel: string;
  defaultSite: string;
  isAffiliate: boolean;
}

const IMAGE_KEY = "ra_image_links";
const COL_KEY = "ra_collection_links";

// Image links
export const getImageLinks = (): ImageLink[] => {
  try { return JSON.parse(localStorage.getItem(IMAGE_KEY) || "[]"); } catch { return []; }
};

export const getImageLink = (imageId: string): ImageLink | undefined =>
  getImageLinks().find(l => l.imageId === imageId);

export const setImageLink = (link: Omit<ImageLink, "clicks" | "createdAt">) => {
  const links = getImageLinks().filter(l => l.imageId !== link.imageId);
  links.unshift({ ...link, clicks: 0, createdAt: new Date().toISOString() });
  localStorage.setItem(IMAGE_KEY, JSON.stringify(links));
  window.dispatchEvent(new Event("ra_links_changed"));
};

export const removeImageLink = (imageId: string) => {
  localStorage.setItem(IMAGE_KEY, JSON.stringify(getImageLinks().filter(l => l.imageId !== imageId)));
  window.dispatchEvent(new Event("ra_links_changed"));
};

export const trackClick = (imageId: string) => {
  const links = getImageLinks().map(l =>
    l.imageId === imageId ? { ...l, clicks: l.clicks + 1 } : l
  );
  localStorage.setItem(IMAGE_KEY, JSON.stringify(links));
};

// Collection links
export const getCollectionLinks = (): CollectionLink[] => {
  try { return JSON.parse(localStorage.getItem(COL_KEY) || "[]"); } catch { return []; }
};

export const getCollectionLink = (collectionId: string): CollectionLink | undefined =>
  getCollectionLinks().find(l => l.collectionId === collectionId);

export const setCollectionLink = (link: CollectionLink) => {
  const links = getCollectionLinks().filter(l => l.collectionId !== link.collectionId);
  links.unshift(link);
  localStorage.setItem(COL_KEY, JSON.stringify(links));
  window.dispatchEvent(new Event("ra_links_changed"));
};

export const removeCollectionLink = (collectionId: string) => {
  localStorage.setItem(COL_KEY, JSON.stringify(getCollectionLinks().filter(l => l.collectionId !== collectionId)));
};

// Resolve: image link → collection default → null
export const resolveLink = (imageId: string, collectionId?: string): ImageLink | null => {
  const img = getImageLink(imageId);
  if (img) return img;
  if (collectionId) {
    const col = getCollectionLink(collectionId);
    if (col?.defaultUrl) return {
      imageId, url: col.defaultUrl, label: col.defaultLabel,
      site: col.defaultSite, isAffiliate: col.isAffiliate, clicks: 0,
      createdAt: new Date().toISOString(),
    };
  }
  return null;
};

// Seed demo data so the Shop section shows on some images
export const seedDemoLinks = () => {
  if (getImageLinks().length > 0) return;
  const demos: Omit<ImageLink, "clicks" | "createdAt">[] = [
    { imageId: "0", url: "https://etsy.com", label: "Buy this print", price: "$49.99", site: "Etsy", isAffiliate: false },
    { imageId: "3", url: "https://society6.com", label: "Shop this style", price: "$34.00", site: "Society6", isAffiliate: true },
    { imageId: "5", url: "https://redbubble.com", label: "Get the art print", price: "$28.00", site: "Redbubble", isAffiliate: false },
    { imageId: "8", url: "https://etsy.com", label: "Shop this look", price: "$55.00", site: "Etsy", isAffiliate: true },
  ];
  demos.forEach(d => setImageLink(d));
};
