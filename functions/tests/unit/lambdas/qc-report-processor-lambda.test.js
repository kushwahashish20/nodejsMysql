process.env.LOG_LEVEL = "DEBUG";
process.env.POWERTOOLS_SERVICE_NAME = "qc-tool";
process.env.BUCKET_NAME = "daisy-pico-asset-storage-bucket-firefly";
process.env.RULE_FILE_KEY = "qc/private/rules/rules.json"
process.env.QC_JOB_COMPLETE_NOTIFIER_QUEUE_URL = "https://sqs.us-east-2.amazonaws.com/7426771118s9/dev-qc-job-complete-notifier-queue"
process.env.FILTER_LIST_KEYWORDS_FILE_KEY="qc/private/filter_list_keywords/filteredKeywordsList.json"
const MyEnv = require("../../../src/property/my-env");
const {handler, getProductListingDetailsFromS3, getOverviewObjectFromProductListingDetails, createImageIdToUrlMap, prepareFrontendReport} = require("../../../src/lambdas/qc-report-processor-lambda");

it("run-execute-rules-lambda-1", async () => {

  const event = {
    "input": [
      {
        "statusCode": 200,
        "body": [
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/main.jpg",
            "analyzer_result": {
              "label": [
                {
                  "Name": "Pants",
                  "Confidence": 99.99856567382812,
                  "Instances": []
                },
                {
                  "Name": "Clothing",
                  "Confidence": 99.99856567382812,
                  "Instances": []
                },
                {
                  "Name": "Apparel",
                  "Confidence": 99.99856567382812,
                  "Instances": []
                },
                {
                  "Name": "Person",
                  "Confidence": 95.53839111328125,
                  "Instances": [
                    {
                      "Confidence": 95.53839111328125,
                      "BoundingBox": {
                        "Width": 0.3286806643009186,
                        "Height": 0.9364023208618164,
                        "Left": 0.008044484071433544,
                        "Top": 0
                      }
                    },
                    {
                      "Confidence": 94.05848693847656,
                      "BoundingBox": {
                        "Width": 0.3527066111564636,
                        "Height": 0.9025629758834839,
                        "Left": 0.3070410192012787,
                        "Top": 0.0022885336074978113
                      }
                    },
                    {
                      "Confidence": 92.67562866210938,
                      "BoundingBox": {
                        "Width": 0.5740652680397034,
                        "Height": 0.9613561034202576,
                        "Left": 0.40751656889915466,
                        "Top": 0
                      }
                    },
                    {
                      "Confidence": 92.51172637939453,
                      "BoundingBox": {
                        "Width": 0.43626606464385986,
                        "Height": 0.9197752475738525,
                        "Left": 0.1109546646475792,
                        "Top": 0.007788126822561026
                      }
                    }
                  ]
                },
                {
                  "Name": "Human",
                  "Confidence": 95.53839111328125,
                  "Instances": []
                },
                {
                  "Name": "Tights",
                  "Confidence": 91.61038208007812,
                  "Instances": []
                },
                {
                  "Name": "Shoe",
                  "Confidence": 67.40373992919922,
                  "Instances": []
                },
                {
                  "Name": "Footwear",
                  "Confidence": 67.40373992919922,
                  "Instances": []
                },
                {
                  "Name": "Spandex",
                  "Confidence": 63.258949279785156,
                  "Instances": []
                },
                {
                  "Name": "Pantyhose",
                  "Confidence": 60.62379455566406,
                  "Instances": []
                }
              ]
            }
          }
        ],
        "analyzer_name": "object",
        "rules": [
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/main.jpg",
            "image_rules": [
              {
                "image_type": "main",
                "rule_id": "single_model_in_main_image",
                "analyzer": [
                  "object"
                ],
                "confidence_level": 80,
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "main",
                "rule_id": "product_fill",
                "analyzer": [
                  "object"
                ],
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
                "image_type": "main",
                "rule_id": "image_crop_nose_down",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "main",
                "rule_id": "image-full-length",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "main",
                "rule_id": "image-top-body",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "main",
                "rule_id": "image-back-details",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80
              },
              {
                "image_type": "main",
                "rule_id": "image-waist-down",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
                "definitions": [
                  "OR",
                  {
                    "greater_than_equal": {
                      "$.metadata.height": 1600
                    }
                  },
                  {
                    "greater_than_equal": {
                      "$.metadata.width": 1600
                    }
                  }
                ],
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "main",
                "rule_id": "white_background_main",
                "analyzer": [
                  "histogram"
                ],
                "definitions": [
                  {
                    "equals": {
                      "$.histogram.is_white_background": "true"
                    }
                  }
                ],
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "main",
                "rule_id": "multipack-off-model",
                "analyzer": [
                  "object"
                ],
                "confidence_level": 80,
                "compliance_level": "critical_issues"
              }
            ],
            "marketPlaceName": "amazon"
          },
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-1.jpg",
            "image_rules": [
              {
                "image_type": "variant",
                "rule_id": "image_crop_nose_down_variant",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "image_type": "variant",
                "rule_id": "white_background_variants",
                "analyzer": [
                  "histogram"
                ],
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
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-2.jpg",
            "image_rules": [
              {
                "image_type": "variant",
                "rule_id": "image_crop_nose_down_variant",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "image_type": "variant",
                "rule_id": "white_background_variants",
                "analyzer": [
                  "histogram"
                ],
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
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-3.jpg",
            "image_rules": [
              {
                "image_type": "variant",
                "rule_id": "image_crop_nose_down_variant",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "image_type": "variant",
                "rule_id": "white_background_variants",
                "analyzer": [
                  "histogram"
                ],
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
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-4.jpg",
            "image_rules": [
              {
                "image_type": "variant",
                "rule_id": "image_crop_nose_down_variant",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "image_type": "variant",
                "rule_id": "white_background_variants",
                "analyzer": [
                  "histogram"
                ],
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
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-5.jpg",
            "image_rules": [
              {
                "image_type": "variant",
                "rule_id": "image_crop_nose_down_variant",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "image_type": "variant",
                "rule_id": "white_background_variants",
                "analyzer": [
                  "histogram"
                ],
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
      },
      {
        "statusCode": "200",
        "body": {
          "message": "OK",
          "data": {}
        }
      },
      {
        "statusCode": 200,
        "job_id": "qc_xnpiiboz",
        "body": [
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/main.jpg",
            "analyzer_result": {
              "format": "jpeg",
              "width": 1200,
              "height": 1500,
              "space": "srgb",
              "dpi": 72,
              "aspect_ratio": 0.8
            }
          },
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-1.jpg",
            "analyzer_result": {
              "format": "jpeg",
              "width": 1173,
              "height": 1500,
              "space": "srgb",
              "dpi": 72,
              "aspect_ratio": 0.782
            }
          },
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-2.jpg",
            "analyzer_result": {
              "format": "jpeg",
              "width": 1011,
              "height": 1500,
              "space": "srgb",
              "dpi": 72,
              "aspect_ratio": 0.674
            }
          },
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-3.jpg",
            "analyzer_result": {
              "format": "jpeg",
              "width": 1000,
              "height": 1500,
              "space": "srgb",
              "dpi": 72,
              "aspect_ratio": 0.6666666666666666
            }
          },
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-4.jpg",
            "analyzer_result": {
              "format": "jpeg",
              "width": 659,
              "height": 1500,
              "space": "srgb",
              "dpi": 72,
              "aspect_ratio": 0.43933333333333335
            }
          },
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-5.jpg",
            "analyzer_result": {
              "format": "jpeg",
              "width": 1228,
              "height": 1500,
              "space": "srgb",
              "dpi": 72,
              "aspect_ratio": 0.8186666666666667
            }
          }
        ],
        "analyzer_name": "metadata",
        "rules": [
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/main.jpg",
            "image_rules": [
              {
                "image_type": "main",
                "rule_id": "single_model_in_main_image",
                "analyzer": [
                  "object"
                ],
                "confidence_level": 80,
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "main",
                "rule_id": "product_fill",
                "analyzer": [
                  "object"
                ],
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
                "image_type": "main",
                "rule_id": "image_crop_nose_down",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "main",
                "rule_id": "image-full-length",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "main",
                "rule_id": "image-top-body",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "main",
                "rule_id": "image-back-details",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80
              },
              {
                "image_type": "main",
                "rule_id": "image-waist-down",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
                "definitions": [
                  "OR",
                  {
                    "greater_than_equal": {
                      "$.metadata.height": 1600
                    }
                  },
                  {
                    "greater_than_equal": {
                      "$.metadata.width": 1600
                    }
                  }
                ],
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "main",
                "rule_id": "white_background_main",
                "analyzer": [
                  "histogram"
                ],
                "definitions": [
                  {
                    "equals": {
                      "$.histogram.is_white_background": "true"
                    }
                  }
                ],
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "main",
                "rule_id": "multipack-off-model",
                "analyzer": [
                  "object"
                ],
                "confidence_level": 80,
                "compliance_level": "critical_issues"
              }
            ],
            "marketPlaceName": "amazon"
          },
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-1.jpg",
            "image_rules": [
              {
                "image_type": "variant",
                "rule_id": "image_crop_nose_down_variant",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "image_type": "variant",
                "rule_id": "white_background_variants",
                "analyzer": [
                  "histogram"
                ],
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
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-2.jpg",
            "image_rules": [
              {
                "image_type": "variant",
                "rule_id": "image_crop_nose_down_variant",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "image_type": "variant",
                "rule_id": "white_background_variants",
                "analyzer": [
                  "histogram"
                ],
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
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-3.jpg",
            "image_rules": [
              {
                "image_type": "variant",
                "rule_id": "image_crop_nose_down_variant",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "image_type": "variant",
                "rule_id": "white_background_variants",
                "analyzer": [
                  "histogram"
                ],
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
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-4.jpg",
            "image_rules": [
              {
                "image_type": "variant",
                "rule_id": "image_crop_nose_down_variant",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "image_type": "variant",
                "rule_id": "white_background_variants",
                "analyzer": [
                  "histogram"
                ],
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
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-5.jpg",
            "image_rules": [
              {
                "image_type": "variant",
                "rule_id": "image_crop_nose_down_variant",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "image_type": "variant",
                "rule_id": "white_background_variants",
                "analyzer": [
                  "histogram"
                ],
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
      },
      {
        "statusCode": 200,
        "body": [
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/main.jpg",
            "analyzer_result": {
              "TextDetections": []
            }
          },
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-1.jpg",
            "analyzer_result": {
              "TextDetections": []
            }
          },
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-2.jpg",
            "analyzer_result": {
              "TextDetections": [
                {
                  "DetectedText": "Hidden pocket",
                  "Type": "LINE",
                  "Confidence": 99.9854736328125,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.318359375,
                      "Height": 0.03554296866059303,
                      "Left": 0.6513671875,
                      "Top": 0.2757871150970459
                    }
                  }
                },
                {
                  "DetectedText": "Non See Through",
                  "Type": "LINE",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.3740234375,
                      "Height": 0.03554296866059303,
                      "Left": 0.6240234375,
                      "Top": 0.5936992168426514
                    }
                  }
                },
                {
                  "DetectedText": "4 Way Stretch",
                  "Type": "LINE",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.306640625,
                      "Height": 0.03554296866059303,
                      "Left": 0.6572265625,
                      "Top": 0.9122695326805115
                    }
                  }
                },
                {
                  "DetectedText": "Hidden",
                  "Type": "WORD",
                  "Confidence": 99.970947265625,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.1513671875,
                      "Height": 0.029619140550494194,
                      "Left": 0.6513671875,
                      "Top": 0.2757871150970459
                    }
                  }
                },
                {
                  "DetectedText": "pocket",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.1513671875,
                      "Height": 0.03488476574420929,
                      "Left": 0.818359375,
                      "Top": 0.27644529938697815
                    }
                  }
                },
                {
                  "DetectedText": "Non",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.08203125,
                      "Height": 0.027644531801342964,
                      "Left": 0.6240234375,
                      "Top": 0.594357430934906
                    }
                  }
                },
                {
                  "DetectedText": "See",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0791015625,
                      "Height": 0.028302734717726707,
                      "Left": 0.72265625,
                      "Top": 0.594357430934906
                    }
                  }
                },
                {
                  "DetectedText": "Through",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.18359375,
                      "Height": 0.03554296866059303,
                      "Left": 0.814453125,
                      "Top": 0.5936992168426514
                    }
                  }
                },
                {
                  "DetectedText": "4",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0283203125,
                      "Height": 0.028302734717726707,
                      "Left": 0.6572265625,
                      "Top": 0.9129277467727661
                    }
                  }
                },
                {
                  "DetectedText": "Way",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.095703125,
                      "Height": 0.03488476574420929,
                      "Left": 0.6962890625,
                      "Top": 0.9129277467727661
                    }
                  }
                },
                {
                  "DetectedText": "Stretch",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.158203125,
                      "Height": 0.02896093763411045,
                      "Left": 0.8056640625,
                      "Top": 0.9122695326805115
                    }
                  }
                }
              ]
            }
          },
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-3.jpg",
            "analyzer_result": {
              "TextDetections": [
                {
                  "DetectedText": "YOUNGCHARM",
                  "Type": "LINE",
                  "Confidence": 98.079833984375,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.9453125,
                      "Height": 0.1217447891831398,
                      "Left": 0.0322265625,
                      "Top": 0.01171875
                    }
                  }
                },
                {
                  "DetectedText": "YOUNGCHARM",
                  "Type": "WORD",
                  "Confidence": 98.079833984375,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.9453125,
                      "Height": 0.1217447891831398,
                      "Left": 0.0322265625,
                      "Top": 0.01171875
                    }
                  }
                }
              ]
            }
          },
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-4.jpg",
            "analyzer_result": {
              "TextDetections": []
            }
          },
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-5.jpg",
            "analyzer_result": {
              "TextDetections": [
                {
                  "DetectedText": "BUTT-LIFTING",
                  "Type": "LINE",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.4892578125,
                      "Height": 0.05596354231238365,
                      "Left": 0.4794921875,
                      "Top": 0.03837500140070915
                    }
                  }
                },
                {
                  "DetectedText": "DESIGN",
                  "Type": "LINE",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.2666015625,
                      "Height": 0.054364584386348724,
                      "Left": 0.7041014432907104,
                      "Top": 0.11272655427455902
                    }
                  }
                },
                {
                  "DetectedText": "you'll find that the high waist",
                  "Type": "LINE",
                  "Confidence": 99.54522705078125,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.20703125,
                      "Height": 0.015190104022622108,
                      "Left": 0.7587890625,
                      "Top": 0.20146875083446503
                    }
                  }
                },
                {
                  "DetectedText": "can promote compression and support,which also can lift",
                  "Type": "LINE",
                  "Confidence": 99.13890838623047,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.404296875,
                      "Height": 0.018439941108226776,
                      "Left": 0.560546875,
                      "Top": 0.2185164839029312
                    }
                  }
                },
                {
                  "DetectedText": "your butt greatly and show off your",
                  "Type": "LINE",
                  "Confidence": 99.58889770507812,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.2470703125,
                      "Height": 0.015989582985639572,
                      "Left": 0.7177734375,
                      "Top": 0.23824478685855865
                    }
                  }
                },
                {
                  "DetectedText": "figure to perfection",
                  "Type": "LINE",
                  "Confidence": 99.15201568603516,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.134765625,
                      "Height": 0.015190104022622108,
                      "Left": 0.830078125,
                      "Top": 0.2574322819709778
                    }
                  }
                },
                {
                  "DetectedText": "Waist",
                  "Type": "LINE",
                  "Confidence": 98.75027465820312,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.06116897985339165,
                      "Height": 0.031930048018693924,
                      "Left": 0.12838412821292877,
                      "Top": 0.4141550660133362
                    }
                  }
                },
                {
                  "DetectedText": "SIZE CHART",
                  "Type": "LINE",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.4296875,
                      "Height": 0.05756250023841858,
                      "Left": 0.55078125,
                      "Top": 0.3925442695617676
                    }
                  }
                },
                {
                  "DetectedText": "1.Colors may little vary due to different screen display setting.",
                  "Type": "LINE",
                  "Confidence": 99.34062194824219,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.5830078125,
                      "Height": 0.02238541655242443,
                      "Left": 0.3818359375,
                      "Top": 0.4644973874092102
                    }
                  }
                },
                {
                  "DetectedText": "Hip",
                  "Type": "LINE",
                  "Confidence": 99.09483337402344,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.03525923565030098,
                      "Height": 0.0258585624396801,
                      "Left": 0.1516253501176834,
                      "Top": 0.496621698141098
                    }
                  }
                },
                {
                  "DetectedText": "2.Manually measured,0.5 to 1.2 inches tolerance allowed.",
                  "Type": "LINE",
                  "Confidence": 98.65170288085938,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.5478515625,
                      "Height": 0.027182292193174362,
                      "Left": 0.4169921875,
                      "Top": 0.4948776066303253
                    }
                  }
                },
                {
                  "DetectedText": "3.Please read the size chart before you purchase.",
                  "Type": "LINE",
                  "Confidence": 99.72222900390625,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.466796875,
                      "Height": 0.020786458626389503,
                      "Left": 0.498046875,
                      "Top": 0.531653642654419
                    }
                  }
                },
                {
                  "DetectedText": "SIZE",
                  "Type": "LINE",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0966796875,
                      "Height": 0.03837500140070915,
                      "Left": 0.390625,
                      "Top": 0.5772239565849304
                    }
                  }
                },
                {
                  "DetectedText": "HIP(inch)",
                  "Type": "LINE",
                  "Confidence": 94.92965698242188,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.09067706763744354,
                      "Height": 0.036715317517519,
                      "Left": 0.6748145818710327,
                      "Top": 0.5789972543716431
                    }
                  }
                },
                {
                  "DetectedText": "WAIST (inch)",
                  "Type": "LINE",
                  "Confidence": 99.09420776367188,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.119140625,
                      "Height": 0.02238541655242443,
                      "Left": 0.5234375,
                      "Top": 0.5852187275886536
                    }
                  }
                },
                {
                  "DetectedText": "LENGTH(inch)",
                  "Type": "LINE",
                  "Confidence": 98.16455078125,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.13811519742012024,
                      "Height": 0.026324663311243057,
                      "Left": 0.8132694959640503,
                      "Top": 0.5834277272224426
                    }
                  }
                },
                {
                  "DetectedText": "Length",
                  "Type": "LINE",
                  "Confidence": 99.3904037475586,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0615234375,
                      "Height": 0.01998697966337204,
                      "Left": 0.2421875,
                      "Top": 0.6475781202316284
                    }
                  }
                },
                {
                  "DetectedText": "S",
                  "Type": "LINE",
                  "Confidence": 98.31462097167969,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.029296875,
                      "Height": 0.03757552057504654,
                      "Left": 0.4189453125,
                      "Top": 0.6371849179267883
                    }
                  }
                },
                {
                  "DetectedText": "23-25",
                  "Type": "LINE",
                  "Confidence": 99.9747314453125,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0712890625,
                      "Height": 0.023184895515441895,
                      "Left": 0.5449218153953552,
                      "Top": 0.6459791660308838
                    }
                  }
                },
                {
                  "DetectedText": "30-32",
                  "Type": "LINE",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0703125,
                      "Height": 0.023184895515441895,
                      "Left": 0.6845702528953552,
                      "Top": 0.6459791660308838
                    }
                  }
                },
                {
                  "DetectedText": "35.9",
                  "Type": "LINE",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.052734375,
                      "Height": 0.02238541655242443,
                      "Left": 0.85546875,
                      "Top": 0.6467786431312561
                    }
                  }
                },
                {
                  "DetectedText": "M",
                  "Type": "LINE",
                  "Confidence": 96.0751724243164,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.04451292008161545,
                      "Height": 0.04082966968417168,
                      "Left": 0.41108426451683044,
                      "Top": 0.69569331407547
                    }
                  }
                },
                {
                  "DetectedText": "26-28",
                  "Type": "LINE",
                  "Confidence": 99.95416259765625,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0712890625,
                      "Height": 0.023184895515441895,
                      "Left": 0.544921875,
                      "Top": 0.706739604473114
                    }
                  }
                },
                {
                  "DetectedText": "33-35",
                  "Type": "LINE",
                  "Confidence": 99.72102355957031,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0703125,
                      "Height": 0.023184895515441895,
                      "Left": 0.6835936903953552,
                      "Top": 0.706739604473114
                    }
                  }
                },
                {
                  "DetectedText": "36.2",
                  "Type": "LINE",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0517578125,
                      "Height": 0.02238541655242443,
                      "Left": 0.8564453125,
                      "Top": 0.7075390815734863
                    }
                  }
                },
                {
                  "DetectedText": "L",
                  "Type": "LINE",
                  "Confidence": 99.02782440185547,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0234375,
                      "Height": 0.03757552057504654,
                      "Left": 0.4189453125,
                      "Top": 0.7571067810058594
                    }
                  }
                },
                {
                  "DetectedText": "28-30",
                  "Type": "LINE",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0712890625,
                      "Height": 0.023184895515441895,
                      "Left": 0.5449218153953552,
                      "Top": 0.7682994604110718
                    }
                  }
                },
                {
                  "DetectedText": "34-36",
                  "Type": "LINE",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0712890625,
                      "Height": 0.023184895515441895,
                      "Left": 0.6835936903953552,
                      "Top": 0.7682994604110718
                    }
                  }
                },
                {
                  "DetectedText": "36.6",
                  "Type": "LINE",
                  "Confidence": 99.8869857788086,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0537109375,
                      "Height": 0.024783853441476822,
                      "Left": 0.8544921875,
                      "Top": 0.7674999833106995
                    }
                  }
                },
                {
                  "DetectedText": "XL",
                  "Type": "LINE",
                  "Confidence": 99.79069519042969,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0537109375,
                      "Height": 0.03757552057504654,
                      "Left": 0.400390625,
                      "Top": 0.8170676827430725
                    }
                  }
                },
                {
                  "DetectedText": "29-31",
                  "Type": "LINE",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0673828125,
                      "Height": 0.023184895515441895,
                      "Left": 0.544921875,
                      "Top": 0.8242630362510681
                    }
                  }
                },
                {
                  "DetectedText": "36-38",
                  "Type": "LINE",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0703125,
                      "Height": 0.023184895515441895,
                      "Left": 0.68359375,
                      "Top": 0.8242630362510681
                    }
                  }
                },
                {
                  "DetectedText": "36.9",
                  "Type": "LINE",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0537109375,
                      "Height": 0.024783853441476822,
                      "Left": 0.8544921875,
                      "Top": 0.8234635591506958
                    }
                  }
                },
                {
                  "DetectedText": "2XL",
                  "Type": "LINE",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0771484375,
                      "Height": 0.035177081823349,
                      "Left": 0.39453125,
                      "Top": 0.8778281211853027
                    }
                  }
                },
                {
                  "DetectedText": "31-33",
                  "Type": "LINE",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0712890625,
                      "Height": 0.023184895515441895,
                      "Left": 0.5449218153953552,
                      "Top": 0.8834244012832642
                    }
                  }
                },
                {
                  "DetectedText": "38-40",
                  "Type": "LINE",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0712890625,
                      "Height": 0.023184895515441895,
                      "Left": 0.6835936903953552,
                      "Top": 0.8834244012832642
                    }
                  }
                },
                {
                  "DetectedText": "37.3",
                  "Type": "LINE",
                  "Confidence": 99.83944702148438,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0537109375,
                      "Height": 0.024783853441476822,
                      "Left": 0.8544921875,
                      "Top": 0.8826249837875366
                    }
                  }
                },
                {
                  "DetectedText": "3XL",
                  "Type": "LINE",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0751953125,
                      "Height": 0.03597656264901161,
                      "Left": 0.3974609375,
                      "Top": 0.9377890825271606
                    }
                  }
                },
                {
                  "DetectedText": "33-35",
                  "Type": "LINE",
                  "Confidence": 99.7498779296875,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0712890625,
                      "Height": 0.023184895515441895,
                      "Left": 0.544921875,
                      "Top": 0.9425859451293945
                    }
                  }
                },
                {
                  "DetectedText": "40-42",
                  "Type": "LINE",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0712890625,
                      "Height": 0.023184895515441895,
                      "Left": 0.68359375,
                      "Top": 0.9425859451293945
                    }
                  }
                },
                {
                  "DetectedText": "37.6",
                  "Type": "LINE",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0517578125,
                      "Height": 0.02238541655242443,
                      "Left": 0.85546875,
                      "Top": 0.9433854222297668
                    }
                  }
                },
                {
                  "DetectedText": "BUTT-LIFTING",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.4892578125,
                      "Height": 0.05596354231238365,
                      "Left": 0.4794921875,
                      "Top": 0.03837500140070915
                    }
                  }
                },
                {
                  "DetectedText": "DESIGN",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.2666015625,
                      "Height": 0.054364584386348724,
                      "Left": 0.7041014432907104,
                      "Top": 0.11272655427455902
                    }
                  }
                },
                {
                  "DetectedText": "you'll",
                  "Type": "WORD",
                  "Confidence": 99.12287902832031,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0390625,
                      "Height": 0.015190104022622108,
                      "Left": 0.7587890625,
                      "Top": 0.20146875083446503
                    }
                  }
                },
                {
                  "DetectedText": "find",
                  "Type": "WORD",
                  "Confidence": 99.64659118652344,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.02734375,
                      "Height": 0.012791666202247143,
                      "Left": 0.8017578125,
                      "Top": 0.20146875083446503
                    }
                  }
                },
                {
                  "DetectedText": "that",
                  "Type": "WORD",
                  "Confidence": 99.91769409179688,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.029296875,
                      "Height": 0.011992187239229679,
                      "Left": 0.8330078125,
                      "Top": 0.20226822793483734
                    }
                  }
                },
                {
                  "DetectedText": "the",
                  "Type": "WORD",
                  "Confidence": 99.08846282958984,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.021484375,
                      "Height": 0.011192708276212215,
                      "Left": 0.865234375,
                      "Top": 0.20226822793483734
                    }
                  }
                },
                {
                  "DetectedText": "high",
                  "Type": "WORD",
                  "Confidence": 99.92973327636719,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0302734375,
                      "Height": 0.013591146096587181,
                      "Left": 0.8916015625,
                      "Top": 0.20226822793483734
                    }
                  }
                },
                {
                  "DetectedText": "waist",
                  "Type": "WORD",
                  "Confidence": 99.56603240966797,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0390625,
                      "Height": 0.011992187239229679,
                      "Left": 0.9267578125,
                      "Top": 0.20226822793483734
                    }
                  }
                },
                {
                  "DetectedText": "can",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.025390625,
                      "Height": 0.00879427045583725,
                      "Left": 0.560546875,
                      "Top": 0.2238541692495346
                    }
                  }
                },
                {
                  "DetectedText": "promote",
                  "Type": "WORD",
                  "Confidence": 99.53443145751953,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0576171875,
                      "Height": 0.013591146096587181,
                      "Left": 0.5908203125,
                      "Top": 0.22145572304725647
                    }
                  }
                },
                {
                  "DetectedText": "compression",
                  "Type": "WORD",
                  "Confidence": 99.68075561523438,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.08984375,
                      "Height": 0.014390625059604645,
                      "Left": 0.6533203125,
                      "Top": 0.22065624594688416
                    }
                  }
                },
                {
                  "DetectedText": "and",
                  "Type": "WORD",
                  "Confidence": 98.77001190185547,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.02734375,
                      "Height": 0.012791666202247143,
                      "Left": 0.7470703125,
                      "Top": 0.21985676884651184
                    }
                  }
                },
                {
                  "DetectedText": "support,which",
                  "Type": "WORD",
                  "Confidence": 97.07621765136719,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.10491520911455154,
                      "Height": 0.018439941108226776,
                      "Left": 0.7761533260345459,
                      "Top": 0.2185164839029312
                    }
                  }
                },
                {
                  "DetectedText": "also",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.029296875,
                      "Height": 0.011992187239229679,
                      "Left": 0.8828125,
                      "Top": 0.22065624594688416
                    }
                  }
                },
                {
                  "DetectedText": "can",
                  "Type": "WORD",
                  "Confidence": 98.27217102050781,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0263671875,
                      "Height": 0.00879427045583725,
                      "Left": 0.916015625,
                      "Top": 0.2230546921491623
                    }
                  }
                },
                {
                  "DetectedText": "lift",
                  "Type": "WORD",
                  "Confidence": 99.77767181396484,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0185546875,
                      "Height": 0.011192708276212215,
                      "Left": 0.9462890625,
                      "Top": 0.22065624594688416
                    }
                  }
                },
                {
                  "DetectedText": "your",
                  "Type": "WORD",
                  "Confidence": 99.45018005371094,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0302734375,
                      "Height": 0.011992187239229679,
                      "Left": 0.7177734375,
                      "Top": 0.2414427101612091
                    }
                  }
                },
                {
                  "DetectedText": "butt",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.029296875,
                      "Height": 0.011992187239229679,
                      "Left": 0.7529296875,
                      "Top": 0.23904426395893097
                    }
                  }
                },
                {
                  "DetectedText": "greatly",
                  "Type": "WORD",
                  "Confidence": 99.5100326538086,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0478515625,
                      "Height": 0.014390625059604645,
                      "Left": 0.7861328125,
                      "Top": 0.23904426395893097
                    }
                  }
                },
                {
                  "DetectedText": "and",
                  "Type": "WORD",
                  "Confidence": 98.89622497558594,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.02734375,
                      "Height": 0.012791666202247143,
                      "Left": 0.837890625,
                      "Top": 0.23824478685855865
                    }
                  }
                },
                {
                  "DetectedText": "show",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.037109375,
                      "Height": 0.011192708276212215,
                      "Left": 0.869140625,
                      "Top": 0.23904426395893097
                    }
                  }
                },
                {
                  "DetectedText": "off",
                  "Type": "WORD",
                  "Confidence": 99.96642303466797,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.01953125,
                      "Height": 0.011192708276212215,
                      "Left": 0.9111328125,
                      "Top": 0.23904426395893097
                    }
                  }
                },
                {
                  "DetectedText": "your",
                  "Type": "WORD",
                  "Confidence": 99.29944610595703,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.03125,
                      "Height": 0.012791666202247143,
                      "Left": 0.93359375,
                      "Top": 0.2414427101612091
                    }
                  }
                },
                {
                  "DetectedText": "figure",
                  "Type": "WORD",
                  "Confidence": 99.64785766601562,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.041015625,
                      "Height": 0.015190104022622108,
                      "Left": 0.830078125,
                      "Top": 0.2574322819709778
                    }
                  }
                },
                {
                  "DetectedText": "to",
                  "Type": "WORD",
                  "Confidence": 98.75979614257812,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0146484375,
                      "Height": 0.011992187239229679,
                      "Left": 0.875,
                      "Top": 0.2582317590713501
                    }
                  }
                },
                {
                  "DetectedText": "perfection",
                  "Type": "WORD",
                  "Confidence": 99.04840087890625,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0712890625,
                      "Height": 0.015190104022622108,
                      "Left": 0.8935546875,
                      "Top": 0.2574322819709778
                    }
                  }
                },
                {
                  "DetectedText": "Waist",
                  "Type": "WORD",
                  "Confidence": 98.75027465820312,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.06116897985339165,
                      "Height": 0.027902424335479736,
                      "Left": 0.12838412821292877,
                      "Top": 0.41616886854171753
                    }
                  }
                },
                {
                  "DetectedText": "SIZE",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.1630859375,
                      "Height": 0.05596354231238365,
                      "Left": 0.55078125,
                      "Top": 0.3933437466621399
                    }
                  }
                },
                {
                  "DetectedText": "CHART",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.2509765625,
                      "Height": 0.05756250023841858,
                      "Left": 0.7294921875,
                      "Top": 0.3925442695617676
                    }
                  }
                },
                {
                  "DetectedText": "1.Colors",
                  "Type": "WORD",
                  "Confidence": 97.03411102294922,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0810546875,
                      "Height": 0.020786458626389503,
                      "Left": 0.3818359375,
                      "Top": 0.4644973874092102
                    }
                  }
                },
                {
                  "DetectedText": "may",
                  "Type": "WORD",
                  "Confidence": 99.80123901367188,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.037109375,
                      "Height": 0.015989582985639572,
                      "Left": 0.4697265625,
                      "Top": 0.4708932340145111
                    }
                  }
                },
                {
                  "DetectedText": "little",
                  "Type": "WORD",
                  "Confidence": 99.52481842041016,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0380859375,
                      "Height": 0.016789061948657036,
                      "Left": 0.5146484375,
                      "Top": 0.46689581871032715
                    }
                  }
                },
                {
                  "DetectedText": "vary",
                  "Type": "WORD",
                  "Confidence": 99.5761489868164,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0390625,
                      "Height": 0.015989582985639572,
                      "Left": 0.5595703125,
                      "Top": 0.4708932340145111
                    }
                  }
                },
                {
                  "DetectedText": "due",
                  "Type": "WORD",
                  "Confidence": 99.47248077392578,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0341796875,
                      "Height": 0.016789061948657036,
                      "Left": 0.60546875,
                      "Top": 0.46689581871032715
                    }
                  }
                },
                {
                  "DetectedText": "to",
                  "Type": "WORD",
                  "Confidence": 99.3950424194336,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0166015625,
                      "Height": 0.014390625059604645,
                      "Left": 0.646484375,
                      "Top": 0.46849480271339417
                    }
                  }
                },
                {
                  "DetectedText": "different",
                  "Type": "WORD",
                  "Confidence": 99.12847900390625,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.080078125,
                      "Height": 0.0175885409116745,
                      "Left": 0.6708984375,
                      "Top": 0.46609634160995483
                    }
                  }
                },
                {
                  "DetectedText": "screen",
                  "Type": "WORD",
                  "Confidence": 99.50704956054688,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0625,
                      "Height": 0.012791666202247143,
                      "Left": 0.755859375,
                      "Top": 0.4708932340145111
                    }
                  }
                },
                {
                  "DetectedText": "display",
                  "Type": "WORD",
                  "Confidence": 99.96685028076172,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0634765625,
                      "Height": 0.01998697966337204,
                      "Left": 0.826171875,
                      "Top": 0.46689581871032715
                    }
                  }
                },
                {
                  "DetectedText": "setting.",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0673828125,
                      "Height": 0.019187500700354576,
                      "Left": 0.8974609375,
                      "Top": 0.46769532561302185
                    }
                  }
                },
                {
                  "DetectedText": "Hip",
                  "Type": "WORD",
                  "Confidence": 99.09483337402344,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.03525923565030098,
                      "Height": 0.024497639387845993,
                      "Left": 0.1516253501176834,
                      "Top": 0.49730217456817627
                    }
                  }
                },
                {
                  "DetectedText": "2.Manually",
                  "Type": "WORD",
                  "Confidence": 98.74848937988281,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.10546875,
                      "Height": 0.02238541655242443,
                      "Left": 0.4169921875,
                      "Top": 0.4980755150318146
                    }
                  }
                },
                {
                  "DetectedText": "measured,0.5",
                  "Type": "WORD",
                  "Confidence": 94.88477325439453,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.1376953125,
                      "Height": 0.027182292193174362,
                      "Left": 0.5263671875,
                      "Top": 0.4948776066303253
                    }
                  }
                },
                {
                  "DetectedText": "to",
                  "Type": "WORD",
                  "Confidence": 99.26802825927734,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.01953125,
                      "Height": 0.015989582985639572,
                      "Left": 0.6640625,
                      "Top": 0.5004739761352539
                    }
                  }
                },
                {
                  "DetectedText": "1.2",
                  "Type": "WORD",
                  "Confidence": 97.9732666015625,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.033203125,
                      "Height": 0.0175885409116745,
                      "Left": 0.689453125,
                      "Top": 0.4988749921321869
                    }
                  }
                },
                {
                  "DetectedText": "inches",
                  "Type": "WORD",
                  "Confidence": 99.80985260009766,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0595703125,
                      "Height": 0.016789061948657036,
                      "Left": 0.7294921875,
                      "Top": 0.4996744692325592
                    }
                  }
                },
                {
                  "DetectedText": "tolerance",
                  "Type": "WORD",
                  "Confidence": 99.87750244140625,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0869140625,
                      "Height": 0.015190104022622108,
                      "Left": 0.794921875,
                      "Top": 0.5004739761352539
                    }
                  }
                },
                {
                  "DetectedText": "allowed.",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0751953125,
                      "Height": 0.015190104022622108,
                      "Left": 0.8896484375,
                      "Top": 0.5004739761352539
                    }
                  }
                },
                {
                  "DetectedText": "3.Please",
                  "Type": "WORD",
                  "Confidence": 99.53176879882812,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0830078125,
                      "Height": 0.0175885409116745,
                      "Left": 0.498046875,
                      "Top": 0.531653642654419
                    }
                  }
                },
                {
                  "DetectedText": "read",
                  "Type": "WORD",
                  "Confidence": 99.79698181152344,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0400390625,
                      "Height": 0.015989582985639572,
                      "Left": 0.587890625,
                      "Top": 0.5324531197547913
                    }
                  }
                },
                {
                  "DetectedText": "the",
                  "Type": "WORD",
                  "Confidence": 99.48809051513672,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0302734375,
                      "Height": 0.016789061948657036,
                      "Left": 0.634765625,
                      "Top": 0.531653642654419
                    }
                  }
                },
                {
                  "DetectedText": "size",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.03515625,
                      "Height": 0.015989582985639572,
                      "Left": 0.671875,
                      "Top": 0.5324531197547913
                    }
                  }
                },
                {
                  "DetectedText": "chart",
                  "Type": "WORD",
                  "Confidence": 99.36054229736328,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.048828125,
                      "Height": 0.0175885409116745,
                      "Left": 0.7138671875,
                      "Top": 0.531653642654419
                    }
                  }
                },
                {
                  "DetectedText": "before",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.05859375,
                      "Height": 0.015989582985639572,
                      "Left": 0.7685546875,
                      "Top": 0.5324530601501465
                    }
                  }
                },
                {
                  "DetectedText": "you",
                  "Type": "WORD",
                  "Confidence": 99.60045623779297,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.033203125,
                      "Height": 0.016789061948657036,
                      "Left": 0.833984375,
                      "Top": 0.5356510281562805
                    }
                  }
                },
                {
                  "DetectedText": "purchase.",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0908203125,
                      "Height": 0.01998697966337204,
                      "Left": 0.8740234375,
                      "Top": 0.5324531197547913
                    }
                  }
                },
                {
                  "DetectedText": "SIZE",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0966796875,
                      "Height": 0.03837500140070915,
                      "Left": 0.390625,
                      "Top": 0.5772239565849304
                    }
                  }
                },
                {
                  "DetectedText": "HIP(inch)",
                  "Type": "WORD",
                  "Confidence": 94.92965698242188,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.09067706763744354,
                      "Height": 0.03372583165764809,
                      "Left": 0.6748145818710327,
                      "Top": 0.5804920196533203
                    }
                  }
                },
                {
                  "DetectedText": "WAIST",
                  "Type": "WORD",
                  "Confidence": 99.89990997314453,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.078125,
                      "Height": 0.020786458626389503,
                      "Left": 0.5234375,
                      "Top": 0.5852187275886536
                    }
                  }
                },
                {
                  "DetectedText": "(inch)",
                  "Type": "WORD",
                  "Confidence": 98.28850555419922,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.04296875,
                      "Height": 0.018388021737337112,
                      "Left": 0.599609375,
                      "Top": 0.5892161726951599
                    }
                  }
                },
                {
                  "DetectedText": "LENGTH(inch)",
                  "Type": "WORD",
                  "Confidence": 98.16455078125,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.13811519742012024,
                      "Height": 0.025837482884526253,
                      "Left": 0.8132694959640503,
                      "Top": 0.5836713314056396
                    }
                  }
                },
                {
                  "DetectedText": "Length",
                  "Type": "WORD",
                  "Confidence": 99.3904037475586,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0615234375,
                      "Height": 0.01998697966337204,
                      "Left": 0.2421875,
                      "Top": 0.6475781202316284
                    }
                  }
                },
                {
                  "DetectedText": "S",
                  "Type": "WORD",
                  "Confidence": 98.31462097167969,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.029296875,
                      "Height": 0.03757552057504654,
                      "Left": 0.4189453125,
                      "Top": 0.6371849179267883
                    }
                  }
                },
                {
                  "DetectedText": "23-25",
                  "Type": "WORD",
                  "Confidence": 99.9747314453125,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0712890625,
                      "Height": 0.023184895515441895,
                      "Left": 0.5449218153953552,
                      "Top": 0.6459791660308838
                    }
                  }
                },
                {
                  "DetectedText": "30-32",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0703125,
                      "Height": 0.023184895515441895,
                      "Left": 0.6845702528953552,
                      "Top": 0.6459791660308838
                    }
                  }
                },
                {
                  "DetectedText": "35.9",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.052734375,
                      "Height": 0.02238541655242443,
                      "Left": 0.85546875,
                      "Top": 0.6467786431312561
                    }
                  }
                },
                {
                  "DetectedText": "M",
                  "Type": "WORD",
                  "Confidence": 96.0751724243164,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.04451292008161545,
                      "Height": 0.04013802111148834,
                      "Left": 0.41108426451683044,
                      "Top": 0.6960391402244568
                    }
                  }
                },
                {
                  "DetectedText": "26-28",
                  "Type": "WORD",
                  "Confidence": 99.95416259765625,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0712890625,
                      "Height": 0.023184895515441895,
                      "Left": 0.544921875,
                      "Top": 0.706739604473114
                    }
                  }
                },
                {
                  "DetectedText": "33-35",
                  "Type": "WORD",
                  "Confidence": 99.72102355957031,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0703125,
                      "Height": 0.023184895515441895,
                      "Left": 0.6835936903953552,
                      "Top": 0.706739604473114
                    }
                  }
                },
                {
                  "DetectedText": "36.2",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0517578125,
                      "Height": 0.02238541655242443,
                      "Left": 0.8564453125,
                      "Top": 0.7075390815734863
                    }
                  }
                },
                {
                  "DetectedText": "L",
                  "Type": "WORD",
                  "Confidence": 99.02782440185547,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0234375,
                      "Height": 0.03757552057504654,
                      "Left": 0.4189453125,
                      "Top": 0.7571067810058594
                    }
                  }
                },
                {
                  "DetectedText": "28-30",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0712890625,
                      "Height": 0.023184895515441895,
                      "Left": 0.5449218153953552,
                      "Top": 0.7682994604110718
                    }
                  }
                },
                {
                  "DetectedText": "34-36",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0712890625,
                      "Height": 0.023184895515441895,
                      "Left": 0.6835936903953552,
                      "Top": 0.7682994604110718
                    }
                  }
                },
                {
                  "DetectedText": "36.6",
                  "Type": "WORD",
                  "Confidence": 99.8869857788086,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0537109375,
                      "Height": 0.024783853441476822,
                      "Left": 0.8544921875,
                      "Top": 0.7674999833106995
                    }
                  }
                },
                {
                  "DetectedText": "XL",
                  "Type": "WORD",
                  "Confidence": 99.79069519042969,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0537109375,
                      "Height": 0.03757552057504654,
                      "Left": 0.400390625,
                      "Top": 0.8170676827430725
                    }
                  }
                },
                {
                  "DetectedText": "29-31",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0673828125,
                      "Height": 0.023184895515441895,
                      "Left": 0.544921875,
                      "Top": 0.8242630362510681
                    }
                  }
                },
                {
                  "DetectedText": "36-38",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0703125,
                      "Height": 0.023184895515441895,
                      "Left": 0.68359375,
                      "Top": 0.8242630362510681
                    }
                  }
                },
                {
                  "DetectedText": "36.9",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0537109375,
                      "Height": 0.024783853441476822,
                      "Left": 0.8544921875,
                      "Top": 0.8234635591506958
                    }
                  }
                },
                {
                  "DetectedText": "2XL",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0771484375,
                      "Height": 0.035177081823349,
                      "Left": 0.39453125,
                      "Top": 0.8778281211853027
                    }
                  }
                },
                {
                  "DetectedText": "31-33",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0712890625,
                      "Height": 0.023184895515441895,
                      "Left": 0.5449218153953552,
                      "Top": 0.8834244012832642
                    }
                  }
                },
                {
                  "DetectedText": "38-40",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0712890625,
                      "Height": 0.023184895515441895,
                      "Left": 0.6835936903953552,
                      "Top": 0.8834244012832642
                    }
                  }
                },
                {
                  "DetectedText": "37.3",
                  "Type": "WORD",
                  "Confidence": 99.83944702148438,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0537109375,
                      "Height": 0.024783853441476822,
                      "Left": 0.8544921875,
                      "Top": 0.8826249837875366
                    }
                  }
                },
                {
                  "DetectedText": "3XL",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0751953125,
                      "Height": 0.03597656264901161,
                      "Left": 0.3974609375,
                      "Top": 0.9377890825271606
                    }
                  }
                },
                {
                  "DetectedText": "33-35",
                  "Type": "WORD",
                  "Confidence": 99.7498779296875,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0712890625,
                      "Height": 0.023184895515441895,
                      "Left": 0.544921875,
                      "Top": 0.9425859451293945
                    }
                  }
                },
                {
                  "DetectedText": "40-42",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0712890625,
                      "Height": 0.023184895515441895,
                      "Left": 0.68359375,
                      "Top": 0.9425859451293945
                    }
                  }
                },
                {
                  "DetectedText": "37.6",
                  "Type": "WORD",
                  "Confidence": 100,
                  "Geometry": {
                    "BoundingBox": {
                      "Width": 0.0517578125,
                      "Height": 0.02238541655242443,
                      "Left": 0.85546875,
                      "Top": 0.9433854222297668
                    }
                  }
                }
              ]
            }
          }
        ],
        "analyzer_name": "text",
        "rules": [
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/main.jpg",
            "image_rules": [
              {
                "image_type": "main",
                "rule_id": "single_model_in_main_image",
                "analyzer": [
                  "object"
                ],
                "confidence_level": 80,
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "main",
                "rule_id": "product_fill",
                "analyzer": [
                  "object"
                ],
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
                "image_type": "main",
                "rule_id": "image_crop_nose_down",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "main",
                "rule_id": "image-full-length",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "main",
                "rule_id": "image-top-body",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "main",
                "rule_id": "image-back-details",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80
              },
              {
                "image_type": "main",
                "rule_id": "image-waist-down",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
                "definitions": [
                  "OR",
                  {
                    "greater_than_equal": {
                      "$.metadata.height": 1600
                    }
                  },
                  {
                    "greater_than_equal": {
                      "$.metadata.width": 1600
                    }
                  }
                ],
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "main",
                "rule_id": "white_background_main",
                "analyzer": [
                  "histogram"
                ],
                "definitions": [
                  {
                    "equals": {
                      "$.histogram.is_white_background": "true"
                    }
                  }
                ],
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "main",
                "rule_id": "multipack-off-model",
                "analyzer": [
                  "object"
                ],
                "confidence_level": 80,
                "compliance_level": "critical_issues"
              }
            ],
            "marketPlaceName": "amazon"
          },
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-1.jpg",
            "image_rules": [
              {
                "image_type": "variant",
                "rule_id": "image_crop_nose_down_variant",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "image_type": "variant",
                "rule_id": "white_background_variants",
                "analyzer": [
                  "histogram"
                ],
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
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-2.jpg",
            "image_rules": [
              {
                "image_type": "variant",
                "rule_id": "image_crop_nose_down_variant",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "image_type": "variant",
                "rule_id": "white_background_variants",
                "analyzer": [
                  "histogram"
                ],
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
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-3.jpg",
            "image_rules": [
              {
                "image_type": "variant",
                "rule_id": "image_crop_nose_down_variant",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "image_type": "variant",
                "rule_id": "white_background_variants",
                "analyzer": [
                  "histogram"
                ],
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
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-4.jpg",
            "image_rules": [
              {
                "image_type": "variant",
                "rule_id": "image_crop_nose_down_variant",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "image_type": "variant",
                "rule_id": "white_background_variants",
                "analyzer": [
                  "histogram"
                ],
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
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-5.jpg",
            "image_rules": [
              {
                "image_type": "variant",
                "rule_id": "image_crop_nose_down_variant",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "image_type": "variant",
                "rule_id": "white_background_variants",
                "analyzer": [
                  "histogram"
                ],
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
      },
      {
        "statusCode": 200,
        "job_id": "qc_xnpiiboz",
        "body": [
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/main.jpg",
            "analyzer_result": {
              "is_white_background": "true"
            }
          },
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-1.jpg",
            "analyzer_result": {
              "is_white_background": "true"
            }
          },
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-2.jpg",
            "analyzer_result": {
              "is_white_background": "true"
            }
          },
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-3.jpg",
            "analyzer_result": {
              "is_white_background": "true"
            }
          },
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-4.jpg",
            "analyzer_result": {
              "is_white_background": "true"
            }
          },
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-5.jpg",
            "analyzer_result": {
              "is_white_background": "true"
            }
          }
        ],
        "analyzer_name": "histogram",
        "rules": [
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/main.jpg",
            "image_rules": [
              {
                "image_type": "main",
                "rule_id": "single_model_in_main_image",
                "analyzer": [
                  "object"
                ],
                "confidence_level": 80,
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "main",
                "rule_id": "product_fill",
                "analyzer": [
                  "object"
                ],
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
                "image_type": "main",
                "rule_id": "image_crop_nose_down",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "main",
                "rule_id": "image-full-length",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "main",
                "rule_id": "image-top-body",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "main",
                "rule_id": "image-back-details",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80
              },
              {
                "image_type": "main",
                "rule_id": "image-waist-down",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
                "definitions": [
                  "OR",
                  {
                    "greater_than_equal": {
                      "$.metadata.height": 1600
                    }
                  },
                  {
                    "greater_than_equal": {
                      "$.metadata.width": 1600
                    }
                  }
                ],
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "main",
                "rule_id": "white_background_main",
                "analyzer": [
                  "histogram"
                ],
                "definitions": [
                  {
                    "equals": {
                      "$.histogram.is_white_background": "true"
                    }
                  }
                ],
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "main",
                "rule_id": "multipack-off-model",
                "analyzer": [
                  "object"
                ],
                "confidence_level": 80,
                "compliance_level": "critical_issues"
              }
            ],
            "marketPlaceName": "amazon"
          },
          {
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-1.jpg",
            "image_rules": [
              {
                "image_type": "variant",
                "rule_id": "image_crop_nose_down_variant",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "image_type": "variant",
                "rule_id": "white_background_variants",
                "analyzer": [
                  "histogram"
                ],
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
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-2.jpg",
            "image_rules": [
              {
                "image_type": "variant",
                "rule_id": "image_crop_nose_down_variant",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "image_type": "variant",
                "rule_id": "white_background_variants",
                "analyzer": [
                  "histogram"
                ],
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
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-3.jpg",
            "image_rules": [
              {
                "image_type": "variant",
                "rule_id": "image_crop_nose_down_variant",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "image_type": "variant",
                "rule_id": "white_background_variants",
                "analyzer": [
                  "histogram"
                ],
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
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-4.jpg",
            "image_rules": [
              {
                "image_type": "variant",
                "rule_id": "image_crop_nose_down_variant",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "image_type": "variant",
                "rule_id": "white_background_variants",
                "analyzer": [
                  "histogram"
                ],
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
            "image_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-5.jpg",
            "image_rules": [
              {
                "image_type": "variant",
                "rule_id": "image_crop_nose_down_variant",
                "analyzer": [
                  "body-detection"
                ],
                "confidence_level": 80,
                "compliance_level": "recommended_changes"
              },
              {
                "image_type": "all",
                "rule_id": "image-size",
                "analyzer": "metadata",
                "compliance_level": "critical_issues"
              },
              {
                "image_type": "all",
                "rule_id": "min-dpi",
                "analyzer": [
                  "metadata",
                  "text"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "analyzer": [
                  "metadata"
                ],
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
                "image_type": "variant",
                "rule_id": "white_background_variants",
                "analyzer": [
                  "histogram"
                ],
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
      }
    ],
    "images": [
      {
        "s3_key": "qc/private/_job_id/qc_xnpiiboz/input/images/main.jpg",
        "image_type": "main",
        "image_id": "main"
      },
      {
        "s3_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-1.jpg",
        "image_type": "variant",
        "image_id": "variant-1"
      },
      {
        "s3_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-2.jpg",
        "image_type": "variant",
        "image_id": "variant-2"
      },
      {
        "s3_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-3.jpg",
        "image_type": "variant",
        "image_id": "variant-3"
      },
      {
        "s3_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-4.jpg",
        "image_type": "variant",
        "image_id": "variant-4"
      },
      {
        "s3_key": "qc/private/_job_id/qc_xnpiiboz/input/images/variant-5.jpg",
        "image_type": "variant",
        "image_id": "variant-5"
      }
    ],
    "job_id": "qc_xnpiiboz",
    "listing_details": {
      "is_multipack": true,
      "is_video_available": true,
      "_is_below_the_knee": true,
      "_is_above_the_knee": false,
      "is_back_detail_key_selling_feature": true,
      "is_below_the_waist": true
    },
    "platform_name": "amazon",
    "listing_rules": [
      [
        {
          "rule_id": "adequate_image_count",
          "definitions": [
            "AND",
            {
              "greater_than_equal": {
                "min_image_count": 5
              }
            },
            {
              "less_than_equal": {
                "max_image_count": 7
              }
            }
          ],
          "compliance_level": "critical_issues",
          "rule_applicability": "listing"
        },
        {
          "rule_id": "is_video_present",
          "definitions": [
            {
              "equals": {
                "is_video_present": true
              }
            }
          ],
          "compliance_level": "recommended_changes",
          "rule_applicability": "listing"
        },
        {
          "image_type": "variant",
          "rule_id": "one-variant-without-model-is-present",
          "analyzer": [
            "body-detection",
            "object"
          ],
          "compliance_level": "recommended_changes",
          "rule_applicability": "listing"
        }
      ]
    ]
  };
  let response = await handler(event);
  console.log("data\n\n"+esponse);
});

it("should-create-get-rainforest-response-from-s3", async () => {
  let response = await getProductListingDetailsFromS3("qc_hsphqsx3");
  console.log(JSON.stringify(response));
});

it("should-create-overview-object", async () => {
  let rainforestResponse = {
    "request_info": {
      "success": true,
      "credits_used": 3,
      "credits_remaining": 97,
      "credits_used_this_request": 1
    },
    "request_parameters": {
      "amazon_domain": "amazon.com",
      "asin": "B07815JCHQ",
      "type": "product"
    },
    "request_metadata": {
      "created_at": "2022-08-24T10:07:01.278Z",
      "processed_at": "2022-08-24T10:07:05.887Z",
      "total_time_taken": 4.61,
      "amazon_url": "https://www.amazon.com/dp/B07815JCHQ?th=1&psc=1"
    },
    "product": {
      "title": "Under Armour Men's Tech 2.0 Short-Sleeve T-Shirt Black (001)/Graphite XX-Large",
      "search_alias": {
        "title": "All Departments",
        "value": "aps"
      },
      "title_excluding_variant_name": "Under Armour Men's Tech 2.0 Short-Sleeve T-Shirt",
      "keywords": "Under,Armour,Men's,Tech,2.0,Short-Sleeve,T-Shirt",
      "keywords_list": [
        "Under",
        "Armour",
        "Men's",
        "Tech",
        "Short-Sleeve",
        "T-Shirt"
      ],
      "asin": "B07815JCHQ",
      "parent_asin": "B0B96HTKQ4",
      "link": "https://www.amazon.com/dp/B07815JCHQ??th=1&psc=1",
      "brand": "‎Under Armour",
      "add_an_accessory": [
        {
          "asin": "B01N3T0UGE",
          "title": "Temple Tape Headbands for Men and Women - Mens Sweatband & Sports Headband Moisture Wicking Workout Sweatbands for Running, Cross Training, Yoga and Bike Helmet Friendly",
          "price": {
            "symbol": "$",
            "value": 8.95,
            "currency": "USD",
            "raw": "$8.95"
          }
        },
        {
          "asin": "B076Z13TKM",
          "title": "Temple Tape Headbands for Men and Women - Mens Sweatband & Sports Headband Moisture Wicking Workout Sweatbands for Running, Cross Training, Yoga and Bike Helmet Friendly",
          "price": {
            "symbol": "$",
            "value": 13.95,
            "currency": "USD",
            "raw": "$13.95"
          }
        }
      ],
      "sell_on_amazon": true,
      "variants": [
        {
          "asin": "B077ZXTZ6Q",
          "title": "Black (001)/Graphite 4X-Large Big",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B077ZXTZ6Q?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (001)/Graphite"
            },
            {
              "name": "Size",
              "value": "4X-Large Big"
            }
          ]
        },
        {
          "asin": "B093KJJ213",
          "title": "Blaze Orange (826)/Black Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093KJJ213?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Blaze Orange (826)/Black"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/51FL5l7cfUL._AC_SL1000_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/51FL5l7cfUL._AC_SL1000_.jpg"
            },
            {
              "variant": "BACK",
              "link": "https://m.media-amazon.com/images/I/51gX3NCWYwL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/41oni68UspL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT02",
              "link": "https://m.media-amazon.com/images/I/71AXs9NtsXL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT03",
              "link": "https://m.media-amazon.com/images/I/61-Yg3UphjL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT04",
              "link": "https://m.media-amazon.com/images/I/61zWsjT0F4L._AC_SL1000_.jpg"
            },
            {
              "variant": "PT06",
              "link": "https://m.media-amazon.com/images/I/71cUE782G+S._AC_SL1129_.jpg"
            },
            {
              "variant": "PT99",
              "link": "https://m.media-amazon.com/images/I/51QFPByxEmL._AC_SL1000_.jpg"
            }
          ]
        },
        {
          "asin": "B093K2MFVN",
          "title": "Cruise Blue (899)/White 4X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093K2MFVN?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Cruise Blue (899)/White"
            },
            {
              "name": "Size",
              "value": "4X-Large"
            }
          ]
        },
        {
          "asin": "B07814LVQK",
          "title": "Academy (409)/Steel X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07814LVQK?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (409)/Steel"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B09JNDJ9MM",
          "title": "(486) Versa Blue / / Black 4X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNDJ9MM?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(486) Versa Blue / / Black"
            },
            {
              "name": "Size",
              "value": "4X-Large"
            }
          ]
        },
        {
          "asin": "B093JZB7Q6",
          "title": "Black Rose (664)/Black X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093JZB7Q6?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black Rose (664)/Black"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B07CZLNB31",
          "title": "White (100)/Overcast Gray XX-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZLNB31?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "White (100)/Overcast Gray"
            },
            {
              "name": "Size",
              "value": "XX-Large Tall"
            }
          ]
        },
        {
          "asin": "B077XNMSPS",
          "title": "White (100)/Overcast Gray X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B077XNMSPS?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "White (100)/Overcast Gray"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/31trkm6fNvL._AC_SL1000_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/31trkm6fNvL._AC_SL1000_.jpg"
            },
            {
              "variant": "BACK",
              "link": "https://m.media-amazon.com/images/I/41utxzbiP-L._AC_SL1000_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/41Trr0yPklL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT02",
              "link": "https://m.media-amazon.com/images/I/516FUkaf+FL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT04",
              "link": "https://m.media-amazon.com/images/I/31SREJ5O-NL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT99",
              "link": "https://m.media-amazon.com/images/I/51QFPByxEmL._AC_SL1000_.jpg"
            }
          ]
        },
        {
          "asin": "B07FSGQPZZ",
          "title": "Royal Blue (400)/Graphite X-Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07FSGQPZZ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Royal Blue (400)/Graphite"
            },
            {
              "name": "Size",
              "value": "X-Small"
            }
          ]
        },
        {
          "asin": "B07RCZLLGR",
          "title": "Beta (628)/Cordova Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07RCZLLGR?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Beta (628)/Cordova"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B07RJ5T9CJ",
          "title": "Pink Surge (687)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07RJ5T9CJ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Pink Surge (687)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B07CZBYQ3S",
          "title": "Steel Light Heather (036)/Black XX-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZBYQ3S?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Steel Light Heather (036)/Black"
            },
            {
              "name": "Size",
              "value": "XX-Large Tall"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/61wBIquwgoL._AC_SL1000_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/61wBIquwgoL._AC_SL1000_.jpg"
            },
            {
              "variant": "BACK",
              "link": "https://m.media-amazon.com/images/I/61ix5D4mUJL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/51mehC4lKUL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT02",
              "link": "https://m.media-amazon.com/images/I/611BGXlu-vL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT03",
              "link": "https://m.media-amazon.com/images/I/61Fa6V6ASKL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT99",
              "link": "https://m.media-amazon.com/images/I/51QFPByxEmL._AC_SL1000_.jpg"
            }
          ]
        },
        {
          "asin": "B077XQJT9G",
          "title": "Artillery Green (357)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B077XQJT9G?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Artillery Green (357)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B07FLV5Q4N",
          "title": "Red (600)/Graphite XX-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07FLV5Q4N?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Red (600)/Graphite"
            },
            {
              "name": "Size",
              "value": "XX-Large Tall"
            }
          ]
        },
        {
          "asin": "B07813WXR2",
          "title": "Black (001)/Graphite Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07813WXR2?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (001)/Graphite"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B08LP1JGY7",
          "title": "Dark Maroon (602)/White Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B08LP1JGY7?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Dark Maroon (602)/White"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B09JNG7941",
          "title": "(782) Rise / / Black XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNG7941?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(782) Rise / / Black"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B093K86XFS",
          "title": "Quirky Lime (752)/Black 3X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093K86XFS?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Quirky Lime (752)/Black"
            },
            {
              "name": "Size",
              "value": "3X-Large"
            }
          ]
        },
        {
          "asin": "B0872DCD18",
          "title": "Venom Red (690)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0872DCD18?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Venom Red (690)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B07CZJK5GV",
          "title": "Academy (409)/Steel X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZJK5GV?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (409)/Steel"
            },
            {
              "name": "Size",
              "value": "X-Large Tall"
            }
          ]
        },
        {
          "asin": "B093KGLMTQ",
          "title": "Fresco Blue (481)/Academy Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093KGLMTQ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Fresco Blue (481)/Academy"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B07RJ5T9SL",
          "title": "Pink Surge (687)/Black Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07RJ5T9SL?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Pink Surge (687)/Black"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/41uQORL48GL._AC_SL1000_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/41uQORL48GL._AC_SL1000_.jpg"
            },
            {
              "variant": "BACK",
              "link": "https://m.media-amazon.com/images/I/51zRt8qoGtL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/91eHDlF9TlL._AC_SL1500_.jpg"
            },
            {
              "variant": "PT02",
              "link": "https://m.media-amazon.com/images/I/91JA9Ftx+zL._AC_SL1500_.jpg"
            },
            {
              "variant": "PT06",
              "link": "https://m.media-amazon.com/images/I/71cUE782G+S._AC_SL1129_.jpg"
            },
            {
              "variant": "PT18",
              "link": "https://m.media-amazon.com/images/I/51zRt8qoGtL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT99",
              "link": "https://m.media-amazon.com/images/I/51QFPByxEmL._AC_SL1000_.jpg"
            }
          ]
        },
        {
          "asin": "B08LNZTFNH",
          "title": "Radar Blue (422)/Black Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B08LNZTFNH?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Radar Blue (422)/Black"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B07815981V",
          "title": "Royal Blue (400)/Graphite 4X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07815981V?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Royal Blue (400)/Graphite"
            },
            {
              "name": "Size",
              "value": "4X-Large"
            }
          ]
        },
        {
          "asin": "B09JNDR2G9",
          "title": "(486) Versa Blue / / Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNDR2G9?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(486) Versa Blue / / Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B07815RZJT",
          "title": "Royal Blue (400)/Graphite Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07815RZJT?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Royal Blue (400)/Graphite"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B09JNHXZ5R",
          "title": "(782) Rise / / Black X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNHXZ5R?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(782) Rise / / Black"
            },
            {
              "name": "Size",
              "value": "X-Large Tall"
            }
          ]
        },
        {
          "asin": "B0872F1VF6",
          "title": "Pink Shock (684)/Black X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0872F1VF6?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Pink Shock (684)/Black"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B07RCZLLHP",
          "title": "X-ray (786)/Black One Size",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07RCZLLHP?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "X-ray (786)/Black"
            },
            {
              "name": "Size",
              "value": "One Size"
            }
          ]
        },
        {
          "asin": "B07CZJK5HJ",
          "title": "Royal Blue (400)/Graphite 3X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZJK5HJ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Royal Blue (400)/Graphite"
            },
            {
              "name": "Size",
              "value": "3X-Large Tall"
            }
          ]
        },
        {
          "asin": "B09JNJZ3NP",
          "title": "(334) Key Lime / / Black 3X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNJZ3NP?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(334) Key Lime / / Black"
            },
            {
              "name": "Size",
              "value": "3X-Large Tall"
            }
          ]
        },
        {
          "asin": "B07814LW39",
          "title": "Royal Blue (400)/Graphite XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07814LW39?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Royal Blue (400)/Graphite"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B09JNGRTHN",
          "title": "(390) Marine Od Green / / Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNGRTHN?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(390) Marine Od Green / / Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B07FSHPQTJ",
          "title": "Black (002)/Black X-Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07FSHPQTJ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (002)/Black"
            },
            {
              "name": "Size",
              "value": "X-Small"
            }
          ]
        },
        {
          "asin": "B077ZXTZW5",
          "title": "Academy (408)/Graphite Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B077ZXTZW5?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (408)/Graphite"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B0943CB8DZ",
          "title": "Cloudless Sky (404)/Blue X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0943CB8DZ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Cloudless Sky (404)/Blue"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B09JSZTSRD",
          "title": "(810) Bolt Red / Chestnut Red / Black 3X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JSZTSRD?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(810) Bolt Red / Chestnut Red / Black"
            },
            {
              "name": "Size",
              "value": "3X-Large"
            }
          ]
        },
        {
          "asin": "B09JND8K3K",
          "title": "(486) Versa Blue / / Black Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JND8K3K?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(486) Versa Blue / / Black"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B07CZKSMCH",
          "title": "White (100)/Overcast Gray X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZKSMCH?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "White (100)/Overcast Gray"
            },
            {
              "name": "Size",
              "value": "X-Large Tall"
            }
          ]
        },
        {
          "asin": "B09JNJFRCD",
          "title": "(486) Versa Blue / / Black 3X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNJFRCD?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(486) Versa Blue / / Black"
            },
            {
              "name": "Size",
              "value": "3X-Large Tall"
            }
          ]
        },
        {
          "asin": "B093K2PBXF",
          "title": "Black Rose (664)/Black Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093K2PBXF?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black Rose (664)/Black"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B077XRHGWQ",
          "title": "Steel Light Heather (036)/Black Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B077XRHGWQ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Steel Light Heather (036)/Black"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B077ZXNXG8",
          "title": "Royal Blue (400)/Graphite Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B077ZXNXG8?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Royal Blue (400)/Graphite"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B09JNDMNLS",
          "title": "(390) Marine Od Green / / Black 5X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNDMNLS?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(390) Marine Od Green / / Black"
            },
            {
              "name": "Size",
              "value": "5X-Large"
            }
          ]
        },
        {
          "asin": "B07815C5QP",
          "title": "Royal Blue (400)/Graphite X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07815C5QP?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Royal Blue (400)/Graphite"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B08LNYDDR6",
          "title": "Phoenix Fire (296)/Black XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B08LNYDDR6?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Phoenix Fire (296)/Black"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B09JNGSGMS",
          "title": "(334) Key Lime / / Black X-Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNGSGMS?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(334) Key Lime / / Black"
            },
            {
              "name": "Size",
              "value": "X-Small"
            }
          ]
        },
        {
          "asin": "B09JNDV6BH",
          "title": "(782) Rise / / Black 3X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNDV6BH?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(782) Rise / / Black"
            },
            {
              "name": "Size",
              "value": "3X-Large"
            }
          ]
        },
        {
          "asin": "B09JND2PPT",
          "title": "(486) Versa Blue / / Black 5X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JND2PPT?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(486) Versa Blue / / Black"
            },
            {
              "name": "Size",
              "value": "5X-Large"
            }
          ]
        },
        {
          "asin": "B07FSDBNFW",
          "title": "Red (600)/Graphite X-Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07FSDBNFW?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Red (600)/Graphite"
            },
            {
              "name": "Size",
              "value": "X-Small"
            }
          ]
        },
        {
          "asin": "B08LNZJSVC",
          "title": "Tech Blue (432)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B08LNZJSVC?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Tech Blue (432)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B093K88C6P",
          "title": "Tent (361)/Black Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093K88C6P?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Tent (361)/Black"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B095L1NDP9",
          "title": "Radar Blue (422)/Black X-Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B095L1NDP9?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Radar Blue (422)/Black"
            },
            {
              "name": "Size",
              "value": "X-Small"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/717Rufe5O2L._AC_SL1500_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/717Rufe5O2L._AC_SL1500_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/7154Dx4PmWL._AC_SL1500_.jpg"
            }
          ]
        },
        {
          "asin": "B0872CTYXF",
          "title": "Pink Shock (684)/Black XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0872CTYXF?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Pink Shock (684)/Black"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B07GJ1GXG1",
          "title": "Academy (409)/Steel Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07GJ1GXG1?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (409)/Steel"
            },
            {
              "name": "Size",
              "value": "Large Tall"
            }
          ]
        },
        {
          "asin": "B07815JCHQ",
          "title": "Black (001)/Graphite XX-Large",
          "is_current_product": true,
          "link": "https://www.amazon.com/dp/B07815JCHQ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (001)/Graphite"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B07CZ99VVB",
          "title": "Black (003)/Jet Gray X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZ99VVB?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (003)/Jet Gray"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B077XQ7XFL",
          "title": "Charcoal Light Heath (019)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B077XQ7XFL?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Charcoal Light Heath (019)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B07CZ99VVD",
          "title": "Steel Light Heather (036)/Black 3X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZ99VVD?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Steel Light Heather (036)/Black"
            },
            {
              "name": "Size",
              "value": "3X-Large Tall"
            }
          ]
        },
        {
          "asin": "B0942RB1QW",
          "title": "Cloudless Sky (404)/Blue Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0942RB1QW?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Cloudless Sky (404)/Blue"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B09JNKMB49",
          "title": "(390) Marine Od Green / / Black X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNKMB49?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(390) Marine Od Green / / Black"
            },
            {
              "name": "Size",
              "value": "X-Large Tall"
            }
          ]
        },
        {
          "asin": "B07814BWCZ",
          "title": "Black (001)/Graphite 3X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07814BWCZ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (001)/Graphite"
            },
            {
              "name": "Size",
              "value": "3X-Large"
            }
          ]
        },
        {
          "asin": "B0872D9H98",
          "title": "Pink Shock (684)/Black X-Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0872D9H98?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Pink Shock (684)/Black"
            },
            {
              "name": "Size",
              "value": "X-Small"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/41yv9qgO2LL._AC_SL1000_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/41yv9qgO2LL._AC_SL1000_.jpg"
            },
            {
              "variant": "BACK",
              "link": "https://m.media-amazon.com/images/I/41Bad4Q8zFL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/51E8XarWJ6L._AC_SL1000_.jpg"
            },
            {
              "variant": "PT02",
              "link": "https://m.media-amazon.com/images/I/61PAuCTMN-L._AC_SL1000_.jpg"
            },
            {
              "variant": "PT06",
              "link": "https://m.media-amazon.com/images/I/71cUE782G+S._AC_SL1129_.jpg"
            },
            {
              "variant": "PT99",
              "link": "https://m.media-amazon.com/images/I/51QFPByxEmL._AC_SL1000_.jpg"
            }
          ]
        },
        {
          "asin": "B09JNFCM4T",
          "title": "(177) Fresco Green / / Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNFCM4T?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(177) Fresco Green / / Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B0943291GM",
          "title": "Cloudless Sky (404)/Blue Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0943291GM?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Cloudless Sky (404)/Blue"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B09JNHYWNY",
          "title": "(782) Rise / / Black Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNHYWNY?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(782) Rise / / Black"
            },
            {
              "name": "Size",
              "value": "Large Tall"
            }
          ]
        },
        {
          "asin": "B07FLVKYDJ",
          "title": "Red (600)/Graphite 3X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07FLVKYDJ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Red (600)/Graphite"
            },
            {
              "name": "Size",
              "value": "3X-Large Tall"
            }
          ]
        },
        {
          "asin": "B093QC4H1X",
          "title": "Tech Blue (432)/Black X-Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093QC4H1X?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Tech Blue (432)/Black"
            },
            {
              "name": "Size",
              "value": "X-Small"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/91NFOoGFMhL._AC_SL1500_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/91NFOoGFMhL._AC_SL1500_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/91xJDNXvSaL._AC_SL1500_.jpg"
            },
            {
              "variant": "PT02",
              "link": "https://m.media-amazon.com/images/I/91cZ8X37HXL._AC_SL1500_.jpg"
            },
            {
              "variant": "PT09",
              "link": "https://m.media-amazon.com/images/I/61195clazsL._AC_SL1500_.jpg"
            }
          ]
        },
        {
          "asin": "B0785VMVF4",
          "title": "Black (001)/Graphite Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0785VMVF4?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (001)/Graphite"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B07CZBVMTM",
          "title": "Black (003)/Jet Gray XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZBVMTM?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (003)/Jet Gray"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B07CZCH8HJ",
          "title": "Royal Blue (400)/Graphite 5X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZCH8HJ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Royal Blue (400)/Graphite"
            },
            {
              "name": "Size",
              "value": "5X-Large"
            }
          ]
        },
        {
          "asin": "B07CZBZ2SQ",
          "title": "Royal Blue (400)/Graphite XX-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZBZ2SQ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Royal Blue (400)/Graphite"
            },
            {
              "name": "Size",
              "value": "XX-Large Tall"
            }
          ]
        },
        {
          "asin": "B07CZZMKXM",
          "title": "Carbon Heather (090)/Black XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZZMKXM?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Carbon Heather (090)/Black"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B07813TTTM",
          "title": "White (100)/Overcast Gray 4X-Large Big",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07813TTTM?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "White (100)/Overcast Gray"
            },
            {
              "name": "Size",
              "value": "4X-Large Big"
            }
          ]
        },
        {
          "asin": "B07CZJSFWJ",
          "title": "Academy (408)/Graphite 3X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZJSFWJ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (408)/Graphite"
            },
            {
              "name": "Size",
              "value": "3X-Large Tall"
            }
          ]
        },
        {
          "asin": "B09JNJGV5Q",
          "title": "(486) Versa Blue / / Black 4X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNJGV5Q?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(486) Versa Blue / / Black"
            },
            {
              "name": "Size",
              "value": "4X-Large Tall"
            }
          ]
        },
        {
          "asin": "B0872DLWZG",
          "title": "Blaze Orange (825)/Black Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0872DLWZG?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Blaze Orange (825)/Black"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B09JNFK56X",
          "title": "Orange Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNFK56X?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Orange"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B093KBGFJV",
          "title": "Black Rose (664)/Black Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093KBGFJV?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black Rose (664)/Black"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B0942S5TZR",
          "title": "Victory Blue (474)/Blue Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0942S5TZR?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Victory Blue (474)/Blue"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B07YXPHHNR",
          "title": "Cinna Red (688)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07YXPHHNR?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Cinna Red (688)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B07CZJ7DF8",
          "title": "White (100)/Overcast Gray 5X-Large Big",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZJ7DF8?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "White (100)/Overcast Gray"
            },
            {
              "name": "Size",
              "value": "5X-Large Big"
            }
          ]
        },
        {
          "asin": "B077XR6G2J",
          "title": "White (100)/Overcast Gray 3X-Large Big",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B077XR6G2J?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "White (100)/Overcast Gray"
            },
            {
              "name": "Size",
              "value": "3X-Large Big"
            }
          ]
        },
        {
          "asin": "B07815S8J8",
          "title": "Steel Light Heather (036)/Black 4X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07815S8J8?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Steel Light Heather (036)/Black"
            },
            {
              "name": "Size",
              "value": "4X-Large"
            }
          ]
        },
        {
          "asin": "B093KHRXX2",
          "title": "Cruise Blue (899)/White 3X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093KHRXX2?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Cruise Blue (899)/White"
            },
            {
              "name": "Size",
              "value": "3X-Large"
            }
          ]
        },
        {
          "asin": "B077XR6G2T",
          "title": "Artillery Green (357)/Black Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B077XR6G2T?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Artillery Green (357)/Black"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B07815BXKR",
          "title": "Red (600)/Graphite 4X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07815BXKR?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Red (600)/Graphite"
            },
            {
              "name": "Size",
              "value": "4X-Large"
            }
          ]
        },
        {
          "asin": "B07815RTCZ",
          "title": "Academy (409)/Steel 4X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07815RTCZ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (409)/Steel"
            },
            {
              "name": "Size",
              "value": "4X-Large"
            }
          ]
        },
        {
          "asin": "B09JT49RKQ",
          "title": "(810) Bolt Red / Chestnut Red / Black Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JT49RKQ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(810) Bolt Red / Chestnut Red / Black"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B0785FSBT3",
          "title": "Red (600)/Graphite XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0785FSBT3?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Red (600)/Graphite"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B08FD13Z77",
          "title": "Academy (408)/Graphite 4X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B08FD13Z77?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (408)/Graphite"
            },
            {
              "name": "Size",
              "value": "4X-Large Tall"
            }
          ]
        },
        {
          "asin": "B09JNFXSML",
          "title": "(334) Key Lime / / Black X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNFXSML?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(334) Key Lime / / Black"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B07FSB2LK9",
          "title": "Steel Light Heather (036)/Black X-Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07FSB2LK9?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Steel Light Heather (036)/Black"
            },
            {
              "name": "Size",
              "value": "X-Small"
            }
          ]
        },
        {
          "asin": "B0785W56Q3",
          "title": "Black (002)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0785W56Q3?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (002)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/913mKvfuAxL._AC_SL1500_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/913mKvfuAxL._AC_SL1500_.jpg"
            },
            {
              "variant": "BACK",
              "link": "https://m.media-amazon.com/images/I/61O1D60HnhL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/91oSZwJGxvL._AC_SL1500_.jpg"
            },
            {
              "variant": "PT02",
              "link": "https://m.media-amazon.com/images/I/71UD8SmcLoL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT03",
              "link": "https://m.media-amazon.com/images/I/51+jHLepQ5L._AC_SL1289_.jpg"
            },
            {
              "variant": "PT04",
              "link": "https://m.media-amazon.com/images/I/A1HwkTFqP9L._AC_SL1500_.jpg"
            },
            {
              "variant": "PT05",
              "link": "https://m.media-amazon.com/images/I/A1-CBh4HBSL._AC_SL1500_.jpg"
            }
          ]
        },
        {
          "asin": "B09JNG76ZV",
          "title": "(177) Fresco Green / / Black XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNG76ZV?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(177) Fresco Green / / Black"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B09JNDQHZD",
          "title": "(334) Key Lime / / Black 4X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNDQHZD?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(334) Key Lime / / Black"
            },
            {
              "name": "Size",
              "value": "4X-Large"
            }
          ]
        },
        {
          "asin": "B096MSG4L9",
          "title": "White (100)/Overcast Gray 4X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B096MSG4L9?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "White (100)/Overcast Gray"
            },
            {
              "name": "Size",
              "value": "4X-Large Tall"
            }
          ]
        },
        {
          "asin": "B07811X9SB",
          "title": "Academy (408)/Graphite 3X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07811X9SB?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (408)/Graphite"
            },
            {
              "name": "Size",
              "value": "3X-Large"
            }
          ]
        },
        {
          "asin": "B07M6RT5PB",
          "title": "Carbon Heather (090)/Black Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07M6RT5PB?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Carbon Heather (090)/Black"
            },
            {
              "name": "Size",
              "value": "Large Tall"
            }
          ]
        },
        {
          "asin": "B07MF98NS8",
          "title": "Carbon Heather (090)/Black 5X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07MF98NS8?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Carbon Heather (090)/Black"
            },
            {
              "name": "Size",
              "value": "5X-Large"
            }
          ]
        },
        {
          "asin": "B09JNJ1LRD",
          "title": "(177) Fresco Green / / Black X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNJ1LRD?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(177) Fresco Green / / Black"
            },
            {
              "name": "Size",
              "value": "X-Large Tall"
            }
          ]
        },
        {
          "asin": "B0785X1LJM",
          "title": "Black (002)/Black 4X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0785X1LJM?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (002)/Black"
            },
            {
              "name": "Size",
              "value": "4X-Large"
            }
          ]
        },
        {
          "asin": "B07811Z8ZV",
          "title": "Academy (409)/Steel Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07811Z8ZV?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (409)/Steel"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B07D126W6P",
          "title": "Carbon Heather (090)/Black Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07D126W6P?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Carbon Heather (090)/Black"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B093KD7G4N",
          "title": "Quirky Lime (752)/Black X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093KD7G4N?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Quirky Lime (752)/Black"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B093KBT41Q",
          "title": "Tent (361)/Black X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093KBT41Q?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Tent (361)/Black"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B07CZYPYHW",
          "title": "Carbon Heather (090)/Black 3X-Large Big",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZYPYHW?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Carbon Heather (090)/Black"
            },
            {
              "name": "Size",
              "value": "3X-Large Big"
            }
          ]
        },
        {
          "asin": "B096MT49B7",
          "title": "Academy (409)/Steel 4X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B096MT49B7?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (409)/Steel"
            },
            {
              "name": "Size",
              "value": "4X-Large Tall"
            }
          ]
        },
        {
          "asin": "B07CZJGDF5",
          "title": "Barn (633)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZJGDF5?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Barn (633)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B09JT3FKQ1",
          "title": "(810) Bolt Red / Chestnut Red / Black 4X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JT3FKQ1?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(810) Bolt Red / Chestnut Red / Black"
            },
            {
              "name": "Size",
              "value": "4X-Large"
            }
          ]
        },
        {
          "asin": "B09JNF2MRZ",
          "title": "(486) Versa Blue / / Black 3X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNF2MRZ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(486) Versa Blue / / Black"
            },
            {
              "name": "Size",
              "value": "3X-Large"
            }
          ]
        },
        {
          "asin": "B08LNZCRD8",
          "title": "Ash Plum (554)/Black Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B08LNZCRD8?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Ash Plum (554)/Black"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B07CZJSFVG",
          "title": "Academy (408)/Graphite X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZJSFVG?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (408)/Graphite"
            },
            {
              "name": "Size",
              "value": "X-Large Tall"
            }
          ]
        },
        {
          "asin": "B093KG3V8S",
          "title": "Blaze Orange (826)/Black XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093KG3V8S?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Blaze Orange (826)/Black"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B07CZM1L1V",
          "title": "Royal Blue (400)/Graphite X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZM1L1V?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Royal Blue (400)/Graphite"
            },
            {
              "name": "Size",
              "value": "X-Large Tall"
            }
          ]
        },
        {
          "asin": "B093KF6LLJ",
          "title": "Tent (361)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093KF6LLJ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Tent (361)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B0781383YP",
          "title": "Black (002)/Black X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0781383YP?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (002)/Black"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B08LP1QP3P",
          "title": "Tech Blue (432)/Black XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B08LP1QP3P?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Tech Blue (432)/Black"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B07CZFFVQN",
          "title": "Black (001)/Graphite XX-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZFFVQN?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (001)/Graphite"
            },
            {
              "name": "Size",
              "value": "XX-Large Tall"
            }
          ]
        },
        {
          "asin": "B07D13B3N1",
          "title": "Carbon Heather (090)/Black Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07D13B3N1?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Carbon Heather (090)/Black"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/61etE0tKyGL._AC_SL1000_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/61etE0tKyGL._AC_SL1000_.jpg"
            },
            {
              "variant": "BACK",
              "link": "https://m.media-amazon.com/images/I/51MwvBCfQKL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/41XNrgz4+HL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT03",
              "link": "https://m.media-amazon.com/images/I/51TQpq6XnQL._AC_SL1500_.jpg"
            },
            {
              "variant": "PT04",
              "link": "https://m.media-amazon.com/images/I/61YryUKrDOL._AC_SL1000_.jpg"
            }
          ]
        },
        {
          "asin": "B07CZF6XTR",
          "title": "Steel Light Heather (036)/Black 5X-Large Big",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZF6XTR?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Steel Light Heather (036)/Black"
            },
            {
              "name": "Size",
              "value": "5X-Large Big"
            }
          ]
        },
        {
          "asin": "B07814L6HB",
          "title": "Academy (408)/Graphite 4X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07814L6HB?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (408)/Graphite"
            },
            {
              "name": "Size",
              "value": "4X-Large"
            }
          ]
        },
        {
          "asin": "B093KBC8MD",
          "title": "Fresco Blue (481)/Academy Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093KBC8MD?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Fresco Blue (481)/Academy"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B07CZMXW59",
          "title": "Steel Light Heather (036)/Black X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZMXW59?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Steel Light Heather (036)/Black"
            },
            {
              "name": "Size",
              "value": "X-Large Tall"
            }
          ]
        },
        {
          "asin": "B09JNDMG1J",
          "title": "(334) Key Lime / / Black Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNDMG1J?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(334) Key Lime / / Black"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B07CZBVKKP",
          "title": "Black (001)/Graphite 3X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZBVKKP?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (001)/Graphite"
            },
            {
              "name": "Size",
              "value": "3X-Large Tall"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/51lcBQJtssL._AC_SL1000_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/51lcBQJtssL._AC_SL1000_.jpg"
            },
            {
              "variant": "BACK",
              "link": "https://m.media-amazon.com/images/I/51yykKUpOqL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/41UJH4evn0S._AC_SL1000_.jpg"
            },
            {
              "variant": "PT03",
              "link": "https://m.media-amazon.com/images/I/410vSnAd61S._AC_SL1000_.jpg"
            },
            {
              "variant": "PT04",
              "link": "https://m.media-amazon.com/images/I/4105oz5wDBS._AC_SL1000_.jpg"
            },
            {
              "variant": "PT99",
              "link": "https://m.media-amazon.com/images/I/51QFPByxEmL._AC_SL1000_.jpg"
            }
          ]
        },
        {
          "asin": "B09JNL25ZG",
          "title": "(782) Rise / / Black XX-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNL25ZG?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(782) Rise / / Black"
            },
            {
              "name": "Size",
              "value": "XX-Large Tall"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/91vukDwCvbL._AC_SL1500_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/91vukDwCvbL._AC_SL1500_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/719jz0QjXkL._AC_SL1464_.jpg"
            },
            {
              "variant": "PT02",
              "link": "https://m.media-amazon.com/images/I/91hrGzXp18L._AC_SL1500_.jpg"
            },
            {
              "variant": "PT03",
              "link": "https://m.media-amazon.com/images/I/81IocWfEusL._AC_SL1500_.jpg"
            },
            {
              "variant": "PT99",
              "link": "https://m.media-amazon.com/images/I/51QFPByxEmL._AC_SL1000_.jpg"
            }
          ]
        },
        {
          "asin": "B093KG82TN",
          "title": "Cruise Blue (899)/White X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093KG82TN?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Cruise Blue (899)/White"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B093KJ4H7M",
          "title": "Tent (361)/Black XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093KJ4H7M?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Tent (361)/Black"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/51KQYOOPzwL._AC_SL1000_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/51KQYOOPzwL._AC_SL1000_.jpg"
            },
            {
              "variant": "BACK",
              "link": "https://m.media-amazon.com/images/I/51tJBdLecCL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/415gbXzHyIL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT04",
              "link": "https://m.media-amazon.com/images/I/412MyRFIfBL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT99",
              "link": "https://m.media-amazon.com/images/I/51QFPByxEmL._AC_SL1000_.jpg"
            }
          ]
        },
        {
          "asin": "B077ZYG16L",
          "title": "Academy (409)/Steel XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B077ZYG16L?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (409)/Steel"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B07CZMXWF6",
          "title": "Academy (409)/Steel XX-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZMXWF6?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (409)/Steel"
            },
            {
              "name": "Size",
              "value": "XX-Large Tall"
            }
          ]
        },
        {
          "asin": "B07MBHRL2J",
          "title": "Carbon Heather (090)/Black X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07MBHRL2J?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Carbon Heather (090)/Black"
            },
            {
              "name": "Size",
              "value": "X-Large Tall"
            }
          ]
        },
        {
          "asin": "B07CZMXW5H",
          "title": "White (100)/Overcast Gray 3X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZMXW5H?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "White (100)/Overcast Gray"
            },
            {
              "name": "Size",
              "value": "3X-Large Tall"
            }
          ]
        },
        {
          "asin": "B09JNGZHW3",
          "title": "(334) Key Lime / / Black Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNGZHW3?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(334) Key Lime / / Black"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/71zoOJotEML._AC_SL1500_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/71zoOJotEML._AC_SL1500_.jpg"
            }
          ]
        },
        {
          "asin": "B09JNHSRSJ",
          "title": "(486) Versa Blue / / Black X-Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNHSRSJ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(486) Versa Blue / / Black"
            },
            {
              "name": "Size",
              "value": "X-Small"
            }
          ]
        },
        {
          "asin": "B09JNFYYY9",
          "title": "Orange X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNFYYY9?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Orange"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/91vukDwCvbL._AC_SL1500_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/91vukDwCvbL._AC_SL1500_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/719jz0QjXkL._AC_SL1464_.jpg"
            },
            {
              "variant": "PT02",
              "link": "https://m.media-amazon.com/images/I/91hrGzXp18L._AC_SL1500_.jpg"
            },
            {
              "variant": "PT03",
              "link": "https://m.media-amazon.com/images/I/81IocWfEusL._AC_SL1500_.jpg"
            },
            {
              "variant": "PT04",
              "link": "https://m.media-amazon.com/images/I/61aAoBB34sL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT99",
              "link": "https://m.media-amazon.com/images/I/51QFPByxEmL._AC_SL1000_.jpg"
            }
          ]
        },
        {
          "asin": "B0785VV446",
          "title": "Black (001)/Graphite X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0785VV446?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (001)/Graphite"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B09JNF6B1Y",
          "title": "(177) Fresco Green / / Black Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNF6B1Y?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(177) Fresco Green / / Black"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B0785FSBPY",
          "title": "Artillery Green (357)/Black Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0785FSBPY?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Artillery Green (357)/Black"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B07815BPLM",
          "title": "Black (002)/Black XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07815BPLM?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (002)/Black"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B07CZCN13M",
          "title": "Black (002)/Black 5X-Large Big",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZCN13M?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (002)/Black"
            },
            {
              "name": "Size",
              "value": "5X-Large Big"
            }
          ]
        },
        {
          "asin": "B093K84VBL",
          "title": "Tent (361)/Black 3X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093K84VBL?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Tent (361)/Black"
            },
            {
              "name": "Size",
              "value": "3X-Large"
            }
          ]
        },
        {
          "asin": "B07F9RQ12P",
          "title": "Black (001)/Graphite Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07F9RQ12P?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (001)/Graphite"
            },
            {
              "name": "Size",
              "value": "Large Tall"
            }
          ]
        },
        {
          "asin": "B095L1YRP6",
          "title": "Dark Maroon (602)/White X-Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B095L1YRP6?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Dark Maroon (602)/White"
            },
            {
              "name": "Size",
              "value": "X-Small"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/51KllrTFWpL._AC_SL1500_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/51KllrTFWpL._AC_SL1500_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/51nj4klqmNL._AC_SL1500_.jpg"
            }
          ]
        },
        {
          "asin": "B0785FWNL6",
          "title": "Red (600)/Graphite Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0785FWNL6?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Red (600)/Graphite"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/41J5w1GvU9L._AC_SL1000_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/41J5w1GvU9L._AC_SL1000_.jpg"
            },
            {
              "variant": "BACK",
              "link": "https://m.media-amazon.com/images/I/51IJ2BvRcIL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/41NUJTMFyvL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT02",
              "link": "https://m.media-amazon.com/images/I/61ApbqFVpKL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT04",
              "link": "https://m.media-amazon.com/images/I/41gnZgLiY5L._AC_SL1000_.jpg"
            },
            {
              "variant": "PT99",
              "link": "https://m.media-amazon.com/images/I/51QFPByxEmL._AC_SL1000_.jpg"
            }
          ]
        },
        {
          "asin": "B0785FWNL5",
          "title": "Red (600)/Graphite X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0785FWNL5?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Red (600)/Graphite"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B094369VJQ",
          "title": "Cloudless Sky (404)/Blue Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B094369VJQ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Cloudless Sky (404)/Blue"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B07813H28S",
          "title": "Black (002)/Black Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07813H28S?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (002)/Black"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B09JNJPTGD",
          "title": "(334) Key Lime / / Black Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNJPTGD?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(334) Key Lime / / Black"
            },
            {
              "name": "Size",
              "value": "Large Tall"
            }
          ]
        },
        {
          "asin": "B08LNXMHMT",
          "title": "Dark Maroon (602)/White X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B08LNXMHMT?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Dark Maroon (602)/White"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B07CZCCS7Z",
          "title": "Black (002)/Black X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZCCS7Z?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (002)/Black"
            },
            {
              "name": "Size",
              "value": "X-Large Tall"
            }
          ]
        },
        {
          "asin": "B07CZCCS7X",
          "title": "Black (002)/Black XX-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZCCS7X?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (002)/Black"
            },
            {
              "name": "Size",
              "value": "XX-Large Tall"
            }
          ]
        },
        {
          "asin": "B09JNG6YD8",
          "title": "(782) Rise / / Black X-Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNG6YD8?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(782) Rise / / Black"
            },
            {
              "name": "Size",
              "value": "X-Small"
            }
          ]
        },
        {
          "asin": "B07CZLKDBP",
          "title": "Academy (408)/Graphite 5X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZLKDBP?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (408)/Graphite"
            },
            {
              "name": "Size",
              "value": "5X-Large"
            }
          ]
        },
        {
          "asin": "B07CZ99XQ1",
          "title": "Black (001)/Graphite X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZ99XQ1?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (001)/Graphite"
            },
            {
              "name": "Size",
              "value": "X-Large Tall"
            }
          ]
        },
        {
          "asin": "B08FCXBV23",
          "title": "Black (002)/Black 4X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B08FCXBV23?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (002)/Black"
            },
            {
              "name": "Size",
              "value": "4X-Large Tall"
            }
          ]
        },
        {
          "asin": "B09JNHNZM5",
          "title": "(390) Marine Od Green / / Black Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNHNZM5?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(390) Marine Od Green / / Black"
            },
            {
              "name": "Size",
              "value": "Large Tall"
            }
          ]
        },
        {
          "asin": "B07814DWC6",
          "title": "Academy (409)/Steel 3X-Large Big",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07814DWC6?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (409)/Steel"
            },
            {
              "name": "Size",
              "value": "3X-Large Big"
            }
          ]
        },
        {
          "asin": "B077XM8DDM",
          "title": "Steel Light Heather (036)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B077XM8DDM?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Steel Light Heather (036)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B0785WH7V1",
          "title": "Black (002)/Black 3X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0785WH7V1?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (002)/Black"
            },
            {
              "name": "Size",
              "value": "3X-Large"
            }
          ]
        },
        {
          "asin": "B07GL5845P",
          "title": "Red (600)/Graphite X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07GL5845P?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Red (600)/Graphite"
            },
            {
              "name": "Size",
              "value": "X-Large Tall"
            }
          ]
        },
        {
          "asin": "B0942Y43S4",
          "title": "Cloudless Sky (404)/Blue 3X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0942Y43S4?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Cloudless Sky (404)/Blue"
            },
            {
              "name": "Size",
              "value": "3X-Large"
            }
          ]
        },
        {
          "asin": "B07CZCHCFH",
          "title": "Black (001)/Graphite 5X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZCHCFH?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (001)/Graphite"
            },
            {
              "name": "Size",
              "value": "5X-Large"
            }
          ]
        },
        {
          "asin": "B0872D28V9",
          "title": "Blaze Orange (825)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0872D28V9?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Blaze Orange (825)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B077XNW5PB",
          "title": "Steel Light Heather (036)/Black 3X-Large Big",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B077XNW5PB?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Steel Light Heather (036)/Black"
            },
            {
              "name": "Size",
              "value": "3X-Large Big"
            }
          ]
        },
        {
          "asin": "B07814LBR9",
          "title": "Academy (409)/Steel Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07814LBR9?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (409)/Steel"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B07YXLFYQ3",
          "title": "Baroque Green (311)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07YXLFYQ3?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Baroque Green (311)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B0872DJM7S",
          "title": "High-vis Yellow (731)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0872DJM7S?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "High-vis Yellow (731)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B08LP14CJR",
          "title": "Radar Blue (422)/Black Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B08LP14CJR?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Radar Blue (422)/Black"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B093KDGQTS",
          "title": "Quirky Lime (752)/Black Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093KDGQTS?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Quirky Lime (752)/Black"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/41D6ASG17HL._AC_SL1000_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/41D6ASG17HL._AC_SL1000_.jpg"
            },
            {
              "variant": "BACK",
              "link": "https://m.media-amazon.com/images/I/51voZEe2kKL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/41vHj+jQzYL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT04",
              "link": "https://m.media-amazon.com/images/I/41eIMlRrNUL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT99",
              "link": "https://m.media-amazon.com/images/I/51QFPByxEmL._AC_SL1000_.jpg"
            }
          ]
        },
        {
          "asin": "B093K64L4P",
          "title": "Blaze Orange (826)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093K64L4P?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Blaze Orange (826)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B093K5HK3Y",
          "title": "Fresco Blue (481)/Academy Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093K5HK3Y?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Fresco Blue (481)/Academy"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/41dXliqGt8L._AC_SL1000_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/41dXliqGt8L._AC_SL1000_.jpg"
            },
            {
              "variant": "BACK",
              "link": "https://m.media-amazon.com/images/I/41ykC+Dtz2L._AC_SL1000_.jpg"
            },
            {
              "variant": "PT99",
              "link": "https://m.media-amazon.com/images/I/51QFPByxEmL._AC_SL1000_.jpg"
            }
          ]
        },
        {
          "asin": "B09JNCTZ4W",
          "title": "(177) Fresco Green / / Black 4X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNCTZ4W?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(177) Fresco Green / / Black"
            },
            {
              "name": "Size",
              "value": "4X-Large"
            }
          ]
        },
        {
          "asin": "B093QMG46G",
          "title": "Green/Black X-Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093QMG46G?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Green/Black"
            },
            {
              "name": "Size",
              "value": "X-Small"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/61i8rji273L._AC_SL1500_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/61i8rji273L._AC_SL1500_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/81hUyWQmx1L._AC_SL1500_.jpg"
            },
            {
              "variant": "PT02",
              "link": "https://m.media-amazon.com/images/I/715qrmQ1hmL._AC_SL1500_.jpg"
            },
            {
              "variant": "PT03",
              "link": "https://m.media-amazon.com/images/I/61i8rji273L._AC_SL1500_.jpg"
            }
          ]
        },
        {
          "asin": "B093KFTG48",
          "title": "Fresco Blue (481)/Academy 3X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093KFTG48?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Fresco Blue (481)/Academy"
            },
            {
              "name": "Size",
              "value": "3X-Large"
            }
          ]
        },
        {
          "asin": "B09JNJ8JVP",
          "title": "(390) Marine Od Green / / Black 4X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNJ8JVP?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(390) Marine Od Green / / Black"
            },
            {
              "name": "Size",
              "value": "4X-Large Tall"
            }
          ]
        },
        {
          "asin": "B09JNF8QD1",
          "title": "(486) Versa Blue / / Black Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNF8QD1?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(486) Versa Blue / / Black"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B07CZM47W8",
          "title": "Academy (409)/Steel 3X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZM47W8?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (409)/Steel"
            },
            {
              "name": "Size",
              "value": "3X-Large Tall"
            }
          ]
        },
        {
          "asin": "B07D13B3M6",
          "title": "Carbon Heather (090)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07D13B3M6?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Carbon Heather (090)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B093KJ5Y2T",
          "title": "Fresco Blue (481)/Academy 4X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093KJ5Y2T?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Fresco Blue (481)/Academy"
            },
            {
              "name": "Size",
              "value": "4X-Large"
            }
          ]
        },
        {
          "asin": "B07TKYB5JP",
          "title": "Ultra Orange (856)/Black Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07TKYB5JP?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Ultra Orange (856)/Black"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B09JNDWW94",
          "title": "(782) Rise / / Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNDWW94?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(782) Rise / / Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B09JNHMXJJ",
          "title": "(782) Rise / / Black 3X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNHMXJJ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(782) Rise / / Black"
            },
            {
              "name": "Size",
              "value": "3X-Large Tall"
            }
          ]
        },
        {
          "asin": "B093JZ2CQB",
          "title": "Tent (361)/Black Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093JZ2CQB?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Tent (361)/Black"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B093K2LSZN",
          "title": "Quirky Lime (752)/Black XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093K2LSZN?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Quirky Lime (752)/Black"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B07CZKSMNY",
          "title": "Academy (409)/Steel 5X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZKSMNY?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (409)/Steel"
            },
            {
              "name": "Size",
              "value": "5X-Large"
            }
          ]
        },
        {
          "asin": "B0872DJM72",
          "title": "Breeze (441)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0872DJM72?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Breeze (441)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B0785VXRX2",
          "title": "Black (001)/Graphite Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0785VXRX2?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (001)/Graphite"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B09JT6JQJR",
          "title": "(810) Bolt Red / Chestnut Red / Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JT6JQJR?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(810) Bolt Red / Chestnut Red / Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B07FRZKT6S",
          "title": "White (100)/Overcast Gray X-Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07FRZKT6S?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "White (100)/Overcast Gray"
            },
            {
              "name": "Size",
              "value": "X-Small"
            }
          ]
        },
        {
          "asin": "B07813H62D",
          "title": "Academy (408)/Graphite Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07813H62D?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (408)/Graphite"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B0942M3DSK",
          "title": "Victory Blue (474)/Blue Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0942M3DSK?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Victory Blue (474)/Blue"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B077XNJPMS",
          "title": "Steel Light Heather (036)/Black X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B077XNJPMS?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Steel Light Heather (036)/Black"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B07FTV4C6T",
          "title": "Steel Light Heather (036)/Black Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07FTV4C6T?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Steel Light Heather (036)/Black"
            },
            {
              "name": "Size",
              "value": "Large Tall"
            }
          ]
        },
        {
          "asin": "B077XM3DV5",
          "title": "White (100)/Overcast Gray Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B077XM3DV5?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "White (100)/Overcast Gray"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B08LP1P6P8",
          "title": "Tech Blue (432)/Black Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B08LP1P6P8?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Tech Blue (432)/Black"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B0872DD1D8",
          "title": "Venom Red (690)/Black Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0872DD1D8?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Venom Red (690)/Black"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B093K55MNY",
          "title": "Blaze Orange (826)/Black X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093K55MNY?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Blaze Orange (826)/Black"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B07RCZLLN3",
          "title": "Beta (628)/Cordova XX-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07RCZLLN3?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Beta (628)/Cordova"
            },
            {
              "name": "Size",
              "value": "XX-Large Tall"
            }
          ]
        },
        {
          "asin": "B07SP8DHJN",
          "title": "Carbon Heather (090)/Black X-Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07SP8DHJN?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Carbon Heather (090)/Black"
            },
            {
              "name": "Size",
              "value": "X-Small"
            }
          ]
        },
        {
          "asin": "B07CZK763S",
          "title": "Academy (408)/Graphite XX-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZK763S?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (408)/Graphite"
            },
            {
              "name": "Size",
              "value": "XX-Large Tall"
            }
          ]
        },
        {
          "asin": "B09JT4993W",
          "title": "(810) Bolt Red / Chestnut Red / Black Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JT4993W?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(810) Bolt Red / Chestnut Red / Black"
            },
            {
              "name": "Size",
              "value": "Large Tall"
            }
          ]
        },
        {
          "asin": "B093K6C24M",
          "title": "Quirky Lime (752)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093K6C24M?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Quirky Lime (752)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B07M6RVY73",
          "title": "Carbon Heather (090)/Black 4X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07M6RVY73?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Carbon Heather (090)/Black"
            },
            {
              "name": "Size",
              "value": "4X-Large Tall"
            }
          ]
        },
        {
          "asin": "B07TLYNLK7",
          "title": "Ultra Orange (856)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07TLYNLK7?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Ultra Orange (856)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B0872F6VLT",
          "title": "Venom Red (690)/Black X-Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0872F6VLT?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Venom Red (690)/Black"
            },
            {
              "name": "Size",
              "value": "X-Small"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/51M4KCWGQpL._AC_SL1000_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/51M4KCWGQpL._AC_SL1000_.jpg"
            },
            {
              "variant": "BACK",
              "link": "https://m.media-amazon.com/images/I/61nWk4BadkL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/51a-56mdFFL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT02",
              "link": "https://m.media-amazon.com/images/I/71hHpL8-kBL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT06",
              "link": "https://m.media-amazon.com/images/I/71cUE782G+S._AC_SL1129_.jpg"
            },
            {
              "variant": "PT99",
              "link": "https://m.media-amazon.com/images/I/51QFPByxEmL._AC_SL1000_.jpg"
            }
          ]
        },
        {
          "asin": "B07Z8G86FT",
          "title": "Cinna Red (688)/Black Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07Z8G86FT?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Cinna Red (688)/Black"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/51VBxNs06hL._AC_SL1000_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/51VBxNs06hL._AC_SL1000_.jpg"
            },
            {
              "variant": "BACK",
              "link": "https://m.media-amazon.com/images/I/51NOiYaKVaL._AC_SL1000_.jpg"
            }
          ]
        },
        {
          "asin": "B0872D218C",
          "title": "Pink Shock (684)/Black Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0872D218C?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Pink Shock (684)/Black"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B09JNCNHQ6",
          "title": "(334) Key Lime / / Black 3X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNCNHQ6?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(334) Key Lime / / Black"
            },
            {
              "name": "Size",
              "value": "3X-Large"
            }
          ]
        },
        {
          "asin": "B0781597ZY",
          "title": "Academy (409)/Steel Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0781597ZY?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (409)/Steel"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/71j7rX+EwjL._AC_SL1000_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/71j7rX+EwjL._AC_SL1000_.jpg"
            },
            {
              "variant": "BACK",
              "link": "https://m.media-amazon.com/images/I/61SbKOo-huL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/51bk4JsLIUL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT02",
              "link": "https://m.media-amazon.com/images/I/71Myofup9wL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT04",
              "link": "https://m.media-amazon.com/images/I/71Ga2g2stUL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT99",
              "link": "https://m.media-amazon.com/images/I/51QFPByxEmL._AC_SL1000_.jpg"
            }
          ]
        },
        {
          "asin": "B07815SGLL",
          "title": "Royal Blue (400)/Graphite 3X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07815SGLL?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Royal Blue (400)/Graphite"
            },
            {
              "name": "Size",
              "value": "3X-Large"
            }
          ]
        },
        {
          "asin": "B08LP11KTR",
          "title": "Tech Blue (432)/Black Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B08LP11KTR?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Tech Blue (432)/Black"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B07F9KQ4LN",
          "title": "White (100)/Overcast Gray Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07F9KQ4LN?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "White (100)/Overcast Gray"
            },
            {
              "name": "Size",
              "value": "Large Tall"
            }
          ]
        },
        {
          "asin": "B0785W9DZJ",
          "title": "Academy (408)/Graphite Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0785W9DZJ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (408)/Graphite"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/51JIIvVbZaL._AC_SL1000_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/51JIIvVbZaL._AC_SL1000_.jpg"
            },
            {
              "variant": "BACK",
              "link": "https://m.media-amazon.com/images/I/51NXcKtihkL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/41KvhizabdL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT02",
              "link": "https://m.media-amazon.com/images/I/51iTpNKcgBL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT03",
              "link": "https://m.media-amazon.com/images/I/51TQpq6XnQL._AC_SL1500_.jpg"
            },
            {
              "variant": "PT04",
              "link": "https://m.media-amazon.com/images/I/41HQy1Bv60L._AC_SL1000_.jpg"
            }
          ]
        },
        {
          "asin": "B07FSDTB22",
          "title": "Academy (408)/Graphite X-Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07FSDTB22?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (408)/Graphite"
            },
            {
              "name": "Size",
              "value": "X-Small"
            }
          ]
        },
        {
          "asin": "B09JNF1KH9",
          "title": "(334) Key Lime / / Black 5X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNF1KH9?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(334) Key Lime / / Black"
            },
            {
              "name": "Size",
              "value": "5X-Large"
            }
          ]
        },
        {
          "asin": "B07TLX1H5X",
          "title": "Ultra Orange (856)/Black X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07TLX1H5X?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Ultra Orange (856)/Black"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B077ZXTT3W",
          "title": "Academy (408)/Graphite XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B077ZXTT3W?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (408)/Graphite"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B07D123XY9",
          "title": "Carbon Heather (090)/Black X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07D123XY9?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Carbon Heather (090)/Black"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B09JND8F7W",
          "title": "(177) Fresco Green / / Black 3X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JND8F7W?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(177) Fresco Green / / Black"
            },
            {
              "name": "Size",
              "value": "3X-Large"
            }
          ]
        },
        {
          "asin": "B09JT6BN8Q",
          "title": "(810) Bolt Red / Chestnut Red / Black X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JT6BN8Q?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(810) Bolt Red / Chestnut Red / Black"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B07MF42D99",
          "title": "Carbon Heather (090)/Black XX-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07MF42D99?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Carbon Heather (090)/Black"
            },
            {
              "name": "Size",
              "value": "XX-Large Tall"
            }
          ]
        },
        {
          "asin": "B093JY66ZG",
          "title": "Quirky Lime (752)/Black Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093JY66ZG?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Quirky Lime (752)/Black"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B07CZBYYGM",
          "title": "Zap Green (722)/Jet Gray Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZBYYGM?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Zap Green (722)/Jet Gray"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B077XPFPD5",
          "title": "Red (600)/Graphite Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B077XPFPD5?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Red (600)/Graphite"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B08FCX4RX2",
          "title": "Royal Blue (400)/Graphite 4X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B08FCX4RX2?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Royal Blue (400)/Graphite"
            },
            {
              "name": "Size",
              "value": "4X-Large Tall"
            }
          ]
        },
        {
          "asin": "B09JT4QVTG",
          "title": "(810) Bolt Red / Chestnut Red / Black X-Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JT4QVTG?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(810) Bolt Red / Chestnut Red / Black"
            },
            {
              "name": "Size",
              "value": "X-Small"
            }
          ]
        },
        {
          "asin": "B07MPFKLFJ",
          "title": "Carbon Heather (090)/Black 3X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07MPFKLFJ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Carbon Heather (090)/Black"
            },
            {
              "name": "Size",
              "value": "3X-Large Tall"
            }
          ]
        },
        {
          "asin": "B07CZL72D5",
          "title": "Black (002)/Black 3X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZL72D5?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (002)/Black"
            },
            {
              "name": "Size",
              "value": "3X-Large Tall"
            }
          ]
        },
        {
          "asin": "B0872DMLYH",
          "title": "High-vis Yellow (731)/Black X-Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0872DMLYH?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "High-vis Yellow (731)/Black"
            },
            {
              "name": "Size",
              "value": "X-Small"
            }
          ]
        },
        {
          "asin": "B09JNK9C6D",
          "title": "(334) Key Lime / / Black X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNK9C6D?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(334) Key Lime / / Black"
            },
            {
              "name": "Size",
              "value": "X-Large Tall"
            }
          ]
        },
        {
          "asin": "B09JNFBTGV",
          "title": "(177) Fresco Green / / Black Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNFBTGV?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(177) Fresco Green / / Black"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B07RCJR2GH",
          "title": "X-ray (786)/Black 3X-Large Big",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07RCJR2GH?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "X-ray (786)/Black"
            },
            {
              "name": "Size",
              "value": "3X-Large Big"
            }
          ]
        },
        {
          "asin": "B07GJ68J8W",
          "title": "Black (002)/Black Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07GJ68J8W?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (002)/Black"
            },
            {
              "name": "Size",
              "value": "Large Tall"
            }
          ]
        },
        {
          "asin": "B08FCXWVYT",
          "title": "Academy (408)/Graphite Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B08FCXWVYT?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (408)/Graphite"
            },
            {
              "name": "Size",
              "value": "Large Tall"
            }
          ]
        },
        {
          "asin": "B07815BYTV",
          "title": "Royal Blue (400)/Graphite Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07815BYTV?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Royal Blue (400)/Graphite"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B09JNF5PFZ",
          "title": "(177) Fresco Green / / Black X-Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNF5PFZ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(177) Fresco Green / / Black"
            },
            {
              "name": "Size",
              "value": "X-Small"
            }
          ]
        },
        {
          "asin": "B0872CTYXV",
          "title": "Blaze Orange (825)/Black Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0872CTYXV?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Blaze Orange (825)/Black"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B093QDRC82",
          "title": "Phoenix Fire (296)/Black X-Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093QDRC82?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Phoenix Fire (296)/Black"
            },
            {
              "name": "Size",
              "value": "X-Small"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/71RBG-oQwkL._AC_SL1500_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/71RBG-oQwkL._AC_SL1500_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/81sFD8O-Q4L._AC_SL1500_.jpg"
            }
          ]
        },
        {
          "asin": "B08LNZ9ZYJ",
          "title": "Radar Blue (422)/Black XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B08LNZ9ZYJ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Radar Blue (422)/Black"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B08LNT4FLJ",
          "title": "Stadium Green (341)/Black Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B08LNT4FLJ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Stadium Green (341)/Black"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B09JNHKS25",
          "title": "(177) Fresco Green / / Black 4X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNHKS25?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(177) Fresco Green / / Black"
            },
            {
              "name": "Size",
              "value": "4X-Large Tall"
            }
          ]
        },
        {
          "asin": "B09JNF6172",
          "title": "(782) Rise / / Black 4X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNF6172?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(782) Rise / / Black"
            },
            {
              "name": "Size",
              "value": "4X-Large"
            }
          ]
        },
        {
          "asin": "B077XN6789",
          "title": "White (100)/Overcast Gray Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B077XN6789?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "White (100)/Overcast Gray"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B09JNDZFBZ",
          "title": "(177) Fresco Green / / Black 5X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNDZFBZ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(177) Fresco Green / / Black"
            },
            {
              "name": "Size",
              "value": "5X-Large"
            }
          ]
        },
        {
          "asin": "B093K3N912",
          "title": "Tent (361)/Black 4X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093K3N912?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Tent (361)/Black"
            },
            {
              "name": "Size",
              "value": "4X-Large"
            }
          ]
        },
        {
          "asin": "B077ZXNCWP",
          "title": "Black (002)/Black Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B077ZXNCWP?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (002)/Black"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B09JNG33Y7",
          "title": "(177) Fresco Green / / Black X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNG33Y7?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(177) Fresco Green / / Black"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/71hWX-EjkAL._AC_SL1500_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/71hWX-EjkAL._AC_SL1500_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/71gqH2H+2gL._AC_SL1500_.jpg"
            }
          ]
        },
        {
          "asin": "B07RK9QJTW",
          "title": "Beta (628)/Cordova Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07RK9QJTW?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Beta (628)/Cordova"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/51LICAyh0iL._AC_SL1000_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/51LICAyh0iL._AC_SL1000_.jpg"
            },
            {
              "variant": "FRNT",
              "link": "https://m.media-amazon.com/images/I/51NzjIYoqTL._AC_SL1000_.jpg"
            },
            {
              "variant": "SIDE",
              "link": "https://m.media-amazon.com/images/I/51DKRLsCIaL._AC_SL1000_.jpg"
            },
            {
              "variant": "BACK",
              "link": "https://m.media-amazon.com/images/I/51DNA84wacL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/51y-Abz3EfL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT02",
              "link": "https://m.media-amazon.com/images/I/51tf2XKfB2L._AC_SL1000_.jpg"
            },
            {
              "variant": "PT06",
              "link": "https://m.media-amazon.com/images/I/71cUE782G+S._AC_SL1129_.jpg"
            },
            {
              "variant": "PT99",
              "link": "https://m.media-amazon.com/images/I/51QFPByxEmL._AC_SL1000_.jpg"
            }
          ]
        },
        {
          "asin": "B09JT45BQB",
          "title": "(810) Bolt Red / Chestnut Red / Black XX-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JT45BQB?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(810) Bolt Red / Chestnut Red / Black"
            },
            {
              "name": "Size",
              "value": "XX-Large Tall"
            }
          ]
        },
        {
          "asin": "B09JNFX6LC",
          "title": "(390) Marine Od Green / / Black X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNFX6LC?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(390) Marine Od Green / / Black"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B0872DGKXH",
          "title": "Blaze Orange (825)/Black X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0872DGKXH?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Blaze Orange (825)/Black"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B09JNG6W6M",
          "title": "(486) Versa Blue / / Black XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNG6W6M?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(486) Versa Blue / / Black"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B077XQ3L6G",
          "title": "Red (600)/Graphite Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B077XQ3L6G?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Red (600)/Graphite"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B07RF1GX14",
          "title": "X-ray (786)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07RF1GX14?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "X-ray (786)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B09JNGRXFC",
          "title": "(390) Marine Od Green / / Black Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNGRXFC?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(390) Marine Od Green / / Black"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/714mpqZ-n8L._AC_SL1500_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/714mpqZ-n8L._AC_SL1500_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/71dLxk9kMOL._AC_SL1500_.jpg"
            }
          ]
        },
        {
          "asin": "B077XNWC11",
          "title": "Radio Red (890)/Black Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B077XNWC11?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Radio Red (890)/Black"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B093QDQRXG",
          "title": "Ash Plum (554)/Black X-Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093QDQRXG?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Ash Plum (554)/Black"
            },
            {
              "name": "Size",
              "value": "X-Small"
            }
          ]
        },
        {
          "asin": "B093K9DYT2",
          "title": "Blaze Orange (826)/Black Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093K9DYT2?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Blaze Orange (826)/Black"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B09JNFLQ4Z",
          "title": "(782) Rise / / Black Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNFLQ4Z?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(782) Rise / / Black"
            },
            {
              "name": "Size",
              "value": "Large"
            }
          ]
        },
        {
          "asin": "B08LNZ3XXM",
          "title": "Phoenix Fire (296)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B08LNZ3XXM?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Phoenix Fire (296)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B07DGLCM35",
          "title": "Black (001)/Graphite X-Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07DGLCM35?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (001)/Graphite"
            },
            {
              "name": "Size",
              "value": "X-Small"
            }
          ]
        },
        {
          "asin": "B0872DWKL3",
          "title": "Blaze Orange (825)/Black XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0872DWKL3?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Blaze Orange (825)/Black"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B09JNG3832",
          "title": "(334) Key Lime / / Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNG3832?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(334) Key Lime / / Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B09JND2VY6",
          "title": "(390) Marine Od Green / / Black Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JND2VY6?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(390) Marine Od Green / / Black"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B0942M529Y",
          "title": "Victory Blue (474)/Blue X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0942M529Y?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Victory Blue (474)/Blue"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B09JNFNDG8",
          "title": "(334) Key Lime / / Black XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNFNDG8?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(334) Key Lime / / Black"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B093KMWX19",
          "title": "Black Rose (664)/Black XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093KMWX19?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black Rose (664)/Black"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B0785J41PZ",
          "title": "Red (600)/Graphite 3X-Large Big",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0785J41PZ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Red (600)/Graphite"
            },
            {
              "name": "Size",
              "value": "3X-Large Big"
            }
          ]
        },
        {
          "asin": "B08LNZS9KY",
          "title": "Stadium Green (341)/Black XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B08LNZS9KY?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Stadium Green (341)/Black"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B093KG1JPM",
          "title": "Fresco Blue (481)/Academy X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093KG1JPM?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Fresco Blue (481)/Academy"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B0872DGG2H",
          "title": "Starlight (561)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0872DGG2H?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Starlight (561)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B096MR1SB9",
          "title": "Black (001)/Graphite 4X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B096MR1SB9?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black (001)/Graphite"
            },
            {
              "name": "Size",
              "value": "4X-Large Tall"
            }
          ]
        },
        {
          "asin": "B093KHR1RK",
          "title": "Black Rose (664)/Black 4X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093KHR1RK?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black Rose (664)/Black"
            },
            {
              "name": "Size",
              "value": "4X-Large"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/51gToQgbFhL._AC_SL1000_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/51gToQgbFhL._AC_SL1000_.jpg"
            },
            {
              "variant": "BACK",
              "link": "https://m.media-amazon.com/images/I/51GFEJSk2iL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/41rf4avQmdL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT02",
              "link": "https://m.media-amazon.com/images/I/61+znZajtUL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT03",
              "link": "https://m.media-amazon.com/images/I/51ndnRNR3IL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT04",
              "link": "https://m.media-amazon.com/images/I/41bDObapafL._AC_SL1000_.jpg"
            },
            {
              "variant": "PT99",
              "link": "https://m.media-amazon.com/images/I/51QFPByxEmL._AC_SL1000_.jpg"
            }
          ]
        },
        {
          "asin": "B09JNF3916",
          "title": "(782) Rise / / Black 5X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNF3916?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(782) Rise / / Black"
            },
            {
              "name": "Size",
              "value": "5X-Large"
            }
          ]
        },
        {
          "asin": "B07815QHHK",
          "title": "Academy (408)/Graphite X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07815QHHK?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (408)/Graphite"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B093KCKKGW",
          "title": "Quirky Lime (752)/Black 4X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093KCKKGW?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Quirky Lime (752)/Black"
            },
            {
              "name": "Size",
              "value": "4X-Large"
            }
          ]
        },
        {
          "asin": "B07FSCVYBG",
          "title": "Red (600)/Graphite 5X-Large Big",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07FSCVYBG?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Red (600)/Graphite"
            },
            {
              "name": "Size",
              "value": "5X-Large Big"
            }
          ]
        },
        {
          "asin": "B08FCYCM4J",
          "title": "Royal Blue (400)/Graphite Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B08FCYCM4J?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Royal Blue (400)/Graphite"
            },
            {
              "name": "Size",
              "value": "Large Tall"
            }
          ],
          "main_image": "https://m.media-amazon.com/images/I/719iOEPfCvL._AC_SL1500_.jpg",
          "images": [
            {
              "variant": "MAIN",
              "link": "https://m.media-amazon.com/images/I/719iOEPfCvL._AC_SL1500_.jpg"
            },
            {
              "variant": "PT01",
              "link": "https://m.media-amazon.com/images/I/71+tpxvWkOL._AC_SL1500_.jpg"
            },
            {
              "variant": "PT02",
              "link": "https://m.media-amazon.com/images/I/717IYYTXaJL._AC_SL1500_.jpg"
            },
            {
              "variant": "PT03",
              "link": "https://m.media-amazon.com/images/I/71UDnU0AKwL._AC_SL1500_.jpg"
            },
            {
              "variant": "PT99",
              "link": "https://m.media-amazon.com/images/I/51QFPByxEmL._AC_SL1000_.jpg"
            }
          ]
        },
        {
          "asin": "B09JT5TBWC",
          "title": "(810) Bolt Red / Chestnut Red / Black 4X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JT5TBWC?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(810) Bolt Red / Chestnut Red / Black"
            },
            {
              "name": "Size",
              "value": "4X-Large Tall"
            }
          ]
        },
        {
          "asin": "B093K7HDXV",
          "title": "Fresco Blue (481)/Academy XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093K7HDXV?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Fresco Blue (481)/Academy"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B09JNGTC7D",
          "title": "(390) Marine Od Green / / Black 3X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNGTC7D?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(390) Marine Od Green / / Black"
            },
            {
              "name": "Size",
              "value": "3X-Large Tall"
            }
          ]
        },
        {
          "asin": "B07FM45N9Z",
          "title": "Red (600)/Graphite Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07FM45N9Z?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Red (600)/Graphite"
            },
            {
              "name": "Size",
              "value": "Large Tall"
            }
          ]
        },
        {
          "asin": "B09JT49B28",
          "title": "(810) Bolt Red / Chestnut Red / Black Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JT49B28?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(810) Bolt Red / Chestnut Red / Black"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B093KF1N65",
          "title": "Black Rose (664)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B093KF1N65?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Black Rose (664)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B08LP1PD5H",
          "title": "Ash Plum (554)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B08LP1PD5H?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Ash Plum (554)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B09JNDMGHZ",
          "title": "(486) Versa Blue / / Black X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNDMGHZ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(486) Versa Blue / / Black"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B09JNHRNFP",
          "title": "(334) Key Lime / / Black 4X-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNHRNFP?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(334) Key Lime / / Black"
            },
            {
              "name": "Size",
              "value": "4X-Large Tall"
            }
          ]
        },
        {
          "asin": "B08LNZGXNJ",
          "title": "Radar Blue (422)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B08LNZGXNJ?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Radar Blue (422)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B07CZBYYFW",
          "title": "Orange Glitch (882)/Pitch Gray Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07CZBYYFW?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Orange Glitch (882)/Pitch Gray"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        },
        {
          "asin": "B0942VQB7C",
          "title": "Victory Blue (474)/Blue XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0942VQB7C?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Victory Blue (474)/Blue"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B09JNDPQD5",
          "title": "(390) Marine Od Green / / Black XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNDPQD5?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(390) Marine Od Green / / Black"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B07M6R7FR4",
          "title": "Carbon Heather (090)/Black 4X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07M6R7FR4?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Carbon Heather (090)/Black"
            },
            {
              "name": "Size",
              "value": "4X-Large"
            }
          ]
        },
        {
          "asin": "B0942XKT2Z",
          "title": "Victory Blue (474)/Blue Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0942XKT2Z?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Victory Blue (474)/Blue"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B07DGLCNG4",
          "title": "Academy (409)/Steel X-Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B07DGLCNG4?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Academy (409)/Steel"
            },
            {
              "name": "Size",
              "value": "X-Small"
            }
          ]
        },
        {
          "asin": "B077XQJTBS",
          "title": "Steel Light Heather (036)/Black XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B077XQJTBS?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Steel Light Heather (036)/Black"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B094314LLM",
          "title": "Penta Pink (975)/Black X-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B094314LLM?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Penta Pink (975)/Black"
            },
            {
              "name": "Size",
              "value": "X-Large"
            }
          ]
        },
        {
          "asin": "B0872D9JQV",
          "title": "Pink Shock (684)/Black Small",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B0872D9JQV?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Pink Shock (684)/Black"
            },
            {
              "name": "Size",
              "value": "Small"
            }
          ]
        },
        {
          "asin": "B09JNJBHR1",
          "title": "(486) Versa Blue / / Black XX-Large Tall",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JNJBHR1?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(486) Versa Blue / / Black"
            },
            {
              "name": "Size",
              "value": "XX-Large Tall"
            }
          ]
        },
        {
          "asin": "B09JT3MBCR",
          "title": "(810) Bolt Red / Chestnut Red / Black XX-Large",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B09JT3MBCR?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "(810) Bolt Red / Chestnut Red / Black"
            },
            {
              "name": "Size",
              "value": "XX-Large"
            }
          ]
        },
        {
          "asin": "B077XNW4S8",
          "title": "Steel Light Heather (036)/Black Medium",
          "is_current_product": false,
          "link": "https://www.amazon.com/dp/B077XNW4S8?th=1&psc=1",
          "dimensions": [
            {
              "name": "Color",
              "value": "Steel Light Heather (036)/Black"
            },
            {
              "name": "Size",
              "value": "Medium"
            }
          ]
        }
      ],
      "variant_asins_flat": "B077ZXTZ6Q,B093KJJ213,B093K2MFVN,B07814LVQK,B09JNDJ9MM,B093JZB7Q6,B07CZLNB31,B077XNMSPS,B07FSGQPZZ,B07RCZLLGR,B07RJ5T9CJ,B07CZBYQ3S,B077XQJT9G,B07FLV5Q4N,B07813WXR2,B08LP1JGY7,B09JNG7941,B093K86XFS,B0872DCD18,B07CZJK5GV,B093KGLMTQ,B07RJ5T9SL,B08LNZTFNH,B07815981V,B09JNDR2G9,B07815RZJT,B09JNHXZ5R,B0872F1VF6,B07RCZLLHP,B07CZJK5HJ,B09JNJZ3NP,B07814LW39,B09JNGRTHN,B07FSHPQTJ,B077ZXTZW5,B0943CB8DZ,B09JSZTSRD,B09JND8K3K,B07CZKSMCH,B09JNJFRCD,B093K2PBXF,B077XRHGWQ,B077ZXNXG8,B09JNDMNLS,B07815C5QP,B08LNYDDR6,B09JNGSGMS,B09JNDV6BH,B09JND2PPT,B07FSDBNFW,B08LNZJSVC,B093K88C6P,B095L1NDP9,B0872CTYXF,B07GJ1GXG1,B07815JCHQ,B07CZ99VVB,B077XQ7XFL,B07CZ99VVD,B0942RB1QW,B09JNKMB49,B07814BWCZ,B0872D9H98,B09JNFCM4T,B0943291GM,B09JNHYWNY,B07FLVKYDJ,B093QC4H1X,B0785VMVF4,B07CZBVMTM,B07CZCH8HJ,B07CZBZ2SQ,B07CZZMKXM,B07813TTTM,B07CZJSFWJ,B09JNJGV5Q,B0872DLWZG,B09JNFK56X,B093KBGFJV,B0942S5TZR,B07YXPHHNR,B07CZJ7DF8,B077XR6G2J,B07815S8J8,B093KHRXX2,B077XR6G2T,B07815BXKR,B07815RTCZ,B09JT49RKQ,B0785FSBT3,B08FD13Z77,B09JNFXSML,B07FSB2LK9,B0785W56Q3,B09JNG76ZV,B09JNDQHZD,B096MSG4L9,B07811X9SB,B07M6RT5PB,B07MF98NS8,B09JNJ1LRD,B0785X1LJM,B07811Z8ZV,B07D126W6P,B093KD7G4N,B093KBT41Q,B07CZYPYHW,B096MT49B7,B07CZJGDF5,B09JT3FKQ1,B09JNF2MRZ,B08LNZCRD8,B07CZJSFVG,B093KG3V8S,B07CZM1L1V,B093KF6LLJ,B0781383YP,B08LP1QP3P,B07CZFFVQN,B07D13B3N1,B07CZF6XTR,B07814L6HB,B093KBC8MD,B07CZMXW59,B09JNDMG1J,B07CZBVKKP,B09JNL25ZG,B093KG82TN,B093KJ4H7M,B077ZYG16L,B07CZMXWF6,B07MBHRL2J,B07CZMXW5H,B09JNGZHW3,B09JNHSRSJ,B09JNFYYY9,B0785VV446,B09JNF6B1Y,B0785FSBPY,B07815BPLM,B07CZCN13M,B093K84VBL,B07F9RQ12P,B095L1YRP6,B0785FWNL6,B0785FWNL5,B094369VJQ,B07813H28S,B09JNJPTGD,B08LNXMHMT,B07CZCCS7Z,B07CZCCS7X,B09JNG6YD8,B07CZLKDBP,B07CZ99XQ1,B08FCXBV23,B09JNHNZM5,B07814DWC6,B077XM8DDM,B0785WH7V1,B07GL5845P,B0942Y43S4,B07CZCHCFH,B0872D28V9,B077XNW5PB,B07814LBR9,B07YXLFYQ3,B0872DJM7S,B08LP14CJR,B093KDGQTS,B093K64L4P,B093K5HK3Y,B09JNCTZ4W,B093QMG46G,B093KFTG48,B09JNJ8JVP,B09JNF8QD1,B07CZM47W8,B07D13B3M6,B093KJ5Y2T,B07TKYB5JP,B09JNDWW94,B09JNHMXJJ,B093JZ2CQB,B093K2LSZN,B07CZKSMNY,B0872DJM72,B0785VXRX2,B09JT6JQJR,B07FRZKT6S,B07813H62D,B0942M3DSK,B077XNJPMS,B07FTV4C6T,B077XM3DV5,B08LP1P6P8,B0872DD1D8,B093K55MNY,B07RCZLLN3,B07SP8DHJN,B07CZK763S,B09JT4993W,B093K6C24M,B07M6RVY73,B07TLYNLK7,B0872F6VLT,B07Z8G86FT,B0872D218C,B09JNCNHQ6,B0781597ZY,B07815SGLL,B08LP11KTR,B07F9KQ4LN,B0785W9DZJ,B07FSDTB22,B09JNF1KH9,B07TLX1H5X,B077ZXTT3W,B07D123XY9,B09JND8F7W,B09JT6BN8Q,B07MF42D99,B093JY66ZG,B07CZBYYGM,B077XPFPD5,B08FCX4RX2,B09JT4QVTG,B07MPFKLFJ,B07CZL72D5,B0872DMLYH,B09JNK9C6D,B09JNFBTGV,B07RCJR2GH,B07GJ68J8W,B08FCXWVYT,B07815BYTV,B09JNF5PFZ,B0872CTYXV,B093QDRC82,B08LNZ9ZYJ,B08LNT4FLJ,B09JNHKS25,B09JNF6172,B077XN6789,B09JNDZFBZ,B093K3N912,B077ZXNCWP,B09JNG33Y7,B07RK9QJTW,B09JT45BQB,B09JNFX6LC,B0872DGKXH,B09JNG6W6M,B077XQ3L6G,B07RF1GX14,B09JNGRXFC,B077XNWC11,B093QDQRXG,B093K9DYT2,B09JNFLQ4Z,B08LNZ3XXM,B07DGLCM35,B0872DWKL3,B09JNG3832,B09JND2VY6,B0942M529Y,B09JNFNDG8,B093KMWX19,B0785J41PZ,B08LNZS9KY,B093KG1JPM,B0872DGG2H,B096MR1SB9,B093KHR1RK,B09JNF3916,B07815QHHK,B093KCKKGW,B07FSCVYBG,B08FCYCM4J,B09JT5TBWC,B093K7HDXV,B09JNGTC7D,B07FM45N9Z,B09JT49B28,B093KF1N65,B08LP1PD5H,B09JNDMGHZ,B09JNHRNFP,B08LNZGXNJ,B07CZBYYFW,B0942VQB7C,B09JNDPQD5,B07M6R7FR4,B0942XKT2Z,B07DGLCNG4,B077XQJTBS,B094314LLM,B0872D9JQV,B09JNJBHR1,B09JT3MBCR,B077XNW4S8",
      "documents": [
        {
          "name": "Size Guide (PDF)",
          "link": "https://m.media-amazon.com/images/I/81n7W0cnYzL.pdf"
        }
      ],
      "categories": [
        {
          "name": "All Departments"
        },
        {
          "name": "Clothing, Shoes & Jewelry",
          "link": "https://www.amazon.com/amazon-fashion/b/ref=dp_bc_aui_C_1?ie=UTF8&node=7141123011",
          "category_id": "7141123011"
        },
        {
          "name": "Men",
          "link": "https://www.amazon.com/Mens-Fashion/b/ref=dp_bc_aui_C_2?ie=UTF8&node=7147441011",
          "category_id": "7147441011"
        },
        {
          "name": "Clothing",
          "link": "https://www.amazon.com/Men-Clothing/b/ref=dp_bc_aui_C_3?ie=UTF8&node=1040658",
          "category_id": "1040658"
        },
        {
          "name": "Active",
          "link": "https://www.amazon.com/Mens-Activewear/b/ref=dp_bc_aui_C_4?ie=UTF8&node=3455821",
          "category_id": "3455821"
        },
        {
          "name": "Active Shirts & Tees",
          "link": "https://www.amazon.com/Mens-Activewear-Shirts/b/ref=dp_bc_aui_C_5?ie=UTF8&node=1046648",
          "category_id": "1046648"
        },
        {
          "name": "T-Shirts",
          "link": "https://www.amazon.com/b/ref=dp_bc_aui_C_6?ie=UTF8&node=23575646011",
          "category_id": "23575646011"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Men > Clothing > Active > Active Shirts & Tees > T-Shirts",
      "description": "UA Tech™ is our original go-to training gear: loose, light, and it keeps you cool. That's why this men's training T-shirt is everything you need. UA Tech™ fabric is quick-drying, ultra-soft & has a more natural feel. Material wicks sweat & dries really fast. New, streamlined fit & shaped hem. Loose: Fuller cut for complete comfort. 100% Polyester.",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media/vc/e6dd0aca-2483-41a8-8533-1ed29f077d31.__CR0,0,970,300_PT0_SX970_V1___.jpg",
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media/vc/e6dd0aca-2483-41a8-8533-1ed29f077d31.__CR0,0,970,300_PT0_SX970_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media/sota/124db55a-acba-4245-994d-d239b2c71b51.__CR0,0,970,300_PT0_SX970_V1___.png"
          ]
        },
        "third_party": true
      },
      "sub_title": {
        "text": "Visit the Under Armour Store",
        "link": "https://www.amazon.com/stores/UnderArmour/page/4750579C-0CF4-4BF9-B7E8-F782E52D7683?ref_=ast_bln"
      },
      "amazons_choice": {
        "keywords": "in Men's Activewear T-Shirts by Under Armour"
      },
      "rating": 4.6,
      "rating_breakdown": {
        "five_star": {
          "percentage": 76,
          "count": 55111
        },
        "four_star": {
          "percentage": 13,
          "count": 9426
        },
        "three_star": {
          "percentage": 5,
          "count": 3625
        },
        "two_star": {
          "percentage": 2,
          "count": 1450
        },
        "one_star": {
          "percentage": 3,
          "count": 2175
        }
      },
      "ratings_total": 72515,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/51lcBQJtssL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/51lcBQJtssL._AC_SL1000_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51yykKUpOqL._AC_SL1000_.jpg",
          "variant": "BACK"
        },
        {
          "link": "https://m.media-amazon.com/images/I/41UJH4evn0S._AC_SL1000_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51P7w8u7E-S._AC_SL1000_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/410vSnAd61S._AC_SL1000_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/4105oz5wDBS._AC_SL1000_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51QFPByxEmL._AC_SL1000_.jpg",
          "variant": "PT99"
        }
      ],
      "images_count": 7,
      "images_flat": "https://m.media-amazon.com/images/I/51lcBQJtssL._AC_SL1000_.jpg,https://m.media-amazon.com/images/I/51yykKUpOqL._AC_SL1000_.jpg,https://m.media-amazon.com/images/I/41UJH4evn0S._AC_SL1000_.jpg,https://m.media-amazon.com/images/I/51P7w8u7E-S._AC_SL1000_.jpg,https://m.media-amazon.com/images/I/410vSnAd61S._AC_SL1000_.jpg,https://m.media-amazon.com/images/I/4105oz5wDBS._AC_SL1000_.jpg,https://m.media-amazon.com/images/I/51QFPByxEmL._AC_SL1000_.jpg",
      "videos": [
        {
          "duration_seconds": 8,
          "width": 368,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/82ba5e3a-492e-4c0c-a491-27b841e93fb2/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/31Zi3xRAoLL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Under Armour Men's Tech 2.0 Short-Sleeve T-Shirt"
        }
      ],
      "videos_count": 1,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/82ba5e3a-492e-4c0c-a491-27b841e93fb2/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.078937cdb2bb4a2499f476d7e55b46f3",
          "product_asin": "B07815JCHQ",
          "parent_asin": "B0B96HTKQ4",
          "related_products": "B0785VMVF4, B07CZ99XQ1, B07CZBVKKP, B07815JCHQ, B07CZFFVQN",
          "sponsor_products": "true",
          "title": "Under Armour Men's Tech 2.0 Short-Sleeve T-Shirt",
          "public_name": "Merchant Video",
          "vendor_code": "V3MSA",
          "vendor_name": "Merchant Video",
          "video_image_id": "31Zi3xRAoLL",
          "video_image_url": "https://m.media-amazon.com/images/I/31Zi3xRAoLL._CR0,0,552,291_SR290,153_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/31Zi3xRAoLL.jpg",
          "video_image_width": "552",
          "video_image_height": "720",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/82ba5e3a-492e-4c0c-a491-27b841e93fb2/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/d44b31f0-9c7c-4ae4-b1b3-9bb7f739b39e/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:08",
          "type": "videos_for_this_product"
        }
      ],
      "is_bundle": false,
      "feature_bullets": [
        "100% Polyester",
        "Imported",
        "UA Tech fabric is quick-drying, ultra-soft & has a more natural feel",
        "Material wicks sweat & dries really fast",
        "New, streamlined fit & shaped hem",
        "Loose: Fuller cut for complete comfort"
      ],
      "feature_bullets_count": 6,
      "feature_bullets_flat": "Loose: Fuller cut for complete comfort. New, streamlined fit & shaped hem. Material wicks sweat & dries really fast. UA Tech fabric is quick-drying, ultra-soft & has a more natural feel. Imported. 100% Polyester.",
      "top_reviews": [
        {
          "id": "R1RJHKNKBHE8W8",
          "title": "Great shirt for workout or whenever",
          "body": "Just purchased 2 of these UA Tech 2.0 shirts in XL. They are a both a smooth, light weight polyester material but it seems different colors are made in different locations so there are some variances. One was made in El Salvador (dark grey) and feels just a bit heavier and fits more loosely than the other, which was made in Jordan (dark blue/white speckled look), and is a bit tighter but has a smoother feel to the material. That said, happy with both. Both fit more loosely than a compression style shirt but tighter than a standard T shirt and both come well below my waist and sit at the hips.Read more",
          "body_html": "<div data-a-expander-name=\"review_text_read_more\" data-a-expander-collapsed-height=\"300\" class=\"a-expander-collapsed-height a-row a-expander-container a-expander-partial-collapse-container\" style=\"max-height:300px\"><div data-hook=\"review-collapsed\" aria-expanded=\"false\" class=\"a-expander-content reviewText review-text-content a-expander-partial-collapse-content\">             <span>Just purchased 2 of these UA Tech 2.0 shirts in XL. They are a both a smooth, light weight polyester material but it seems different colors are made in different locations so there are some variances. One was made in El Salvador (dark grey) and feels just a bit heavier and fits more loosely than the other, which was made in Jordan (dark blue/white speckled look), and is a bit tighter but has a smoother feel to the material. That said, happy with both. Both fit more loosely than a compression style shirt but tighter than a standard T shirt and both come well below my waist and sit at the hips.</span>   </div><div class=\"a-expander-header a-expander-partial-collapse-header\"><div class=\"a-expander-content-fade\"></div><a href=\"javascript:void(0)\" data-csa-c-func-deps=\"aui-da-a-expander-toggle\" data-csa-c-type=\"widget\" data-csa-interaction-events=\"click\" data-hook=\"expand-collapse-read-more-less\" aria-label=\"Toggle full review text\" aria-expanded=\"false\" role=\"button\" data-action=\"a-expander-toggle\" class=\"a-declarative\" data-a-expander-toggle=\"{&quot;allowLinkDefault&quot;:true, &quot;expand_prompt&quot;:&quot;Read more&quot;, &quot;collapse_prompt&quot;:&quot;Read less&quot;}\"><i class=\"a-icon a-icon-extender-expand\"></i><span class=\"a-expander-prompt\">Read more</span></a></div></div>",
          "link": "https://www.amazon.com/gp/customer-reviews/R1RJHKNKBHE8W8/ref=cm_cr_dp_d_rvw_ttl?ie=UTF8&ASIN=B07815JCHQ",
          "rating": 5,
          "date": {
            "raw": "Reviewed in the United States on August 19, 2022",
            "utc": "2022-08-19T00:00:00.000Z"
          },
          "profile": {
            "name": "Donny",
            "link": "https://www.amazon.com/gp/profile/amzn1.account.AFPZ42KEYKU2XVPDAYLRI5M6MRXA/ref=cm_cr_dp_d_gw_tr?ie=UTF8",
            "id": "AFPZ42KEYKU2XVPDAYLRI5M6MRXA"
          },
          "vine_program": false,
          "verified_purchase": true,
          "review_country": "us",
          "is_global_review": false
        },
        {
          "id": "R2SLVOYMGBSUL5",
          "title": "Super breathable!",
          "body": "Bought 2 at Dick's then had to order another color here on Amazon. With the SPF and breathability, these shirts are perfect for summers in Miami. I ordered the Rise/Black (782) and the shirt is actually Orange (with hints of Yellow). For some reason the color on the model for this looks black - but I included a photo so you could see it's Orange (which is what I wanted). I'm very happy that Amazon has so many colors to chose from - am going to order another color now - my new #1 overall workout shirt!Read more",
          "body_html": "<div data-a-expander-name=\"review_text_read_more\" data-a-expander-collapsed-height=\"300\" class=\"a-expander-collapsed-height a-row a-expander-container a-expander-partial-collapse-container\" style=\"max-height:300px\"><div data-hook=\"review-collapsed\" aria-expanded=\"false\" class=\"a-expander-content reviewText review-text-content a-expander-partial-collapse-content\">             <span>Bought 2 at Dick's then had to order another color here on Amazon. With the SPF and breathability, these shirts are perfect for summers in Miami. I ordered the Rise/Black (782) and the shirt is actually Orange (with hints of Yellow). For some reason the color on the model for this looks black - but I included a photo so you could see it's Orange (which is what I wanted). I'm very happy that Amazon has so many colors to chose from - am going to order another color now - my new #1 overall workout shirt!</span>   </div><div class=\"a-expander-header a-expander-partial-collapse-header\"><div class=\"a-expander-content-fade\"></div><a href=\"javascript:void(0)\" data-csa-c-func-deps=\"aui-da-a-expander-toggle\" data-csa-c-type=\"widget\" data-csa-interaction-events=\"click\" data-hook=\"expand-collapse-read-more-less\" aria-label=\"Toggle full review text\" aria-expanded=\"false\" role=\"button\" data-action=\"a-expander-toggle\" class=\"a-declarative\" data-a-expander-toggle=\"{&quot;allowLinkDefault&quot;:true, &quot;expand_prompt&quot;:&quot;Read more&quot;, &quot;collapse_prompt&quot;:&quot;Read less&quot;}\"><i class=\"a-icon a-icon-extender-expand\"></i><span class=\"a-expander-prompt\">Read more</span></a></div></div>",
          "link": "https://www.amazon.com/gp/customer-reviews/R2SLVOYMGBSUL5/ref=cm_cr_dp_d_rvw_ttl?ie=UTF8&ASIN=B07815JCHQ",
          "rating": 5,
          "date": {
            "raw": "Reviewed in the United States on August 9, 2022",
            "utc": "2022-08-09T00:00:00.000Z"
          },
          "profile": {
            "name": "Mike",
            "link": "https://www.amazon.com/gp/profile/amzn1.account.AHH6MPEZCEGKJ27N4SMWYUTGEC5A/ref=cm_cr_dp_d_gw_tr?ie=UTF8",
            "id": "AHH6MPEZCEGKJ27N4SMWYUTGEC5A"
          },
          "vine_program": false,
          "verified_purchase": true,
          "images": [
            {
              "link": "https://images-na.ssl-images-amazon.com/images/G/01/x-locale/common/grey-pixel.gif"
            }
          ],
          "review_country": "us",
          "is_global_review": false
        },
        {
          "id": "R2LGCNAOR3IBX4",
          "title": "Very Comfortable Shirt",
          "body": "My wife was searching for lightweight short sleeve shirts for me online and found this one. It's lightweight, and she washes it by hand in the sink, hangs it up to to drip dry in the shower then hangs it up over a hook on the bedroom door. She has a table fan so she turns it on high setting and points it close to the shirt. It not only drys quickly, but adds needed moisture in the air in our apartment. This shirt requires no ironing. We're both in our senior years and can't physically do as much as we used to so ironing is a chore. I've worn this shirt many times and love this shirt. Feels good against my skin! Highly recommend it!Read more",
          "body_html": "<div data-a-expander-name=\"review_text_read_more\" data-a-expander-collapsed-height=\"300\" class=\"a-expander-collapsed-height a-row a-expander-container a-expander-partial-collapse-container\" style=\"max-height:300px\"><div data-hook=\"review-collapsed\" aria-expanded=\"false\" class=\"a-expander-content reviewText review-text-content a-expander-partial-collapse-content\">             <span>My wife was searching for lightweight short sleeve shirts for me online and found this one. It's lightweight, and she washes it by hand in the sink, hangs it up to to drip dry in the shower then hangs it up over a hook on the bedroom door. She has a table fan so she turns it on high setting and points it close to the shirt. It not only drys quickly, but adds needed moisture in the air in our apartment. This shirt requires no ironing. We're both in our senior years and can't physically do as much as we used to so ironing is a chore. I've worn this shirt many times and love this shirt. Feels good against my skin! Highly recommend it!</span>   </div><div class=\"a-expander-header a-expander-partial-collapse-header\"><div class=\"a-expander-content-fade\"></div><a href=\"javascript:void(0)\" data-csa-c-func-deps=\"aui-da-a-expander-toggle\" data-csa-c-type=\"widget\" data-csa-interaction-events=\"click\" data-hook=\"expand-collapse-read-more-less\" aria-label=\"Toggle full review text\" aria-expanded=\"false\" role=\"button\" data-action=\"a-expander-toggle\" class=\"a-declarative\" data-a-expander-toggle=\"{&quot;allowLinkDefault&quot;:true, &quot;expand_prompt&quot;:&quot;Read more&quot;, &quot;collapse_prompt&quot;:&quot;Read less&quot;}\"><i class=\"a-icon a-icon-extender-expand\"></i><span class=\"a-expander-prompt\">Read more</span></a></div></div>",
          "link": "https://www.amazon.com/gp/customer-reviews/R2LGCNAOR3IBX4/ref=cm_cr_dp_d_rvw_ttl?ie=UTF8&ASIN=B07815JCHQ",
          "rating": 5,
          "date": {
            "raw": "Reviewed in the United States on July 19, 2022",
            "utc": "2022-07-19T00:00:00.000Z"
          },
          "profile": {
            "name": "MAMA FELICE",
            "link": "https://www.amazon.com/gp/profile/amzn1.account.AH6NM6KHBBTJMROCZOQH5NL5MA5Q/ref=cm_cr_dp_d_gw_tr?ie=UTF8",
            "id": "AH6NM6KHBBTJMROCZOQH5NL5MA5Q"
          },
          "vine_program": false,
          "verified_purchase": true,
          "review_country": "us",
          "is_global_review": false
        },
        {
          "id": "R3S5QAONM2IZGX",
          "title": "Good for the money",
          "body": "Light and moisture wicking. Athletic fit, but allows some room in abdomen for those lacking a six pack. I have not had any chafing problems even on long runs (10-13 miles).Read more",
          "body_html": "<div data-a-expander-name=\"review_text_read_more\" data-a-expander-collapsed-height=\"300\" class=\"a-expander-collapsed-height a-row a-expander-container a-expander-partial-collapse-container\" style=\"max-height:300px\"><div data-hook=\"review-collapsed\" aria-expanded=\"false\" class=\"a-expander-content reviewText review-text-content a-expander-partial-collapse-content\">             <span>Light and moisture wicking. Athletic fit, but allows some room in abdomen for those lacking a six pack. I have not had any chafing problems even on long runs (10-13 miles).</span>   </div><div class=\"a-expander-header a-expander-partial-collapse-header\"><div class=\"a-expander-content-fade\"></div><a href=\"javascript:void(0)\" data-csa-c-func-deps=\"aui-da-a-expander-toggle\" data-csa-c-type=\"widget\" data-csa-interaction-events=\"click\" data-hook=\"expand-collapse-read-more-less\" aria-label=\"Toggle full review text\" aria-expanded=\"false\" role=\"button\" data-action=\"a-expander-toggle\" class=\"a-declarative\" data-a-expander-toggle=\"{&quot;allowLinkDefault&quot;:true, &quot;expand_prompt&quot;:&quot;Read more&quot;, &quot;collapse_prompt&quot;:&quot;Read less&quot;}\"><i class=\"a-icon a-icon-extender-expand\"></i><span class=\"a-expander-prompt\">Read more</span></a></div></div>",
          "link": "https://www.amazon.com/gp/customer-reviews/R3S5QAONM2IZGX/ref=cm_cr_dp_d_rvw_ttl?ie=UTF8&ASIN=B07815JCHQ",
          "rating": 5,
          "date": {
            "raw": "Reviewed in the United States on August 20, 2022",
            "utc": "2022-08-20T00:00:00.000Z"
          },
          "profile": {
            "name": "Pully",
            "link": "https://www.amazon.com/gp/profile/amzn1.account.AFTVX7G366MX4WPMR4T3OSKGXU6Q/ref=cm_cr_dp_d_gw_tr?ie=UTF8",
            "id": "AFTVX7G366MX4WPMR4T3OSKGXU6Q"
          },
          "vine_program": false,
          "verified_purchase": true,
          "review_country": "us",
          "is_global_review": false
        },
        {
          "id": "R1PDFI285B1GS7",
          "title": "shirt made from Thin fabric, length a tad bit short",
          "body": "Pros: This product is on of the best fitting shirts for the chest area. The shirt shows off the arms really well.  Cons: the fabric is thin. Seems like a shirt that you would only wear it to the gym and not on a hike to prevent it from getting caught on something causing it to rip. The shirt just barely goes over the belt line. Lifting arms may cause stomach to show.Read more",
          "body_html": "<div data-a-expander-name=\"review_text_read_more\" data-a-expander-collapsed-height=\"300\" class=\"a-expander-collapsed-height a-row a-expander-container a-expander-partial-collapse-container\" style=\"max-height:300px\"><div data-hook=\"review-collapsed\" aria-expanded=\"false\" class=\"a-expander-content reviewText review-text-content a-expander-partial-collapse-content\">             <span>Pros: This product is on of the best fitting shirts for the chest area. The shirt shows off the arms really well.<br><br>Cons: the fabric is thin. Seems like a shirt that you would only wear it to the gym and not on a hike to prevent it from getting caught on something causing it to rip. The shirt just barely goes over the belt line. Lifting arms may cause stomach to show.</span>   </div><div class=\"a-expander-header a-expander-partial-collapse-header\"><div class=\"a-expander-content-fade\"></div><a href=\"javascript:void(0)\" data-csa-c-func-deps=\"aui-da-a-expander-toggle\" data-csa-c-type=\"widget\" data-csa-interaction-events=\"click\" data-hook=\"expand-collapse-read-more-less\" aria-label=\"Toggle full review text\" aria-expanded=\"false\" role=\"button\" data-action=\"a-expander-toggle\" class=\"a-declarative\" data-a-expander-toggle=\"{&quot;allowLinkDefault&quot;:true, &quot;expand_prompt&quot;:&quot;Read more&quot;, &quot;collapse_prompt&quot;:&quot;Read less&quot;}\"><i class=\"a-icon a-icon-extender-expand\"></i><span class=\"a-expander-prompt\">Read more</span></a></div></div>",
          "link": "https://www.amazon.com/gp/customer-reviews/R1PDFI285B1GS7/ref=cm_cr_dp_d_rvw_ttl?ie=UTF8&ASIN=B07815JCHQ",
          "rating": 4,
          "date": {
            "raw": "Reviewed in the United States on August 5, 2022",
            "utc": "2022-08-05T00:00:00.000Z"
          },
          "profile": {
            "name": "Alexno",
            "link": "https://www.amazon.com/gp/profile/amzn1.account.AGPXHW35VFJQYCYI5XJPFNSMJQHA/ref=cm_cr_dp_d_gw_tr?ie=UTF8",
            "id": "AGPXHW35VFJQYCYI5XJPFNSMJQHA"
          },
          "vine_program": false,
          "verified_purchase": true,
          "review_country": "us",
          "is_global_review": false
        },
        {
          "id": "R1TTOUEH8C3M1A",
          "title": "These are great",
          "body": "They feel a lot lighter on than when you take them out of the package. Opening them up I thought I'd be disappointed. I was way wrong. I ordered a 3X Tall. I like the tall sizes for the extra length. It's almost like it's cooler to wear these than it is to wear nothing. Air blows right through these shirts and really help to cool you down. I ordered 2, and ordered 2 more minutes later! They're really hard to describe. Heavier fabric, but very lightweight. I'll be wearing these in a rotation all summer.Read more",
          "body_html": "<div data-a-expander-name=\"review_text_read_more\" data-a-expander-collapsed-height=\"300\" class=\"a-expander-collapsed-height a-row a-expander-container a-expander-partial-collapse-container\" style=\"max-height:300px\"><div data-hook=\"review-collapsed\" aria-expanded=\"false\" class=\"a-expander-content reviewText review-text-content a-expander-partial-collapse-content\">             <span>They feel a lot lighter on than when you take them out of the package. Opening them up I thought I'd be disappointed. I was way wrong. I ordered a 3X Tall. I like the tall sizes for the extra length. It's almost like it's cooler to wear these than it is to wear nothing. Air blows right through these shirts and really help to cool you down. I ordered 2, and ordered 2 more minutes later! They're really hard to describe. Heavier fabric, but very lightweight. I'll be wearing these in a rotation all summer.</span>   </div><div class=\"a-expander-header a-expander-partial-collapse-header\"><div class=\"a-expander-content-fade\"></div><a href=\"javascript:void(0)\" data-csa-c-func-deps=\"aui-da-a-expander-toggle\" data-csa-c-type=\"widget\" data-csa-interaction-events=\"click\" data-hook=\"expand-collapse-read-more-less\" aria-label=\"Toggle full review text\" aria-expanded=\"false\" role=\"button\" data-action=\"a-expander-toggle\" class=\"a-declarative\" data-a-expander-toggle=\"{&quot;allowLinkDefault&quot;:true, &quot;expand_prompt&quot;:&quot;Read more&quot;, &quot;collapse_prompt&quot;:&quot;Read less&quot;}\"><i class=\"a-icon a-icon-extender-expand\"></i><span class=\"a-expander-prompt\">Read more</span></a></div></div>",
          "link": "https://www.amazon.com/gp/customer-reviews/R1TTOUEH8C3M1A/ref=cm_cr_dp_d_rvw_ttl?ie=UTF8&ASIN=B07815JCHQ",
          "rating": 5,
          "date": {
            "raw": "Reviewed in the United States on July 18, 2022",
            "utc": "2022-07-18T00:00:00.000Z"
          },
          "profile": {
            "name": "Michael Troy",
            "link": "https://www.amazon.com/gp/profile/amzn1.account.AHIPXHKUB3THZMSCBAAM2RAX7OVQ/ref=cm_cr_dp_d_gw_tr?ie=UTF8",
            "id": "AHIPXHKUB3THZMSCBAAM2RAX7OVQ",
            "image": "https://images-na.ssl-images-amazon.com/images/S/amazon-avatars-global/1b957684-06ed-4b90-8350-d9f99c994b10._CR0,26.0,281,281_SX48_.jpg"
          },
          "vine_program": false,
          "verified_purchase": true,
          "images": [
            {
              "link": "https://images-na.ssl-images-amazon.com/images/G/01/x-locale/common/grey-pixel.gif"
            }
          ],
          "review_country": "us",
          "is_global_review": false
        },
        {
          "id": "R2D9G2LGZ0K4T1",
          "title": "Great for Summertime",
          "body": "These shirts are a bit thin, but they are lightweight and cool, hubby loves them. They hold up well in the wash...better than expected! They have tall sizes which is perfect and hard to find...I have already ordered more and would highly recommend!Read more",
          "body_html": "<div data-a-expander-name=\"review_text_read_more\" data-a-expander-collapsed-height=\"300\" class=\"a-expander-collapsed-height a-row a-expander-container a-expander-partial-collapse-container\" style=\"max-height:300px\"><div data-hook=\"review-collapsed\" aria-expanded=\"false\" class=\"a-expander-content reviewText review-text-content a-expander-partial-collapse-content\">             <span>These shirts are a bit thin, but they are lightweight and cool, hubby loves them. They hold up well in the wash...better than expected! They have tall sizes which is perfect and hard to find...I have already ordered more and would highly recommend!</span>   </div><div class=\"a-expander-header a-expander-partial-collapse-header\"><div class=\"a-expander-content-fade\"></div><a href=\"javascript:void(0)\" data-csa-c-func-deps=\"aui-da-a-expander-toggle\" data-csa-c-type=\"widget\" data-csa-interaction-events=\"click\" data-hook=\"expand-collapse-read-more-less\" aria-label=\"Toggle full review text\" aria-expanded=\"false\" role=\"button\" data-action=\"a-expander-toggle\" class=\"a-declarative\" data-a-expander-toggle=\"{&quot;allowLinkDefault&quot;:true, &quot;expand_prompt&quot;:&quot;Read more&quot;, &quot;collapse_prompt&quot;:&quot;Read less&quot;}\"><i class=\"a-icon a-icon-extender-expand\"></i><span class=\"a-expander-prompt\">Read more</span></a></div></div>",
          "link": "https://www.amazon.com/gp/customer-reviews/R2D9G2LGZ0K4T1/ref=cm_cr_dp_d_rvw_ttl?ie=UTF8&ASIN=B07815JCHQ",
          "rating": 5,
          "date": {
            "raw": "Reviewed in the United States on August 6, 2022",
            "utc": "2022-08-06T00:00:00.000Z"
          },
          "profile": {
            "name": "Jeanine",
            "link": "https://www.amazon.com/gp/profile/amzn1.account.AHXT6NNW2A4AZ3FA2ACEHCAVAIEA/ref=cm_cr_dp_d_gw_tr?ie=UTF8",
            "id": "AHXT6NNW2A4AZ3FA2ACEHCAVAIEA"
          },
          "vine_program": false,
          "verified_purchase": true,
          "review_country": "us",
          "is_global_review": false
        },
        {
          "id": "RFXMJK9HEC0IQ",
          "title": "Shirts very small",
          "body": "I ordered a 4X because I like loose shirts to work in. This product was very small. Almost like a 2XRead more",
          "body_html": "<div data-a-expander-name=\"review_text_read_more\" data-a-expander-collapsed-height=\"300\" class=\"a-expander-collapsed-height a-row a-expander-container a-expander-partial-collapse-container\" style=\"max-height:300px\"><div data-hook=\"review-collapsed\" aria-expanded=\"false\" class=\"a-expander-content reviewText review-text-content a-expander-partial-collapse-content\">             <span>I ordered a 4X because I like loose shirts to work in. This product was very small. Almost like a 2X</span>   </div><div class=\"a-expander-header a-expander-partial-collapse-header\"><div class=\"a-expander-content-fade\"></div><a href=\"javascript:void(0)\" data-csa-c-func-deps=\"aui-da-a-expander-toggle\" data-csa-c-type=\"widget\" data-csa-interaction-events=\"click\" data-hook=\"expand-collapse-read-more-less\" aria-label=\"Toggle full review text\" aria-expanded=\"false\" role=\"button\" data-action=\"a-expander-toggle\" class=\"a-declarative\" data-a-expander-toggle=\"{&quot;allowLinkDefault&quot;:true, &quot;expand_prompt&quot;:&quot;Read more&quot;, &quot;collapse_prompt&quot;:&quot;Read less&quot;}\"><i class=\"a-icon a-icon-extender-expand\"></i><span class=\"a-expander-prompt\">Read more</span></a></div></div>",
          "link": "https://www.amazon.com/gp/customer-reviews/RFXMJK9HEC0IQ/ref=cm_cr_dp_d_rvw_ttl?ie=UTF8&ASIN=B07815JCHQ",
          "rating": 4,
          "date": {
            "raw": "Reviewed in the United States on August 16, 2022",
            "utc": "2022-08-16T00:00:00.000Z"
          },
          "profile": {
            "name": "Mac",
            "link": "https://www.amazon.com/gp/profile/amzn1.account.AFI3UIIYCBMBKYPWPSWBMQIL54OQ/ref=cm_cr_dp_d_gw_tr?ie=UTF8",
            "id": "AFI3UIIYCBMBKYPWPSWBMQIL54OQ"
          },
          "vine_program": false,
          "verified_purchase": true,
          "review_country": "us",
          "is_global_review": false
        },
        {
          "id": "R3I009SMP3LU2E",
          "title": "Poorly made",
          "body": "Extremely disappointed with this t-shirt. I purchased the exact same t-shirt from Under Armour directly a couple of years ago, so wanted to get another one for work outs. I could already feel the difference in material. The one from Amazon (purchased direct from Amazon not a seller) has creases already which the one I purchased previously wouldn't. Even the logo is different. My one purchased previously has a raised logo whereas the Amazon one is flat.  Makes me wonder if this is fake or just the ones made for Europe are of a much lower quality.  Pay a little more and buy direct. Will be returning this top for a refund for sure.Read more",
          "body_html": "<div data-a-expander-name=\"review_text_read_more\" data-a-expander-collapsed-height=\"300\" class=\"a-expander-collapsed-height a-row a-expander-container a-expander-partial-collapse-container\" style=\"max-height:300px\"><div data-hook=\"review-collapsed\" aria-expanded=\"false\" class=\"a-expander-content reviewText review-text-content a-expander-partial-collapse-content\">             <span>Extremely disappointed with this t-shirt. I purchased the exact same t-shirt from Under Armour directly a couple of years ago, so wanted to get another one for work outs. I could already feel the difference in material. The one from Amazon (purchased direct from Amazon not a seller) has creases already which the one I purchased previously wouldn't. Even the logo is different. My one purchased previously has a raised logo whereas the Amazon one is flat.<br><br>Makes me wonder if this is fake or just the ones made for Europe are of a much lower quality.<br><br>Pay a little more and buy direct. Will be returning this top for a refund for sure.</span>   </div><div class=\"a-expander-header a-expander-partial-collapse-header\"><div class=\"a-expander-content-fade\"></div><a href=\"javascript:void(0)\" data-csa-c-func-deps=\"aui-da-a-expander-toggle\" data-csa-c-type=\"widget\" data-csa-interaction-events=\"click\" data-hook=\"expand-collapse-read-more-less\" aria-label=\"Toggle full review text\" aria-expanded=\"false\" role=\"button\" data-action=\"a-expander-toggle\" class=\"a-declarative\" data-a-expander-toggle=\"{&quot;allowLinkDefault&quot;:true, &quot;expand_prompt&quot;:&quot;Read more&quot;, &quot;collapse_prompt&quot;:&quot;Read less&quot;}\"><i class=\"a-icon a-icon-extender-expand\"></i><span class=\"a-expander-prompt\">Read more</span></a></div></div>",
          "rating": 1,
          "date": {
            "raw": "Reviewed in the United Kingdom on May 27, 2021",
            "utc": "2021-05-27T00:00:00.000Z"
          },
          "profile": {
            "name": "Chiky"
          },
          "vine_program": false,
          "verified_purchase": true,
          "helpful_votes": 14,
          "review_country": "gb",
          "is_global_review": true
        },
        {
          "id": "R1MQLZ1Z3DAK1E",
          "title": "Nice top but not the normal 'loose fit' from Under Armour",
          "body": "I have a quite a few Under Armour tee shirts including the previous version of Tech Tee ,as can be found on this page https://www.amazon.co.uk/Under-Armour-Mens-Tech-T-Shirt/dp/B007F3FI1Q/, I buy a medium in these tops due to being a loose fit so did so again but this time as directed by Amazon's 'there is a newer version' link on that page which brought me to this model.  The problem is it is as if I have been sent an xs as this top is far too small and over tight. There's no elasticity in the material unlike EU Tech version (see link below) either so my biceps feel as if I am wearing occlusion straps on. Plus there is the wrinkling across the shoulders and back due to being too tight in places. The waist is fine but the top is a no no. Getting of the tee is a job and half.  For comparisons this model, which was the best range with silkier material type, (https://www.amazon.co.uk/gp/product/B00584NAA0) which is a regular fit I have room in a Large but it defines my muscular upper body better without any over stretching of material or being tight.  Thankfully bought direct from Amazon so their no hassle customer-centric service makes sending back a breeze so I can reorder the next size up. Just hope the waist doesn't balloon much going up a size.  Edit: Just taken delivery of a medium size in the red colour from this page and unlike the white version it does fit a whole lot better and does have some elasticity to the material. Still not as loose as the previous tech tee (mk1) that I have in blue, white, navy and red. Regardless of model/version, it seems that Under Armour has no consistency in material weave or fit as every tee from each of the respective models are slightly different in size and shape to one another which is rather odd.  Ordered a couple of academy/graphite tees, not the dark navy that I previously had from this product page. Seems somewhere a blue with a hint of jade is the new navy. Another annoying thing is the size sticker, leaves a horrible residue on the material which from another purchase causes some bubbling when it is rubbed off and even after a wash is still there.Read more",
          "body_html": "<div data-a-expander-name=\"review_text_read_more\" data-a-expander-collapsed-height=\"300\" class=\"a-expander-collapsed-height a-row a-expander-container a-expander-partial-collapse-container\" style=\"max-height:300px\"><div data-hook=\"review-collapsed\" aria-expanded=\"false\" class=\"a-expander-content reviewText review-text-content a-expander-partial-collapse-content\">             <span>I have a quite a few Under Armour tee shirts including the previous version of Tech Tee ,as can be found on this page https://www.amazon.co.uk/Under-Armour-Mens-Tech-T-Shirt/dp/B007F3FI1Q/, I buy a medium in these tops due to being a loose fit so did so again but this time as directed by Amazon's 'there is a newer version' link on that page which brought me to this model.<br><br>The problem is it is as if I have been sent an xs as this top is far too small and over tight. There's no elasticity in the material unlike EU Tech version (see link below) either so my biceps feel as if I am wearing occlusion straps on. Plus there is the wrinkling across the shoulders and back due to being too tight in places. The waist is fine but the top is a no no. Getting of the tee is a job and half.<br><br>For comparisons this model, which was the best range with silkier material type, (https://www.amazon.co.uk/gp/product/B00584NAA0) which is a regular fit I have room in a Large but it defines my muscular upper body better without any over stretching of material or being tight.<br><br>Thankfully bought direct from Amazon so their no hassle customer-centric service makes sending back a breeze so I can reorder the next size up. Just hope the waist doesn't balloon much going up a size.<br><br>Edit: Just taken delivery of a medium size in the red colour from this page and unlike the white version it does fit a whole lot better and does have some elasticity to the material. Still not as loose as the previous tech tee (mk1) that I have in blue, white, navy and red. Regardless of model/version, it seems that Under Armour has no consistency in material weave or fit as every tee from each of the respective models are slightly different in size and shape to one another which is rather odd.<br><br>Ordered a couple of academy/graphite tees, not the dark navy that I previously had from this product page. Seems somewhere a blue with a hint of jade is the new navy. Another annoying thing is the size sticker, leaves a horrible residue on the material which from another purchase causes some bubbling when it is rubbed off and even after a wash is still there.</span>   </div><div class=\"a-expander-header a-expander-partial-collapse-header\"><div class=\"a-expander-content-fade\"></div><a href=\"javascript:void(0)\" data-csa-c-func-deps=\"aui-da-a-expander-toggle\" data-csa-c-type=\"widget\" data-csa-interaction-events=\"click\" data-hook=\"expand-collapse-read-more-less\" aria-label=\"Toggle full review text\" aria-expanded=\"false\" role=\"button\" data-action=\"a-expander-toggle\" class=\"a-declarative\" data-a-expander-toggle=\"{&quot;allowLinkDefault&quot;:true, &quot;expand_prompt&quot;:&quot;Read more&quot;, &quot;collapse_prompt&quot;:&quot;Read less&quot;}\"><i class=\"a-icon a-icon-extender-expand\"></i><span class=\"a-expander-prompt\">Read more</span></a></div></div>",
          "rating": 3,
          "date": {
            "raw": "Reviewed in the United Kingdom on October 30, 2018",
            "utc": "2018-10-30T00:00:00.000Z"
          },
          "profile": {
            "name": "Mr H. Jaass",
            "image": "https://images-eu.ssl-images-amazon.com/images/S/amazon-avatars-global/7cacd513-8b4d-412b-a93b-f52149e5d178._CR0,0,498,498_SX48_.jpg"
          },
          "vine_program": false,
          "verified_purchase": true,
          "helpful_votes": 18,
          "review_country": "gb",
          "is_global_review": true
        },
        {
          "id": "R5XXRXA4SPOVC",
          "title": "Bad",
          "body": "I brought my first under amour t shirt a couple of days ago, when I opened the wrapper I noticed there was a sizing sticker on the front of the shirt, when I tried to peel this off it left a strip of adhesive and has damaged the fabric, I ordered a replacement and it has come with the same sticker, so I tried to remove it and it left the same adhesive and damage to the fabric. I would like another one to be sent out and please stop sticking the sizing sticker on the shirt as this will keep leaving the adhesive and damaging the shirt.Read more",
          "body_html": "<div data-a-expander-name=\"review_text_read_more\" data-a-expander-collapsed-height=\"300\" class=\"a-expander-collapsed-height a-row a-expander-container a-expander-partial-collapse-container\" style=\"max-height:300px\"><div data-hook=\"review-collapsed\" aria-expanded=\"false\" class=\"a-expander-content reviewText review-text-content a-expander-partial-collapse-content\">             <span>I brought my first under amour t shirt a couple of days ago, when I opened the wrapper I noticed there was a sizing sticker on the front of the shirt, when I tried to peel this off it left a strip of adhesive and has damaged the fabric, I ordered a replacement and it has come with the same sticker, so I tried to remove it and it left the same adhesive and damage to the fabric.<br>I would like another one to be sent out and please stop sticking the sizing sticker on the shirt as this will keep leaving the adhesive and damaging the shirt.</span>   </div><div class=\"a-expander-header a-expander-partial-collapse-header\"><div class=\"a-expander-content-fade\"></div><a href=\"javascript:void(0)\" data-csa-c-func-deps=\"aui-da-a-expander-toggle\" data-csa-c-type=\"widget\" data-csa-interaction-events=\"click\" data-hook=\"expand-collapse-read-more-less\" aria-label=\"Toggle full review text\" aria-expanded=\"false\" role=\"button\" data-action=\"a-expander-toggle\" class=\"a-declarative\" data-a-expander-toggle=\"{&quot;allowLinkDefault&quot;:true, &quot;expand_prompt&quot;:&quot;Read more&quot;, &quot;collapse_prompt&quot;:&quot;Read less&quot;}\"><i class=\"a-icon a-icon-extender-expand\"></i><span class=\"a-expander-prompt\">Read more</span></a></div></div>",
          "rating": 1,
          "date": {
            "raw": "Reviewed in the United Kingdom on June 9, 2021",
            "utc": "2021-06-09T00:00:00.000Z"
          },
          "profile": {
            "name": "Jake"
          },
          "vine_program": false,
          "verified_purchase": true,
          "helpful_votes": 10,
          "review_country": "gb",
          "is_global_review": true
        },
        {
          "id": "RJR77AJCKKUQW",
          "title": "Great for the gym",
          "body": "Having started the gym a year ago - I have to say my favourite t shirts for working out are under armour - good quality for wash after wash - easy for the sweat to evaporate - and very comfortable. Definitely recommended.Read more",
          "body_html": "<div data-a-expander-name=\"review_text_read_more\" data-a-expander-collapsed-height=\"300\" class=\"a-expander-collapsed-height a-row a-expander-container a-expander-partial-collapse-container\" style=\"max-height:300px\"><div data-hook=\"review-collapsed\" aria-expanded=\"false\" class=\"a-expander-content reviewText review-text-content a-expander-partial-collapse-content\">             <span>Having started the gym a year ago - I have to say my favourite t shirts for working out are under armour - good quality for wash after wash - easy for the sweat to evaporate - and very comfortable. Definitely recommended.</span>   </div><div class=\"a-expander-header a-expander-partial-collapse-header\"><div class=\"a-expander-content-fade\"></div><a href=\"javascript:void(0)\" data-csa-c-func-deps=\"aui-da-a-expander-toggle\" data-csa-c-type=\"widget\" data-csa-interaction-events=\"click\" data-hook=\"expand-collapse-read-more-less\" aria-label=\"Toggle full review text\" aria-expanded=\"false\" role=\"button\" data-action=\"a-expander-toggle\" class=\"a-declarative\" data-a-expander-toggle=\"{&quot;allowLinkDefault&quot;:true, &quot;expand_prompt&quot;:&quot;Read more&quot;, &quot;collapse_prompt&quot;:&quot;Read less&quot;}\"><i class=\"a-icon a-icon-extender-expand\"></i><span class=\"a-expander-prompt\">Read more</span></a></div></div>",
          "rating": 5,
          "date": {
            "raw": "Reviewed in the United Kingdom on June 1, 2019",
            "utc": "2019-06-01T00:00:00.000Z"
          },
          "profile": {
            "name": "cymruchris",
            "image": "https://images-eu.ssl-images-amazon.com/images/S/amazon-avatars-global/d7016e66-a576-4575-930d-5c30d77e1709._CR83,0,333,333_SX48_.jpg"
          },
          "vine_program": false,
          "verified_purchase": true,
          "helpful_votes": 17,
          "review_country": "gb",
          "is_global_review": true
        },
        {
          "id": "R2SLR5Y7VDLB11",
          "title": "Strange neck fit",
          "body": "I wear a small, the length is good, not too baggy and I like the colour. The t shirt has the strangest fit around the neck, it sits up at the back, no matter how much you pull the t shirt down at the back or arms it still sits up. Wish I hadn’t taken the labels off so I could return 🤷🏻‍♂️Read more",
          "body_html": "<div data-a-expander-name=\"review_text_read_more\" data-a-expander-collapsed-height=\"300\" class=\"a-expander-collapsed-height a-row a-expander-container a-expander-partial-collapse-container\" style=\"max-height:300px\"><div data-hook=\"review-collapsed\" aria-expanded=\"false\" class=\"a-expander-content reviewText review-text-content a-expander-partial-collapse-content\">             <span>I wear a small, the length is good, not too baggy and I like the colour. The t shirt has the strangest fit around the neck, it sits up at the back, no matter how much you pull the t shirt down at the back or arms it still sits up. Wish I hadn’t taken the labels off so I could return 🤷🏻‍♂️</span>   </div><div class=\"a-expander-header a-expander-partial-collapse-header\"><div class=\"a-expander-content-fade\"></div><a href=\"javascript:void(0)\" data-csa-c-func-deps=\"aui-da-a-expander-toggle\" data-csa-c-type=\"widget\" data-csa-interaction-events=\"click\" data-hook=\"expand-collapse-read-more-less\" aria-label=\"Toggle full review text\" aria-expanded=\"false\" role=\"button\" data-action=\"a-expander-toggle\" class=\"a-declarative\" data-a-expander-toggle=\"{&quot;allowLinkDefault&quot;:true, &quot;expand_prompt&quot;:&quot;Read more&quot;, &quot;collapse_prompt&quot;:&quot;Read less&quot;}\"><i class=\"a-icon a-icon-extender-expand\"></i><span class=\"a-expander-prompt\">Read more</span></a></div></div>",
          "rating": 2,
          "date": {
            "raw": "Reviewed in the United Kingdom on November 19, 2019",
            "utc": "2019-11-19T00:00:00.000Z"
          },
          "profile": {
            "name": "Pabloh"
          },
          "vine_program": false,
          "verified_purchase": true,
          "helpful_votes": 13,
          "review_country": "gb",
          "is_global_review": true
        }
      ],
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 27,
          "hard_maximum": true
        },
        "offer_id": "yDHt8Rom2768gjw28aseyWvidT9Ce8vlehO+paAtSfb24y06CNcFgjPHXsLTApvzP49kZWk0Twv/hl++YB2wtvDREKibCJQbBIGR95emUl6P5hbUNtpGiDo7RtsP9tdNqhGJE+ICKtmtg96mZQMABQ==",
        "mixed_offers_count": 3,
        "mixed_offers_from": {
          "symbol": "$",
          "value": 16.24,
          "currency": "USD",
          "raw": "$16.24"
        },
        "is_prime": true,
        "is_amazon_fresh": false,
        "condition": {
          "is_new": true
        },
        "availability": {
          "type": "in_stock",
          "raw": "In Stock.",
          "dispatch_days": 1
        },
        "fulfillment": {
          "type": "1p",
          "standard_delivery": {
            "date": "Tuesday, August 30",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Friday, August 26",
            "name": "Or fastest delivery Friday, August 26. Order within 18 hrs 52 mins"
          },
          "is_sold_by_amazon": true,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": false
        },
        "price": {
          "symbol": "$",
          "value": 16.24,
          "currency": "USD",
          "raw": "$16.24"
        },
        "rrp": {
          "symbol": "$",
          "value": 25,
          "currency": "USD",
          "raw": "$25.00"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "more_buying_choices": [
        {
          "price": {
            "symbol": "$",
            "value": 18.99,
            "currency": "USD",
            "raw": "$18.99"
          },
          "seller_name": "Zappos",
          "free_shipping": true,
          "position": 1
        }
      ],
      "specifications": [
        {
          "name": "Item Package Dimensions L x W x H",
          "value": "‎10.79 x 7.83 x 1.26 inches"
        },
        {
          "name": "Package Weight",
          "value": "‎0.17 Kilograms"
        },
        {
          "name": "Item Dimensions  LxWxH",
          "value": "‎0.39 x 0.39 x 0.39 inches"
        },
        {
          "name": "Item Weight",
          "value": "‎0.12 Kilograms"
        },
        {
          "name": "Brand Name",
          "value": "‎Under Armour"
        },
        {
          "name": "Model Name",
          "value": "‎Tech 2.0 Short-sleeve T-shirt"
        },
        {
          "name": "Color",
          "value": "‎Black"
        },
        {
          "name": "Material",
          "value": "‎Polyester"
        },
        {
          "name": "Suggested Users",
          "value": "‎Mens"
        },
        {
          "name": "Number of Items",
          "value": "‎1"
        },
        {
          "name": "Manufacturer",
          "value": "‎Under Armour Apparel"
        },
        {
          "name": "Part Number",
          "value": "‎1326413-001"
        },
        {
          "name": "Model Year",
          "value": "‎2019"
        },
        {
          "name": "Style",
          "value": "‎Tech 2.0 Short-sleeve T-shirt"
        },
        {
          "name": "Size",
          "value": "‎XX-Large"
        },
        {
          "name": "Sport Type",
          "value": "‎Exercise and Fitness"
        },
        {
          "name": "ASIN",
          "value": "B07815JCHQ"
        },
        {
          "name": "Customer Reviews",
          "value": "4.6 out of 5 stars       72,515 ratings          4.6 out of 5 stars"
        },
        {
          "name": "Best Sellers Rank",
          "value": "#26 in Clothing, Shoes & Jewelry"
        },
        {
          "name": "Date First Available",
          "value": "July 6, 2018"
        }
      ],
      "specifications_flat": "Date First Available: July 6, 2018. Best Sellers Rank: #26 in Clothing, Shoes & Jewelry. Customer Reviews: 4.6 out of 5 stars       72,515 ratings          4.6 out of 5 stars. ASIN: B07815JCHQ. Sport Type: ‎Exercise and Fitness. Size: ‎XX-Large. Style: ‎Tech 2.0 Short-sleeve T-shirt. Model Year: ‎2019. Part Number: ‎1326413-001. Manufacturer: ‎Under Armour Apparel. Number of Items: ‎1. Suggested Users: ‎Mens. Material: ‎Polyester. Color: ‎Black. Model Name: ‎Tech 2.0 Short-sleeve T-shirt. Brand Name: ‎Under Armour. Item Weight: ‎0.12 Kilograms. Item Dimensions  LxWxH: ‎0.39 x 0.39 x 0.39 inches. Package Weight: ‎0.17 Kilograms. Item Package Dimensions L x W x H: ‎10.79 x 7.83 x 1.26 inches.",
      "bestsellers_rank": [
        {
          "category": "Clothing Shoes & Jewelry",
          "rank": 26,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Men's Activewear T-Shirts",
          "rank": 2,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/23575646011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "color": "‎Black",
      "material": "‎Polyester",
      "manufacturer": "‎Under Armour Apparel",
      "weight": "‎0.12 Kilograms",
      "first_available": {
        "raw": "July 6, 2018",
        "utc": "2018-07-06T00:00:00.000Z"
      },
      "model_number": "‎1326413-001",
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 26, Category: Men's Activewear T-Shirts | Rank: 2"
    },
    "brand_store": {
      "id": "4750579C-0CF4-4BF9-B7E8-F782E52D7683",
      "link": "https://www.amazon.com/stores/UnderArmour/page/4750579C-0CF4-4BF9-B7E8-F782E52D7683"
    },
    "frequently_bought_together": {
      "total_price": {
        "symbol": "$",
        "value": 47.26,
        "currency": "USD",
        "raw": "$47.26"
      },
      "products": [
        {
          "asin": "B07815JCHQ",
          "title": "Under Armour Men's Tech 2.0 Short-Sleeve T-Shirt",
          "link": "https://www.amazon.com/dp/B07815JCHQ",
          "image": "https://m.media-amazon.com/images/I/91o0-RX5JyS._SS100_.jpg",
          "price": {
            "symbol": "$",
            "value": 16.24,
            "currency": "USD",
            "raw": "$16.24"
          }
        },
        {
          "asin": "B077XNQ59P",
          "title": "Under Armour Men's Sportstyle Left Chest Short Sleeve T-shirt",
          "link": "https://www.amazon.com/dp/B077XNQ59P",
          "image": "https://images-na.ssl-images-amazon.com/images/I/81YSIX3gYaL._AC_UL116_SR116,116_.jpg",
          "price": {
            "symbol": "$",
            "value": 11.03,
            "currency": "USD",
            "raw": "$11.03"
          }
        },
        {
          "asin": "B077ZXV38Y",
          "title": "Under Armour Men's Tech 2.0 V-Neck Short-Sleeve T-Shirt",
          "link": "https://www.amazon.com/dp/B077ZXV38Y",
          "image": "https://images-na.ssl-images-amazon.com/images/I/51LWeqBz9xL._AC_UL116_SR116,116_.jpg",
          "price": {
            "symbol": "$",
            "value": 19.99,
            "currency": "USD",
            "raw": "$19.99"
          }
        }
      ]
    },
    "similar_to_consider": {
      "asin": "B07CR48TTS",
      "link": "https://www.amazon.com/dp/B07CR48TTS/ref=vp_d_pb_TIER2_sessmpr_lp_B07815JCHQ_pd?_encoding=UTF8&pf_rd_p=38bab58c-60a3-4c86-b34d-1227cd9c9d7f&pf_rd_r=3J7Y3BEPXB0RM4YW3180&pd_rd_wg=hy7hd&pd_rd_i=B07CR48TTS&pd_rd_w=B0UAh&content-id=amzn1.sym.38bab58c-60a3-4c86-b34d-1227cd9c9d7f&pd_rd_r=53cb732b-fb64-47e0-8f82-b8d51462edad",
      "title": "Amazon Essentials Men's Tech Stretch Short-Sleeve T-Shirt",
      "rating": 4.5,
      "ratings_total": 2497,
      "image": "https://m.media-amazon.com/images/I/91o0-RX5JyS._SS100_.jpg",
      "price": {
        "symbol": "$",
        "value": 9.31,
        "currency": "USD",
        "raw": "$9.31"
      }
    },
    "sponsored_products": [
      {
        "title": "Under Armour Men's Raid 2.0 Workout Gym Shorts , Pitch Gray (012)/Black , Small",
        "asin": "B0874WFWPM",
        "link": "https://www.amazon.com/dp/B0874WFWPM/ref=sspa_dk_detail_0?ie=UTF8&psc=1&pd_rd_i=&pd_rd_i=B0874WFWPMp13NParams&s=apparel&spc=MTo4NzI3MzY1NjQ0OTMyODQ1OjE2NjEzMzU2MjI6c3BfZGV0YWlsMjoyMDAwNDc3Mzc0NDQ5NzE6Ojo6&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWwy",
        "image": "https://m.media-amazon.com/images/I/31anGMH5-FL._AC_SR160,200_.jpg",
        "rating": 4.5,
        "ratings_total": 4591,
        "is_prime": true,
        "price": {
          "symbol": "$",
          "value": 22.68,
          "currency": "USD",
          "raw": "$22.68"
        }
      },
      {
        "title": "Vapor Apparel Men's Outdoor UPF 50+ Long Sleeve T-Shirt, UV Sun Protection for Fishing, Running, Hiking, XL, Navy",
        "asin": "B078B275NT",
        "link": "https://www.amazon.com/dp/B078B275NT/ref=sspa_dk_detail_1?ie=UTF8&psc=1&pd_rd_i=&pd_rd_i=B078B275NTp13NParams&smid=A1B056CVTQYA90&s=apparel&spc=MTo4NzI3MzY1NjQ0OTMyODQ1OjE2NjEzMzU2MjI6c3BfZGV0YWlsMjoyMDAwNDAxMzgyNDUzOTg6Ojo6&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWwy",
        "image": "https://m.media-amazon.com/images/I/41riE6J3lWS._AC_SR160,200_.jpg",
        "rating": 4.5,
        "ratings_total": 11523,
        "is_prime": true,
        "price": {
          "symbol": "$",
          "value": 17.49,
          "currency": "USD",
          "raw": "$17.49"
        }
      },
      {
        "title": "G-Star Raw Men's 3301 Western Denim Long Sleeve Slim Fit Shirt, Medium Aged, XL",
        "asin": "B07M5Z8X4W",
        "link": "https://www.amazon.com/dp/B07M5Z8X4W/ref=sspa_dk_detail_2?ie=UTF8&psc=1&pd_rd_i=&pd_rd_i=B07M5Z8X4Wp13NParams&s=apparel&spc=MTo4NzI3MzY1NjQ0OTMyODQ1OjE2NjEzMzU2MjI6c3BfZGV0YWlsMjoyMDAwNzEzNjM3ODU4OTg6Ojo6&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWwy",
        "image": "https://m.media-amazon.com/images/I/41NSBnAsgWL._AC_SR160,200_.jpg",
        "rating": 4.5,
        "ratings_total": 192,
        "is_prime": true,
        "price": {
          "symbol": "$",
          "value": 93.49,
          "currency": "USD",
          "raw": "$93.49"
        }
      },
      {
        "title": "Mens T-Shirt Short Sleeve Running T Shirt Workout T Shirt Dry Fit Gym Shirts Fitness Shirts UV Shirts Athletic Shirts for Men Orange",
        "asin": "B08WYZQSSW",
        "link": "https://www.amazon.com/dp/B08WYZQSSW/ref=sspa_dk_detail_3?ie=UTF8&psc=1&pd_rd_i=&pd_rd_i=B08WYZQSSWp13NParams&smid=A3U9RCE56GV0D0&s=apparel&spc=MTo4NzI3MzY1NjQ0OTMyODQ1OjE2NjEzMzU2MjI6c3BfZGV0YWlsMjoyMDAwNTk2NzQ3MTA2OTg6Ojo6&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWwy",
        "image": "https://m.media-amazon.com/images/I/311+cO7JwZL._AC_SR160,200_.jpg",
        "rating": 4.5,
        "ratings_total": 584,
        "is_prime": true,
        "price": {
          "symbol": "$",
          "value": 16.98,
          "currency": "USD",
          "raw": "$16.98"
        }
      },
      {
        "title": "MAGCOMSEN Sun Shirts for Men Dry Fit Shirts for Men T Shirts for Men Pack Rash Guard for Men Short Sleeve Running Undershirts for Men Workout Shirts Light Green",
        "asin": "B09XBCQ781",
        "link": "https://www.amazon.com/dp/B09XBCQ781/ref=sspa_dk_detail_4?ie=UTF8&psc=1&pd_rd_i=&pd_rd_i=B09XBCQ781p13NParams&smid=A3U9RCE56GV0D0&s=apparel&spc=MTo4NzI3MzY1NjQ0OTMyODQ1OjE2NjEzMzU2MjI6c3BfZGV0YWlsMjoyMDAwNTY1MDg4NzU1OTg6Ojo6&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWwy",
        "image": "https://m.media-amazon.com/images/I/41L3Hv6f-qL._AC_SR160,200_.jpg",
        "rating": 4.5,
        "ratings_total": 10,
        "is_prime": true,
        "price": {
          "symbol": "$",
          "value": 16.98,
          "currency": "USD",
          "raw": "$16.98"
        }
      },
      {
        "title": "MAGCOMSEN Hiking Shorts Men Athletic Shorts Men Quick-Dry Shorts Jogging Shorts Zipper Pockets Workout Shorts Men Running Shorts Lightweight Gym Shorts Men",
        "asin": "B07MFKDSGK",
        "link": "https://www.amazon.com/dp/B07MFKDSGK/ref=sspa_dk_detail_5?ie=UTF8&psc=1&pd_rd_i=&pd_rd_i=B07MFKDSGKp13NParams&smid=A3U9RCE56GV0D0&s=apparel&spc=MTo4NzI3MzY1NjQ0OTMyODQ1OjE2NjEzMzU2MjI6c3BfZGV0YWlsMjoyMDAwNzMxNDcyMzk4OTg6Ojo6&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWwy",
        "image": "https://m.media-amazon.com/images/I/41OiuXXRo5L._AC_SR160,200_.jpg",
        "rating": 4.5,
        "ratings_total": 932,
        "is_prime": true,
        "price": {
          "symbol": "$",
          "value": 19.98,
          "currency": "USD",
          "raw": "$19.98"
        }
      },
      {
        "title": "Vapor Apparel Men’s UPF 50+ UV Sun Protection Short Sleeve Performance T-Shirt for Sports and Outdoor Lifestyle, Medium, Seagrass",
        "asin": "B013CFKQJO",
        "link": "https://www.amazon.com/dp/B013CFKQJO/ref=sspa_dk_detail_6?ie=UTF8&psc=1&pd_rd_i=&pd_rd_i=B013CFKQJOp13NParams&smid=A1B056CVTQYA90&s=apparel&spc=MTo4NzI3MzY1NjQ0OTMyODQ1OjE2NjEzMzU2MjI6c3BfZGV0YWlsMjoyMDAwNTQwNzk2NTkzOTg6Ojo6&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWwy",
        "image": "https://m.media-amazon.com/images/I/31aP6gkrb4S._AC_SR160,200_.jpg",
        "rating": 4.5,
        "ratings_total": 1488,
        "is_prime": true,
        "price": {
          "symbol": "$",
          "value": 19.95,
          "currency": "USD",
          "raw": "$19.95"
        }
      },
      {
        "title": "vineyard vines mens Short-sleeve Vine Americana Whale Pocket T-shirt T Shirt, Blue Blazer, XX-Large US",
        "asin": "B0836222SC",
        "link": "https://www.amazon.com/dp/B0836222SC/ref=sspa_dk_detail_7?ie=UTF8&psc=1&pd_rd_i=&pd_rd_i=B0836222SCp13NParams&s=apparel&spc=MTo4NzI3MzY1NjQ0OTMyODQ1OjE2NjEzMzU2MjI6c3BfZGV0YWlsMjoyMDAwNjk3NDExMjczOTg6Ojo6&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWwy",
        "image": "https://m.media-amazon.com/images/I/31neKa73zNL._AC_SR160,200_.jpg",
        "rating": 4.5,
        "ratings_total": 563,
        "is_prime": true,
        "price": {
          "symbol": "$",
          "value": 45,
          "currency": "USD",
          "raw": "$45.00"
        }
      },
      {
        "title": "UV Shirts for Men Long Sleeve Sun Shirts Running Shirts Workout Shirts Fishing Shirts Rashguard Hiking Shirts Swim Shirts UPF 50 Shirts Orange",
        "asin": "B07WBXSV8L",
        "link": "https://www.amazon.com/dp/B07WBXSV8L/ref=sspa_dk_detail_8?ie=UTF8&psc=1&pd_rd_i=&pd_rd_i=B07WBXSV8Lp13NParams&smid=A3U9RCE56GV0D0&s=apparel&spc=MTo4NzI3MzY1NjQ0OTMyODQ1OjE2NjEzMzU2MjI6c3BfZGV0YWlsMjoyMDAwNTY1MDQwNTA3OTg6Ojo6&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWwy",
        "image": "https://m.media-amazon.com/images/I/41qrUNcdGfL._AC_SR160,200_.jpg",
        "rating": 4.5,
        "ratings_total": 1195,
        "is_prime": true,
        "price": {
          "symbol": "$",
          "value": 18.98,
          "currency": "USD",
          "raw": "$18.98"
        }
      },
      {
        "title": "MAGCOMSEN Tshirts Shirts for Men Fishing Shirts for Men Athletic Shirts Short Sleeve Workout Shirts Quick Dry Lightweight Shirts Running T-Shirt",
        "asin": "B09T9SD6DY",
        "link": "https://www.amazon.com/dp/B09T9SD6DY/ref=sspa_dk_detail_9?ie=UTF8&psc=1&pd_rd_i=&pd_rd_i=B09T9SD6DYp13NParams&smid=A3U9RCE56GV0D0&s=apparel&spc=MTo4NzI3MzY1NjQ0OTMyODQ1OjE2NjEzMzU2MjI6c3BfZGV0YWlsMjoyMDAwNzg1OTI4MjczOTg6Ojo6&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWwy",
        "image": "https://m.media-amazon.com/images/I/51uE3QO87LL._AC_SR160,200_.jpg",
        "rating": 5,
        "ratings_total": 18,
        "is_prime": true,
        "price": {
          "symbol": "$",
          "value": 16.98,
          "currency": "USD",
          "raw": "$16.98"
        }
      }
    ]
  };

  let images = [
    {
      "s3_key": "qc/private/_job_id/qc_hsphqsx3/input/images/main.jpg",
      "image_type": "main",
      "image_id": "main"
    },
    {
      "s3_key": "qc/private/_job_id/qc_hsphqsx3/input/images/variant-1.jpg",
      "image_type": "variant",
      "image_id": "variant-1"
    },
    {
      "s3_key": "qc/private/_job_id/qc_hsphqsx3/input/images/variant-2.jpg",
      "image_type": "variant",
      "image_id": "variant-2"
    },
    {
      "s3_key": "qc/private/_job_id/qc_hsphqsx3/input/images/variant-3.jpg",
      "image_type": "variant",
      "image_id": "variant-3"
    },
    {
      "s3_key": "qc/private/_job_id/qc_hsphqsx3/input/images/variant-4.jpg",
      "image_type": "variant",
      "image_id": "variant-4"
    }
  ];
  let overview = await getOverviewObjectFromProductListingDetails(rainforestResponse, images);
  console.log(JSON.stringify(overview));
});

