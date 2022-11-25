const executeRule = require("../../../src/rule-engine/execute-rules-util");
const {getDefinitions, Rule} = require("../../../src/rule-engine/rule-utils");
const {FinalImageData, BodyDetection, LabelObject} = require("../../../src/models/final-image-data");
const {ListingDetails} = require("../../../src/models/detailed-report");

it('execute-generic-rule-passes-if-zoom-able-image-correct', async function () {
  let rule = new Rule({
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
  });
  let definitions = rule.getDefinitions();
  let imagedata = {
    "imageKey": "qc/private/_job_id/qc_npvthrqs/input/images/main.jpg",
    "labelObject": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Sleeve",
          "Confidence": 95.17449951171875,
          "Instances": []
        },
        {
          "Name": "T-Shirt",
          "Confidence": 88.69600677490234,
          "Instances": []
        },
        {
          "Name": "Person",
          "Confidence": 86.70475006103516,
          "Instances": [
            {
              "Confidence": 86.70475006103516,
              "BoundingBox": {
                "Width": 0.9942852258682251,
                "Height": 0.9824524521827698,
                "Left": 0,
                "Top": 0.016115235164761543
              }
            }
          ]
        },
        {
          "Name": "Human",
          "Confidence": 86.70475006103516,
          "Instances": []
        },
        {
          "Name": "Shirt",
          "Confidence": 79.63358306884766,
          "Instances": []
        }
      ]
    },
    "imageRules": [
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "photography",
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "dimensions",
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
    "metadata": {
      "format": "jpeg",
      "width": 1158,
      "height": 1600,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.772
    },
    "histogram": {
      "is_white_background": "true"
    }
  };
  let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
  expect(currentRuleResult.executionResult).toBe(true);
});

it('execute-generic-rule-fails-if-zoom-able-image-incorrect', async function () {
  let rule = new Rule({
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
  });
  let definitions = rule.getDefinitions();
  let imagedata = {
    "imageKey": "qc/private/_job_id/qc_npvthrqs/input/images/main.jpg",
    "labelObject": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Sleeve",
          "Confidence": 95.17449951171875,
          "Instances": []
        },
        {
          "Name": "T-Shirt",
          "Confidence": 88.69600677490234,
          "Instances": []
        },
        {
          "Name": "Person",
          "Confidence": 86.70475006103516,
          "Instances": [
            {
              "Confidence": 86.70475006103516,
              "BoundingBox": {
                "Width": 0.9942852258682251,
                "Height": 0.9824524521827698,
                "Left": 0,
                "Top": 0.016115235164761543
              }
            }
          ]
        },
        {
          "Name": "Human",
          "Confidence": 86.70475006103516,
          "Instances": []
        },
        {
          "Name": "Shirt",
          "Confidence": 79.63358306884766,
          "Instances": []
        }
      ]
    },
    "imageRules": [
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "photography",
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "dimensions",
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
    "metadata": {
      "format": "jpeg",
      "width": 158,
      "height": 100,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.772
    },
    "histogram": {
      "is_white_background": "true"
    }
  };
  let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
  expect(currentRuleResult).toBe(false);
});

it('execute-generic-rule-passes-if-max-image-size-correct', async function () {
  let rule = new Rule({
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
  });
  let definitions = rule.getDefinitions();
  let imagedata = {
    "imageKey": "qc/private/_job_id/qc_npvthrqs/input/images/main.jpg",
    "labelObject": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Sleeve",
          "Confidence": 95.17449951171875,
          "Instances": []
        },
        {
          "Name": "T-Shirt",
          "Confidence": 88.69600677490234,
          "Instances": []
        },
        {
          "Name": "Person",
          "Confidence": 86.70475006103516,
          "Instances": [
            {
              "Confidence": 86.70475006103516,
              "BoundingBox": {
                "Width": 0.9942852258682251,
                "Height": 0.9824524521827698,
                "Left": 0,
                "Top": 0.016115235164761543
              }
            }
          ]
        },
        {
          "Name": "Human",
          "Confidence": 86.70475006103516,
          "Instances": []
        },
        {
          "Name": "Shirt",
          "Confidence": 79.63358306884766,
          "Instances": []
        }
      ]
    },
    "imageRules": [
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "photography",
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "dimensions",
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
    "metadata": {
      "format": "jpeg",
      "width": 1158,
      "height": 1500,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.772
    },
    "histogram": {
      "is_white_background": "true"
    }
  };
  let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
  expect(currentRuleResult).toBe(true);
});

it('execute-generic-rule-fails-if-max-image-size-incorrect', async function () {
  let rule = new Rule({
    "image_type": "all",
    "rule_id": "max-image-size",
    "analyzer": "metadata",
    "definitions": [
      "AND",
      {
        "less_than_equal": {
          "$.metadata.width": 1000
        }
      },
      {
        "less_than_equal": {
          "$.metadata.height": 1000
        }
      }
    ],
    "compliance_level": "critical_issues"
  });
  let definitions = rule.getDefinitions();
  let imagedata = {
    "imageKey": "qc/private/_job_id/qc_npvthrqs/input/images/main.jpg",
    "labelObject": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Sleeve",
          "Confidence": 95.17449951171875,
          "Instances": []
        },
        {
          "Name": "T-Shirt",
          "Confidence": 88.69600677490234,
          "Instances": []
        },
        {
          "Name": "Person",
          "Confidence": 86.70475006103516,
          "Instances": [
            {
              "Confidence": 86.70475006103516,
              "BoundingBox": {
                "Width": 0.9942852258682251,
                "Height": 0.9824524521827698,
                "Left": 0,
                "Top": 0.016115235164761543
              }
            }
          ]
        },
        {
          "Name": "Human",
          "Confidence": 86.70475006103516,
          "Instances": []
        },
        {
          "Name": "Shirt",
          "Confidence": 79.63358306884766,
          "Instances": []
        }
      ]
    },
    "imageRules": [
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "photography",
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "dimensions",
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
    "metadata": {
      "format": "jpeg",
      "width": 1158,
      "height": 1500,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.772
    },
    "histogram": {
      "is_white_background": "true"
    }
  };
  let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
  expect(currentRuleResult.getExecutionResults()).toBe(false);
});

it('execute-generic-rule-passes-if-min-image-size-correct', async function () {
  let rule = new Rule({
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
  });
  let definitions = rule.getDefinitions();
  let imagedata = {
    "imageKey": "qc/private/_job_id/qc_npvthrqs/input/images/main.jpg",
    "labelObject": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Sleeve",
          "Confidence": 95.17449951171875,
          "Instances": []
        },
        {
          "Name": "T-Shirt",
          "Confidence": 88.69600677490234,
          "Instances": []
        },
        {
          "Name": "Person",
          "Confidence": 86.70475006103516,
          "Instances": [
            {
              "Confidence": 86.70475006103516,
              "BoundingBox": {
                "Width": 0.9942852258682251,
                "Height": 0.9824524521827698,
                "Left": 0,
                "Top": 0.016115235164761543
              }
            }
          ]
        },
        {
          "Name": "Human",
          "Confidence": 86.70475006103516,
          "Instances": []
        },
        {
          "Name": "Shirt",
          "Confidence": 79.63358306884766,
          "Instances": []
        }
      ]
    },
    "imageRules": [
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "photography",
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "dimensions",
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
    "metadata": {
      "format": "jpeg",
      "width": 1158,
      "height": 1500,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.772
    },
    "histogram": {
      "is_white_background": "true"
    }
  };
  let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
  expect(currentRuleResult).toBe(true);
});

it('execute-generic-rule-fails-if-min-image-size-incorrect', async function () {
  let rule = new Rule({
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
  });
  let definitions = rule.getDefinitions();
  let imagedata = {
    "imageKey": "qc/private/_job_id/qc_npvthrqs/input/images/main.jpg",
    "labelObject": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Sleeve",
          "Confidence": 95.17449951171875,
          "Instances": []
        },
        {
          "Name": "T-Shirt",
          "Confidence": 88.69600677490234,
          "Instances": []
        },
        {
          "Name": "Person",
          "Confidence": 86.70475006103516,
          "Instances": [
            {
              "Confidence": 86.70475006103516,
              "BoundingBox": {
                "Width": 0.9942852258682251,
                "Height": 0.9824524521827698,
                "Left": 0,
                "Top": 0.016115235164761543
              }
            }
          ]
        },
        {
          "Name": "Human",
          "Confidence": 86.70475006103516,
          "Instances": []
        },
        {
          "Name": "Shirt",
          "Confidence": 79.63358306884766,
          "Instances": []
        }
      ]
    },
    "imageRules": [
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "photography",
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "dimensions",
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
    "metadata": {
      "format": "jpeg",
      "width": 118,
      "height": 100,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.772
    },
    "histogram": {
      "is_white_background": "true"
    }
  };
  let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
  expect(currentRuleResult).toBe(false);
});

it('execute-generic-rule-passes-if-recommended-image-size-correct', async function () {
  let rule = new Rule({
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
  });
  let definitions = rule.getDefinitions();
  let imagedata = {
    "imageKey": "qc/private/_job_id/qc_npvthrqs/input/images/main.jpg",
    "labelObject": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Sleeve",
          "Confidence": 95.17449951171875,
          "Instances": []
        },
        {
          "Name": "T-Shirt",
          "Confidence": 88.69600677490234,
          "Instances": []
        },
        {
          "Name": "Person",
          "Confidence": 86.70475006103516,
          "Instances": [
            {
              "Confidence": 86.70475006103516,
              "BoundingBox": {
                "Width": 0.9942852258682251,
                "Height": 0.9824524521827698,
                "Left": 0,
                "Top": 0.016115235164761543
              }
            }
          ]
        },
        {
          "Name": "Human",
          "Confidence": 86.70475006103516,
          "Instances": []
        },
        {
          "Name": "Shirt",
          "Confidence": 79.63358306884766,
          "Instances": []
        }
      ]
    },
    "imageRules": [
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "photography",
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "dimensions",
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
    "metadata": {
      "format": "jpeg",
      "width": 1158,
      "height": 1500,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.772
    },
    "histogram": {
      "is_white_background": "true"
    }
  };
  let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
  expect(currentRuleResult).toBe(true);
});

