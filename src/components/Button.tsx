import clsx from "clsx";

export const Button = ({ children, className, ...props}) => {
    return (
        <button className={clsx("bg-primary px-8 py-4 text-white block rounded-lg text-lg", className)} {...props}>
            {children}
        </button>
    )
}
