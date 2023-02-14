import { NavItem } from "@/types/nav"

interface SiteConfig {
  name: string
  description: string
  mainNav: NavItem[]
  links: {
    twitter: string
    github: string
    docs: string
  }
}

export const siteConfig: SiteConfig = {
  name: "Deecide",
  description:
    "For people who just can't make up their mind.",
  mainNav: [
  ],
  links: {
    twitter: "#",
    github: "#",
    docs: "https://ui.shadcn.com",
  },
}
