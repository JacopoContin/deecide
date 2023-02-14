import { SiteHeader } from "@/components/site-header"
import { Question } from "./question"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <Question/>
    </>
  )
}