it("should-create-image-to-image-url-map", async () => {
  let images = [
    {
      "s3_key": "qc/private/_job_id/qc_hsphqsx3/input/images/main.jpg",
      "image_type": "main"
    },
    {
      "s3_key": "qc/private/_job_id/qc_hsphqsx3/input/images/variant-1.jpg",
      "image_type": "variant"
    },
    {
      "s3_key": "qc/private/_job_id/qc_hsphqsx3/input/images/variant-2.jpg",
      "image_type": "variant"
    },
    {
      "s3_key": "qc/private/_job_id/qc_hsphqsx3/input/images/variant-3.jpg",
      "image_type": "variant"
    },
    {
      "s3_key": "qc/private/_job_id/qc_hsphqsx3/input/images/variant-4.jpg",
      "image_type": "variant"
    }
  ];
  let response = await createImageIdToUrlMap(images);
  console.log(response);
});

it("should-create-frontend-report", async () => {
  let images = [
    {
      "s3_key": "qc/private/_job_id/qc_hsphqsx3/input/images/main.jpg",
      "image_type": "main"
    },
    {
      "s3_key": "qc/private/_job_id/qc_hsphqsx3/input/images/variant-1.jpg",
      "image_type": "variant"
    },
    {
      "s3_key": "qc/private/_job_id/qc_hsphqsx3/input/images/variant-2.jpg",
      "image_type": "variant"
    },
    {
      "s3_key": "qc/private/_job_id/qc_hsphqsx3/input/images/variant-3.jpg",
      "image_type": "variant"
    },
    {
      "s3_key": "qc/private/_job_id/qc_hsphqsx3/input/images/variant-4.jpg",
      "image_type": "variant"
    }
  ];
  let response = await prepareFrontendReport("qc_hsphqsx3", images);
  console.log(JSON.stringify(response));
});
