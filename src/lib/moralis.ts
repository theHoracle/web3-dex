import Moralis from 'moralis'

await Moralis.start({
    apiKey: process.env.MORALIS_API_KEY
})

export default Moralis