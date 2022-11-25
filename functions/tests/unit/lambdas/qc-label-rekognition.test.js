process.env.LOG_LEVEL = "DEBUG";
process.env.POWERTOOLS_SERVICE_NAME = "qc-tool";
process.env.BUCKET_NAME = "dev-pico-asset-storage-bucket-firefly";
process.env.RULE_FILE_KEY = "qc/private/rules/rules.json"
const {handler} = require("../../../src/lambdas/qc-label-rekognition");


it("run-qc-label-rekognition-lambda", async () => {
  const event = {
    "input": {
      "analyzer_name": "object",
      "image_s3_keys": [
        "qc/private/_job_id/qc_wm83kpoz1/input/images/[object Object].jpg",
        "qc/private/_job_id/qc_wm83kpoz1/input/images/variant-1.jpg",
        // "qc/private/_job_id/qc_wm83kpoz1/input/images/variant-2.jpg",
        // "qc/private/_job_id/qc_wm83kpoz1/input/images/variant-3.jpg",
        // "qc/private/_job_id/qc_wm83kpoz1/input/images/variant-4.jpg",
        // "qc/private/_job_id/qc_wm83kpoz1/input/images/variant-5.jpg"
      ]
    },
    "job_id": "qc_wm83kpoz1",
    "rules": [
      {
        "image_key": "qc/private/_job_id/qc_wm83kpoz1/input/images/[object Object].jpg",
        "image_rules": [
          {
            "image_type": "all",
            "rule_id": "is_fashion_listing",
            "analyzer": "object",
            "definitions": [
              {
                "equals": {
                  "$.is_fashion_listing": "true"
                }
              }
            ],
            "guideline_category": "Site Standards",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "no_innerware_on_children",
            "analyzer": "object",
            "definitions": [
              {
                "equals": {
                  "$.is_child_model_present": "false"
                }
              }
            ],
            "guideline_category": "Prohibited Content",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "max_image_size",
            "analyzer": "metadata",
            "definitions": [
              "AND",
              {
                "less_than_equal": {
                  "$.width": 5000
                }
              },
              {
                "less_than_equal": {
                  "$.height": 5000
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "min_image_size",
            "analyzer": "metadata",
            "definitions": [
              "OR",
              {
                "greater_than_equal": {
                  "$.width": 200
                }
              },
              {
                "greater_than_equal": {
                  "$.height": 200
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "min_dpi",
            "analyzer": "metadata",
            "definitions": [
              {
                "greater_than_equal": {
                  "$.dpi": 400
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "allowed_image_format",
            "analyzer": "metadata",
            "definitions": [
              {
                "contains": {
                  "$.format": [
                    "jpeg",
                    "png",
                    "tiff"
                  ]
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "use_sRGB_color_profile",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.space": "srgb"
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "aspect_ratio",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.aspect_ratio": 1
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "product_fill",
            "analyzer": "object",
            "confidence_level": 80,
            "fill_percentage": 85,
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "proper_lighting",
            "analyzer": "metadata",
            "definitions": [
              {
                "greater_than_equal": {
                  "$.shapness": 0.75
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "product_category_match",
            "analyzer": "object",
            "definitions": [
              {
                "equals": {
                  "$.is_category_macthing": "true"
                }
              }
            ],
            "guideline_category": "Site Standards",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "no_nudity",
            "analyzer": "moderation",
            "definitions": [
              {
                "equals": {
                  "$.is_adult_content_present": "false"
                }
              }
            ],
            "guideline_category": "Prohibited Content",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "proper_file_name",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.is_file_name_proper": "true"
                }
              }
            ],
            "guideline_category": "File Naming Standards",
            "compliance_level": "Must Meet"
          }
        ],
        "marketPlaceName": "amazon"
      },
      {
        "image_key": "qc/private/_job_id/qc_wm83kpoz1/input/images/variant-1.jpg",
        "image_rules": [
          {
            "image_type": "all",
            "rule_id": "is_fashion_listing",
            "analyzer": "object",
            "definitions": [
              {
                "equals": {
                  "$.is_fashion_listing": "true"
                }
              }
            ],
            "guideline_category": "Site Standards",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "no_innerware_on_children",
            "analyzer": "object",
            "definitions": [
              {
                "equals": {
                  "$.is_child_model_present": "false"
                }
              }
            ],
            "guideline_category": "Prohibited Content",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "max_image_size",
            "analyzer": "metadata",
            "definitions": [
              "AND",
              {
                "less_than_equal": {
                  "$.width": 5000
                }
              },
              {
                "less_than_equal": {
                  "$.height": 5000
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "min_image_size",
            "analyzer": "metadata",
            "definitions": [
              "OR",
              {
                "greater_than_equal": {
                  "$.width": 200
                }
              },
              {
                "greater_than_equal": {
                  "$.height": 200
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "min_dpi",
            "analyzer": "metadata",
            "definitions": [
              {
                "greater_than_equal": {
                  "$.dpi": 400
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "allowed_image_format",
            "analyzer": "metadata",
            "definitions": [
              {
                "contains": {
                  "$.format": [
                    "jpeg",
                    "png",
                    "tiff"
                  ]
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "use_sRGB_color_profile",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.space": "srgb"
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "aspect_ratio",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.aspect_ratio": 1
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "product_fill",
            "analyzer": "object",
            "confidence_level": 80,
            "fill_percentage": 85,
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "proper_lighting",
            "analyzer": "metadata",
            "definitions": [
              {
                "greater_than_equal": {
                  "$.shapness": 0.75
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "product_category_match",
            "analyzer": "object",
            "definitions": [
              {
                "equals": {
                  "$.is_category_macthing": "true"
                }
              }
            ],
            "guideline_category": "Site Standards",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "no_nudity",
            "analyzer": "moderation",
            "definitions": [
              {
                "equals": {
                  "$.is_adult_content_present": "false"
                }
              }
            ],
            "guideline_category": "Prohibited Content",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "proper_file_name",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.is_file_name_proper": "true"
                }
              }
            ],
            "guideline_category": "File Naming Standards",
            "compliance_level": "Must Meet"
          }
        ],
        "marketPlaceName": "amazon"
      },
      {
        "image_key": "qc/private/_job_id/qc_wm83kpoz1/input/images/variant-2.jpg",
        "image_rules": [
          {
            "image_type": "all",
            "rule_id": "is_fashion_listing",
            "analyzer": "object",
            "definitions": [
              {
                "equals": {
                  "$.is_fashion_listing": "true"
                }
              }
            ],
            "guideline_category": "Site Standards",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "no_innerware_on_children",
            "analyzer": "object",
            "definitions": [
              {
                "equals": {
                  "$.is_child_model_present": "false"
                }
              }
            ],
            "guideline_category": "Prohibited Content",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "max_image_size",
            "analyzer": "metadata",
            "definitions": [
              "AND",
              {
                "less_than_equal": {
                  "$.width": 5000
                }
              },
              {
                "less_than_equal": {
                  "$.height": 5000
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "min_image_size",
            "analyzer": "metadata",
            "definitions": [
              "OR",
              {
                "greater_than_equal": {
                  "$.width": 200
                }
              },
              {
                "greater_than_equal": {
                  "$.height": 200
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "min_dpi",
            "analyzer": "metadata",
            "definitions": [
              {
                "greater_than_equal": {
                  "$.dpi": 400
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "allowed_image_format",
            "analyzer": "metadata",
            "definitions": [
              {
                "contains": {
                  "$.format": [
                    "jpeg",
                    "png",
                    "tiff"
                  ]
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "use_sRGB_color_profile",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.space": "srgb"
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "aspect_ratio",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.aspect_ratio": 1
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "product_fill",
            "analyzer": "object",
            "confidence_level": 80,
            "fill_percentage": 85,
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "proper_lighting",
            "analyzer": "metadata",
            "definitions": [
              {
                "greater_than_equal": {
                  "$.shapness": 0.75
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "product_category_match",
            "analyzer": "object",
            "definitions": [
              {
                "equals": {
                  "$.is_category_macthing": "true"
                }
              }
            ],
            "guideline_category": "Site Standards",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "no_nudity",
            "analyzer": "moderation",
            "definitions": [
              {
                "equals": {
                  "$.is_adult_content_present": "false"
                }
              }
            ],
            "guideline_category": "Prohibited Content",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "proper_file_name",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.is_file_name_proper": "true"
                }
              }
            ],
            "guideline_category": "File Naming Standards",
            "compliance_level": "Must Meet"
          }
        ],
        "marketPlaceName": "amazon"
      },
      {
        "image_key": "qc/private/_job_id/qc_wm83kpoz1/input/images/variant-3.jpg",
        "image_rules": [
          {
            "image_type": "all",
            "rule_id": "is_fashion_listing",
            "analyzer": "object",
            "definitions": [
              {
                "equals": {
                  "$.is_fashion_listing": "true"
                }
              }
            ],
            "guideline_category": "Site Standards",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "no_innerware_on_children",
            "analyzer": "object",
            "definitions": [
              {
                "equals": {
                  "$.is_child_model_present": "false"
                }
              }
            ],
            "guideline_category": "Prohibited Content",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "max_image_size",
            "analyzer": "metadata",
            "definitions": [
              "AND",
              {
                "less_than_equal": {
                  "$.width": 5000
                }
              },
              {
                "less_than_equal": {
                  "$.height": 5000
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "min_image_size",
            "analyzer": "metadata",
            "definitions": [
              "OR",
              {
                "greater_than_equal": {
                  "$.width": 200
                }
              },
              {
                "greater_than_equal": {
                  "$.height": 200
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "min_dpi",
            "analyzer": "metadata",
            "definitions": [
              {
                "greater_than_equal": {
                  "$.dpi": 400
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "allowed_image_format",
            "analyzer": "metadata",
            "definitions": [
              {
                "contains": {
                  "$.format": [
                    "jpeg",
                    "png",
                    "tiff"
                  ]
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "use_sRGB_color_profile",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.space": "srgb"
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "aspect_ratio",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.aspect_ratio": 1
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "product_fill",
            "analyzer": "object",
            "confidence_level": 80,
            "fill_percentage": 85,
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "proper_lighting",
            "analyzer": "metadata",
            "definitions": [
              {
                "greater_than_equal": {
                  "$.shapness": 0.75
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "product_category_match",
            "analyzer": "object",
            "definitions": [
              {
                "equals": {
                  "$.is_category_macthing": "true"
                }
              }
            ],
            "guideline_category": "Site Standards",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "no_nudity",
            "analyzer": "moderation",
            "definitions": [
              {
                "equals": {
                  "$.is_adult_content_present": "false"
                }
              }
            ],
            "guideline_category": "Prohibited Content",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "proper_file_name",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.is_file_name_proper": "true"
                }
              }
            ],
            "guideline_category": "File Naming Standards",
            "compliance_level": "Must Meet"
          }
        ],
        "marketPlaceName": "amazon"
      },
      {
        "image_key": "qc/private/_job_id/qc_wm83kpoz1/input/images/variant-4.jpg",
        "image_rules": [
          {
            "image_type": "all",
            "rule_id": "is_fashion_listing",
            "analyzer": "object",
            "definitions": [
              {
                "equals": {
                  "$.is_fashion_listing": "true"
                }
              }
            ],
            "guideline_category": "Site Standards",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "no_innerware_on_children",
            "analyzer": "object",
            "definitions": [
              {
                "equals": {
                  "$.is_child_model_present": "false"
                }
              }
            ],
            "guideline_category": "Prohibited Content",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "max_image_size",
            "analyzer": "metadata",
            "definitions": [
              "AND",
              {
                "less_than_equal": {
                  "$.width": 5000
                }
              },
              {
                "less_than_equal": {
                  "$.height": 5000
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "min_image_size",
            "analyzer": "metadata",
            "definitions": [
              "OR",
              {
                "greater_than_equal": {
                  "$.width": 200
                }
              },
              {
                "greater_than_equal": {
                  "$.height": 200
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "min_dpi",
            "analyzer": "metadata",
            "definitions": [
              {
                "greater_than_equal": {
                  "$.dpi": 400
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "allowed_image_format",
            "analyzer": "metadata",
            "definitions": [
              {
                "contains": {
                  "$.format": [
                    "jpeg",
                    "png",
                    "tiff"
                  ]
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "use_sRGB_color_profile",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.space": "srgb"
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "aspect_ratio",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.aspect_ratio": 1
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "product_fill",
            "analyzer": "object",
            "confidence_level": 80,
            "fill_percentage": 85,
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "proper_lighting",
            "analyzer": "metadata",
            "definitions": [
              {
                "greater_than_equal": {
                  "$.shapness": 0.75
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "product_category_match",
            "analyzer": "object",
            "definitions": [
              {
                "equals": {
                  "$.is_category_macthing": "true"
                }
              }
            ],
            "guideline_category": "Site Standards",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "no_nudity",
            "analyzer": "moderation",
            "definitions": [
              {
                "equals": {
                  "$.is_adult_content_present": "false"
                }
              }
            ],
            "guideline_category": "Prohibited Content",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "proper_file_name",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.is_file_name_proper": "true"
                }
              }
            ],
            "guideline_category": "File Naming Standards",
            "compliance_level": "Must Meet"
          }
        ],
        "marketPlaceName": "amazon"
      },
      {
        "image_key": "qc/private/_job_id/qc_wm83kpoz1/input/images/variant-5.jpg",
        "image_rules": [
          {
            "image_type": "all",
            "rule_id": "is_fashion_listing",
            "analyzer": "object",
            "definitions": [
              {
                "equals": {
                  "$.is_fashion_listing": "true"
                }
              }
            ],
            "guideline_category": "Site Standards",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "no_innerware_on_children",
            "analyzer": "object",
            "definitions": [
              {
                "equals": {
                  "$.is_child_model_present": "false"
                }
              }
            ],
            "guideline_category": "Prohibited Content",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "max_image_size",
            "analyzer": "metadata",
            "definitions": [
              "AND",
              {
                "less_than_equal": {
                  "$.width": 5000
                }
              },
              {
                "less_than_equal": {
                  "$.height": 5000
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "min_image_size",
            "analyzer": "metadata",
            "definitions": [
              "OR",
              {
                "greater_than_equal": {
                  "$.width": 200
                }
              },
              {
                "greater_than_equal": {
                  "$.height": 200
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "min_dpi",
            "analyzer": "metadata",
            "definitions": [
              {
                "greater_than_equal": {
                  "$.dpi": 400
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "allowed_image_format",
            "analyzer": "metadata",
            "definitions": [
              {
                "contains": {
                  "$.format": [
                    "jpeg",
                    "png",
                    "tiff"
                  ]
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "use_sRGB_color_profile",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.space": "srgb"
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "aspect_ratio",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.aspect_ratio": 1
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "product_fill",
            "analyzer": "object",
            "confidence_level": 80,
            "fill_percentage": 85,
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "proper_lighting",
            "analyzer": "metadata",
            "definitions": [
              {
                "greater_than_equal": {
                  "$.shapness": 0.75
                }
              }
            ],
            "guideline_category": "Technical Requirements",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "product_category_match",
            "analyzer": "object",
            "definitions": [
              {
                "equals": {
                  "$.is_category_macthing": "true"
                }
              }
            ],
            "guideline_category": "Site Standards",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "no_nudity",
            "analyzer": "moderation",
            "definitions": [
              {
                "equals": {
                  "$.is_adult_content_present": "false"
                }
              }
            ],
            "guideline_category": "Prohibited Content",
            "compliance_level": "Must Meet"
          },
          {
            "image_type": "all",
            "rule_id": "proper_file_name",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.is_file_name_proper": "true"
                }
              }
            ],
            "guideline_category": "File Naming Standards",
            "compliance_level": "Must Meet"
          }
        ],
        "marketPlaceName": "amazon"
      }
    ]
  };
  await handler(event);
});