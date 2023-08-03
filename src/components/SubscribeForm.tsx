'use client';
import {Button} from "@/components/Button";
import {FormEventHandler, useState} from "react";

export const SubscribeForm = () => {

    const [email, setEmail] = useState<string|null>(null);

    const subscribeUser: FormEventHandler<HTMLFormElement>  = () => {
        fetch('https://api.convertkit.com/v3/forms/5188442/subscribe', {
            method: 'POST',
            body: JSON.stringify({
                api_key: 'vBpNiwrQAs4n9_XisVDShQ',
                email: email
            })
        })
    }

    return (
        <form onSubmit={subscribeUser} className="flex gap-3 w-full">
            <input onChange={(e)=>setEmail(e.target.value)} type='text' className="rounded-lg w-1/2 px-4 py-2 text-black" placeholder="Correo electrónico"/>
            <div>
                <Button>Suscríbete</Button>
            </div>
        </form>
    )
}
