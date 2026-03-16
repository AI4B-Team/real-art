// REAL ART Affiliate Network — Auto-detects affiliate programs from product URLs.
// Creators keep 100% of their commission — REAL ART takes nothing.

export interface AffiliatePartner {
  id: string;
  name: string;
  domain: string[];
  category: string;
  commission: string;
  cookieDays: number;
  defaultLabel: string;
  color: string;
  popular?: boolean;
}

export const affiliateNetwork: AffiliatePartner[] = [
  // Print & Art Platforms
  { id: "etsy", name: "Etsy", domain: ["etsy.com"], category: "Marketplace", commission: "4%", cookieDays: 30, defaultLabel: "Shop on Etsy", color: "#F1641E", popular: true },
  { id: "society6", name: "Society6", domain: ["society6.com"], category: "Art Prints", commission: "10%", cookieDays: 30, defaultLabel: "Shop on Society6", color: "#222", popular: true },
  { id: "redbubble", name: "Redbubble", domain: ["redbubble.com"], category: "Art Prints", commission: "10%", cookieDays: 30, defaultLabel: "Shop on Redbubble", color: "#E41321", popular: true },
  { id: "printful", name: "Printful", domain: ["printful.com"], category: "Print-on-Demand", commission: "10%", cookieDays: 30, defaultLabel: "Order on Printful", color: "#323232" },
  { id: "printify", name: "Printify", domain: ["printify.com"], category: "Print-on-Demand", commission: "5%", cookieDays: 30, defaultLabel: "Order on Printify", color: "#45B26B" },
  { id: "artstation", name: "ArtStation", domain: ["artstation.com"], category: "Art Portfolio", commission: "5%", cookieDays: 30, defaultLabel: "View on ArtStation", color: "#13AFF0" },
  { id: "inprnt", name: "INPRNT", domain: ["inprnt.com"], category: "Art Prints", commission: "10%", cookieDays: 30, defaultLabel: "Shop on INPRNT", color: "#333" },
  { id: "displate", name: "Displate", domain: ["displate.com"], category: "Metal Prints", commission: "8-10%", cookieDays: 60, defaultLabel: "Shop on Displate", color: "#E63C3C", popular: true },
  { id: "fineartamerica", name: "Fine Art America", domain: ["fineartamerica.com"], category: "Art Prints", commission: "5%", cookieDays: 30, defaultLabel: "Buy on Fine Art America", color: "#4A90D9" },

  // Courses & Digital Products
  { id: "gumroad", name: "Gumroad", domain: ["gumroad.com"], category: "Digital Products", commission: "10%", cookieDays: 30, defaultLabel: "Get it on Gumroad", color: "#FF90E8", popular: true },
  { id: "teachable", name: "Teachable", domain: ["teachable.com"], category: "Courses", commission: "30%", cookieDays: 90, defaultLabel: "Enroll on Teachable", color: "#00C9A7" },
  { id: "skillshare", name: "Skillshare", domain: ["skillshare.com"], category: "Courses", commission: "$7/trial", cookieDays: 30, defaultLabel: "Watch on Skillshare", color: "#00E785" },
  { id: "udemy", name: "Udemy", domain: ["udemy.com"], category: "Courses", commission: "15%", cookieDays: 7, defaultLabel: "Course on Udemy", color: "#EC5252" },
  { id: "coursera", name: "Coursera", domain: ["coursera.org"], category: "Courses", commission: "45%", cookieDays: 30, defaultLabel: "Learn on Coursera", color: "#0056D2" },

  // AI Art & Creative Tools
  { id: "midjourney", name: "Midjourney", domain: ["midjourney.com"], category: "AI Art", commission: "20%", cookieDays: 30, defaultLabel: "Try Midjourney", color: "#000", popular: true },
  { id: "adobe", name: "Adobe", domain: ["adobe.com", "creativecloud.adobe.com"], category: "Creative Tools", commission: "8.33%", cookieDays: 30, defaultLabel: "Get Adobe", color: "#FF0000", popular: true },
  { id: "canva", name: "Canva Pro", domain: ["canva.com"], category: "Design Tools", commission: "15%", cookieDays: 30, defaultLabel: "Try Canva Pro", color: "#00C4CC" },
  { id: "figma", name: "Figma", domain: ["figma.com"], category: "Design Tools", commission: "20%", cookieDays: 30, defaultLabel: "Try Figma", color: "#F24E1E" },

  // Retail & Lifestyle
  { id: "amazon", name: "Amazon", domain: ["amazon.com", "amzn.to", "amzn.com"], category: "Marketplace", commission: "1-10%", cookieDays: 1, defaultLabel: "Shop on Amazon", color: "#FF9900", popular: true },
  { id: "ltk", name: "LTK", domain: ["shopltk.com", "liketoknow.it"], category: "Fashion", commission: "5-20%", cookieDays: 30, defaultLabel: "Shop the Look", color: "#F95687", popular: true },
  { id: "nordstrom", name: "Nordstrom", domain: ["nordstrom.com"], category: "Fashion", commission: "2-20%", cookieDays: 7, defaultLabel: "Shop Nordstrom", color: "#000" },
  { id: "farfetch", name: "Farfetch", domain: ["farfetch.com"], category: "Luxury Fashion", commission: "10%", cookieDays: 30, defaultLabel: "Shop Farfetch", color: "#000" },

  // Electronics & Photography
  { id: "bestbuy", name: "Best Buy", domain: ["bestbuy.com"], category: "Electronics", commission: "1%", cookieDays: 1, defaultLabel: "Buy at Best Buy", color: "#003087" },
  { id: "bhphoto", name: "B&H Photo", domain: ["bhphotovideo.com", "bhphoto.com"], category: "Photography", commission: "2%", cookieDays: 1, defaultLabel: "Buy at B&H", color: "#000080" },

  // Home & Travel
  { id: "wayfair", name: "Wayfair", domain: ["wayfair.com"], category: "Home Decor", commission: "5-7%", cookieDays: 7, defaultLabel: "Shop Wayfair", color: "#7B2D8B" },
  { id: "airbnb", name: "Airbnb", domain: ["airbnb.com"], category: "Travel", commission: "$30-75", cookieDays: 30, defaultLabel: "Book on Airbnb", color: "#FF5A5F" },
  { id: "booking", name: "Booking.com", domain: ["booking.com"], category: "Travel", commission: "4%", cookieDays: 30, defaultLabel: "Book on Booking", color: "#003580" },
];

export const affiliateCategories = [
  "All",
  ...Array.from(new Set(affiliateNetwork.map(p => p.category))),
];

export const popularPartners = affiliateNetwork.filter(p => p.popular);

/** Detect affiliate partner from a URL */
export const detectAffiliatePartner = (url: string): AffiliatePartner | null => {
  if (!url) return null;
  try {
    const cleaned = url.startsWith("http") ? url : `https://${url}`;
    const hostname = new URL(cleaned).hostname.replace("www.", "").toLowerCase();
    return affiliateNetwork.find(p =>
      p.domain.some(d => hostname === d || hostname.endsWith(`.${d}`))
    ) || null;
  } catch {
    return null;
  }
};

/** Build an affiliate URL (placeholder — in production this would add tracking params) */
export const buildAffiliateUrl = (url: string, _partnerId: string): string => url;
