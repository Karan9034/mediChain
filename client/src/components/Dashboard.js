import Doctor from "./Doctor.js"
import Patient from "./Patient.js"
import Insurer from "./Insurer.js"
import { useEffect, useState } from "react"

const Dashboard = ({mediChain, token, account, ipfs}) => {
    const [ethValue, setEthValue] = useState(0);

    useEffect(() => {
        fetch('https://api.coinbase.com/v2/exchange-rates?currency=ETH')
            .then(res => res.json())
            .then(res => setEthValue(res.data.rates.INR))
        if(token==="") window.location.href = '/login'
    }, [])

    return (
        <div className="dash">
            {token==="1" ? <Patient ipfs={ipfs} ethValue={ethValue} mediChain={mediChain} account={account} /> : token==="2" ? <Doctor ipfs={ipfs} mediChain={mediChain} account={account} /> : token==="3" ? <Insurer ipfs={ipfs} ethValue={ethValue} mediChain={mediChain} account={account} /> : <></>}
        </div>
    )
}


export default Dashboard