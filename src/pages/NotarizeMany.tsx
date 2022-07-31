import { createMemo, createSignal, For, onMount, Show } from "solid-js";
import { IStep } from "../models/IStep";
import { calcHash, getData } from "../utils/api";
import Login from "../components/Login";
import { IPageProps } from "../models/IPage";
import { chainEnum } from "../models/ContractAddress";

export const NotarizeMany = (props: IPageProps) => {
  const [steps, setSteps] = createSignal<IStep[]>([] as IStep[]);
  const [txMessage, setTxMessage] = createSignal("");
  const [isValidToken, setIsValidToken] = createSignal(false);
  const blockchainNameAttr = createMemo(() =>
    props.contract.address === chainEnum.POLYGON
      ? { name: "Polygon Matic", key: "polygon_matic_v2_notarization" }
      : {
          name: "Sepolia Ethereum Testnet",
          key: "sepolia_test_eth_notarization",
        }
  );

  onMount(async () => {
    try {
      setIsValidToken(await isValidTokenCheck());
    } catch (e) {
      setIsValidToken(false);
    }
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { historyId } = e.target.elements;
    let steps = await getData(
      `${import.meta.env.VITE_API_BASE_URL}/api/steps/history/${
        historyId.value
      }`
    );
    console.log(steps);

    for (let step of steps) {
      await populateStep(step);
    }
    setSteps(steps);
  };

  const populateStep = async (step: IStep) => {
    if (!step.randomizeProof) return;
    const jsonContent = await getData(step.uri);
    step.calcHash = await calcHash(
      JSON.stringify(jsonContent),
      step.randomizeProof
    );
  };

  const notarizeProof = async (
    calcHash: string,
    stepId: string,
    idx: number
  ) => {
    try {
      await isValidTokenCheck();
    } catch (e) {
      setIsValidToken(false);
      setTxMessage("Please login to notarize");
      return;
    }

    if (!isValidToken()) return null;

    if (!props.signer) return;
    const devoleumWithSigner = props.contract.connect(props.signer);
    const tx = await devoleumWithSigner.createStepProof(`0x${calcHash}`);

    await tx.wait();
    console.log("tx: ", tx.hash);

    let txurl = "";

    if (!tx.hash) {
      console.error("emtpy txhash");
      return;
    }
    if (props.contract.address === chainEnum.SEPOLIA) {
      txurl = `https://sepolia.etherscan.io/tx/${tx.hash}`;
    }
    if (props.contract.address === chainEnum.POLYGON) {
      txurl = `https://polygonscan.com/tx/${tx.hash}`;
    }
    console.log("get tx hash: ", txurl);
    setTxMessage(txurl);
    const jsonRes = await notarizeMongo(txurl, calcHash, stepId);
    let updatedSteps = [...steps()];
    updatedSteps[idx] = jsonRes;
    setSteps(updatedSteps);
  };

  const notarizeMongo = async (
    txurl: string,
    calchash: string,
    stepId: string
  ) => {
    const token = JSON.parse(localStorage.getItem("userInfo") as string).token;
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/steps/evm/${stepId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          txurl: txurl,
          hash: calchash,
          chain_name: blockchainNameAttr().key,
        }),
      }
    );
    const jsonRes = await response.json();
    return jsonRes;
  };

  const isValidTokenCheck = async (): Promise<boolean> => {
    let token = JSON.parse(localStorage.getItem("userInfo") as string).token;
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/users/protected`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const jsonRes = await response.json();
    if (jsonRes !== "protected") {
      localStorage.removeItem("userInfo");
      return false;
    }
    if (jsonRes === "protected") return true;
    return false;
  };

  return (
    <Show
      when={window.ethereum}
      fallback={
        <div>
          {" "}
          Please change Metamask network to Polygon Matic or Sepolia and refresh
          the page
        </div>
      }
    >
      <div>
        <h2 class="sub-title">{blockchainNameAttr().name} Notarizer</h2>

        <div>
          <Show
            when={props.signer && isValidToken()}
            fallback={<Login onComplete={(res) => setIsValidToken(true)} />}
          >
            <div class="row">
              <div>
                <h4>1. Get Steps</h4>
                <p>Here the admin can notarize multiple proofs</p>
                <div>
                  <a href={txMessage()} target="_blank">
                    {txMessage()}
                  </a>
                </div>
                <form onSubmit={handleSubmit}>
                  <div class="row">
                    <input
                      class="input"
                      type="text"
                      placeholder="History id"
                      id="historyId"
                    />
                  </div>
                  <input
                    class="button"
                    type="submit"
                    id="getInfo"
                    value="Get Info"
                  />
                </form>
              </div>

              {steps && (
                <div class="twelve columns" id="stepContainer">
                  <h4>2. Notarize</h4>
                  <div>{txMessage()}</div>
                  <Show when={steps.length > 0}>
                    <table class="u-full-width" id="stepTable">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Notarize</th>
                        </tr>
                      </thead>
                      <tbody>
                        <For each={steps()} fallback={<div>Loading...</div>}>
                          {(step, idx) => (
                            <tr>
                              <td>
                                {step.name}
                                <Show
                                  when={step[blockchainNameAttr().key] === null}
                                >
                                  <div style={{ wordBreak: "break-all" }}>
                                    {step.calcHash}
                                  </div>
                                </Show>
                              </td>
                              <td>
                                <Show
                                  when={step[blockchainNameAttr().key] === null}
                                  fallback={<div>Done</div>}
                                >
                                  <input
                                    class="button"
                                    type="button"
                                    id="btnnotarize"
                                    value="GO"
                                    onClick={() =>
                                      notarizeProof(
                                        step.calcHash ? step.calcHash : "",
                                        step._id.$oid,
                                        idx()
                                      )
                                    }
                                  />
                                </Show>
                              </td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>
                  </Show>
                </div>
              )}
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
};
