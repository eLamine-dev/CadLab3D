import * as Comlink from "comlink";

export interface OCCAPI {
  init(): Promise<void>;
}

const worker = new Worker(new URL("./occ.worker.ts", import.meta.url), {
  type: "module",
});
export const occAPI = Comlink.wrap<OCCAPI>(worker);
