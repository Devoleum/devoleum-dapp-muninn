import { useParams } from "@solidjs/router";
import { createEffect, createMemo, createSignal, Show } from "solid-js";
import { IStep } from "../models/IStep";
import { calcHash, getData } from "../utils/api";
import { IPageProps } from "../models/IPage";
import { chainEnum } from "../models/ContractAddress";

export const Verifier = (props: IPageProps) => {
  let { id = "" } = useParams();
  console.log("id; ", id);

  const [step, setStep] = createSignal<IStep>({} as IStep);
  const [hash, setHash] = createSignal<string>("");
  const [proof, setProof] = createSignal(0);
  const [error, setError] = createSignal("");
  const [itemId, setItemId] = createSignal<string>(id);

  const blockchainNameAttr = createMemo(() =>
    props.contract.address === chainEnum.POLYGON
      ? { name: "Polygon Matic", key: "polygon_matic_v2_notarization" }
      : {
          name: "Sepolia Ethereum Testnet",
          key: "sepolia_test_eth_notarization",
        }
  );

  console.log(
    "blockchainNameAttr: ",
    blockchainNameAttr(),
    props.contract.address
  );

  const getDevoleumStep = async () => {
    let step: IStep = await getData(
      `${import.meta.env.VITE_API_BASE_URL}/api/steps/${itemId()}`
    );
    if (!step.randomizeProof) return;
    const jsonContent = await getData(step.uri);

    setHash(
      "0x" + (await calcHash(JSON.stringify(jsonContent), step.randomizeProof))
    );
    setStep(step);
    await getProof();
  };
  const getProof = async () => {
    const notarizationDate = await props.contract.hashToDate(hash());
    await setProof(notarizationDate);
  };

  return (
    <Show
      when={window.ethereum && props.contract.address}
      fallback={
        <div>
          {" "}
          Please change Metamask network to Polygon Matic or Sepolia and refresh
          the page
        </div>
      }
    >
      <div>
        <div style={{ "line-height": "0.5", "padding-bottom": "16px" }}>
          <p>{blockchainNameAttr().name}</p>
          <p class="small">{props.contract.address}</p>
        </div>

        <div>
          <span class="label">Please insert the Step ID</span>
        </div>
        <input
          class="input"
          type="text"
          onChange={(e: any) => {
            setItemId(e.target.value);
          }}
          value={itemId()}
        />
        <div>
          <button class="button" onClick={() => getDevoleumStep()}>
            Verify Step
          </button>
        </div>
        <span>{error}</span>
        <br />
        <br />
        {proof() && step() && (
          <div>
            <div class="tab-with-corner">
              Devoleum Step{" - "}
              {proof() > 0 ? (
                <span style={{ color: " #44f1a6" }}>Matching</span>
              ) : (
                <span style={{ color: "red" }}>Not Matching</span>
              )}
            </div>
            <div class="boxed">
              <div>
                <span class="label">Step ID: </span>
                {itemId()}
              </div>
              <div>
                <span class="label">Step name: </span>
                <a
                  href={"https://app.devoleum.com/step/" + step()._id["$oid"]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {step().name}
                </a>
              </div>
              <div>
                <span class="label">JSON hash: </span>
                {hash()}
              </div>
              <div>
                <span class="label">{props.blockchainName} Timestamp: </span>
                {new Date(proof() * 1000).toLocaleString()}
              </div>
              <div>
                <span class="label">{props.blockchainName} tx: </span>
                <a
                  href={step()[blockchainNameAttr().key] as string}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {step()[blockchainNameAttr().key] as string}
                </a>
              </div>
              <div>
                <span class="label">JSON link: </span>
                <a href={step().uri} target="_blank" rel="noopener noreferrer">
                  {step().uri}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </Show>
  );
};
