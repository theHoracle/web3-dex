"use client"
import Link from "next/link";
import { useAccount, useConnect } from "wagmi";
import { Dialog, DialogTrigger, DialogTitle, DialogContent } from "./ui/dialog";


const Header = () => {
    const { address, isConnected } = useAccount()
    const { connect, connectors } = useConnect()
    console.log(connectors)

    
  return <header
    className="flex items-center justify-between w-full px-4 md:px-20 h-16"
    >
        <div className="flex-1 flex items-center gap-8">
        <span>
             theHoracle's
            </span>
        <div className="flex space-x-2">
            <Link 
            href="/swap"
            className="py-2 px-4 hover:bg-[rgb(34,42,58)] rounded-md "
            >
                Swap
            </Link>
            <Link 
            href="/tokens"
            className="py-2 px-4 hover:bg-[rgb(34,42,58)] rounded-md "
            >
                Tokens
            </Link>
        </div>
    </div>
    <div className="flex items-center gap-8">
        <div>
            {/* eth image */}
            <span> Ethereum </span>
        </div>
        <Dialog>
        <DialogTrigger asChild>
        <div
        className="bg-[#243056] hover:bg-[#5981F3] hover:text-[#243056] text-[#5981F3] rounded-full py-2.5 px-5">
            {isConnected ?  address?.slice(0, 6) + "..." + address?.slice(-4) : "Connect"}
        </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-[rgb(25,33,52)] text-stone-100 border-stone-800">
        <DialogTitle>Connect Wallet</DialogTitle>
        <div className="grid gap-4 py-4">
            {connectors.map((connector) => (
            <button
                className="bg-[#243056] hover:bg-[#243056] text-[#5981F3] rounded-full py-2.5 px-5"
                key={connector.id}
                onClick={() => connect({ connector })}
            >
                {connector.name}
            </button>
            ))}
        </div>
        </DialogContent>
        </Dialog>
    </div>
        
    </header>
}

export default Header;