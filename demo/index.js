require("./styles/style.css");
var React = require("react");

var RxPlayer = require("../src");
var DemoPlayer = require("./player");
var PromisePollyfill = require("es6-promise");

var contentsDatabase = require("./contents");

function getKeySystems(content) {
  if (!content.ciphered)
    return null;

  return [{
      type: "playready",
      getLicense: function(challenge) {
          return new Promise(function(resolve, reject) {
              var licenseServerUrl = content.licenseServerUrl;
              var licenseRequest = new XMLHttpRequest();
              var licenseRequestHeaders = {};
              var licenseChallenge;

              var data = (challenge instanceof ArrayBuffer) ? challenge : challenge.buffer;
              var dataview = new Uint16Array(data);

              var message = String.fromCharCode.apply(null, dataview);
              var xmlDoc = new DOMParser().parseFromString(message, "application/xml");

              if (xmlDoc.getElementsByTagName("Challenge")[0]) {
                  var Challenge = xmlDoc.getElementsByTagName("Challenge")[0].childNodes[0].nodeValue;
                  if (Challenge) {
                      licenseChallenge = window.atob(Challenge);
                  }
              } else {
                  licenseChallenge = message;
              }

              var headerNameList = xmlDoc.getElementsByTagName("name");
              var headerValueList = xmlDoc.getElementsByTagName("value");

              for (var i = 0; i < headerNameList.length; i += 1) {
                  licenseRequestHeaders[headerNameList[i].childNodes[0].nodeValue] = headerValueList[i].childNodes[0].nodeValue;
              }
              if (licenseRequestHeaders.hasOwnProperty('Content')) {
                  licenseRequestHeaders['Content-Type'] = licenseRequestHeaders.Content;
                  delete licenseRequestHeaders.Content;
              }
              if (!licenseRequestHeaders.hasOwnProperty('Content-Type')) {
                  licenseRequestHeaders['Content-Type'] = 'text/xml; charset=utf-8';
              }

              licenseRequest.open("POST", licenseServerUrl);
              licenseRequest.responseType = "arraybuffer";
              licenseRequest.onload = function() {
                  if (this.status < 200 || this.status > 299) {
                      return reject("License Server responded with not success status");
                  }
                  if (this.status === 200 && this.readyState === 4) {
                      if (this.response !== null) {
                          return resolve(this.response);
                      } else {
                          return reject("License Server responded with no data");
                      }
                  }
              };
              licenseRequest.onerror = function() {
                  return reject("License Server request error");
              };

              for (var headerName in licenseRequestHeaders) {
                  licenseRequest.setRequestHeader(headerName, licenseRequestHeaders[headerName]);
              }
              licenseRequest.send(licenseChallenge);
          });
      }
  }]
}

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)", "i"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

const noUI = !!getParameterByName("noui");

var DemoZapper = React.createClass({
  componentDidMount() {
    var url = getParameterByName("url");
    if (url) {
      var autoPlay = getParameterByName("autoplay") !== "false";
      var ciphered = getParameterByName("ciphered");
      var transport = getParameterByName("transport");
      this.zap({ url, ciphered, transport, autoPlay });
    }
  },

  onSelectionChange: function(e) {
    this.zap(+e.target.value);
  },

  zap: function(content) {
    if (typeof content == "number")
      content = contentsDatabase[content];

    if (content == null) {
      this.player.stop();
      return;
    }

    var videoUrl = content.url;
    var keySystems = getKeySystems(content);
    var transport = content.transport;
    var autoPlay = content.autoPlay === false ? false : true;
    var images = content.images;

    this.player.loadVideo({
      url: videoUrl,
      transport: transport,
      keySystems: keySystems,
      autoPlay: autoPlay,
      images: images,
    });
  },

  createPlayer: function(videoElement) {
    var player = new RxPlayer({
      videoElement: videoElement,
    });

    this.player = player;
    this.player.log.setLevel("DEBUG");
    this.player.addEventListener("error", function(error) {
      alert(error.message);
    });

    window.player = player;
    return player;
  },

  render: function() {
    var contentsOptions = contentsDatabase.map(function(content, index) {
      return (<option key={index} value={index}>{content.transport}: {content.name}{content.live ? " (live)" : ""}</option>);
    });

    return (
      <div>
        <section id="title">
          <h1 className="title">
            <span className="light">rx-player</span>
          </h1>
        </section>

        <section className="content-selection">
          <select onChange={this.onSelectionChange}>
            <option value={null}>Select content...</option>
            {contentsOptions}
          </select>
        </section>

        <DemoPlayer createPlayer={this.createPlayer} noUI={noUI} />
      </div>
    );
  }
});

window.mountDemoPlayer = function(element, props) {
  return React.render(<DemoZapper {...props} />, element);
};
