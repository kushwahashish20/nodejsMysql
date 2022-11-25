const {detectWhiteBackground} = require("../../src/analyzers/histogram");
it('background-must-be-white', async function () {
  let isWhiteBackground = await detectWhiteBackground("tests/samples/white-background-image.jpg");
  expect(isWhiteBackground).toBe(true);
});


it('background-white-detect-must-fail-for-turquoise-green-background', async function () {
  let isWhiteBackground = await detectWhiteBackground("tests/samples/turquoise-green-background.jpeg");
  expect(isWhiteBackground).toBe(false);
});

it('background-white-detect-must-fail-for-off-white-background', async function () {
  let isWhiteBackground = await detectWhiteBackground("tests/samples/off-white-background.jpg");
  expect(isWhiteBackground).toBe(false);
});

it('tolerate-off-white-background', async function () {
  let isWhiteBackground = await detectWhiteBackground("tests/samples/off-white-background.jpg", {
    percentageOfNonWhitePixels: 90,
    whitePixelBandRange: [255]
  });
  expect(isWhiteBackground).toBe(true);
});

it('background-white-detect-must-fail-for-off-white-background-tv', async function () {
  let isWhiteBackground = await detectWhiteBackground("tests/samples/tv-with-off-white-background.jpg");
  expect(isWhiteBackground).toBe(false);
});

