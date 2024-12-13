"use client"
import { Toaster } from "sonner";
import QueryProvider from "./QueryProvider";
import { WagmiClient } from "./Wagmi";


export default function ClientProviders({ children }: { children: React.ReactNode }) {
  
  return (
    <>
      <WagmiClient>
        <QueryProvider>
          {children}
        </QueryProvider>
      </WagmiClient>
      <Toaster />
    </>
  )
}