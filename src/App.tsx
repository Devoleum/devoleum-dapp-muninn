import { Link, Routes, Route } from "@solidjs/router";
import { Component, createEffect, createSignal, onMount } from "solid-js";
import { Header } from "./components/Header";
import { ethers } from "ethers";
import "./styles/index.css";
import "./styles/responsive.css";
import DevoleumArtifact from "./assets/Devoleum.json";
import { chainEnum } from "./models/ContractAddress";
import { AlgoVerifier, NotarizeMany, Verifier } from "./pages";
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
    const { chainId } = await provider.getNetwork();
    chainIdSwitch(chainId);
    const signerTemp = provider.getSigner();
    setSigner(signerTemp);
    const contractTemp = new ethers.Contract(
      contractAddress(),
      DevoleumArtifact.abi,
      provider
    );

    console.log("contractTemp: ", contractTemp);

    setContract(contractTemp);
  });

  window.ethereum &&
    window.ethereum.on("chainChanged", () => {
      window.location.reload();
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
      <h1 class="title">Devoleum Verifier</h1>
      <nav>
        <Link href="/evm">EVM Verifier</Link> |{" "}
        <Link href="/algorand">Algorand Verifier</Link>
      </nav>
      <Header />

      <br />
      <Routes>
        <Route
          path="/evm/:id?"
          component={() => (
            <Verifier
              blockchainName={blockchainName()}
              contract={contract()}
              signer={signer()}
            />
          )}
        />
        <Route path="/algorand/:id?" component={() => <AlgoVerifier />} />
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
    </div>
  );
};

export default App;
