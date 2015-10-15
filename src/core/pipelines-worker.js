const PipeLines = require("./pipelines");
let { createPipelines, metrics } = PipeLines();

const subscriptions = {};
let pipelines;

global.DOMParser = require("xmldom").DOMParser;

self.onmessage = function(event) {
  let data = event.data;

  if (data.transportName) {
    require(["../net/" + data.transportName + "/index.js"], function(transport) {
      if (typeof transport == "function") {
        transport = transport(data.transportOptions);
      }
      pipelines = createPipelines(transport, data);
      metrics.subscribe((value) => {
        if (value.value.response) {
          let response = { ...value.value.response };
          response.xhr = null;
          response.blob = null;
          value.value.response = response;
        }
        self.postMessage({ __wtype: "metrics", value });
      });
    });
    return;
  }

  let {pipelineName, unsubscribe, actionId, params} = data;
  const obs = new WorkerObserver(actionId);

  if (!pipelines) {
    obs.error(new Error("postMessage dropped: no pipelines"));
    return;
  }

  if (!pipelines[pipelineName]) {
    obs.error(new Error(`postMessage dropped: no pipelines named ${pipelineName}`));
    return;
  }

  if (subscriptions[actionId]) {
    if (unsubscribe) {
      subscriptions[actionId].unsubscribe();
      delete subscriptions[actionId];
    } else {
      obs.error(new Error(`postMessage dropped: actionId coliding`));
    }
  } else {
    subscriptions[actionId] =
      pipelines[pipelineName](params).subscribe(obs);
  }
};

class WorkerObserver {
  constructor(actionId) {
    this.actionId = actionId;
  }

  next(value) {
    var transferables = [];

    if (value.response) {
      value.response.blob = null;
      value.response.xhr = null;
    }

    if (value.parsed) {
      var blob = value.parsed.blob;
      if (blob && (
        blob instanceof Uint8Array ||
        blob instanceof Uint16Array ||
        blob instanceof Uint32Array ||
        blob instanceof Int8Array ||
        blob instanceof Int16Array ||
        blob instanceof Int32Array ||
        blob instanceof Float32Array ||
        blob instanceof Float64Array
      )) {
        value.parsed.blob = value.parsed.blob.buffer;
        transferables.push(value.parsed.blob);
      }
      else if (value.parsed.blob instanceof ArrayBuffer) {
        transferables.push(value.parsed.blob);
      }
    }

    value.__wtype = "next";
    value.__wid = this.actionId;

    self.postMessage(value, transferables);
  }

  error(error) {
    self.postMessage({
      __wtype: "error",
      __wid: this.actionId,
      message: error.message,
    });
  }

  complete() {
    delete subscriptions[this.actionId];
    self.postMessage({
      __wtype: "complete",
      __wid: this.actionId
    });
  }
}
