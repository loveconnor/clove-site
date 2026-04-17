export type Client = {
  index: string;
  name: string;
  category: string;
  role: string;
  preview: string;
  href: string;
};

export const CLIENTS: Client[] = [
  {
    index: "001",
    name: "LoveSans",
    category: "Typeface",
    role: "2026",
    preview: "/lovesans.png",
    href: "https://github.com/loveconnor/lovesans",
  },
  {
    index: "002",
    name: "LoveUI",
    category: "Web App",
    role: "2026",
    preview: "/loveui.png",
    href: "https://loveui.dev",
  },
  {
    index: "003",
    name: "Portfolio",
    category: "Frontend",
    role: "2026",
    preview: "/portfolio.png",
    href: "https://connorlove.com",
  },
];
