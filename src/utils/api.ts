import { keccak } from "hash-wasm";

export const getData = async (url: string) => {
  try {
    const res = await fetch(url);
    const result = await res.json();
    return result;
  } catch (error) {
    if (error) {
      console.log("error is here: ", error);
    }
  }
  return;
};

export const calcHash = async (content: string, random: string) => {
  const hash = await keccak(content + random, 256);
  return hash;
};
