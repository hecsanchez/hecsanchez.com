import {Wrapper} from "@/components/Wrapper";
import Image from "next/image";
import Logo from "@/assets/hecsanchez.svg";

export const Header = () => {
    return (
        <div className="py-12">
            <Wrapper>
                <Image src={Logo} alt="hecsanchez logo"/>
            </Wrapper>
        </div>
    )
}
