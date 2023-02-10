import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const balanceButton = document.getElementById("balanceButton")
const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const withdrawButton = document.getElementById("withdrawButton")
withdrawButton.onclick = withdraw
balanceButton.onclick = getBalance
connectButton.onclick = connect
fundButton.onclick = fund

console.log(ethers)

async function connect() {
    if (typeof window.ethereum != "undefined") {
        await ethereum.request({ method: "eth_requestAccounts" })
        connectButton.innerHTML = "Connected!"
    } else {
        connectButton.innerHTML = "Please Install Metamask!"
    }
}

async function getBalance() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`funding with ${ethAmount}...`)
    if (typeof window.ethereum != "undefined") {
        //what do we need to fund our contract
        //1. provider / rpc_url to the block chain
        //2. signer / wallet to pay gas fee
        //3. abi and address to connect to contract
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        console.log(signer)
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount)
            })
            // listen for tx to be mined to display on front end that transaction sucessfuly went through
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    // return new Promise()
    //create listener for the blockchain to relay info to front ends
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, transactionReceipt => {
            console.log(
                `Completed with${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

async function withdraw() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
