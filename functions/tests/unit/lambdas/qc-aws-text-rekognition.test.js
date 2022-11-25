process.env.LOG_LEVEL = "DEBUG";
process.env.POWERTOOLS_SERVICE_NAME = "qc-tool";
process.env.BUCKET_NAME = "dev-pico-asset-storage-bucket-firefly";
process.env.RULE_FILE_KEY = "qc/private/rules/rules.json"
const {handler} = require("../../../src/lambdas/qc-aws-text-rekognition");


it("run-qc-aws-text-rekognition-lambda", async () => {
  const event = {
    "input": {
      "analyzer_name": "text",
      "image_s3_keys": [
        // "qc/private/_job_id/qc_r7va6bd1/input/images/main.jpg",
        "qc/private/_job_id/qc_r7va6bd1/input/images/Text.png",
        "qc/private/_job_id/qc_r7va6bd1/input/images/variant-1.jpg",
        // "qc/private/_job_id/qc_r7va6bd1/input/images/variant-2.jpg",
        // "qc/private/_job_id/qc_r7va6bd1/input/images/variant-3.jpg",
        // "qc/private/_job_id/qc_r7va6bd1/input/images/variant-4.jpg",
        // "qc/private/_job_id/qc_r7va6bd1/input/images/variant-5.jpg",
        // "qc/private/_job_id/qc_r7va6bd1/input/images/variant-6.jpg"
      ]
    },
    "job_id": "qc_r7va6bd1",
    "rules": [
      {
        "image_key": "qc/private/_job_id/qc_r7va6bd1/input/images/main.jpg",
        "image_rules": [
          {
            "image_type": "main",
            "rule_id": "single_model_in_main_image",
            "analyzer": "object",
            "confidence_level": 80,
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "product_fill",
            "analyzer": "object",
            "definitions": [
              {
                "greater_than_equal": {
                  "fill_percentage": 85
                }
              }
            ],
            "confidence_level": 80,
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "max-image-size",
            "analyzer": "metadata",
            "definitions": [
              "AND",
              {
                "less_than_equal": {
                  "$.metadata.width": 10000
                }
              },
              {
                "less_than_equal": {
                  "$.metadata.height": 10000
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "min-image-size",
            "analyzer": "metadata",
            "definitions": [
              "OR",
              {
                "greater_than_equal": {
                  "$.metadata.width": 500
                }
              },
              {
                "greater_than_equal": {
                  "$.metadata.height": 500
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "min-dpi",
            "analyzer": "metadata",
            "definitions": [
              {
                "greater_than_equal": {
                  "$.metadata.dpi": 72
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "allowed_image_format",
            "analyzer": "metadata",
            "definitions": [
              {
                "contains": {
                  "$.metadata.format": [
                    "jpeg"
                  ]
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "use_sRGB_color_profile",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.metadata.space": "srgb"
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "main",
            "rule_id": "zoom-able-image",
            "analyzer": "metadata",
            "definitions": [
              {
                "greater_than_equal": {
                  "$.metadata.height": 1600
                }
              }
            ],
            "compliance_level": "recommended_changes"
          },
          {
            "image_type": "all",
            "rule_id": "recommended-image-size",
            "analyzer": "metadata",
            "definitions": [
              "OR",
              {
                "greater_than_equal": {
                  "$.metadata.width": 1000
                }
              },
              {
                "greater_than_equal": {
                  "$.metadata.height": 1000
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "square-aspect-ratio",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.metadata.aspect_ratio": 1
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "main",
            "rule_id": "white_background_main",
            "analyzer": "histogram",
            "definitions": [
              {
                "equals": {
                  "$.histogram.is_white_background": "true"
                }
              }
            ],
            "compliance_level": "critical_issues"
          }
        ],
        "marketPlaceName": "amazon"
      },
      {
        "image_key": "qc/private/_job_id/qc_r7va6bd1/input/images/variant-1.jpg",
        "image_rules": [
          {
            "image_type": "all",
            "rule_id": "product_fill",
            "analyzer": "object",
            "definitions": [
              {
                "greater_than_equal": {
                  "fill_percentage": 85
                }
              }
            ],
            "confidence_level": 80,
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "max-image-size",
            "analyzer": "metadata",
            "definitions": [
              "AND",
              {
                "less_than_equal": {
                  "$.metadata.width": 10000
                }
              },
              {
                "less_than_equal": {
                  "$.metadata.height": 10000
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "min-image-size",
            "analyzer": "metadata",
            "definitions": [
              "OR",
              {
                "greater_than_equal": {
                  "$.metadata.width": 500
                }
              },
              {
                "greater_than_equal": {
                  "$.metadata.height": 500
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "min-dpi",
            "analyzer": "metadata",
            "definitions": [
              {
                "greater_than_equal": {
                  "$.metadata.dpi": 72
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "allowed_image_format",
            "analyzer": "metadata",
            "definitions": [
              {
                "contains": {
                  "$.metadata.format": [
                    "jpeg"
                  ]
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "use_sRGB_color_profile",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.metadata.space": "srgb"
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "recommended-image-size",
            "analyzer": "metadata",
            "definitions": [
              "OR",
              {
                "greater_than_equal": {
                  "$.metadata.width": 1000
                }
              },
              {
                "greater_than_equal": {
                  "$.metadata.height": 1000
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "square-aspect-ratio",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.metadata.aspect_ratio": 1
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "variant",
            "rule_id": "white_background_variants",
            "analyzer": "histogram",
            "definitions": [
              {
                "equals": {
                  "$.histogram.is_white_background": "true"
                }
              }
            ],
            "compliance_level": "recommended_changes"
          }
        ],
        "marketPlaceName": "amazon"
      },
      {
        "image_key": "qc/private/_job_id/qc_r7va6bd1/input/images/variant-2.jpg",
        "image_rules": [
          {
            "image_type": "all",
            "rule_id": "product_fill",
            "analyzer": "object",
            "definitions": [
              {
                "greater_than_equal": {
                  "fill_percentage": 85
                }
              }
            ],
            "confidence_level": 80,
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "max-image-size",
            "analyzer": "metadata",
            "definitions": [
              "AND",
              {
                "less_than_equal": {
                  "$.metadata.width": 10000
                }
              },
              {
                "less_than_equal": {
                  "$.metadata.height": 10000
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "min-image-size",
            "analyzer": "metadata",
            "definitions": [
              "OR",
              {
                "greater_than_equal": {
                  "$.metadata.width": 500
                }
              },
              {
                "greater_than_equal": {
                  "$.metadata.height": 500
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "min-dpi",
            "analyzer": "metadata",
            "definitions": [
              {
                "greater_than_equal": {
                  "$.metadata.dpi": 72
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "allowed_image_format",
            "analyzer": "metadata",
            "definitions": [
              {
                "contains": {
                  "$.metadata.format": [
                    "jpeg"
                  ]
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "use_sRGB_color_profile",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.metadata.space": "srgb"
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "recommended-image-size",
            "analyzer": "metadata",
            "definitions": [
              "OR",
              {
                "greater_than_equal": {
                  "$.metadata.width": 1000
                }
              },
              {
                "greater_than_equal": {
                  "$.metadata.height": 1000
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "square-aspect-ratio",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.metadata.aspect_ratio": 1
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "variant",
            "rule_id": "white_background_variants",
            "analyzer": "histogram",
            "definitions": [
              {
                "equals": {
                  "$.histogram.is_white_background": "true"
                }
              }
            ],
            "compliance_level": "recommended_changes"
          }
        ],
        "marketPlaceName": "amazon"
      },
      {
        "image_key": "qc/private/_job_id/qc_r7va6bd1/input/images/variant-3.jpg",
        "image_rules": [
          {
            "image_type": "all",
            "rule_id": "product_fill",
            "analyzer": "object",
            "definitions": [
              {
                "greater_than_equal": {
                  "fill_percentage": 85
                }
              }
            ],
            "confidence_level": 80,
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "max-image-size",
            "analyzer": "metadata",
            "definitions": [
              "AND",
              {
                "less_than_equal": {
                  "$.metadata.width": 10000
                }
              },
              {
                "less_than_equal": {
                  "$.metadata.height": 10000
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "min-image-size",
            "analyzer": "metadata",
            "definitions": [
              "OR",
              {
                "greater_than_equal": {
                  "$.metadata.width": 500
                }
              },
              {
                "greater_than_equal": {
                  "$.metadata.height": 500
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "min-dpi",
            "analyzer": "metadata",
            "definitions": [
              {
                "greater_than_equal": {
                  "$.metadata.dpi": 72
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "allowed_image_format",
            "analyzer": "metadata",
            "definitions": [
              {
                "contains": {
                  "$.metadata.format": [
                    "jpeg"
                  ]
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "use_sRGB_color_profile",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.metadata.space": "srgb"
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "recommended-image-size",
            "analyzer": "metadata",
            "definitions": [
              "OR",
              {
                "greater_than_equal": {
                  "$.metadata.width": 1000
                }
              },
              {
                "greater_than_equal": {
                  "$.metadata.height": 1000
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "square-aspect-ratio",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.metadata.aspect_ratio": 1
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "variant",
            "rule_id": "white_background_variants",
            "analyzer": "histogram",
            "definitions": [
              {
                "equals": {
                  "$.histogram.is_white_background": "true"
                }
              }
            ],
            "compliance_level": "recommended_changes"
          }
        ],
        "marketPlaceName": "amazon"
      },
      {
        "image_key": "qc/private/_job_id/qc_r7va6bd1/input/images/variant-4.jpg",
        "image_rules": [
          {
            "image_type": "all",
            "rule_id": "product_fill",
            "analyzer": "object",
            "definitions": [
              {
                "greater_than_equal": {
                  "fill_percentage": 85
                }
              }
            ],
            "confidence_level": 80,
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "max-image-size",
            "analyzer": "metadata",
            "definitions": [
              "AND",
              {
                "less_than_equal": {
                  "$.metadata.width": 10000
                }
              },
              {
                "less_than_equal": {
                  "$.metadata.height": 10000
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "min-image-size",
            "analyzer": "metadata",
            "definitions": [
              "OR",
              {
                "greater_than_equal": {
                  "$.metadata.width": 500
                }
              },
              {
                "greater_than_equal": {
                  "$.metadata.height": 500
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "min-dpi",
            "analyzer": "metadata",
            "definitions": [
              {
                "greater_than_equal": {
                  "$.metadata.dpi": 72
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "allowed_image_format",
            "analyzer": "metadata",
            "definitions": [
              {
                "contains": {
                  "$.metadata.format": [
                    "jpeg"
                  ]
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "use_sRGB_color_profile",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.metadata.space": "srgb"
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "recommended-image-size",
            "analyzer": "metadata",
            "definitions": [
              "OR",
              {
                "greater_than_equal": {
                  "$.metadata.width": 1000
                }
              },
              {
                "greater_than_equal": {
                  "$.metadata.height": 1000
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "square-aspect-ratio",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.metadata.aspect_ratio": 1
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "variant",
            "rule_id": "white_background_variants",
            "analyzer": "histogram",
            "definitions": [
              {
                "equals": {
                  "$.histogram.is_white_background": "true"
                }
              }
            ],
            "compliance_level": "recommended_changes"
          }
        ],
        "marketPlaceName": "amazon"
      },
      {
        "image_key": "qc/private/_job_id/qc_r7va6bd1/input/images/variant-5.jpg",
        "image_rules": [
          {
            "image_type": "all",
            "rule_id": "product_fill",
            "analyzer": "object",
            "definitions": [
              {
                "greater_than_equal": {
                  "fill_percentage": 85
                }
              }
            ],
            "confidence_level": 80,
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "max-image-size",
            "analyzer": "metadata",
            "definitions": [
              "AND",
              {
                "less_than_equal": {
                  "$.metadata.width": 10000
                }
              },
              {
                "less_than_equal": {
                  "$.metadata.height": 10000
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "min-image-size",
            "analyzer": "metadata",
            "definitions": [
              "OR",
              {
                "greater_than_equal": {
                  "$.metadata.width": 500
                }
              },
              {
                "greater_than_equal": {
                  "$.metadata.height": 500
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "min-dpi",
            "analyzer": "metadata",
            "definitions": [
              {
                "greater_than_equal": {
                  "$.metadata.dpi": 72
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "allowed_image_format",
            "analyzer": "metadata",
            "definitions": [
              {
                "contains": {
                  "$.metadata.format": [
                    "jpeg"
                  ]
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "use_sRGB_color_profile",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.metadata.space": "srgb"
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "recommended-image-size",
            "analyzer": "metadata",
            "definitions": [
              "OR",
              {
                "greater_than_equal": {
                  "$.metadata.width": 1000
                }
              },
              {
                "greater_than_equal": {
                  "$.metadata.height": 1000
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "square-aspect-ratio",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.metadata.aspect_ratio": 1
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "variant",
            "rule_id": "white_background_variants",
            "analyzer": "histogram",
            "definitions": [
              {
                "equals": {
                  "$.histogram.is_white_background": "true"
                }
              }
            ],
            "compliance_level": "recommended_changes"
          }
        ],
        "marketPlaceName": "amazon"
      },
      {
        "image_key": "qc/private/_job_id/qc_r7va6bd1/input/images/variant-6.jpg",
        "image_rules": [
          {
            "image_type": "all",
            "rule_id": "product_fill",
            "analyzer": "object",
            "definitions": [
              {
                "greater_than_equal": {
                  "fill_percentage": 85
                }
              }
            ],
            "confidence_level": 80,
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "max-image-size",
            "analyzer": "metadata",
            "definitions": [
              "AND",
              {
                "less_than_equal": {
                  "$.metadata.width": 10000
                }
              },
              {
                "less_than_equal": {
                  "$.metadata.height": 10000
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "min-image-size",
            "analyzer": "metadata",
            "definitions": [
              "OR",
              {
                "greater_than_equal": {
                  "$.metadata.width": 500
                }
              },
              {
                "greater_than_equal": {
                  "$.metadata.height": 500
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "min-dpi",
            "analyzer": "metadata",
            "definitions": [
              {
                "greater_than_equal": {
                  "$.metadata.dpi": 72
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "allowed_image_format",
            "analyzer": "metadata",
            "definitions": [
              {
                "contains": {
                  "$.metadata.format": [
                    "jpeg"
                  ]
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "use_sRGB_color_profile",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.metadata.space": "srgb"
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "recommended-image-size",
            "analyzer": "metadata",
            "definitions": [
              "OR",
              {
                "greater_than_equal": {
                  "$.metadata.width": 1000
                }
              },
              {
                "greater_than_equal": {
                  "$.metadata.height": 1000
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "all",
            "rule_id": "square-aspect-ratio",
            "analyzer": "metadata",
            "definitions": [
              {
                "equals": {
                  "$.metadata.aspect_ratio": 1
                }
              }
            ],
            "compliance_level": "critical_issues"
          },
          {
            "image_type": "variant",
            "rule_id": "white_background_variants",
            "analyzer": "histogram",
            "definitions": [
              {
                "equals": {
                  "$.histogram.is_white_background": "true"
                }
              }
            ],
            "compliance_level": "recommended_changes"
          }
        ],
        "marketPlaceName": "amazon"
      }
    ]
  };
  await handler(event);
});