const {scrapASIN, scrapDomainName} = require("../../../src/util/qc-product-listing-utils");
const {amazonScrapper, parseRainforestResponse, handler} = require("../../../src/lambdas/qc-product-listing-details");
const JobInput = require("../../../src/models/job-input");
const {Logger} = require("@aws-lambda-powertools/logger");

describe('Extract ASIN from URL', function () {
  it("ASIN must be present", async () => {
    const url = "https://www.amazon.com/Ulla-Johnson-Womens-Koa-Goldenrod/dp/B09PRRWK82/?_encoding=UTF8&pd_rd_w=Mkgh7&content-id=amzn1.sym.8cf3b8ef-6a74-45dc-9f0d-6409eb523603&pf_rd_p=8cf3b8ef-6a74-45dc-9f0d-6409eb523603&pf_rd_r=7FPVHYRTXZMWTWCNX743&pd_rd_wg=TNDX6&pd_rd_r=26039ca5-b84f-48da-a9fa-5cb455938c97&ref_=pd_gw_ci_mcx_mi"
    expect(scrapASIN(url)).toBe("B09PRRWK82");
  })

  it("ASIN must be present from Apple store URL", async () => {
    const url = "https://www.amazon.com/Apple-Watch-Green-Aluminum-Clover/dp/B09HF1DC1J?ref_=ast_sto_dp&th=1&psc=1"
    expect(scrapASIN(url)).toBe("B09HF1DC1J");
  })
});


describe("Extract domain from URL", function () {
  it("must match amazon.com", function () {
    const url = "https://www.amazon.com/Ulla-Johnson-Womens-Koa-Goldenrod/dp/B09PRRWK82/?_encoding=UTF8&pd_rd_w=Mkgh7&content-id=amzn1.sym.8cf3b8ef-6a74-45dc-9f0d-6409eb523603&pf_rd_p=8cf3b8ef-6a74-45dc-9f0d-6409eb523603&pf_rd_r=7FPVHYRTXZMWTWCNX743&pd_rd_wg=TNDX6&pd_rd_r=26039ca5-b84f-48da-a9fa-5cb455938c97&ref_=pd_gw_ci_mcx_mi"
    let domainName = scrapDomainName(url);
    expect(domainName).toBe("amazon.com");
  });

  it("must match amazon.com when URL doesn't have www", function () {
    const url = "https://amazon.com/Ulla-Johnson-Womens-Koa-Goldenrod/dp/B09PRRWK82/?_encoding=UTF8&pd_rd_w=Mkgh7&content-id=amzn1.sym.8cf3b8ef-6a74-45dc-9f0d-6409eb523603&pf_rd_p=8cf3b8ef-6a74-45dc-9f0d-6409eb523603&pf_rd_r=7FPVHYRTXZMWTWCNX743&pd_rd_wg=TNDX6&pd_rd_r=26039ca5-b84f-48da-a9fa-5cb455938c97&ref_=pd_gw_ci_mcx_mi"
    let domainName = scrapDomainName(url);
    expect(domainName).toBe("amazon.com");
  });

  it("must match amazon.in when URL doesn't have www", function () {
    const url = "https://amazon.in/Ulla-Johnson-Womens-Koa-Goldenrod/dp/B09PRRWK82/?_encoding=UTF8&pd_rd_w=Mkgh7&content-id=amzn1.sym.8cf3b8ef-6a74-45dc-9f0d-6409eb523603&pf_rd_p=8cf3b8ef-6a74-45dc-9f0d-6409eb523603&pf_rd_r=7FPVHYRTXZMWTWCNX743&pd_rd_wg=TNDX6&pd_rd_r=26039ca5-b84f-48da-a9fa-5cb455938c97&ref_=pd_gw_ci_mcx_mi"
    let domainName = scrapDomainName(url);
    expect(domainName).toBe("amazon.in");
  });
});


