process.env.LOG_LEVEL = "DEBUG";
process.env.POWERTOOLS_SERVICE_NAME = "qc-tool";
process.env.BUCKET_NAME = "dev-pico-asset-storage-bucket-firefly";
process.env.RULE_FILE_KEY = "qc/private/rules/rules.json"

const MyEnv = require("../../../src/property/my-env");
const {handler} = require("../../../src/lambdas/qc-rules-discovery");

it("run-qc-rules-discovery-lambda", async () => {

  const event = {
    "category_name": "fashion",
    "listing_details": {
      "is_multipack": true,
      "is_video_available": true,
      "_is_below_the_knee": true,
      "_is_above_the_knee": false,
      "is_back_detail_key_selling_feature": true,
      "is_below_the_waist": false
    },
    "job_id": "qc_43gg1fkf",
    "images": [
      {
        "s3_key": "qc/private/_job_id/qc_43gg1fkf/input/images/main.jpg",
        "image_type": "main",
        "image_id": "main"
      },
      {
        "s3_key": "qc/private/_job_id/qc_43gg1fkf/input/images/variant-1.jpg",
        "image_type": "variant",
        "image_id": "variant-1"
      },
      {
        "s3_key": "qc/private/_job_id/qc_43gg1fkf/input/images/variant-2.jpg",
        "image_type": "variant",
        "image_id": "variant-2"
      },
      {
        "s3_key": "qc/private/_job_id/qc_43gg1fkf/input/images/variant-3.jpg",
        "image_type": "variant",
        "image_id": "variant-3"
      },
      {
        "s3_key": "qc/private/_job_id/qc_43gg1fkf/input/images/variant-4.jpg",
        "image_type": "variant",
        "image_id": "variant-4"
      }
    ],
    "platform_name": "amazon"
  };
  let response = await handler(event);
  console.log(response);
});