it('execute-generic-rule-fails-if-recommended-image-size-incorrect', async function () {
  let rule = new Rule({
    "image_type": "all",
    "rule_id": "recommended-image-size",
    "analyzer": "metadata",
    "definitions": [
      "OR",
      {
        "greater_than_equal": {
          "$.metadata.width": 10000
        }
      },
      {
        "greater_than_equal": {
          "$.metadata.height": 10000
        }
      }
    ],
    "compliance_level": "critical_issues"
  });
  let definitions = rule.getDefinitions();
  let imagedata = {
    "imageKey": "qc/private/_job_id/qc_npvthrqs/input/images/main.jpg",
    "labelObject": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Sleeve",
          "Confidence": 95.17449951171875,
          "Instances": []
        },
        {
          "Name": "T-Shirt",
          "Confidence": 88.69600677490234,
          "Instances": []
        },
        {
          "Name": "Person",
          "Confidence": 86.70475006103516,
          "Instances": [
            {
              "Confidence": 86.70475006103516,
              "BoundingBox": {
                "Width": 0.9942852258682251,
                "Height": 0.9824524521827698,
                "Left": 0,
                "Top": 0.016115235164761543
              }
            }
          ]
        },
        {
          "Name": "Human",
          "Confidence": 86.70475006103516,
          "Instances": []
        },
        {
          "Name": "Shirt",
          "Confidence": 79.63358306884766,
          "Instances": []
        }
      ]
    },
    "imageRules": [
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "photography",
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "dimensions",
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
    "metadata": {
      "format": "jpeg",
      "width": 158,
      "height": 100,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.772
    },
    "histogram": {
      "is_white_background": "true"
    }
  };
  let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
  expect(currentRuleResult).toBe(false);
});

it('execute-generic-rule-fails-if-metadata-dpi-is-not-correct', async function () {
  let rule = new Rule({
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
  });
  let definitions = rule.getDefinitions();
  let imagedata = {
    "metadata": {
      "format": "jpeg",
      "width": 523,
      "height": 1000,
      "space": "srgb",
      "dpi": 52,
      "aspect_ratio": 0.523
    }
  };
  let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
  expect(currentRuleResult).toBe(false);
});

it('execute-generic-rule-pass-if-metadata-dpi-is-correct', async function () {
  let rule = new Rule({
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
  });
  let definitions = rule.getDefinitions();
  let imagedata = {
    "metadata": {
      "format": "jpeg",
      "width": 523,
      "height": 1000,
      "space": "srgb",
      "dpi": 74,
      "aspect_ratio": 0.523
    }
  };
  let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
  expect(currentRuleResult).toBe(true);
});

it('execute-generic-rule-pass-if-allowed-image-format-is-correct', async function () {
  let rule = new Rule({
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
  });
  let definitions = rule.getDefinitions();
  let imagedata = {
    "metadata": {
      "format": "jpeg",
      "width": 523,
      "height": 1000,
      "space": "srgb",
      "dpi": 480,
      "aspect_ratio": 0.523
    }
  };
  let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
  expect(currentRuleResult).toBe(true);
});

it('execute-generic-rule-fails-if-allowed-image-format-is-not-correct ', async function () {
  let rule = new Rule({
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
  });
  let definitions = rule.getDefinitions();
  let imagedata = {
    "metadata": {
      "format": "gif",
      "width": 523,
      "height": 1000,
      "space": "srgb",
      "dpi": 480,
      "aspect_ratio": 0.523
    }
  };
  let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
  expect(currentRuleResult).toBe(false);
});

it('execute-generic-rule-pass-if-use-sRGB-color-profile-is-correct', async function () {
  let rule = new Rule({
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
  });
  let definitions = rule.getDefinitions();
  let imagedata = {
    "metadata": {
      "format": "tiff",
      "width": 523,
      "height": 1000,
      "space": "srgb",
      "dpi": 480,
      "aspect_ratio": 0.523
    }
  };
  let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
  expect(currentRuleResult).toBe(true);
});

it('execute-generic-rule-fails-if-use-sRGB-color-profile-is-not-correct', async function () {
  let rule = new Rule({
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
  });
  let definitions = rule.getDefinitions();
  let imagedata = {
    "metadata": {
      "format": "tiff",
      "width": 523,
      "height": 1000,
      "space": "rgb",
      "dpi": 480,
      "aspect_ratio": 0.523
    }
  };
  let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
  expect(currentRuleResult).toBe(false);
});

it('execute-generic-rule-pass-if-background-is-white-for-main', async function () {
  let rule = new Rule({
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
  });
  let definitions = rule.getDefinitions();
  let imagedata = {
    "histogram": {
      "is_white_background": "true"
    }
  }
  let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
  expect(currentRuleResult).toBe(true);
});

it('execute-generic-rule-fails-if-background-is-not-white-for-main', async function () {
  let rule = new Rule({
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
  });
  let definitions = rule.getDefinitions();
  let imagedata = {
    "histogram": {
      "is_white_background": "false"
    }
  }
  let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
  expect(currentRuleResult).toBe(false);
});

it('execute-generic-rule-pass-if-metadata-width-and-height-are-correct ', async function () {
  let rule = new Rule({
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
  });
  let definitions = rule.getDefinitions();
  let imagedata = {
    "metadata": {
      "format": "jpeg",
      "width": 523,
      "height": 1000,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.523
    }
  };
  let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
  expect(currentRuleResult).toBe(true);
});

// it('execute-generic-rule-fails-if-metadata-width-is-not-correct', async function () {
//   let definitions = [
//     "AND",
//     {
//       "less_than_equal": {
//         "$.metadata.width": 5000
//       }
//     },
//     {
//
//       "less_than_equal": {
//         "$.metadata.height": 5000
//       }
//     }
//   ];
//   let imagedata = {
//     "metadata": {
//       "format": "jpeg",
//       "width": 5213,
//       "height": 1000,
//       "space": "srgb",
//       "dpi": 72,
//       "aspect_ratio": 0.523
//     }
//   };
//   let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
//   expect(currentRuleResult).toBe(false);
// });
//
// it('execute-generic-rule-fails-if-metadata-height-is-not-correct', async function () {
//   let definitions = [
//     "AND",
//     {
//       "less_than_equal": {
//         "$.metadata.width": 5000
//       }
//     },
//     {
//
//       "less_than_equal": {
//         "$.metadata.height": 5000
//       }
//     }
//   ];
//   let imagedata = {
//     "metadata": {
//       "format": "jpeg",
//       "width": 523,
//       "height": 5100,
//       "space": "srgb",
//       "dpi": 72,
//       "aspect_ratio": 0.523
//     }
//   };
//   let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
//   expect(currentRuleResult).toBe(false);
// });
//
// it('execute-generic-rule-pass-if-metadata-width-or-height-are-correct', async function () {
//   let definitions = [
//     "OR",
//     {
//       "greater_than_equal": {
//         "$.metadata.width": 200
//       }
//     },
//     {
//       "greater_than_equal": {
//         "$.metadata.height": 200
//       }
//     }
//   ];
//   let imagedata = {
//     "metadata": {
//       "format": "jpeg",
//       "width": 523,
//       "height": 1000,
//       "space": "srgb",
//       "dpi": 72,
//       "aspect_ratio": 0.523
//     }
//   };
//   let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
//   expect(currentRuleResult).toBe(true);
// });
//
// it('execute-generic-rule-fails-if-metadata-width-or-height-are-not-correct', async function () {
//   let definitions = [
//     "OR",
//     {
//       "greater_than_equal": {
//         "$.metadata.width": 200
//       }
//     },
//     {
//       "greater_than_equal": {
//         "$.metadata.height": 200
//       }
//     }
//   ];
//   let imagedata = {
//     "metadata": {
//       "format": "jpeg",
//       "width": 23,
//       "height": 10,
//       "space": "srgb",
//       "dpi": 72,
//       "aspect_ratio": 0.523
//     }
//   };
//   let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
//   expect(currentRuleResult).toBe(false);
// });

it('execute-generic-rule-pass-if-metadata-aspect-ratio-is-correct', async function () {
  let rule = new Rule({
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
  });
  let definitions = rule.getDefinitions();
  let imagedata = {
    "metadata": {
      "format": "tiff",
      "width": 523,
      "height": 1000,
      "space": "rgb",
      "dpi": 480,
      "aspect_ratio": 1
    }
  };
  let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
  expect(currentRuleResult).toBe(true);
});

it('execute-generic-rule-fails-if-metadata-aspect-ratio-is-not-correct', async function () {
  let rule = new Rule({
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
  });
  let definitions = rule.getDefinitions();

  let imagedata = {
    "metadata": {
      "format": "tiff",
      "width": 523,
      "height": 1000,
      "space": "rgb",
      "dpi": 480,
      "aspect_ratio": 0.523
    }
  };
  let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
  expect(currentRuleResult).toBe(false);
});

it('execute-generic-rule-passes-if-zoom-able-image-correct', async function () {
  let rule = new Rule({
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
  });
  let definitions = rule.getDefinitions();
  let imagedata = {
    "imageKey": "qc/private/_job_id/qc_npvthrqs/input/images/main.jpg",
    "labelObject": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Sleeve",
          "Confidence": 95.17449951171875,
          "Instances": []
        },
        {
          "Name": "T-Shirt",
          "Confidence": 88.69600677490234,
          "Instances": []
        },
        {
          "Name": "Person",
          "Confidence": 86.70475006103516,
          "Instances": [
            {
              "Confidence": 86.70475006103516,
              "BoundingBox": {
                "Width": 0.9942852258682251,
                "Height": 0.9824524521827698,
                "Left": 0,
                "Top": 0.016115235164761543
              }
            }
          ]
        },
        {
          "Name": "Human",
          "Confidence": 86.70475006103516,
          "Instances": []
        },
        {
          "Name": "Shirt",
          "Confidence": 79.63358306884766,
          "Instances": []
        }
      ]
    },
    "imageRules": [
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "photography",
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "dimensions",
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
    "metadata": {
      "format": "jpeg",
      "width": 1158,
      "height": 1600,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.772
    },
    "histogram": {
      "is_white_background": "true"
    }
  };
  let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
  expect(currentRuleResult.executionResult).toBe(true);
});

