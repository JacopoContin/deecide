import Head from "next/head"
import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Layout } from "@/components/layout"
import { Button, buttonVariants } from "@/components/ui/button"

export default function IndexPage() {
  return (
    <Layout>
      <Head>
        <title>Deecide</title>
        <meta
          name="description"
          content="A decision making tool, for people who just can't make up their mind."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="container grid items-center gap-6 pt-6 pb-8 md:py-10">
        <div className="flex max-w-[980px] flex-col items-start gap-2">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
          A decision making tool,  <br className="hidden sm:inline" />
          for people who just can't make up their mind.
          </h1>
          <p className="max-w-[700px] text-lg text-slate-700 dark:text-slate-400 sm:text-xl">
            Don't know whether to eat pizza or sushi tonight? You're in luck.
          </p>
        </div>
        <div className="flex gap-4">
          <Button className="" variant="" size="lg" >
            Try me
          </Button> 
        </div>
      </section>
    </Layout>
  )
}
