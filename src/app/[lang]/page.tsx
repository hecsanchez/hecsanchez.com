import Image from 'next/image'
import {Wrapper} from "@/components/Wrapper";
import astronaut from "@/assets/hec-astronaut.svg";
import {Button} from "@/components/Button";
import Link from "next/link";
import {Header} from "@/components/Header";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
        <div className="fixed bg-[url('/stars.svg')] bg-[length:600px] top-0 right-0 left-0 bottom-0 opacity-50" />
        <Header/>
        <Wrapper className="mt-24 flex gap-6">
            <div className="w-1/2 z-10 max-w-xl">
                <p className="text-3xl font-semibold antialiased mb-3 antialiased">Hey, I’m Hector</p>
                <h1 className="text-5xl font-bold leading-snug antialiased bg-[#000000] inline max-w-lg block">
                    I help <span className="bg-primary px-2">early stage startups</span> build SaaS products fast
                </h1>
                <p className="text-xl mt-6 max-w-[600px] antialiased leading-8">Software Engineer with 15+ years of experience helping startups and large enterprises build quality and scalable software with JavaScript.</p>
                <div className="flex gap-24 items-center mt-16">
                    <Button className="uppercase font-semibold tracking-widest">Get in touch</Button>
                    <Link href="/work" className="border-b border-white text-xl antialiased transition">See some of my work</Link>
                </div>
            </div>
            <div className="w-1/2 relative z-0">
                <div className="flex items-center justify-center">
                    <Image src={astronaut} width={350} />
                </div>
            </div>
        </Wrapper>
    </main>
  )
}
