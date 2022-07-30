import { Link, Routes, Route } from "@solidjs/router";
import { Component, createSignal, onMount } from "solid-js";
import { Header } from "./components/Header";
import { ethers } from "ethers";
import "./styles/index.css";
import "./styles/responsive.css";
import DevoleumArtifact from "./assets/Devoleum.json";
import Verifier from "./pages/Verifier";
import NotarizeMany from "./pages/NotarizeMany";
import { chainEnum } from "./models/ContractAddress";
console.log(import.meta.env.VITE_API_BASE_URL);

const App: Component = () => {
  const [blockchainName, setBlockchainName] = createSignal("Unkown");
  const [contractAddress, setContractAddress] = createSignal<chainEnum>(
    chainEnum.UNKNOWN
  );
  const [contract, setContract] = createSignal<ethers.Contract>(
    {} as ethers.Contract
  );
  const [signer, setSigner] = createSignal<ethers.Signer>({} as ethers.Signer);

  onMount(async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const { chainId } = await provider.getNetwork();
    chainIdSwitch(chainId);
    const signerTemp = provider.getSigner();
    setSigner(signerTemp);
    const contractTemp = new ethers.Contract(
      contractAddress(),
      DevoleumArtifact.abi,
      provider
    );

    setContract(contractTemp);
  });

  const chainIdSwitch = (chainId: number) => {
    switch (chainId) {
      case 137:
        console.log("This is the Polygon test network.");
        setBlockchainName("Polygon Matic");
        setContractAddress(chainEnum.POLYGON);
        break;
      case 11155111:
        console.log("This is the Sepolia test network.");
        setBlockchainName("Ethereum Sepolia");
        setContractAddress(chainEnum.SEPOLIA);
        break;
      default:
        console.log("This is an unknown network. id: ", chainId);
        setBlockchainName("Unknown");
        setContractAddress(chainEnum.UNKNOWN);
    }
  };

  return (
    <div class="container App">
      <h1 class="title">Devoleum - {blockchainName()} Verifier</h1>
      {window.ethereum ? (
        <>
          <nav>
            <Link href="/">Verifier</Link> |{" "}
            <Link href="/notarizer">Notarizer</Link>
          </nav>
          <Header blockchainName={blockchainName()} />
          <div>
            In order to make it work you need to have the{" "}
            <a
              href="https://metamask.io/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Metamask browser extension.
            </a>
          </div>
          <br />
          <Routes>
            <Route
              path="/:id?"
              component={() => (
                <Verifier
                  blockchainName={blockchainName()}
                  contract={contract()}
                  signer={signer()}
                />
              )}
            />
            <Route
              path="/notarizer"
              component={() => (
                <NotarizeMany
                  blockchainName={blockchainName()}
                  contract={contract()}
                  signer={signer()}
                />
              )}
            />
          </Routes>
        </>
      ) : (
        <div>
          {" "}
          Please change Metamask network to Polygon Matic or Sepolia and refresh
          the page
        </div>
      )}
    </div>
  );
};

export default App;