it('execute-generic-rule-fails-if-zoom-able-image-incorrect', async function () {
  let rule = new Rule({
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
  });
  let definitions = rule.getDefinitions();
  let imagedata = {
    "imageKey": "qc/private/_job_id/qc_npvthrqs/input/images/main.jpg",
    "labelObject": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Sleeve",
          "Confidence": 95.17449951171875,
          "Instances": []
        },
        {
          "Name": "T-Shirt",
          "Confidence": 88.69600677490234,
          "Instances": []
        },
        {
          "Name": "Person",
          "Confidence": 86.70475006103516,
          "Instances": [
            {
              "Confidence": 86.70475006103516,
              "BoundingBox": {
                "Width": 0.9942852258682251,
                "Height": 0.9824524521827698,
                "Left": 0,
                "Top": 0.016115235164761543
              }
            }
          ]
        },
        {
          "Name": "Human",
          "Confidence": 86.70475006103516,
          "Instances": []
        },
        {
          "Name": "Shirt",
          "Confidence": 79.63358306884766,
          "Instances": []
        }
      ]
    },
    "imageRules": [
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "photography",
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "dimensions",
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
    "metadata": {
      "format": "jpeg",
      "width": 158,
      "height": 100,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.772
    },
    "histogram": {
      "is_white_background": "true"
    }
  };
  let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
  expect(currentRuleResult).toBe(false);
});

it('execute-generic-rule-passes-if-white-background-variants-correct', async function () {
  let rule = new Rule({
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
  });
  let definitions = rule.getDefinitions();
  let imagedata = {
    "imageKey": "qc/private/_job_id/qc_npvthrqs/input/images/main.jpg",
    "labelObject": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Sleeve",
          "Confidence": 95.17449951171875,
          "Instances": []
        },
        {
          "Name": "T-Shirt",
          "Confidence": 88.69600677490234,
          "Instances": []
        },
        {
          "Name": "Person",
          "Confidence": 86.70475006103516,
          "Instances": [
            {
              "Confidence": 86.70475006103516,
              "BoundingBox": {
                "Width": 0.9942852258682251,
                "Height": 0.9824524521827698,
                "Left": 0,
                "Top": 0.016115235164761543
              }
            }
          ]
        },
        {
          "Name": "Human",
          "Confidence": 86.70475006103516,
          "Instances": []
        },
        {
          "Name": "Shirt",
          "Confidence": 79.63358306884766,
          "Instances": []
        }
      ]
    },
    "imageRules": [
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "photography",
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "dimensions",
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
    "metadata": {
      "format": "jpeg",
      "width": 1158,
      "height": 1600,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.772
    },
    "histogram": {
      "is_white_background": "true"
    }
  };
  let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
  expect(currentRuleResult).toBe(true);
});

it('execute-generic-rule-fails-if-white-background-variants-incorrect', async function () {
  let rule = new Rule({
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
  });
  let definitions = rule.getDefinitions();
  let imagedata = {
    "imageKey": "qc/private/_job_id/qc_npvthrqs/input/images/main.jpg",
    "labelObject": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.95532989501953,
          "Instances": []
        },
        {
          "Name": "Sleeve",
          "Confidence": 95.17449951171875,
          "Instances": []
        },
        {
          "Name": "T-Shirt",
          "Confidence": 88.69600677490234,
          "Instances": []
        },
        {
          "Name": "Person",
          "Confidence": 86.70475006103516,
          "Instances": [
            {
              "Confidence": 86.70475006103516,
              "BoundingBox": {
                "Width": 0.9942852258682251,
                "Height": 0.9824524521827698,
                "Left": 0,
                "Top": 0.016115235164761543
              }
            }
          ]
        },
        {
          "Name": "Human",
          "Confidence": 86.70475006103516,
          "Instances": []
        },
        {
          "Name": "Shirt",
          "Confidence": 79.63358306884766,
          "Instances": []
        }
      ]
    },
    "imageRules": [
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "photography",
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
        "guideline_category": "photography",
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
        "guideline_category": "dimensions",
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
        "guideline_category": "dimensions",
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
    "metadata": {
      "format": "jpeg",
      "width": 158,
      "height": 100,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.772
    },
    "histogram": {
      "is_white_background": "false"
    }
  };
  let currentRuleResult = executeRule.executeGenericRule(definitions, imagedata);
  expect(currentRuleResult).toBe(false);
});

it('is-single-model-image-pass-is-single-model-image-is-correct', async function () {
  let imageData = new FinalImageData({
    "image_key": "qc/private/_job_id/qc_biypsn0k/input/images/main.jpg",
    "object": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.9909896850586,
          "Instances": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.9909896850586,
          "Instances": []
        },
        {
          "Name": "Sleeve",
          "Confidence": 95.00950622558594,
          "Instances": []
        },
        {
          "Name": "T-Shirt",
          "Confidence": 92.51558685302734,
          "Instances": []
        },
        {
          "Name": "Person",
          "Confidence": 83.80008697509766,
          "Instances": [
            {
              "Confidence": 83.80008697509766,
              "BoundingBox": {
                "Width": 0.9778540134429932,
                "Height": 0.9044285416603088,
                "Left": 0.013950061984360218,
                "Top": 0.016401611268520355
              }
            }
          ]
        },
        {
          "Name": "Human",
          "Confidence": 83.80008697509766,
          "Instances": []
        },
        {
          "Name": "Shirt",
          "Confidence": 77.56671905517578,
          "Instances": []
        }
      ]
    },
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
      },
      {
        "image_type": "main",
        "rule_id": "no_promo_text",
        "analyzer": "text",
        "definitions": [
          {
            "equals": {
              "$.is_promo_text_present": "false"
            }
          }
        ],
        "compliance_level": "Must Meet"
      }
    ],
    "metadata": {
      "format": "jpeg",
      "width": 960,
      "height": 1500,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.64
    },
    "histogram": {
      "is_white_background": "true"
    },
    "text": {
      "TextDetections": [
        {
          "DetectedText": "Champion",
          "Type": "LINE",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06300010532140732,
              "Left": 0.21371883153915405,
              "Top": 0.2310895174741745
            }
          }
        },
        {
          "DetectedText": "Champion",
          "Type": "WORD",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06165669858455658,
              "Left": 0.21371883153915405,
              "Top": 0.23176123201847076
            }
          }
        }
      ]
    }
  });
  let rule = new Rule({
    "image_type": "main",
    "rule_id": "single_model_in_main_image",
    "analyzer": "object",
    "confidence_level": 80,
    "compliance_level": "critical_issues"
  });
  let label = imageData.getLabel();
  let currentRuleResult = executeRule.isSingleModelImage(label.getLabelObject(), rule.getConfidenceLevel());
  expect(currentRuleResult).toBe(true);
});

it('is-single-model-image-fails-is-single-model-image-is-not-correct', async function () {
  let imageData = new FinalImageData({
    "image_key": "qc/private/_job_id/qc_biypsn0k/input/images/main.jpg",
    "object": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.9909896850586,
          "Instances": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.9909896850586,
          "Instances": []
        },
        {
          "Name": "Sleeve",
          "Confidence": 95.00950622558594,
          "Instances": []
        },
        {
          "Name": "T-Shirt",
          "Confidence": 92.51558685302734,
          "Instances": []
        },
        {
          "Name": "Person",
          "Confidence": 63.80008697509766,
          "Instances": [
            {
              "Confidence": 83.80008697509766,
              "BoundingBox": {
                "Width": 0.9778540134429932,
                "Height": 0.9044285416603088,
                "Left": 0.013950061984360218,
                "Top": 0.016401611268520355
              }
            }
          ]
        },
        {
          "Name": "Human",
          "Confidence": 83.80008697509766,
          "Instances": []
        },
        {
          "Name": "Shirt",
          "Confidence": 77.56671905517578,
          "Instances": []
        }
      ]
    },
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
      },
      {
        "image_type": "main",
        "rule_id": "no_promo_text",
        "analyzer": "text",
        "definitions": [
          {
            "equals": {
              "$.is_promo_text_present": "false"
            }
          }
        ],
        "compliance_level": "Must Meet"
      }
    ],
    "metadata": {
      "format": "jpeg",
      "width": 960,
      "height": 1500,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.64
    },
    "histogram": {
      "is_white_background": "true"
    },
    "text": {
      "TextDetections": [
        {
          "DetectedText": "Champion",
          "Type": "LINE",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06300010532140732,
              "Left": 0.21371883153915405,
              "Top": 0.2310895174741745
            }
          }
        },
        {
          "DetectedText": "Champion",
          "Type": "WORD",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06165669858455658,
              "Left": 0.21371883153915405,
              "Top": 0.23176123201847076
            }
          }
        }
      ]
    }
  });
  let rule = new Rule({
    "image_type": "main",
    "rule_id": "single_model_in_main_image",
    "analyzer": "object",
    "confidence_level": 80,
    "compliance_level": "critical_issues"
  });
  let label = imageData.getLabel();
  let currentRuleResult = executeRule.isSingleModelImage(label.getLabelObject(), rule.getConfidenceLevel());
  expect(currentRuleResult).toBe(false);
});

