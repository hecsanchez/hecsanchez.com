import clsx from "clsx";

export const Button = ({ children, className, ...props}) => {
    return (
        <div className="button-container hover:scale-105 transition duration-300 active:top-1">
            <span className="button-bg"></span>
            <a href="" className={clsx("button flex px-8 py-4 text-white block rounded-lg text-lg", className)} {...props}>
                {children}
            </a>
        </div>
    )
}
