import Image from "next/image";
import stars from '@/assets/stars.svg';
import {FC} from "react";

interface TestimonialProps {
    content: string;
    author: string;
}

export const Testimonial: FC<TestimonialProps> = ({ content, author }) => {
    return (
        <div className="ticker border border-[#393446] p-5 py-6 min-w-[450px] max-w-xl rounded-xl bg-[#131117] shadow-2xl shadow-slate-500/30">
            <Image src={stars} width={100} alt='stars'/>
            <p className="text-sm mt-4 tracking-wide leading-normal">{content}</p>
            <p className="text-teal-400 text-sm mt-4">{ author }</p>
        </div>
    )
}
