import {Wrapper} from "@/components/Wrapper";
import Image from "next/image";
import Logo from "@/assets/hecsanchez.svg";
import Link from "next/link";

export const Header = () => {
    return (
        <div className="py-12">
            <Wrapper>
                <div className="flex justify-between items-center">
                    <Link href="/"><Image src={Logo} width={220} alt="hecsanchez logo"/></Link>
                    <div className="flex gap-10 text-base sm:text-lg">
                        <Link href="/about">About</Link>
                        <Link href="/work">Work</Link>
                    </div>
                </div>
            </Wrapper>
        </div>
    )
}
