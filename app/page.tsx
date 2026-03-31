"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                RP
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                RankPredict
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden md:block"
              >
                Features
              </Link>
              <Link
                href="#how"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden md:block"
              >
                How it Works
              </Link>
              <Link href="/auth/institution/login">
                <Button variant="outline" size="sm" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-transparent">
                  Institution Login
                </Button>
              </Link>
              <Link href="/auth/super-admin/login">
                <Button variant="outline" size="sm" className="border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent">
                  Super Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10" />
        <div className="absolute top-20 right-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />

        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">Trusted by 500+ Institutions</span>
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight text-balance md:text-6xl lg:text-7xl">
              Build & Sell{" "}
              <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                AI Prediction Templates
              </span>{" "}
              to Institutions
            </h1>

            <p className="mb-10 text-xl text-muted-foreground text-balance md:text-2xl leading-relaxed">
              Create powerful rank prediction tools as Super Admin. Sell subscriptions to coaching institutes and schools.
              They share links with students who get instant AI-powered predictions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/super-admin/login">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-xl transition-all text-lg px-8 h-14"
                >
                  Create Templates (Super Admin)
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-primary text-primary hover:bg-primary/5 text-lg px-8 h-14"
                >
                  Try Live Demo
                </Button>
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { value: "150+", label: "Templates Created", color: "from-purple-600 to-violet-600" },
                { value: "500+", label: "Institutions Using", color: "from-violet-600 to-indigo-600" },
                { value: "2.5M+", label: "Student Predictions", color: "from-indigo-600 to-purple-600" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-primary/10 hover:shadow-xl transition-all"
                >
                  <div
                    className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Complete Platform for All Users</h2>
              <p className="text-xl text-muted-foreground">
                Three portals working together: Super Admin, Institutions, and Students
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: "SA",
                  title: "Super Admin Portal",
                  description:
                    "Create AI templates, dataset-based predictors, and conditional logic tools. Manage institutions and track revenue.",
                  gradient: "from-purple-600 to-violet-600",
                },
                {
                  icon: "IN",
                  title: "Institution Portal",
                  description:
                    "Subscribe to templates, configure placeholders, generate shareable links, and track student predictions.",
                  gradient: "from-emerald-600 to-teal-600",
                },
                {
                  icon: "ST",
                  title: "Student Interface",
                  description:
                    "Clean, mobile-friendly prediction page. Enter scores, get instant AI-powered rank predictions with analysis.",
                  gradient: "from-blue-600 to-cyan-600",
                },
                {
                  icon: "AI",
                  title: "AI-Powered Templates",
                  description:
                    "Use GPT-4 with custom prompts and placeholders. Institutions can modify values without changing the core logic.",
                  gradient: "from-violet-600 to-purple-600",
                },
                {
                  icon: "DB",
                  title: "Dataset Templates",
                  description:
                    "Upload historical exam data. AI interpolates to predict percentiles based on score patterns.",
                  gradient: "from-indigo-600 to-blue-600",
                },
                {
                  icon: "CL",
                  title: "Conditional Logic",
                  description:
                    "Define score ranges and percentile mappings. Perfect for exams with predictable cutoffs.",
                  gradient: "from-amber-600 to-orange-600",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  onMouseEnter={() => setActiveFeature(index)}
                  onMouseLeave={() => setActiveFeature(null)}
                  className="group relative bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 hover:border-primary/50 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}
                  />

                  <div
                    className={`relative inline-flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br ${feature.gradient} text-white text-sm font-bold mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                  >
                    {feature.icon}
                  </div>

                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>

                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="py-20 bg-gradient-to-b from-primary/5 to-accent/5">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-muted-foreground">Get started in 3 simple steps</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Super Admin Creates Templates",
                  description:
                    "Build AI prediction templates with custom prompts, upload historical datasets, or define conditional logic for accurate predictions.",
                  color: "primary",
                },
                {
                  step: "02",
                  title: "Institutions Subscribe",
                  description:
                    "Coaching institutes and schools purchase access to templates. They configure placeholder values for their specific needs.",
                  color: "accent",
                },
                {
                  step: "03",
                  title: "Students Get Predictions",
                  description:
                    "Institutions share links with students. Students enter scores and get instant AI-powered rank predictions with analysis.",
                  color: "secondary",
                },
              ].map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-primary/50 hover:shadow-xl transition-all h-full">
                    <div
                      className={`inline-flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-${step.color} to-${step.color}/70 text-white text-2xl font-bold mb-6 shadow-lg`}
                    >
                      {step.step}
                    </div>

                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>

                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>

                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-4xl text-primary/30">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      <footer className="border-t bg-gradient-to-b from-white to-gray-50 py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  RP
                </div>
                <span className="text-xl font-bold">RankPredict</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Empowering institutions to help students succeed with AI-powered rank predictions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-primary transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how" className="hover:text-primary transition-colors">
                    How it Works
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            © 2025 RankPredict. All rights reserved. Made with ❤️ for educators.
          </div>
        </div>
      </footer>
    </div>
  )
}
