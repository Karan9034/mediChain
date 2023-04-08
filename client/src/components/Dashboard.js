import Doctor from "./Doctor.js"
import Patient from "./Patient.js"
import Insurer from "./Insurer.js"

const Dashboard = ({mediChain, token, account}) => {

    return (
        <div className="dash">
            {token==="1" ? <Patient mediChain={mediChain} account={account} /> : token==="2" ? <Doctor mediChain={mediChain} account={account} /> : token==="3" ? <Insurer mediChain={mediChain} account={account} /> : <></>}
        </div>
    )
}


export default Dashboard