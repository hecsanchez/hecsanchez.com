import clsx from "clsx";
import {FC, ReactNode} from "react";

interface ButtonProps {
    children: ReactNode;
    className: string;
    onClick?: ()=> void;
}

export const Button: FC<ButtonProps> = ({ children, className, onClick}) => {
    return (
        <div className="button-container hover:scale-105 transition duration-300 active:top-1">
            <span className="button-bg"></span>
            <button onClick={onClick} className={clsx("button flex px-8 py-4 text-white block rounded-lg text-lg", className)}>
                {children}
            </button>
        </div>
    )
}