describe.skip("amazon-rainforest-scrapper-tests", function () {
  it("rainforest-api-call", async () => {
    //Do no commit.
    process.env["RAINFOREST_API_KEY"] = "";
    const promise = amazonScrapper(new JobInput({
      "job_id": "qc_12345678",
      target_type: "URL",
      target_value: "https://www.amazon.com/Ulla-Johnson-Womens-Koa-Goldenrod/dp/B09PRRWK82/?_encoding=UTF8&pd_rd_w=H2oIm&content-id=amzn1.sym.8cf3b8ef-6a74-45dc-9f0d-6409eb523603&pf_rd_p=8cf3b8ef-6a74-45dc-9f0d-6409eb523603&pf_rd_r=39EQCXHQHMHQ0R93Q05C&pd_rd_wg=0DeMq&pd_rd_r=bb30b6ae-d08c-4d02-a498-b6049a142719&ref_=pd_gw_ci_mcx_mi",
      manual_upload: false,
      platform_id: "AMAZON"
    }));
    console.log(await promise);

  });

})


let sampleResponse = {
  "request_info": {
    "success": true,
    "credits_used": 56,
    "credits_used_this_request": 1,
    "credits_remaining": 444,
    "credits_reset_at": "2022-09-15T02:07:17.000Z"
  },
  "request_parameters": {
    "type": "product",
    "url": "https://www.amazon.com/Ulla-Johnson-Womens-Koa-Goldenrod/dp/B09PRRWK82/?_encoding=UTF8&pd_rd_w=j5Wd2&content-id=amzn1.sym.8cf3b8ef-6a74-45dc-9f0d-6409eb523603&pf_rd_p=8cf3b8ef-6a74-45dc-9f0d-6409eb523603&pf_rd_r=VNAVW5C4X8NG0R6G0GVH&pd_rd_wg=VJZxw&pd_rd_r=c1c7f5fe-dbf5-42d8-ae34-a1b015e5c8e8&ref_=pd_gw_ci_mcx_mi",
    "include_fields": "product.images,product.title,product.categories"
  },
  "product": {
    "title": "Ulla Johnson Women's Koa Top",
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
        "name": "Women",
        "link": "https://www.amazon.com/Womens-Fashion/b/ref=dp_bc_aui_C_2?ie=UTF8&node=7147440011",
        "category_id": "7147440011"
      },
      {
        "name": "Clothing",
        "link": "https://www.amazon.com/Womens-Clothing/b/ref=dp_bc_aui_C_3?ie=UTF8&node=1040660",
        "category_id": "1040660"
      },
      {
        "name": "Lingerie, Sleep & Lounge",
        "link": "https://www.amazon.com/Lingerie-Sleepwear-and-Loungewear/b/ref=dp_bc_aui_C_4?ie=UTF8&node=9522931011",
        "category_id": "9522931011"
      },
      {
        "name": "Sleep & Lounge",
        "link": "https://www.amazon.com/Womens-Loungewear-and-Sleepwear/b/ref=dp_bc_aui_C_5?ie=UTF8&node=2376202011",
        "category_id": "2376202011"
      },
      {
        "name": "Tops",
        "link": "https://www.amazon.com/Womens-Pajama-Tops/b/ref=dp_bc_aui_C_6?ie=UTF8&node=2376203011",
        "category_id": "2376203011"
      }
    ],
    "images": [
      {
        "link": "https://m.media-amazon.com/images/I/71kx1RdzgEL._AC_UL1500_.jpg",
        "variant": "MAIN"
      },
      {
        "link": "https://m.media-amazon.com/images/I/71sTgBB8GfL._AC_UL1500_.jpg",
        "variant": "PT01"
      },
      {
        "link": "https://m.media-amazon.com/images/I/71wV6TRIJ7L._AC_UL1500_.jpg",
        "variant": "PT02"
      },
      {
        "link": "https://m.media-amazon.com/images/I/71r5AWDoSTL._AC_UL1500_.jpg",
        "variant": "PT03"
      },
      {
        "link": "https://m.media-amazon.com/images/I/71S15kjXCmL._AC_UL1500_.jpg",
        "variant": "PT04"
      },
      {
        "link": "https://m.media-amazon.com/images/I/71flXSAY34L._AC_UL1500_.jpg",
        "variant": "PT05"
      }
    ]
  },
  "image_s3_keys": [],
  "job_id": "qc_wm83kpon"
};


describe("Parse Amazon Rainforest Response", function () {
  it("must successfully parse response", function () {
    parseRainforestResponse(sampleResponse);
  });
});