it('is-model-filling-majority-image-area-pass-if-covered-percentage-is-correct ', async function () {
  let imageData = new FinalImageData({
    "image_key": "qc/private/_job_id/qc_biypsn0k/input/images/main.jpg",
    "object": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.9909896850586,
          "Instances": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.9909896850586,
          "Instances": []
        },
        {
          "Name": "Sleeve",
          "Confidence": 95.00950622558594,
          "Instances": []
        },
        {
          "Name": "T-Shirt",
          "Confidence": 92.51558685302734,
          "Instances": []
        },
        {
          "Name": "Person",
          "Confidence": 83.80008697509766,
          "Instances": [
            {
              "Confidence": 83.80008697509766,
              "BoundingBox": {
                "Width": 0.9778540134429932,
                "Height": 0.9044285416603088,
                "Left": 0.013950061984360218,
                "Top": 0.016401611268520355
              }
            }
          ]
        },
        {
          "Name": "Human",
          "Confidence": 83.80008697509766,
          "Instances": []
        },
        {
          "Name": "Shirt",
          "Confidence": 77.56671905517578,
          "Instances": []
        }
      ]
    },
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
      },
      {
        "image_type": "main",
        "rule_id": "no_promo_text",
        "analyzer": "text",
        "definitions": [
          {
            "equals": {
              "$.is_promo_text_present": "false"
            }
          }
        ],
        "compliance_level": "Must Meet"
      }
    ],
    "metadata": {
      "format": "jpeg",
      "width": 960,
      "height": 1500,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.64
    },
    "histogram": {
      "is_white_background": "true"
    },
    "text": {
      "TextDetections": [
        {
          "DetectedText": "Champion",
          "Type": "LINE",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06300010532140732,
              "Left": 0.21371883153915405,
              "Top": 0.2310895174741745
            }
          }
        },
        {
          "DetectedText": "Champion",
          "Type": "WORD",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06165669858455658,
              "Left": 0.21371883153915405,
              "Top": 0.23176123201847076
            }
          }
        }
      ]
    }
  });
  let rule = new Rule({
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
  });
  let label = imageData.getLabel();
  let currentRuleResult = executeRule.isModelFillingMajorityImageArea(label.getLabelObject(), rule.getConfidenceLevel(), rule.getDefinitions());
  expect(currentRuleResult).toBe(true);
});

it('is-model-filling-majority-image-area-fails-if-covered-percentage-is-not-correct', async function () {
  let imageData = new FinalImageData({
    "image_key": "qc/private/_job_id/qc_biypsn0k/input/images/main.jpg",
    "object": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.9909896850586,
          "Instances": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.9909896850586,
          "Instances": []
        },
        {
          "Name": "Sleeve",
          "Confidence": 95.00950622558594,
          "Instances": []
        },
        {
          "Name": "T-Shirt",
          "Confidence": 92.51558685302734,
          "Instances": []
        },
        {
          "Name": "Person",
          "Confidence": 83.80008697509766,
          "Instances": [
            {
              "Confidence": 83.80008697509766,
              "BoundingBox": {
                "Width": 0.3778540134429932,
                "Height": 0.2044285416603088,
                "Left": 0.013950061984360218,
                "Top": 0.016401611268520355
              }
            }
          ]
        },
        {
          "Name": "Human",
          "Confidence": 83.80008697509766,
          "Instances": []
        },
        {
          "Name": "Shirt",
          "Confidence": 77.56671905517578,
          "Instances": []
        }
      ]
    },
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
      },
      {
        "image_type": "main",
        "rule_id": "no_promo_text",
        "analyzer": "text",
        "definitions": [
          {
            "equals": {
              "$.is_promo_text_present": "false"
            }
          }
        ],
        "compliance_level": "Must Meet"
      }
    ],
    "metadata": {
      "format": "jpeg",
      "width": 960,
      "height": 1500,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.64
    },
    "histogram": {
      "is_white_background": "true"
    },
    "text": {
      "TextDetections": [
        {
          "DetectedText": "Champion",
          "Type": "LINE",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06300010532140732,
              "Left": 0.21371883153915405,
              "Top": 0.2310895174741745
            }
          }
        },
        {
          "DetectedText": "Champion",
          "Type": "WORD",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06165669858455658,
              "Left": 0.21371883153915405,
              "Top": 0.23176123201847076
            }
          }
        }
      ]
    }
  });
  let rule = new Rule({
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
  });
  let label = imageData.getLabel();
  let currentRuleResult = executeRule.isModelFillingMajorityImageArea(label.getLabelObject(), rule.getConfidenceLevel(), rule.getDefinitions());
  expect(currentRuleResult).toBe(false);
});

it('contains-no-promo-text-pass-no-promo-text-is-correct', async function () {
  let imageData = new FinalImageData({
    "imageKey": "qc/private/_job_id/qc_biypsn0k/input/images/main.jpg",
    "labelObject": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.9909896850586,
          "Instances": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.9909896850586,
          "Instances": []
        },
        {
          "Name": "Sleeve",
          "Confidence": 95.00950622558594,
          "Instances": []
        },
        {
          "Name": "T-Shirt",
          "Confidence": 92.51558685302734,
          "Instances": []
        },
        {
          "Name": "Person",
          "Confidence": 83.80008697509766,
          "Instances": [
            {
              "Confidence": 83.80008697509766,
              "BoundingBox": {
                "Width": 0.9778540134429932,
                "Height": 0.9044285416603088,
                "Left": 0.013950061984360218,
                "Top": 0.016401611268520355
              }
            }
          ]
        },
        {
          "Name": "Human",
          "Confidence": 83.80008697509766,
          "Instances": []
        },
        {
          "Name": "Shirt",
          "Confidence": 77.56671905517578,
          "Instances": []
        }
      ]
    },
    "text": {
      "TextDetections": [
        {
          "DetectedText": "Champion",
          "Type": "LINE",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06300010532140732,
              "Left": 0.21371883153915405,
              "Top": 0.2310895174741745
            }
          }
        },
        {
          "DetectedText": "Champion",
          "Type": "WORD",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06165669858455658,
              "Left": 0.21371883153915405,
              "Top": 0.23176123201847076
            }
          }
        }
      ]
    },
    "imageRules": [
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
      },
      {
        "image_type": "main",
        "rule_id": "no_promo_text",
        "analyzer": "text",
        "definitions": [
          {
            "equals": {
              "$.is_promo_text_present": "false"
            }
          }
        ],
        "compliance_level": "Must Meet"
      }
    ],
    "metadata": {
      "format": "jpeg",
      "width": 960,
      "height": 1500,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.64
    },
    "histogram": {
      "is_white_background": "true"
    }
  });
  let text = imageData.getText()
  let currentRuleResult = executeRule.containsPromoText(text);
  expect(currentRuleResult).toBe(true);
});

it('contains-no-promo-text-fails-no-promo-text-not-correct ', async function () {
  let imageData = new FinalImageData({
    "imageKey": "qc/private/_job_id/qc_biypsn0k/input/images/main.jpg",
    "labelObject": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.9909896850586,
          "Instances": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.9909896850586,
          "Instances": []
        },
        {
          "Name": "Sleeve",
          "Confidence": 95.00950622558594,
          "Instances": []
        },
        {
          "Name": "T-Shirt",
          "Confidence": 92.51558685302734,
          "Instances": []
        },
        {
          "Name": "Person",
          "Confidence": 83.80008697509766,
          "Instances": [
            {
              "Confidence": 83.80008697509766,
              "BoundingBox": {
                "Width": 0.9778540134429932,
                "Height": 0.9044285416603088,
                "Left": 0.013950061984360218,
                "Top": 0.016401611268520355
              }
            }
          ]
        },
        {
          "Name": "Human",
          "Confidence": 83.80008697509766,
          "Instances": []
        },
        {
          "Name": "Shirt",
          "Confidence": 77.56671905517578,
          "Instances": []
        }
      ]
    },
    "text": {
      "TextDetections": [
        {
          "DetectedText": "Champion",
          "Type": "LINE",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06300010532140732,
              "Left": 0.21371883153915405,
              "Top": 0.2310895174741745
            }
          }
        },
        {
          "DetectedText": "Champion",
          "Type": "WORD",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06165669858455658,
              "Left": 0.21371883153915405,
              "Top": 0.23176123201847076
            }
          }
        }
      ]
    },
    "imageRules": [
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
      },
      {
        "image_type": "main",
        "rule_id": "no_promo_text",
        "analyzer": "text",
        "definitions": [
          {
            "equals": {
              "$.is_promo_text_present": "false"
            }
          }
        ],
        "compliance_level": "Must Meet"
      }
    ],
    "metadata": {
      "format": "jpeg",
      "width": 960,
      "height": 1500,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.64
    },
    "histogram": {
      "is_white_background": "true"
    }
  });
  let text = imageData.getText()

  let currentRuleResult = executeRule.containsPromoText(text);
  expect(currentRuleResult).toBe(false);
});

it("execute-listing-rules-passes-if-returns-true", async function () {
  let inputListingRules = [[
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
    }
  ]];
  let platformName = "amazon";
  let images = [
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/main.jpg",
      "image_type": "main",
      "image_id": "main"
    },
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/variant-1.jpg",
      "image_type": "variant",
      "image_id": "variant-1"
    },
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/variant-2.jpg",
      "image_type": "variant",
      "image_id": "variant-2"
    },
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/variant-3.jpg",
      "image_type": "variant",
      "image_id": "variant-3"
    },
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/variant-4.jpg",
      "image_type": "variant",
      "image_id": "variant-4"
    },
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/variant-5.jpg",
      "image_type": "variant",
      "image_id": "variant-5"
    },
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/variant-6.jpg",
      "image_type": "variant",
      "image_id": "variant-6"
    }
  ];
  let listingDetail = {
    "is_video_available": false
  };
  let listingRulesExecutionResults = executeRule.executeListingRules([...inputListingRules.values()], platformName, [...images.values()], listingDetail);
  for (let [key, value] of listingRulesExecutionResults.entries()) {
    expect(value.getResult()).toBe(true)
  }
});

it("execute-listing-rules-fails-if-returns-fails", async function () {
  let inputListingRules = [[
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
    }
  ]];
  let platformName = "amazon";
  let images = [
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/main.jpg",
      "image_type": "main",
      "image_id": "main"
    },
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/variant-5.jpg",
      "image_type": "variant",
      "image_id": "variant-5"
    },
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/variant-6.jpg",
      "image_type": "variant",
      "image_id": "variant-6"
    }
  ];
  let listingDetail = {
    "is_video_available": false
  };
  let listingRulesExecutionResults = executeRule.executeListingRules([...inputListingRules.values()], platformName, [...images.values()], listingDetail);
  for (let [key, value] of listingRulesExecutionResults.entries()) {
    expect(value.getResult()).toBe(false)
  }
});

