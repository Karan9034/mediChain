import { useEffect, useState } from 'react';
// import Web3 from 'web3';
// import { create } from 'ipfs-http-client';
// import MedicalRecords from './contracts/MedicalRecords.json';
import Main from './components/Main';
import Footer from './components/Footer';
import SiteNavbar from './components/SiteNavbar';


// const auth = 'Basic ' + Buffer.from(process.env.REACT_APP_INFURA_API_KEY + ':' + process.env.REACT_APP_INFURA_API_SECRET).toString('base64');
// const ipfs = create({
//   host: 'ipfs.infura.io',
//   port: 5001,
//   protocol: 'https',
//   headers: {
//     authorization: auth
//   }
// });

function App() {
  const [account, setAccount] = useState('');
  const [currPage, setcurrPage] = useState('home');
  const [medicalRecords, setMedicalRecords] = useState(null);

  // const connectWallet = async () => {
  //   if (window.ethereum) {
	// 		window.ethereum.request({ method: 'eth_requestAccounts'})
	// 		  .then(result => {
	// 			  setAccount(result[0]);
	// 		  })
	// 		  .catch(error => {
  //        console.log(error)
  //      });
  //     window.ethereum.on('accountsChanged', () => window.location.reload());
  //     window.ethereum.on('chainChanged', () => window.location.reload());
	// 	} else {
	// 		console.log('Please use Metamask or a Web3 enabled browser');
	// 	}
  // }

  // const getContractInstance = async () => {
  //   const web3 = new Web3(window.ethereum || Web3.givenProvider || 'http://localhost:8545')
  //   const networkId = await web3.eth.net.getId()
  //   const networkData = MedicalRecords.networks[networkId]
  //   if(networkData){
  //     const medicalRecords = new web3.eth.Contract(MedicalRecords.abi, networkData.address)
  //     setMedicalRecords(medicalRecords)
  //     console.log(await medicalRecords.methods.name().call())
  //   }else{
  //     console.log('Please change your network')
  //   }
  // }

  useEffect(() => {
    // getContractInstance()
  }, [])


  return (
    <div>
      <SiteNavbar />
      <Main currPage={currPage}/>
      <Footer />
    </div>
  );
}

export default App;
