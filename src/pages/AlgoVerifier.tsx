import { IStep } from "../models/IStep";
import { createSignal } from "solid-js";
import { getData } from "../utils/api";
import { useParams } from "@solidjs/router";

export const AlgoVerifier = () => {
  let { id = "" } = useParams();
  let { netparam = "main" } = useParams();
  const [step, setStep] = createSignal<IStep>({} as IStep);
  const [algoHash, setAlgoHash] = createSignal<string>("");
  const [error, setError] = createSignal("");
  const [itemId, setItemId] = createSignal(id);
  const [net, setNet] = createSignal(netparam);

  const getDevoleumStep = async () => {
    let step: IStep = await getData(
      `${import.meta.env.VITE_API_BASE_URL}/api/steps/${itemId()}`
    );
    if (
      !step.uri ||
      (!step.test_algo_notarization && net() === "test") ||
      (!step.main_algo_notarization && net() === "main")
    ) {
      setError("Something went wrong! Try another ID.");
      return;
    }
    if (!step.randomizeProof) return;
    setStep(step);
    await getAlgoNote(
      net() === "main"
        ? step.main_algo_notarization
        : step.test_algo_notarization
    );
  };

  const getAlgoNote = async (url: string) => {
    const baseUrl =
      net() === "main"
        ? "https://algoexplorer.io/tx/"
        : "https://testnet.algoexplorer.io/tx/";
    const txId = url.substring(baseUrl.length);
    console.log(url);
    const algoExpUrl =
      net() === "main"
        ? `https://indexer.algoexplorerapi.io/v2/transactions/${txId}`
        : `https://new.${net()}net.algoexplorerapi.io/v2/transactions/${txId}`;
    let data = await getData(algoExpUrl);
    data = JSON.parse(atob(data.transaction.note));
    setAlgoHash(data.hash);
  };

  const handleOptionChange = async (changeEvent: any) => {
    const val = changeEvent.target.value;
    setNet(val);
  };

  return (
    <div>
      <div>
        <div class="label">Please insert the Step ID</div>
      </div>
      <div>
        <form style={{ display: "flex", margin: "15px 0 15px" }}>
          <div class="radio">
            <label>
              <input
                name="net-type"
                type="radio"
                value="test"
                checked={net() === "test"}
                onChange={handleOptionChange}
              />
              TestNet
            </label>
          </div>
          <div class="radio">
            <label>
              <input
                name="net-type"
                type="radio"
                value="main"
                checked={net() === "main"}
                onChange={handleOptionChange}
              />
              MainNet
            </label>
          </div>
        </form>
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
      {algoHash() && (
        <div>
          <div class="tab-with-corner">
            Devoleum Step{" - "}
            {algoHash() === step().hash ? (
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
              {step().hash}
            </div>
            <div>
              <span class="label">Algorand hash: </span>
              {algoHash()}
            </div>
            <div>
              <span class="label">Algorand tx: </span>
              <a
                href={
                  net() === "main"
                    ? step().main_algo_notarization
                    : step().test_algo_notarization
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                {net() === "main"
                  ? step().main_algo_notarization
                  : step().test_algo_notarization}
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
  );
};