it("execute-listing-rules-passes-if-is_video_available_true", async function () {
  let inputListingRules = [[
    {
      "rule_id": "is_video_present",
      "rule_applicability": "listing",
      "definitions": [
        {
          "equals": {
            "is_video_present": true
          }
        }
      ],
      "compliance_level": "critical_issues"
    }
  ]];
  let platformName = "amazon";
  let images = [
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/main.jpg",
      "image_type": "main",
      "image_id": "main"
    },
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/variant-1.jpg",
      "image_type": "variant",
      "image_id": "variant-1"
    },
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/variant-2.jpg",
      "image_type": "variant",
      "image_id": "variant-2"
    },
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/variant-3.jpg",
      "image_type": "variant",
      "image_id": "variant-3"
    },
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/variant-4.jpg",
      "image_type": "variant",
      "image_id": "variant-4"
    },
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/variant-5.jpg",
      "image_type": "variant",
      "image_id": "variant-5"
    },
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/variant-6.jpg",
      "image_type": "variant",
      "image_id": "variant-6"
    }
  ];
  let listingDetail = {
    "is_video_available": true
  };
  let listingRulesExecutionResults = executeRule.executeListingRules([...inputListingRules.values()], platformName, [...images.values()], listingDetail);
  for (let [key, value] of listingRulesExecutionResults.entries()) {
    expect(value.getResult()).toBe(true)
  }
});

it("execute-listing-rules-fails-if-is_video_available_false", async function () {
  let inputListingRules = [[
    {
      "rule_id": "is_video_present",
      "rule_applicability": "listing",
      "definitions": [
        {
          "equals": {
            "is_video_present": false
          }
        }
      ],
      "compliance_level": "critical_issues"
    }
  ]];
  let platformName = "amazon";
  let images = [
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/main.jpg",
      "image_type": "main",
      "image_id": "main"
    },
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/variant-1.jpg",
      "image_type": "variant",
      "image_id": "variant-1"
    },
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/variant-2.jpg",
      "image_type": "variant",
      "image_id": "variant-2"
    },
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/variant-3.jpg",
      "image_type": "variant",
      "image_id": "variant-3"
    },
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/variant-4.jpg",
      "image_type": "variant",
      "image_id": "variant-4"
    },
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/variant-5.jpg",
      "image_type": "variant",
      "image_id": "variant-5"
    },
    {
      "s3_key": "qc/private/_job_id/qc_npvthrqs/input/images/variant-6.jpg",
      "image_type": "variant",
      "image_id": "variant-6"
    }
  ];
  let listingDetail = {
    "is_video_available": true
  };
  let listingRulesExecutionResults = executeRule.executeListingRules([...inputListingRules.values()], platformName, [...images.values()], listingDetail);
  for (let [key, value] of listingRulesExecutionResults.entries()) {
    expect(value.getResult()).toBe(false)
  }
});

it("execute-is-model-centred-pass-largest-object-is-in-center", async function () {
  let imageData = new FinalImageData({
    "image_key": "qc/private/_job_id/qc_biypsn0k/input/images/main.jpg",
    "object": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.9909896850586,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.9909896850586,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Sleeve",
          "Confidence": 95.00950622558594,
          "Instances": [],
          "Parents": [
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "T-Shirt",
          "Confidence": 92.51558685302734,
          "Instances": [],
          "Parents": [
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Person",
          "Confidence": 83.80008697509766,
          "Instances": [
            {
              "BoundingBox": {
                "Width": 0.9778540134429932,
                "Height": 0.9044285416603088,
                "Left": 0.013950061984360218,
                "Top": 0.016401611268520355
              },
              "Confidence": 83.80008697509766
            }
          ],
          "Parents": []
        },
        {
          "Name": "Human",
          "Confidence": 83.80008697509766,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Shirt",
          "Confidence": 77.56671905517578,
          "Instances": [],
          "Parents": [
            {
              "Name": "Clothing"
            }
          ]
        }
      ]
    },
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
        "rule_id": "zoomable-image",
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
      },
      {
        "image_type": "main",
        "rule_id": "no_promo_text",
        "analyzer": "text",
        "definitions": [
          {
            "equals": {
              "$.is_promo_text_present": "false"
            }
          }
        ],
        "compliance_level": "Must Meet"
      }
    ],
    "metadata": {
      "format": "jpeg",
      "width": 960,
      "height": 1500,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.64
    },
    "histogram": {
      "is_white_background": "true"
    },
    "text": {
      "TextDetections": [
        {
          "DetectedText": "Champion",
          "Type": "LINE",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06300010532140732,
              "Left": 0.21371883153915405,
              "Top": 0.2310895174741745
            }
          }
        },
        {
          "DetectedText": "Champion",
          "Type": "WORD",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06165669858455658,
              "Left": 0.21371883153915405,
              "Top": 0.23176123201847076
            }
          }
        }
      ]
    }
  });
  let label = imageData.getLabel();
  let listingRulesExecutionResults = executeRule.isModelCentred(label.getLabelObject(), imageData.getMetadata());
  expect(listingRulesExecutionResults).toBe(true)
});

//https://www.amazon.com/Logitech-Advanced-Headphones-Noise-Cancelling-Microphone/dp/B0B9M79BT8/ref=sr_1_4?crid=2PCUHC48QUTAW&keywords=headphones+combo&qid=1663749430&sprefix=headphones+combo%2Caps%2C309&sr=8-4
it("execute-is-model-centred-fails-example-1", async function () {
  let imageData = new FinalImageData({
    "image_key": "qc/private/_job_id/qc_biypsn0k/input/images/main.jpg",
    "object": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.98419189453125,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.98419189453125,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Dress",
          "Confidence": 99.5913314819336,
          "Instances": [],
          "Parents": [
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Sleeve",
          "Confidence": 94.2228775024414,
          "Instances": [],
          "Parents": [
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Female",
          "Confidence": 94.1622085571289,
          "Instances": [],
          "Parents": [
            {
              "Name": "Person"
            }
          ]
        },
        {
          "Name": "Person",
          "Confidence": 94.1622085571289,
          "Instances": [
            {
              "BoundingBox": {
                "Width": 0.5667630434036255,
                "Height": 0.9288320541381836,
                "Left": 0.013470710255205631,
                "Top": 0
              },
              "Confidence": 93.85476684570312
            }
          ],
          "Parents": []
        },
        {
          "Name": "Human",
          "Confidence": 94.1622085571289,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Long Sleeve",
          "Confidence": 89.04927062988281,
          "Instances": [],
          "Parents": [
            {
              "Name": "Sleeve"
            },
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Costume",
          "Confidence": 85.83633422851562,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Woman",
          "Confidence": 80.43788146972656,
          "Instances": [],
          "Parents": [
            {
              "Name": "Female"
            },
            {
              "Name": "Person"
            }
          ]
        },
        {
          "Name": "Robe",
          "Confidence": 68.16088104248047,
          "Instances": [],
          "Parents": [
            {
              "Name": "Fashion"
            },
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Fashion",
          "Confidence": 68.16088104248047,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Sari",
          "Confidence": 56.75322723388672,
          "Instances": [],
          "Parents": [
            {
              "Name": "Silk"
            },
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Silk",
          "Confidence": 56.75322723388672,
          "Instances": [],
          "Parents": []
        }
      ]
    },
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
        "rule_id": "zoomable-image",
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
      },
      {
        "image_type": "main",
        "rule_id": "no_promo_text",
        "analyzer": "text",
        "definitions": [
          {
            "equals": {
              "$.is_promo_text_present": "false"
            }
          }
        ],
        "compliance_level": "Must Meet"
      }
    ],
    "metadata": {
      "format": "jpeg",
      "width": 267,
      "height": 500,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.64
    },
    "histogram": {
      "is_white_background": "true"
    },
    "text": {
      "TextDetections": [
        {
          "DetectedText": "Champion",
          "Type": "LINE",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06300010532140732,
              "Left": 0.21371883153915405,
              "Top": 0.2310895174741745
            }
          }
        },
        {
          "DetectedText": "Champion",
          "Type": "WORD",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06165669858455658,
              "Left": 0.21371883153915405,
              "Top": 0.23176123201847076
            }
          }
        }
      ]
    }
  });
  let label = imageData.getLabel();
  let listingRulesExecutionResults = executeRule.isModelCentred(label.getLabelObject(), imageData.getMetadata());
  expect(listingRulesExecutionResults).toBe(false);
});

