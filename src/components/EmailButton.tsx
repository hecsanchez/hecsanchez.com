'use client';

import {Button} from "@/components/Button";

export const EmailButton = ({ children, className, ...props}) => {
    const handleOpenLink = () => {
        if (typeof window !== 'undefined') {
            window.open("mailto:hi@hecsanchez.com?subject=Let's chat")
        }
    }

    return (
        <Button className="font-base" onClick={handleOpenLink} >Get in touch</Button>
    )
}
