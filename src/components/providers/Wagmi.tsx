import { http, createConfig, WagmiProvider, useConnect } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { walletConnect, metaMask } from 'wagmi/connectors'

const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    walletConnect({
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  }),
    metaMask()
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})


export function WagmiClient(props: {
    children: React.ReactNode
}) {
  return (
    <WagmiProvider  config={config} >
      {props.children}
    </WagmiProvider>
  )
}