//https://www.amazon.com/Engraved-Personalized-Anniversary-Christmas-Husband/dp/B0B1DYZM8R/ref=sr_1_19_sspa?crid=66YN9JDHHSMQ&keywords=watch&qid=1663750283&sprefix=watc%2Caps%2C318&sr=8-19-spons&psc=1
it("execute-is-model-centred-fails-example-2", async function () {
  let imageData = new FinalImageData({
    "image_key": "qc/private/_job_id/qc_biypsn0k/input/images/main.jpg",
    "object": {
      "label": [
        {
          "Name": "Pants",
          "Confidence": 99.9988784790039,
          "Instances": [
            {
              "BoundingBox": {
                "Width": 0.6667912602424622,
                "Height": 0.9057518839836121,
                "Left": 0.3314512372016907,
                "Top": 0.03906320407986641
              },
              "Confidence": 93.94136810302734
            }
          ],
          "Parents": [
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Clothing",
          "Confidence": 99.9988784790039,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.9988784790039,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Jeans",
          "Confidence": 99.6529541015625,
          "Instances": [],
          "Parents": [
            {
              "Name": "Pants"
            },
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Denim",
          "Confidence": 99.6529541015625,
          "Instances": [],
          "Parents": [
            {
              "Name": "Pants"
            },
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Person",
          "Confidence": 82.91325378417969,
          "Instances": [
            {
              "BoundingBox": {
                "Width": 0.621890664100647,
                "Height": 0.9699154496192932,
                "Left": 0.37635186314582825,
                "Top": 0.017293786630034447
              },
              "Confidence": 82.91325378417969
            }
          ],
          "Parents": []
        },
        {
          "Name": "Human",
          "Confidence": 82.91325378417969,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Footwear",
          "Confidence": 80.6022720336914,
          "Instances": [],
          "Parents": [
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Shoe",
          "Confidence": 73.59746551513672,
          "Instances": [],
          "Parents": [
            {
              "Name": "Footwear"
            },
            {
              "Name": "Clothing"
            }
          ]
        }
      ]
    },
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
        "rule_id": "zoomable-image",
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
      },
      {
        "image_type": "main",
        "rule_id": "no_promo_text",
        "analyzer": "text",
        "definitions": [
          {
            "equals": {
              "$.is_promo_text_present": "false"
            }
          }
        ],
        "compliance_level": "Must Meet"
      }
    ],
    "metadata": {
      "format": "jpeg",
      "width": 569,
      "height": 908,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.64
    },
    "histogram": {
      "is_white_background": "true"
    },
    "text": {
      "TextDetections": [
        {
          "DetectedText": "Champion",
          "Type": "LINE",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06300010532140732,
              "Left": 0.21371883153915405,
              "Top": 0.2310895174741745
            }
          }
        },
        {
          "DetectedText": "Champion",
          "Type": "WORD",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06165669858455658,
              "Left": 0.21371883153915405,
              "Top": 0.23176123201847076
            }
          }
        }
      ]
    }
  });
  let label = imageData.getLabel();
  let listingRulesExecutionResults = executeRule.isModelCentred(label.getLabelObject(), imageData.getMetadata());
  expect(listingRulesExecutionResults).toBe(false);
});

//https://www.amazon.com/HUNGSON-Stretch-Destroyed-Ripped-Striped/dp/B09TFLLZ3Y/ref=sr_1_58_sspa?crid=UIWXOL3YK5QT&keywords=jeans+for+men&qid=1664177309&sprefix=jeans%2Caps%2C314&sr=8-58-spons&psc=1
it("execute-is-model-centred-fails-example-3", async function () {
  let imageData = new FinalImageData({
    "image_key": "qc/private/_job_id/qc_biypsn0k/input/images/main.jpg",
    "object": {
      "label": [
        {
          "Name": "Pants",
          "Confidence": 99.99998474121094,
          "Instances": [],
          "Parents": [
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Clothing",
          "Confidence": 99.99998474121094,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.99998474121094,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Jeans",
          "Confidence": 99.96748352050781,
          "Instances": [],
          "Parents": [
            {
              "Name": "Pants"
            },
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Denim",
          "Confidence": 99.96748352050781,
          "Instances": [],
          "Parents": [
            {
              "Name": "Pants"
            },
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Person",
          "Confidence": 88.63439178466797,
          "Instances": [
            {
              "BoundingBox": {
                "Width": 0.6762601137161255,
                "Height": 0.998630166053772,
                "Left": 0.036632489413022995,
                "Top": 0
              },
              "Confidence": 88.63439178466797
            }
          ],
          "Parents": []
        },
        {
          "Name": "Human",
          "Confidence": 88.63439178466797,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Shorts",
          "Confidence": 55.2618522644043,
          "Instances": [],
          "Parents": [
            {
              "Name": "Clothing"
            }
          ]
        }
      ]
    },
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
        "rule_id": "zoomable-image",
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
      },
      {
        "image_type": "main",
        "rule_id": "no_promo_text",
        "analyzer": "text",
        "definitions": [
          {
            "equals": {
              "$.is_promo_text_present": "false"
            }
          }
        ],
        "compliance_level": "Must Meet"
      }
    ],
    "metadata": {
      "format": "jpeg",
      "width": 569,
      "height": 730,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.64
    },
    "histogram": {
      "is_white_background": "true"
    },
    "text": {
      "TextDetections": [
        {
          "DetectedText": "Champion",
          "Type": "LINE",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06300010532140732,
              "Left": 0.21371883153915405,
              "Top": 0.2310895174741745
            }
          }
        },
        {
          "DetectedText": "Champion",
          "Type": "WORD",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06165669858455658,
              "Left": 0.21371883153915405,
              "Top": 0.23176123201847076
            }
          }
        }
      ]
    }
  });
  let label = imageData.getLabel();
  let listingRulesExecutionResults = executeRule.isModelCentred(label.getLabelObject(), imageData.getMetadata());
  expect(listingRulesExecutionResults).toBe(false)
});

// https://www.amazon.com/Happy-Sailed-Shoulder-Dresses-Drawstring/dp/B0823MZHYL/ref=sr_1_8?keywords=western+dress+for+women&qid=1664431915&qu=eyJxc2MiOiI5LjQyIiwicXNhIjoiOS4yMyIsInFzcCI6IjguNjcifQ%3D%3D&sprefix=western+fress%2Caps%2C285&sr=8-8
it("execute-is-model-centred-fails-example-4", async function () {
  let imageData = new FinalImageData({
    "image_key": "qc/private/_job_id/qc_biypsn0k/input/images/main.jpg",
    "object": {
      "label": [
        {
          "Name": "Dress",
          "Confidence": 99.99860382080078,
          "Instances": [],
          "Parents": [
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Clothing",
          "Confidence": 99.99860382080078,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.99860382080078,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Female",
          "Confidence": 99.7177734375,
          "Instances": [],
          "Parents": [
            {
              "Name": "Person"
            }
          ]
        },
        {
          "Name": "Person",
          "Confidence": 99.7177734375,
          "Instances": [
            {
              "BoundingBox": {
                "Width": 0.7545837759971619,
                "Height": 0.9505051374435425,
                "Left": 0.23305507004261017,
                "Top": 0
              },
              "Confidence": 91.8716812133789
            }
          ],
          "Parents": []
        },
        {
          "Name": "Human",
          "Confidence": 99.7177734375,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Woman",
          "Confidence": 98.57264709472656,
          "Instances": [],
          "Parents": [
            {
              "Name": "Female"
            },
            {
              "Name": "Person"
            }
          ]
        },
        {
          "Name": "Home Decor",
          "Confidence": 73.7168197631836,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Fashion",
          "Confidence": 69.21610260009766,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Girl",
          "Confidence": 60.555110931396484,
          "Instances": [],
          "Parents": [
            {
              "Name": "Female"
            },
            {
              "Name": "Person"
            }
          ]
        },
        {
          "Name": "Footwear",
          "Confidence": 60.18431854248047,
          "Instances": [],
          "Parents": [
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Costume",
          "Confidence": 58.286033630371094,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Robe",
          "Confidence": 55.969303131103516,
          "Instances": [],
          "Parents": [
            {
              "Name": "Fashion"
            },
            {
              "Name": "Clothing"
            }
          ]
        }
      ]
    },
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
        "rule_id": "zoomable-image",
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
      },
      {
        "image_type": "main",
        "rule_id": "no_promo_text",
        "analyzer": "text",
        "definitions": [
          {
            "equals": {
              "$.is_promo_text_present": "false"
            }
          }
        ],
        "compliance_level": "Must Meet"
      }
    ],
    "metadata": {
      "format": "jpeg",
      "width": 312,
      "height": 550,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.64
    },
    "histogram": {
      "is_white_background": "true"
    },
    "text": {
      "TextDetections": [
        {
          "DetectedText": "Champion",
          "Type": "LINE",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06300010532140732,
              "Left": 0.21371883153915405,
              "Top": 0.2310895174741745
            }
          }
        },
        {
          "DetectedText": "Champion",
          "Type": "WORD",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06165669858455658,
              "Left": 0.21371883153915405,
              "Top": 0.23176123201847076
            }
          }
        }
      ]
    }
  });
  let label = imageData.getLabel();
  let listingRulesExecutionResults = executeRule.isModelCentred(label.getLabelObject(), imageData.getMetadata());
  expect(listingRulesExecutionResults).toBe(false);
});

// https://www.amazon.com/Henith-Collection-Pakistani-Designer-Embroidered/dp/B08WRC1SHB/ref=sr_1_16?keywords=salwar+suit&qid=1664432669&qu=eyJxc2MiOiI5LjgxIiwicXNhIjoiOC4yMSIsInFzcCI6IjYuMjIifQ%3D%3D&sprefix=salwar%2Caps%2C317&sr=8-16
it("execute-is-model-centred-fails-example-5", async function () {
  let imageData = new FinalImageData({
    "image_key": "qc/private/_job_id/qc_biypsn0k/input/images/main.jpg",
    "object": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.83906555175781,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.83906555175781,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Dress",
          "Confidence": 97.72455596923828,
          "Instances": [],
          "Parents": [
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Sleeve",
          "Confidence": 97.49176788330078,
          "Instances": [],
          "Parents": [
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Costume",
          "Confidence": 94.73687744140625,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Female",
          "Confidence": 91.95489501953125,
          "Instances": [],
          "Parents": [
            {
              "Name": "Person"
            }
          ]
        },
        {
          "Name": "Person",
          "Confidence": 91.95489501953125,
          "Instances": [
            {
              "BoundingBox": {
                "Width": 0.6178385615348816,
                "Height": 0.925187349319458,
                "Left": 0.3479759693145752,
                "Top": 0.009918351657688618
              },
              "Confidence": 87.43666076660156
            }
          ],
          "Parents": []
        },
        {
          "Name": "Human",
          "Confidence": 91.95489501953125,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Long Sleeve",
          "Confidence": 89.98538208007812,
          "Instances": [],
          "Parents": [
            {
              "Name": "Sleeve"
            },
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Fashion",
          "Confidence": 76.20475006103516,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Woman",
          "Confidence": 76.13492584228516,
          "Instances": [],
          "Parents": [
            {
              "Name": "Female"
            },
            {
              "Name": "Person"
            }
          ]
        },
        {
          "Name": "Sari",
          "Confidence": 68.95658111572266,
          "Instances": [],
          "Parents": [
            {
              "Name": "Silk"
            },
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Silk",
          "Confidence": 68.95658111572266,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Pants",
          "Confidence": 63.75258255004883,
          "Instances": [],
          "Parents": [
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Evening Dress",
          "Confidence": 59.83741760253906,
          "Instances": [],
          "Parents": [
            {
              "Name": "Robe"
            },
            {
              "Name": "Gown"
            },
            {
              "Name": "Fashion"
            },
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Gown",
          "Confidence": 59.83741760253906,
          "Instances": [],
          "Parents": [
            {
              "Name": "Fashion"
            },
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Robe",
          "Confidence": 59.83741760253906,
          "Instances": [],
          "Parents": [
            {
              "Name": "Fashion"
            },
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "People",
          "Confidence": 59.78803634643555,
          "Instances": [],
          "Parents": [
            {
              "Name": "Person"
            }
          ]
        },
        {
          "Name": "Jeans",
          "Confidence": 57.043601989746094,
          "Instances": [],
          "Parents": [
            {
              "Name": "Pants"
            },
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Denim",
          "Confidence": 57.043601989746094,
          "Instances": [],
          "Parents": [
            {
              "Name": "Pants"
            },
            {
              "Name": "Clothing"
            }
          ]
        }
      ]
    },
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
        "rule_id": "zoomable-image",
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
      },
      {
        "image_type": "main",
        "rule_id": "no_promo_text",
        "analyzer": "text",
        "definitions": [
          {
            "equals": {
              "$.is_promo_text_present": "false"
            }
          }
        ],
        "compliance_level": "Must Meet"
      }
    ],
    "metadata": {
      "format": "jpeg",
      "width": 336,
      "height": 550,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.64
    },
    "histogram": {
      "is_white_background": "true"
    },
    "text": {
      "TextDetections": [
        {
          "DetectedText": "Champion",
          "Type": "LINE",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06300010532140732,
              "Left": 0.21371883153915405,
              "Top": 0.2310895174741745
            }
          }
        },
        {
          "DetectedText": "Champion",
          "Type": "WORD",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06165669858455658,
              "Left": 0.21371883153915405,
              "Top": 0.23176123201847076
            }
          }
        }
      ]
    }
  });
  let label = imageData.getLabel();
  let listingRulesExecutionResults = executeRule.isModelCentred(label.getLabelObject(), imageData.getMetadata());
  expect(listingRulesExecutionResults).toBe(false);
});

