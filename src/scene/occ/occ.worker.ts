import * as Comlink from "comlink";
import initOpenCascade from "opencascade.js";

let oc;

async function init() {
  if (!oc) {
    oc = await initOpenCascade();
    console.log("✅ OCC loaded in worker");
  }
}

Comlink.expose({ init });
