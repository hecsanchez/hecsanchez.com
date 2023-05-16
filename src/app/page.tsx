import Image from 'next/image'
import {Wrapper} from "@/components/Wrapper";
import logosVertical from "@/assets/logos-vertical.png";
import Link from "next/link";
import {Header} from "@/components/Header";
import {EmailButton} from "@/components/EmailButton";
import {Testimonial} from "@/components/Testimonial";

export default function Home() {

  return (
    <main className="flex flex-col min-h-screen">
        <div>
            <Header/>
            <div className="mt-10 sm:mt-20">
                <Wrapper >
                    <div className="relative z-10 max-w-4xl m-auto text-center">
                        <p className="text-md sm:text-3xl font-medium antialiased mb-3 antialiased">
                            <span>Hey, I’m Hector</span>
                        </p>
                        <h1 className="text-3xl sm:text-6xl font-bold leading-snug antialiased inline block">
                            I help <span className="bg-text">early stage</span> startups build <span className="bg-text">software products</span> fast
                        </h1>
                        <p className="text-base sm:text-xl mt-6 max-w-[800px] m-auto antialiased leading-normal sm:leading-8">Software Engineer with 15+ years of experience helping startups and large enterprises build quality and scalable software with JavaScript.</p>
                        <div className="flex gap-10 sm:gap-24 items-center mt-16 mb-10 justify-center">
                            <EmailButton/>
                            <Link href="/work" className="border-b border-white text-sm sm:text-xl antialiased transition">See some of my work</Link>
                        </div>
                    </div>
                </Wrapper>
            </div>
            <div className="overflow-hidden mt-20 sm:mt-32">
                <div className="flex gap-10">
                    {/*<Testimonial*/}
                    {/*    content="Working with Hector has been a great experience. He wrote the first lines for the front-end of our proprietary software and helped it shape to what it is now. With his knowledge and ability to infuse empathy into every line of code also helped us build a strong front-end team."*/}
                    {/*    author="Chris Sweet, VP Product @ Lifestance"*/}
                    {/*/>*/}
                    <Testimonial
                        content="It has been a pleasure to work with Hector. He is a great partner, always supporting and proposing improvements to the product and the complete UX. I really recommend him as an excellent partner and Leader."
                        author="Tania Gomez, Product Manager @ Konfio"
                    />
                    <Testimonial
                        content="Hector was instrumental in helping us deliver our React Native product on time and feature-complete. He's a great communicator and is easy to work with."
                        author="Nate Hershey, VP Engineering @ Fresh Tri"/>
                    <Testimonial
                        content="Excellent Product Engineer who dominates all aspects of design, creation and launch of a digital product, I have nothing but praise and recognition for him as a person and professionally."
                                 author="Mikhail Andrade, COO @ Reacttiv"
                    />
                    <Testimonial
                        content="Hector helped us build the platform that our fitness studio needed to help us grow, he was great at figuring out what we needed even when we didn't know!"
                        author="Erika Sanchez, CEO @ Soul Fitness"
                    />
                    {/*<Testimonial*/}
                    {/*    content="Working with Hector has been a great experience. He wrote the first lines for the front-end of our proprietary software and helped it shape to what it is now. With his knowledge and ability to infuse empathy into every line of code also helped us build a strong front-end team."*/}
                    {/*    author="Chris Sweet, VP Product @ Lifestance"*/}
                    {/*/>*/}
                    <Testimonial
                        content="It has been a pleasure to work with Hector. He is a great partner, always supporting and proposing improvements to the product and the complete UX. I really recommend him as an excellent partner and Leader."
                        author="Tania Gomez, Product Manager @ Konfio"
                    />
                    <Testimonial
                        content="Hector was instrumental in helping us deliver our React Native product on time and feature-complete. He's a great communicator and is easy to work with."
                        author="Nate Hershey, VP Engineering @ Fresh Tri"/>
                    <Testimonial
                        content="Excellent Product Engineer who dominates all aspects of design, creation and launch of a digital product, I have nothing but praise and recognition for him as a person and professionally."
                        author="Mikhail Andrade, COO @ Reacttiv"
                    />
                    <Testimonial
                        content="Hector helped us build the platform that our fitness studio needed to help us grow, he was great at figuring out what we needed even when we didn't know!"
                        author="Erika Sanchez, CEO @ Soul Fitness"
                    />
                </div>
            </div>
            <div className="mt-10 mb-10 sm:mt-40 sm:mb-40">
                <div className="max-w-[1200px] w-[95%] m-auto">
                    <div className="sm:flex relative justify-between">
                        <div className="sm:w-1/3 px-10 sm:px-0 flex flex-col items-center justify-start delimiter relative mb-20 sm:mb-0">
                            <h2 className="text-md uppercase font-base tracking-widest text-center mb-5">Some companies I&apos;ve worked with</h2>
                            <Image alt="client logos" src={logosVertical} />
                        </div>
                        <div className="sm:w-2/3 px-10 sm:pl-20 leading-6 sm:leading-8 text-base sm:text-lg font-light antialiased">
                            <p className="mb-4">We all know the well-trodden path of an entrepreneurial journey. It begins with a lightning bolt of inspiration, a brilliant idea that simply cannot be ignored.</p>
                            <p className="mb-4"> The next step? Finding a trusted partner to help breathe life into this concept.</p>
                            <p className="mb-4">That&apos;s where I come in.</p>
                            <p className="mb-4">With years of experience in software engineering, particularly in helping early-stage startups bring their ideas to life, I&apos;ve honed a method that puts your vision at the forefront.</p>
                                <p>We work together, iterating and refining, ensuring that you are not a bystander but an integral part of the process. At the end of our journey, you not only have a fully functional product but also the knowledge and confidence to take your business to new heights.</p>
                            <div className="flex pt-10">
                                <EmailButton />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </main>
  )
}
