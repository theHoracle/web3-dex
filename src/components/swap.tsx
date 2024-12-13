"use client"
import { ArrowUpDown, ChevronDown, Loader2, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { ChangeEvent, useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import tokenList from "@/data/token-list.json"
import Image from "next/image";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from "./ui/dialog";
import { parseEther } from 'viem'
import { checkAndApprove, fetchPrices, makeTransaction } from "@/app/swap/action";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { toast } from "sonner";


const Swap = () => {
    const [slippage, setSlippage] = useState("")
    const [firstTokenAmount, setFirstTokenAmount] = useState<string | undefined>()
    const [secondTokenAmount, setSecondTokenAmount] = useState<string | undefined>()
    const [tokenOne, setTokenOne] = useState(tokenList[0])
    const [tokenTwo, setTokenTwo] = useState(tokenList[1])
    const [prices, setPrices] = useState({
        tokenOne: 0,
        tokenTwo: 0,
        ratio: 0
    })
    const [txDetails, setTxDetails] = useState<{
         
        to: `0x${string}` | undefined,
        data: string | undefined,
        value: string | undefined
    }>({
        to: undefined,
        data: undefined,
        value: undefined,
    })

    const { sendTransaction, data, context } = useSendTransaction()

    const { address, isConnected } = useAccount()
    const { isLoading, isSuccess } = useWaitForTransactionReceipt()

    // show success 
    useEffect(() => {
        if(isSuccess) {
            toast.success("Transaction successful")
        }
    }, [isSuccess])
    // show loader
    useEffect(() => {
        if(isLoading) {
            toast.info(
                <div className="flex items-center gap-1">
                    <span>Transaction pending...</span>
                    <Loader2 className="animate-spin size-6 " />
                </div>
            )
        }
    }, [isLoading])

    const switchTokens = () => {
        setFirstTokenAmount("")
        setSecondTokenAmount("")
        setPrices({
            tokenOne: 0,
            tokenTwo: 0,
            ratio: 0
        })
        const one = tokenOne
        const two = tokenTwo
        setTokenOne(two)
        setTokenTwo(one)
    }
    useEffect(() => {
        const getPriceData = async () => {
            if (tokenOne.address !== "" && tokenTwo.address !== "") {
                const data = await fetchPrices(tokenOne.address, tokenTwo.address)
                if (data) setPrices(data)
                console.log(prices)
            }
        }
        getPriceData()
    }, [tokenOne, tokenTwo])

    const setTokenTwoAmount = () => {
        if(prices.ratio && firstTokenAmount) {
            const secondAmount = parseFloat(firstTokenAmount) * prices.ratio
            console.log("secondAmt: ", secondAmount)
            setSecondTokenAmount(secondAmount.toFixed(4))
        } else {
            setSecondTokenAmount("")
        }
    }
    useEffect(() => {
        setTokenTwoAmount()
    }, [firstTokenAmount, prices.ratio])


    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if(value !== "" && parseInt(value) > 0) {
            setFirstTokenAmount(value)
        } else {
            setFirstTokenAmount("")
            setSecondTokenAmount("")
        }
    }

    const fetchDexSwap = async () => {
        const { message, status, txData } = await checkAndApprove({
            tokenAddress:  tokenOne.address,
            amount: firstTokenAmount as string,
            userAddress: address as `0x${string}`,
        }) 
        if(!status) {
            toast.error(message)
            return 
        }
        if(!txData) {
            toast.success(message)
        } else if (txData && firstTokenAmount) {
            toast.info(message)
            setTxDetails(txData)
            const tx = await makeTransaction({
                fromTokenAddress: tokenOne.address,
                toTokenAddress: tokenTwo.address,
                amount: firstTokenAmount.padEnd(
                    tokenOne.decimals + Math.floor(parseFloat(firstTokenAmount))
                    .toString()
                    .length, '0'),
                fromAddress: address as `0x${string}`,
                slippage: parseFloat(slippage),
            })
            // to get the actual amount of tokens that would be recieved to show the user
            let decimals = Number(`1£${tokenTwo.decimals}`)
            setSecondTokenAmount((Number(tx.toTokenAmount)/decimals).toFixed(2))
            // set tx details for swap
            setTxDetails(tx)
        }
    }

    useEffect(( ) => {
        if(txDetails.to && isConnected && txDetails.data && txDetails.value) {
            sendTransaction({
                to: txDetails.to,
                value: parseEther(txDetails.value),
                data: txDetails.data as `0x${string}`,
            })
        }
    }, [txDetails])


    return <Card className="h-fit w-full bg-black/50 text-stone-100 border-stone-800">
        <CardHeader>
        <CardTitle className="flex items-center">
            <h4 className="flex-1">Swap</h4>
            <Popover>
                <PopoverTrigger asChild>
                    <Settings className="text-stone-400 size-5 hover:text-stone-200" />    
                </PopoverTrigger>
                <PopoverContent align="end" className="w-40 text-stone-100 bg-[rgb(25,33,52)] border-stone-800">
                    <div className="flex flex-col items-start">
                        <h4 className="font-bold">Settings</h4>
                        <RadioGroup 
                            defaultValue="2.5" 
                            value={slippage} 
                            onValueChange={setSlippage}
                            className="grid gap-2 mt-2"
                            >
                            <h5 className="text-sm">Slippage Tolerance</h5>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="0.5" id="r1" className="text-stone-100" />
                                <Label htmlFor="r1">0.5%</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="2.5" id="r2" className="text-stone-100" />
                                <Label htmlFor="r2">2.5%</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="5" id="r3" className="text-stone-100  fill-slate-300" />
                                <Label htmlFor="r3">5.0%</Label>
                            </div>
                       </RadioGroup>
                    </div>
                </PopoverContent>
            </Popover>
        </CardTitle>
        </CardHeader>
        <CardContent className="relative">
            <Input value={firstTokenAmount} placeholder="0" type="number" onChange={handleInputChange} />
            <Input value={secondTokenAmount} placeholder="0" disabled />
           {/* switch button */}
            <button
            className="absolute top-[50px] size-fit border-4 flex flex-col items-center justify-center border-stone-900 bottom-1/2 right-1/2 bg-[rgb(25,33,52)] text-stone-500 hover:text-stone-200 p-1 rounded-md"
            onClick={switchTokens}>
                <ArrowUpDown className="size-4" />
            </button>
            {/* token base */}
            <Dialog>
                <DialogTrigger asChild>
                <div className="absolute flex gap-2 items-center px-2 py-1 top-[14px] right-8 min-w-14 w-fit h-9 rounded-[100px] bg-[#3a4157]">
                    <Image
                        src={tokenOne.img}
                        alt="token logo"
                        width={20}
                        height={20}
                    />
                    {tokenOne.ticker}
                    <ChevronDown />
                </div>
                </DialogTrigger>    
                <TokensModal setToken={setTokenOne} />
            </Dialog>

            {/* token quote */}
            <Dialog>
            <DialogTrigger asChild>
            <div className="absolute flex gap-2 items-center px-2 py-1 top-[81px] right-8 min-w-14 h-9 rounded-[100px] bg-[#3a4157]">
            <Image
                    src={tokenTwo.img}
                    alt="token logo"
                    width={20}
                    height={20}
                    />
                {tokenTwo.ticker}
                <ChevronDown /> 
            </div>
            </DialogTrigger>
            <TokensModal setToken={setTokenTwo} />
            </Dialog>

            {/* swap button */}
            <button
            className="h-12 w-full flex flex-col justify-center items-center disabled:text-opacity-40 bg-[rgb(25,33,52)] text-[#5981F3] font-semibold py-4 mt-2 hover:bg-[#243056] rounded-lg"
            onClick={fetchDexSwap}
            disabled={!firstTokenAmount || !isConnected}
            >
                Swap
            </button>
        </CardContent>
    </Card>
}

export default Swap;

const TokensModal = (props: {
    setToken: (token: any) => void
}) => {
    return <DialogContent id="token-list" className="bg-[rgb(25,33,52)] border-stone-800 text-stone-100">
        <DialogTitle>Select a token</DialogTitle>
        <div className="flex flex-col space-y-1 max-h-60 overflow-y-scroll">
            {tokenList.map((token, index) => (
                <DialogClose
                key={token.ticker}
                onClick={
                    () => props.setToken(tokenList[index])
                    // close dialog onclick
                }
                className="flex h-16 items-center hover:bg-[#243056] py-2.5 px-5 rounded-lg">
                    <div className="flex-1 items-center flex gap-4">
                    <Image
                        src={token.img}
                        alt={token.ticker}
                        width={20}
                        height={20}
                    />
                    <p className="">{token.name}</p>
                    </div>
                    <p>{token.ticker}</p>
                    
                </DialogClose>
            ))}
        </div>
    </DialogContent>
}