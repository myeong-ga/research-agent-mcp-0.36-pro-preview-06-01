import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bot,
  Brain,
  Check,
  ChevronRight,
  Code,
  Cpu,
  Database,
  Facebook,
  Github,
  Handshake,
  Instagram,
  Linkedin,
  Search,
  Shield,
  Twitter,
  Waypoints,
} from "lucide-react"
import ScrollHeader from "@/components/scroll-header"
import { Badge } from "@/components/ui/badge"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  accentColor?: string
}

interface StepCardProps {
  number: number
  title: string
  description: string
  icon: React.ReactNode
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <ScrollHeader>
        <header className="w-full border-b border-white bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src="/abstract-sl.svg" alt="StreamLine Logo" width={32} height={32} className="rounded" />
              <span className="text-xl font-bold">StreamLine</span>
            </div>
            <nav className="hidden md:flex gap-6">
              <Link href="#features" className="text-sm font-medium hover:text-primary">
                Features
              </Link>
              <Link href="#testimonials" className="text-sm font-medium hover:text-primary">
                Testimonials
              </Link>
              <Link href="#pricing" className="text-sm font-medium hover:text-primary">
                Pricing
              </Link>
              <Link href="#contact" className="text-sm font-medium hover:text-primary">
                Contact
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
                Log in
              </Link>
              <Button asChild>
                <Link href="/dashboard">Get Started</Link>
              </Button>
               <Button variant="outline" asChild>
                <Link
                  href="https://v0.dev/chat/open-streamline-landing-page-a6GMN5Cu310"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in v0
                </Link>
              </Button>
            </div>
          </div>
        </header>
      </ScrollHeader>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="grid gap-6 md:grid-cols-[1fr_300px] md:gap-8 lg:grid-cols-[1fr_450px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl lg:text-5xl xl:text-6xl/none">
                    Navigate the Digital Flux with Intelligent Resource Management
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-lg lg:text-xl font-spoqa-han-sans">
                    StreamLine의 에이전트는 AI와 인간의 협업으로 자원 목록을 실시간으로 업데이트하며, 고성능 검색 엔진을
                    통해 필요한 정보를 신속하고 정확하게 제공합니다.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/dashboard">Start Free Trial</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="#features" className="flex items-center gap-1">
                      Learn More <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/modern-saas-dashboard.jpg"
                  alt="StreamLine Dashboard"
                  width={600}
                  height={600}
                  className="w-full max-w-[300px] md:max-w-[300px] lg:max-w-[450px] xl:max-w-[600px] aspect-video overflow-hidden rounded-xl object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="bg-primary/10 text-primary border-primary/20">Features</Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">StreamLine의 핵심 기능</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl font-spoqa-han-sans">
                  StreamLine은 기업이 디지털 시대에 민첩하게 대응하고 지속 성장할 수 있도록 강력한 기능들을 제공합니다.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Brain className="h-12 w-12" />}
                title="High-Performance Search and Inference Capabilities"
                description="StreamLine은 주요 LLM 제공사의 플래그십 모델을 활용하여, test-time compute를 통해 강력한 검색 및 추론 능력을 제공합니다. 이를 통해 사용자는 복잡한 데이터에서도 추적가능하며 신뢰할수있는 정보를 얻을 수 있습니다."
                accentColor="from-blue-500 to-indigo-700"
              />
              <FeatureCard
                icon={<Shield className="h-12 w-12" />}
                title="Secure MCP Client Support"
                description="StreamLine은 보안이 강화된 MCP 클라이언트를 지원하여, 민감한 데이터의 안전한 처리를 보장합니다. 이를 통해 기업은 데이터 보안에 대한 우려 없이 효율적인 자원 관리를 수행할 수 있습니다."
                accentColor="from-cyan-500 to-blue-600"
              />
              <FeatureCard
                icon={<Handshake className="h-12 w-12" />}
                title="Community-Based Evaluation System"
                description="StreamLine은 커뮤니티 공동 플랫폼으로서, 사용자들이 서로의 평가를 확인하고 공유할 수 있는 기능을 제공합니다. 이를 통해 신뢰성 높은 자원 선택이 가능하며, 커뮤니티의 집단 지성을 활용할 수 있습니다."
                accentColor="from-amber-500 to-orange-600"
              />
              <FeatureCard
                icon={<Waypoints className="h-12 w-12" />}
                title="Personalized Access Control"
                description="StreamLine은 접근 제어 기능을 통해 개인의 검색 자원을 효과적으로 관리할 수 있도록 지원합니다. 이를 통해 사용자는 자신의 필요에 맞게 자원을 구성하고 활용할 수 있습니다."
                accentColor="from-emerald-500 to-green-600"
              />
              <FeatureCard
                icon={<Search className="h-12 w-12" />}
                title="Granular Tracing for Enhanced Search Proficiency"
                description="StreamLine은 span 단위의 추적 기능을 제공하여, 사용자의 검색 과정과 결과를 상세히 분석할 수 있습니다. 이를 통해 개인의 검색 능력을 지속적으로 향상시킬 수 있습니다."
                accentColor="from-purple-500 to-violet-600"
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="bg-primary/10 text-primary border-primary/20">How It Works</Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">StreamLine Agent Workflow</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Our intelligent agents follow a sophisticated process to optimize your resource management
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 py-12 md:grid-cols-2 lg:grid-cols-4">
              <StepCard
                number={1}
                title="Context Analysis"
                description="The AI agent analyzes your business context and resource requirements"
                icon={<Database className="h-8 w-8" />}
              />
              <StepCard
                number={2}
                title="Tool Selection"
                description="Based on analysis, the agent selects the optimal tools and approaches"
                icon={<Code className="h-8 w-8" />}
              />
              <StepCard
                number={3}
                title="Execution"
                description="Tools are executed autonomously or with human collaboration as needed"
                icon={<Cpu className="h-8 w-8" />}
              />
              <StepCard
                number={4}
                title="Review & Refinement"
                description="Results are analyzed and processes are continuously improved"
                icon={<Bot className="h-8 w-8" />}
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-4xl font-bold tracking-tighter md:text-5xl">합리적인 가격 정책</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl font-spoqa-han-sans">
                  귀사의 규모와 필요에 맞는 최적의 플랜을 선택하세요. 모든 플랜은 14일 무료 체험이 가능합니다.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 py-12 md:grid-cols-3">
              {/* Starter Plan */}
              <div className="rounded-xl bg-card overflow-hidden border shadow-sm">
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-foreground">Starter</h3>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-3xl font-bold text-foreground">월 ₩49,000</span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-foreground">AI 에이전트 1개</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-foreground">기본 검색 기능</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-foreground">월별 리소스 업데이트 100건</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-foreground">이메일 지원</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full mt-6">
                    플랜 선택
                  </Button>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="rounded-xl overflow-hidden shadow-lg transform scale-105 border-0">
                <div className="bg-blue-600 p-6 text-white dark:bg-blue-700">
                  <h3 className="text-2xl font-bold">Pro</h3>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-3xl font-bold">월 ₩99,000</span>
                  </div>
                  <div className="mt-2">
                    <span className="inline-block bg-yellow-400 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                      가장 인기 있는 플랜
                    </span>
                  </div>
                </div>
                <div className="bg-card p-6 space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-foreground">AI 에이전트 5개</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-foreground">고급 검색 기능</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-foreground">실시간 리소스 업데이트</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-foreground">Human-in-the-loop 검증</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-foreground">전화 및 이메일 지원</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white">플랜 선택</Button>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="rounded-xl bg-card overflow-hidden border shadow-sm">
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-foreground">Enterprise</h3>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-3xl font-bold text-foreground">맞춤형 견적</span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-foreground">AI 에이전트 무제한</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-foreground">모든 기능 포함</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-foreground">전담 매니저 지원</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-foreground">SLA 보장</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-foreground">커스텀 통합</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full mt-6">
                    문의하기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section id="cta" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Ready to Transform Your Business?
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  Join thousands of companies already using StreamLine to boost productivity and growth.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" asChild>
                  <Link href="/dashboard">Start Your Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#contact">Schedule a Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Get in Touch</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  Have questions? Our team is here to help.
                </p>
              </div>
              <div className="mx-auto w-full max-w-sm space-y-2">
                <form className="grid gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="name" className="sr-only">
                      Name
                    </label>
                    <input
                      id="name"
                      placeholder="Name"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="email" className="sr-only">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Email"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="message" className="sr-only">
                      Message
                    </label>
                    <textarea
                      id="message"
                      placeholder="Message"
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <Button className=" bg-stone-400" type="submit">
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/abstract-sl.svg" alt="StreamLine Logo" width={24} height={24} className="rounded" />
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} StreamLine. All rights reserved.
            </p>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Terms
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Privacy
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Cookies
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, accentColor = "from-primary to-primary/80" }: FeatureCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
      <div className={`h-2 w-full bg-gradient-to-r ${accentColor}`} />
      <CardHeader>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
        <CardTitle className="mt-4">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function StepCard({ number, title, description, icon }: StepCardProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
        <span className="text-sm font-bold">{number}</span>
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  )
}