//https://www.amazon.coxm/Customized-Husband-Personalized-Anniversary-Groomsmen/dp/B07PY7263G?psc=1&pd_rd_w=POGSm&content-id=amzn1.sym.bd5307ce-7a5d-4d8d-b230-892bb061ae28&pf_rd_p=bd5307ce-7a5d-4d8d-b230-892bb061ae28&pf_rd_r=1XX3PFMY26XH1A2VCDJ2&pd_rd_wg=0CKOX&pd_rd_r=b2323190-d739-4bec-883e-e24c0a016140&ref_=sspa_dk_rhf_search_pt_sub_3&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzTTRRNDFGQjYxRzI3JmVuY3J5cHRlZElkPUEwNzEyNTgxNUZFNFZSN1pTQ1hGJmVuY3J5cHRlZEFkSWQ9QTA1Mjg0NDczNUxCR1NSV0U0WDkwJndpZGdldE5hbWU9c3BfcmhmX3NlYXJjaF9wZXJzb25hbGl6ZWQmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl
it("execute-is-model-centred-fails-example-6", async function () {
  let imageData = new FinalImageData({
    "image_key": "qc/private/_job_id/qc_biypsn0k/input/images/main.jpg",
    "object": {
      "label": [
        {
          "Name": "Pants",
          "Confidence": 99.9999008178711,
          "Instances": [
            {
              "BoundingBox": {
                "Width": 0.6088374257087708,
                "Height": 0.8727976083755493,
                "Left": 0.34161296486854553,
                "Top": 0.06425019353628159
              },
              "Confidence": 54.95402908325195
            }
          ],
          "Parents": [
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Clothing",
          "Confidence": 99.9999008178711,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.9999008178711,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Jeans",
          "Confidence": 99.94503784179688,
          "Instances": [],
          "Parents": [
            {
              "Name": "Pants"
            },
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Denim",
          "Confidence": 99.94503784179688,
          "Instances": [],
          "Parents": [
            {
              "Name": "Pants"
            },
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Person",
          "Confidence": 92.09423065185547,
          "Instances": [
            {
              "BoundingBox": {
                "Width": 0.5721108317375183,
                "Height": 0.9434852004051208,
                "Left": 0.3632309138774872,
                "Top": 0.020512644201517105
              },
              "Confidence": 92.09423065185547
            }
          ],
          "Parents": []
        },
        {
          "Name": "Human",
          "Confidence": 92.09423065185547,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Footwear",
          "Confidence": 61.05280303955078,
          "Instances": [],
          "Parents": [
            {
              "Name": "Clothing"
            }
          ]
        }
      ]
    },
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
        "rule_id": "zoomable-image",
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
      },
      {
        "image_type": "main",
        "rule_id": "no_promo_text",
        "analyzer": "text",
        "definitions": [
          {
            "equals": {
              "$.is_promo_text_present": "false"
            }
          }
        ],
        "compliance_level": "Must Meet"
      }
    ],
    "metadata": {
      "format": "jpeg",
      "width": 569,
      "height": 859,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.64
    },
    "histogram": {
      "is_white_background": "true"
    },
    "text": {
      "TextDetections": [
        {
          "DetectedText": "Champion",
          "Type": "LINE",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06300010532140732,
              "Left": 0.21371883153915405,
              "Top": 0.2310895174741745
            }
          }
        },
        {
          "DetectedText": "Champion",
          "Type": "WORD",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06165669858455658,
              "Left": 0.21371883153915405,
              "Top": 0.23176123201847076
            }
          }
        }
      ]
    }
  });
  let label = imageData.getLabel();
  let listingRulesExecutionResults = executeRule.isModelCentred(label.getLabelObject(), imageData.getMetadata());
  expect(listingRulesExecutionResults).toBe(false)

});

//https://www.amazon.com/Engraved-Personalized-Anniversary-Christmas-Husband/dp/B0B1DYZM8R/ref=sr_1_19_sspa?crid=66YN9JDHHSMQ&keywords=watch&qid=1663750283&sprefix=watc%2Caps%2C318&sr=8-19-spons&psc=1
it("execute-is-model-centred-pass-example-1", async function () {
  let imageData = new FinalImageData({
    "image_key": "qc/private/_job_id/qc_biypsn0k/input/images/main.jpg",
    "object": {
      "label": [
        {
          "Name": "Wristwatch",
          "Confidence": 99.5732650756836,
          "Instances": [
            {
              "BoundingBox": {
                "Width": 0.5049351453781128,
                "Height": 0.9577600359916687,
                "Left": 0.01923634484410286,
                "Top": 0.029577426612377167
              },
              "Confidence": 99.5732650756836
            },
            {
              "BoundingBox": {
                "Width": 0.8105400204658508,
                "Height": 0.8798858523368835,
                "Left": 0.07898057252168655,
                "Top": 0.049324311316013336
              },
              "Confidence": 69.14482116699219
            }
          ],
          "Parents": []
        },
        {
          "Name": "Clock Tower",
          "Confidence": 93.85442352294922,
          "Instances": [
            {
              "BoundingBox": {
                "Width": 0.4666319191455841,
                "Height": 0.6512957811355591,
                "Left": 0.025093022733926773,
                "Top": 0.12323319166898727
              },
              "Confidence": 93.85442352294922
            }
          ],
          "Parents": [
            {
              "Name": "Tower"
            },
            {
              "Name": "Architecture"
            },
            {
              "Name": "Building"
            }
          ]
        },
        {
          "Name": "Building",
          "Confidence": 93.85442352294922,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Architecture",
          "Confidence": 93.85442352294922,
          "Instances": [],
          "Parents": [
            {
              "Name": "Building"
            }
          ]
        },
        {
          "Name": "Tower",
          "Confidence": 93.85442352294922,
          "Instances": [],
          "Parents": [
            {
              "Name": "Architecture"
            },
            {
              "Name": "Building"
            }
          ]
        }
      ]
    },
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
        "rule_id": "zoomable-image",
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
      },
      {
        "image_type": "main",
        "rule_id": "no_promo_text",
        "analyzer": "text",
        "definitions": [
          {
            "equals": {
              "$.is_promo_text_present": "false"
            }
          }
        ],
        "compliance_level": "Must Meet"
      }
    ],
    "metadata": {
      "format": "jpeg",
      "width": 679,
      "height": 637,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.64
    },
    "histogram": {
      "is_white_background": "true"
    },
    "text": {
      "TextDetections": [
        {
          "DetectedText": "Champion",
          "Type": "LINE",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06300010532140732,
              "Left": 0.21371883153915405,
              "Top": 0.2310895174741745
            }
          }
        },
        {
          "DetectedText": "Champion",
          "Type": "WORD",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06165669858455658,
              "Left": 0.21371883153915405,
              "Top": 0.23176123201847076
            }
          }
        }
      ]
    }
  });
  let label = imageData.getLabel();
  let listingRulesExecutionResults = executeRule.isModelCentred(label.getLabelObject(), imageData.getMetadata());
  expect(listingRulesExecutionResults).toBe(true)
});

