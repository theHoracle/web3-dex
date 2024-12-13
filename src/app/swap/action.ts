"use server"
import Moralis from '@/lib/moralis';
import axios from 'axios'

const ONEINCH_API = "https://api.1inch.io/v5.0"; // Base API URL
const CHAIN_ID = 1; // Ethereum mainnet; change to 137 for Polygon, etc.

 
export async function fetchPrices(addressOne: string, addressTwo: string) {
    // const res = await axios.get(`${process.env.SERVER_URL}/tokenPrice`, {
    //             params: {
    //             addressOne,
    //             addressTwo
    //         }})
    // if(!res.status !== 200) return null
    // return res.data
    try {
    const [responseOne, responseTwo] = await Promise.all([
        Moralis.EvmApi.token.getTokenPrice({
          address: addressOne,
        }),
        Moralis.EvmApi.token.getTokenPrice({
          address: addressTwo,
        }),
      ]) 
    console.log(responseOne.raw, responseTwo.raw);
    const usdPrice = {
    tokenOne: responseOne.raw.usdPrice,
    tokenTwo: responseTwo.raw.usdPrice,
    ratio: responseOne.raw.usdPrice / responseTwo.raw.usdPrice
    }
    return usdPrice
    } catch (error) {
        console.log("the error: ", error)
        return null
    }
    
}

export async function checkAndApprove(props: {
    tokenAddress: string,
    amount: string,
    userAddress: string,
}): Promise<{message: string, status: boolean, txData?: any}> {
    const { tokenAddress, amount, userAddress } = props
    try {
    const res = await axios.get(`${ONEINCH_API}/approve/allowance`,
        {
            params: {
                tokenAddress,
                walletAddress: userAddress, // Wallet address from useAccount
            },
        }
    )
    
    if(res.status !== 200) return {message: "Failed to check allowance", status: false}
    const allowance = BigInt(res.data.allowance || "0");
    console.log("Current allowance:", allowance);

    const requiredAmount = BigInt(amount);

    if (allowance < requiredAmount) {
        console.log("Insufficient allowance. Generating approval transaction...");

        // Generate approval transaction
        const approvalTx = await axios.get(
            `${ONEINCH_API}/${CHAIN_ID}/approve/transaction`,
            {
                params: {
                    tokenAddress,
                    amount, // Amount to approve (use '0' for unlimited)
                },
            }
        );
        if(!approvalTx.status) return {message: "Failed to generate approval transaction", status: false}
        return {message: "Approval needed. Generated approval Transaction.", status: true, txData: approvalTx.data}
    } else {
        console.log("Sufficient allowance. No approval needed.");
        return {message: "No approval needed", status: true}
    }
    } catch (error) {
        console.log("the error: ", error)
        return {message: "Failed to check allowance", status: false}
    }
    
}

export async function makeTransaction(props:{
    fromTokenAddress: string,
    toTokenAddress: string,
    fromAddress: string,
    amount: string,
    slippage: number
}) {
    const res = await axios.get(`${ONEINCH_API}/${CHAIN_ID}/swap`, {
        params: {
            ...props
        }
    })
    if(res.status !== 200) return null
    return res.data.tx
}