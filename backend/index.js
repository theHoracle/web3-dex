const express = require("express");
const Moralis = require("moralis").default;
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get("/tokenPrice", async (req, res) => {
  const { query } = req

  const [responseOne, responseTwo] = await Promise.all([
              Moralis.EvmApi.token.getTokenPrice({
                address: query.addressOne,
              }),
              Moralis.EvmApi.token.getTokenPrice({
                address: query.addressTwo,
              }),
            ]) 
  console.log(responseOne.raw, responseTwo.raw);
  const usdPrice = {
    tokenOne: responseOne.raw.usdPrice,
    tokenTwo: responseTwo.raw.usdPrice,
    ratio: responseOne.raw.usdPrice / responseTwo.raw.usdPrice
  }
  return res.status(200).json(usdPrice);
});

Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls`);
  });
});