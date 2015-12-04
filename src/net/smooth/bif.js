var {
  le2toi,
  le4toi,
  bytesToStr
} = require("canal-js-utils/bytes");

function parseBif(buf) {
  var pos = 0;

  var fileFormat = bytesToStr(buf.subarray(pos, pos + 8));   pos += 8;

  var majorVersion = buf[pos]; pos += 1;
  var minorVersion = buf[pos]; pos += 1;
  var patchVersion = buf[pos]; pos += 1;
  var increVersion = buf[pos]; pos += 1;

  var version = [minorVersion, majorVersion, patchVersion, increVersion].join(".");

  var imageCount = buf[pos] + le4toi(buf, pos + 1); pos += 4;
  var timescale = le4toi(buf, pos); pos += 4;

  var format = bytesToStr(buf.subarray(pos, pos + 4)); pos += 4;

  var width = le2toi(buf, pos); pos += 2;
  var height = le2toi(buf, pos); pos += 2;

  var aspectRatio = [buf[pos], buf[pos + 1]].join(":"); pos += 2;

  var isVod = buf[pos] === 1; pos += 1;

  // bytes 0x1F to 0x40 is unused data for now
  pos = 64;

  var thumbs = [];
  var currentImage, foundLastImage, currentTs = 0;

  while(!foundLastImage) {
    let currentImageIndex = le4toi(buf, pos); pos += 4;
    let currentImageOffset = le4toi(buf, pos); pos += 4;

    if (currentImage) {
      let index = currentImage.index;
      let duration = timescale;
      let ts = currentTs;
      let data = buf.subarray(currentImage.offset, currentImageOffset);

      thumbs.push({ index, duration, ts, data });

      currentTs += timescale;
    }

    currentImage = { index: currentImageIndex, offset: currentImageOffset };
    foundLastImage = currentImageIndex === 4294967295; /* when index is 0xffffffff */
  }

  return {
    fileFormat,
    version,
    imageCount,
    timescale,
    format,
    width,
    height,
    aspectRatio,
    isVod,
    thumbs
  };
}

module.exports = {
  parseBif
};