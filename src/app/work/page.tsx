import Image from 'next/image'
import {Wrapper} from "@/components/Wrapper";
import logosVertical from "@/assets/logos-vertical.png";
import oppal from "@/assets/oppal.png";
import productosfera from "@/assets/productosfera.png";
import unitrabajos from "@/assets/unitrabajos.png";
import soulfitness from "@/assets/soulfitness.png";

import {Button} from "@/components/Button";
import Link from "next/link";
import {Header} from "@/components/Header";
import {Tag} from "@/components/Tag";

export default function Home() {
    return (
        <main className="flex flex-col min-h-screen">
            <div>
                <Header/>
                <div className="mt-12">
                    <Wrapper >
                        <div className="relative z-10 max-w-4xl m-auto text-center">
                            <p className="text-lg font-medium tracking-widest antialiased antialiased m-auto text-center">
                                <span className="bg-text">MY WORK</span>
                            </p>
                            <h1 className="text-6xl font-bold leading-snug antialiased inline block">
                                Products I&apos;ve built
                            </h1>
                            <p className="text-xl mt-3 max-w-[800px] m-auto antialiased leading-8">I ❤️ building software products, these are just some I&apos;ve built recently.</p>

                        </div>
                    </Wrapper>
                </div>
                <div className="mt-40 mb-40">
                    <div className="flex flex-wrap max-w-[1200px] m-auto">
                        <div className="flex mt-20">
                            <div className="w-1/2 p-5">
                                <Link href="https://oppal.io" target="_blank">
                                    <Image alt="oppal logo" src={oppal} className="shadow-2xl shadow-slate-500/50 hover:scale-105 transition duration-300 cursor-pointer rounded-md" />
                                </Link>
                            </div>
                            <div className="w-1/2 p-5 text-lg">
                                <h2 className="font-bold text-4xl mt-5 mb-8">Oppal</h2>
                                <p className="mb-4">This is a product I am growing to 10k dedicating 2 hours each day. I am recording the progress and struggles in <Link href="https://www.linkedin.com/newsletters/7045259033468956672/"><span className="underline">my newsletter</span></Link> (in Spanish).</p>
                                <p className="mb-4">I went from idea to validation to having a fully functional product in 28 days.</p>
                                <p>Used code to build the product, but used no-code to build the website to help validate the idea.</p>
                                <div className="flex mt-10 gap-3 flex-wrap">
                                    <Tag>Next.js</Tag>
                                    <Tag>Node.js</Tag>
                                    <Tag>Tailwind</Tag>
                                    <Tag>Webflow</Tag>
                                </div>
                            </div>
                        </div>

                        <div className="flex mt-20">
                            <div className="w-1/2 p-5 text-lg">
                                <h2 className="font-bold text-4xl mt-8 mb-8">Productosfera</h2>
                                <p className="mb-4">A product/service discovery site that I helped build.</p>
                                <p className="mb-4">With a JavaScript stack and a relational database we were able to build this product and launch it within 2 weeks of planning it.</p>
                                <p>Used code to build the product, but used no-code to build the website to help validate the idea.</p>
                                <div className="flex mt-10 gap-3">
                                    <Tag>Next.js</Tag>
                                    <Tag>Node.js</Tag>
                                    <Tag>PostgreSQL</Tag>
                                </div>
                            </div>
                            <div className="w-1/2 p-5">
                                <Link href="https://productosfera.com" target="_blank">
                                    <Image alt="productosfera logo" src={productosfera} className="shadow-2xl shadow-slate-500/50 hover:scale-105 transition duration-300 cursor-pointer rounded-md" />
                                </Link>
                            </div>
                        </div>

                        <div className="flex mt-20">
                            <div className="w-1/2 p-5 ">
                                <Link href="https://soulfitness.mx" target="_blank">
                                    <Image alt="soul fitness logo" src={soulfitness} className="shadow-2xl shadow-slate-500/50 hover:scale-105 transition duration-300 cursor-pointer rounded-md"/>
                                </Link>
                            </div>
                            <div className="w-1/2 p-5 text-lg">
                                <h2 className="font-bold text-4xl mt-8 mb-8">Soul Fitness</h2>
                                <p className="mb-4">A system to manage and grow a fitness studio</p>
                                <p className="mb-4">Soul Fitness founders were interested in having a system that could ease operations for their businesses but also that would help them scale, as they had big plans for their brand.</p>
                                <p className="mb-4">Using web technologies I built a customer-facing bookings system as well as their internal dashboard to manage bookings, members, classes and instructors.</p>
                                <div className="flex mt-10 gap-3">
                                    <Tag>Next.js</Tag>
                                    <Tag>Node.js</Tag>
                                    <Tag>Tailwind</Tag>
                                    <Tag>PostgreSQL</Tag>
                                </div>
                            </div>
                        </div>

                        <div className="flex mt-20">
                            <div className="w-1/2 p-5 text-lg">
                                <h2 className="font-bold text-4xl mt-8 mb-8">Unitrabajos</h2>
                                <p className="mb-4">The job board for the new generations</p>
                                <p className="mb-4">Unitrabajos is an effort to make job hunting easier for university students and recent graduates.</p>
                                <p className="mb-4">It also aims to help companies recruit talent earlier on in their recruitment lifecycle and that way benefit both parties.</p>
                                <div className="flex mt-10 gap-3">
                                    <Tag>Next.js</Tag>
                                    <Tag>Node.js</Tag>
                                    <Tag>Tailwind</Tag>
                                    <Tag>PostgreSQL</Tag>
                                </div>
                            </div>
                            <div className="w-1/2 p-5">
                                <Link href="https://unitrabajos.com" target="_blank">
                                    <Image alt="unitrabajos logo" src={unitrabajos} className="shadow-2xl shadow-slate-500/50 hover:scale-105 transition duration-300 cursor-pointer rounded-md"/>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </main>
    )
}