//https://www.amazon.com/DOINLINE-Sweatsuit-Tracksuit-Jogging-Athletic/dp/B0999LR86T/ref=sr_1_26?crid=3LOE7NOVDAAMG&keywords=jeans+for+men+set&qid=1663830743&sprefix=jeans+for+men+se%2Caps%2C299&sr=8-26
it("execute-is-model-centred-pass-example-2", async function () {
  let imageData = new FinalImageData({
    "image_key": "qc/private/_job_id/qc_biypsn0k/input/images/main.jpg",
    "object": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.98716735839844,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.98716735839844,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Pants",
          "Confidence": 98.62330627441406,
          "Instances": [],
          "Parents": [
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Jacket",
          "Confidence": 98.52172088623047,
          "Instances": [],
          "Parents": [
            {
              "Name": "Coat"
            },
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Coat",
          "Confidence": 98.52172088623047,
          "Instances": [],
          "Parents": [
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Sleeve",
          "Confidence": 83.0567855834961,
          "Instances": [],
          "Parents": [
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Long Sleeve",
          "Confidence": 80.81025695800781,
          "Instances": [],
          "Parents": [
            {
              "Name": "Sleeve"
            },
            {
              "Name": "Clothing"
            }
          ]
        },
        {
          "Name": "Person",
          "Confidence": 75.47421264648438,
          "Instances": [
            {
              "BoundingBox": {
                "Width": 0.7926260232925415,
                "Height": 0.9425236582756042,
                "Left": 0.011361980810761452,
                "Top": 0.012511104345321655
              },
              "Confidence": 75.47421264648438
            },
            {
              "BoundingBox": {
                "Width": 0.418428510427475,
                "Height": 0.9356551170349121,
                "Left": 0.554753839969635,
                "Top": 0.03244885802268982
              },
              "Confidence": 62.33361053466797
            }
          ],
          "Parents": []
        },
        {
          "Name": "Human",
          "Confidence": 75.47421264648438,
          "Instances": [],
          "Parents": []
        },
        {
          "Name": "Blazer",
          "Confidence": 73.97586059570312,
          "Instances": [],
          "Parents": [
            {
              "Name": "Jacket"
            },
            {
              "Name": "Coat"
            },
            {
              "Name": "Clothing"
            }
          ]
        }]
    },
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
        "rule_id": "zoomable-image",
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
      },
      {
        "image_type": "main",
        "rule_id": "no_promo_text",
        "analyzer": "text",
        "definitions": [
          {
            "equals": {
              "$.is_promo_text_present": "false"
            }
          }
        ],
        "compliance_level": "Must Meet"
      }
    ],
    "metadata": {
      "format": "jpeg",
      "width": 522,
      "height": 498,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.64
    },
    "histogram": {
      "is_white_background": "true"
    },
    "text": {
      "TextDetections": [
        {
          "DetectedText": "Champion",
          "Type": "LINE",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06300010532140732,
              "Left": 0.21371883153915405,
              "Top": 0.2310895174741745
            }
          }
        },
        {
          "DetectedText": "Champion",
          "Type": "WORD",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06165669858455658,
              "Left": 0.21371883153915405,
              "Top": 0.23176123201847076
            }
          }
        }
      ]
    }
  });
  let label = imageData.getLabel();
  let listingRulesExecutionResults = executeRule.isModelCentred(label.getLabelObject(), imageData.getMetadata());
  expect(listingRulesExecutionResults).toBe(true);
});

it("execute-is-model-back-visible", async function () {

  let bodyDetection = new BodyDetection(
    {
      "image_name": "/tmp/tmpdks1vi4e.jpg",
      "face_visible": false,
      "back_visible": true,
      "shoulder_angle": 0,
      "pose": "standing",
      "landmarks": []
    }
  );
  let Details = {
    "listing_details": {
      "is_multipack": false,
      "is_video_available": true,
      "_is_below_the_knee": false,
      "_is_above_the_knee": false,
      "_is_back_visible": true,
      "is_below_the_waist": true
    }
  }
  let listingDetails = new ListingDetails(Details.listing_details);
  let listingRulesExecutionResults = executeRule.isBackDetailKeySellingFeatuer(bodyDetection, 90, listingDetails);
  expect(listingRulesExecutionResults.getExecutionResults()).toBe(true);
  console.log("data" + JSON.stringify(listingRulesExecutionResults));
});

it("back-detail-key-selling-featuer-1", async function () {

  let bodyDetection = new BodyDetection(
    {
      "image_name": "/tmp/tmp4l3rf6ah.jpg",
      "face_visible": false,
      "back_visible": true,
      "shoulder_angle": 10,
      "pose": "standing",
      "landmarks": []
    }
  );
  let Details = {
    "listing_details": {
      "is_multipack": true,
      "is_video_available": false,
      "_is_below_the_knee": true,
      "_is_above_the_knee": true,
      "is_below_the_waist": false,
      "_is_back_visible": true
    }
  }
  let listingDetails = new ListingDetails(Details.listing_details);
  let listingRulesExecutionResults = executeRule.isBackDetailKeySellingFeatuer(bodyDetection, 90, listingDetails);
  expect(listingRulesExecutionResults.getExecutionResults()).toBe(true);
});

it("is-multipack-has-model", async function () {

  let imageData = new FinalImageData({
    "image_key": "qc/private/_job_id/qc_biypsn0k/input/images/main.jpg",
    "object": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.9909896850586,
          "Instances": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.9909896850586,
          "Instances": []
        },
        {
          "Name": "Sleeve",
          "Confidence": 95.00950622558594,
          "Instances": []
        },
        {
          "Name": "T-Shirt",
          "Confidence": 92.51558685302734,
          "Instances": []
        },
        {
          "Name": "Person",
          "Confidence": 83.80008697509766,
          "Instances": [
            {
              "Confidence": 83.80008697509766,
              "BoundingBox": {
                "Width": 0.9778540134429932,
                "Height": 0.9044285416603088,
                "Left": 0.013950061984360218,
                "Top": 0.016401611268520355
              }
            }
          ]
        },
        {
          "Name": "Human",
          "Confidence": 83.80008697509766,
          "Instances": []
        },
        {
          "Name": "Shirt",
          "Confidence": 77.56671905517578,
          "Instances": []
        }
      ]
    },
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
      },
      {
        "image_type": "main",
        "rule_id": "no_promo_text",
        "analyzer": "text",
        "definitions": [
          {
            "equals": {
              "$.is_promo_text_present": "false"
            }
          }
        ],
        "compliance_level": "Must Meet"
      }
    ],
    "metadata": {
      "format": "jpeg",
      "width": 960,
      "height": 1500,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.64
    },
    "histogram": {
      "is_white_background": "true"
    },
    "text": {
      "TextDetections": [
        {
          "DetectedText": "Champion",
          "Type": "LINE",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06300010532140732,
              "Left": 0.21371883153915405,
              "Top": 0.2310895174741745
            }
          }
        },
        {
          "DetectedText": "Champion",
          "Type": "WORD",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06165669858455658,
              "Left": 0.21371883153915405,
              "Top": 0.23176123201847076
            }
          }
        }
      ]
    }
  });
  let rule = new Rule({
    "image_type": "main",
    "rule_id": "single_model_in_main_image",
    "analyzer": "object",
    "confidence_level": 80,
    "compliance_level": "critical_issues"
  });
  let label = imageData.getLabel();
  let Details = {
    "listing_details": {
      "is_multipack": true,
      "is_video_available": false,
      "_is_below_the_knee": true,
      "_is_above_the_knee": true,
      "is_below_the_waist": false,
      "_is_back_visible": true
    }
  }
  let listingDetails = new ListingDetails(Details.listing_details);
  let currentRuleResult = executeRule.isMultipackHasModel(label.getLabelObject(), rule.getConfidenceLevel(), listingDetails);
  expect(currentRuleResult.getExecutionResults()).toBe(true);
});

it("is-accessory-has-model", async function () {

  let imageData = new FinalImageData({
    "image_key": "qc/private/_job_id/qc_biypsn0k/input/images/main.jpg",
    "object": {
      "label": [
        {
          "Name": "Clothing",
          "Confidence": 99.9909896850586,
          "Instances": []
        },
        {
          "Name": "Apparel",
          "Confidence": 99.9909896850586,
          "Instances": []
        },
        {
          "Name": "Sleeve",
          "Confidence": 95.00950622558594,
          "Instances": []
        },
        {
          "Name": "T-Shirt",
          "Confidence": 92.51558685302734,
          "Instances": []
        },
        {
          "Name": "Person",
          "Confidence": 83.80008697509766,
          "Instances": [
            {
              "Confidence": 83.80008697509766,
              "BoundingBox": {
                "Width": 0.9778540134429932,
                "Height": 0.9044285416603088,
                "Left": 0.013950061984360218,
                "Top": 0.016401611268520355
              }
            }
          ]
        },
        {
          "Name": "Human",
          "Confidence": 83.80008697509766,
          "Instances": []
        },
        {
          "Name": "Shirt",
          "Confidence": 77.56671905517578,
          "Instances": []
        }
      ]
    },
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
      },
      {
        "image_type": "main",
        "rule_id": "no_promo_text",
        "analyzer": "text",
        "definitions": [
          {
            "equals": {
              "$.is_promo_text_present": "false"
            }
          }
        ],
        "compliance_level": "Must Meet"
      }
    ],
    "metadata": {
      "format": "jpeg",
      "width": 960,
      "height": 1500,
      "space": "srgb",
      "dpi": 72,
      "aspect_ratio": 0.64
    },
    "histogram": {
      "is_white_background": "true"
    },
    "text": {
      "TextDetections": [
        {
          "DetectedText": "Champion",
          "Type": "LINE",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06300010532140732,
              "Left": 0.21371883153915405,
              "Top": 0.2310895174741745
            }
          }
        },
        {
          "DetectedText": "Champion",
          "Type": "WORD",
          "Confidence": 97.89178466796875,
          "Geometry": {
            "BoundingBox": {
              "Width": 0.47782081365585327,
              "Height": 0.06165669858455658,
              "Left": 0.21371883153915405,
              "Top": 0.23176123201847076
            }
          }
        }
      ]
    }
  });
  let rule = new Rule({
    "image_type": "main",
    "rule_id": "single_model_in_main_image",
    "analyzer": "object",
    "confidence_level": 80,
    "compliance_level": "critical_issues"
  });
  let label = imageData.getLabel();
  let Details = {
    "listing_details": {
      "is_multipack": true,
      "is_video_available": false,
      "_is_below_the_knee": true,
      "_is_above_the_knee": true,
      "is_below_the_waist": false,
      "_is_back_visible": true
    }
  }
  let listingDetails = new ListingDetails(Details.listing_details);
  let currentRuleResult = executeRule.isAccessoriesModleExist(label.getLabelObject(), rule.getConfidenceLevel());
  expect(currentRuleResult.getExecutionResults()).toBe(true);
});

