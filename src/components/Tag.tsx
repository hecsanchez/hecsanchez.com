import {FC, ReactNode} from "react";

interface TagProps {
    children: ReactNode;
}
export const Tag: FC<TagProps> = ({ children }) => {
    return (
        <div className="border border-[#393446]  px-3 py-2 sm:px-6 rounded-lg  shadow-2xl shadow-slate-500/30 tracking-wide text-sm sm:text-base">
            {children}
        </div>
    )
}
