module.exports = [
  {
    "name": "A la Une Canal-Plus",
    "url": "http://hss-live-m3-aka.canal-plus.com/live/hss/alaune-hd/hd-clair.isml/Manifest",
    "transport": "smooth",
    "ciphered": false,
    "live": true
  },
  {
    "name": "ITele",
    "url": "http://hss-live-m5-aka.canal-plus.com/live/hss/itele-clair-hd/hd-clair.isml/Manifest",
    "transport": "smooth",
    "ciphered": false,
    "live": true
  },
  {
    "name": "Unified Streaming Live",
    "url": "http://live.unified-streaming.com/loop/loop.isml/loop.mpd?format=mp4&session_id=25020",
    "transport": "dash",
    "ciphered": false,
    "live": true
  },
  {
    "name": "CubeS",
    "url": "http://dash-vod-aka-test.canal-bis.com/test/pub-cube-s/index.mpd",
    "transport": "dash",
    "ciphered": false,
    "live": false
  },
  {
    "name": "Envivio",
    "url": "http://dash.edgesuite.net/envivio/dashpr/clear/Manifest.mpd",
    "transport": "dash",
    "ciphered": false,
    "live": false
  },
  {
    "name": "pub CubeS (bif)",
    "url": "http://hss-vod-aka-test.canal-bis.com/ondemand/test/bif/index.ism/Manifest",
    "transport": "smooth",
    "ciphered": false,
    "live": false,
    "images": {
      "mimeType": "application/bif",
      "url": "http://dash-vod-aka-test.canal-bis.com/test/bif/index.bif"
    }
  },
  {
    "name": "Grand Journal (bif)",
    "url": "http://hss-vod-aka-test.canal-bis.com/ondemand/test/bif2/index.ism/Manifest",
    "transport": "smooth",
    "ciphered": false,
    "live": false,
    "images": {
      "mimeType": "application/bif",
      "url": "http://dash-vod-aka-test.canal-bis.com/test/bif/index2.bif"
    }
  }
];
