import {FC, ReactNode} from "react";
import clsx from 'clsx';

interface WrapperProps {
    children: ReactNode;
}

export const Wrapper:FC<WrapperProps> = ({ children, className }) => {
    return (
        <div className={clsx("w-[95%] max-w-[1400px] mx-auto", className)}>{children}</div>
    )
}
