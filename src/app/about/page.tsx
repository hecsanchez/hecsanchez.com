import Image from 'next/image'
import {Wrapper} from "@/components/Wrapper";
import hecsanchez from "@/assets/hecsanchez.jpeg";
import {Header} from "@/components/Header";
import Link from "next/link";
import {EmailButton} from "@/components/EmailButton";

export default function About() {
    return (
        <main className="flex flex-col min-h-screen">
            <div>
                <Header/>
                <div className="mt-12">
                    <Wrapper >
                        <div className="relative z-10 max-w-4xl m-auto text-center">
                            <p className="text-md md:text-lg font-medium tracking-widest antialiased antialiased m-auto text-center">
                                <span className="bg-text">ABOUT</span>
                            </p>
                            <h1 className="text-3xl md:text-6xl font-bold leading-snug antialiased inline block">
                                Come say hi!
                            </h1>
                        </div>
                    </Wrapper>
                </div>
                <div className="max-w-6xl m-auto mt-10 mb-10 sm:mt-24 sm:mb-40 px-10 sm:px-0">
                    <div className="flex flex-col-reverse md:flex-row">
                        <div  className="md:w-2/3 md:pr-20 text-base md:text-xl leading-normal">
                            <p className="mb-4">Hey! I&apos;m Hector, my friends call me Hec.</p>
                            <p className="mb-4">I&apos;ve been building stuff for the web since 2008. Started building out WordPress sites, then joined a Marketing Agency to build sites for their clients. After that I started my own Product agency which lasted for 3 years and then went on to work for several startups and large enterprises.</p>
                            <p className="mb-4">In my journey as a Product Engineer I have built full products from scratch using JavaScript, and I have always had an itch to build my own products applying everything I&apos; ve learnt over the past 15 years.</p>
                            <p className="mb-4">So earlier this year I started building my own B2B Micro-Saas and launched my newsletter to share my journey as a Micro-SaaS founder.</p>
                            <p className="mb-4">If you want to launch your own SaaS product, I can help you in three ways:</p>
                            <ul>
                                <li className="mb-3">- 1-hour MLP (Minimum Lovable Product) consultation.</li>
                                <li className="mb-3">- Help you put the right team together and lead it to build your MLP.</li>
                                <li className="mb-3">- Build your MLP in 30 days, I built mine in 28 ;)</li>
                            </ul>
                            <div className="flex mt-10">
                                <EmailButton/>
                            </div>
                        </div>
                        <div className="md:w-1/3">
                            <div className="flex px-10 md:px-0">
                                <Image src={hecsanchez} className="rounded-full overflow-hidden h-52 w-52 m-auto mb-10 sm:mb-0 sm:h-96 sm:w-96" alt="Hec Sanchez" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    )
}
