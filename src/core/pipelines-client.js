const {Observable, Subject} = require("canal-js-utils/rx");
const {extend} = require("canal-js-utils/misc");
const Worker = require("worker!./pipelines-worker.js");
const worker = new Worker();

var __actionId = 0;

function createWorkerPipeline(pipelineName, worker) {
  return function(params) {
    let actionId = `${pipelineName}:${__actionId++}`;

    return Observable.create((obs) => {
      function onmessage(event) {
        let data = event.data;
        if (data && data.__wid === actionId) {
          let type = data.__wtype;
          if (type === "next") {
            obs.next(data);
          }
          else if (type === "error") {
            obs.error(new Error(data.message));
          }
          else if (type === "complete") {
            obs.complete();
          }
        }
      }

      if (params.adaptation) {
        params.adaptation = extend({}, params.adaptation);
        params.representation = extend({}, params.representation);

        params.adaptation.index = null;
        params.adaptation.representations = null;
        params.representation.index = null;

        if (params.segment && !params.segment.init) {
          params.adaptation.smoothProtection = null;
        }
      }

      worker.addEventListener("message", onmessage);
      worker.postMessage({ pipelineName, unsubscribe: false, actionId, params });

      () => {
        worker.postMessage({ pipelineName, unsubscribe: true, actionId });
        worker.removeEventListener("message", onmessage);
      };
    });
  };
}

function WorkerPipelines() {
  const metrics = new Subject();

  const createPipelines = (transportName, options) => {
    options = options || {};
    let transportOptions = options.transportOptions;

    worker.postMessage({ transportName, transportOptions });
    worker.addEventListener("message", ({data}) => {
      if (data.__wtype === "metrics") {
        metrics.next(data.value);
      }
    });

    return {
      manifest: createWorkerPipeline("manifest", worker),
      audio:    createWorkerPipeline("audio", worker),
      video:    createWorkerPipeline("video", worker),
      text:     createWorkerPipeline("text", worker),
    };
  };

  return { metrics, createPipelines };
}

module.exports = WorkerPipelines;
