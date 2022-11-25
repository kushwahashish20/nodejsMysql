process.env.LOG_LEVEL = "DEBUG";
process.env.POWERTOOLS_SERVICE_NAME = "qc-tool";
process.env.BUCKET_NAME = "dev-pico-asset-storage-bucket-firefly";
process.env.RULE_FILE_KEY = "qc/private/rules/rules.json"
const sharpUtil = require("../../../src/analyzers/sharp-utils");

it("get-sharp-metadata-image-with-300dpi", async () => {

  const event = "tests/samples/tshirt_image_of_300dpi.jpg";

  let expectedResult = await sharpUtil.getSharpMetadata(event);
  expect(expectedResult.dpi).toEqual(300)

});
it("get-sharp-metadata-image-with-300dpi", async () => {

  const event = "tests/samples/tshirt_image_of_200dpi.jpg";

  let expectedResult = await sharpUtil.getSharpMetadata(event);
  expect(expectedResult.dpi).toEqual(200)

});
it("get-sharp-metadata-image-with-72dpi", async () => {

  const event = "tests/samples/tv-with-off-white-background.jpg";
  let expectedResult = await sharpUtil.getSharpMetadata(event);
  expect(expectedResult.dpi).toEqual(72)

});