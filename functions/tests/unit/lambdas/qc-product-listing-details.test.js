process.env.LOG_LEVEL = "DEBUG";
process.env.POWERTOOLS_SERVICE_NAME = "qc-tool";
process.env.BUCKET_NAME = "dev-pico-asset-storage-bucket-firefly";
process.env.RAINFOREST_API_KEY = "64CB1ADF29CF4BAD8AA88C685F1077BA"
process.env.CATEGORY_FILE_KEY = "qc/private/category/category.json"
process.env.FILTER_LIST_KEYWORDS_FILE_KEY = "qc/private/filter_list_keywords/filteredKeywordsList.json"
const MyEnv = require("../../../src/property/my-env");
const {isAccessories, isBackDetailKeySellingFeature, isModleBelowTheKnee, isModleAboveTheKnee, detectMultipack, findProductCategoryFromRainforestResponse, isModleBelowTheWaist} = require("../../../src/lambdas/qc-product-listing-details");
const {handler} = require("../../../src/lambdas/qc-product-listing-details");
let keywordsList = {
    "belowTheWaist": [
      "jean",
      "jeans",
      "pant",
      "pants",
      "chino",
      "chinos",
      "cargo",
      "joggers",
      "Jogger",
      "Trousers",
      "Sweatpants",
      "Pants-Reg",
      "Twill",
      "Shorts",
      "Short",
      "Pull-On",
      "inseam",
      "Skirts",
      "Skirt",
      "Leggings",
      "capri",
      "Pajama"
    ],
    "belowTheKnee": [
      "suit",
      "slip",
      "sleeveirregular",
      "robes",
      "pyjama",
      "puffer",
      "plaids",
      "pant",
      "olrain",
      "maxi",
      "legs",
      "kurta",
      "kaftan",
      "housecoat",
      "hem",
      "sleepwear",
      "club",
      "churidar",
      "belly",
      "baggy",
      "shirt",
      "slit",
      "jumpsuits",
      "Bathrobes",
      "kurta"
    ],
    "aboveTheKnee": [
      "tee",
      "sweater",
      "skater",
      "semicircle",
      "hooded",
      "crewneck",
      "cardigan",
      "above",
      "mini dresses",
      "tunic",
      "jacket",
      "longsleeve",
      "blazer",
      "sweatshirt",
      "hoodies",
      "pullover",
      "undershirt",
      "shorts",
      "boxer",
      "t-shirt",
      "short sleeve",
      "short",
      "coat",
      "rompers",
      "vest",
      "short kurta",
      "puffer"
    ],
    "multipackFilterList": [
      "multipack",
      "multi-pack",
      "pack",
      "bulk",
      "dozon",
      "pair",
      "pairs",
      "bundle"
    ],
    "backDetectionList" : [
      "sports bra", "athlete",
      "back", "athletic",
      "back", "backless",
      "booty", "butt",
      "contour", "criss",
      "crisscross", "cross",
      "gym", "keywords",
      "leggings", "medium",
      "muscle", "open",
      "running", "scrunch",
      "seamless", "shirt",
      "shirts", "strappy",
      "support", "tank",
      "tanks", "tops",
      "yoga", "y scrunch contour"
    ],
    "accessoriesSetectionList" : [
      "boy","toddlers",
      "kids","toddler",
      "girl","baby",
      "girl","scar",
      "shawl","agio",
      "scarves","hijab",
      "scarf","buckle",
      "braided","belt",
      "chaoren","cap",
      "snapback","slouchy",
      "cabbie","beanies",
      "fedora","tie",
      "necktie","gloves",
      "baclava","balaclava",
      "face mask cover","ushanka",
      "hat","earflap",
      "beanie","hats"
    ]
  };


it("run-qc-product-listing-details.js-lambda", async () => {
  const event = {
    "job_id": "qc-123-qwt123452",
    "target_type": "URL",
    "target_value": "https://www.amazon.com/Under-Armour-Sleeve-T-Shirt-Heather/dp/B07D13B3N1/ref=sr_1_2",
     //"target_value": "https://www.flipkart.com/hrx-hrithik-roshan-striped-men-round-neck-blue-t-shirt/p/itmf3ysz35zhspzp?pid=TSHESRCVSRHHFVPT&lid=LSTTSHESRCVSRHHFVPT2UENS3&marketplace=FLIPKART&store=clo&srno=b_1_2&otracker=clp_omu_Fashion%2BBrands%2Bon%2BDiscounts_7_4.dealCard.OMU_lifestyle-big-billion-days-store_lifestyle-big-billion-days-store_2319UWS5YO8G_4&otracker1=clp_omu_PINNED_neo%2Fmerchandising_Fashion%2BBrands%2Bon%2BDiscounts_NA_dealCard_cc_7_NA_view-all_4&fm=neo%2Fmerchandising&iid=en_72tGw8twMzQPF4R03YPjgytKMI6N%2BNTnQLLFui2g4jAwoW4AayWlaxOrOW%2FTtpcSQkYBReVsCJ1oZ9%2B3QVF1dw%3D%3D&ppt=browse&ppn=browse&ssid=8yt94tdbhs0000001664171542347",
    "platform_id": "AMAZON",
    "manual_upload": false
  };

  let result = await handler(event);
  console.log("data\n\n" + JSON.stringify(result));
});

//Multi-Pack Links

it("detect-multi-pack-with-pack-bulk-in-title-and-keyword", async () => {
//https://www.amazon.com/dp/B09D3QQ3N9/ref=sspa_dk_detail_4?psc=1&pd_rd_i=B09D3QQ3N9&pd_rd_w=yQUMy&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=2R1FJR4M78SXTFYNASWW&pd_rd_wg=F5MK3&pd_rd_r=59d0a721-0a02-440e-a7b4-eb2176fa71bc&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzTjkwRTNINEc5TVZBJmVuY3J5cHRlZElkPUEwMzIzNTY5M0NINzk1N0RHWDlPSSZlbmNyeXB0ZWRBZElkPUEwMDY3NDA1NTY4VVNITzdRS0FNJndpZGdldE5hbWU9c3BfZGV0YWlsX3RoZW1hdGljJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 618,
      "overage_used": 118,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-09-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/dp/B09D3QQ3N9/ref=sspa_dk_detail_4?psc=1&pd_rd_i=B09D3QQ3N9&pd_rd_w=yQUMy&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=2R1FJR4M78SXTFYNASWW&pd_rd_wg=F5MK3&pd_rd_r=59d0a721-0a02-440e-a7b4-eb2176fa71bc&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzTjkwRTNINEc5TVZBJmVuY3J5cHRlZElkPUEwMzIzNTY5M0NINzk1N0RHWDlPSSZlbmNyeXB0ZWRBZElkPUEwMDY3NDA1NTY4VVNITzdRS0FNJndpZGdldE5hbWU9c3BfZGV0YWlsX3RoZW1hdGljJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==\n",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "LAPASA Mens T-Shirt Pure Cotton 3 Pack Oversize Short Sleeve Tee Comfortable Crew Neck Soft Classic Solid Color Multipack M34 Red, Blue, Dark Green Small",
      "title_excluding_variant_name": "LAPASA Mens T-Shirt Pure Cotton 3 Pack Oversize Short Sleeve Tee Comfortable Crew Neck Soft Classic Solid Color Multipack M34",
      "keywords": "LAPASA,Mens,T-Shirt,Pure,Cotton,3,Pack,Oversize,Short,Sleeve,Tee,Comfortable,Crew,Neck,Soft,Classic,Solid,Color,Multipack,M34",
      "keywords_list": [
        "LAPASA",
        "Mens",
        "T-Shirt",
        "Pure",
        "Cotton",
        "Pack",
        "Oversize",
        "Short",
        "Sleeve",
        "Comfortable",
        "Crew",
        "Neck",
        "Soft",
        "Classic",
        "Solid",
        "Color",
        "Multipack"
      ],
      "asin": "B09D3QQ3N9",
      "link": "https://www.amazon.com/dp/B09D3QQ3N9??th=1&psc=1",
      "brand": "LAPASA",
      "has_size_guide": true,
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
          "name": "Shirts",
          "link": "https://www.amazon.com/Mens-Shirts/b/ref=dp_bc_aui_C_4?ie=UTF8&node=2476517011",
          "category_id": "2476517011"
        },
        {
          "name": "T-Shirts",
          "link": "https://www.amazon.com/Mens-T-Shirts/b/ref=dp_bc_aui_C_5?ie=UTF8&node=1045624",
          "category_id": "1045624"
        }
      ],
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "brand_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/01fce697-0826-4369-a47e-dc10ccf5e9e1.__CR0,0,315,145_PT0_SX315_V1___.jpeg",
          "title": "SIZE REMINDER LAPASA is committed to making fine T-shirts, every detail is repeatedly polished as we strive to do our best!",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/d5612587-3c4a-4221-bc63-19a67b6bd315.__CR0,0,1464,625_PT0_SX1464_V1___.png",
          "description": "Why did we choose the name LAPASA?",
          "brand_store": {
            "link": "/stores/page/292F8453-0874-4634-AB1B-114E6845C071",
            "id": "292F8453-0874-4634-AB1B-114E6845C071"
          },
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/d5612587-3c4a-4221-bc63-19a67b6bd315.__CR0,0,1464,625_PT0_SX1464_V1___.png",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/f2b832f5-5847-4ddb-a0c7-d9a0c9fe2a9e.__CR76,0,1279,1600_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/4adc97d4-60a6-4085-b8cf-cf18f4fe7d76.__CR76,0,1279,1600_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/930b28b7-ebeb-4858-a9e2-b249d1f8ec27.__CR76,0,1279,1600_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/54d220de-a784-42b9-99b2-5ff7f4de273d.__CR76,0,1279,1600_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/988e19c6-448a-460b-b12d-9e39c07669d0.__CR237,0,1888,2363_PT0_SX362_V1___.jpg"
          ],
          "products": [
            {
              "title": "Mens Colorful Tagless Cotton Soft T-Shirt, Multicolor Classic Crewneck Solid Color Short Sleeve",
              "asin": "B09D3PL4H9",
              "link": "/dp/B09D3PL4H9/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/4e96bd82-f18e-4eb9-bf64-90fe56d9dca7.__CR0,0,166,182_PT0_SX166_V1___.png"
            },
            {
              "title": "Mens Colorful Tagless Cotton Soft T-Shirt, Multicolor Classic Crewneck Solid Color Short Sleeve",
              "asin": "B09D3PL4H9",
              "link": "/dp/B09D3PL4H9/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/2a65d7bd-2199-4a22-9892-8b5b8b4ee151.__CR0,0,166,182_PT0_SX166_V1___.png"
            },
            {
              "title": "Mens Colorful Tagless Cotton Soft T-Shirt, Multicolor Classic Crewneck Solid Color Short Sleeve",
              "asin": "B09D3PL4H9",
              "link": "/dp/B09D3PL4H9/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/bb81f8f4-eeeb-4eba-8764-43254d6f6570.__CR0,0,166,182_PT0_SX166_V1___.png"
            },
            {
              "title": "Mens Colorful Tagless Cotton Soft T-Shirt, Multicolor Classic Crewneck Solid Color Short Sleeve",
              "asin": "B09D3PL4H9",
              "link": "/dp/B09D3PL4H9/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/8c4a1c2f-fd97-4520-8a41-0047612bd09a.__CR0,0,166,182_PT0_SX166_V1___.png"
            },
            {
              "title": "Mens ComfortSoft Tagless 100% Cotton T-Shirt, 4.9 oz. Regular-Fit Classic Crew & V-Neck Undershirt ",
              "asin": "B09D3N7DXL",
              "link": "/dp/B09D3N7DXL/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/36c43125-ab05-4554-bacb-a998b096ee3a.__CR0,0,166,182_PT0_SX166_V1___.png"
            },
            {
              "title": "Mens ComfortSoft Tagless 100% Cotton T-Shirt, 4.9 oz. Regular-Fit Classic Crew &amp",
              "asin": "B09D3N7DXL",
              "link": "/dp/B09D3N7DXL/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/07cacd36-1ff2-43ad-a4b2-4062697fb850.__CR0,0,166,182_PT0_SX166_V1___.png"
            },
            {
              "title": "Mens ComfortSoft Tagless 100% Cotton T-Shirt, 4.9 oz. Regular-Fit Classic Crew & V-Neck Undershirt ",
              "asin": "B09D3N7DXL",
              "link": "/dp/B09D3N7DXL/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/053d67df-d0ba-49c4-b4ea-97d854cff51c.__CR0,0,166,182_PT0_SX166_V1___.png"
            },
            {
              "title": "Mens ComfortSoft Tagless 100% Cotton T-Shirt, 4.9 oz. Regular-Fit Classic Crew & V-Neck Undershirt ",
              "asin": "B09D3N7DXL",
              "link": "/dp/B09D3N7DXL/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/6009a03f-d43a-4f5d-bafc-4799c584304e.__CR0,0,166,182_PT0_SX166_V1___.png"
            },
            {
              "title": "LAPASA Men's 100% Cotton Ribbed Tank Tops Ultra Soft Sleeveless Crewneck A-Shirts Basic Solid Und...",
              "asin": "B09D3JYZ3G",
              "link": "/dp/B09D3JYZ3G/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/414iCqr71EL.__AC_SR166,182___.jpg"
            },
            {
              "title": "LAPASA Men's 100% Cotton Ribbed Tank Tops Ultra Soft Sleeveless Crewneck A-Shirts Basic Solid Und...",
              "asin": "B09D3MKT12",
              "link": "/dp/B09D3MKT12/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/4179QptIEVL.__AC_SR166,182___.jpg"
            },
            {
              "title": "LAPASA Men's 100% Cotton Tank Top Ultra Soft Sleeveless Crewneck Breathable A-Shirts Basic Solid ...",
              "asin": "B07FTGDBSM",
              "link": "/dp/B07FTGDBSM/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31yxdhzayoL.__AC_SR166,182___.jpg"
            },
            {
              "title": "LAPASA Men's 100% Cotton Tank Top Ultra Soft Sleeveless Crewneck Breathable A-Shirts Basic Solid ...",
              "asin": "B075SWV99N",
              "link": "/dp/B075SWV99N/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31ZFc6%2Beq8L.__AC_SR166,182___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/01fce697-0826-4369-a47e-dc10ccf5e9e1.__CR0,0,315,145_PT0_SX315_V1___.jpeg",
        "company_description_text": "Why did we choose the name LAPASA?  Because Love Abundance, Positive Always, Sincere Attitude.  We reflect on all our customer’s voices to continue to grow and create the best products. With the positive lifestyles we are creating, nothing in the future is impossible."
      },
      "sub_title": {
        "text": "Visit the LAPASA Store",
        "link": "https://www.amazon.com/stores/LAPASA/page/61BD0FA1-D2AF-41B8-A072-293FFA13EDAC?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.4,
      "ratings_total": 754,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/61XEQOz1HqL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/61XEQOz1HqL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51hmeChZNoL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71MZFUDTjkL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71m5prq2MbL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/611iD8MmeEL._AC_UL1500_.jpg",
          "variant": "PT04"
        }
      ],
      "images_count": 5,
      "videos_additional": [
        {
          "product_asin": "B09D3QWY49",
          "title": "LAPASA Mens 6.7 oz. Tagless 100% Cotton Soft T-Shirt M34",
          "vendor_code": "Z7AX4",
          "vendor_name": "LAPASA-USA",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/d48a7081-b2b0-4a77-8d79-1125733a89cf/default.jobtemplate.hls.m3u8",
          "type": "videos_for_related_products"
        },
        {
          "product_asin": "B09D3QWY49",
          "title": "LAPASA Mens Colorful Tagless Cotton Soft T-Shirt 3 Pack M34",
          "vendor_code": "Z7AX4",
          "vendor_name": "LAPASA-USA",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/ac5c7d44-c7dd-48c1-8d72-04abf750668a/default.jobtemplate.hls.m3u8",
          "type": "videos_for_related_products"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 29,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Wednesday, September 14",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Tuesday, September 13",
            "name": "Or fastest delivery Tuesday, September 13"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "LAPASA-USA",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A1P0DLEXRACAOS&asin=B09D3QQ3N9&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A1P0DLEXRACAOS"
          }
        },
        "price": {
          "symbol": "$",
          "value": 38.99,
          "currency": "USD",
          "raw": "$38.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 66745,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Men's Undershirts",
          "rank": 148,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1045716/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 66745, Category: Men's Undershirts | Rank: 148"
    },
    "brand_store": {
      "id": "61BD0FA1-D2AF-41B8-A072-293FFA13EDAC",
      "link": "https://www.amazon.com/stores/LAPASA/page/61BD0FA1-D2AF-41B8-A072-293FFA13EDAC"
    }
  };


  let result = await detectMultipack(payload, filterKeywordsList);
  expect(result).toBe(true);
});

it("detect-multi-pack-in-keyword-bulk-in-title", async () => {
//https://www.amazon.com/dp/B08V53DHW7/ref=sspa_dk_detail_7?psc=1&pd_rd_i=B08V53DHW7&pd_rd_w=0cW35&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=JC253Y718TPF51MG9KT1&pd_rd_wg=jKBx3&pd_rd_r=528b6230-3255-4d96-a45b-2447209e62a8&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUFQWkVGTEpTU0E0UDYmZW5jcnlwdGVkSWQ9QTAxNDc4NDYySjg3UEE3RE5ERFlZJmVuY3J5cHRlZEFkSWQ9QTA2NjUwNzIxUDU0UktLOExBS09VJndpZGdldE5hbWU9c3BfZGV0YWlsX3RoZW1hdGljJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==
  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 621,
      "overage_used": 121,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-09-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/NewDenBer-Classic-Basic-Cotton-T-Shirt/dp/B07MKQXBXW/ref=d_pd_sbs_sccl_1_4/137-3450145-9885347?pd_rd_w=yEeHv&content-id=amzn1.sym.3676f086-9496-4fd7-8490-77cf7f43f846&pf_rd_p=3676f086-9496-4fd7-8490-77cf7f43f846&pf_rd_r=YPN25M2RGC35QKH2AC5F&pd_rd_wg=lHwLg&pd_rd_r=5a2fafb2-6349-442a-9b64-13b34312e278&pd_rd_i=B07MKQXBXW&psc=1",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "NewDenBer Men's Classic Basic Solid Crew Neck Soft Cotton T-Shirt 4 Pack XX-Large Gray/Sand/Light Blue/White",
      "title_excluding_variant_name": "NewDenBer Men's Classic Basic Solid Crew Neck Soft Cotton T-Shirt 4 Pack",
      "keywords": "NewDenBer,Men's,Classic,Basic,Solid,Crew,Neck,Soft,Cotton,T-Shirt,4,Pack",
      "keywords_list": [
        "NewDenBer",
        "Men's",
        "Classic",
        "Basic",
        "Solid",
        "Crew",
        "Neck",
        "Soft",
        "Cotton",
        "T-Shirt",
        "Pack"
      ],
      "asin": "B07MKQXBXW",
      "link": "https://www.amazon.com/dp/B07MKQXBXW??th=1&psc=1",
      "brand": "NewDenBer",
      "has_size_guide": true,
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
          "name": "Underwear",
          "link": "https://www.amazon.com/Mens-Underwear/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045706",
          "category_id": "1045706"
        },
        {
          "name": "Undershirts",
          "link": "https://www.amazon.com/Mens-Undershirts/b/ref=dp_bc_aui_C_5?ie=UTF8&node=1045716",
          "category_id": "1045716"
        }
      ],
      "promotions_feature": "Receive 1 mens white henley shirt free when you purchase 1 or more mens tshirts 4 pack offered by NDBSHOP. Here's how (restrictions apply) Add both to Cart \n   Receive 1 mens short sleeve henley shirt free when you purchase 1 or more mens tshirts 4 pack offered by NDBSHOP. Here's how (restrictions apply) Add both to Cart \n   Receive 1 mens short sleeve henley shirt free when you purchase 1 or more mens tshirts 4 pack offered by NDBSHOP. Here's how (restrictions apply) Add both to Cart",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "title": "More Choice for You",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/61c79013-6b01-442f-ad06-a5c1be422bbd.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
          "description": "Click below for more products",
          "brand_store": {
            "link": "/stores/page/0F9B9EA8-AADD-4B42-AB9B-FDAE084E71FF",
            "id": "0F9B9EA8-AADD-4B42-AB9B-FDAE084E71FF"
          },
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/61c79013-6b01-442f-ad06-a5c1be422bbd.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/0e5f11ba-3473-4148-9afe-0552283671c1.__CR0,0,362,453_PT0_SX362_V1___.jpg"
          ],
          "products": [
            {
              "title": "NewDenBer Men's Classic Basic Solid Crew Neck Soft Cotton T-Shirt 4 Pack",
              "asin": "B06VSTVN6X",
              "link": "/dp/B06VSTVN6X/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41dVOiPXbnL.__AC_SR166,182___.jpg"
            },
            {
              "title": "NewDenBer Men's Classic Basic Solid Crew Neck Soft Cotton T-Shirt 4 Pack",
              "asin": "B07M9Y3T9N",
              "link": "/dp/B07M9Y3T9N/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41LCU-HXw-L.__AC_SR166,182___.jpg"
            },
            {
              "title": "NewDenBer Men's Classic Basic Solid Crew Neck Soft Cotton T-Shirt 4 Pack",
              "asin": "B07YFQLJ1H",
              "link": "/dp/B07YFQLJ1H/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41hLWI5274L.__AC_SR166,182___.jpg"
            },
            {
              "title": "NewDenBer Men's Classic Basic Solid Crew Neck Soft Cotton T-Shirt 4 Pack",
              "asin": "B06W2GVBFM",
              "link": "/dp/B06W2GVBFM/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/417dinf2v8L.__AC_SR166,182___.jpg"
            },
            {
              "title": "NeedBo Mens Short Sleeve Dress Shirts Slim-Fit Inner Contrast Casual Button Down Shirts",
              "asin": "B08B5RL8JQ",
              "link": "/dp/B08B5RL8JQ/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41jMj54fgmL.__AC_SR166,182___.jpg"
            },
            {
              "title": "NeedBo Men's Classic Fit Short Sleeve Casual Solid Cotton Pique Polo Shirt",
              "asin": "B07PJGJL9R",
              "link": "/dp/B07PJGJL9R/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31umZLdTn0L.__AC_SR166,182___.jpg"
            },
            {
              "title": "NeedBo Mens Hiking Cargo Shorts Quick Dry Bermuda Outdoor Tactical Stretch Shorts with 5 Pockets ...",
              "asin": "B09XLKKGVP",
              "link": "/dp/B09XLKKGVP/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41SGf6Or0%2BL.__AC_SR166,182___.jpg"
            },
            {
              "title": "NeedBo Mens Golf Polo Shirts Quick-Dry Moisture Wicking Performance Short Sleeve Striped Collared...",
              "asin": "B09WMFFN8C",
              "link": "/dp/B09WMFFN8C/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41eMYZlMBXL.__AC_SR166,182___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media/sc/a8ec4787-23e5-4302-a8ba-bfb0595da7b8.__CR0,0,600,180_PT0_SX600_V1___.jpg"
      },
      "sub_title": {
        "text": "Visit the NewDenBer Store",
        "link": "https://www.amazon.com/stores/NewDenber/page/0F9B9EA8-AADD-4B42-AB9B-FDAE084E71FF?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.1,
      "ratings_total": 3654,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/515TvIwCSmL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/515TvIwCSmL._AC_UL1050_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71VslZt1IyS._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71Q4tFaREHS._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81FsZwEE-oS._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/7151ej76P2L._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61FFNiCsjrL._AC_UL1500_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "videos": [
        {
          "duration_seconds": 16,
          "width": 480,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/74f88f64-2552-444b-9387-29857edacb55/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/91Mo3RPmVeL.SX522_.png",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Men Short Sleeve Cotton Solid Shirt"
        },
        {
          "duration_seconds": 12,
          "width": 360,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/fc68ff26-e995-42a3-8cd0-7867fbc5f87f/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/51b8pjVy1IL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Men Classic Causal Short Sleeve Cotton T-Shirt"
        }
      ],
      "videos_count": 2,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/74f88f64-2552-444b-9387-29857edacb55/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/fc68ff26-e995-42a3-8cd0-7867fbc5f87f/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "product_asin": "B06VSTVN6X",
          "title": "Men Short Sleeve Cotton Solid Shirt",
          "vendor_code": "Z7AX4",
          "vendor_name": "NDBSHOP",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/74f88f64-2552-444b-9387-29857edacb55/default.jobtemplate.hls.m3u8",
          "type": "videos_for_related_products"
        },
        {
          "product_asin": "B06VSTVN6X",
          "title": "Men Classic Causal Short Sleeve Cotton T-Shirt",
          "vendor_code": "Z7AX4",
          "vendor_name": "NDBSHOP",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/fc68ff26-e995-42a3-8cd0-7867fbc5f87f/default.jobtemplate.hls.m3u8",
          "type": "videos_for_related_products"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 4,
          "hard_maximum": true
        },
        "is_prime": true,
        "is_amazon_fresh": false,
        "condition": {
          "is_new": true
        },
        "availability": {
          "type": "in_stock",
          "raw": "Only 4 left in stock - order soon.",
          "dispatch_days": 1,
          "stock_level": 4
        },
        "fulfillment": {
          "type": "2p",
          "standard_delivery": {
            "date": "Thu, Sep 15",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Wed, Sep 14",
            "name": "Or fastest delivery Wed, Sep 14"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "NDBSHOP",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A3A2SKWMOC62VF&asin=B07MKQXBXW&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A3A2SKWMOC62VF"
          }
        },
        "price": {
          "symbol": "$",
          "value": 38.99,
          "currency": "USD",
          "raw": "$38.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 40912,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Men's Undershirts",
          "rank": 103,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1045716/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 40912, Category: Men's Undershirts | Rank: 103"
    },
    "brand_store": {
      "id": "0F9B9EA8-AADD-4B42-AB9B-FDAE084E71FF",
      "link": "https://www.amazon.com/stores/NewDenber/page/0F9B9EA8-AADD-4B42-AB9B-FDAE084E71FF"
    }
  };


  let result = await detectMultipack(payload);
  expect(result).toBe(true);
});

it("detect-multi-pack-in-keyword-bulk-in-title", async () => {
//https://www.amazon.com/NewDenBer-Classic-Basic-Cotton-T-Shirt/dp/B07MKQXBXW/ref=d_pd_sbs_sccl_1_4/137-3450145-9885347?pd_rd_w=yEeHv&content-id=amzn1.sym.3676f086-9496-4fd7-8490-77cf7f43f846&pf_rd_p=3676f086-9496-4fd7-8490-77cf7f43f846&pf_rd_r=YPN25M2RGC35QKH2AC5F&pd_rd_wg=lHwLg&pd_rd_r=5a2fafb2-6349-442a-9b64-13b34312e278&pd_rd_i=B07MKQXBXW&psc=1
  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 631,
      "overage_used": 131,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-09-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/NewDenBer-Classic-Basic-Cotton-T-Shirt/dp/B07MKQXBXW/ref=d_pd_sbs_sccl_1_4/137-3450145-9885347?pd_rd_w=yEeHv&content-id=amzn1.sym.3676f086-9496-4fd7-8490-77cf7f43f846&pf_rd_p=3676f086-9496-4fd7-8490-77cf7f43f846&pf_rd_r=YPN25M2RGC35QKH2AC5F&pd_rd_wg=lHwLg&pd_rd_r=5a2fafb2-6349-442a-9b64-13b34312e278&pd_rd_i=B07MKQXBXW&psc=1",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "NewDenBer Men's Classic Basic Solid Crew Neck Soft Cotton T-Shirt 4 Pack XX-Large Gray/Sand/Light Blue/White",
      "title_excluding_variant_name": "NewDenBer Men's Classic Basic Solid Crew Neck Soft Cotton T-Shirt 4 Pack",
      "keywords": "NewDenBer,Men's,Classic,Basic,Solid,Crew,Neck,Soft,Cotton,T-Shirt,4,Pack",
      "keywords_list": [
        "NewDenBer",
        "Men's",
        "Classic",
        "Basic",
        "Solid",
        "Crew",
        "Neck",
        "Soft",
        "Cotton",
        "T-Shirt",
        "Pack"
      ],
      "asin": "B07MKQXBXW",
      "link": "https://www.amazon.com/dp/B07MKQXBXW??th=1&psc=1",
      "brand": "NewDenBer",
      "has_size_guide": true,
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
          "name": "Underwear",
          "link": "https://www.amazon.com/Mens-Underwear/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045706",
          "category_id": "1045706"
        },
        {
          "name": "Undershirts",
          "link": "https://www.amazon.com/Mens-Undershirts/b/ref=dp_bc_aui_C_5?ie=UTF8&node=1045716",
          "category_id": "1045716"
        }
      ],
      "promotions_feature": "Receive 1 mens white henley shirt free when you purchase 1 or more mens tshirts 4 pack offered by NDBSHOP. Here's how (restrictions apply) Add both to Cart \n   Receive 1 mens short sleeve henley shirt free when you purchase 1 or more mens tshirts 4 pack offered by NDBSHOP. Here's how (restrictions apply) Add both to Cart \n   Receive 1 mens short sleeve henley shirt free when you purchase 1 or more mens tshirts 4 pack offered by NDBSHOP. Here's how (restrictions apply) Add both to Cart",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "title": "More Choice for You",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/61c79013-6b01-442f-ad06-a5c1be422bbd.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
          "description": "Click below for more products",
          "brand_store": {
            "link": "/stores/page/0F9B9EA8-AADD-4B42-AB9B-FDAE084E71FF",
            "id": "0F9B9EA8-AADD-4B42-AB9B-FDAE084E71FF"
          },
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/61c79013-6b01-442f-ad06-a5c1be422bbd.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/0e5f11ba-3473-4148-9afe-0552283671c1.__CR0,0,362,453_PT0_SX362_V1___.jpg"
          ],
          "products": [
            {
              "title": "NewDenBer Men's Classic Basic Solid Crew Neck Soft Cotton T-Shirt 4 Pack",
              "asin": "B06VSTVN6X",
              "link": "/dp/B06VSTVN6X/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41dVOiPXbnL.__AC_SR166,182___.jpg"
            },
            {
              "title": "NewDenBer Men's Classic Basic Solid Crew Neck Soft Cotton T-Shirt 4 Pack",
              "asin": "B07M9Y3T9N",
              "link": "/dp/B07M9Y3T9N/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41LCU-HXw-L.__AC_SR166,182___.jpg"
            },
            {
              "title": "NewDenBer Men's Classic Basic Solid Crew Neck Soft Cotton T-Shirt 4 Pack",
              "asin": "B07YFQLJ1H",
              "link": "/dp/B07YFQLJ1H/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41hLWI5274L.__AC_SR166,182___.jpg"
            },
            {
              "title": "NewDenBer Men's Classic Basic Solid Crew Neck Soft Cotton T-Shirt 4 Pack",
              "asin": "B06W2GVBFM",
              "link": "/dp/B06W2GVBFM/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/417dinf2v8L.__AC_SR166,182___.jpg"
            },
            {
              "title": "NeedBo Mens Short Sleeve Dress Shirts Slim-Fit Inner Contrast Casual Button Down Shirts",
              "asin": "B08B5RL8JQ",
              "link": "/dp/B08B5RL8JQ/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41jMj54fgmL.__AC_SR166,182___.jpg"
            },
            {
              "title": "NeedBo Men's Classic Fit Short Sleeve Casual Solid Cotton Pique Polo Shirt",
              "asin": "B07PJGJL9R",
              "link": "/dp/B07PJGJL9R/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31umZLdTn0L.__AC_SR166,182___.jpg"
            },
            {
              "title": "NeedBo Mens Hiking Cargo Shorts Quick Dry Bermuda Outdoor Tactical Stretch Shorts with 5 Pockets ...",
              "asin": "B09XLKKGVP",
              "link": "/dp/B09XLKKGVP/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41SGf6Or0%2BL.__AC_SR166,182___.jpg"
            },
            {
              "title": "NeedBo Mens Golf Polo Shirts Quick-Dry Moisture Wicking Performance Short Sleeve Striped Collared...",
              "asin": "B09WMFFN8C",
              "link": "/dp/B09WMFFN8C/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41eMYZlMBXL.__AC_SR166,182___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media/sc/a8ec4787-23e5-4302-a8ba-bfb0595da7b8.__CR0,0,600,180_PT0_SX600_V1___.jpg"
      },
      "sub_title": {
        "text": "Visit the NewDenBer Store",
        "link": "https://www.amazon.com/stores/NewDenber/page/0F9B9EA8-AADD-4B42-AB9B-FDAE084E71FF?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.1,
      "ratings_total": 3654,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/515TvIwCSmL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/515TvIwCSmL._AC_UL1050_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71VslZt1IyS._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71Q4tFaREHS._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81FsZwEE-oS._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/7151ej76P2L._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61FFNiCsjrL._AC_UL1500_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "videos_additional": [
        {
          "product_asin": "B06VSTVN6X",
          "title": "Men Short Sleeve Cotton Solid Shirt",
          "vendor_code": "Z7AX4",
          "vendor_name": "NDBSHOP",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/74f88f64-2552-444b-9387-29857edacb55/default.jobtemplate.hls.m3u8",
          "type": "videos_for_related_products"
        },
        {
          "product_asin": "B06VSTVN6X",
          "title": "Men Classic Causal Short Sleeve Cotton T-Shirt",
          "vendor_code": "Z7AX4",
          "vendor_name": "NDBSHOP",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/fc68ff26-e995-42a3-8cd0-7867fbc5f87f/default.jobtemplate.hls.m3u8",
          "type": "videos_for_related_products"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 4,
          "hard_maximum": true
        },
        "is_prime": true,
        "is_amazon_fresh": false,
        "condition": {
          "is_new": true
        },
        "availability": {
          "type": "in_stock",
          "raw": "Only 4 left in stock - order soon.",
          "dispatch_days": 1,
          "stock_level": 4
        },
        "fulfillment": {
          "type": "2p",
          "standard_delivery": {
            "date": "Wednesday, September 14",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Monday, September 12",
            "name": "Or fastest delivery Monday, September 12. Order within 14 hrs 51 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "NDBSHOP",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A3A2SKWMOC62VF&asin=B07MKQXBXW&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A3A2SKWMOC62VF"
          }
        },
        "price": {
          "symbol": "$",
          "value": 38.99,
          "currency": "USD",
          "raw": "$38.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 40912,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Men's Undershirts",
          "rank": 103,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1045716/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 40912, Category: Men's Undershirts | Rank: 103"
    },
    "brand_store": {
      "id": "0F9B9EA8-AADD-4B42-AB9B-FDAE084E71FF",
      "link": "https://www.amazon.com/stores/NewDenber/page/0F9B9EA8-AADD-4B42-AB9B-FDAE084E71FF"
    }
  };

  let result = await detectMultipack(payload);
  expect(result).toBe(true);
});

it("detect-multi-pack-in-multipack-in-title-keyword", async () => {
//https://www.amazon.com/dp/B087QT2B74/ref=sspa_dk_detail_9?psc=1&pd_rd_i=B087QT2B74&pd_rd_w=Fu9tg&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=N6YEQKBZK23781K3SPEJ&pd_rd_wg=yeTPR&pd_rd_r=a8377af0-58b2-4982-b50b-519ddb577814&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzRUk0SExaSEpIRDcyJmVuY3J5cHRlZElkPUEwNjkwMzA2MjVUOEg1Sk5OSUc0WCZlbmNyeXB0ZWRBZElkPUEwMzc0Mzg0N1IxQzU3OEtMMkJYJndpZGdldE5hbWU9c3BfZGV0YWlsX3RoZW1hdGljJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 632,
      "overage_used": 132,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-09-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/dp/B087QT2B74/ref=sspa_dk_detail_9?psc=1&pd_rd_i=B087QT2B74&pd_rd_w=Fu9tg&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=N6YEQKBZK23781K3SPEJ&pd_rd_wg=yeTPR&pd_rd_r=a8377af0-58b2-4982-b50b-519ddb577814&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzRUk0SExaSEpIRDcyJmVuY3J5cHRlZElkPUEwNjkwMzA2MjVUOEg1Sk5OSUc0WCZlbmNyeXB0ZWRBZElkPUEwMzc0Mzg0N1IxQzU3OEtMMkJYJndpZGdldE5hbWU9c3BfZGV0YWlsX3RoZW1hdGljJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "Market Trendz Men's Classic Soft Lightweight Premium 100% Ringspun Cotton T-Shirts | Unisex 100% Ring Spun Cotton Multipack Large 1 Black / 1 Navy / 1 Royal / 1 Charcoal",
      "title_excluding_variant_name": "Market Trendz Men's Classic Soft Lightweight Premium 100% Ringspun Cotton T-Shirts | Unisex 100% Ring Spun Cotton Multipack",
      "keywords": "Market,Trendz,Men's,Classic,Soft,Lightweight,Premium,100%,Ringspun,Cotton,T-Shirts,|,Unisex,100%,Ring,Spun,Cotton,Multipack",
      "keywords_list": [
        "Market",
        "Trendz",
        "Men's",
        "Classic",
        "Soft",
        "Lightweight",
        "Premium",
        "100%",
        "Ringspun",
        "Cotton",
        "T-Shirts",
        "Unisex",
        "100%",
        "Ring",
        "Spun",
        "Cotton",
        "Multipack"
      ],
      "asin": "B087QT2B74",
      "link": "https://www.amazon.com/dp/B087QT2B74??th=1&psc=1",
      "brand": "Market Trendz",
      "has_size_guide": true,
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
          "name": "Shirts",
          "link": "https://www.amazon.com/Mens-Shirts/b/ref=dp_bc_aui_C_4?ie=UTF8&node=2476517011",
          "category_id": "2476517011"
        },
        {
          "name": "T-Shirts",
          "link": "https://www.amazon.com/Mens-T-Shirts/b/ref=dp_bc_aui_C_5?ie=UTF8&node=1045624",
          "category_id": "1045624"
        }
      ],
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": false,
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/39960b52-9a46-4c15-a328-2f7f06aee358.__CR0,9,970,291_PT0_SX600_V1___.jpg"
      },
      "sub_title": {
        "text": "Brand: Market Trendz",
        "link": "https://www.amazon.com/Market-Trendz/b/ref=bl_sl_s_ap_web_20187312011?ie=UTF8&node=20187312011&field-lbr_brands_browse-bin=Market+Trendz"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.4,
      "ratings_total": 540,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/71BQbN6HL5L.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/71BQbN6HL5L._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61gmVWBbZZL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71snIedhpFL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71LqCwNanYL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81EUG-KzloL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81EhLhRsU9L._AC_UL1500_.jpg",
          "variant": "PT07"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61YMSyVRcUL._AC_UL1300_.jpg",
          "variant": "PT08"
        }
      ],
      "images_count": 7,
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 19,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Wednesday, September 14",
            "name": "FREE"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Market Trendz",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A2QF3PV7AC9TEX&asin=B087QT2B74&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A2QF3PV7AC9TEX"
          }
        },
        "price": {
          "symbol": "$",
          "value": 39.95,
          "currency": "USD",
          "raw": "$39.95"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 151207,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Men's Novelty T-Shirts",
          "rank": 3551,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/9056987011/ref=pd_zg_hrsr_fashion"
        },
        {
          "category": "Men's Fashion",
          "rank": 38884,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/7147441011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 151207, Category: Men's Novelty T-Shirts | Rank: 3551, Category: Men's Fashion | Rank: 38884"
    }
  };

  let result = await detectMultipack(payload);
  expect(result).toBe(true);
});

it("detect-multi-pack-in-title-keyword-multipack-title", async () => {
//https://www.amazon.com/dp/B08YCCQ4Y2/ref=sspa_dk_detail_6?psc=1&pd_rd_i=B08YCCQ4Y2&pd_rd_w=eFG39&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=VKF6VDE6X8N7KRT4WBZA&pd_rd_wg=9u0RI&pd_rd_r=12e9114b-7dee-4eba-9687-01495a944ced&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&smid=A2N43JHNO0NHQ7&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUFRWk41WFBHTktLVDUmZW5jcnlwdGVkSWQ9QTA3OTY4MTVZM0pTNzFSTlZKU1MmZW5jcnlwdGVkQWRJZD1BMDIwMzE4MjJOSUk3MFA0WjczRjEmd2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWMmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl
  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 632,
      "overage_used": 132,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-09-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/dp/B087QT2B74/ref=sspa_dk_detail_9?psc=1&pd_rd_i=B087QT2B74&pd_rd_w=Fu9tg&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=N6YEQKBZK23781K3SPEJ&pd_rd_wg=yeTPR&pd_rd_r=a8377af0-58b2-4982-b50b-519ddb577814&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzRUk0SExaSEpIRDcyJmVuY3J5cHRlZElkPUEwNjkwMzA2MjVUOEg1Sk5OSUc0WCZlbmNyeXB0ZWRBZElkPUEwMzc0Mzg0N1IxQzU3OEtMMkJYJndpZGdldE5hbWU9c3BfZGV0YWlsX3RoZW1hdGljJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "Market Trendz Men's Classic Soft Lightweight Premium 100% Ringspun Cotton T-Shirts | Unisex 100% Ring Spun Cotton Multipack Large 1 Black / 1 Navy / 1 Royal / 1 Charcoal",
      "title_excluding_variant_name": "Market Trendz Men's Classic Soft Lightweight Premium 100% Ringspun Cotton T-Shirts | Unisex 100% Ring Spun Cotton Multipack",
      "keywords": "Market,Trendz,Men's,Classic,Soft,Lightweight,Premium,100%,Ringspun,Cotton,T-Shirts,|,Unisex,100%,Ring,Spun,Cotton,Multipack",
      "keywords_list": [
        "Market",
        "Trendz",
        "Men's",
        "Classic",
        "Soft",
        "Lightweight",
        "Premium",
        "100%",
        "Ringspun",
        "Cotton",
        "T-Shirts",
        "Unisex",
        "100%",
        "Ring",
        "Spun",
        "Cotton",
        "Multipack"
      ],
      "asin": "B087QT2B74",
      "link": "https://www.amazon.com/dp/B087QT2B74??th=1&psc=1",
      "brand": "Market Trendz",
      "has_size_guide": true,
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
          "name": "Shirts",
          "link": "https://www.amazon.com/Mens-Shirts/b/ref=dp_bc_aui_C_4?ie=UTF8&node=2476517011",
          "category_id": "2476517011"
        },
        {
          "name": "T-Shirts",
          "link": "https://www.amazon.com/Mens-T-Shirts/b/ref=dp_bc_aui_C_5?ie=UTF8&node=1045624",
          "category_id": "1045624"
        }
      ],
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": false,
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/39960b52-9a46-4c15-a328-2f7f06aee358.__CR0,9,970,291_PT0_SX600_V1___.jpg"
      },
      "sub_title": {
        "text": "Brand: Market Trendz",
        "link": "https://www.amazon.com/Market-Trendz/b/ref=bl_sl_s_ap_web_20187312011?ie=UTF8&node=20187312011&field-lbr_brands_browse-bin=Market+Trendz"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.4,
      "ratings_total": 540,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/71BQbN6HL5L.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/71BQbN6HL5L._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61gmVWBbZZL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71snIedhpFL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71LqCwNanYL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81EUG-KzloL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81EhLhRsU9L._AC_UL1500_.jpg",
          "variant": "PT07"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61YMSyVRcUL._AC_UL1300_.jpg",
          "variant": "PT08"
        }
      ],
      "images_count": 7,
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 19,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Wednesday, September 14",
            "name": "FREE"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Market Trendz",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A2QF3PV7AC9TEX&asin=B087QT2B74&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A2QF3PV7AC9TEX"
          }
        },
        "price": {
          "symbol": "$",
          "value": 39.95,
          "currency": "USD",
          "raw": "$39.95"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 151207,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Men's Novelty T-Shirts",
          "rank": 3551,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/9056987011/ref=pd_zg_hrsr_fashion"
        },
        {
          "category": "Men's Fashion",
          "rank": 38884,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/7147441011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 151207, Category: Men's Novelty T-Shirts | Rank: 3551, Category: Men's Fashion | Rank: 38884"
    }
  };

  let result = await detectMultipack(payload);
  expect(result).toBe(true);
});

it("detect-multi-pack-bulk-in-keyword-title", async () => {
//https://www.amazon.com/dp/B07VTSD48H/ref=sspa_dk_detail_7?psc=1&pd_rd_i=B07VTSD48H&pd_rd_w=qxtzX&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=5960ZPVW2NS0B02GG12Y&pd_rd_wg=6oVrR&pd_rd_r=107a9e95-26bd-47c1-84bb-4129ef1eb65a&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUFMVkFRNkFTQUdXOUYmZW5jcnlwdGVkSWQ9QTAzNTcyNzEyWVpGOUVXVlRZOVUyJmVuY3J5cHRlZEFkSWQ9QTA4NDU4MTRSQ0ZQSTNMSFhCVlkmd2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWMmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl
  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 633,
      "overage_used": 133,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-09-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/dp/B07VTSD48H/ref=sspa_dk_detail_7?psc=1&pd_rd_i=B07VTSD48H&pd_rd_w=qxtzX&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=5960ZPVW2NS0B02GG12Y&pd_rd_wg=6oVrR&pd_rd_r=107a9e95-26bd-47c1-84bb-4129ef1eb65a&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUFMVkFRNkFTQUdXOUYmZW5jcnlwdGVkSWQ9QTAzNTcyNzEyWVpGOUVXVlRZOVUyJmVuY3J5cHRlZEFkSWQ9QTA4NDU4MTRSQ0ZQSTNMSFhCVlkmd2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWMmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "5 Pack Men’s Active Quick Dry Crew Neck T Shirts | Athletic Running Gym Workout Short Sleeve Tee Tops Bulk Edition 2 Large",
      "title_excluding_variant_name": "5 Pack Men’s Active Quick Dry Crew Neck T Shirts | Athletic Running Gym Workout Short Sleeve Tee Tops Bulk",
      "keywords": "5,Pack,Men’s,Active,Quick,Dry,Crew,Neck,T,Shirts,|,Athletic,Running,Gym,Workout,Short,Sleeve,Tee,Tops,Bulk",
      "keywords_list": [
        "Pack",
        "Men’s",
        "Active",
        "Quick",
        "Crew",
        "Neck",
        "Shirts",
        "Athletic",
        "Running",
        "Workout",
        "Short",
        "Sleeve",
        "Tops",
        "Bulk"
      ],
      "asin": "B07VTSD48H",
      "link": "https://www.amazon.com/dp/B07VTSD48H??th=1&psc=1",
      "brand": "Liberty Imports",
      "has_size_guide": true,
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
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/f0c224f4-1e8c-4157-9fca-3597f196c3d5.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
          "brand_store": {
            "link": "/stores/page/A5E90EEE-8070-4244-B5CA-D95C52D0A27C",
            "id": "A5E90EEE-8070-4244-B5CA-D95C52D0A27C"
          },
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/f0c224f4-1e8c-4157-9fca-3597f196c3d5.__CR0,0,1464,625_PT0_SX1464_V1___.jpg"
          ],
          "products": [
            {
              "title": "Men&amp;#39;s Tech Golf Polos",
              "asin": "B09L8MP7QT",
              "link": "/dp/B09L8MP7QT/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/c8029d2a-cafb-4d12-bb2d-f94bbe4bbdf7.__CR0,0,1660,1820_PT0_SX166_V1___.jpg"
            },
            {
              "title": "Brand Story - Men&amp;amp;#39;s - Hooded Tanks",
              "asin": "B09PB77VPG",
              "link": "/dp/B09PB77VPG/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/d98e4488-de9d-45db-afcf-262e75409be9.__CR0,0,1660,1820_PT0_SX166_V1___.jpg"
            },
            {
              "title": "Men&amp;#39;s Running Shorts",
              "asin": "B09J9CWK79",
              "link": "/dp/B09J9CWK79/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/200b710a-cde6-46a4-92b0-07c0a6211ac7.__CR0,0,1660,1820_PT0_SX166_V1___.jpg"
            },
            {
              "title": "Men&amp;#39;s Long Sleeve Tech Tees",
              "asin": "B095L2P4LD",
              "link": "/dp/B095L2P4LD/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/796aa97e-317b-4dff-997d-2a6ddcad4279.__CR0,0,1660,1820_PT0_SX166_V1___.jpg"
            },
            {
              "title": "Men&#39;s Tech Tees",
              "asin": "B07VTSD48H",
              "link": "/dp/B07VTSD48H/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/a5cb2a12-6ae1-41c4-8e43-d27934688f51.__CR0,0,1660,1820_PT0_SX166_V1___.jpg"
            },
            {
              "title": "Men&amp;#39;s Quarter Zip Pullovers",
              "asin": "B07MFB86BV",
              "link": "/dp/B07MFB86BV/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/93dfdcea-0a81-4562-bc0e-bd6e05cd6ef6.__CR0,0,1660,1820_PT0_SX166_V1___.jpg"
            },
            {
              "title": "Men&#39;s Basketball Shorts",
              "asin": "B07WC2PK5C",
              "link": "/dp/B07WC2PK5C/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/5679f057-7c99-4b8e-8d78-d6a4163809b0.__CR0,0,1660,1820_PT0_SX166_V1___.jpg"
            },
            {
              "title": "Men&amp;#39;s Reversible Basketball Jerseys",
              "asin": "B07QDG1XFL",
              "link": "/dp/B07QDG1XFL/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/27caee84-461e-40ab-8625-eeb7ec48081d.__CR0,0,1660,1820_PT0_SX166_V1___.jpg"
            },
            {
              "title": "Men&amp;amp;#39;s Muscle Tanks",
              "asin": "B07MHVRW82",
              "link": "/dp/B07MHVRW82/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/77cfb2b7-ddb0-4c63-a284-78283ff7ba01.__CR0,0,1660,1820_PT0_SX166_V1___.jpg"
            },
            {
              "title": "mens lightweight cotton blend hoodies",
              "asin": "B08B4DY1W7",
              "link": "/dp/B08B4DY1W7/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/125c6844-0c82-4ede-ad5c-34c4ff7f922d.__CR0,0,1660,1820_PT0_SX166_V1___.jpg"
            },
            {
              "title": "Men&amp;#39;s Mesh Shorts",
              "asin": "B08R897LPR",
              "link": "/dp/B08R897LPR/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/727fc5f9-01e5-443f-89ac-85b3fb1e23f4.__CR0,0,1660,1820_PT0_SX166_V1___.jpg"
            },
            {
              "title": "Men&amp;amp;amp;#39;s Sweat Shorts",
              "asin": "B09JB3JYDD",
              "link": "/dp/B09JB3JYDD/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/ba2091b8-8036-4855-92c4-262f20eda318.__CR0,0,1660,1820_PT0_SX166_V1___.jpg"
            },
            {
              "title": "Brand Story - Men&amp;#39;s - Workout Tanks",
              "asin": "B082BF2WGV",
              "link": "/dp/B082BF2WGV/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/9b86f958-38b8-404a-b4f9-78c600f5380d.__CR0,0,1660,1820_PT0_SX166_V1___.jpg"
            },
            {
              "title": "Men&amp;#39;s Thermal Fleece Full Zip Hoodies",
              "asin": "B08PMG3QJR",
              "link": "/dp/B08PMG3QJR/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/d294bcc1-65cb-41ed-8e2e-57826ffc0b11.__CR0,0,1660,1820_PT0_SX166_V1___.jpg"
            },
            {
              "title": "Men&amp;#39;s Swim Trunks",
              "asin": "B07S97MMR5",
              "link": "/dp/B07S97MMR5/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/179cd025-eea3-4481-a4a0-b5316c34246b.__CR0,0,1660,1820_PT0_SX166_V1___.jpg"
            },
            {
              "title": "Men&amp;amp;amp;#39;s Tech Joggers",
              "asin": "B09J9Z1NXZ",
              "link": "/dp/B09J9Z1NXZ/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/812b615c-8d78-49cb-a6b7-a9246d421c24.__CR0,0,1660,1820_PT0_SX166_V1___.jpg"
            }
          ]
        },
        "third_party": true
      },
      "sub_title": {
        "text": "Visit the Liberty Imports Store",
        "link": "https://www.amazon.com/stores/LibertyImportsUSA/page/86B8F426-1D1E-4E88-9059-DDB4DF1E042E?ref_=ast_bln"
      },
      "amazons_choice": {
        "keywords": "exercise shirts for men",
        "link": "https://www.amazon.com/s/ref=choice_dp_b?keywords=exercise%20shirts%20for%20men"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.6,
      "ratings_total": 24531,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/81gHzitlpsL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/81gHzitlpsL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71KKpeamwdL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81ymmUYA+WL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/714ckqsI2FL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81I+NhTMOpL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71K3n5yH91L._AC_UL1500_.jpg",
          "variant": "PT05"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81SxbquXemL._AC_UL1500_.jpg",
          "variant": "PT06"
        }
      ],
      "images_count": 7,
      "videos_additional": [
        {
          "product_asin": "B07MFB27HX",
          "title": "Should You Buy? Liberty Pro Quick Dry Crew Neck T Shirt",
          "creator_type": "Influencer",
          "vendor_code": "deliciousencounters:shop",
          "vendor_name": "Should You Buy?",
          "vendor_tracking_id": "onamzchri0cbe-20",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/1359540a-f7b8-4c8f-b5ef-e0457314fd79/default.jobtemplate.hls.m3u8",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/28f27094-08c6-4582-a6d6-d77406898b40.vtt",
          "type": "videos_for_related_products"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 30,
          "hard_maximum": true
        },
        "new_offers_count": 2,
        "new_offers_from": {
          "symbol": "$",
          "value": 39.95,
          "currency": "USD",
          "raw": "$39.95"
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
          "type": "2p",
          "standard_delivery": {
            "date": "Wednesday, September 14",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Tuesday, September 13",
            "name": "Or fastest delivery Tuesday, September 13. Order within 8 hrs 41 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Liberty Imports",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A1E4Y5YJSDRM31&asin=B07VTSD48H&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A1E4Y5YJSDRM31"
          }
        },
        "price": {
          "symbol": "$",
          "value": 39.95,
          "currency": "USD",
          "raw": "$39.95"
        },
        "rrp": {
          "symbol": "$",
          "value": 59.95,
          "currency": "USD",
          "raw": "$59.95"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 508,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Men's Running Shirts",
          "rank": 9,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/9590735011/ref=pd_zg_hrsr_fashion"
        },
        {
          "category": "Men's Athletic Shirts & Tees",
          "rank": 15,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1046648/ref=pd_zg_hrsr_fashion"
        }
      ],
      "manufacturer": "Liberty Imports",
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 508, Category: Men's Running Shirts | Rank: 9, Category: Men's Athletic Shirts & Tees | Rank: 15"
    },
    "brand_store": {
      "id": "86B8F426-1D1E-4E88-9059-DDB4DF1E042E",
      "link": "https://www.amazon.com/stores/LibertyImportsUSA/page/86B8F426-1D1E-4E88-9059-DDB4DF1E042E"
    }
  };

  let result = await detectMultipack(payload);
  expect(result).toBe(true);
});

it("detect-multi-pack-pack-in-keyword-title", async () => {
//https://www.amazon.com/Fingers-Wicking-Athletic-Cosfash-Black-Women/dp/B08HCXSTKT/ref=sxin_14_pa_sp_search_thematic_sspa?content-id=amzn1.sym.390a2ab4-d53f-4f89-a965-6adc5da5874d%3Aamzn1.sym.390a2ab4-d53f-4f89-a965-6adc5da5874d&crid=2O9BNFBZVCUIH&cv_ct_cx=pack&keywords=pack&pd_rd_i=B08HCXSTKT&pd_rd_r=68e54b18-3396-465d-846c-7e2ab64289ea&pd_rd_w=RtL6v&pd_rd_wg=aSDkE&pf_rd_p=390a2ab4-d53f-4f89-a965-6adc5da5874d&pf_rd_r=0ZE8NGC06QEQPF06R1Y6&qid=1662537569&sprefix=pa%2Caps%2C294&sr=1-1-fc03a67a-dee8-4976-a8a6-866175348591-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEySkM3U1hZWldKM0hDJmVuY3J5cHRlZElkPUEwNjE1NTE4Sko5RlRLQlg1MTJUJmVuY3J5cHRlZEFkSWQ9QTA2OTI3NTFVNFZSOFZCOTFDTDUmd2lkZ2V0TmFtZT1zcF9zZWFyY2hfdGhlbWF0aWMmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 641,
      "overage_used": 141,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-09-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/Fingers-Wicking-Athletic-Cosfash-Black-Women/dp/B08HCXSTKT/ref=sxin_14_pa_sp_search_thematic_sspa?content-id=amzn1.sym.390a2ab4-d53f-4f89-a965-6adc5da5874d:amzn1.sym.390a2ab4-d53f-4f89-a965-6adc5da5874d&crid=2O9BNFBZVCUIH&cv_ct_cx=pack&keywords=pack&pd_rd_i=B08HCXSTKT&pd_rd_r=68e54b18-3396-465d-846c-7e2ab64289ea&pd_rd_w=RtL6v&pd_rd_wg=aSDkE&pf_rd_p=390a2ab4-d53f-4f89-a965-6adc5da5874d&pf_rd_r=0ZE8NGC06QEQPF06R1Y6&qid=1662537569&sprefix=pa,aps,294&sr=1-1-fc03a67a-dee8-4976-a8a6-866175348591-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEySkM3U1hZWldKM0hDJmVuY3J5cHRlZElkPUEwNjE1NTE4Sko5RlRLQlg1MTJUJmVuY3J5cHRlZEFkSWQ9QTA2OTI3NTFVNFZSOFZCOTFDTDUmd2lkZ2V0TmFtZT1zcF9zZWFyY2hfdGhlbWF0aWMmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "Women's Toe Socks 5 Fingers No Show Cotton Mesh Wicking Athletic Running walking Socks 4 Pack By Cosfash Black-women 07",
      "title_excluding_variant_name": "Women's Toe Socks 5 Fingers No Show Cotton Mesh Wicking Athletic Running walking Socks 4 Pack By Cosfash",
      "keywords": "Women's,Toe,Socks,5,Fingers,No,Show,Cotton,Mesh,Wicking,Athletic,Running,walking,Socks,4,Pack,By,Cosfash",
      "keywords_list": [
        "Women's",
        "Socks",
        "Fingers",
        "Show",
        "Cotton",
        "Mesh",
        "Wicking",
        "Athletic",
        "Running",
        "walking",
        "Socks",
        "Pack",
        "Cosfash"
      ],
      "asin": "B08HCXSTKT",
      "link": "https://www.amazon.com/dp/B08HCXSTKT??th=1&psc=1",
      "brand": "Cosfash",
      "has_size_guide": true,
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
          "name": "Socks & Hosiery",
          "link": "https://www.amazon.com/Womens-Socks-and-Hosiery/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1044886",
          "category_id": "1044886"
        },
        {
          "name": "Socks",
          "link": "https://www.amazon.com/b/ref=dp_bc_aui_C_5?ie=UTF8&node=23561818011",
          "category_id": "23561818011"
        }
      ],
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media/sc/1eca94a1-18fb-46ef-9a52-394df8c9f502.__CR0,3,1920,594_PT0_SX970_V1___.jpg",
          "description": "WHY CHOOSE COSFASH 5 TOE SOCKS? COSFASH design and manufacture professional five-fingered socks, which are constantly tested and the excellent elastic performance can perfectly match the foot shape of the vast majority of people,our socks are suitable for daily use or outdoor activities such as running,hiking,climbing,bicycle riding,mountaineering,training,fitness,workout,etc. Our five toes socks are designed of toe separator,when your toes are separated, properly aligned and stretched, your weight is evenly distributed, which allows every part of your foot to participate effectively in exercise, making your exercise especially running easier and comfortable. Each toe is protected from skin friction between the toes, avoiding blisters and chafing.The five finger socks allow your toes to align and splay naturally and promote blood circulation. The running toe socks are designed with mesh top on the dorsum of the socks , greatly improve the air permeability, keeps your feet comfortable and dry, and effective in preventing allergy, athlete's foot and stinking foot. Our toe socks are made of 100% Combed Cotton,which has better performance in Sweat Absorption, soft, and skin-friendly. 4 PCS 32S yarn thickening manufacturing process, more strong and durable,won't FADE and SHRINK after washing. Maybe you have five toed barefoot running shoes whih can help you promote proper foot alignment to reduce strain and lower your risk of injury.But we suggest you get some must-have companion of toe socks, and you will get unexpected benefits and comfort. Whether you're looking for casual wear or sports socks, Toe Socks are the best and healthiest choice for your feet.These 5 toe socks can be the wonderful gift for all beloved friends,family or any occasion,such as Birthday gift, Christmas gift,Father Plot gift,Valentine’s gift,etc.",
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media/sc/1eca94a1-18fb-46ef-9a52-394df8c9f502.__CR0,3,1920,594_PT0_SX970_V1___.jpg"
          ]
        },
        "third_party": true
      },
      "sub_title": {
        "text": "Visit the Cosfash Store",
        "link": "https://www.amazon.com/stores/COSFASH/page/446252AC-7B4A-4E6D-BCB2-040A47BF2D98?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.5,
      "ratings_total": 898,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/81N2Gh-L1TL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/81N2Gh-L1TL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71KVTS6b+VL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71tUku1xEFL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/618QoLUREmL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81fUykgE5YL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/812h555ZegL._AC_UL1500_.jpg",
          "variant": "PT05"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81trdsVjKvL._AC_UL1500_.jpg",
          "variant": "PT06"
        }
      ],
      "images_count": 7,
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 30,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Thu, Sep 15",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Mon, Sep 12",
            "name": "Or fastest delivery Mon, Sep 12. Order within 11 hrs 28 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Cosfash",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A2NGS6IO01GY5C&asin=B08HCXSTKT&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A2NGS6IO01GY5C"
          }
        },
        "price": {
          "symbol": "$",
          "value": 13.99,
          "currency": "USD",
          "raw": "$13.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Sports & Outdoors",
          "rank": 29982,
          "link": "https://www.amazon.com/gp/bestsellers/sporting-goods/ref=pd_zg_ts_sporting-goods"
        },
        {
          "category": "Women's Socks",
          "rank": 999,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/23561818011/ref=pd_zg_hrsr_fashion"
        },
        {
          "category": "Exercise & Fitness Apparel",
          "rank": 9086,
          "link": "https://www.amazon.com/gp/bestsellers/sporting-goods/3407841/ref=pd_zg_hrsr_sporting-goods"
        }
      ],
      "bestsellers_rank_flat": "Category: Sports & Outdoors | Rank: 29982, Category: Women's Socks | Rank: 999, Category: Exercise & Fitness Apparel | Rank: 9086"
    },
    "brand_store": {
      "id": "446252AC-7B4A-4E6D-BCB2-040A47BF2D98",
      "link": "https://www.amazon.com/stores/COSFASH/page/446252AC-7B4A-4E6D-BCB2-040A47BF2D98"
    }
  };

  let result = await detectMultipack(payload);
  expect(result).toBe(true);
});

it("detect-multi-pack-pairs-in-title", async () => {
//https://www.amazon.com/dp/B08T86638N/ref=sspa_dk_detail_7?psc=1&pd_rd_i=B08T86638N&pd_rd_w=yMlJl&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=HBHM433NR0DKABAS5J4A&pd_rd_wg=VyWgm&pd_rd_r=8e3bf3b3-4e11-4844-85b1-cd3f1695af01&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzNDhSSTlPU1hVSjlUJmVuY3J5cHRlZElkPUEwODQ0MDg1MlhaMFAwUFdGTVdSWiZlbmNyeXB0ZWRBZElkPUEwNzM4NjA2MjNPUUVQWkM2UDlYMCZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 642,
      "overage_used": 142,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-09-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/dp/B08T86638N/ref=sspa_dk_detail_7?psc=1&pd_rd_i=B08T86638N&pd_rd_w=yMlJl&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=HBHM433NR0DKABAS5J4A&pd_rd_wg=VyWgm&pd_rd_r=8e3bf3b3-4e11-4844-85b1-cd3f1695af01&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzNDhSSTlPU1hVSjlUJmVuY3J5cHRlZElkPUEwODQ0MDg1MlhaMFAwUFdGTVdSWiZlbmNyeXB0ZWRBZElkPUEwNzM4NjA2MjNPUUVQWkM2UDlYMCZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "KONY Cotton Cushioned Ankle Socks for Men and Women - Low Cut Athletic Running Tab Socks (6 Pairs) Black Small",
      "title_excluding_variant_name": "KONY Cotton Cushioned Ankle Socks for Men and Women - Low Cut Athletic Running Tab Socks (6 Pairs)",
      "keywords": "KONY,Cotton,Cushioned,Ankle,Socks,for,Men,and,Women,-,Low,Cut,Athletic,Running,Tab,Socks,(6,Pairs)",
      "keywords_list": [
        "KONY",
        "Cotton",
        "Cushioned",
        "Ankle",
        "Socks",
        "Women",
        "Athletic",
        "Running",
        "Socks",
        "Pairs)"
      ],
      "asin": "B08T86638N",
      "link": "https://www.amazon.com/dp/B08T86638N??th=1&psc=1",
      "brand": "KONY",
      "has_size_guide": true,
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
          "name": "Active",
          "link": "https://www.amazon.com/Womens-Activewear/b/ref=dp_bc_aui_C_4?ie=UTF8&node=3456051",
          "category_id": "3456051"
        },
        {
          "name": "Athletic Socks",
          "link": "https://www.amazon.com/Womens-Athletic-Socks/b/ref=dp_bc_aui_C_5?ie=UTF8&node=1044920",
          "category_id": "1044920"
        }
      ],
      "description": "TLC for your feet \nHealthy feet are crucial to your quality of life so it is important to give them high-quality support every step of the way. KONY Low Cut Socks for women and men are engineered for the total comfort and well-being of your feet, from their cushioning soles and elastic compression arches to their mesh ventilation panels and ribbed no-slip cuffs. Suitable for wear as no-show tennis socks or running socks, or just for everyday wear for errands and relaxing, these comfy socks soften the blow of every step and keep your feet feeling energized to go the extra mile. \n\nWith you every step of the way\nBecause stuffy, bunching socks can break your stride and leave you with blisters, KONY Mens and Womens Ankle Socks have heel tabs that work with elasticized cuffs and compression panels to keep them in place mile after mile. Seamless toes and structured heels offer a tailored fit without unpleasant chafing or pressure points. Made from a blend of cotton, polyester and polyurethane, these moisture-wicking and cooling socks help your feet beat the heat of asphalt and other hot surfaces as you jog, hike or bike. \n\nFor every type of foot \nKONY Low Socks for women and men come in small, medium, large and extra-large size to accommodate active people of every age and build. Available in black ankle socks or white ankle socks as well as charcoal, white-and-gray or black-and-grey colors, this 6-count pack of socks ensures you have a fresh, supportive pair for all your favorite activities. \n\nGive your feet the comfort, breathability and cushioning support they crave. Add KONY Ankle Socks for women and men to your cart today.",
      "sub_title": {
        "text": "Visit the KONY Store",
        "link": "https://www.amazon.com/stores/KONY/page/63290A2C-4DB7-478C-B30C-7F4D84008427?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.5,
      "ratings_total": 131,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/71p1Us+sTTL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/71p1Us+sTTL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/6128fOlyeGL._AC_UL1000_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/619vkBNbnbL._AC_UL1000_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81viuVo95KL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/91NCG1c4wdL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71O3wA1YVPL._AC_UL1500_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 30,
          "hard_maximum": true
        },
        "deal": {
          "with_deal": {
            "with_deal_shown": true,
            "raw": "With Deal"
          }
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
          "type": "2p",
          "standard_delivery": {
            "date": "Thursday, September 15",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Tuesday, September 13",
            "name": "Or fastest delivery Tuesday, September 13. Order within 23 hrs 40 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Polly Molly",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A23IJEO03Q1402&asin=B08T86638N&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A23IJEO03Q1402"
          }
        },
        "price": {
          "symbol": "$",
          "value": 11.19,
          "currency": "USD",
          "raw": "$11.19"
        },
        "rrp": {
          "symbol": "$",
          "value": 15.99,
          "currency": "USD",
          "raw": "$15.99"
        },
        "save": {
          "symbol": "$",
          "value": 4.8,
          "currency": "USD",
          "raw": "$4.80"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 296769,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Athletic Socks",
          "rank": 1002,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1044920/ref=pd_zg_hrsr_fashion"
        },
        {
          "category": "Men's Athletic Socks",
          "rank": 1611,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1045724/ref=pd_zg_hrsr_fashion"
        },
        {
          "category": "Running Clothing",
          "rank": 14548,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/2371056011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 296769, Category: Women's Athletic Socks | Rank: 1002, Category: Men's Athletic Socks | Rank: 1611, Category: Running Clothing | Rank: 14548"
    },
    "brand_store": {
      "id": "63290A2C-4DB7-478C-B30C-7F4D84008427",
      "link": "https://www.amazon.com/stores/KONY/page/63290A2C-4DB7-478C-B30C-7F4D84008427"
    }
  };

  let result = await detectMultipack(payload);
  expect(result).toBe(true);
});

it("detect-multi-pack-pack-in-keyword-title-pair-multi-pack", async () => {
//https://www.amazon.com/Hanes-Tagless-Exposed-Waistband-Assortment/dp/B086L79Q6X/ref=sr_1_11?crid=2O9BNFBZVCUIH&keywords=pack&qid=1662537569&sprefix=pa%2Caps%2C294&sr=8-11

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 643,
      "overage_used": 143,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-09-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/Hanes-Tagless-Exposed-Waistband-Assortment/dp/B086L79Q6X/ref=sr_1_11?crid=2O9BNFBZVCUIH&keywords=pack&qid=1662537569&sprefix=pa,aps,294&sr=8-11",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "Hanes Men's Underwear Boxer Briefs, Cool Dri Moisture-Wicking Underwear, Cotton No-Ride-Up for Men, Multi-packs Available",
      "keywords": "Hanes,Men's,Underwear,Boxer,Briefs,,Cool,Dri,Moisture-Wicking,Underwear,,Cotton,No-Ride-Up,for,Men,,Multi-packs,Available",
      "keywords_list": [
        "Hanes",
        "Men's",
        "Underwear",
        "Boxer",
        "Briefs",
        "Cool",
        "Moisture-Wicking",
        "Underwear",
        "Cotton",
        "No-Ride-Up",
        "Multi-packs",
        "Available"
      ],
      "asin": "B09G4VWJHT",
      "link": "https://www.amazon.com/Hanes-Underwear-Moisture-Wicking-No-Ride-Up-Multi-packs/dp/B0B5HWN2KN",
      "brand": "Hanes",
      "has_size_guide": true,
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
          "name": "Underwear",
          "link": "https://www.amazon.com/Mens-Underwear/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045706",
          "category_id": "1045706"
        },
        {
          "name": "Boxer Briefs",
          "link": "https://www.amazon.com/Mens-Boxer-Briefs/b/ref=dp_bc_aui_C_5?ie=UTF8&node=1045718",
          "category_id": "1045718"
        }
      ],
      "description": "This men's boxer briefs multipack is made from 100% cotton that's soft and breathable for everyday comfort (heathered styles are a cotton-rich blend). Our moisture-wicking underwear is designed with Cool Comfort® fabric that helps keep you cool no matter what your day brings. Our experts also designed these men's underwear with no-ride-up construction and a Comfort Flex® waistband that stretches and moves with you. Plus, you can throw them right in the washer on laundry day. We also love how these tagless boxer brief underwear sets are available in multiple color and pack options, so you can choose the one that works best for you.",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": false,
        "third_party": true
      },
      "sub_title": {
        "text": "Visit the Hanes Store",
        "link": "https://www.amazon.com/stores/Hanes/page/F83022EC-A709-4B2F-BCB7-7BBFA1896AB0?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.6,
      "ratings_total": 122708,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/81Oe1bqQkhL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/81Oe1bqQkhL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81ZQIUmXReL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71Nj-BAbc1L._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81jgRc82-FL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/91fh+NVONrL._AC_UL1500_.jpg",
          "variant": "PT04"
        }
      ],
      "images_count": 5,
      "videos_additional": [
        {
          "product_asin": "B09G4T3V2P",
          "title": "Hanes Tagless Boxer Briefs keep changing every time! ",
          "creator_type": "Influencer",
          "vendor_code": "dcsoundop:shop",
          "vendor_name": "DcSoundOp",
          "vendor_tracking_id": "onamzdcs034-20",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/479e029d-afe3-40ba-839b-1bf1f5a8b262/default.jobtemplate.hls.m3u8",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/7bfe1ae6-3a46-4d25-b294-238efaffdfd5.vtt",
          "type": "videos_for_related_products"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "is_prime": false,
        "is_amazon_fresh": false,
        "condition": {
          "is_new": true
        },
        "fulfillment": {
          "type": "1p",
          "is_sold_by_amazon": true,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": false
        },
        "price": {
          "symbol": "$",
          "value": 15,
          "currency": "USD",
          "raw": "$15.00"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 16,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Men's Boxer Briefs",
          "rank": 2,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1045718/ref=pd_zg_hrsr_fashion"
        }
      ],
      "manufacturer": "Hanes",
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 16, Category: Men's Boxer Briefs | Rank: 2"
    },
    "brand_store": {
      "id": "F83022EC-A709-4B2F-BCB7-7BBFA1896AB0",
      "link": "https://www.amazon.com/stores/Hanes/page/F83022EC-A709-4B2F-BCB7-7BBFA1896AB0"
    }
  };

  let result = await detectMultipack(payload);
  expect(result).toBe(true);
});

it("detect-multi-pack-multi-pack-in-title", async () => {
//https://www.amazon.com/Hanes-Tagless-Exposed-Waistband-Assortment/dp/B086L79Q6X/ref=sr_1_11?crid=2O9BNFBZVCUIH&keywords=pack&qid=1662537569&sprefix=pa%2Caps%2C294&sr=8-11

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 643,
      "overage_used": 143,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-09-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/Hanes-Tagless-Exposed-Waistband-Assortment/dp/B086L79Q6X/ref=sr_1_11?crid=2O9BNFBZVCUIH&keywords=pack&qid=1662537569&sprefix=pa,aps,294&sr=8-11",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "Hanes Men's Underwear Boxer Briefs, Cool Dri Moisture-Wicking Underwear, Cotton No-Ride-Up for Men, Multi-packs Available",
      "keywords": "Hanes,Men's,Underwear,Boxer,Briefs,,Cool,Dri,Moisture-Wicking,Underwear,,Cotton,No-Ride-Up,for,Men,,Multi-packs,Available",
      "keywords_list": [
        "Hanes",
        "Men's",
        "Underwear",
        "Boxer",
        "Briefs",
        "Cool",
        "Moisture-Wicking",
        "Underwear",
        "Cotton",
        "No-Ride-Up",
        "Multi-packs",
        "Available"
      ],
      "asin": "B09G4VWJHT",
      "link": "https://www.amazon.com/Hanes-Underwear-Moisture-Wicking-No-Ride-Up-Multi-packs/dp/B0B5HWN2KN",
      "brand": "Hanes",
      "has_size_guide": true,
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
          "name": "Underwear",
          "link": "https://www.amazon.com/Mens-Underwear/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045706",
          "category_id": "1045706"
        },
        {
          "name": "Boxer Briefs",
          "link": "https://www.amazon.com/Mens-Boxer-Briefs/b/ref=dp_bc_aui_C_5?ie=UTF8&node=1045718",
          "category_id": "1045718"
        }
      ],
      "description": "This men's boxer briefs multipack is made from 100% cotton that's soft and breathable for everyday comfort (heathered styles are a cotton-rich blend). Our moisture-wicking underwear is designed with Cool Comfort® fabric that helps keep you cool no matter what your day brings. Our experts also designed these men's underwear with no-ride-up construction and a Comfort Flex® waistband that stretches and moves with you. Plus, you can throw them right in the washer on laundry day. We also love how these tagless boxer brief underwear sets are available in multiple color and pack options, so you can choose the one that works best for you.",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": false,
        "third_party": true
      },
      "sub_title": {
        "text": "Visit the Hanes Store",
        "link": "https://www.amazon.com/stores/Hanes/page/F83022EC-A709-4B2F-BCB7-7BBFA1896AB0?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.6,
      "ratings_total": 122708,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/81Oe1bqQkhL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/81Oe1bqQkhL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81ZQIUmXReL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71Nj-BAbc1L._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81jgRc82-FL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/91fh+NVONrL._AC_UL1500_.jpg",
          "variant": "PT04"
        }
      ],
      "images_count": 5,
      "videos_additional": [
        {
          "product_asin": "B09G4T3V2P",
          "title": "Hanes Tagless Boxer Briefs keep changing every time! ",
          "creator_type": "Influencer",
          "vendor_code": "dcsoundop:shop",
          "vendor_name": "DcSoundOp",
          "vendor_tracking_id": "onamzdcs034-20",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/479e029d-afe3-40ba-839b-1bf1f5a8b262/default.jobtemplate.hls.m3u8",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/7bfe1ae6-3a46-4d25-b294-238efaffdfd5.vtt",
          "type": "videos_for_related_products"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "is_prime": false,
        "is_amazon_fresh": false,
        "condition": {
          "is_new": true
        },
        "fulfillment": {
          "type": "1p",
          "is_sold_by_amazon": true,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": false
        },
        "price": {
          "symbol": "$",
          "value": 15,
          "currency": "USD",
          "raw": "$15.00"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 16,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Men's Boxer Briefs",
          "rank": 2,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1045718/ref=pd_zg_hrsr_fashion"
        }
      ],
      "manufacturer": "Hanes",
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 16, Category: Men's Boxer Briefs | Rank: 2"
    },
    "brand_store": {
      "id": "F83022EC-A709-4B2F-BCB7-7BBFA1896AB0",
      "link": "https://www.amazon.com/stores/Hanes/page/F83022EC-A709-4B2F-BCB7-7BBFA1896AB0"
    }
  };

  let result = await detectMultipack(payload);
  expect(result).toBe(true);
});

it("detect-multi-pack-pack-in-title-keyword-pair-multipack", async () => {
//https://www.amazon.com/dp/B088W9X613/ref=sspa_dk_detail_6?psc=1&pd_rd_i=B088W9X613&pd_rd_w=tAOPd&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=PWQZ7XMJVQD4WMC021B1&pd_rd_wg=i50kU&pd_rd_r=dec5a74c-619d-4037-a6ee-a71b2a4c09da&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExRkdSVFFWMUU4RlgmZW5jcnlwdGVkSWQ9QTA1NjQ1ODMzTjA5RVM5V1E5TzRJJmVuY3J5cHRlZEFkSWQ9QTAyNzY2MzVPS1JQMTRLQTlTWTcmd2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWMmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl
  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 644,
      "overage_used": 144,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-09-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/dp/B088W9X613/ref=sspa_dk_detail_6?psc=1&pd_rd_i=B088W9X613&pd_rd_w=tAOPd&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=PWQZ7XMJVQD4WMC021B1&pd_rd_wg=i50kU&pd_rd_r=dec5a74c-619d-4037-a6ee-a71b2a4c09da&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExRkdSVFFWMUU4RlgmZW5jcnlwdGVkSWQ9QTA1NjQ1ODMzTjA5RVM5V1E5TzRJJmVuY3J5cHRlZEFkSWQ9QTAyNzY2MzVPS1JQMTRLQTlTWTcmd2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWMmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "BAMBOO COOL Men’s Underwear boxer briefs Soft Comfortable Bamboo Viscose Underwear Trunks (4 Pack) Trunks B Large",
      "title_excluding_variant_name": "BAMBOO COOL Men’s Underwear boxer briefs Soft Comfortable Bamboo Viscose Underwear Trunks (4 Pack)",
      "keywords": "BAMBOO,COOL,Men’s,Underwear,boxer,briefs,Soft,Comfortable,Bamboo,Viscose,Underwear,Trunks,(4,Pack)",
      "keywords_list": [
        "BAMBOO",
        "COOL",
        "Men’s",
        "Underwear",
        "boxer",
        "briefs",
        "Soft",
        "Comfortable",
        "Bamboo",
        "Viscose",
        "Underwear",
        "Trunks",
        "Pack)"
      ],
      "asin": "B088W9X613",
      "link": "https://www.amazon.com/dp/B088W9X613??th=1&psc=1",
      "has_size_guide": true,
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
          "name": "Underwear",
          "link": "https://www.amazon.com/Mens-Underwear/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045706",
          "category_id": "1045706"
        },
        {
          "name": "Boxer Briefs",
          "link": "https://www.amazon.com/Mens-Boxer-Briefs/b/ref=dp_bc_aui_C_5?ie=UTF8&node=1045718",
          "category_id": "1045718"
        }
      ],
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/cf0b94a6-3df0-4b20-900d-20e7ca16ac8c.__CR0,0,970,300_PT0_SX970_V1___.jpg",
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/cf0b94a6-3df0-4b20-900d-20e7ca16ac8c.__CR0,0,970,300_PT0_SX970_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media/sc/d7e37aac-e1f1-4bd9-a7ad-22a6e82d3ac1.__CR0,0,970,300_PT0_SX970_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media/sc/7f2b9cee-c650-4cb4-9ea8-97c9dd589756.__CR0,0,970,300_PT0_SX970_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media/sc/a26a45be-bea9-4e5f-8767-e129a8fbe4db.__CR0,0,970,300_PT0_SX970_V1___.jpg"
          ]
        },
        "third_party": true
      },
      "sub_title": {
        "text": "Learn more Read full return policy",
        "link": "https://www.amazon.com/gp/help/customer/display.html?nodeId=201909010&ref_=buybox-secureTransaction-learnMore-web"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.4,
      "ratings_total": 3786,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/61E5TuM0T6L.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/61E5TuM0T6L._AC_UL1200_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61FdfnoYpQL._AC_UL1200_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71IcEv6da+L._AC_UL1200_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71+BCqOIb7L._AC_UL1200_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61EOeAYt6GL._AC_UL1200_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61Wj8LvQy+L._AC_UL1200_.jpg",
          "variant": "PT05"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61-G6m2HIZL._AC_UL1200_.jpg",
          "variant": "PT06"
        }
      ],
      "images_count": 7,
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 30,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Thu, Sep 15",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Mon, Sep 12",
            "name": "Or fastest delivery Mon, Sep 12. Order within 23 hrs 26 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "BAMBOO COOL",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=AGHFGR4RK7H18&asin=B088W9X613&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "AGHFGR4RK7H18"
          }
        },
        "price": {
          "symbol": "$",
          "value": 33.99,
          "currency": "USD",
          "raw": "$33.99"
        },
        "rrp": {
          "symbol": "$",
          "value": 39.99,
          "currency": "USD",
          "raw": "$39.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 1592,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Men's Boxer Briefs",
          "rank": 14,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1045718/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 1592, Category: Men's Boxer Briefs | Rank: 14"
    },
    "climate_pledge_friendly": {
      "text": "The Forest Stewardship Council",
      "image": "https://m.media-amazon.com/images/I/111pigi1ylL.png"
    }
  };

  let result = await detectMultipack(payload);
  expect(result).toBe(true);
});

it("detect-multi-pack-pack-in-title-keyword-pair-multipack", async () => {
//https://www.amazon.com/DoSmart-Women-Girls-Cable-Cotton/dp/B0777LGWTT?psc=1&pd_rd_w=tdcWA&content-id=amzn1.sym.c9b3a448-7c3c-4399-ac60-2bdc98844f72&pf_rd_p=c9b3a448-7c3c-4399-ac60-2bdc98844f72&pf_rd_r=ZGSSBPYTY732XWPVT4HC&pd_rd_wg=qcPWK&pd_rd_r=1cdbea0e-4686-42e3-9313-6f9f28c45812&ref_=sspa_dk_rhf_detail_pt_sub_6&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEyNkJZVkE5MEkzM0s0JmVuY3J5cHRlZElkPUEwMDgxMTYwMU9XVExKUkE5UEo0NyZlbmNyeXB0ZWRBZElkPUEwMTY1MDc2M0VJVEoxSElLUEJUOCZ3aWRnZXROYW1lPXNwX3JoZl9kZXRhaWwmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 645,
      "overage_used": 145,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-09-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/DoSmart-Women-Girls-Cable-Cotton/dp/B0777LGWTT?psc=1&pd_rd_w=tdcWA&content-id=amzn1.sym.c9b3a448-7c3c-4399-ac60-2bdc98844f72&pf_rd_p=c9b3a448-7c3c-4399-ac60-2bdc98844f72&pf_rd_r=ZGSSBPYTY732XWPVT4HC&pd_rd_wg=qcPWK&pd_rd_r=1cdbea0e-4686-42e3-9313-6f9f28c45812&ref_=sspa_dk_rhf_detail_pt_sub_6&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEyNkJZVkE5MEkzM0s0JmVuY3J5cHRlZElkPUEwMDgxMTYwMU9XVExKUkE5UEo0NyZlbmNyeXB0ZWRBZElkPUEwMTY1MDc2M0VJVEoxSElLUEJUOCZ3aWRnZXROYW1lPXNwX3JoZl9kZXRhaWwmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "DoSmart Women Knee High Socks Cotton Casual Solid Cable Knit Dress Long Boot Socks 3 Pairs",
      "keywords": "DoSmart,Women,Knee,High,Socks,Cotton,Casual,Solid,Cable,Knit,Dress,Long,Boot,Socks,3,Pairs",
      "keywords_list": [
        "DoSmart",
        "Women",
        "Knee",
        "High",
        "Socks",
        "Cotton",
        "Casual",
        "Solid",
        "Cable",
        "Knit",
        "Dress",
        "Long",
        "Boot",
        "Socks",
        "Pairs"
      ],
      "asin": "B0777LGWTT",
      "link": "https://www.amazon.com/dp/B0777LGWTT??th=1&psc=1",
      "brand": "DoSmart",
      "has_size_guide": true,
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
          "name": "Socks & Hosiery",
          "link": "https://www.amazon.com/Womens-Socks-and-Hosiery/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1044886",
          "category_id": "1044886"
        },
        {
          "name": "Socks",
          "link": "https://www.amazon.com/b/ref=dp_bc_aui_C_5?ie=UTF8&node=23561818011",
          "category_id": "23561818011"
        }
      ],
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "brand_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/d78fa97c-cbf6-456c-ae87-72bd4c8424a2.__CR0,0,315,145_PT0_SX315_V1___.jpg",
          "title": "DoSmart Long Knee High Boot Socks Knee High Boot Socks Best Gift Idea",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/623ca1a1-20f7-41de-9f9b-00266dfbc981.__CR0,0,1464,625_PT0_SX1464_V1___.png",
          "description": "If you are looking for comfortable and fashion winter socks, these warm wool socks are very suitable for you.",
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/623ca1a1-20f7-41de-9f9b-00266dfbc981.__CR0,0,1464,625_PT0_SX1464_V1___.png",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/1e4583f3-64c4-4a3e-bcb3-a0aaefb0f775.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/81189434-2256-4de2-9335-113aee21b1aa.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/249050e1-7322-4619-88f0-12a649fe0f99.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/df34c58f-4709-4469-ba2c-e1f7a899bc61.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/b63edc0a-47dc-4268-bb27-6499e55c3a05.__CR0,0,362,453_PT0_SX362_V1___.jpg"
          ],
          "products": [
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B01KPOIG42",
              "link": "/dp/B01KPOIG42/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51bxMo5RqsL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B01MPXOHHS",
              "link": "/dp/B01MPXOHHS/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41HXARhhnzL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B01KPOIG2E",
              "link": "/dp/B01KPOIG2E/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51nCFh2hIEL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B07YVBB1XJ",
              "link": "/dp/B07YVBB1XJ/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41hwJvsIDZL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B07P6HDJCD",
              "link": "/dp/B07P6HDJCD/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/418AuSDRzEL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B07YHN14WX",
              "link": "/dp/B07YHN14WX/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41lerf-LbfL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B07YHJGWVV",
              "link": "/dp/B07YHJGWVV/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/410%2BwjZTHhL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B07YHC4ZLQ",
              "link": "/dp/B07YHC4ZLQ/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41whBLqBl%2BL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B09L7W1X46",
              "link": "/dp/B09L7W1X46/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51CO8VFA9hL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B09L7WMVBW",
              "link": "/dp/B09L7WMVBW/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/516VSoo7cRL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B09FDGFVW9",
              "link": "/dp/B09FDGFVW9/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51kJiFKZLyL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B09FDSXJQT",
              "link": "/dp/B09FDSXJQT/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51J44nYKyDL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B07438WXKR",
              "link": "/dp/B07438WXKR/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41qevU%2B%2BGPL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B074388WK9",
              "link": "/dp/B074388WK9/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51DfUK5P3oL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B07G7RWWSZ",
              "link": "/dp/B07G7RWWSZ/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41KIIIx4QaL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B07H55S4CV",
              "link": "/dp/B07H55S4CV/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51VPiQwwFsL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B07KF3JGCR",
              "link": "/dp/B07KF3JGCR/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51zvhuSPUIL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B07H54NS73",
              "link": "/dp/B07H54NS73/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41bwwEN6ygL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B07H562VMJ",
              "link": "/dp/B07H562VMJ/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51w3VaLTYaL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B07ZRTV1Z4",
              "link": "/dp/B07ZRTV1Z4/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51SVMUAWBUL.__AC_SR166,182___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/d78fa97c-cbf6-456c-ae87-72bd4c8424a2.__CR0,0,315,145_PT0_SX315_V1___.jpg",
        "company_description_text": "If you are looking for comfortable and fashion winter socks, these warm wool socks are very suitable for you.  DoSmart Wool Sock perfectly thick and soft wool blend sock. These Wool Socks are made from the best quality wool blend. By combining Wool, Nylon, Acrylic and Polyester, they are durable and they don't have that stiff fit or itchy feel common with other kids wool socks."
      },
      "sub_title": {
        "text": "Visit the DoSmart Store",
        "link": "https://www.amazon.com/stores/DoSmart/page/80616CDC-6253-4F2B-9F44-7EA4366DE6DF?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.2,
      "ratings_total": 543,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/91F6G7BjLoL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/91F6G7BjLoL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81LhIGtpv0L._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81vv-q+VhvL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81u93ePabBL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81GRM567tiL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81yF-Cj8TCL._AC_UL1500_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "videos": [
        {
          "duration_seconds": 96,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/ec2a2aa6-1908-44bd-a383-894873ac9d31/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/411hQ9Bx-EL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Women Girls' Cable Knit Cotton Long Knee High Socks 3 Pairs"
        },
        {
          "duration_seconds": 19,
          "width": 480,
          "height": 300,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/v2/8e545887-228c-59ec-9d91-535bc69f9773/ShortForm-Generic-480p-16-9-1409173089793-rpcbe5.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/31p0e1SZ4KL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "women knee high socks"
        }
      ],
      "videos_count": 2,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/ec2a2aa6-1908-44bd-a383-894873ac9d31/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/v2/8e545887-228c-59ec-9d91-535bc69f9773/ShortForm-Generic-480p-16-9-1409173089793-rpcbe5.mp4",
      "videos_additional": [
        {
          "product_asin": "B07X1H7ZQR",
          "title": "Women Girls' Cable Knit Cotton Long Knee High Socks 3 Pairs",
          "vendor_code": "Z7AX4",
          "vendor_name": "DoSmart",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/ec2a2aa6-1908-44bd-a383-894873ac9d31/default.jobtemplate.hls.m3u8",
          "type": "videos_for_related_products"
        },
        {
          "product_asin": "B0777LGWTT",
          "title": "women knee high socks",
          "vendor_code": "Z7AX4",
          "vendor_name": "DoSmart",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/v2/8e545887-228c-59ec-9d91-535bc69f9773/ShortForm-Generic-480p-16-9-1409173089793-rpcbe5.mp4",
          "type": "videos_for_related_products"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 30,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Thu, Sep 15",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Mon, Sep 12",
            "name": "Or fastest delivery Mon, Sep 12. Order within 23 hrs 11 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "DoSmart",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A2VMJ40FIE2Z10&asin=B0777LGWTT&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A2VMJ40FIE2Z10"
          }
        },
        "price": {
          "symbol": "$",
          "value": 13.99,
          "currency": "USD",
          "raw": "$13.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 326565,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Socks",
          "rank": 2795,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/23561818011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 326565, Category: Women's Socks | Rank: 2795"
    },
    "brand_store": {
      "id": "80616CDC-6253-4F2B-9F44-7EA4366DE6DF",
      "link": "https://www.amazon.com/stores/DoSmart/page/80616CDC-6253-4F2B-9F44-7EA4366DE6DF"
    }
  };

  let result = await detectMultipack(payload);
  expect(result).toBe(true);
});

it("detect-multi-pack-pair-in-title-keyword-pack-title", async () => {
//https://www.amazon.com/DoSmart-Women-Girls-Cable-Cotton/dp/B0777LGWTT?psc=1&pd_rd_w=tdcWA&content-id=amzn1.sym.c9b3a448-7c3c-4399-ac60-2bdc98844f72&pf_rd_p=c9b3a448-7c3c-4399-ac60-2bdc98844f72&pf_rd_r=ZGSSBPYTY732XWPVT4HC&pd_rd_wg=qcPWK&pd_rd_r=1cdbea0e-4686-42e3-9313-6f9f28c45812&ref_=sspa_dk_rhf_detail_pt_sub_6&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEyNkJZVkE5MEkzM0s0JmVuY3J5cHRlZElkPUEwMDgxMTYwMU9XVExKUkE5UEo0NyZlbmNyeXB0ZWRBZElkPUEwMTY1MDc2M0VJVEoxSElLUEJUOCZ3aWRnZXROYW1lPXNwX3JoZl9kZXRhaWwmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 645,
      "overage_used": 145,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-09-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/DoSmart-Women-Girls-Cable-Cotton/dp/B0777LGWTT?psc=1&pd_rd_w=tdcWA&content-id=amzn1.sym.c9b3a448-7c3c-4399-ac60-2bdc98844f72&pf_rd_p=c9b3a448-7c3c-4399-ac60-2bdc98844f72&pf_rd_r=ZGSSBPYTY732XWPVT4HC&pd_rd_wg=qcPWK&pd_rd_r=1cdbea0e-4686-42e3-9313-6f9f28c45812&ref_=sspa_dk_rhf_detail_pt_sub_6&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEyNkJZVkE5MEkzM0s0JmVuY3J5cHRlZElkPUEwMDgxMTYwMU9XVExKUkE5UEo0NyZlbmNyeXB0ZWRBZElkPUEwMTY1MDc2M0VJVEoxSElLUEJUOCZ3aWRnZXROYW1lPXNwX3JoZl9kZXRhaWwmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "DoSmart Women Knee High Socks Cotton Casual Solid Cable Knit Dress Long Boot Socks 3 Pairs",
      "keywords": "DoSmart,Women,Knee,High,Socks,Cotton,Casual,Solid,Cable,Knit,Dress,Long,Boot,Socks,3,Pairs",
      "keywords_list": [
        "DoSmart",
        "Women",
        "Knee",
        "High",
        "Socks",
        "Cotton",
        "Casual",
        "Solid",
        "Cable",
        "Knit",
        "Dress",
        "Long",
        "Boot",
        "Socks",
        "Pairs"
      ],
      "asin": "B0777LGWTT",
      "link": "https://www.amazon.com/dp/B0777LGWTT??th=1&psc=1",
      "brand": "DoSmart",
      "has_size_guide": true,
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
          "name": "Socks & Hosiery",
          "link": "https://www.amazon.com/Womens-Socks-and-Hosiery/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1044886",
          "category_id": "1044886"
        },
        {
          "name": "Socks",
          "link": "https://www.amazon.com/b/ref=dp_bc_aui_C_5?ie=UTF8&node=23561818011",
          "category_id": "23561818011"
        }
      ],
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "brand_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/d78fa97c-cbf6-456c-ae87-72bd4c8424a2.__CR0,0,315,145_PT0_SX315_V1___.jpg",
          "title": "DoSmart Long Knee High Boot Socks Knee High Boot Socks Best Gift Idea",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/623ca1a1-20f7-41de-9f9b-00266dfbc981.__CR0,0,1464,625_PT0_SX1464_V1___.png",
          "description": "If you are looking for comfortable and fashion winter socks, these warm wool socks are very suitable for you.",
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/623ca1a1-20f7-41de-9f9b-00266dfbc981.__CR0,0,1464,625_PT0_SX1464_V1___.png",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/1e4583f3-64c4-4a3e-bcb3-a0aaefb0f775.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/81189434-2256-4de2-9335-113aee21b1aa.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/249050e1-7322-4619-88f0-12a649fe0f99.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/df34c58f-4709-4469-ba2c-e1f7a899bc61.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/b63edc0a-47dc-4268-bb27-6499e55c3a05.__CR0,0,362,453_PT0_SX362_V1___.jpg"
          ],
          "products": [
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B01KPOIG42",
              "link": "/dp/B01KPOIG42/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51bxMo5RqsL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B01MPXOHHS",
              "link": "/dp/B01MPXOHHS/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41HXARhhnzL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B01KPOIG2E",
              "link": "/dp/B01KPOIG2E/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51nCFh2hIEL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B07YVBB1XJ",
              "link": "/dp/B07YVBB1XJ/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41hwJvsIDZL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B07P6HDJCD",
              "link": "/dp/B07P6HDJCD/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/418AuSDRzEL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B07YHN14WX",
              "link": "/dp/B07YHN14WX/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41lerf-LbfL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B07YHJGWVV",
              "link": "/dp/B07YHJGWVV/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/410%2BwjZTHhL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B07YHC4ZLQ",
              "link": "/dp/B07YHC4ZLQ/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41whBLqBl%2BL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B09L7W1X46",
              "link": "/dp/B09L7W1X46/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51CO8VFA9hL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B09L7WMVBW",
              "link": "/dp/B09L7WMVBW/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/516VSoo7cRL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B09FDGFVW9",
              "link": "/dp/B09FDGFVW9/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51kJiFKZLyL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B09FDSXJQT",
              "link": "/dp/B09FDSXJQT/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51J44nYKyDL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B07438WXKR",
              "link": "/dp/B07438WXKR/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41qevU%2B%2BGPL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B074388WK9",
              "link": "/dp/B074388WK9/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51DfUK5P3oL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B07G7RWWSZ",
              "link": "/dp/B07G7RWWSZ/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41KIIIx4QaL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B07H55S4CV",
              "link": "/dp/B07H55S4CV/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51VPiQwwFsL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B07KF3JGCR",
              "link": "/dp/B07KF3JGCR/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51zvhuSPUIL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B07H54NS73",
              "link": "/dp/B07H54NS73/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41bwwEN6ygL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B07H562VMJ",
              "link": "/dp/B07H562VMJ/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51w3VaLTYaL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B07ZRTV1Z4",
              "link": "/dp/B07ZRTV1Z4/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51SVMUAWBUL.__AC_SR166,182___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/d78fa97c-cbf6-456c-ae87-72bd4c8424a2.__CR0,0,315,145_PT0_SX315_V1___.jpg",
        "company_description_text": "If you are looking for comfortable and fashion winter socks, these warm wool socks are very suitable for you.  DoSmart Wool Sock perfectly thick and soft wool blend sock. These Wool Socks are made from the best quality wool blend. By combining Wool, Nylon, Acrylic and Polyester, they are durable and they don't have that stiff fit or itchy feel common with other kids wool socks."
      },
      "sub_title": {
        "text": "Visit the DoSmart Store",
        "link": "https://www.amazon.com/stores/DoSmart/page/80616CDC-6253-4F2B-9F44-7EA4366DE6DF?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.2,
      "ratings_total": 543,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/91F6G7BjLoL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/91F6G7BjLoL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81LhIGtpv0L._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81vv-q+VhvL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81u93ePabBL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81GRM567tiL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81yF-Cj8TCL._AC_UL1500_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "videos": [
        {
          "duration_seconds": 96,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/ec2a2aa6-1908-44bd-a383-894873ac9d31/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/411hQ9Bx-EL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Women Girls' Cable Knit Cotton Long Knee High Socks 3 Pairs"
        },
        {
          "duration_seconds": 19,
          "width": 480,
          "height": 300,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/v2/8e545887-228c-59ec-9d91-535bc69f9773/ShortForm-Generic-480p-16-9-1409173089793-rpcbe5.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/31p0e1SZ4KL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "women knee high socks"
        }
      ],
      "videos_count": 2,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/ec2a2aa6-1908-44bd-a383-894873ac9d31/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/v2/8e545887-228c-59ec-9d91-535bc69f9773/ShortForm-Generic-480p-16-9-1409173089793-rpcbe5.mp4",
      "videos_additional": [
        {
          "product_asin": "B07X1H7ZQR",
          "title": "Women Girls' Cable Knit Cotton Long Knee High Socks 3 Pairs",
          "vendor_code": "Z7AX4",
          "vendor_name": "DoSmart",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/ec2a2aa6-1908-44bd-a383-894873ac9d31/default.jobtemplate.hls.m3u8",
          "type": "videos_for_related_products"
        },
        {
          "product_asin": "B0777LGWTT",
          "title": "women knee high socks",
          "vendor_code": "Z7AX4",
          "vendor_name": "DoSmart",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/v2/8e545887-228c-59ec-9d91-535bc69f9773/ShortForm-Generic-480p-16-9-1409173089793-rpcbe5.mp4",
          "type": "videos_for_related_products"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 30,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Thu, Sep 15",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Mon, Sep 12",
            "name": "Or fastest delivery Mon, Sep 12. Order within 23 hrs 11 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "DoSmart",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A2VMJ40FIE2Z10&asin=B0777LGWTT&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A2VMJ40FIE2Z10"
          }
        },
        "price": {
          "symbol": "$",
          "value": 13.99,
          "currency": "USD",
          "raw": "$13.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 326565,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Socks",
          "rank": 2795,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/23561818011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 326565, Category: Women's Socks | Rank: 2795"
    },
    "brand_store": {
      "id": "80616CDC-6253-4F2B-9F44-7EA4366DE6DF",
      "link": "https://www.amazon.com/stores/DoSmart/page/80616CDC-6253-4F2B-9F44-7EA4366DE6DF"
    }
  };

  let result = await detectMultipack(payload);
  expect(result).toBe(true);
});

it("detect-multi-pack-pair-in-title-keyword-pack-title", async () => {
//https://www.amazon.com/DoSmart-Women-Girls-Cable-Cotton/dp/B0777LGWTT?psc=1&pd_rd_w=tdcWA&content-id=amzn1.sym.c9b3a448-7c3c-4399-ac60-2bdc98844f72&pf_rd_p=c9b3a448-7c3c-4399-ac60-2bdc98844f72&pf_rd_r=ZGSSBPYTY732XWPVT4HC&pd_rd_wg=qcPWK&pd_rd_r=1cdbea0e-4686-42e3-9313-6f9f28c45812&ref_=sspa_dk_rhf_detail_pt_sub_6&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEyNkJZVkE5MEkzM0s0JmVuY3J5cHRlZElkPUEwMDgxMTYwMU9XVExKUkE5UEo0NyZlbmNyeXB0ZWRBZElkPUEwMTY1MDc2M0VJVEoxSElLUEJUOCZ3aWRnZXROYW1lPXNwX3JoZl9kZXRhaWwmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 646,
      "overage_used": 146,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-09-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/DoSmart-Women-Girls-Cable-Cotton/dp/B0777LGWTT?psc=1&pd_rd_w=tdcWA&content-id=amzn1.sym.c9b3a448-7c3c-4399-ac60-2bdc98844f72&pf_rd_p=c9b3a448-7c3c-4399-ac60-2bdc98844f72&pf_rd_r=ZGSSBPYTY732XWPVT4HC&pd_rd_wg=qcPWK&pd_rd_r=1cdbea0e-4686-42e3-9313-6f9f28c45812&ref_=sspa_dk_rhf_detail_pt_sub_6&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEyNkJZVkE5MEkzM0s0JmVuY3J5cHRlZElkPUEwMDgxMTYwMU9XVExKUkE5UEo0NyZlbmNyeXB0ZWRBZElkPUEwMTY1MDc2M0VJVEoxSElLUEJUOCZ3aWRnZXROYW1lPXNwX3JoZl9kZXRhaWwmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "DoSmart Women Knee High Socks Cotton Casual Solid Cable Knit Dress Long Boot Socks 3 Pairs",
      "keywords": "DoSmart,Women,Knee,High,Socks,Cotton,Casual,Solid,Cable,Knit,Dress,Long,Boot,Socks,3,Pairs",
      "keywords_list": [
        "DoSmart",
        "Women",
        "Knee",
        "High",
        "Socks",
        "Cotton",
        "Casual",
        "Solid",
        "Cable",
        "Knit",
        "Dress",
        "Long",
        "Boot",
        "Socks",
        "Pairs"
      ],
      "asin": "B0777LGWTT",
      "link": "https://www.amazon.com/dp/B0777LGWTT??th=1&psc=1",
      "brand": "DoSmart",
      "has_size_guide": true,
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
          "name": "Socks & Hosiery",
          "link": "https://www.amazon.com/Womens-Socks-and-Hosiery/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1044886",
          "category_id": "1044886"
        },
        {
          "name": "Socks",
          "link": "https://www.amazon.com/b/ref=dp_bc_aui_C_5?ie=UTF8&node=23561818011",
          "category_id": "23561818011"
        }
      ],
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "brand_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/d78fa97c-cbf6-456c-ae87-72bd4c8424a2.__CR0,0,315,145_PT0_SX315_V1___.jpg",
          "title": "DoSmart Long Knee High Boot Socks Knee High Boot Socks Best Gift Idea",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/623ca1a1-20f7-41de-9f9b-00266dfbc981.__CR0,0,1464,625_PT0_SX1464_V1___.png",
          "description": "If you are looking for comfortable and fashion winter socks, these warm wool socks are very suitable for you.",
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/623ca1a1-20f7-41de-9f9b-00266dfbc981.__CR0,0,1464,625_PT0_SX1464_V1___.png",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/1e4583f3-64c4-4a3e-bcb3-a0aaefb0f775.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/81189434-2256-4de2-9335-113aee21b1aa.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/249050e1-7322-4619-88f0-12a649fe0f99.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/df34c58f-4709-4469-ba2c-e1f7a899bc61.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/b63edc0a-47dc-4268-bb27-6499e55c3a05.__CR0,0,362,453_PT0_SX362_V1___.jpg"
          ],
          "products": [
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B01KPOIG42",
              "link": "/dp/B01KPOIG42/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51bxMo5RqsL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B01MPXOHHS",
              "link": "/dp/B01MPXOHHS/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41HXARhhnzL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B01KPOIG2E",
              "link": "/dp/B01KPOIG2E/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51nCFh2hIEL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B07YVBB1XJ",
              "link": "/dp/B07YVBB1XJ/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41hwJvsIDZL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B07P6HDJCD",
              "link": "/dp/B07P6HDJCD/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/418AuSDRzEL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B07YHN14WX",
              "link": "/dp/B07YHN14WX/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41lerf-LbfL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B07YHJGWVV",
              "link": "/dp/B07YHJGWVV/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/410%2BwjZTHhL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B07YHC4ZLQ",
              "link": "/dp/B07YHC4ZLQ/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41whBLqBl%2BL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B09L7W1X46",
              "link": "/dp/B09L7W1X46/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51CO8VFA9hL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B09L7WMVBW",
              "link": "/dp/B09L7WMVBW/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/516VSoo7cRL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B09FDGFVW9",
              "link": "/dp/B09FDGFVW9/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51kJiFKZLyL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Women's Winter Warm Knee High Socks Boot Socks 2-Pairs Multi Color",
              "asin": "B09FDSXJQT",
              "link": "/dp/B09FDSXJQT/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51J44nYKyDL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B07438WXKR",
              "link": "/dp/B07438WXKR/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41qevU%2B%2BGPL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B074388WK9",
              "link": "/dp/B074388WK9/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51DfUK5P3oL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B07G7RWWSZ",
              "link": "/dp/B07G7RWWSZ/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41KIIIx4QaL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B07H55S4CV",
              "link": "/dp/B07H55S4CV/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51VPiQwwFsL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B07KF3JGCR",
              "link": "/dp/B07KF3JGCR/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51zvhuSPUIL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B07H54NS73",
              "link": "/dp/B07H54NS73/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41bwwEN6ygL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B07H562VMJ",
              "link": "/dp/B07H562VMJ/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51w3VaLTYaL.__AC_SR166,182___.jpg"
            },
            {
              "title": "DoSmart Womens Soft Warm Coral Velvet Knee High Stockings Fuzzy Socks",
              "asin": "B07ZRTV1Z4",
              "link": "/dp/B07ZRTV1Z4/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51SVMUAWBUL.__AC_SR166,182___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/d78fa97c-cbf6-456c-ae87-72bd4c8424a2.__CR0,0,315,145_PT0_SX315_V1___.jpg",
        "company_description_text": "If you are looking for comfortable and fashion winter socks, these warm wool socks are very suitable for you.  DoSmart Wool Sock perfectly thick and soft wool blend sock. These Wool Socks are made from the best quality wool blend. By combining Wool, Nylon, Acrylic and Polyester, they are durable and they don't have that stiff fit or itchy feel common with other kids wool socks."
      },
      "sub_title": {
        "text": "Visit the DoSmart Store",
        "link": "https://www.amazon.com/stores/DoSmart/page/80616CDC-6253-4F2B-9F44-7EA4366DE6DF?ref_=ast_bln"
      },
      "rating": 4.2,
      "ratings_total": 543,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/91F6G7BjLoL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/91F6G7BjLoL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81LhIGtpv0L._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81vv-q+VhvL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81u93ePabBL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81GRM567tiL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81yF-Cj8TCL._AC_UL1500_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "videos": [
        {
          "duration_seconds": 96,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/ec2a2aa6-1908-44bd-a383-894873ac9d31/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/411hQ9Bx-EL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Women Girls' Cable Knit Cotton Long Knee High Socks 3 Pairs"
        },
        {
          "duration_seconds": 19,
          "width": 480,
          "height": 300,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/v2/8e545887-228c-59ec-9d91-535bc69f9773/ShortForm-Generic-480p-16-9-1409173089793-rpcbe5.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/31p0e1SZ4KL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "women knee high socks"
        }
      ],
      "videos_count": 2,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/ec2a2aa6-1908-44bd-a383-894873ac9d31/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/v2/8e545887-228c-59ec-9d91-535bc69f9773/ShortForm-Generic-480p-16-9-1409173089793-rpcbe5.mp4",
      "videos_additional": [
        {
          "product_asin": "B07X1H7ZQR",
          "title": "Women Girls' Cable Knit Cotton Long Knee High Socks 3 Pairs",
          "vendor_code": "Z7AX4",
          "vendor_name": "DoSmart",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/ec2a2aa6-1908-44bd-a383-894873ac9d31/default.jobtemplate.hls.m3u8",
          "type": "videos_for_related_products"
        },
        {
          "product_asin": "B0777LGWTT",
          "title": "women knee high socks",
          "vendor_code": "Z7AX4",
          "vendor_name": "DoSmart",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/v2/8e545887-228c-59ec-9d91-535bc69f9773/ShortForm-Generic-480p-16-9-1409173089793-rpcbe5.mp4",
          "type": "videos_for_related_products"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 30,
          "hard_maximum": true
        },
        "is_prime": false,
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
          "type": "2p",
          "standard_delivery": {
            "date": "Thursday, September 15"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "DoSmart",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A2VMJ40FIE2Z10&asin=B0777LGWTT&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A2VMJ40FIE2Z10"
          }
        },
        "price": {
          "symbol": "$",
          "value": 13.99,
          "currency": "USD",
          "raw": "$13.99"
        },
        "shipping": {
          "symbol": "$",
          "value": 18.34,
          "currency": "USD",
          "raw": "No Import Fees Deposit & $18.34 Shipping to Italy"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 326565,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Socks",
          "rank": 2795,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/23561818011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 326565, Category: Women's Socks | Rank: 2795"
    },
    "brand_store": {
      "id": "80616CDC-6253-4F2B-9F44-7EA4366DE6DF",
      "link": "https://www.amazon.com/stores/DoSmart/page/80616CDC-6253-4F2B-9F44-7EA4366DE6DF"
    }
  };

  let result = await detectMultipack(payload);
  expect(result).toBe(true);
});

it("detect-multi-pack-pair-in-title", async () => {
//https://www.amazon.com/dp/B01G90UG6M/ref=sspa_dk_detail_3?psc=1&pd_rd_i=B01G90UG6M&pd_rd_w=bgUf2&content-id=amzn1.sym.bff6e147-54ad-4be3-b4ea-ec19ea6167f7&pf_rd_p=bff6e147-54ad-4be3-b4ea-ec19ea6167f7&pf_rd_r=6QWJH1SE1CGKXP8XCBBM&pd_rd_wg=QOlIy&pd_rd_r=07b4a755-957a-4980-a3e0-f47edcdb5e1d&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWwy

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 647,
      "overage_used": 147,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-09-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/dp/B01G90UG6M/ref=sspa_dk_detail_3?psc=1&pd_rd_i=B01G90UG6M&pd_rd_w=bgUf2&content-id=amzn1.sym.bff6e147-54ad-4be3-b4ea-ec19ea6167f7&pf_rd_p=bff6e147-54ad-4be3-b4ea-ec19ea6167f7&pf_rd_r=6QWJH1SE1CGKXP8XCBBM&pd_rd_wg=QOlIy&pd_rd_r=07b4a755-957a-4980-a3e0-f47edcdb5e1d&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWwy",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "The Children's Place Baby Girl's and Toddler Girl's Leggings 2 pack 4T Black/Shell 2 Pack",
      "title_excluding_variant_name": "The Children's Place Baby Girl's and Toddler Girl's Leggings",
      "keywords": "The,Children's,Place,Baby,Girl's,and,Toddler,Girl's,Leggings",
      "keywords_list": [
        "Children's",
        "Place",
        "Baby",
        "Girl's",
        "Toddler",
        "Girl's",
        "Leggings"
      ],
      "asin": "B01G90UG6M",
      "link": "https://www.amazon.com/dp/B01G90UG6M??th=1&psc=1",
      "brand": "The Children's Place",
      "has_size_guide": true,
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
          "name": "Baby",
          "link": "https://www.amazon.com/Baby-Clothing-Shoes/b/ref=dp_bc_aui_C_2?ie=UTF8&node=7147444011",
          "category_id": "7147444011"
        },
        {
          "name": "Baby Girls",
          "link": "https://www.amazon.com/Baby-Girls-Clothing-Shoes/b/ref=dp_bc_aui_C_3?ie=UTF8&node=7628012011",
          "category_id": "7628012011"
        },
        {
          "name": "Clothing",
          "link": "https://www.amazon.com/Baby-Girls-Clothing/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1044512",
          "category_id": "1044512"
        },
        {
          "name": "Bottoms",
          "link": "https://www.amazon.com/Baby-Girls-Bottoms/b/ref=dp_bc_aui_C_5?ie=UTF8&node=3526419011",
          "category_id": "3526419011"
        },
        {
          "name": "Leggings",
          "link": "https://www.amazon.com/Baby-Girls-Leggings/b/ref=dp_bc_aui_C_6?ie=UTF8&node=10932934011",
          "category_id": "10932934011"
        }
      ],
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media/sota/ea236fc5-9ca4-46a3-87dd-fdd9b5aa4a2a.__CR0,0,970,300_PT0_SX970_V1___.jpg",
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media/sota/ea236fc5-9ca4-46a3-87dd-fdd9b5aa4a2a.__CR0,0,970,300_PT0_SX970_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media/sota/34d5057b-209b-4d5e-bfdc-fef5665a21b9.__CR0,0,970,300_PT0_SX970_V1___.jpg"
          ]
        },
        "third_party": true
      },
      "sub_title": {
        "text": "Visit the The Children's Place Store",
        "link": "https://www.amazon.com/stores/TheChildrensPlace/page/60650546-67AD-4FF3-B578-BF8BA0C2686B?ref_=ast_bln"
      },
      "amazons_choice": {
        "keywords": "toddler girl leggings 4t",
        "link": "https://www.amazon.com/s/ref=choice_dp_b?keywords=toddler%20girl%20leggings%204t"
      },
      "rating": 4.7,
      "ratings_total": 7121,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/61jAgszNTaL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/61jAgszNTaL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51C9pL5U-NL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/41MvEI-kPhL._AC_UL1391_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51N2TQwxLTL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71vhUrimIDL._AC_UL1500_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 5,
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 10,
          "hard_maximum": true
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
            "date": "Thursday, September 15",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Monday, September 12",
            "name": "Or fastest delivery Monday, September 12. Order within 22 hrs 56 mins"
          },
          "is_sold_by_amazon": true,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": false
        },
        "price": {
          "symbol": "$",
          "value": 8,
          "currency": "USD",
          "raw": "$8.00"
        },
        "rrp": {
          "symbol": "$",
          "value": 16.5,
          "currency": "USD",
          "raw": "$16.50"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 312,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Baby Girls' Leggings",
          "rank": 1,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/10932934011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "manufacturer": "The Children's Place",
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 312, Category: Baby Girls' Leggings | Rank: 1"
    },
    "brand_store": {
      "id": "60650546-67AD-4FF3-B578-BF8BA0C2686B",
      "link": "https://www.amazon.com/stores/TheChildrensPlace/page/60650546-67AD-4FF3-B578-BF8BA0C2686B"
    }
  };

  let result = await detectMultipack(payload);
  expect(result).toBe(true);
});

it("detect-multi-pack-pair-in-title", async () => {
//  https://www.amazon.com/dp/B01IEY1QC4/ref=sspa_dk_detail_1?psc=1&pd_rd_i=B01IEY1QC4&pd_rd_w=YBiv8&content-id=amzn1.sym.bff6e147-54ad-4be3-b4ea-ec19ea6167f7&pf_rd_p=bff6e147-54ad-4be3-b4ea-ec19ea6167f7&pf_rd_r=M3N6DM2MD3NGSJPZH1WR&pd_rd_wg=HpFix&pd_rd_r=d211309e-e174-4ec9-8f6c-84baf8a083f5&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWwy&smid=A12JBI2KWPHD4P
  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 648,
      "overage_used": 148,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-09-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/dp/B01IEY1QC4/ref=sspa_dk_detail_1?psc=1&pd_rd_i=B01IEY1QC4&pd_rd_w=YBiv8&content-id=amzn1.sym.bff6e147-54ad-4be3-b4ea-ec19ea6167f7&pf_rd_p=bff6e147-54ad-4be3-b4ea-ec19ea6167f7&pf_rd_r=M3N6DM2MD3NGSJPZH1WR&pd_rd_wg=HpFix&pd_rd_r=d211309e-e174-4ec9-8f6c-84baf8a083f5&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWwy&smid=A12JBI2KWPHD4P",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "TAIYCYXGAN Baby Girls 0-3T Infant Stock Legging Pants 3 Pack Tights Panties Stockings White Grey Pink 1-2T White/Gray/Pink",
      "title_excluding_variant_name": "TAIYCYXGAN Baby Girls 0-3T Infant Stock Legging Pants 3 Pack Tights Panties Stockings White Grey Pink",
      "keywords": "TAIYCYXGAN,Baby,Girls,0-3T,Infant,Stock,Legging,Pants,3,Pack,Tights,Panties,Stockings,White,Grey,Pink",
      "keywords_list": [
        "TAIYCYXGAN",
        "Baby",
        "Girls",
        "0-3T",
        "Infant",
        "Stock",
        "Legging",
        "Pants",
        "Pack",
        "Tights",
        "Panties",
        "Stockings",
        "White",
        "Grey",
        "Pink"
      ],
      "asin": "B01IEY1QC4",
      "link": "https://www.amazon.com/dp/B01IEY1QC4??th=1&psc=1",
      "brand": "TAIYCYXGAN",
      "has_size_guide": true,
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
          "name": "Baby",
          "link": "https://www.amazon.com/Baby-Clothing-Shoes/b/ref=dp_bc_aui_C_2?ie=UTF8&node=7147444011",
          "category_id": "7147444011"
        },
        {
          "name": "Baby Girls",
          "link": "https://www.amazon.com/Baby-Girls-Clothing-Shoes/b/ref=dp_bc_aui_C_3?ie=UTF8&node=7628012011",
          "category_id": "7628012011"
        },
        {
          "name": "Clothing",
          "link": "https://www.amazon.com/Baby-Girls-Clothing/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1044512",
          "category_id": "1044512"
        },
        {
          "name": "Bottoms",
          "link": "https://www.amazon.com/Baby-Girls-Bottoms/b/ref=dp_bc_aui_C_5?ie=UTF8&node=3526419011",
          "category_id": "3526419011"
        },
        {
          "name": "Leggings",
          "link": "https://www.amazon.com/Baby-Girls-Leggings/b/ref=dp_bc_aui_C_6?ie=UTF8&node=10932934011",
          "category_id": "10932934011"
        }
      ],
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": false,
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media/sc/7e768c20-c7d4-4737-a1e9-d5ead0a926ed.__CR0,8,944,283_PT0_SX600_V1___.jpg",
        "company_description_text": "Thin and seneral section tights for baby girls：Pack of 3 tights with different styles for all weathers and seasons. \n\n Unique elastic double needles to weave the waist to keep your baby comfortable whole day. \n\n Knit cotton high elasticity tights with 3 colors, approx 80% pure cotton to keep the infant girl tights soft and breathable for your little girl skin. \n\n Size: 6-12 months/1-2 years old/2-3 years old. \n\n Season: Spring, summer, autumn, winter. \n\n Easily to match with any style clothes and suit for warm weather or cold weather. \n\n Wash: Hand/Machine wash in cold water, drip dry. Do not bleach. \n\n Package Included: 3 pack x tights."
      },
      "sub_title": {
        "text": "Brand: TAIYCYXGAN",
        "link": "https://www.amazon.com/TAIYCYXGAN/b/ref=bl_sl_s_ap_web_20341727011?ie=UTF8&node=20341727011&field-lbr_brands_browse-bin=TAIYCYXGAN"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.6,
      "ratings_total": 792,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/61nExMIm8-L.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/61nExMIm8-L._AC_UL1335_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61a0uQ+ThdL._AC_UL1112_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61RJRrCXpZL._AC_UL1052_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51Oo0bWPB-L._AC_UL1072_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/619AVzsm9qL._AC_UL1028_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61vGJOWIBiL._AC_UL1100_.jpg",
          "variant": "PT05"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71CwkX6h89L._AC_UL1335_.jpg",
          "variant": "PT06"
        }
      ],
      "images_count": 7,
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 19,
          "hard_maximum": true
        },
        "new_offers_count": 2,
        "new_offers_from": {
          "symbol": "$",
          "value": 14.99,
          "currency": "USD",
          "raw": "$14.99"
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
          "type": "2p",
          "standard_delivery": {
            "date": "Thu, Sep 15",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Mon, Sep 12",
            "name": "Or fastest delivery Mon, Sep 12. Order within 22 hrs 52 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "taiycyxgan",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A12JBI2KWPHD4P&asin=B01IEY1QC4&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A12JBI2KWPHD4P"
          }
        },
        "price": {
          "symbol": "$",
          "value": 14.99,
          "currency": "USD",
          "raw": "$14.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 636531,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Baby Girls' Leggings",
          "rank": 95,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/10932934011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 636531, Category: Baby Girls' Leggings | Rank: 95"
    }
  };

  let result = await detectMultipack(payload);
  expect(result).toBe(true);
});

it("detect-multi-pack-in-title", async () => {
//https://www.amazon.com/dp/B08SYKBD6W/ref=sspa_dk_detail_5?psc=1&pd_rd_i=B08SYKBD6W&pd_rd_w=m8z7I&content-id=amzn1.sym.37ad3f81-aeff-4fe7-accb-8665976bb5fc&pf_rd_p=37ad3f81-aeff-4fe7-accb-8665976bb5fc&pf_rd_r=TFPYY0G2ZP9K0J0M2CC7&pd_rd_wg=quiV1&pd_rd_r=8009bed0-56f9-486d-b577-3f3215768090&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&smid=A2N43JHNO0NHQ7&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUFEVU00MDZWWFpNU0kmZW5jcnlwdGVkSWQ9QTA5Njc0OTAzMFI5UlJES1o1RVE1JmVuY3J5cHRlZEFkSWQ9QTA2Njk1OTYyUzlET0Y5Vko1SlREJndpZGdldE5hbWU9c3BfZGV0YWlsX3RoZW1hdGljJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==
  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 656,
      "overage_used": 156,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-09-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/dp/B08SYKBD6W/ref=sspa_dk_detail_5?psc=1&pd_rd_i=B08SYKBD6W&pd_rd_w=m8z7I&content-id=amzn1.sym.37ad3f81-aeff-4fe7-accb-8665976bb5fc&pf_rd_p=37ad3f81-aeff-4fe7-accb-8665976bb5fc&pf_rd_r=TFPYY0G2ZP9K0J0M2CC7&pd_rd_wg=quiV1&pd_rd_r=8009bed0-56f9-486d-b577-3f3215768090&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&smid=A2N43JHNO0NHQ7&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUFEVU00MDZWWFpNU0kmZW5jcnlwdGVkSWQ9QTA5Njc0OTAzMFI5UlJES1o1RVE1JmVuY3J5cHRlZEFkSWQ9QTA2Njk1OTYyUzlET0Y5Vko1SlREJndpZGdldE5hbWU9c3BfZGV0YWlsX3RoZW1hdGljJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "9 Pack of Mens Cotton Slub Pocket Tees Tshirt, T-Shirts in Bulk Wholesale, Colorful Packs 3X-Large",
      "title_excluding_variant_name": "9 Pack of Mens Cotton Slub Pocket Tees Tshirt, T-Shirts in Bulk Wholesale, Colorful Packs",
      "keywords": "9,Pack,of,Mens,Cotton,Slub,Pocket,Tees,Tshirt,,T-Shirts,in,Bulk,Wholesale,,Colorful,Packs",
      "keywords_list": [
        "Pack",
        "Mens",
        "Cotton",
        "Slub",
        "Pocket",
        "Tees",
        "Tshirt",
        "T-Shirts",
        "Bulk",
        "Wholesale",
        "Colorful",
        "Packs"
      ],
      "asin": "B08SYKBD6W",
      "link": "https://www.amazon.com/dp/B08SYKBD6W??th=1&psc=1",
      "brand": "Yacht & Smith",
      "has_size_guide": true,
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
          "name": "Shirts",
          "link": "https://www.amazon.com/Mens-Shirts/b/ref=dp_bc_aui_C_4?ie=UTF8&node=2476517011",
          "category_id": "2476517011"
        },
        {
          "name": "T-Shirts",
          "link": "https://www.amazon.com/Mens-T-Shirts/b/ref=dp_bc_aui_C_5?ie=UTF8&node=1045624",
          "category_id": "1045624"
        }
      ],
      "description": "9 PACK OF COLORED MENS SLUB TSHIRTS IN BULK: \nSoft cotton tshirts for guys who want variety of colors. Great solid color assortment matches well with jeans, and all colors of pants. Tees in a variety of great colors is a staple in every mans wardrobe.\n\nSLUB STYLE SHIRT IS CASUAL AND A BASIC FOR EVERY MAN:\nMen love the soft shirts. If your looking for something more than a simple black or white tee, this assorted colorful t-shirt pack is for you\n\nTEES IN BULK:\nColors include blue, maroon, turquoise, light olive green, indigo blue, light grey, light pink, charcoal gray, yellow. \n\nYACHT & SMITH BULK TEE SHIRTS AT WHOLESALE VALUE:\nStock up on tees in bulk! Save your dollars and get a nice colorful assortment of amazing comfy shirts.",
      "sub_title": {
        "text": "Visit the Yacht & Smith Store",
        "link": "https://www.amazon.com/stores/YACHTSMITH/page/581CF6DC-556D-4B5F-A5B6-E35453C0639E?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 3.9,
      "ratings_total": 398,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/81cVx9FpOlL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/81cVx9FpOlL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/91Qw8ahU6hL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71U1NvyDFCL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71aRZCBd9JL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71XmECnH9bS._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/719cOKWPObL._AC_UL1500_.jpg",
          "variant": "PT05"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81cVx9FpOlL._AC_UL1500_.jpg",
          "variant": "PT08"
        }
      ],
      "images_count": 7,
      "videos": [
        {
          "duration_seconds": 41,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/1c5f69a1-1d94-430d-9732-4cd40896bdfc/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/A1tRA1Crl0L.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Great Colors of Cotton Slub T-shirts "
        }
      ],
      "videos_count": 1,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/1c5f69a1-1d94-430d-9732-4cd40896bdfc/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "product_asin": "B08M4FD3NZ",
          "title": "Great Colors of Cotton Slub T-shirts ",
          "vendor_code": "Z7AX4",
          "vendor_name": "Wholesale Sock Deals",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/1c5f69a1-1d94-430d-9732-4cd40896bdfc/default.jobtemplate.hls.m3u8",
          "type": "videos_for_related_products"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 30,
          "hard_maximum": true
        },
        "new_offers_count": 2,
        "new_offers_from": {
          "symbol": "$",
          "value": 68.94,
          "currency": "USD",
          "raw": "$68.94"
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
          "type": "2p",
          "standard_delivery": {
            "date": "Thu, Sep 15",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Tue, Sep 13",
            "name": "Or fastest delivery Tue, Sep 13. Order within 19 hrs 37 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Wholesale Sock Deals",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A2N43JHNO0NHQ7&asin=B08SYKBD6W&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A2N43JHNO0NHQ7"
          }
        },
        "price": {
          "symbol": "$",
          "value": 68.94,
          "currency": "USD",
          "raw": "$68.94"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 128198,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Men's T-Shirts",
          "rank": 900,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1045624/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 128198, Category: Men's T-Shirts | Rank: 900"
    },
    "brand_store": {
      "id": "581CF6DC-556D-4B5F-A5B6-E35453C0639E",
      "link": "https://www.amazon.com/stores/YACHTSMITH/page/581CF6DC-556D-4B5F-A5B6-E35453C0639E"
    }
  };

  let result = await detectMultipack(payload);
  expect(result).toBe(true);
});

//Not Multi-Pack Links

it("detect-not-a-multi-pack", async () => {
//https://www.amazon.com/Amazon-Essentials-Womens-French-Sweatpant/dp/B07FDKR3GV/ref=sr_1_14?crid=1TFF9VU3UJY7B&keywords=multipack+fashion+clothing&qid=1662631537&sprefix=multipack+fasion+clothing%2Caps%2C349&sr=8-14

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 634,
      "overage_used": 134,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-09-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/Amazon-Essentials-Womens-French-Sweatpant/dp/B07FDKR3GV/ref=sr_1_14?",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "Amazon Essentials Women's French Terry Fleece Jogger Sweatpant (Available in Plus Size)",
      "keywords": "Amazon,Essentials,Women's,French,Terry,Fleece,Jogger,Sweatpant,(Available,in,Plus,Size)",
      "keywords_list": [
        "Amazon",
        "Essentials",
        "Women's",
        "French",
        "Terry",
        "Fleece",
        "Jogger",
        "Sweatpant",
        "(Available",
        "Plus",
        "Size)"
      ],
      "asin": "B07BJ86RZP",
      "link": "https://www.amazon.com/Amazon-Essentials-Womens-Sweatpant-Available/dp/B09RQC24VC",
      "has_size_guide": true,
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
          "name": "Active",
          "link": "https://www.amazon.com/Womens-Activewear/b/ref=dp_bc_aui_C_4?ie=UTF8&node=3456051",
          "category_id": "3456051"
        },
        {
          "name": "Active Pants",
          "link": "https://www.amazon.com/Womens-Active-Pants/b/ref=dp_bc_aui_C_5?ie=UTF8&node=1046600",
          "category_id": "1046600"
        },
        {
          "name": "Sweatpants",
          "link": "https://www.amazon.com/Womens-Athletic-Sweatpants/b/ref=dp_bc_aui_C_6?ie=UTF8&node=1250423011",
          "category_id": "1250423011"
        }
      ],
      "description": "We listen to customer feedback and fine-tune every detail to ensure our clothes are more comfortable, higher quality, and longer lasting—at affordable prices for the whole family.",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": false,
        "third_party": true
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.3,
      "ratings_total": 28557,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/81uGCPgxW4L.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/81uGCPgxW4L._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81DojxcsuVL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/9133VIwcqyL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81lfGf0BqbL._AC_UL1500_.jpg",
          "variant": "PT13"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81VIREtR9tL._AC_UL1500_.jpg",
          "variant": "FL01"
        }
      ],
      "images_count": 5,
      "videos": [
        {
          "duration_seconds": 20,
          "width": 248,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/a88bd5ba-a4a8-4bad-aee1-a44beb136e18/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/61RRc-U-UAL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Amazon Essentials Women's French Terry Fleece Jogger Sweatpant (Available in Plus Size)"
        },
        {
          "duration_seconds": 21,
          "width": 248,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/b420dc57-1e6e-44d9-9f9c-4029f24cd7fa/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/614NGLmkAdL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Amazon Essentials Women's French Terry Fleece Jogger Sweatpant (Available in Plus Size)"
        }
      ],
      "videos_count": 2,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/a88bd5ba-a4a8-4bad-aee1-a44beb136e18/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/b420dc57-1e6e-44d9-9f9c-4029f24cd7fa/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "product_asin": "B09QK1Y1ZK",
          "title": "Amazon Essentials Women's French Terry Fleece Jogger Sweatpant (Available in Plus Size)",
          "vendor_code": "V3MSA",
          "vendor_name": "Merchant Video",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/a88bd5ba-a4a8-4bad-aee1-a44beb136e18/default.jobtemplate.hls.m3u8",
          "type": "videos_for_related_products"
        },
        {
          "product_asin": "B07BJ84QRW",
          "title": "Fit? Amazon Essentials French Terry Fleece Jogger Sweatpant ",
          "creator_type": "Influencer",
          "vendor_code": "stillblondeaaty:shop",
          "vendor_name": "Shelley Zurek / Still Blonde after all these Years",
          "vendor_tracking_id": "stillblonde2-20",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/5b1370fc-9001-4ad4-a957-fcbae20ad2db/default.jobtemplate.hls.m3u8",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/b237edfc-9391-48c4-8809-1b49352bbfbb.vtt",
          "type": "videos_for_related_products"
        },
        {
          "product_asin": "B07BJ8GJJ4",
          "title": "Our Point of View on Amazon Essentials Women's Fleece Jogger",
          "creator_type": "Influencer",
          "vendor_code": "influencer-20a38664:shop",
          "vendor_name": "What Tools Inside",
          "vendor_tracking_id": "whattoolsin07-20",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/47dec737-8a3c-4d9e-b8f4-943bc54d3841/default.jobtemplate.hls.m3u8",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/26ce11f3-511a-431a-bbd3-483cae381ae6.vtt",
          "type": "videos_for_related_products"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "is_prime": false,
        "is_amazon_fresh": false,
        "condition": {
          "is_new": true
        },
        "fulfillment": {
          "type": "1p",
          "is_sold_by_amazon": true,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": false
        },
        "price": {
          "symbol": "$",
          "value": 5.76,
          "currency": "USD",
          "raw": "$5.76"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Our Brands",
          "rank": 142,
          "link": "https://www.amazon.com/gp/bestsellers/private-brands/ref=pd_zg_ts_private-brands"
        },
        {
          "category": "Women's Clothing",
          "rank": 112,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1040660/ref=pd_zg_hrsr_fashion"
        }
      ],
      "manufacturer": "Amazon Essentials",
      "bestsellers_rank_flat": "Category: Our Brands | Rank: 142, Category: Women's Clothing | Rank: 112"
    }
  };

  let result = await detectMultipack(payload);
  expect(result).toBe(false);
});

it("detect-not-a-multi-pack", async () => {
//https://www.amazon.com/dp/B08DCPX8G5/ref=sspa_dk_detail_1?psc=1&pd_rd_i=B08DCPX8G5&pd_rd_w=L2giI&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=09HXAEKSWN8S2Y53FPHD&pd_rd_wg=CJf0G&pd_rd_r=14df816d-de2b-493b-ad36-7c28da46bf26&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExSDhaSEg4V1A2WUhRJmVuY3J5cHRlZElkPUEwMDk3MTA4N05KTjY3UVc3MkQzJmVuY3J5cHRlZEFkSWQ9QTA3NjA1NDMyV0ZZMFBPQzNVRzQ4JndpZGdldE5hbWU9c3BfZGV0YWlsX3RoZW1hdGljJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 635,
      "overage_used": 135,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-09-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/dp/B08DCPX8G5/ref=sspa_dk_detail_1?psc=1&pd_rd_i=B08DCPX8G5&pd_rd_w=L2giI&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=09HXAEKSWN8S2Y53FPHD&pd_rd_wg=CJf0G&pd_rd_r=14df816d-de2b-493b-ad36-7c28da46bf26&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExSDhaSEg4V1A2WUhRJmVuY3J5cHRlZElkPUEwMDk3MTA4N05KTjY3UVc3MkQzJmVuY3J5cHRlZEFkSWQ9QTA3NjA1NDMyV0ZZMFBPQzNVRzQ4JndpZGdldE5hbWU9c3BfZGV0YWlsX3RoZW1hdGljJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "Hooever Women's Warm Shrepa Lined Drawstring Sweatpants Athletic Jogger Fleece Pants Green Large",
      "title_excluding_variant_name": "Hooever Women's Warm Shrepa Lined Drawstring Sweatpants Athletic Jogger Fleece Pants",
      "keywords": "Hooever,Women's,Warm,Shrepa,Lined,Drawstring,Sweatpants,Athletic,Jogger,Fleece,Pants",
      "keywords_list": [
        "Hooever",
        "Women's",
        "Warm",
        "Shrepa",
        "Lined",
        "Drawstring",
        "Sweatpants",
        "Athletic",
        "Jogger",
        "Fleece",
        "Pants"
      ],
      "asin": "B08DCPX8G5",
      "link": "https://www.amazon.com/dp/B08DCPX8G5??th=1&psc=1",
      "brand": "Hooever",
      "has_size_guide": true,
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
          "name": "Active",
          "link": "https://www.amazon.com/Womens-Activewear/b/ref=dp_bc_aui_C_4?ie=UTF8&node=3456051",
          "category_id": "3456051"
        },
        {
          "name": "Active Pants",
          "link": "https://www.amazon.com/Womens-Active-Pants/b/ref=dp_bc_aui_C_5?ie=UTF8&node=1046600",
          "category_id": "1046600"
        },
        {
          "name": "Sweatpants",
          "link": "https://www.amazon.com/Womens-Athletic-Sweatpants/b/ref=dp_bc_aui_C_6?ie=UTF8&node=1250423011",
          "category_id": "1250423011"
        }
      ],
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "title": "Hooever Womens Casual Warm Fleece Lined Drawstring Sweatpants Athleisure Sherpa Jogger Trouser Windproof Thick Thermal Sweatpants",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/367eab91-2275-4c0b-ae26-048766f416d5.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
          "description": "Stylish classy gorgeous classic basic boyfriend fit simple thick medium-weight long furry fleece lined windbreaker pants running active trousers for fall winter daily wear club vocation date party or work office Feminine flattering fashion relaxed fit leisure long solid color full length soft and comfy chic windproof thermal sherpa shearling fleece outerwears drawstring sweatpants trousers",
          "brand_store": {
            "link": "/stores/page/4BA480EB-7D1A-4554-97B3-D9D54613E6C1",
            "id": "4BA480EB-7D1A-4554-97B3-D9D54613E6C1"
          },
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/367eab91-2275-4c0b-ae26-048766f416d5.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/09328299-1090-44e2-909b-86ffe2dc0c61.__CR0,23,463,579_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/2066cbe6-1516-4504-8e05-f44b108cf8a0.__CR0,23,463,579_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/cff1ede5-f782-44aa-b1d1-e3e7a38acb93.__CR0,23,463,579_PT0_SX362_V1___.jpg"
          ],
          "products": [
            {
              "title": "Hooever Women's Sherpa Lined Sweatshirt Winter Warm Fleece Crewneck Pullover Tops",
              "asin": "B098L47X8S",
              "link": "/dp/B098L47X8S/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31u8Ma%2BXtqS.__AC_SR166,182___.jpg"
            },
            {
              "title": "Hooever Women's Sherpa Lined Sweatshirt Winter Warm Fleece Crewneck Pullover Tops",
              "asin": "B098L5J3GG",
              "link": "/dp/B098L5J3GG/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/318wGWGw0pL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Hooever Women's Winter Thick Sherpa Fleece Lined Drawstring Sweatpants Jogger Pants",
              "asin": "B08GHNN83C",
              "link": "/dp/B08GHNN83C/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31tPcGrVBSL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Hooever Women's Warm Shrepa Lined Drawstring Sweatpants Athletic Jogger Fleece Pants",
              "asin": "B0982P77X4",
              "link": "/dp/B0982P77X4/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31DhBbgGRYS.__AC_SR166,182___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/158bebbe-80ce-4cdc-8126-fcf10d030d4e.__CR0,0,1200,360_PT0_SX600_V1___.jpg"
      },
      "sub_title": {
        "text": "Visit the Hooever Store",
        "link": "https://www.amazon.com/stores/Hooever/page/4BA480EB-7D1A-4554-97B3-D9D54613E6C1?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "has_coupon": true,
      "coupon_text": "Save an extra $5 when you apply this coupon",
      "rating": 4.5,
      "ratings_total": 160,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/617rk-KyvPL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/617rk-KyvPL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/614EqUd8nlL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61GUrR9fN8L._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61VRbThfy2L._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61XwPHIe9lL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71lgokmvcEL._AC_UL1500_.jpg",
          "variant": "PT05"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71b0OzjlCML._AC_UL1500_.jpg",
          "variant": "PT06"
        }
      ],
      "images_count": 7,
      "videos": [
        {
          "duration_seconds": 24,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/26556988-009f-4a7a-8526-f9eb856976ba/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/517-RwuF+4L.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Fleece lined sweatpants"
        }
      ],
      "videos_count": 1,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/26556988-009f-4a7a-8526-f9eb856976ba/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "product_asin": "B08DCPX8G5",
          "title": "Fleece lined sweatpants",
          "vendor_code": "Z7AX4",
          "vendor_name": "Hooever",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/26556988-009f-4a7a-8526-f9eb856976ba/default.jobtemplate.hls.m3u8",
          "type": "videos_for_related_products"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 29,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Wednesday, September 14",
            "name": "FREE"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Hooever",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A35F8SADEJS75D&asin=B08DCPX8G5&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A35F8SADEJS75D"
          }
        },
        "price": {
          "symbol": "$",
          "value": 32.99,
          "currency": "USD",
          "raw": "$32.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 305560,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Sweatpants",
          "rank": 517,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1250423011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "dimensions": "0.5 x 0.5 x 0.5 inches; 8 Ounces",
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 305560, Category: Women's Sweatpants | Rank: 517"
    },
    "brand_store": {
      "id": "4BA480EB-7D1A-4554-97B3-D9D54613E6C1",
      "link": "https://www.amazon.com/stores/Hooever/page/4BA480EB-7D1A-4554-97B3-D9D54613E6C1"
    }
  };

  let result = await detectMultipack(payload);
  expect(result).toBe(false);
});

it("detect-not-a-multi-pack", async () => {
//https://www.amazon.com/dp/B08DCPX8G5/ref=sspa_dk_detail_1?psc=1&pd_rd_i=B08DCPX8G5&pd_rd_w=L2giI&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=09HXAEKSWN8S2Y53FPHD&pd_rd_wg=CJf0G&pd_rd_r=14df816d-de2b-493b-ad36-7c28da46bf26&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExSDhaSEg4V1A2WUhRJmVuY3J5cHRlZElkPUEwMDk3MTA4N05KTjY3UVc3MkQzJmVuY3J5cHRlZEFkSWQ9QTA3NjA1NDMyV0ZZMFBPQzNVRzQ4JndpZGdldE5hbWU9c3BfZGV0YWlsX3RoZW1hdGljJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 649,
      "overage_used": 149,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-09-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.in/Leotude-Cotton-T-shirt-Black-Small/dp/B07H7R94SQ?ref=dlx_19680_sh_dcl_img_2_69600caa_dt_mese2_f5",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "LEOTUDE Men's Regular Fit Cotton Blend Full Sleeve T-Shirt",
      "keywords": "LEOTUDE,Men's,Regular,Fit,Cotton,Blend,Full,Sleeve,T-Shirt",
      "keywords_list": [
        "LEOTUDE",
        "Men's",
        "Regular",
        "Cotton",
        "Blend",
        "Full",
        "Sleeve",
        "T-Shirt"
      ],
      "asin": "B07H7R94SQ",
      "link": "https://www.amazon.in/Leotude-Cotton-Reglan-Sleeve-Tshirts/dp/B07H7S5H1B",
      "brand": "LEOTUDE",
      "sell_on_amazon": true,
      "has_size_guide": true,
      "categories": [
        {
          "name": "Clothing & Accessories",
          "link": "https://www.amazon.in/Clothing-accesories/b/ref=dp_bc_aui_C_1?ie=UTF8&node=1571271031",
          "category_id": "1571271031"
        },
        {
          "name": "Men",
          "link": "https://www.amazon.in/Mens-Clothing/b/ref=dp_bc_aui_C_2?ie=UTF8&node=1968024031",
          "category_id": "1968024031"
        },
        {
          "name": "T-Shirts & Polos",
          "link": "https://www.amazon.in/Mens-Tshirts-Polos/b/ref=dp_bc_aui_C_3?ie=UTF8&node=1968120031",
          "category_id": "1968120031"
        },
        {
          "name": "T-Shirts",
          "link": "https://www.amazon.in/T-Shirts/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1968123031",
          "category_id": "1968123031"
        }
      ],
      "description": "Leotude, A Style For Every Story, introducing the colorful trendy texture of fashion for all generations in extreme fashionable wardrobe collection",
      "promotions_feature": "Size: S | Colour: Black Promotions can vary depending on size/colour. \n   No cost EMI available on select cards. Please check 'EMI options' above for more details. Here's how \n   Get GST invoice and save up to 28% on business purchases. Sign up for free Here's how",
      "sub_title": {
        "text": "Visit the LEOTUDE Store",
        "link": "https://www.amazon.in/stores/Leotude/page/E8405860-F90D-414C-9CE9-77BA1F1E0173?ref_=ast_bln"
      },
      "marketplace_id": "A21TJRUUN4KGV",
      "rating": 3.6,
      "ratings_total": 1016,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/71grm9rbdOL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/71grm9rbdOL._UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71Fgb-+hfpL._UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81GR9Gn2pWL._UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71+2Oh9eHOL._UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71SqQoR0mWL._UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/41jGtqc+-FL.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "is_bundle": false,
      "buybox_winner": {
        "is_prime": false,
        "is_amazon_fresh": false,
        "condition": {
          "is_new": true
        },
        "fulfillment": {
          "type": "1p",
          "is_sold_by_amazon": true,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": false
        },
        "price": {
          "symbol": "₹",
          "value": 199,
          "currency": "INR",
          "raw": "₹199.00"
        },
        "vat": {
          "raw": "Inclusive of all taxes"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing & Accessories",
          "rank": 3964,
          "link": "https://www.amazon.in/gp/bestsellers/apparel/ref=pd_zg_ts_apparel"
        },
        {
          "category": "Men's T-Shirts",
          "rank": 233,
          "link": "https://www.amazon.in/gp/bestsellers/apparel/1968123031/ref=pd_zg_hrsr_apparel"
        }
      ],
      "manufacturer": "Leotude",
      "weight": "250 g",
      "dimensions": "27 x 25 x 2 cm; 250 Grams",
      "bestsellers_rank_flat": "Category: Clothing & Accessories | Rank: 3964, Category: Men's T-Shirts | Rank: 233"
    },
    "brand_store": {
      "id": "E8405860-F90D-414C-9CE9-77BA1F1E0173",
      "link": "https://www.amazon.in/stores/Leotude/page/E8405860-F90D-414C-9CE9-77BA1F1E0173"
    }
  };

  let result = await detectMultipack(payload);
  expect(result).toBe(false);
});

it("detect-not-a-multi-pack", async () => {
//https://www.amazon.in/RAJMANDIR-FABRICS-Anarkali-PK1018017-M-Grey-Pink/dp/B094NRPMCG?ref_=Oct_DLandingS_D_5bed8f26_61&smid=AN2O6ZZVE32I8

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 652,
      "overage_used": 152,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-09-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.in/RAJMANDIR-FABRICS-Anarkali-PK1018017-M-Grey-Pink/dp/B094NRPMCG?ref_=Oct_DLandingS_D_5bed8f26_61&smid=AN2O6ZZVE32I8",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "RAJMANDIRFABRICS Women's Cotton Anarkali Suit",
      "keywords": "RAJMANDIRFABRICS,Women's,Cotton,Anarkali,Suit",
      "keywords_list": [
        "RAJMANDIRFABRICS",
        "Women's",
        "Cotton",
        "Anarkali",
        "Suit"
      ],
      "asin": "B094NSQLJ6",
      "link": "https://www.amazon.in/RAJMANDIR-FABRICS-Womens-Anarkali-Dupatta/dp/B095M3817N",
      "brand": "RAJMANDIRFABRICS",
      "sell_on_amazon": true,
      "has_size_guide": true,
      "categories": [
        {
          "name": "Clothing & Accessories",
          "link": "https://www.amazon.in/Clothing-accesories/b/ref=dp_bc_aui_C_1?ie=UTF8&node=1571271031",
          "category_id": "1571271031"
        },
        {
          "name": "Women",
          "link": "https://www.amazon.in/Womens-clothing/b/ref=dp_bc_aui_C_2?ie=UTF8&node=1953602031",
          "category_id": "1953602031"
        },
        {
          "name": "Ethnic Wear",
          "link": "https://www.amazon.in/womens-ethnic-wear/b/ref=dp_bc_aui_C_3?ie=UTF8&node=1968253031",
          "category_id": "1968253031"
        },
        {
          "name": "Salwar Suits",
          "link": "https://www.amazon.in/womens-salwar-suit-sets/b/ref=dp_bc_aui_C_4?ie=UTF8&node=3723380031",
          "category_id": "3723380031"
        }
      ],
      "promotions_feature": "Size name: M Promotions can vary depending on size name. \n   No cost EMI available on select cards. Please check 'EMI options' above for more details. Here's how \n   Get GST invoice and save up to 28% on business purchases. Sign up for free Here's how",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/9c6f22b1-0c50-40e1-8b69-00f152d5f2db.__CR0,0,970,300_PT0_SX970_V1___.jpg",
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/9c6f22b1-0c50-40e1-8b69-00f152d5f2db.__CR0,0,970,300_PT0_SX970_V1___.jpg"
          ]
        },
        "third_party": true
      },
      "sub_title": {
        "text": "Visit the RAJMANDIRFABRICS Store",
        "link": "https://www.amazon.in/stores/RAJMANDIRFABRICS/page/59E5626F-B129-441C-A360-4FB55EAFE26D?ref_=ast_bln"
      },
      "marketplace_id": "A21TJRUUN4KGV",
      "rating": 4.1,
      "ratings_total": 1672,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/81iPUQrBnSL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/81iPUQrBnSL._UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81609jqdGGS._UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81bAyVBrKYS._UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/813cQtqYEvS._UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/91pRmmxrMrS._UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/91pRmmxrMrS._UL1500_.jpg",
          "variant": "PT05"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51ZN1qp+vCL.jpg",
          "variant": "PT06"
        }
      ],
      "images_count": 7,
      "videos": [
        {
          "duration_seconds": 37,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-eu-west-1-prod/b33371e6-4064-45ea-a7dc-410324a33cd7/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/51polBbywOL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "RAJMANDIR FABRICS Cotton Anarkali Kurta Pant  Dupatta Set"
        }
      ],
      "videos_count": 1,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-eu-west-1-prod/b33371e6-4064-45ea-a7dc-410324a33cd7/default.jobtemplate.mp4.480.mp4",
      "is_bundle": false,
      "buybox_winner": {
        "is_prime": false,
        "is_amazon_fresh": false,
        "condition": {
          "is_new": true
        },
        "fulfillment": {
          "type": "1p",
          "is_sold_by_amazon": true,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": false
        },
        "price": {
          "symbol": "₹",
          "value": 1699,
          "currency": "INR",
          "raw": "₹1,699.00"
        },
        "vat": {
          "raw": "Inclusive of all taxes"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing & Accessories",
          "rank": 1253,
          "link": "https://www.amazon.in/gp/bestsellers/apparel/ref=pd_zg_ts_apparel"
        },
        {
          "category": "Women's Salwar Suits",
          "rank": 9,
          "link": "https://www.amazon.in/gp/bestsellers/apparel/3723380031/ref=pd_zg_hrsr_apparel"
        }
      ],
      "manufacturer": "RAJMANDIR FABRICS, RAJMANDIR FABRICS, 725 Prem Nagar Haziawala,Sanganer,Jaipur-302029",
      "weight": "450 g",
      "dimensions": "38 x 28 x 2.8 cm; 450 Grams",
      "bestsellers_rank_flat": "Category: Clothing & Accessories | Rank: 1253, Category: Women's Salwar Suits | Rank: 9"
    },
    "brand_store": {
      "id": "59E5626F-B129-441C-A360-4FB55EAFE26D",
      "link": "https://www.amazon.in/stores/RAJMANDIRFABRICS/page/59E5626F-B129-441C-A360-4FB55EAFE26D"
    }
  };

  let result = await detectMultipack(payload);
  expect(result).toBe(false);
});

it("detect-not-a-multi-pack", async () => {
//https://www.amazon.in/STUDIO-Shringaar-Womens-Circle-Lehenga/dp/B07ZZ8WC26?ref=dlx_19536_sh_dcl_img_2_ec8ef038_dt_mese2_75

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 653,
      "overage_used": 153,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-09-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.in/STUDIO-Shringaar-Womens-Circle-Lehenga/dp/B07ZZ8WC26?ref=dlx_19536_sh_dcl_img_2_ec8ef038_dt_mese2_75",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "Studio Shringaar Women's Plus Size Full Flare Double Ghera Skirt Lehenga.",
      "keywords": "Studio,Shringaar,Women's,Plus,Size,Full,Flare,Double,Ghera,Skirt,Lehenga.",
      "keywords_list": [
        "Studio",
        "Shringaar",
        "Women's",
        "Plus",
        "Size",
        "Full",
        "Flare",
        "Double",
        "Ghera",
        "Skirt",
        "Lehenga."
      ],
      "asin": "B07ZZ83X4B",
      "link": "https://www.amazon.in/STUDIO-Shringaar-Womens-Circle-Lehenga/dp/B08184C9N5",
      "brand": "Studio Shringaar",
      "sell_on_amazon": true,
      "has_size_guide": true,
      "categories": [
        {
          "name": "Clothing & Accessories",
          "link": "https://www.amazon.in/Clothing-accesories/b/ref=dp_bc_aui_C_1?ie=UTF8&node=1571271031",
          "category_id": "1571271031"
        },
        {
          "name": "Women",
          "link": "https://www.amazon.in/Womens-clothing/b/ref=dp_bc_aui_C_2?ie=UTF8&node=1953602031",
          "category_id": "1953602031"
        },
        {
          "name": "Western Wear",
          "link": "https://www.amazon.in/womens-western-wear/b/ref=dp_bc_aui_C_3?ie=UTF8&node=11400137031",
          "category_id": "11400137031"
        },
        {
          "name": "Skirts & Shorts",
          "link": "https://www.amazon.in/b/ref=dp_bc_aui_C_4?ie=UTF8&node=15330094031",
          "category_id": "15330094031"
        },
        {
          "name": "Skirts",
          "link": "https://www.amazon.in/Women-Skirts/b/ref=dp_bc_aui_C_5?ie=UTF8&node=1968511031",
          "category_id": "1968511031"
        }
      ],
      "promotions_feature": "Size: Free Size | Colour: Green Promotions can vary depending on size/colour. \n   Buy any 2 products, get 5% off. Buy 3 or more, get 7% off. Offered by SHRINGAAR Here's how \n   No cost EMI available on select cards. Please check 'EMI options' above for more details. Here's how \n   Get GST invoice and save up to 28% on business purchases. Sign up for free Here's how",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "title": "Colours...colours ...colours ...and more colours A huge selection of colours Always a classic",
          "description": "We made these lehengas so that you could live your dream with it. Our clients asked us to make more and more colours so that they could team it up with a wide range of tops which already existed in their wadrobes. So we selected the most wanted colours which match every theme , every whim and every fancy of the wearer. From a Vibrant Red to a Hot Pink....from a Pista to a Peach....from a sunshine Yellow to a Midnight Blue......from a Black to a White and lots more. Choose your colour and live it up You will love the feel of it after you wear it, Very festive lehenga / skirt This maroon lehenga was worn by one of our customer . Only the skirt is ours."
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/34b8cdd6-2dd0-4899-9252-6c6c756e6424.__CR0,52,1187,356_PT0_SX600_V1___.png"
      },
      "sub_title": {
        "text": "Visit the Studio Shringaar Store",
        "link": "https://www.amazon.in/stores/STUDIOShringaar/page/A43F035C-DC33-46E7-82AA-98ECB4C83BF0?ref_=ast_bln"
      },
      "marketplace_id": "A21TJRUUN4KGV",
      "rating": 4.2,
      "ratings_total": 1599,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/71CZs9hs2LL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/71CZs9hs2LL._UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71viNokAZjL._UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/716tlvwB8VL._UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71-YHrD2U7L._UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61r6eHpVSNL._UL1500_.jpg",
          "variant": "PT04"
        }
      ],
      "images_count": 5,
      "is_bundle": false,
      "buybox_winner": {
        "is_prime": false,
        "is_amazon_fresh": false,
        "condition": {
          "is_new": true
        },
        "fulfillment": {
          "type": "1p",
          "is_sold_by_amazon": true,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": false
        },
        "price": {
          "symbol": "₹",
          "value": 948,
          "currency": "INR",
          "raw": "₹948.00"
        },
        "vat": {
          "raw": "Inclusive of all taxes"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing & Accessories",
          "rank": 2563,
          "link": "https://www.amazon.in/gp/bestsellers/apparel/ref=pd_zg_ts_apparel"
        },
        {
          "category": "Women's Skirts & Shorts",
          "rank": 39,
          "link": "https://www.amazon.in/gp/bestsellers/apparel/15330094031/ref=pd_zg_hrsr_apparel"
        }
      ],
      "manufacturer": "SHRINGAAR INTERNATIONAL (INDIA)",
      "weight": "570 g",
      "dimensions": "20 x 20 x 3 cm; 570 Grams",
      "bestsellers_rank_flat": "Category: Clothing & Accessories | Rank: 2563, Category: Women's Skirts & Shorts | Rank: 39"
    },
    "brand_store": {
      "id": "A43F035C-DC33-46E7-82AA-98ECB4C83BF0",
      "link": "https://www.amazon.in/stores/STUDIOShringaar/page/A43F035C-DC33-46E7-82AA-98ECB4C83BF0"
    }
  };

  let result = await detectMultipack(payload);
  expect(result).toBe(false);
});

//Below The Knee

it("below-the-knee-example-1-working", async () => {
  //https://www.amazon.com/dp/B0B3QSFWLG/ref=sspa_dk_detail_0?psc=1&pd_rd_i=B0B3QSFWLG&pd_rd_w=aIjxu&content-id=amzn1.sym.37ad3f81-aeff-4fe7-accb-8665976bb5fc&pf_rd_p=37ad3f81-aeff-4fe7-accb-8665976bb5fc&pf_rd_r=FD7E21CJ3H8AZ7JVT9F0&pd_rd_wg=Imhnf&pd_rd_r=2b85e2f4-879e-40d3-b00c-ed2b9f361c2c&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzVEhJMjI3S1c0SVpFJmVuY3J5cHRlZElkPUEwMzEzMDMwMlpVUVVURVY0SjZWRCZlbmNyeXB0ZWRBZElkPUEwNzIxOTU2MThBWUhNN0lQMFFaNSZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 476,
      "credits_used_this_request": 1,
      "credits_remaining": 24,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/dp/B0B3QSFWLG/ref=sspa_dk_detail_0?psc=1&pd_rd_i=B0B3QSFWLG&pd_rd_w=aIjxu&content-id=amzn1.sym.37ad3f81-aeff-4fe7-accb-8665976bb5fc&pf_rd_p=37ad3f81-aeff-4fe7-accb-8665976bb5fc&pf_rd_r=FD7E21CJ3H8AZ7JVT9F0&pd_rd_wg=Imhnf&pd_rd_r=2b85e2f4-879e-40d3-b00c-ed2b9f361c2c&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzVEhJMjI3S1c0SVpFJmVuY3J5cHRlZElkPUEwMzEzMDMwMlpVUVVURVY0SjZWRCZlbmNyeXB0ZWRBZElkPUEwNzIxOTU2MThBWUhNN0lQMFFaNSZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU="
    },
    "product": {
      "title": "ETOSELL Women's Dresses V-Neck Mini Dress Long Lantern Sleeve Swing Dress Swiss Dot Shift Dress Casual Beach Dresses Navy Blue Large",
      "title_excluding_variant_name": "ETOSELL Women's Dresses V-Neck Mini Dress Long Lantern Sleeve Swing Dress Swiss Dot Shift Dress Casual Beach Dresses",
      "keywords": "ETOSELL,Women's,Dresses,V-Neck,Mini,Dress,Long,Lantern,Sleeve,Swing,Dress,Swiss,Dot,Shift,Dress,Casual,Beach,Dresses",
      "keywords_list": [
        "ETOSELL",
        "Women's",
        "Dresses",
        "V-Neck",
        "Mini",
        "Dress",
        "Long",
        "Lantern",
        "Sleeve",
        "Swing",
        "Dress",
        "Swiss",
        "Shift",
        "Dress",
        "Casual",
        "Beach",
        "Dresses"
      ],
      "asin": "B0B3QSFWLG",
      "link": "https://www.amazon.com/dp/B0B3QSFWLG??th=1&psc=1",
      "brand": "Etosell",
      "has_size_guide": true,
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
          "name": "Dresses",
          "link": "https://www.amazon.com/Dresses/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045024",
          "category_id": "1045024"
        },
        {
          "name": "Casual",
          "link": "https://www.amazon.com/Casual-Dresses/b/ref=dp_bc_aui_C_5?ie=UTF8&node=2346727011",
          "category_id": "2346727011"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Dresses > Casual",
      "promotions_feature": "10% coupon applied at checkout Terms Clip this coupon to save 10% on this product when you buy from Etosell. Here's how (restrictions apply) \n   Save 7% each on Tunic Dresses for Women offered by Etosell when you purchase 2 or more. Enter code 65UESVQX at checkout. See more products in this promotion \n   Save 8% each on Fall Dresses for Women offered by Etosell when you purchase 3 or more. Enter code 3XHU22IH at checkout. See more products in this promotion \n   Save 9% each on Swimwear Cover Ups for Women offered by Etosell when you purchase 4 or more. Enter code B56TE57E at checkout. See more products in this promotion \n   Save 10% each on Casual Dresses for Women offered by Etosell when you purchase 5 or more. Enter code 3RMCVXK7 at checkout. See more products in this promotion \n   Save 10% on Silk Nightgowns for Women when you purchase 1 or more Casual Loose Dress for Women offered by Etosell. Enter code 5IBF5ICA at checkout. Here's how (restrictions apply) \n   Save 10% on Victorian Nightgowns for Women when you purchase 1 or more Tunic Dress for Women offered by Etosell. Enter code JOVCSVTC at checkout. Here's how (restrictions apply) \n   Save 20% on this item when you purchase 1 or more Long Sleepwear for Women offered by Etosell. Enter code OTAU359M at checkout. Here's how (restrictions apply) \n   Save 20% on this item when you purchase 1 or more Sleeveless Babydoll Dress for Women offered by Etosell. Enter code BYRDH4YG at checkout. Here's how (restrictions apply) \n   Save 20% on this item when you purchase 1 or more Fall Dresses for Women offered by Etosell. Enter code JAP9WYCG at checkout. Here's how (restrictions apply) \n   Save 10% on Swimwear Cover Ups for Women when you purchase 1 or more Fall Dresses for Women offered by Etosell. Enter code 9NRTT2PM at checkout. Here's how (restrictions apply)",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "brand_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/9038db55-ffef-439b-844a-0fbb8c9345d6.__CR35,23,333,153_PT0_SX315_V1___.jpg",
          "title": "ETOSELL Women's Dresses V-Neck Mini Dress Long Lantern Sleeve Swing Dress Swiss Dot Shift Dress Casual Beach Dresses ETOSELL Women Fall Tunic Dress V Neck Casual Loose Flowy Swing Shift Dresses Swimwear Cover Upsfor Ladies ETOSELL Women's Fall Lantern Long Sleeve V Neck Swiss Dot Flowy A Line Smocked Babydoll Short Dress ETOSELL Women's Casual Long Sleeve Swiss Dot V Neck Ruffle A Line Babydoll Mini Dress ETOSELL Women's Dress Long Sleeve V Neck Swiss Dot Mini Dress Ruffle Flowy Loose Fit Casual Tunic Dresses ETOSELL Women‘s Dresses Long Sleeves Short Mini Dress V Neck Flowy Casual Swiss Dot Loose Fit Babydoll Dress",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/da18f183-56db-4876-abb0-9e5768522de0.__CR0,30,1500,640_PT0_SX1464_V1___.jpg",
          "description": "Founded in 2011, ETOSELL is a brand dedicated to providing customers with fashionable design and comfortable wearing experience.",
          "brand_store": {
            "link": "/stores/page/4B1C8577-BA8C-4A6F-B62C-2954747288A5",
            "id": "4B1C8577-BA8C-4A6F-B62C-2954747288A5"
          },
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/da18f183-56db-4876-abb0-9e5768522de0.__CR0,30,1500,640_PT0_SX1464_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/b0ddba80-c345-4c7f-8bfb-b6f9bf6b6085.__CR40,0,719,900_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/97c26a73-3774-44be-86d1-8ff9f14178c8.__CR40,0,719,900_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/969190e7-728f-4ba0-aa84-dc6a170ca2ef.__CR40,0,719,900_PT0_SX362_V1___.jpg"
          ],
          "products": [
            {
              "title": "ETOSELL Women's Dresses V-Neck Mini Dress Long Lantern Sleeve Swing Dress Swiss Dot Shift Dress C...",
              "asin": "B0B3RHMKNY",
              "link": "/dp/B0B3RHMKNY/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/311MJMIrRlL.__AC_SR166,182___.jpg"
            },
            {
              "title": "ETOSELL Women's Dresses V-Neck Mini Dress Long Lantern Sleeve Swing Dress Swiss Dot Shift Dress C...",
              "asin": "B0B3QXH7J3",
              "link": "/dp/B0B3QXH7J3/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31T0BEUoDAL.__AC_SR166,182___.jpg"
            },
            {
              "title": "ETOSELL Women's Dresses V-Neck Mini Dress Long Lantern Sleeve Swing Dress Swiss Dot Shift Dress C...",
              "asin": "B0B3QGFCBG",
              "link": "/dp/B0B3QGFCBG/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31Z9T978tzL.__AC_SR166,182___.jpg"
            },
            {
              "title": "ETOSELL Women's Dresses V-Neck Mini Dress Long Lantern Sleeve Swing Dress Swiss Dot Shift Dress C...",
              "asin": "B0B3QVZ3XP",
              "link": "/dp/B0B3QVZ3XP/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31Z9T978tzL.__AC_SR166,182___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/9038db55-ffef-439b-844a-0fbb8c9345d6.__CR35,23,333,153_PT0_SX315_V1___.jpg",
        "company_description_text": "Founded in 2011, ETOSELL is a brand dedicated to providing customers with fashionable design and comfortable wearing experience.  Positioned in the style of fashion, feminine, classic, modern and simple to pursue that share of comfortable and happiness in life.  As a user-oriented brand, we have researched and tested various kinds of fabric and produced a variety of soft, breathable, and comfortable clothing.  Enjoy life and yourself!"
      },
      "sub_title": {
        "text": "Visit the Etosell Store",
        "link": "https://www.amazon.com/stores/ETOSELL/page/4B1C8577-BA8C-4A6F-B62C-2954747288A5?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "has_coupon": true,
      "coupon_text": "Save an extra 10% when you apply this coupon",
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/618xV2BmOCL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/618xV2BmOCL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/515In-6-lqL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51PqNkQUzDL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51cFT+y12sL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51BsPBxyYyL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/613b1QadRQL._AC_UL1500_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "videos": [
        {
          "duration_seconds": 40,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/3ab6edeb-d328-48bb-bd44-8bfe1f64458b/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/51rY16UkmyL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "ETOSELL Women Dress Casual Fall Long Sleeve Swiss Dot Swing Mini Dress"
        },
        {
          "duration_seconds": 30,
          "width": 418,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/819ec5c2-a5bd-49e7-a561-a1dfb07ff729/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/51hV9GYbC-L.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "ETOSELL Women's Dresses Sweet & Cute Mini Dress Swiss Dot"
        }
      ],
      "videos_count": 2,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/3ab6edeb-d328-48bb-bd44-8bfe1f64458b/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/819ec5c2-a5bd-49e7-a561-a1dfb07ff729/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.0a984908bc504dc6906c74d98f88f112",
          "product_asin": "B0B3QSFWLG",
          "parent_asin": "B0B3MS2VB4",
          "sponsor_products": "true",
          "title": "ETOSELL Women Dress Casual Fall Long Sleeve Swiss Dot Swing Mini Dress",
          "public_name": "Etosell",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Etosell",
          "video_image_id": "51rY16UkmyL",
          "video_image_url": "https://m.media-amazon.com/images/I/51rY16UkmyL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51rY16UkmyL.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/3ab6edeb-d328-48bb-bd44-8bfe1f64458b/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/3f4584d1-4a4b-4496-adbf-69b1af90c6e1/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:40",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.054d9b2cb8b34ef585831ab6d2ae9f84",
          "product_asin": "B0B3QSFWLG",
          "parent_asin": "B0B3MS2VB4",
          "sponsor_products": "true",
          "title": "ETOSELL Women's Dresses Sweet & Cute Mini Dress Swiss Dot",
          "public_name": "Etosell",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Etosell",
          "video_image_id": "51hV9GYbC-L",
          "video_image_url": "https://m.media-amazon.com/images/I/51hV9GYbC-L._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51hV9GYbC-L.jpg",
          "video_image_width": "640",
          "video_image_height": "734",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/819ec5c2-a5bd-49e7-a561-a1dfb07ff729/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/bd50d299-3246-452f-acb7-75a4c26ed05c/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:30",
          "type": "videos_for_this_product"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 19,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Monday, October 3",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Wednesday, September 28",
            "name": "Or fastest delivery Wednesday, September 28. Order within 15 hrs 51 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Etosell",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A35XH4BLSQO1JR&asin=B0B3QSFWLG&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A35XH4BLSQO1JR"
          }
        },
        "price": {
          "symbol": "$",
          "value": 26.99,
          "currency": "USD",
          "raw": "$26.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 1167036,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Casual Dresses",
          "rank": 8344,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/2346727011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 1167036, Category: Women's Casual Dresses | Rank: 8344"
    }
  };

  let result = await isModleBelowTheKnee(payload, filterKeywordsList);
  expect(result).toBe(false);
});

it("below-the-knee-example-2-working", async () => {
//https://www.amazon.com/Womens-Sleeve-Summer-Casual-Dresses/dp/B078WLYP5Z/ref=d_pd_sbs_sccl_1_2/137-3450145-9885347?pd_rd_w=CnEke&content-id=amzn1.sym.3676f086-9496-4fd7-8490-77cf7f43f846&pf_rd_p=3676f086-9496-4fd7-8490-77cf7f43f846&pf_rd_r=V0JGAHVEVY15ZM4SEDSS&pd_rd_wg=nRm6l&pd_rd_r=e562b855-6628-4fb7-ba8d-2f5b34c121ea&pd_rd_i=B078WLYP5Z&psc=1

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 555,
      "overage_used": 55,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/Womens-Sleeve-Summer-Casual-Dresses/dp/B078WLYP5Z/ref=d_pd_sbs_sccl_1_2/137-3450145-9885347?pd_rd_w=CnEke&content-id=amzn1.sym.3676f086-9496-4fd7-8490-77cf7f43f846&pf_rd_p=3676f086-9496-4fd7-8490-77cf7f43f846&pf_rd_r=V0JGAHVEVY15ZM4SEDSS&pd_rd_wg=nRm6l&pd_rd_r=e562b855-6628-4fb7-ba8d-2f5b34c121ea&pd_rd_i=B078WLYP5Z&psc=1"
    },
    "product": {
      "title": "DEARCASE Women Short Sleeve Loose Plain Maxi Dresses Casual Long Dresses with Pockets Medium 1-dark Green",
      "title_excluding_variant_name": "DEARCASE Women Short Sleeve Loose Plain Maxi Dresses Casual Long Dresses with Pockets",
      "keywords": "DEARCASE,Women,Short,Sleeve,Loose,Plain,Maxi,Dresses,Casual,Long,Dresses,with,Pockets",
      "keywords_list": [
        "DEARCASE",
        "Women",
        "Short",
        "Sleeve",
        "Loose",
        "Plain",
        "Maxi",
        "Dresses",
        "Casual",
        "Long",
        "Dresses",
        "with",
        "Pockets"
      ],
      "asin": "B078WLYP5Z",
      "link": "https://www.amazon.com/dp/B078WLYP5Z??th=1&psc=1",
      "brand": "DEARCASE",
      "has_size_guide": true,
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
          "name": "Dresses",
          "link": "https://www.amazon.com/Dresses/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045024",
          "category_id": "1045024"
        },
        {
          "name": "Casual",
          "link": "https://www.amazon.com/Casual-Dresses/b/ref=dp_bc_aui_C_5?ie=UTF8&node=2346727011",
          "category_id": "2346727011"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Dresses > Casual",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "title": "DEARCASE Women Casual Summer Short Sleeve Loose Maxi Dresses Long Dresses With Pockets DEARCASE Women Short Sleeve Loose Plain Maxi Dresses Casual Long Dresses with Pockets Customer Show Product Details",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/83eb35e8-acde-4d68-bae8-6636260f9a62.__CR0,0,2928,1250_PT0_SX1464_V1___.jpg",
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/83eb35e8-acde-4d68-bae8-6636260f9a62.__CR0,0,2928,1250_PT0_SX1464_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/89983754-8d39-4994-b45f-57fa05c922ee.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/528cbfae-11d3-4d77-975a-9159905fdc99.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/16047285-cbff-40cb-b276-db455ad4381d.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/29613320-6d94-44cb-80f1-1eab94abf8b6.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/18ece852-0ba3-4b07-8c72-7468e0e37d41.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/d6f3d6db-4b88-4aad-b4c4-0173a4101800.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/c06ba2e0-40bd-4064-94da-b3f429fdef11.__CR0,0,362,453_PT0_SX362_V1___.jpg"
          ],
          "faqs": [
            {
              "title": "How did we get our start?",
              "body": "DEARCASE has been around since 2012, and has now become one of the most acclaimed online stores for women’s fashion."
            },
            {
              "title": "What makes our products unique?",
              "body": "Our team draws on rich experience and great passion on providing fashionable clothing for women from the ages of 16-35.DEARCASE brand has a strong supply chain advantage,and it has a complete system for product development, design, production, sales and service."
            },
            {
              "title": "Why do we love what we do?",
              "body": "The heart of this position is powered by a passion for DEARCASE brand, a love for fashion and a desire to get yourself the newest trends."
            }
          ]
        },
        "third_party": true
      },
      "sub_title": {
        "text": "Visit the DEARCASE Store",
        "link": "https://www.amazon.com/stores/DEARCASE/page/ED6A98AD-4327-4015-B1D1-504E8D0EE193?ref_=ast_bln"
      },
      "amazons_choice": {
        "keywords": "green dresses for women plus size",
        "link": "https://www.amazon.com/s/ref=choice_dp_b?keywords=green%20dresses%20for%20women%20plus%20size"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.5,
      "ratings_total": 16067,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/51kTL52p9JL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/51kTL52p9JL._AC_UL1202_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/518syb7BEoL._AC_UL1500_.jpg",
          "variant": "PT01"
        }
      ],
      "images_count": 2,
      "videos": [
        {
          "duration_seconds": 29,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/fb67ca7f-2ad7-472a-931f-999bcd463bf3/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/81msQw5thJL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "DEARCASE Women Flowy Maxi Dress"
        },
        {
          "duration_seconds": 26,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/e684ed4f-ee45-4e38-8e93-5b9a6789f5e3/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/A13SeSfYFLL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "maxi dress with pockets"
        },
        {
          "duration_seconds": 27,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/2edbe8bf-bfc3-4456-a310-f4294adc411b/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/A1tA-u5QvDL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Women Short Sleeve Floral Maxi Dress With Pockets"
        },
        {
          "duration_seconds": 30,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/f831d011-32cc-4763-bc91-26bc21151eb7/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/91TLJwMjegL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "women  short sleeve maxi dress with pockets"
        },
        {
          "duration_seconds": 25,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/5b3f8c0b-0494-4fed-ad4f-99065dbfa330/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/915oNbnkSrL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "women maxi dress"
        },
        {
          "duration_seconds": 24,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/v2/b2876db9-4a28-5791-9b79-57fa8d8604e3/ShortForm-Generic-480p-16-9-1409173089793-rpcbe5.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/A1LNlyo5K8L.SX522_.png",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "DEARCASE Women Short Sleeve Loose Plain Maxi Dresses Casual Long Dresses with Pockets"
        }
      ],
      "videos_count": 6,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/fb67ca7f-2ad7-472a-931f-999bcd463bf3/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/e684ed4f-ee45-4e38-8e93-5b9a6789f5e3/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/2edbe8bf-bfc3-4456-a310-f4294adc411b/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/f831d011-32cc-4763-bc91-26bc21151eb7/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/5b3f8c0b-0494-4fed-ad4f-99065dbfa330/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/v2/b2876db9-4a28-5791-9b79-57fa8d8604e3/ShortForm-Generic-480p-16-9-1409173089793-rpcbe5.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.f7fc5f246f0b4f4b9ca85a4d8e7e3d80",
          "product_asin": "B078WLYP5Z",
          "parent_asin": "B07BQCT8YZ",
          "sponsor_products": "true",
          "title": "Women Short Sleeve Floral Maxi Dress With Pockets",
          "public_name": "DEARCASE",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "DEARCASE",
          "video_image_id": "A1tA-u5QvDL",
          "video_image_url": "https://m.media-amazon.com/images/I/A1tA-u5QvDL._CR0,0,1780,939_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/A1tA-u5QvDL.jpg",
          "video_image_width": "1780",
          "video_image_height": "1000",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/2edbe8bf-bfc3-4456-a310-f4294adc411b/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/08cdd012-c002-4ef5-8b0a-c6b533ce9b53/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:27",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.03e5daba569143239a917626b5f79045",
          "product_asin": "B078WLYP5Z",
          "parent_asin": "B07BQCT8YZ",
          "sponsor_products": "true",
          "title": "DEARCASE Women Flowy Maxi Dress",
          "public_name": "DEARCASE",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "DEARCASE",
          "video_image_id": "81msQw5thJL",
          "video_image_url": "https://m.media-amazon.com/images/I/81msQw5thJL._CR0,0,1920,1013_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/81msQw5thJL.jpg",
          "video_image_width": "1920",
          "video_image_height": "1080",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/fb67ca7f-2ad7-472a-931f-999bcd463bf3/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/a3b52255-efa1-4213-a6a0-f4c7e4c13743/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:29",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.d47d7c41bf12424db5b9b8adb84637d8",
          "product_asin": "B078WLYP5Z",
          "parent_asin": "B07BQCT8YZ",
          "sponsor_products": "true",
          "title": "DEARCASE Women Short Sleeve Loose Plain Maxi Dresses Casual Long Dresses with Pockets",
          "public_name": "DEARCASE",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "DEARCASE",
          "video_image_id": "A1LNlyo5K8L",
          "video_image_url": "https://m.media-amazon.com/images/I/A1LNlyo5K8L._CR0,0,1920,1013_SR580,306_.png",
          "video_image_url_unchanged": "https://images-na.ssl-images-amazon.com/images/I/A1LNlyo5K8L.png",
          "video_image_width": "1920",
          "video_image_height": "1080",
          "video_image_extension": "png",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/v2/b2876db9-4a28-5791-9b79-57fa8d8604e3/ShortForm-Generic-480p-16-9-1409173089793-rpcbe5.mp4",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/7c1da022-251b-418c-beca-d28457f62cbb/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "video/mp4",
          "duration": "0:24",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.9744792046e74b78bc0def1aceac391b",
          "product_asin": "B078WLYP5Z",
          "parent_asin": "B07BQCT8YZ",
          "sponsor_products": "true",
          "title": "maxi dress with pockets",
          "public_name": "DEARCASE",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "DEARCASE",
          "video_image_id": "A13SeSfYFLL",
          "video_image_url": "https://m.media-amazon.com/images/I/A13SeSfYFLL._CR0,0,1780,939_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/A13SeSfYFLL.jpg",
          "video_image_width": "1780",
          "video_image_height": "1000",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/e684ed4f-ee45-4e38-8e93-5b9a6789f5e3/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/48bdf2b9-03c7-4d97-927d-31f72021e6e9/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:26",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.ec38d599ab4040d58922bbf15cc57385",
          "product_asin": "B078WLYP5Z",
          "parent_asin": "B07BQCT8YZ",
          "sponsor_products": "true",
          "title": "women  short sleeve maxi dress with pockets",
          "public_name": "DEARCASE",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "DEARCASE",
          "video_image_id": "91TLJwMjegL",
          "video_image_url": "https://m.media-amazon.com/images/I/91TLJwMjegL._CR0,0,1780,939_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/91TLJwMjegL.jpg",
          "video_image_width": "1780",
          "video_image_height": "1000",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/f831d011-32cc-4763-bc91-26bc21151eb7/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/54ae9940-0b63-4193-8ec9-b6e4cc398ed5/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:30",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.e82fd8dc632f4a69abbc035a9070ae66",
          "product_asin": "B078WLYP5Z",
          "parent_asin": "B07BQCT8YZ",
          "sponsor_products": "true",
          "title": "women maxi dress",
          "public_name": "DEARCASE",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "DEARCASE",
          "video_image_id": "915oNbnkSrL",
          "video_image_url": "https://m.media-amazon.com/images/I/915oNbnkSrL._CR0,0,1000,528_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/915oNbnkSrL.jpg",
          "video_image_width": "1000",
          "video_image_height": "618",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/5b3f8c0b-0494-4fed-ad4f-99065dbfa330/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/7ff1cbeb-9334-4363-b75d-0086986996c2/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:25",
          "type": "videos_for_this_product"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 10,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Mon, Oct 3",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Thu, Sep 29",
            "name": "Or fastest delivery Thu, Sep 29. Order within 23 hrs 45 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "DEARCASE",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A2QVFTZ74LDW3K&asin=B078WLYP5Z&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A2QVFTZ74LDW3K"
          }
        },
        "price": {
          "symbol": "$",
          "value": 32.99,
          "currency": "USD",
          "raw": "$32.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 25253,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Casual Dresses",
          "rank": 369,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/2346727011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 25253, Category: Women's Casual Dresses | Rank: 369"
    }
  };

  let result = await isModleBelowTheKnee(payload);
  expect(result).toBe(true);
});

it("below-the-knee-example-2-working", async () => {
//https://www.amazon.com/dp/B07B8C242P/ref=sspa_dk_detail_6?psc=1&pd_rd_i=B07B8C242P&pd_rd_w=9uCWl&content-id=amzn1.sym.001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_p=001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_r=4FZNAJ5TDC96ESMY67KH&pd_rd_wg=K4l9x&pd_rd_r=f3e2111d-3d2d-4e29-91d3-cb2e71b345b8

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 554,
      "overage_used": 54,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/dp/B07B8C242P/ref=sspa_dk_detail_6?psc=1&pd_rd_i=B07B8C242P&pd_rd_w=9uCWl&content-id=amzn1.sym.001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_p=001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_r=4FZNAJ5TDC96ESMY67KH&pd_rd_wg=K4l9x&pd_rd_r=f3e2111d-3d2d-4e29-91d3-cb2e71b345b8"
    },
    "product": {
      "title": "EUOVMY Women's Short Sleeve Loose Plain Maxi Dresses Casual Long Dresses with Pockets Medium 1-navy Blue",
      "title_excluding_variant_name": "EUOVMY Women's Short Sleeve Loose Plain Maxi Dresses Casual Long Dresses with Pockets",
      "keywords": "EUOVMY,Women's,Short,Sleeve,Loose,Plain,Maxi,Dresses,Casual,Long,Dresses,with,Pockets",
      "keywords_list": [
        "EUOVMY",
        "Women's",
        "Short",
        "Sleeve",
        "Loose",
        "Plain",
        "Maxi",
        "Dresses",
        "Casual",
        "Long",
        "Dresses",
        "with",
        "Pockets"
      ],
      "asin": "B07B8C242P",
      "link": "https://www.amazon.com/dp/B07B8C242P??th=1&psc=1",
      "brand": "EUOVMY",
      "has_size_guide": true,
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
          "name": "Dresses",
          "link": "https://www.amazon.com/Dresses/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045024",
          "category_id": "1045024"
        },
        {
          "name": "Casual",
          "link": "https://www.amazon.com/Casual-Dresses/b/ref=dp_bc_aui_C_5?ie=UTF8&node=2346727011",
          "category_id": "2346727011"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Dresses > Casual",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "title": "EUOVMY Women's Short Sleeve Loose Plain Maxi Dresses Casual Long Dresses with Pockets Women Summer Short Sleeve Sun Long Maxi Beach Dresses EUOVMY Women's Short Sleeve Summer Maxi Casual Long Dresses With Pockets Model Information Product Details",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/2960bbc2-8d5a-49f3-8e25-185b663dbb01.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
          "description": "Our solid color maxi dress are so versatile and easy to rock in every season! We are falling in love with the multicoloured-it's perfect for any spring occasion! Featuring a short sleeve cut paired with a classic floor length and roundneck, these relaxed maxisare so easy to love! The flowing skirt is so elegant, while the elastic in the waist keeps it more fashionable! This long maxi dress also has pockets on the both sides ,and wonderful soft material that will stay comfortable all day long too! You can easily keep it casual with sandals and a floppy hat,or you can dress it up with a sparkling necklace! This maxi is such an essential for summer fun!",
          "brand_store": {
            "link": "/stores/page/20B8EBC7-2A01-4878-B848-42C54D6EDC1E",
            "id": "20B8EBC7-2A01-4878-B848-42C54D6EDC1E"
          },
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/2960bbc2-8d5a-49f3-8e25-185b663dbb01.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/bb343d0b-55aa-4e1d-8fde-328b7654530a.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/288fa6ee-a069-4e6e-b5b2-0fa5fb0cb4b3.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/b4693927-6622-46d8-b402-319a30a54ebf.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/45e349ae-0bfb-4682-b3da-285c8de54432.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/bd85a622-1a82-481d-bc54-51b8fcc4f97f.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/cd6fcdc5-a595-4c1c-8afd-b73ee6d7ab75.__CR0,0,362,453_PT0_SX362_V1___.jpg"
          ],
          "products": [
            {
              "title": "striped sleeveless maxi dress",
              "asin": "B089ZQ3VVB",
              "link": "/dp/B089ZQ3VVB/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/d873db4c-2523-4f8b-9e8f-dd865d362e8b.__AC_SR166,182___.jpg"
            },
            {
              "title": "long sleeve maxi dress",
              "asin": "B07CTBY3L6",
              "link": "/dp/B07CTBY3L6/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/b61c791c-2c0f-48d7-adf4-b5b5583cc511.__AC_SR166,182___.jpg"
            },
            {
              "title": "casual long maxi dress",
              "asin": "B07CXJ6DL1",
              "link": "/dp/B07CXJ6DL1/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/8b81fc59-d42f-4565-930b-2a4df97bbda4.__AC_SR166,182___.jpg"
            },
            {
              "title": "racer back long maxi dress",
              "asin": "B07CXLVNSK",
              "link": "/dp/B07CXLVNSK/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/f8dbc22f-377e-4600-84ed-b6a9efab155f.__AC_SR166,182___.jpg"
            }
          ]
        },
        "third_party": true
      },
      "sub_title": {
        "text": "Visit the EUOVMY Store",
        "link": "https://www.amazon.com/stores/Euovmy/page/20B8EBC7-2A01-4878-B848-42C54D6EDC1E?ref_=ast_bln"
      },
      "amazons_choice": {
        "keywords": "in Women's Casual Dresses by EUOVMY"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.5,
      "ratings_total": 12181,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/61s1EbutsZL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/61s1EbutsZL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61xwjyc5a+L._AC_UL1500_.jpg",
          "variant": "PT01"
        }
      ],
      "images_count": 2,
      "videos": [
        {
          "duration_seconds": 33,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/0afa1b84-345b-4067-bfb3-91edc5782bed/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/81X8+W5HFiL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Euovmy Summer Floral Length Casual Dress"
        },
        {
          "duration_seconds": 33,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/5d5b8de0-4ffb-441c-94d6-6752455fb6ba/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/A1wlUK4e6IL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Euovmy Sunflower Long Maxi dress"
        },
        {
          "duration_seconds": 39,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/0ed73976-a77d-4fa4-8979-4a9d1fbe766f/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/91wHOs2MZpL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Euovmy Casual Maxi Dress For Women"
        },
        {
          "duration_seconds": 45,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/d329d6b5-5eef-4f91-aa80-bad7b852cd40/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/91u2aoybn3L.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Euovmy Summer Maxi Dress for Women"
        },
        {
          "duration_seconds": 27,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/69e0cf9b-fa63-4618-983f-9412a706f449/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/61Zcg-ifSlL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Euovmy Summer Short Sleeve Maxi Dress"
        },
        {
          "duration_seconds": 25,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/f73e48be-9a50-4646-a9bd-efbdd4e4a541/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/81D+w-3HOKL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Euovmy White Floral Maxi dress with pockets"
        }
      ],
      "videos_count": 6,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/0afa1b84-345b-4067-bfb3-91edc5782bed/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/5d5b8de0-4ffb-441c-94d6-6752455fb6ba/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/0ed73976-a77d-4fa4-8979-4a9d1fbe766f/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/d329d6b5-5eef-4f91-aa80-bad7b852cd40/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/69e0cf9b-fa63-4618-983f-9412a706f449/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/f73e48be-9a50-4646-a9bd-efbdd4e4a541/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.6c0bdbea83e745c79ac567d715dfea4f",
          "product_asin": "B07B8C242P",
          "parent_asin": "B09M5V15HJ",
          "sponsor_products": "true",
          "title": "Euovmy long floral maxi dress",
          "public_name": "Euovmy",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Euovmy",
          "video_image_id": "81LCfbAzXaL",
          "video_image_url": "https://m.media-amazon.com/images/I/81LCfbAzXaL._CR0,0,2160,1140_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/81LCfbAzXaL.jpg",
          "video_image_width": "2160",
          "video_image_height": "1440",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/1e51e407-4c85-4529-a51e-8a19fbefedba/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/41efb548-1431-4d8a-80be-e0bf020abbf5/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:27",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.029f3f8918b54b63b41db5e406ee74eb",
          "product_asin": "B07B8C242P",
          "parent_asin": "B09M5V15HJ",
          "sponsor_products": "true",
          "title": "Euovmy Summer Maxi Dress for Women",
          "public_name": "Euovmy",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Euovmy",
          "video_image_id": "91u2aoybn3L",
          "video_image_url": "https://m.media-amazon.com/images/I/91u2aoybn3L._CR0,0,1920,1013_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/91u2aoybn3L.jpg",
          "video_image_width": "1920",
          "video_image_height": "1080",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/d329d6b5-5eef-4f91-aa80-bad7b852cd40/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/9483d42c-6e81-448d-b54c-bc9c46d8ffd8/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:45",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.821eda82aee045a4876773049d7488a5",
          "product_asin": "B07B8C242P",
          "parent_asin": "B09M5V15HJ",
          "sponsor_products": "true",
          "title": "Euovmy Acid Blue Short Sleeve Maxi Dress With Pockets",
          "public_name": "Euovmy",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Euovmy",
          "video_image_id": "511Y9HKyQ8L",
          "video_image_url": "https://m.media-amazon.com/images/I/511Y9HKyQ8L._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/511Y9HKyQ8L.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/62617fb9-f17c-4ba8-a03a-65eb5c086033/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/4a68a4e9-5c92-4e8b-a73b-2f26663b5419/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:26",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.007c66b691eb48d8b4cc21e3dc850f70",
          "product_asin": "B07B8C242P",
          "parent_asin": "B09M5V15HJ",
          "sponsor_products": "true",
          "title": "Euovmy Summer Short Sleeve Maxi Dress",
          "public_name": "Euovmy",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Euovmy",
          "video_image_id": "61Zcg-ifSlL",
          "video_image_url": "https://m.media-amazon.com/images/I/61Zcg-ifSlL._CR0,0,1920,1013_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/61Zcg-ifSlL.jpg",
          "video_image_width": "1920",
          "video_image_height": "1080",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/69e0cf9b-fa63-4618-983f-9412a706f449/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/39a66f82-418c-4ecf-bc79-4a3fe763935f/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:27",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/8b62e2d6-b99f-4d8b-b58e-088fb5e49256.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.02d166b3c54d4081aa32cdb24edce20f",
          "product_asin": "B07B8C242P",
          "parent_asin": "B09M5V15HJ",
          "sponsor_products": "true",
          "title": "Euovmy Casual Maxi Dress For Women",
          "public_name": "Euovmy",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Euovmy",
          "video_image_id": "91wHOs2MZpL",
          "video_image_url": "https://m.media-amazon.com/images/I/91wHOs2MZpL._CR0,0,1920,1013_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/91wHOs2MZpL.jpg",
          "video_image_width": "1920",
          "video_image_height": "1080",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/0ed73976-a77d-4fa4-8979-4a9d1fbe766f/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/4004a41a-ed5d-4980-b15a-b88cd132350f/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:39",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.04bfe56cbd004430808916e0c61ac306",
          "product_asin": "B07B8C242P",
          "parent_asin": "B09M5V15HJ",
          "sponsor_products": "true",
          "title": "Euovmy White Floral Maxi dress with pockets",
          "public_name": "Euovmy",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Euovmy",
          "video_image_id": "81D+w-3HOKL",
          "video_image_url": "https://m.media-amazon.com/images/I/81D+w-3HOKL._CR0,0,2160,1140_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/81D+w-3HOKL.jpg",
          "video_image_width": "2160",
          "video_image_height": "1440",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/f73e48be-9a50-4646-a9bd-efbdd4e4a541/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/5662d89e-bd06-4eb1-96b9-af24c519c45c/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:25",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.07bbf0f9fe1d4d549ccfa87e64a84ffa",
          "product_asin": "B07B8C242P",
          "parent_asin": "B09M5V15HJ",
          "sponsor_products": "true",
          "title": "Euovmy Summer Floral Length Casual Dress",
          "public_name": "Euovmy",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Euovmy",
          "video_image_id": "81X8+W5HFiL",
          "video_image_url": "https://m.media-amazon.com/images/I/81X8+W5HFiL._CR0,0,1920,1013_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/81X8+W5HFiL.jpg",
          "video_image_width": "1920",
          "video_image_height": "1080",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/0afa1b84-345b-4067-bfb3-91edc5782bed/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/21cbbc2a-ccf6-488a-9f90-068ce1624855/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:33",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.002dc0b17a0d45b1956a058cf660e0bd",
          "product_asin": "B07B8C242P",
          "parent_asin": "B09M5V15HJ",
          "sponsor_products": "true",
          "title": "Euovmy Sunflower Long Maxi dress",
          "public_name": "Euovmy",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Euovmy",
          "video_image_id": "A1wlUK4e6IL",
          "video_image_url": "https://m.media-amazon.com/images/I/A1wlUK4e6IL._CR0,0,1920,1013_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/A1wlUK4e6IL.jpg",
          "video_image_width": "1920",
          "video_image_height": "1080",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/5d5b8de0-4ffb-441c-94d6-6752455fb6ba/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/567bb6d1-704f-48c9-bf8f-851c9ecf06d2/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:33",
          "type": "videos_for_this_product"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 10,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Mon, Oct 3",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Thu, Sep 29",
            "name": "Or fastest delivery Thu, Sep 29. Order within 23 hrs 47 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Euovmy",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=AO9JM08COAXR5&asin=B07B8C242P&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "AO9JM08COAXR5"
          }
        },
        "price": {
          "symbol": "$",
          "value": 34.99,
          "currency": "USD",
          "raw": "$34.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Our Brands",
          "rank": 2296,
          "link": "https://www.amazon.com/gp/bestsellers/private-brands/ref=pd_zg_ts_private-brands"
        },
        {
          "category": "Women's Casual Dresses",
          "rank": 238,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/2346727011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "manufacturer": "EUOVMY",
      "bestsellers_rank_flat": "Category: Our Brands | Rank: 2296, Category: Women's Casual Dresses | Rank: 238"
    }
  };

  let result = await isModleBelowTheKnee(payload);
  expect(result).toBe(true);
});

it("below-the-knee-example-4-working", async () => {
//https://www.amazon.com/dp/B07VKKFKBS/ref=sspa_dk_detail_5?psc=1&pd_rd_i=B07VKKFKBS&pd_rd_w=UePrA&content-id=amzn1.sym.dd2c6db7-6626-466d-bf04-9570e69a7df0&pf_rd_p=dd2c6db7-6626-466d-bf04-9570e69a7df0&pf_rd_r=5Q8EMWFATBKPCR60G90R&pd_rd_wg=lFsDh&pd_rd_r=0ed5f57a-d9ee-4ede-b0bc-06ebedac9f49&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUFPWDJLRTFJQUcwT0QmZW5jcnlwdGVkSWQ9QTAzNjIyMzcxNk9BV1BUWUpCNU1TJmVuY3J5cHRlZEFkSWQ9QTAxOTIzOTkzNTBZU0ZOOTQxMEYmd2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWMmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 556,
      "overage_used": 56,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/dp/B07VKKFKBS/ref=sspa_dk_detail_5?psc=1&pd_rd_i=B07VKKFKBS&pd_rd_w=UePrA&content-id=amzn1.sym.dd2c6db7-6626-466d-bf04-9570e69a7df0&pf_rd_p=dd2c6db7-6626-466d-bf04-9570e69a7df0&pf_rd_r=5Q8EMWFATBKPCR60G90R&pd_rd_wg=lFsDh&pd_rd_r=0ed5f57a-d9ee-4ede-b0bc-06ebedac9f49&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUFPWDJLRTFJQUcwT0QmZW5jcnlwdGVkSWQ9QTAzNjIyMzcxNk9BV1BUWUpCNU1TJmVuY3J5cHRlZEFkSWQ9QTAxOTIzOTkzNTBZU0ZOOTQxMEYmd2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWMmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl"
    },
    "product": {
      "title": "HUSKARY Women's Summer Casual Sleeveless V Neck Strappy Split Loose Dress Beach Cover Up Long Cami Maxi Dresses with Pocket Green XX-Large",
      "title_excluding_variant_name": "HUSKARY Women's Summer Casual Sleeveless V Neck Strappy Split Loose Dress Beach Cover Up Long Cami Maxi Dresses with Pocket",
      "keywords": "HUSKARY,Women's,Summer,Casual,Sleeveless,V,Neck,Strappy,Split,Loose,Dress,Beach,Cover,Up,Long,Cami,Maxi,Dresses,with,Pocket",
      "keywords_list": [
        "HUSKARY",
        "Women's",
        "Summer",
        "Casual",
        "Sleeveless",
        "Neck",
        "Strappy",
        "Split",
        "Loose",
        "Dress",
        "Beach",
        "Cover",
        "Long",
        "Cami",
        "Maxi",
        "Dresses",
        "with",
        "Pocket"
      ],
      "asin": "B07VKKFKBS",
      "link": "https://www.amazon.com/dp/B07VKKFKBS??th=1&psc=1",
      "brand": "HUSKARY",
      "has_size_guide": true,
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
          "name": "Swimsuits & Cover Ups",
          "link": "https://www.amazon.com/Womens-Swimsuits-and-Cover-Ups/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1046622",
          "category_id": "1046622"
        },
        {
          "name": "Cover-Ups",
          "link": "https://www.amazon.com/Womens-Cover-Ups/b/ref=dp_bc_aui_C_5?ie=UTF8&node=1046626",
          "category_id": "1046626"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Swimsuits & Cover Ups > Cover-Ups",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": false,
        "third_party": true
      },
      "sub_title": {
        "text": "Visit the HUSKARY Store",
        "link": "https://www.amazon.com/stores/HUSKARY/page/3D6C996D-9019-47AF-83C4-9F64E83766F3?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.3,
      "ratings_total": 10419,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/51rV7jO95wL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/51rV7jO95wL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51b2XeKQu-L._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61AxFGKb+QL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61owjl9dj5L._AC_UL1000_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/612ZZvrHuyL._AC_UL1000_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71Bwhb2LiiL._AC_UL1500_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "videos_additional": [
        {
          "id": "amzn1.vse.video.077ba055a1184a3b82f2f7e9c419e7b2",
          "product_asin": "B07VKKFKBS",
          "parent_asin": "B08NTBL539",
          "related_products": "B07BLYS4WC",
          "sponsor_products": "true",
          "title": "Trying on Huskary Sleeveless Maxi Dress/How is fit?",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/mariedubuque_1657230845833_original._CR159,0,960,960_._FMjpg_.jpeg",
          "profile_link": "/shop/mariedubuque",
          "public_name": "Marie Dubuque",
          "creator_type": "Influencer",
          "vendor_code": "mariedubuque:shop",
          "vendor_name": "Marie Dubuque",
          "vendor_tracking_id": "mariedubuqu0a-20",
          "video_image_id": "51GczqkVBbL",
          "video_image_url": "https://m.media-amazon.com/images/I/51GczqkVBbL._CR0,0,1280,675_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51GczqkVBbL.jpg",
          "video_image_width": "1280",
          "video_image_height": "720",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/d65b2788-976f-4d24-ad8f-c983e7cd0a61/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/9ef8f268-a063-4e03-a882-4f5604a03100/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "2:57",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/ce7378f3-535c-40c5-8e9e-4c6fb99703c4.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.005c0fae31a24c4ea3df16ba3b8feb80",
          "product_asin": "B07VKKFKBS",
          "parent_asin": "B08NTBL539",
          "related_products": "B07BLSJ7QP, B08XDZV7QL, B0034XR4YK, B08XDNMNXH",
          "sponsor_products": "true",
          "title": "Summer Casual Maxi Try-On & Review",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/influencer-4bdeb905_1567223154462_original._CR0,236,775,775_._FMjpg_.png",
          "profile_link": "/shop/influencer-4bdeb905",
          "public_name": "Marlene Srdic | Life with Mar",
          "creator_type": "Influencer",
          "vendor_code": "influencer-4bdeb905:shop",
          "vendor_name": "Marlene Srdic | Life with Mar",
          "vendor_tracking_id": "live627-20",
          "video_image_id": "51WOOEt0LoL",
          "video_image_url": "https://m.media-amazon.com/images/I/51WOOEt0LoL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51WOOEt0LoL.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/81ee1cfb-fe3f-4318-b8dd-b932450c1b55/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/b5295d9a-b62e-431e-9418-e00a7436cc12/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:49",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/40b8f29d-b55d-4458-aad0-ca510532942c.vtt",
          "type": "videos_for_this_product"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 30,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Monday, October 3",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Thursday, September 29",
            "name": "Or fastest delivery Thursday, September 29. Order within 23 hrs 43 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Huskary",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A1X3MHRU02GX4I&asin=B07VKKFKBS&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A1X3MHRU02GX4I"
          }
        },
        "price": {
          "symbol": "$",
          "value": 29.99,
          "currency": "USD",
          "raw": "$29.99"
        },
        "rrp": {
          "symbol": "$",
          "value": 39.99,
          "currency": "USD",
          "raw": "$39.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Amazon Launchpad",
          "rank": 413,
          "link": "https://www.amazon.com/gp/bestsellers/boost/ref=pd_zg_ts_boost"
        },
        {
          "category": "Amazon Launchpad Clothing, Shoes & Jewelry",
          "rank": 12,
          "link": "https://www.amazon.com/gp/bestsellers/boost/21179681011/ref=pd_zg_hrsr_boost"
        },
        {
          "category": "Women's Swimwear Cover Ups",
          "rank": 71,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1046626/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Amazon Launchpad | Rank: 413, Category: Amazon Launchpad Clothing Shoes & Jewelry | Rank: 12, Category: Women's Swimwear Cover Ups | Rank: 71"
    }
  };

  let result = await isModleBelowTheKnee(payload);
  expect(result).toBe(true);
});

it("not-below-the-knee-example-4-working", async () => {
//https://www.amazon.com/dp/B0B152MVNS/ref=sspa_dk_detail_4?psc=1&pd_rd_i=B0B152MVNS&pd_rd_w=qrZhG&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=AJYM76K5X8NSSAEVTGNK&pd_rd_wg=YodjM&pd_rd_r=7ec381f3-d324-4640-abed-38f0160f76e6&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEyRjhRQUVCMU44UE5LJmVuY3J5cHRlZElkPUEwMzMzNTk4M09DUTFHTjFOMTlFTyZlbmNyeXB0ZWRBZElkPUEwNjYyOTIxMVY2WEkxQktVVUIxNCZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 505,
      "overage_used": 5,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/dp/B0B4V6SM55/ref=sspa_dk_detail_1?psc=1&pd_rd_i=B0B4V6SM55&pd_rd_w=WG4Gj&content-id=amzn1.sym.001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_p=001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_r=EJW5RZ6AXS6DAR2BEDRM&pd_rd_wg=NkLmd&pd_rd_r=bd3411f2-2c59-4e73-8642-efab8a747525&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExWlk5QzBHV0c2TzkmZW5jcnlwdGVkSWQ9QTAyODA1ODcxNlZXS1pJUERSVDNFJmVuY3J5cHRlZEFkSWQ9QTAwNzA2MzQ4VUVZUTZESkNYQVEmd2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWMmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl"
    },
    "product": {
      "title": "Saloogoe Sweater Dress for Women Knee Length with Pockets Long Sleeve Fall Dresses 2022 00-brown Small",
      "title_excluding_variant_name": "Saloogoe Sweater Dress for Women Knee Length with Pockets Long Sleeve Fall Dresses 2022",
      "keywords": "Saloogoe,Sweater,Dress,for,Women,Knee,Length,with,Pockets,Long,Sleeve,Fall,Dresses,2022",
      "keywords_list": [
        "Saloogoe",
        "Sweater",
        "Dress",
        "Women",
        "Knee",
        "Length",
        "with",
        "Pockets",
        "Long",
        "Sleeve",
        "Fall",
        "Dresses",
        "2022"
      ],
      "asin": "B0B4V6SM55",
      "link": "https://www.amazon.com/dp/B0B4V6SM55??th=1&psc=1",
      "brand": "Saloogoe",
      "has_size_guide": true,
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
          "name": "Dresses",
          "link": "https://www.amazon.com/Dresses/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045024",
          "category_id": "1045024"
        },
        {
          "name": "Casual",
          "link": "https://www.amazon.com/Casual-Dresses/b/ref=dp_bc_aui_C_5?ie=UTF8&node=2346727011",
          "category_id": "2346727011"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Dresses > Casual",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "brand_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/f3124841-f7cb-4639-beb4-7d405d22f761.__CR0,0,315,145_PT0_SX315_V1___.jpg",
          "title": "Saloogoe-Sweater Dress for Women Fashion Fall Dresss 2022 Saloogoe-Model show Saloogoe-Fall and Winter Dress for Women Soft and Comfy Suit for Any Occasions Product and Fabric Details Softness and stretch fabric Saloogoe-Size Chart Please allow 0.4-0.8 inch differ due to manual measurement, thanks for your understanding in advance",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/808f80d8-dee4-4525-a367-d217ed767aa1.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
          "description": "The team behind it has more than ten years of clothing experience. We have an independent product development and technical team to ensure the originality of our styles and the control of the product version. Choose the most comfortable fabric for each product And maintain the stability of the products, making them a classic. we strictly inspect the quality to ensure that every product delivered to the buyer is satisfied",
          "brand_store": {
            "link": "/stores/page/50F6AD1F-09ED-4EF0-B9AF-C7CD12F20D54",
            "id": "50F6AD1F-09ED-4EF0-B9AF-C7CD12F20D54"
          },
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/808f80d8-dee4-4525-a367-d217ed767aa1.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/fb0837fc-7284-46d1-8545-724042c4fef8.__CR0,0,362,453_PT0_SX362_V1___.jpg"
          ],
          "products": [
            {
              "title": "sweater dress for women",
              "asin": "B0B4V8D6G7",
              "link": "/dp/B0B4V8D6G7/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/7e392540-c6e2-453c-9c30-598008c6cd0e.__AC_SR166,182___.jpg"
            },
            {
              "title": "sweater dress for women",
              "asin": "B0B4V3VXN5",
              "link": "/dp/B0B4V3VXN5/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/87399cc6-0313-491d-92f2-3fad268b160f.__AC_SR166,182___.jpg"
            },
            {
              "title": "sweater dress for women",
              "asin": "B0B4VL5NWW",
              "link": "/dp/B0B4VL5NWW/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/28de171d-ffe9-4464-88d2-c273fd2fb4c9.__AC_SR166,182___.jpg"
            },
            {
              "title": "sweater dress for women",
              "asin": "B0B4VGMR6Q",
              "link": "/dp/B0B4VGMR6Q/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/dd1524c0-3d2c-4470-a19a-6095b4c654e0.__AC_SR166,182___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/f3124841-f7cb-4639-beb4-7d405d22f761.__CR0,0,315,145_PT0_SX315_V1___.jpg",
        "company_description_text": "The team behind it has more than ten years of clothing experience. We have an independent product development and technical team to ensure the originality of our styles and the control of the product version. Choose the most comfortable fabric for each product And maintain the stability of the products, making them a classic. we strictly inspect the quality to ensure that every product delivered to the buyer is satisfied"
      },
      "sub_title": {
        "text": "Visit the Saloogoe Store",
        "link": "https://www.amazon.com/stores/Saloogoe/page/50F6AD1F-09ED-4EF0-B9AF-C7CD12F20D54?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "has_coupon": true,
      "coupon_text": "Save an extra 20% when you apply this coupon",
      "rating": 4.7,
      "ratings_total": 9,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/81jlB5EVz2L.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/81jlB5EVz2L._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71xRC99UazL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71jxxlq75YL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71vJ0q+Uw-L._AC_UL1500_.jpg",
          "variant": "PT03"
        }
      ],
      "images_count": 4,
      "videos": [
        {
          "duration_seconds": 25,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/1431e768-d460-4f67-a656-c4d918ee8a85/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/A1oCcr6AbeL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Saloogoe-Casual dress for women 2022-5.00''-95Ibs"
        },
        {
          "duration_seconds": 29,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/41bcfa3e-ec63-4b56-bd6b-1cfe47121db1/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/71YwGtK7KcL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Saloogoe-Fall dresses for women 2022 casual sweater dress"
        }
      ],
      "videos_count": 2,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/1431e768-d460-4f67-a656-c4d918ee8a85/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/41bcfa3e-ec63-4b56-bd6b-1cfe47121db1/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.061458c59173472eabeb3308abe174f1",
          "product_asin": "B0B4V6SM55",
          "parent_asin": "B0B4VFVM2Q",
          "related_products": "B0B4VGYRWJ, B0B4V8D6G7, B0B4VCWWL2, B0B4TWSTL1, B0B4V11DWL",
          "sponsor_products": "true",
          "title": "Saloogoe-Casual dress for women 2022-5.00''-95Ibs",
          "public_name": "Saloogoe",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Saloogoe",
          "video_image_id": "A1oCcr6AbeL",
          "video_image_url": "https://m.media-amazon.com/images/I/A1oCcr6AbeL._CR0,0,1920,1013_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/A1oCcr6AbeL.jpg",
          "video_image_width": "1920",
          "video_image_height": "1080",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/1431e768-d460-4f67-a656-c4d918ee8a85/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/679b99d4-aef1-4d56-88b7-bf7928fd30ac/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:25",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/1f736404-89a6-44f7-b7b1-8965d1787334.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.08da4138d3ee49c3850e4eb1b767a08f",
          "product_asin": "B0B4V6SM55",
          "parent_asin": "B0B4VFVM2Q",
          "related_products": "B0B56GCQR1, B0B211PPXQ, B0B4VGYRWJ, B0B4TWSTL1, B0B4V8D6G7",
          "sponsor_products": "true",
          "title": "Saloogoe-Fall dresses for women 2022 casual sweater dress",
          "public_name": "Saloogoe",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Saloogoe",
          "video_image_id": "71YwGtK7KcL",
          "video_image_url": "https://m.media-amazon.com/images/I/71YwGtK7KcL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/71YwGtK7KcL.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/41bcfa3e-ec63-4b56-bd6b-1cfe47121db1/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/102b6435-dc84-44c2-adc6-9d75ba5aa203/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:29",
          "type": "videos_for_this_product"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 20,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Sunday, October 2",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Wednesday, September 28",
            "name": "Or fastest delivery Wednesday, September 28. Order within 15 hrs 24 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Saloogoe",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A1HOHCHFP9W3W5&asin=B0B4V6SM55&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A1HOHCHFP9W3W5"
          }
        },
        "price": {
          "symbol": "$",
          "value": 29.99,
          "currency": "USD",
          "raw": "$29.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Our Brands",
          "rank": 3249,
          "link": "https://www.amazon.com/gp/bestsellers/private-brands/ref=pd_zg_ts_private-brands"
        },
        {
          "category": "Women's Casual Dresses",
          "rank": 399,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/2346727011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Our Brands | Rank: 3249, Category: Women's Casual Dresses | Rank: 399"
    }
  };

  let result = await isModleBelowTheKnee(payload);
  expect(result).toBe(false);
});

it("not-below-the-knee-example-5-working", async () => {
//https://www.amazon.com/dp/B0B4V6SM55/ref=sspa_dk_detail_1?psc=1&pd_rd_i=B0B4V6SM55&pd_rd_w=WG4Gj&content-id=amzn1.sym.001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_p=001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_r=EJW5RZ6AXS6DAR2BEDRM&pd_rd_wg=NkLmd&pd_rd_r=bd3411f2-2c59-4e73-8642-efab8a747525&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExWlk5QzBHV0c2TzkmZW5jcnlwdGVkSWQ9QTAyODA1ODcxNlZXS1pJUERSVDNFJmVuY3J5cHRlZEFkSWQ9QTAwNzA2MzQ4VUVZUTZESkNYQVEmd2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWMmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 507,
      "overage_used": 7,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/dp/B0B152MVNS/ref=sspa_dk_detail_4?psc=1&pd_rd_i=B0B152MVNS&pd_rd_w=qrZhG&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=AJYM76K5X8NSSAEVTGNK&pd_rd_wg=YodjM&pd_rd_r=7ec381f3-d324-4640-abed-38f0160f76e6&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEyRjhRQUVCMU44UE5LJmVuY3J5cHRlZElkPUEwMzMzNTk4M09DUTFHTjFOMTlFTyZlbmNyeXB0ZWRBZElkPUEwNjYyOTIxMVY2WEkxQktVVUIxNCZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU="
    },
    "product": {
      "title": "PRETTYGARDEN Women's Long Sleeve Mini Tunic Dress Casual Crewneck Loose Flowy Shift Ruched Dresses Black Large",
      "title_excluding_variant_name": "PRETTYGARDEN Women's Long Sleeve Mini Tunic Dress Casual Crewneck Loose Flowy Shift Ruched Dresses",
      "keywords": "PRETTYGARDEN,Women's,Long,Sleeve,Mini,Tunic,Dress,Casual,Crewneck,Loose,Flowy,Shift,Ruched,Dresses",
      "keywords_list": [
        "PRETTYGARDEN",
        "Women's",
        "Long",
        "Sleeve",
        "Mini",
        "Tunic",
        "Dress",
        "Casual",
        "Crewneck",
        "Loose",
        "Flowy",
        "Shift",
        "Ruched",
        "Dresses"
      ],
      "asin": "B0B152MVNS",
      "link": "https://www.amazon.com/dp/B0B152MVNS??th=1&psc=1",
      "brand": "PRETTYGARDEN",
      "has_size_guide": true,
      "documents": [
        {
          "name": "Size Guide (PDF)",
          "link": "https://m.media-amazon.com/images/I/B1BS60zgURL.pdf"
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
          "name": "Dresses",
          "link": "https://www.amazon.com/Dresses/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045024",
          "category_id": "1045024"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Dresses",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "title": "PRETTYGARDEN Women's Summer Long Sleeve Dresses Casual Loose Above Knee Length Dress PRETTYGARDEN Shift Dresses For Women With Sleeves Crewneck Long Sleeve Hoco Dress PRETTYGARDEN Tunic Dresses To Wear With Leggings Modest Homecoming Dresses For Women PRETTYGARDEN Women's Trendy Irregular Ruched Short Dresses Beach Vacation Outfits PRETTYGARDEN Dresses For Women Party Club Night Round Neck Solid Color Mini Dress PRETTYGARDEN Semi Formal Dresses For Wedding Guest Classy Dress For Women Elegant",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/52622d22-66f9-4498-a576-2b5f5293e10d.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
          "brand_store": {
            "link": "/stores/page/2A60D2F3-2F7C-4434-BA5F-394D3BAA8533",
            "id": "2A60D2F3-2F7C-4434-BA5F-394D3BAA8533"
          },
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/52622d22-66f9-4498-a576-2b5f5293e10d.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/643a0173-55be-41af-8e0a-331b393a88de.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/ca97ba58-565c-4f0b-a346-3362de6fb034.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/0f8dd454-a967-4580-b9e0-f256791e7361.__CR0,23,463,579_PT0_SX362_V1___.jpg"
          ],
          "faqs": [
            {
              "title": "How we got our start?",
              "body": "PRETTYGARDEN Is An Upcoming Brand About To Make Waves Within The Fashion Industry For Women Clothing. Established In 2005 PRETTYGARDEN Was Created With The Sole Intention Of Empowering Women And Boosting Women Confidence."
            },
            {
              "title": "What makes our product unique?",
              "body": "Our Customers Opinions And Feedback Are The Key Ingredient To Growth And Improvement And Is Incorporated Into The Company’s Strategy Whenever Possible. We Keep Prices Low Without Losing Out On Quality, Innovation Or Style."
            }
          ],
          "products": [
            {
              "title": "PRETTYGARDEN Women's Long Sleeve Mini Tunic Dress Casual Crewneck Loose Flowy Shift Ruched Dresses",
              "asin": "B0B151MF3V",
              "link": "/dp/B0B151MF3V/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41aWpK5SRmL.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN Women's Long Sleeve Mini Tunic Dress Casual Crewneck Loose Flowy Shift Ruched Dresses",
              "asin": "B0B14ZWBSG",
              "link": "/dp/B0B14ZWBSG/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41Pe1Y%2BbX0L.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN Women's Long Sleeve Mini Tunic Dress Casual Crewneck Loose Flowy Shift Ruched Dresses",
              "asin": "B0B15331WB",
              "link": "/dp/B0B15331WB/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41AQ8Q3OnrL.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN Women's Long Sleeve Mini Tunic Dress Casual Crewneck Loose Flowy Shift Ruched Dresses",
              "asin": "B0B15294NK",
              "link": "/dp/B0B15294NK/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/417VtN263vL.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B0B3WZK9K2",
              "link": "/dp/B0B3WZK9K2/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/2f935e26-cc45-4237-89af-ef8c7e293d87.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B0B3WXTKYC",
              "link": "/dp/B0B3WXTKYC/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/b8a1cfff-d86f-49c9-87f7-352114f594f1.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B0B45S7S55",
              "link": "/dp/B0B45S7S55/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/de6619cd-5b7d-4c63-a8ba-7ab2548aba9c.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B0B3MFS2WK",
              "link": "/dp/B0B3MFS2WK/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/6a4de3c8-c561-4f9a-8467-f349f56719e2.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN ",
              "asin": "B0B4NG7LKG",
              "link": "/dp/B0B4NG7LKG/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/2d80f88a-d9a9-44a7-bbfb-ce35f72466a5.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B0B4N8H82B",
              "link": "/dp/B0B4N8H82B/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/e9970597-8157-45e0-bf1d-a6868790b37c.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B0B3LXRNGC",
              "link": "/dp/B0B3LXRNGC/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/fd87b0b7-f75c-4c78-a370-fba77ac4facc.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B0B4D559ZZ",
              "link": "/dp/B0B4D559ZZ/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/65e1101a-20f7-456b-be7d-85e9f645f7a9.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B0B14W3JRT",
              "link": "/dp/B0B14W3JRT/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/8f468243-db37-4013-8393-6261ecfa45d7.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B0B1WP2QD1",
              "link": "/dp/B0B1WP2QD1/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/7f292545-6088-4588-abe6-62260bf6df83.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN ",
              "asin": "B0B2W7ZND3",
              "link": "/dp/B0B2W7ZND3/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/0b29c54f-7da3-4e9f-9093-aa4d809831f3.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN ",
              "asin": "B0B14R1DYF",
              "link": "/dp/B0B14R1DYF/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/b59f81a3-ac6a-4f79-94bf-e2fe759d01c3.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B0B3X88YL7",
              "link": "/dp/B0B3X88YL7/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/95f4f47e-3880-41c6-b613-539c9384f481.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B097XZQS7V",
              "link": "/dp/B097XZQS7V/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/49a77918-4b7f-415b-af4d-b025aa43ab00.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B08NTN1FXK",
              "link": "/dp/B08NTN1FXK/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/e89e1cae-3c42-499e-b02b-aef13ad8e813.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B08NTCK32M",
              "link": "/dp/B08NTCK32M/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/39faf35c-a114-4257-8617-1d9c45d2c65a.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B093RDZ3FR",
              "link": "/dp/B093RDZ3FR/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/a5869374-79e3-466b-bab5-db9abfd44dab.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B09R9RNPG9",
              "link": "/dp/B09R9RNPG9/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/75c04bfd-3651-4b0c-b5f1-e2443ede32d0.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B09894HY2H",
              "link": "/dp/B09894HY2H/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/613b645c-b74d-4e8a-9c8e-b17622a4904a.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B09H4DVCCQ",
              "link": "/dp/B09H4DVCCQ/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/ee7ce6f1-b061-4bb7-8347-326c48204d4f.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B09T95XK1T",
              "link": "/dp/B09T95XK1T/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/a795e341-ba56-4bad-978a-0023a10ca11d.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B094JBWBCM",
              "link": "/dp/B094JBWBCM/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/ae3dd29b-a7fe-4e11-8152-fc985581966b.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B09GXG8GNH",
              "link": "/dp/B09GXG8GNH/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/2840575a-4d65-4d4e-9737-af6a04456d58.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B09H4CZ9G4",
              "link": "/dp/B09H4CZ9G4/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/feadfbe0-6432-4eb0-8162-6a4d09aaf91e.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B0B2R9JJTV",
              "link": "/dp/B0B2R9JJTV/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/1abee4c7-4e04-41a8-8e17-28e9e2e10fed.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B0B1TGG1QK",
              "link": "/dp/B0B1TGG1QK/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/ed1e9e7f-a179-4c90-b295-db517c33ba57.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B0B1586ZZ6",
              "link": "/dp/B0B1586ZZ6/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/9af0706d-eba1-44ed-a45a-9ef6df64d742.__AC_SR166,182___.jpg"
            },
            {
              "title": "PRETTYGARDEN",
              "asin": "B0B4NP24SW",
              "link": "/dp/B0B4NP24SW/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/1db7f05c-b969-4ee6-9278-fdc5d2f49d7f.__AC_SR166,182___.jpg"
            }
          ]
        },
        "third_party": true
      },
      "sub_title": {
        "text": "Visit the PRETTYGARDEN Store",
        "link": "https://www.amazon.com/stores/PRETTYGARDEN/page/2A60D2F3-2F7C-4434-BA5F-394D3BAA8533?ref_=ast_bln"
      },
      "amazons_choice": {
        "keywords": "long sleeve casual mini dress for women",
        "link": "https://www.amazon.com/s/ref=choice_dp_b?keywords=long%20sleeve%20casual%20mini%20dress%20for%20women"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "has_coupon": true,
      "coupon_text": "Save an extra 5% when you apply this coupon",
      "rating": 4,
      "ratings_total": 67,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/61HtTIBZ+4L.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/61HtTIBZ+4L._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61ixSIuRiAL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71-qCGeS2VL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61Sp5MLS8pL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71XWmqFOsSL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61PF1ikqeZL._AC_UL1400_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "videos": [
        {
          "duration_seconds": 28,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/d5bebea9-33fe-4ff1-84c6-97469388c325/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/51Rj8YYJnfL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Long Sleeve Ruched Dress"
        },
        {
          "duration_seconds": 25,
          "width": 270,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/0cfe2bd1-73b2-43d5-9050-7db611fff213/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/71-JvfrnYxL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Long Sleeve Tunic Tops"
        },
        {
          "duration_seconds": 11,
          "width": 270,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/b2977ca7-a20e-40e4-84c0-9ffc70e477f3/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/715gcnCxt9L.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Casual Fall Dresses"
        },
        {
          "duration_seconds": 9,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/862e5328-09e4-4db8-aa25-77721a9aedd5/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/51+vI6LyNXL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Loose Short Dresses"
        },
        {
          "duration_seconds": 13,
          "width": 270,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/ec2b7776-5474-4530-8d5c-af11341d148a/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/61+cq9eqohL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Irregular Ruched Dress"
        },
        {
          "duration_seconds": 5,
          "width": 270,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/699daf9c-0e13-417d-87b9-bace346960f1/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/611ZsiuIZJL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Mini Solid Sweatshirt Dress "
        }
      ],
      "videos_count": 6,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/d5bebea9-33fe-4ff1-84c6-97469388c325/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/0cfe2bd1-73b2-43d5-9050-7db611fff213/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/b2977ca7-a20e-40e4-84c0-9ffc70e477f3/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/862e5328-09e4-4db8-aa25-77721a9aedd5/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/ec2b7776-5474-4530-8d5c-af11341d148a/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/699daf9c-0e13-417d-87b9-bace346960f1/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.0e1939f05a204b728063c1ffd6095e52",
          "product_asin": "B0B152MVNS",
          "parent_asin": "B0B1586ZZ6",
          "related_products": "B0B152MVNS, B0B151PPQ1, B0B151ZGM2, B0B151MF3V",
          "sponsor_products": "true",
          "title": "Casual Fall Dresses",
          "public_name": "PRETTYGARDEN",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "PRETTYGARDEN",
          "video_image_id": "715gcnCxt9L",
          "video_image_url": "https://m.media-amazon.com/images/I/715gcnCxt9L._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/715gcnCxt9L.jpg",
          "video_image_width": "640",
          "video_image_height": "1137",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/b2977ca7-a20e-40e4-84c0-9ffc70e477f3/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/5c6e5844-742e-444f-ac26-b0e79be1177d/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:11",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.035f412b359c4fb6aae5ad6a9ad4cacb",
          "product_asin": "B0B152MVNS",
          "parent_asin": "B0B1586ZZ6",
          "related_products": "B0B152MVNS, B0B151PPQ1, B0B151ZGM2, B0B151MF3V, B0B14ZPCTC",
          "sponsor_products": "true",
          "title": "Irregular Ruched Dress",
          "public_name": "PRETTYGARDEN",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "PRETTYGARDEN",
          "video_image_id": "61+cq9eqohL",
          "video_image_url": "https://m.media-amazon.com/images/I/61+cq9eqohL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/61+cq9eqohL.jpg",
          "video_image_width": "640",
          "video_image_height": "1137",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/ec2b7776-5474-4530-8d5c-af11341d148a/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/b6e95a71-a77e-49db-a6fa-4309c2683562/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:13",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0c89c2ef297540adbd9793cd5a361d5a",
          "product_asin": "B0B152MVNS",
          "parent_asin": "B0B1586ZZ6",
          "related_products": "B0B152MVNS, B0B151PPQ1, B0B151ZGM2, B0B151MF3V",
          "sponsor_products": "true",
          "title": "Mini Sweatshirt Dress",
          "public_name": "PRETTYGARDEN",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "PRETTYGARDEN",
          "video_image_id": "71RHNJtYMcL",
          "video_image_url": "https://m.media-amazon.com/images/I/71RHNJtYMcL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/71RHNJtYMcL.jpg",
          "video_image_width": "640",
          "video_image_height": "1137",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/7dd43343-d95d-4e52-bf16-5296ffd5405b/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/df5874e9-d022-4838-96f7-81872d10096e/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:09",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/b2e91f9d-db63-4108-bfc4-867f340898aa.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.05d03c97711c40eebce017a0d68930fb",
          "product_asin": "B0B152MVNS",
          "parent_asin": "B0B1586ZZ6",
          "related_products": "B0B152MVNS, B0B151PPQ1, B0B151ZGM2, B0B151MF3V",
          "sponsor_products": "true",
          "title": "Loose Fitting Summer Dress",
          "public_name": "PRETTYGARDEN",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "PRETTYGARDEN",
          "video_image_id": "61ggwV3uYQL",
          "video_image_url": "https://m.media-amazon.com/images/I/61ggwV3uYQL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/61ggwV3uYQL.jpg",
          "video_image_width": "640",
          "video_image_height": "1137",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/cfc81cdd-2c21-48f5-8233-3fc3efa7b778/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/6cc46c14-9ab2-462c-8a4f-7b141a5fa9c7/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:16",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0275c1c4187548a889b4d20c9709151d",
          "product_asin": "B0B152MVNS",
          "parent_asin": "B0B1586ZZ6",
          "related_products": "B0B152MVNS, B0B151PPQ1, B0B151ZGM2, B0B151MF3V",
          "sponsor_products": "true",
          "title": "Loose Short Dresses",
          "public_name": "PRETTYGARDEN",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "PRETTYGARDEN",
          "video_image_id": "51+vI6LyNXL",
          "video_image_url": "https://m.media-amazon.com/images/I/51+vI6LyNXL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51+vI6LyNXL.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/862e5328-09e4-4db8-aa25-77721a9aedd5/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/23bcc8fe-9853-4e07-9f2d-545bb71f14e3/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:09",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.08d8a77c44a641b8b4432918f7eace73",
          "product_asin": "B0B152MVNS",
          "parent_asin": "B0B1586ZZ6",
          "related_products": "B0B152MVNS, B0B151PPQ1, B0B151ZGM2, B0B151MF3V, B0B14ZPCTC",
          "sponsor_products": "true",
          "title": "PRETTYGARDEN Women's Long Sleeve Mini Tunic Dress ",
          "public_name": "PRETTYGARDEN",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "PRETTYGARDEN",
          "video_image_id": "61j5uQ+JxvL",
          "video_image_url": "https://m.media-amazon.com/images/I/61j5uQ+JxvL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/61j5uQ+JxvL.jpg",
          "video_image_width": "640",
          "video_image_height": "1152",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/8ddb1d36-a43a-4b1f-b731-af69dd366c08/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/e9943516-1396-4e0a-bce1-9bc59579d63a/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:15",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/4d6efa95-bf16-49f2-89e3-383011d2a37e.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.07bf0ff90a1748acb8cbe797b62b688b",
          "product_asin": "B0B152MVNS",
          "parent_asin": "B0B1586ZZ6",
          "related_products": "B0B152MVNS, B0B151PPQ1, B0B151ZGM2, B0B151MF3V, B0B14ZPCTC",
          "sponsor_products": "true",
          "title": "Long Sleeve Tunic Tops",
          "public_name": "PRETTYGARDEN",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "PRETTYGARDEN",
          "video_image_id": "71-JvfrnYxL",
          "video_image_url": "https://m.media-amazon.com/images/I/71-JvfrnYxL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/71-JvfrnYxL.jpg",
          "video_image_width": "640",
          "video_image_height": "1137",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/0cfe2bd1-73b2-43d5-9050-7db611fff213/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/94ba2284-7dcc-473e-b9b1-0ac8d8f93471/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:25",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.001e034f9028490b8fbb53d3ce6f5e58",
          "product_asin": "B0B152MVNS",
          "parent_asin": "B0B1586ZZ6",
          "related_products": "B0B152MVNS, B0B151PPQ1, B0B151ZGM2, B0B151MF3V",
          "sponsor_products": "true",
          "title": "Ruched Crewneck Dress",
          "public_name": "PRETTYGARDEN",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "PRETTYGARDEN",
          "video_image_id": "71Vr-BAIdVL",
          "video_image_url": "https://m.media-amazon.com/images/I/71Vr-BAIdVL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/71Vr-BAIdVL.jpg",
          "video_image_width": "640",
          "video_image_height": "1137",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/95d360c4-7a6d-418f-bb03-bc19d5615c3b/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/3cde69be-b66b-4dee-8a39-146caaf8e0a8/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:14",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/3ef466a7-8b14-4768-b539-951f6b748e75.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0a0115d70f8840c8b80d7dbedbc1930d",
          "product_asin": "B0B152MVNS",
          "parent_asin": "B0B1586ZZ6",
          "related_products": "B0B152MVNS, B0B151PPQ1, B0B151ZGM2, B0B151MF3V",
          "sponsor_products": "true",
          "title": "Long Sleeve Ruched Dress",
          "public_name": "PRETTYGARDEN",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "PRETTYGARDEN",
          "video_image_id": "51Rj8YYJnfL",
          "video_image_url": "https://m.media-amazon.com/images/I/51Rj8YYJnfL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51Rj8YYJnfL.jpg",
          "video_image_width": "640",
          "video_image_height": "359",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/d5bebea9-33fe-4ff1-84c6-97469388c325/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/c0afc72b-73b5-4d23-89b2-fe4d9969a9b2/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:28",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.018ad8f68f5b4974bc272e2ef4f4967c",
          "product_asin": "B0B152MVNS",
          "parent_asin": "B0B1586ZZ6",
          "related_products": "B0B152MVNS, B0B151PPQ1, B0B151ZGM2, B0B151MF3V, B0B14ZPCTC",
          "sponsor_products": "true",
          "title": "Long Sleeve Crewneck Dress",
          "public_name": "PRETTYGARDEN",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "PRETTYGARDEN",
          "video_image_id": "612LDEB1qWL",
          "video_image_url": "https://m.media-amazon.com/images/I/612LDEB1qWL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/612LDEB1qWL.jpg",
          "video_image_width": "640",
          "video_image_height": "1137",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/d3fc56b4-eacd-41c7-b0c4-964b08d50317/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/e8b7b29a-d958-402d-a354-3f5c8da54205/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:10",
          "type": "videos_for_this_product"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 6,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Sun, Oct 2",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Wed, Sep 28",
            "name": "Or fastest delivery Wed, Sep 28. Order within 13 hrs 42 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "PRETTYGARDEN",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=AW513678AUV06&asin=B0B152MVNS&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "AW513678AUV06"
          }
        },
        "price": {
          "symbol": "$",
          "value": 27.99,
          "currency": "USD",
          "raw": "$27.99"
        },
        "rrp": {
          "symbol": "$",
          "value": 40.99,
          "currency": "USD",
          "raw": "$40.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 12772,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Dresses",
          "rank": 782,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1045024/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 12772, Category: Women's Dresses | Rank: 782"
    },
    "user_guide": "https://m.media-amazon.com/images/I/B1BS60zgURL.pdf"
  };

  let result = await isModleBelowTheKnee(payload);
  expect(result).toBe(false);
});

it("below-the-knee-example-6-working", async () => {
//https://www.amazon.com/dp/B09ZD4RBKN/ref=sspa_dk_detail_2?psc=1&pd_rd_i=B09ZD4RBKN&pd_rd_w=uc2ar&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=N0XA0FCWJV3S54KV5JRM&pd_rd_wg=UnPBC&pd_rd_r=4af6240c-66ee-4152-bcb6-3a2e24dee40f&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExVjZQMVdTWVhRSVc5JmVuY3J5cHRlZElkPUEwMjM0NjYwMU9GMFJWOEc5UjVLNCZlbmNyeXB0ZWRBZElkPUEwMDcxMTMwMVpEVTk0MDhaNUo3QSZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 473,
      "credits_used_this_request": 1,
      "credits_remaining": 27,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/dp/B09ZD4RBKN/ref=sspa_dk_detail_2?psc=1&pd_rd_i=B09ZD4RBKN&pd_rd_w=uc2ar&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=N0XA0FCWJV3S54KV5JRM&pd_rd_wg=UnPBC&pd_rd_r=4af6240c-66ee-4152-bcb6-3a2e24dee40f&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExVjZQMVdTWVhRSVc5JmVuY3J5cHRlZElkPUEwMjM0NjYwMU9GMFJWOEc5UjVLNCZlbmNyeXB0ZWRBZElkPUEwMDcxMTMwMVpEVTk0MDhaNUo3QSZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU="
    },
    "product": {
      "title": "Nemidor Womens Plus Size Boho Ditsy Floral Print Casual Layered Flared Maxi Dress with Pocket NEM304 14 Plus Navy Print",
      "title_excluding_variant_name": "Nemidor Womens Plus Size Boho Ditsy Floral Print Casual Layered Flared Maxi Dress with Pocket NEM304",
      "keywords": "Nemidor,Womens,Plus,Size,Boho,Ditsy,Floral,Print,Casual,Layered,Flared,Maxi,Dress,with,Pocket,NEM304",
      "keywords_list": [
        "Nemidor",
        "Womens",
        "Plus",
        "Size",
        "Boho",
        "Ditsy",
        "Floral",
        "Print",
        "Casual",
        "Layered",
        "Flared",
        "Maxi",
        "Dress",
        "with",
        "Pocket",
        "NEM304"
      ],
      "asin": "B09ZD4RBKN",
      "link": "https://www.amazon.com/dp/B09ZD4RBKN??th=1&psc=1",
      "brand": "Nemidor",
      "has_size_guide": true,
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
          "name": "Dresses",
          "link": "https://www.amazon.com/Dresses/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045024",
          "category_id": "1045024"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Dresses",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "brand_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/be9509ac-2972-42e8-9c6b-12701dca3edd.__CR104,0,391,180_PT0_SX315_V1___.jpg",
          "title": "Nemidor Womens Plus Size Bohemian Ditsy Floral Print Casual Layered Flared Summer Maxi Dress Nemidor Womens Plus Size Bohemian Ditsy Floral Print Layered Flared Maxi Dress Buyers Show Nemidor Womens Plus Size Boho Ditsy Floral Print Casual Layered Flared Maxi Dress with Pocket Womens Plus Size Bohemian Ditsy Floral Print Layered Flared Maxi Dress Size Chart",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/1f58a9b9-a137-4177-b294-5315078354b2.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
          "description": "",
          "brand_store": {
            "link": "/stores/page/84D8FE04-7448-46AF-9FB2-E5DAA8E2DF93",
            "id": "84D8FE04-7448-46AF-9FB2-E5DAA8E2DF93"
          },
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/1f58a9b9-a137-4177-b294-5315078354b2.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/d56905f4-f3c6-402b-90da-0046fa9e57ef.__CR0,0,362,453_PT0_SX362_V1___.jpg"
          ],
          "products": [
            {
              "title": "Nemidor Womens Plus Size Boho Print V Neck High Low Flowy Midi Wrap Dress with Pockets NEM305",
              "asin": "B09ZDZJS2T",
              "link": "/dp/B09ZDZJS2T/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51%2BnF1ssUiL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Casual Plus Size Summer Boho Floral Print Swing Midi Dress with Pockets NEM306",
              "asin": "B09ZHR6VX5",
              "link": "/dp/B09ZHR6VX5/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41kgbryncsL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Drop Shoulder Plus Size Casual Summer Boho Chiffon Print Skater Dress NEM311",
              "asin": "B0B3DP2HLL",
              "link": "/dp/B0B3DP2HLL/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51zaz60LgGL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Casual Plus Size Tie Waist Slit Long Maxi Dress with Pockets NEM313",
              "asin": "B0B2PK4H4C",
              "link": "/dp/B0B2PK4H4C/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41OxTBs1KbL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Plus Size Deep V Neck Ruched Bodycon Party Wrap Dress with Slit NEM309",
              "asin": "B0B41M98P7",
              "link": "/dp/B0B41M98P7/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/419o-QvSQvL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Plus Size Ruched Pleated Bodycon Midi Casual Party Wrap Dress with Slit NEM307",
              "asin": "B0B2PGXGQ7",
              "link": "/dp/B0B2PGXGQ7/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31j6XFq1gML.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Plus Size Ruched Wrap Dress Pleated Bodycon Midi Casual Party Work Dress NEM303",
              "asin": "B09YC9HLHC",
              "link": "/dp/B09YC9HLHC/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41YXyDbVV6L.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Short Sleeve Plus Size Dress Casual Midi Swing Dress with Pockets NEM301",
              "asin": "B09Y1WL7NV",
              "link": "/dp/B09Y1WL7NV/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31CTqiecSBL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Plus Size Casual V Neck Short Sleeve A-line Slit Midi Dress with Pocket NEM302",
              "asin": "B09Y1ZGFX5",
              "link": "/dp/B09Y1ZGFX5/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31vQQzCYU5L.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Plus Size Boho Ditsy Floral Print Casual Layered Flared Maxi Dress with Pocket NEM304",
              "asin": "B09YNQYJQ5",
              "link": "/dp/B09YNQYJQ5/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51lDKkraQuL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Drop Shoulder Plus Size Casual Summer Boho Chiffon Print Skater Dress NEM311",
              "asin": "B0B3DR5FJ3",
              "link": "/dp/B0B3DR5FJ3/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51WJPgOB1AL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Casual Plus Size Tie Waist Slit Long Maxi Dress with Pockets NEM313",
              "asin": "B0B2PMPPWH",
              "link": "/dp/B0B2PMPPWH/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/3172SAXh0QL.__AC_SR166,182___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/be9509ac-2972-42e8-9c6b-12701dca3edd.__CR0,0,600,180_PT0_SX600_V1___.jpg"
      },
      "sub_title": {
        "text": "Visit the Nemidor Store",
        "link": "https://www.amazon.com/stores/Nemidor/page/84D8FE04-7448-46AF-9FB2-E5DAA8E2DF93?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "has_coupon": true,
      "coupon_text": "Save an extra 6% when you apply this coupon",
      "rating": 4.4,
      "ratings_total": 279,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/71Ed-RwassL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/71Ed-RwassL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81MMpd9m4vL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/815evAx-NqL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81QwN9gYAaL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81FaE2jpPmL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81Bx9NwU1sL._AC_UL1500_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "videos": [
        {
          "duration_seconds": 30,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/338efe78-d98b-4dfd-940a-c21df3b91ddf/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/91XndLFmkIL.SX522_.png",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Nemidor Womens Plus Size Boho Print Layered Flared Maxi Dress NEM304"
        }
      ],
      "videos_count": 1,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/338efe78-d98b-4dfd-940a-c21df3b91ddf/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.0d2ae07cce894d1c9568a9437c27f130",
          "product_asin": "B09ZD4RBKN",
          "parent_asin": "B09YNQRQ8T",
          "related_products": "B09YNR6N7D, B09YNR8D38, B09YNS2GR9, B09YNRBJ31, B09YNQYJQ5",
          "sponsor_products": "true",
          "title": "Nemidor Womens Plus Size Boho Print Layered Flared Maxi Dress NEM304",
          "public_name": "Venus Lu",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Venus Lu",
          "video_image_id": "91XndLFmkIL",
          "video_image_url": "https://m.media-amazon.com/images/I/91XndLFmkIL._CR0,0,1045,551_SR580,306_.png",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/91XndLFmkIL.png",
          "video_image_width": "1045",
          "video_image_height": "851",
          "video_image_extension": "png",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/338efe78-d98b-4dfd-940a-c21df3b91ddf/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/48a0eeee-2450-4703-847f-a3e434445c59/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:30",
          "type": "videos_for_this_product"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 9,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Sun, Oct 2",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Wed, Sep 28",
            "name": "Or fastest delivery Wed, Sep 28. Order within 15 hrs 56 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Venus Lu",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A2R297Y25OPCBS&asin=B09ZD4RBKN&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A2R297Y25OPCBS"
          }
        },
        "price": {
          "symbol": "$",
          "value": 29.99,
          "currency": "USD",
          "raw": "$29.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 15954,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Dresses",
          "rank": 938,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1045024/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 15954, Category: Women's Dresses | Rank: 938"
    }
  };

  let result = await isModleBelowTheKnee(payload);
  expect(result).toBe(true);
});

//Above The Knee

it("above-the-knee-example-1-working", async () => {
//https://www.amazon.com/dp/B0B4V6SM55/ref=sspa_dk_detail_1?psc=1&pd_rd_i=B0B4V6SM55&pd_rd_w=WG4Gj&content-id=amzn1.sym.001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_p=001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_r=EJW5RZ6AXS6DAR2BEDRM&pd_rd_wg=NkLmd&pd_rd_r=bd3411f2-2c59-4e73-8642-efab8a747525&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExWlk5QzBHV0c2TzkmZW5jcnlwdGVkSWQ9QTAyODA1ODcxNlZXS1pJUERSVDNFJmVuY3J5cHRlZEFkSWQ9QTAwNzA2MzQ4VUVZUTZESkNYQVEmd2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWMmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 471,
      "credits_used_this_request": 1,
      "credits_remaining": 29,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/dp/B0B4V6SM55/ref=sspa_dk_detail_1?psc=1&pd_rd_i=B0B4V6SM55&pd_rd_w=WG4Gj&content-id=amzn1.sym.001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_p=001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_r=EJW5RZ6AXS6DAR2BEDRM&pd_rd_wg=NkLmd&pd_rd_r=bd3411f2-2c59-4e73-8642-efab8a747525&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExWlk5QzBHV0c2TzkmZW5jcnlwdGVkSWQ9QTAyODA1ODcxNlZXS1pJUERSVDNFJmVuY3J5cHRlZEFkSWQ9QTAwNzA2MzQ4VUVZUTZESkNYQVEmd2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWMmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl"
    },
    "product": {
      "title": "Saloogoe Sweater Dress for Women Knee Length with Pockets Long Sleeve Fall Dresses 2022 00-brown Small",
      "title_excluding_variant_name": "Saloogoe Sweater Dress for Women Knee Length with Pockets Long Sleeve Fall Dresses 2022",
      "keywords": "Saloogoe,Sweater,Dress,for,Women,Knee,Length,with,Pockets,Long,Sleeve,Fall,Dresses,2022",
      "keywords_list": [
        "Saloogoe",
        "Sweater",
        "Dress",
        "Women",
        "Knee",
        "Length",
        "with",
        "Pockets",
        "Long",
        "Sleeve",
        "Fall",
        "Dresses",
        "2022"
      ],
      "asin": "B0B4V6SM55",
      "link": "https://www.amazon.com/dp/B0B4V6SM55??th=1&psc=1",
      "brand": "Saloogoe",
      "has_size_guide": true,
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
          "name": "Dresses",
          "link": "https://www.amazon.com/Dresses/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045024",
          "category_id": "1045024"
        },
        {
          "name": "Casual",
          "link": "https://www.amazon.com/Casual-Dresses/b/ref=dp_bc_aui_C_5?ie=UTF8&node=2346727011",
          "category_id": "2346727011"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Dresses > Casual",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "brand_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/f3124841-f7cb-4639-beb4-7d405d22f761.__CR0,0,315,145_PT0_SX315_V1___.jpg",
          "title": "Saloogoe-Sweater Dress for Women Fashion Fall Dresss 2022 Saloogoe-Model show Saloogoe-Fall and Winter Dress for Women Soft and Comfy Suit for Any Occasions Product and Fabric Details Softness and stretch fabric Saloogoe-Size Chart Please allow 0.4-0.8 inch differ due to manual measurement, thanks for your understanding in advance",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/808f80d8-dee4-4525-a367-d217ed767aa1.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
          "description": "The team behind it has more than ten years of clothing experience. We have an independent product development and technical team to ensure the originality of our styles and the control of the product version. Choose the most comfortable fabric for each product And maintain the stability of the products, making them a classic. we strictly inspect the quality to ensure that every product delivered to the buyer is satisfied",
          "brand_store": {
            "link": "/stores/page/50F6AD1F-09ED-4EF0-B9AF-C7CD12F20D54",
            "id": "50F6AD1F-09ED-4EF0-B9AF-C7CD12F20D54"
          },
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/808f80d8-dee4-4525-a367-d217ed767aa1.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/fb0837fc-7284-46d1-8545-724042c4fef8.__CR0,0,362,453_PT0_SX362_V1___.jpg"
          ],
          "products": [
            {
              "title": "sweater dress for women",
              "asin": "B0B4V8D6G7",
              "link": "/dp/B0B4V8D6G7/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/7e392540-c6e2-453c-9c30-598008c6cd0e.__AC_SR166,182___.jpg"
            },
            {
              "title": "sweater dress for women",
              "asin": "B0B4V3VXN5",
              "link": "/dp/B0B4V3VXN5/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/87399cc6-0313-491d-92f2-3fad268b160f.__AC_SR166,182___.jpg"
            },
            {
              "title": "sweater dress for women",
              "asin": "B0B4VL5NWW",
              "link": "/dp/B0B4VL5NWW/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/28de171d-ffe9-4464-88d2-c273fd2fb4c9.__AC_SR166,182___.jpg"
            },
            {
              "title": "sweater dress for women",
              "asin": "B0B4VGMR6Q",
              "link": "/dp/B0B4VGMR6Q/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/dd1524c0-3d2c-4470-a19a-6095b4c654e0.__AC_SR166,182___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/f3124841-f7cb-4639-beb4-7d405d22f761.__CR0,0,315,145_PT0_SX315_V1___.jpg",
        "company_description_text": "The team behind it has more than ten years of clothing experience. We have an independent product development and technical team to ensure the originality of our styles and the control of the product version. Choose the most comfortable fabric for each product And maintain the stability of the products, making them a classic. we strictly inspect the quality to ensure that every product delivered to the buyer is satisfied"
      },
      "sub_title": {
        "text": "Visit the Saloogoe Store",
        "link": "https://www.amazon.com/stores/Saloogoe/page/50F6AD1F-09ED-4EF0-B9AF-C7CD12F20D54?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "has_coupon": true,
      "coupon_text": "Save an extra 20% when you apply this coupon",
      "rating": 4.7,
      "ratings_total": 9,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/81jlB5EVz2L.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/81jlB5EVz2L._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71xRC99UazL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71jxxlq75YL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71vJ0q+Uw-L._AC_UL1500_.jpg",
          "variant": "PT03"
        }
      ],
      "images_count": 4,
      "videos": [
        {
          "duration_seconds": 25,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/1431e768-d460-4f67-a656-c4d918ee8a85/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/A1oCcr6AbeL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Saloogoe-Casual dress for women 2022-5.00''-95Ibs"
        },
        {
          "duration_seconds": 29,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/41bcfa3e-ec63-4b56-bd6b-1cfe47121db1/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/71YwGtK7KcL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Saloogoe-Fall dresses for women 2022 casual sweater dress"
        }
      ],
      "videos_count": 2,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/1431e768-d460-4f67-a656-c4d918ee8a85/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/41bcfa3e-ec63-4b56-bd6b-1cfe47121db1/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.061458c59173472eabeb3308abe174f1",
          "product_asin": "B0B4V6SM55",
          "parent_asin": "B0B4VFVM2Q",
          "related_products": "B0B4VGYRWJ, B0B4V8D6G7, B0B4VCWWL2, B0B4TWSTL1, B0B4V11DWL",
          "sponsor_products": "true",
          "title": "Saloogoe-Casual dress for women 2022-5.00''-95Ibs",
          "public_name": "Saloogoe",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Saloogoe",
          "video_image_id": "A1oCcr6AbeL",
          "video_image_url": "https://m.media-amazon.com/images/I/A1oCcr6AbeL._CR0,0,1920,1013_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/A1oCcr6AbeL.jpg",
          "video_image_width": "1920",
          "video_image_height": "1080",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/1431e768-d460-4f67-a656-c4d918ee8a85/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/679b99d4-aef1-4d56-88b7-bf7928fd30ac/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:25",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/1f736404-89a6-44f7-b7b1-8965d1787334.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.08da4138d3ee49c3850e4eb1b767a08f",
          "product_asin": "B0B4V6SM55",
          "parent_asin": "B0B4VFVM2Q",
          "related_products": "B0B56GCQR1, B0B211PPXQ, B0B4VGYRWJ, B0B4TWSTL1, B0B4V8D6G7",
          "sponsor_products": "true",
          "title": "Saloogoe-Fall dresses for women 2022 casual sweater dress",
          "public_name": "Saloogoe",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Saloogoe",
          "video_image_id": "71YwGtK7KcL",
          "video_image_url": "https://m.media-amazon.com/images/I/71YwGtK7KcL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/71YwGtK7KcL.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/41bcfa3e-ec63-4b56-bd6b-1cfe47121db1/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/102b6435-dc84-44c2-adc6-9d75ba5aa203/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:29",
          "type": "videos_for_this_product"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 21,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Sun, Oct 2",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Fri, Sep 30",
            "name": "Or fastest delivery Fri, Sep 30. Order within 16 hrs 2 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Saloogoe",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A1HOHCHFP9W3W5&asin=B0B4V6SM55&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A1HOHCHFP9W3W5"
          }
        },
        "price": {
          "symbol": "$",
          "value": 29.99,
          "currency": "USD",
          "raw": "$29.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Our Brands",
          "rank": 3140,
          "link": "https://www.amazon.com/gp/bestsellers/private-brands/ref=pd_zg_ts_private-brands"
        },
        {
          "category": "Women's Casual Dresses",
          "rank": 383,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/2346727011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Our Brands | Rank: 3140, Category: Women's Casual Dresses | Rank: 383"
    }
  };

  let result = await isModleAboveTheKnee(payload, filterKeywordsList);
  expect(result).toBe(true);
});

it("above-the-knee-example-2-working", async () => {
//https://www.amazon.com/Adibosy-Womens-Sleeve-Dresses-Chiffon/dp/B09J7TTB8C/ref=d_pd_di_sccai_cn_sccl_1_7/137-3450145-9885347?pd_rd_w=PJmRl&content-id=amzn1.sym.e13de93e-5518-4644-8e6b-4ee5f2e0b062&pf_rd_p=e13de93e-5518-4644-8e6b-4ee5f2e0b062&pf_rd_r=JHJYXFD1HBQM50D9ZP4A&pd_rd_wg=Id3LG&pd_rd_r=f861e7b8-8fb9-48cc-996e-dac02e52ee99&pd_rd_i=B09J7TTB8C&psc=1

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 553,
      "overage_used": 53,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/Adibosy-Womens-Sleeve-Dresses-Chiffon/dp/B09J7TTB8C/ref=d_pd_di_sccai_cn_sccl_1_7/137-3450145-9885347?pd_rd_w=PJmRl&content-id=amzn1.sym.e13de93e-5518-4644-8e6b-4ee5f2e0b062&pf_rd_p=e13de93e-5518-4644-8e6b-4ee5f2e0b062&pf_rd_r=JHJYXFD1HBQM50D9ZP4A&pd_rd_wg=Id3LG&pd_rd_r=f861e7b8-8fb9-48cc-996e-dac02e52ee99&pd_rd_i=B09J7TTB8C&psc=1"
    },
    "product": {
      "title": "Adibosy Women's Dress Long Sleeve Swiss Dot Mini Dresses Round Neck Loose Chiffon Casual Short Dress Small 532 Navy Blue",
      "title_excluding_variant_name": "Adibosy Women's Dress Long Sleeve Swiss Dot Mini Dresses Round Neck Loose Chiffon Casual Short Dress",
      "keywords": "Adibosy,Women's,Dress,Long,Sleeve,Swiss,Dot,Mini,Dresses,Round,Neck,Loose,Chiffon,Casual,Short,Dress",
      "keywords_list": [
        "Adibosy",
        "Women's",
        "Dress",
        "Long",
        "Sleeve",
        "Swiss",
        "Mini",
        "Dresses",
        "Round",
        "Neck",
        "Loose",
        "Chiffon",
        "Casual",
        "Short",
        "Dress"
      ],
      "asin": "B09J7TTB8C",
      "link": "https://www.amazon.com/dp/B09J7TTB8C??th=1&psc=1",
      "brand": "Adibosy",
      "has_size_guide": true,
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
          "name": "Dresses",
          "link": "https://www.amazon.com/Dresses/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045024",
          "category_id": "1045024"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Dresses",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "brand_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/00f0b71b-148d-483c-8077-58069c3ee5ce.__CR0,0,970,300_PT0_SX970_V1___.jpg",
          "title": "Women’s Swiss Dot Mini Dresses High Neck Long Sleeves Loose Hem Short Shift Dress Graduation dress for girls Women fall dress polka dot casual loose flowy swing tunic dresses Formal dresses for women Women‘s wedding guest dresses plus size maternity dress swiss dot alin dresses Leisure time Size informations Product details Tips:",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/ace4f3db-7289-4f7f-a1bd-8c52d9e43af8.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
          "description": "Standard size：S, M, L, XL High quality material：Rayon Style：Casual & fashion Features：long sleeve, high neck, loose hem, swiss dot，solid color,blue loose fit dress  • Please do understand due to manual measurement may have inevitable deviations. • Color Disclaimer: Color may be lighter or darker due to the different PC display.",
          "brand_store": {
            "link": "/stores/page/1611D536-0179-48BF-9F66-B9B5C288C189",
            "id": "1611D536-0179-48BF-9F66-B9B5C288C189"
          },
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/ace4f3db-7289-4f7f-a1bd-8c52d9e43af8.__CR0,0,1464,625_PT0_SX1464_V1___.jpg"
          ],
          "faqs": [
            {
              "title": "How we got our start?",
              "body": "ADIBOSY was established in 2015 with a professional and reliable design team. The main product is jumpsuits, and it has developed into tops, dress and other women's clothing. It is obtained people's trust with high-quality products and services in American markets."
            },
            {
              "title": "What makes our products unique?",
              "body": "Ingenious design, well-made tailoring, comfortable and soft fabrics, efficient and considerate service make our products popular with many young people and mature women."
            },
            {
              "title": "Why we love what we do?",
              "body": "Our aim is to create good products with heart and serve customers with more patience."
            }
          ],
          "products": [
            {
              "title": "Adibosy Women Summer Casual V Neck Midi Dress Wrap Flutter Sleeve Boho Dress Flowy Swing Ruffle T...",
              "asin": "B09NBMNLFJ",
              "link": "/dp/B09NBMNLFJ/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31jXoUPhScL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Adibosy Women's Dress Long Sleeve V Neck Swiss Dot Mini Dress Ruffle Flowy Loose Fit Chiffon Casu...",
              "asin": "B09NPZT64H",
              "link": "/dp/B09NPZT64H/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/4194u-m0q-L.__AC_SR166,182___.jpg"
            },
            {
              "title": "Adibosy Women's Dress Long Sleeve Swiss Dot Mini Dresses Round Neck Loose Chiffon Casual Short Dress",
              "asin": "B09J7XTX75",
              "link": "/dp/B09J7XTX75/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/318f7AigT5L.__AC_SR166,182___.jpg"
            },
            {
              "title": "Adibosy Women's Summer Tunic Dress Short Sleeve Swiss Dot Mini Dresses Casual Solid Loose Chiffon...",
              "asin": "B09PBHGKR3",
              "link": "/dp/B09PBHGKR3/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/25993cf5-3472-4313-b715-df33a0f01420.__CR0,0,332,364_PT0_SX166_V1___.jpg"
            },
            {
              "title": "Adibosy Women's V Neck Button Down Rompers Summer Short Sleeve Loose Romper One Piece Shorts Play...",
              "asin": "B09Q8KCQDS",
              "link": "/dp/B09Q8KCQDS/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/418H-oJ8NvL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Adibosy Womens Rompers Summer Jumpsuits Sleeveless Overalls Casual Playsuit Rompers Lounge Romper...",
              "asin": "B07QJ3H5JD",
              "link": "/dp/B07QJ3H5JD/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31uHp%2BL0TWL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Adibosy Women's V Neck Jumpsuits Short Sleeve Loose Jumpsuit Elastic Waist Romper Summer Rompers ...",
              "asin": "B088RG5SFM",
              "link": "/dp/B088RG5SFM/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41t6FXFMmjL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Adibosy Womens Jumpsuit Long Sleeve V Neck Pants Romper Casual Playsuit Jumper One Piece Outfit w...",
              "asin": "B089DHY821",
              "link": "/dp/B089DHY821/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31BI1VyV%2BML.__AC_SR166,182___.jpg"
            }
          ]
        },
        "third_party": true
      },
      "sub_title": {
        "text": "Visit the Adibosy Store",
        "link": "https://www.amazon.com/stores/Adibosy/page/1611D536-0179-48BF-9F66-B9B5C288C189?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.1,
      "ratings_total": 204,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/51wDPuklisL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/51wDPuklisL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71+++6JGddL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71mReXsPvqL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71Phc4591bL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/7108GmVsACL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71xoSktry9L._AC_UL1500_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "videos": [
        {
          "duration_seconds": 32,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/484d0f50-76c1-43f5-a295-6eca90d5a0cc/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/51F+1s-pYoL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Women's Long Sleeve Swiss Dot Mini Dresses Navy Blue S"
        }
      ],
      "videos_count": 1,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/484d0f50-76c1-43f5-a295-6eca90d5a0cc/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.0620ede98ce24711b4015b87a28c0ee6",
          "product_asin": "B09J7TTB8C",
          "parent_asin": "B09J89PTJV",
          "related_products": "B09J7M8RNX, B09J7TRNFK, B09J7MBBNL, B09J8J53DB",
          "sponsor_products": "true",
          "title": "Women's Long Sleeve Swiss Dot Mini Dresses Navy Blue S",
          "public_name": "Adibosy",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Adibosy",
          "video_image_id": "51F+1s-pYoL",
          "video_image_url": "https://m.media-amazon.com/images/I/51F+1s-pYoL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51F+1s-pYoL.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/484d0f50-76c1-43f5-a295-6eca90d5a0cc/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/e933c892-756d-44ff-ad4f-0c6d9c7f48da/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:32",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.03c5c0179c8a4c758bbf55379c1739ef",
          "product_asin": "B09J7TTB8C",
          "parent_asin": "B09J89PTJV",
          "related_products": "B0B6QSRK3R, B09QGP1SXF, B09QGML9XB, B09QGNB6X8",
          "sponsor_products": "true",
          "title": "Swiss Dot Lantern Sleeve DressV Neck Chiffon Pleated Dress",
          "public_name": "qiruil",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "qiruil",
          "video_image_id": "81qGFqrN0WL",
          "video_image_url": "https://m.media-amazon.com/images/I/81qGFqrN0WL._CR0,0,970,512_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/81qGFqrN0WL.jpg",
          "video_image_width": "970",
          "video_image_height": "600",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/3311565a-8bf5-49a2-84af-9f5508dde523/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/01115039-71f1-4870-bee6-101194f24474/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:37",
          "type": "videos_for_related_products"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 30,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Monday, October 3",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Thursday, September 29",
            "name": "Or fastest delivery Thursday, September 29. Order within 23 hrs 57 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Adibosy",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A2I327S67O7GT2&asin=B09J7TTB8C&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A2I327S67O7GT2"
          }
        },
        "price": {
          "symbol": "$",
          "value": 42.99,
          "currency": "USD",
          "raw": "$42.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 12143,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Dresses",
          "rank": 749,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1045024/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 12143, Category: Women's Dresses | Rank: 749"
    }
  };

  let result = await isModleAboveTheKnee(payload);
  expect(result).toBe(true);
});

it("above-the-knee-example-3-working", async () => {
//https://www.amazon.com/dp/B09NBWCWZ6/ref=sspa_dk_detail_4?psc=1&pd_rd_i=B09NBWCWZ6&pd_rd_w=fuWKw&content-id=amzn1.sym.001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_p=001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_r=0GN3R0WTGWVB7NMGGEF5&pd_rd_wg=TrP2x&pd_rd_r=be7027b8-8ad3-4419-b036-539bf766141d&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzNE5QWlRXNE1NQ0VBJmVuY3J5cHRlZElkPUEwODE2Nzk0M0IyVkxCWUNHRzBRMiZlbmNyeXB0ZWRBZElkPUEwMzQ4MTQyM1cwVzBFMFdXREFGWSZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 557,
      "overage_used": 57,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/dp/B09NBWCWZ6/ref=sspa_dk_detail_4?psc=1&pd_rd_i=B09NBWCWZ6&pd_rd_w=fuWKw&content-id=amzn1.sym.001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_p=001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_r=0GN3R0WTGWVB7NMGGEF5&pd_rd_wg=TrP2x&pd_rd_r=be7027b8-8ad3-4419-b036-539bf766141d&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzNE5QWlRXNE1NQ0VBJmVuY3J5cHRlZElkPUEwODE2Nzk0M0IyVkxCWUNHRzBRMiZlbmNyeXB0ZWRBZElkPUEwMzQ4MTQyM1cwVzBFMFdXREFGWSZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU="
    },
    "product": {
      "title": "FAMITION Women's Dress Long Sleeve Mini Dresses Swiss Dot Dress Chiffon Babydoll Short Dress Small 060-black",
      "title_excluding_variant_name": "FAMITION Women's Dress Long Sleeve Mini Dresses Swiss Dot Dress Chiffon Babydoll Short Dress",
      "keywords": "FAMITION,Women's,Dress,Long,Sleeve,Mini,Dresses,Swiss,Dot,Dress,Chiffon,Babydoll,Short,Dress",
      "keywords_list": [
        "FAMITION",
        "Women's",
        "Dress",
        "Long",
        "Sleeve",
        "Mini",
        "Dresses",
        "Swiss",
        "Dress",
        "Chiffon",
        "Babydoll",
        "Short",
        "Dress"
      ],
      "asin": "B09NBWCWZ6",
      "link": "https://www.amazon.com/dp/B09NBWCWZ6??th=1&psc=1",
      "brand": "FAMITION",
      "has_size_guide": true,
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
          "name": "Dresses",
          "link": "https://www.amazon.com/Dresses/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045024",
          "category_id": "1045024"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Dresses",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": false,
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/39fa85d7-cca3-4066-b477-c11da506853b.__CR40,0,600,180_PT0_SX600_V1___.png"
      },
      "sub_title": {
        "text": "Visit the FAMITION Store",
        "link": "https://www.amazon.com/stores/FAMITION/page/74288F15-9827-44A5-862A-3A2F903F8B7B?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "has_coupon": true,
      "coupon_text": "Save an extra 10% when you apply this coupon",
      "rating": 4.2,
      "ratings_total": 3,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/61aon1szfdL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/61aon1szfdL._AC_UL1500_.jpg",
          "variant": "MAIN"
        }
      ],
      "images_count": 1,
      "videos": [
        {
          "duration_seconds": 29,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/4240e057-e6ba-4803-915a-1f81d97acc36/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/51yUkiDtnaL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "FAMITION Women's Swiss Dots Mini Dress DRE060"
        }
      ],
      "videos_count": 1,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/4240e057-e6ba-4803-915a-1f81d97acc36/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.0c7311fea25047ae93b0fb88aea6b320",
          "product_asin": "B09NBWCWZ6",
          "parent_asin": "B09NBWQ5DW",
          "related_products": "B09NBW6TV3, B09NBWRVTZ, B09NBVX3PT, B09NBVXPC7",
          "sponsor_products": "true",
          "title": "FAMITION Women's Swiss Dots Mini Dress DRE060",
          "public_name": "MOBRETOM",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "MOBRETOM",
          "video_image_id": "51yUkiDtnaL",
          "video_image_url": "https://m.media-amazon.com/images/I/51yUkiDtnaL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51yUkiDtnaL.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/4240e057-e6ba-4803-915a-1f81d97acc36/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/1cb7af09-5a90-4124-aa59-bbf18fffc94d/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:29",
          "type": "videos_for_this_product"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 22,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Mon, Oct 3",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Thu, Sep 29",
            "name": "Or fastest delivery Thu, Sep 29. Order within 23 hrs 41 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "MOBRETOM",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=AHFDTZ5KKIM0Q&asin=B09NBWCWZ6&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "AHFDTZ5KKIM0Q"
          }
        },
        "price": {
          "symbol": "$",
          "value": 31.98,
          "currency": "USD",
          "raw": "$31.98"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 180843,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Dresses",
          "rank": 7119,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1045024/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 180843, Category: Women's Dresses | Rank: 7119"
    }
  };

  let result = await isModleAboveTheKnee(payload);
  expect(result).toBe(true);
});

it("above-the-knee-example-4-working", async () => {
//https://www.amazon.com/dp/B0B4V6SM55/ref=sspa_dk_detail_1?psc=1&pd_rd_i=B0B4V6SM55&pd_rd_w=WG4Gj&content-id=amzn1.sym.001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_p=001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_r=EJW5RZ6AXS6DAR2BEDRM&pd_rd_wg=NkLmd&pd_rd_r=bd3411f2-2c59-4e73-8642-efab8a747525&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExWlk5QzBHV0c2TzkmZW5jcnlwdGVkSWQ9QTAyODA1ODcxNlZXS1pJUERSVDNFJmVuY3J5cHRlZEFkSWQ9QTAwNzA2MzQ4VUVZUTZESkNYQVEmd2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWMmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 566,
      "overage_used": 66,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/dp/B0B4V6SM55/ref=sspa_dk_detail_1?psc=1&pd_rd_i=B0B4V6SM55&pd_rd_w=WG4Gj&content-id=amzn1.sym.001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_p=001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_r=EJW5RZ6AXS6DAR2BEDRM&pd_rd_wg=NkLmd&pd_rd_r=bd3411f2-2c59-4e73-8642-efab8a747525&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExWlk5QzBHV0c2TzkmZW5jcnlwdGVkSWQ9QTAyODA1ODcxNlZXS1pJUERSVDNFJmVuY3J5cHRlZEFkSWQ9QTAwNzA2MzQ4VUVZUTZESkNYQVEmd2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWMmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl"
    },
    "product": {
      "title": "Saloogoe Sweater Dress for Women Knee Length with Pockets Long Sleeve Fall Dresses 2022 00-brown Small",
      "title_excluding_variant_name": "Saloogoe Sweater Dress for Women Knee Length with Pockets Long Sleeve Fall Dresses 2022",
      "keywords": "Saloogoe,Sweater,Dress,for,Women,Knee,Length,with,Pockets,Long,Sleeve,Fall,Dresses,2022",
      "keywords_list": [
        "Saloogoe",
        "Sweater",
        "Dress",
        "Women",
        "Knee",
        "Length",
        "with",
        "Pockets",
        "Long",
        "Sleeve",
        "Fall",
        "Dresses",
        "2022"
      ],
      "asin": "B0B4V6SM55",
      "link": "https://www.amazon.com/dp/B0B4V6SM55??th=1&psc=1",
      "brand": "Saloogoe",
      "has_size_guide": true,
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
          "name": "Dresses",
          "link": "https://www.amazon.com/Dresses/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045024",
          "category_id": "1045024"
        },
        {
          "name": "Casual",
          "link": "https://www.amazon.com/Casual-Dresses/b/ref=dp_bc_aui_C_5?ie=UTF8&node=2346727011",
          "category_id": "2346727011"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Dresses > Casual",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "brand_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/f3124841-f7cb-4639-beb4-7d405d22f761.__CR0,0,315,145_PT0_SX315_V1___.jpg",
          "title": "Saloogoe-Sweater Dress for Women Fashion Fall Dresss 2022 Saloogoe-Model show Saloogoe-Fall and Winter Dress for Women Soft and Comfy Suit for Any Occasions Product and Fabric Details Softness and stretch fabric Saloogoe-Size Chart Please allow 0.4-0.8 inch differ due to manual measurement, thanks for your understanding in advance",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/808f80d8-dee4-4525-a367-d217ed767aa1.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
          "description": "The team behind it has more than ten years of clothing experience. We have an independent product development and technical team to ensure the originality of our styles and the control of the product version. Choose the most comfortable fabric for each product And maintain the stability of the products, making them a classic. we strictly inspect the quality to ensure that every product delivered to the buyer is satisfied",
          "brand_store": {
            "link": "/stores/page/50F6AD1F-09ED-4EF0-B9AF-C7CD12F20D54",
            "id": "50F6AD1F-09ED-4EF0-B9AF-C7CD12F20D54"
          },
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/808f80d8-dee4-4525-a367-d217ed767aa1.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/fb0837fc-7284-46d1-8545-724042c4fef8.__CR0,0,362,453_PT0_SX362_V1___.jpg"
          ],
          "products": [
            {
              "title": "sweater dress for women",
              "asin": "B0B4V8D6G7",
              "link": "/dp/B0B4V8D6G7/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/7e392540-c6e2-453c-9c30-598008c6cd0e.__AC_SR166,182___.jpg"
            },
            {
              "title": "sweater dress for women",
              "asin": "B0B4V3VXN5",
              "link": "/dp/B0B4V3VXN5/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/87399cc6-0313-491d-92f2-3fad268b160f.__AC_SR166,182___.jpg"
            },
            {
              "title": "sweater dress for women",
              "asin": "B0B4VL5NWW",
              "link": "/dp/B0B4VL5NWW/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/28de171d-ffe9-4464-88d2-c273fd2fb4c9.__AC_SR166,182___.jpg"
            },
            {
              "title": "sweater dress for women",
              "asin": "B0B4VGMR6Q",
              "link": "/dp/B0B4VGMR6Q/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/dd1524c0-3d2c-4470-a19a-6095b4c654e0.__AC_SR166,182___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/f3124841-f7cb-4639-beb4-7d405d22f761.__CR0,0,315,145_PT0_SX315_V1___.jpg",
        "company_description_text": "The team behind it has more than ten years of clothing experience. We have an independent product development and technical team to ensure the originality of our styles and the control of the product version. Choose the most comfortable fabric for each product And maintain the stability of the products, making them a classic. we strictly inspect the quality to ensure that every product delivered to the buyer is satisfied"
      },
      "sub_title": {
        "text": "Visit the Saloogoe Store",
        "link": "https://www.amazon.com/stores/Saloogoe/page/50F6AD1F-09ED-4EF0-B9AF-C7CD12F20D54?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "has_coupon": true,
      "coupon_text": "Save an extra 20% when you apply this coupon",
      "rating": 4.6,
      "ratings_total": 11,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/81jlB5EVz2L.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/81jlB5EVz2L._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71xRC99UazL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71jxxlq75YL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71vJ0q+Uw-L._AC_UL1500_.jpg",
          "variant": "PT03"
        }
      ],
      "images_count": 4,
      "videos": [
        {
          "duration_seconds": 25,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/1431e768-d460-4f67-a656-c4d918ee8a85/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/A1oCcr6AbeL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Saloogoe-Casual dress for women 2022-5.00''-95Ibs"
        },
        {
          "duration_seconds": 29,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/41bcfa3e-ec63-4b56-bd6b-1cfe47121db1/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/71YwGtK7KcL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Saloogoe-Fall dresses for women 2022 casual sweater dress"
        }
      ],
      "videos_count": 2,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/1431e768-d460-4f67-a656-c4d918ee8a85/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/41bcfa3e-ec63-4b56-bd6b-1cfe47121db1/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.061458c59173472eabeb3308abe174f1",
          "product_asin": "B0B4V6SM55",
          "parent_asin": "B0B4VFVM2Q",
          "related_products": "B0B4VGYRWJ, B0B4V8D6G7, B0B4VCWWL2, B0B4TWSTL1, B0B4V11DWL",
          "sponsor_products": "true",
          "title": "Saloogoe-Casual dress for women 2022-5.00''-95Ibs",
          "public_name": "Saloogoe",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Saloogoe",
          "video_image_id": "A1oCcr6AbeL",
          "video_image_url": "https://m.media-amazon.com/images/I/A1oCcr6AbeL._CR0,0,1920,1013_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/A1oCcr6AbeL.jpg",
          "video_image_width": "1920",
          "video_image_height": "1080",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/1431e768-d460-4f67-a656-c4d918ee8a85/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/679b99d4-aef1-4d56-88b7-bf7928fd30ac/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:25",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/1f736404-89a6-44f7-b7b1-8965d1787334.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.08da4138d3ee49c3850e4eb1b767a08f",
          "product_asin": "B0B4V6SM55",
          "parent_asin": "B0B4VFVM2Q",
          "related_products": "B0B56GCQR1, B0B211PPXQ, B0B4VGYRWJ, B0B4TWSTL1, B0B4V8D6G7",
          "sponsor_products": "true",
          "title": "Saloogoe-Fall dresses for women 2022 casual sweater dress",
          "public_name": "Saloogoe",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Saloogoe",
          "video_image_id": "71YwGtK7KcL",
          "video_image_url": "https://m.media-amazon.com/images/I/71YwGtK7KcL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/71YwGtK7KcL.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/41bcfa3e-ec63-4b56-bd6b-1cfe47121db1/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/102b6435-dc84-44c2-adc6-9d75ba5aa203/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:29",
          "type": "videos_for_this_product"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 19,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Monday, October 3",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Thursday, September 29",
            "name": "Or fastest delivery Thursday, September 29. Order within 23 hrs 29 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Saloogoe",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A1HOHCHFP9W3W5&asin=B0B4V6SM55&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A1HOHCHFP9W3W5"
          }
        },
        "price": {
          "symbol": "$",
          "value": 29.99,
          "currency": "USD",
          "raw": "$29.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Our Brands",
          "rank": 3116,
          "link": "https://www.amazon.com/gp/bestsellers/private-brands/ref=pd_zg_ts_private-brands"
        },
        {
          "category": "Women's Casual Dresses",
          "rank": 356,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/2346727011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Our Brands | Rank: 3116, Category: Women's Casual Dresses | Rank: 356"
    }
  };

  let result = await isModleAboveTheKnee(payload);
  expect(result).toBe(true);
});

it("not-above-the-knee-example-2", async () => {
//https://www.amazon.com/dp/B09ZD4RBKN/ref=sspa_dk_detail_2?psc=1&pd_rd_i=B09ZD4RBKN&pd_rd_w=uc2ar&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=N0XA0FCWJV3S54KV5JRM&pd_rd_wg=UnPBC&pd_rd_r=4af6240c-66ee-4152-bcb6-3a2e24dee40f&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExVjZQMVdTWVhRSVc5JmVuY3J5cHRlZElkPUEwMjM0NjYwMU9GMFJWOEc5UjVLNCZlbmNyeXB0ZWRBZElkPUEwMDcxMTMwMVpEVTk0MDhaNUo3QSZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 473,
      "credits_used_this_request": 1,
      "credits_remaining": 27,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/dp/B09ZD4RBKN/ref=sspa_dk_detail_2?psc=1&pd_rd_i=B09ZD4RBKN&pd_rd_w=uc2ar&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=N0XA0FCWJV3S54KV5JRM&pd_rd_wg=UnPBC&pd_rd_r=4af6240c-66ee-4152-bcb6-3a2e24dee40f&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExVjZQMVdTWVhRSVc5JmVuY3J5cHRlZElkPUEwMjM0NjYwMU9GMFJWOEc5UjVLNCZlbmNyeXB0ZWRBZElkPUEwMDcxMTMwMVpEVTk0MDhaNUo3QSZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU="
    },
    "product": {
      "title": "Nemidor Womens Plus Size Boho Ditsy Floral Print Casual Layered Flared Maxi Dress with Pocket NEM304 14 Plus Navy Print",
      "title_excluding_variant_name": "Nemidor Womens Plus Size Boho Ditsy Floral Print Casual Layered Flared Maxi Dress with Pocket NEM304",
      "keywords": "Nemidor,Womens,Plus,Size,Boho,Ditsy,Floral,Print,Casual,Layered,Flared,Maxi,Dress,with,Pocket,NEM304",
      "keywords_list": [
        "Nemidor",
        "Womens",
        "Plus",
        "Size",
        "Boho",
        "Ditsy",
        "Floral",
        "Print",
        "Casual",
        "Layered",
        "Flared",
        "Maxi",
        "Dress",
        "with",
        "Pocket",
        "NEM304"
      ],
      "asin": "B09ZD4RBKN",
      "link": "https://www.amazon.com/dp/B09ZD4RBKN??th=1&psc=1",
      "brand": "Nemidor",
      "has_size_guide": true,
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
          "name": "Dresses",
          "link": "https://www.amazon.com/Dresses/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045024",
          "category_id": "1045024"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Dresses",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "brand_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/be9509ac-2972-42e8-9c6b-12701dca3edd.__CR104,0,391,180_PT0_SX315_V1___.jpg",
          "title": "Nemidor Womens Plus Size Bohemian Ditsy Floral Print Casual Layered Flared Summer Maxi Dress Nemidor Womens Plus Size Bohemian Ditsy Floral Print Layered Flared Maxi Dress Buyers Show Nemidor Womens Plus Size Boho Ditsy Floral Print Casual Layered Flared Maxi Dress with Pocket Womens Plus Size Bohemian Ditsy Floral Print Layered Flared Maxi Dress Size Chart",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/1f58a9b9-a137-4177-b294-5315078354b2.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
          "description": "",
          "brand_store": {
            "link": "/stores/page/84D8FE04-7448-46AF-9FB2-E5DAA8E2DF93",
            "id": "84D8FE04-7448-46AF-9FB2-E5DAA8E2DF93"
          },
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/1f58a9b9-a137-4177-b294-5315078354b2.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/d56905f4-f3c6-402b-90da-0046fa9e57ef.__CR0,0,362,453_PT0_SX362_V1___.jpg"
          ],
          "products": [
            {
              "title": "Nemidor Womens Plus Size Boho Print V Neck High Low Flowy Midi Wrap Dress with Pockets NEM305",
              "asin": "B09ZDZJS2T",
              "link": "/dp/B09ZDZJS2T/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51%2BnF1ssUiL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Casual Plus Size Summer Boho Floral Print Swing Midi Dress with Pockets NEM306",
              "asin": "B09ZHR6VX5",
              "link": "/dp/B09ZHR6VX5/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41kgbryncsL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Drop Shoulder Plus Size Casual Summer Boho Chiffon Print Skater Dress NEM311",
              "asin": "B0B3DP2HLL",
              "link": "/dp/B0B3DP2HLL/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51zaz60LgGL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Casual Plus Size Tie Waist Slit Long Maxi Dress with Pockets NEM313",
              "asin": "B0B2PK4H4C",
              "link": "/dp/B0B2PK4H4C/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41OxTBs1KbL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Plus Size Deep V Neck Ruched Bodycon Party Wrap Dress with Slit NEM309",
              "asin": "B0B41M98P7",
              "link": "/dp/B0B41M98P7/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/419o-QvSQvL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Plus Size Ruched Pleated Bodycon Midi Casual Party Wrap Dress with Slit NEM307",
              "asin": "B0B2PGXGQ7",
              "link": "/dp/B0B2PGXGQ7/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31j6XFq1gML.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Plus Size Ruched Wrap Dress Pleated Bodycon Midi Casual Party Work Dress NEM303",
              "asin": "B09YC9HLHC",
              "link": "/dp/B09YC9HLHC/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41YXyDbVV6L.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Short Sleeve Plus Size Dress Casual Midi Swing Dress with Pockets NEM301",
              "asin": "B09Y1WL7NV",
              "link": "/dp/B09Y1WL7NV/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31CTqiecSBL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Plus Size Casual V Neck Short Sleeve A-line Slit Midi Dress with Pocket NEM302",
              "asin": "B09Y1ZGFX5",
              "link": "/dp/B09Y1ZGFX5/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31vQQzCYU5L.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Plus Size Boho Ditsy Floral Print Casual Layered Flared Maxi Dress with Pocket NEM304",
              "asin": "B09YNQYJQ5",
              "link": "/dp/B09YNQYJQ5/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51lDKkraQuL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Drop Shoulder Plus Size Casual Summer Boho Chiffon Print Skater Dress NEM311",
              "asin": "B0B3DR5FJ3",
              "link": "/dp/B0B3DR5FJ3/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51WJPgOB1AL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Casual Plus Size Tie Waist Slit Long Maxi Dress with Pockets NEM313",
              "asin": "B0B2PMPPWH",
              "link": "/dp/B0B2PMPPWH/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/3172SAXh0QL.__AC_SR166,182___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/be9509ac-2972-42e8-9c6b-12701dca3edd.__CR0,0,600,180_PT0_SX600_V1___.jpg"
      },
      "sub_title": {
        "text": "Visit the Nemidor Store",
        "link": "https://www.amazon.com/stores/Nemidor/page/84D8FE04-7448-46AF-9FB2-E5DAA8E2DF93?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "has_coupon": true,
      "coupon_text": "Save an extra 6% when you apply this coupon",
      "rating": 4.4,
      "ratings_total": 279,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/71Ed-RwassL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/71Ed-RwassL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81MMpd9m4vL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/815evAx-NqL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81QwN9gYAaL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81FaE2jpPmL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81Bx9NwU1sL._AC_UL1500_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "videos": [
        {
          "duration_seconds": 30,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/338efe78-d98b-4dfd-940a-c21df3b91ddf/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/91XndLFmkIL.SX522_.png",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Nemidor Womens Plus Size Boho Print Layered Flared Maxi Dress NEM304"
        }
      ],
      "videos_count": 1,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/338efe78-d98b-4dfd-940a-c21df3b91ddf/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.0d2ae07cce894d1c9568a9437c27f130",
          "product_asin": "B09ZD4RBKN",
          "parent_asin": "B09YNQRQ8T",
          "related_products": "B09YNR6N7D, B09YNR8D38, B09YNS2GR9, B09YNRBJ31, B09YNQYJQ5",
          "sponsor_products": "true",
          "title": "Nemidor Womens Plus Size Boho Print Layered Flared Maxi Dress NEM304",
          "public_name": "Venus Lu",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Venus Lu",
          "video_image_id": "91XndLFmkIL",
          "video_image_url": "https://m.media-amazon.com/images/I/91XndLFmkIL._CR0,0,1045,551_SR580,306_.png",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/91XndLFmkIL.png",
          "video_image_width": "1045",
          "video_image_height": "851",
          "video_image_extension": "png",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/338efe78-d98b-4dfd-940a-c21df3b91ddf/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/48a0eeee-2450-4703-847f-a3e434445c59/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:30",
          "type": "videos_for_this_product"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 9,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Sun, Oct 2",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Wed, Sep 28",
            "name": "Or fastest delivery Wed, Sep 28. Order within 15 hrs 56 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Venus Lu",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A2R297Y25OPCBS&asin=B09ZD4RBKN&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A2R297Y25OPCBS"
          }
        },
        "price": {
          "symbol": "$",
          "value": 29.99,
          "currency": "USD",
          "raw": "$29.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 15954,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Dresses",
          "rank": 938,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1045024/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 15954, Category: Women's Dresses | Rank: 938"
    }
  };

  let result = await isModleAboveTheKnee(payload);
  expect(result).toBe(false);
});

it("not-above-the-knee-example-3", async () => {
  //https://www.amazon.com/dp/B08LZKRNNQ/ref=sspa_dk_detail_3?psc=1&pd_rd_i=B08LZKRNNQ&pd_rd_w=ZUNN1&content-id=amzn1.sym.4d0fffec-3aba-4480-8fad-c6bd8f7f6b41&pf_rd_p=4d0fffec-3aba-4480-8fad-c6bd8f7f6b41&pf_rd_r=6H44AKQN4YYZMMEXGFQA&pd_rd_wg=mHUD3&pd_rd_r=3a243ac5-fe4c-44e7-9178-f2456da9c691&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzOFRFVUtJTUoxRkgyJmVuY3J5cHRlZElkPUEwODQ5OTA1M0dYVEJHQUxVR1U4WSZlbmNyeXB0ZWRBZElkPUEwMzQ2MzU0MkIzRlVOU1Y4Q0lPMCZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 474,
      "credits_used_this_request": 1,
      "credits_remaining": 26,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/dp/B08LZKRNNQ/ref=sspa_dk_detail_3?psc=1&pd_rd_i=B08LZKRNNQ&pd_rd_w=ZUNN1&content-id=amzn1.sym.4d0fffec-3aba-4480-8fad-c6bd8f7f6b41&pf_rd_p=4d0fffec-3aba-4480-8fad-c6bd8f7f6b41&pf_rd_r=6H44AKQN4YYZMMEXGFQA&pd_rd_wg=mHUD3&pd_rd_r=3a243ac5-fe4c-44e7-9178-f2456da9c691&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzOFRFVUtJTUoxRkgyJmVuY3J5cHRlZElkPUEwODQ5OTA1M0dYVEJHQUxVR1U4WSZlbmNyeXB0ZWRBZElkPUEwMzQ2MzU0MkIzRlVOU1Y4Q0lPMCZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU="
    },
    "product": {
      "title": "Nemidor Women's Short Sleeve V-Neck Plus Size Wrap Dress Casual Ruffle Swing Dress NEM233 14 Plus Wine Red",
      "title_excluding_variant_name": "Nemidor Women's Short Sleeve V-Neck Plus Size Wrap Dress Casual Ruffle Swing Dress NEM233",
      "keywords": "Nemidor,Women's,Short,Sleeve,V-Neck,Plus,Size,Wrap,Dress,Casual,Ruffle,Swing,Dress,NEM233",
      "keywords_list": [
        "Nemidor",
        "Women's",
        "Short",
        "Sleeve",
        "V-Neck",
        "Plus",
        "Size",
        "Wrap",
        "Dress",
        "Casual",
        "Ruffle",
        "Swing",
        "Dress",
        "NEM233"
      ],
      "asin": "B08LZKRNNQ",
      "link": "https://www.amazon.com/dp/B08LZKRNNQ??th=1&psc=1",
      "brand": "Nemidor",
      "has_size_guide": true,
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
          "name": "Dresses",
          "link": "https://www.amazon.com/Dresses/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045024",
          "category_id": "1045024"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Dresses",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": false,
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/be9509ac-2972-42e8-9c6b-12701dca3edd.__CR0,0,600,180_PT0_SX600_V1___.jpg"
      },
      "sub_title": {
        "text": "Visit the Nemidor Store",
        "link": "https://www.amazon.com/stores/Nemidor/page/84D8FE04-7448-46AF-9FB2-E5DAA8E2DF93?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "has_coupon": true,
      "coupon_text": "Save an extra 6% when you apply this coupon",
      "rating": 4,
      "ratings_total": 718,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/61f20-FiHqL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/61f20-FiHqL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51Ef8J8IWGL._AC_UL1500_.jpg",
          "variant": "PT01"
        }
      ],
      "images_count": 2,
      "videos": [
        {
          "duration_seconds": 30,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/87b6be27-e5a5-4ed8-b6be-fbf00f64ee95/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/91L78Y-OpPL.SX522_.png",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": " Nemidor Women's Short Sleeve V-Neck Plus Size Wrap Dress Casual Ruffle Swing Dress"
        }
      ],
      "videos_count": 1,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/87b6be27-e5a5-4ed8-b6be-fbf00f64ee95/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.fd76aaa12c4d4a8abda7a6d17f3a963e",
          "product_asin": "B08LZKRNNQ",
          "parent_asin": "B0853ZSJGT",
          "related_products": "B08543RBQJ, B0854HXR23, B0854DVB7D, B0854G3J4C, B08543Q2Y4",
          "sponsor_products": "true",
          "title": " Nemidor Women's Short Sleeve V-Neck Plus Size Wrap Dress Casual Ruffle Swing Dress",
          "public_name": "Venus Lu",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Venus Lu",
          "video_image_id": "91L78Y-OpPL",
          "video_image_url": "https://m.media-amazon.com/images/I/91L78Y-OpPL._CR0,0,946,499_SR580,306_.png",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/91L78Y-OpPL.png",
          "video_image_width": "946",
          "video_image_height": "648",
          "video_image_extension": "png",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/87b6be27-e5a5-4ed8-b6be-fbf00f64ee95/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/f5e96e68-fced-4ca8-8606-3831f02fc818/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:30",
          "type": "videos_for_this_product"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 4,
          "hard_maximum": true
        },
        "is_prime": true,
        "is_amazon_fresh": false,
        "condition": {
          "is_new": true
        },
        "availability": {
          "type": "in_stock",
          "raw": "Only 4 left in stock - order soon.",
          "dispatch_days": 1,
          "stock_level": 4
        },
        "fulfillment": {
          "type": "2p",
          "standard_delivery": {
            "date": "Sunday, October 2",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Wednesday, September 28",
            "name": "Or fastest delivery Wednesday, September 28. Order within 15 hrs 54 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Venus Lu",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A2R297Y25OPCBS&asin=B08LZKRNNQ&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A2R297Y25OPCBS"
          }
        },
        "price": {
          "symbol": "$",
          "value": 32.99,
          "currency": "USD",
          "raw": "$32.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 152750,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Dresses",
          "rank": 6233,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1045024/ref=pd_zg_hrsr_fashion"
        }
      ],
      "dimensions": "13.39 x 11.02 x 0.59 inches; 12.35 Ounces",
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 152750, Category: Women's Dresses | Rank: 6233"
    }
  };

  let result = await isModleAboveTheKnee(payload);
  expect(result).toBe(false);
});

it("not-above-the-knee-example-4", async () => {
//https://www.amazon.com/dp/B099WM2LVR/ref=sspa_dk_detail_3?psc=1&pd_rd_i=B099WM2LVR&pd_rd_w=AOndc&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=N1C7HAFVFT3APBFFQ1C5&pd_rd_wg=JRKOG&pd_rd_r=e1405184-c2f0-4e7d-bdc3-398b4b2f338a&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEyMTlSREZRS0dZODBDJmVuY3J5cHRlZElkPUEwODg1MzM0MkZKRFA3SlVOSlgxRyZlbmNyeXB0ZWRBZElkPUEwNDQwMjUyMkVFN0MzSUpJN1g2VyZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 506,
      "overage_used": 6,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/dp/B099WM2LVR/ref=sspa_dk_detail_3?psc=1&pd_rd_i=B099WM2LVR&pd_rd_w=AOndc&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=N1C7HAFVFT3APBFFQ1C5&pd_rd_wg=JRKOG&pd_rd_r=e1405184-c2f0-4e7d-bdc3-398b4b2f338a&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEyMTlSREZRS0dZODBDJmVuY3J5cHRlZElkPUEwODg1MzM0MkZKRFA3SlVOSlgxRyZlbmNyeXB0ZWRBZElkPUEwNDQwMjUyMkVFN0MzSUpJN1g2VyZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=\n"
    },
    "product": {
      "title": "Necooer Women's Casual Loose Plain Pleated Long Dress Short Sleeve Midi Dresses Medium A-gray",
      "title_excluding_variant_name": "Necooer Women's Casual Loose Plain Pleated Long Dress Short Sleeve Midi Dresses",
      "keywords": "Necooer,Women's,Casual,Loose,Plain,Pleated,Long,Dress,Short,Sleeve,Midi,Dresses",
      "keywords_list": [
        "Necooer",
        "Women's",
        "Casual",
        "Loose",
        "Plain",
        "Pleated",
        "Long",
        "Dress",
        "Short",
        "Sleeve",
        "Midi",
        "Dresses"
      ],
      "asin": "B099WM2LVR",
      "link": "https://www.amazon.com/dp/B099WM2LVR??th=1&psc=1",
      "brand": "Necooer",
      "has_size_guide": true,
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
          "name": "Dresses",
          "link": "https://www.amazon.com/Dresses/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045024",
          "category_id": "1045024"
        },
        {
          "name": "Casual",
          "link": "https://www.amazon.com/Casual-Dresses/b/ref=dp_bc_aui_C_5?ie=UTF8&node=2346727011",
          "category_id": "2346727011"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Dresses > Casual",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": false,
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/2b86ef7f-bd06-4ecd-803d-307480f4810e.__CR0,0,600,180_PT0_SX600_V1___.jpg"
      },
      "sub_title": {
        "text": "Visit the Necooer Store",
        "link": "https://www.amazon.com/stores/Necooer/page/4C91747E-4A0A-4E7D-B8E4-3C07AE1EFDAA?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4,
      "ratings_total": 2702,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/51LRyPuWEkL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/51LRyPuWEkL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/510eG0JREuL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61GpODU1hyL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61EBT6V77DL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81qajbZUdnL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61qD+wGgOfL._AC_UL1000_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 30,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Sun, Oct 2",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Thu, Sep 29",
            "name": "Or fastest delivery Thu, Sep 29. Order within 14 hrs 54 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Necooer",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A3K24J1V7W4QVT&asin=B099WM2LVR&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A3K24J1V7W4QVT"
          }
        },
        "price": {
          "symbol": "$",
          "value": 32.99,
          "currency": "USD",
          "raw": "$32.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 7476,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Dresses",
          "rank": 494,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1045024/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 7476, Category: Women's Dresses | Rank: 494"
    }
  };

  let result = await isModleBelowTheKnee(payload);
  expect(result).toBe(false);
});

it("not-above-the-knee-example-6", async () => {
  //https://www.amazon.com/dp/B0B2RMHPVB/ref=sspa_dk_detail_4?psc=1&pd_rd_i=B0B2RMHPVB&pd_rd_w=K4wsy&content-id=amzn1.sym.001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_p=001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_r=03W7CYPQMM4TJT833PKA&pd_rd_wg=58Bb5&pd_rd_r=d4af01a5-760b-401a-9b87-ffaca25905ff&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzNkVZVDhRTTJZSDVNJmVuY3J5cHRlZElkPUEwOTIzOTE1MUxQR09QSjlGVlRZRyZlbmNyeXB0ZWRBZElkPUEwNzg3NzY3MVFPSlBNU01XSEZFVyZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 470,
      "credits_used_this_request": 1,
      "credits_remaining": 30,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/dp/B09J8SPT73/ref=sspa_dk_detail_7?psc=1&pd_rd_i=B09J8SPT73&pd_rd_w=uc2ar&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=N0XA0FCWJV3S54KV5JRM&pd_rd_wg=UnPBC&pd_rd_r=4af6240c-66ee-4152-bcb6-3a2e24dee40f&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExVjZQMVdTWVhRSVc5JmVuY3J5cHRlZElkPUEwMjM0NjYwMU9GMFJWOEc5UjVLNCZlbmNyeXB0ZWRBZElkPUEwMTY5MDgwMzJaVDc1UDNKRzkwRyZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU="
    },
    "product": {
      "title": "SHIBEVER Women Casual Dresses V Neck Long Sleeve Twist Front Waist Ribbed Knit Bodycon Slit Dress Cocktail Party Midi Dress 4186-blue Large",
      "title_excluding_variant_name": "SHIBEVER Women Casual Dresses V Neck Long Sleeve Twist Front Waist Ribbed Knit Bodycon Slit Dress Cocktail Party Midi Dress",
      "keywords": "SHIBEVER,Women,Casual,Dresses,V,Neck,Long,Sleeve,Twist,Front,Waist,Ribbed,Knit,Bodycon,Slit,Dress,Cocktail,Party,Midi,Dress",
      "keywords_list": [
        "SHIBEVER",
        "Women",
        "Casual",
        "Dresses",
        "Neck",
        "Long",
        "Sleeve",
        "Twist",
        "Front",
        "Waist",
        "Ribbed",
        "Knit",
        "Bodycon",
        "Slit",
        "Dress",
        "Cocktail",
        "Party",
        "Midi",
        "Dress"
      ],
      "asin": "B09J8SPT73",
      "link": "https://www.amazon.com/dp/B09J8SPT73??th=1&psc=1",
      "brand": "SHIBEVER",
      "has_size_guide": true,
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
          "name": "Dresses",
          "link": "https://www.amazon.com/Dresses/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045024",
          "category_id": "1045024"
        },
        {
          "name": "Casual",
          "link": "https://www.amazon.com/Casual-Dresses/b/ref=dp_bc_aui_C_5?ie=UTF8&node=2346727011",
          "category_id": "2346727011"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Dresses > Casual",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "title": "SHIBEVER Women's Long Sleeve Twist Front Bodycon Midi Dress With Slit SHIBEVER Women's Long Sleeve Midi Dress Twist Front Waist Ribbed Knit Bodycon Dress SHIBEVER Women's Casual Long Sleeve Knit Midi Dress Fall Dress For Women 2022 SHIBEVER Women Fall Dresses Long Sleeve Bodycon Midi Dress with Slit SHIBEVER Womens Bodycon Midi Dresses Long Sleeve Sexy Dresses For Cocktail Party Club Night SHIBEVER Elegant Holiday Party Dresses For Women Solid Color Going Out Dress SHIBEVER Fall Long Sleeve Ribbed Knit Midi Dresses Cocktail Dress For Wedding Guest SHIBEVER Women’s Casual Dressses Long Sleeve Deep V Neck Twist Knot Front Formal Evening Dress SHIBEVER Womens Twist Front Dress Long Sleeve Ribbed Knit Bodycon Dresses SHIBEVER Flattering Dresses For Women Elegant Holiday Party Bodycon Dress",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/40821d00-7862-4350-9174-0ce19de9a7c6.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
          "description": "Features: Elegant ribbed dress with good elastic fits for most figures and become comfort favorite Bodycon dresses for women with side slit and twist design better to shows a female curvy figure Women midi dress with sexy v neck emphasizes your elegant v line Womens casual long sleeve midi dress / Long sleeve midi dress for women / long sleeve twist dress Twist front dress long sleeve for work / twist front midi dress for women / v neck twist front split midi dress Bodycon twist long sleeve dress / midi bodycon dress for women / Womens club & night out dresses Black midi dresses / Winered long sleeve dress for women / Dark khaki bodycon midi dress for women Blue twist front dress dresses / Green midi dress with slit long sleeve slit dress/women midi dress with slit fall long sleeve dress for women/womens midi fall dress long sleeve bodycon dress/long sleeve ribbed bodycon dress front twist midi dress/ribbed knit dress/twist front ribbed knit dress casual long sleve dresses for women /sheath dress for women long sleeve long sleeve midi dress/bodycon midi dress/ribbed midi dress/ribbed bodycon dress long sleeve knit dress/twist front waist dresses/long sleeve twist front waist dress long sleeve cocktail dress for women/long sleve bodycon dress for wedding guest women sexy slit fitted dresses for women/long sleeve casual midi dress women long sleeve dresses/ribbed women long sleeve dress",
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/40821d00-7862-4350-9174-0ce19de9a7c6.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/95fd4a70-b3eb-4ff4-a1a3-4e97eae68191.__CR0,23,463,579_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/bf354e37-9d09-403f-8bb8-f262733448f5.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/7806cdc4-1794-477c-a384-1482d4e8ff63.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/3f6d3378-a5a3-4dc1-8bd9-392dae47f694.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/9b88ccad-88d9-4112-876d-0dcfbfe65315.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/eb41b90f-9af9-4c60-987a-f586f925e493.__CR0,0,362,453_PT0_SX362_V1___.jpg"
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/8c306920-f867-4e27-aaa2-8173a7cc742a.__CR0,65,900,270_PT0_SX600_V1___.jpg"
      },
      "sub_title": {
        "text": "Visit the SHIBEVER Store",
        "link": "https://www.amazon.com/stores/SHIBEVER/page/853279B8-8F3E-471A-BC5A-7BDFE0FC6D57?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "has_coupon": true,
      "coupon_text": "Save an extra 10% when you apply this coupon",
      "rating": 4.2,
      "ratings_total": 562,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/61t8GBaPa2L.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/61t8GBaPa2L._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71cQjeRLITL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/710l5VxfSOL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71i-QvwlLfL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61KdAl4c-sL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71JqyTDAdQL._AC_UL1500_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "videos": [
        {
          "duration_seconds": 23,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/97d65051-c7e8-48d2-9c91-396526bbadf6/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/81U5dAMfiSL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "SHIBEVER Women Fall Dress for Wedding Guest Cocktail Party "
        },
        {
          "duration_seconds": 17,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/f1e3eeee-a38b-4a41-becc-0997b0b55137/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/81Ww5+Byw5L.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "SHIBEVER Bodycon Long Sleeve Dress Black Midi Dress"
        },
        {
          "duration_seconds": 22,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/1aea4506-f59b-4d3e-bc7f-ea85fec9ff5e/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/519r9uyK6UL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "SHIBEVER Women Long Sleeve Twist Front Midi Dress"
        },
        {
          "duration_seconds": 15,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/e0f0b2ff-bc92-4d75-9866-fd6dc2f1c700/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/813JsvcBztL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "SHIBEVER Long Sleeve Bodycon Slit Dress"
        },
        {
          "duration_seconds": 10,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/2c52d2ae-48f9-4428-9cba-d78e9e8cdd59/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/81xV0fIyr6L.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "SHIBEVER Women Long Sleeve Midi Dresses Bodycon Slit Dress"
        },
        {
          "duration_seconds": 8,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/48b60e39-78c1-464b-b8c2-e79a4fe0b69c/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/81zJOHbETpL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "SHIBEVER Long Sleeve Midi Dress Twist Front Waist Dress"
        }
      ],
      "videos_count": 6,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/97d65051-c7e8-48d2-9c91-396526bbadf6/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/f1e3eeee-a38b-4a41-becc-0997b0b55137/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/1aea4506-f59b-4d3e-bc7f-ea85fec9ff5e/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/e0f0b2ff-bc92-4d75-9866-fd6dc2f1c700/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/2c52d2ae-48f9-4428-9cba-d78e9e8cdd59/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/48b60e39-78c1-464b-b8c2-e79a4fe0b69c/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.095885ff73cc48cd93eba3209b2a6c69",
          "product_asin": "B09J8SPT73",
          "parent_asin": "B09DSN59NH",
          "related_products": "B09DSRC6Z4, B09DSR28JN, B09DSQQT41, B09DSQRS2M",
          "sponsor_products": "true",
          "title": "SHIBEVER Long Sleeve Midi Dress Twist Front Waist Dress",
          "public_name": "Hantions",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Hantions",
          "video_image_id": "81zJOHbETpL",
          "video_image_url": "https://m.media-amazon.com/images/I/81zJOHbETpL._CR0,0,970,512_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/81zJOHbETpL.jpg",
          "video_image_width": "970",
          "video_image_height": "600",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/48b60e39-78c1-464b-b8c2-e79a4fe0b69c/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/25991757-98d8-489d-b29e-03c9070d5f9c/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:08",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0e87cb5314154cd796b2c8dcaaf17aa9",
          "product_asin": "B09J8SPT73",
          "parent_asin": "B09DSN59NH",
          "related_products": "B0B397FZ48, B0B3986539, B0B395696L, B0B395BY93",
          "sponsor_products": "true",
          "title": "SHIBEVER Bodycon Long Sleeve Dress Black Midi Dress",
          "public_name": "Hantions",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Hantions",
          "video_image_id": "81Ww5+Byw5L",
          "video_image_url": "https://m.media-amazon.com/images/I/81Ww5+Byw5L._CR0,0,970,512_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/81Ww5+Byw5L.jpg",
          "video_image_width": "970",
          "video_image_height": "600",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/f1e3eeee-a38b-4a41-becc-0997b0b55137/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/02ecaeed-eedd-4136-9613-a7a6adf77809/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:17",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.04eadc341711409ab67750f07d5e2d74",
          "product_asin": "B09J8SPT73",
          "parent_asin": "B09DSN59NH",
          "related_products": "B09J8SX4FY, B09J8RZKDK, B0B397FZ48, B0B399G3TZ, B09J8THQCJ",
          "sponsor_products": "true",
          "title": "SHIBEVER Women Long Sleeve Midi Dresses Bodycon Slit Dress",
          "public_name": "Hantions",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Hantions",
          "video_image_id": "81xV0fIyr6L",
          "video_image_url": "https://m.media-amazon.com/images/I/81xV0fIyr6L._CR0,0,970,512_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/81xV0fIyr6L.jpg",
          "video_image_width": "970",
          "video_image_height": "600",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/2c52d2ae-48f9-4428-9cba-d78e9e8cdd59/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/d11d00e0-2a6a-4372-a2d6-d3e2a7272891/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:10",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0237015dfc7049fdb7814be819289b9a",
          "product_asin": "B09J8SPT73",
          "parent_asin": "B09DSN59NH",
          "related_products": "B09DSRC6Z4, B09DSR28JN, B09DSRVPJY, B09DSQM37D",
          "sponsor_products": "true",
          "title": "SHIBEVER Women Fall Dress for Wedding Guest Cocktail Party ",
          "public_name": "Hantions",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Hantions",
          "video_image_id": "81U5dAMfiSL",
          "video_image_url": "https://m.media-amazon.com/images/I/81U5dAMfiSL._CR0,0,970,512_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/81U5dAMfiSL.jpg",
          "video_image_width": "970",
          "video_image_height": "600",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/97d65051-c7e8-48d2-9c91-396526bbadf6/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/c88b9c1c-f9f5-4c0f-9c63-b440bddbed2e/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:23",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.03ea5adf31704e5eb8a01bfc11ff5893",
          "product_asin": "B09J8SPT73",
          "parent_asin": "B09DSN59NH",
          "related_products": "B09J8SX4FY, B09J8RZKDK, B0B397FZ48, B0B39562XS",
          "sponsor_products": "true",
          "title": "SHIBEVER Women Long Sleeve Twist Front Midi Dress",
          "public_name": "Hantions",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Hantions",
          "video_image_id": "519r9uyK6UL",
          "video_image_url": "https://m.media-amazon.com/images/I/519r9uyK6UL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/519r9uyK6UL.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/1aea4506-f59b-4d3e-bc7f-ea85fec9ff5e/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/4529afbe-d4fa-4f0e-b53b-f336dc2718aa/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:22",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.029d899064794c06998b8d23387f9cbe",
          "product_asin": "B09J8SPT73",
          "parent_asin": "B09DSN59NH",
          "related_products": "B09DSPRW9Q, B09DSQ67D5, B09DSS8QPJ, B09DSR17MK, B09DSRW7M1",
          "sponsor_products": "true",
          "title": "Women Long Sleeve Midi Dress",
          "public_name": "Hantions",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Hantions",
          "video_image_id": "51IAkEvX9gL",
          "video_image_url": "https://m.media-amazon.com/images/I/51IAkEvX9gL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51IAkEvX9gL.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/4ca6c00a-c549-46d1-a152-b8307e1f3af4/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/6cf57ea8-fd18-436a-bb15-2818041d20b3/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:34",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0c59a9bd57fc45eeb441768e3fee57c6",
          "product_asin": "B09J8SPT73",
          "parent_asin": "B09DSN59NH",
          "related_products": "B09DSRW7M1, B09DSRVPJY, B09DSQWDM5, B09DSQM37D, B09DSS2WPZ",
          "sponsor_products": "true",
          "title": "SHIBEVER Twist Front Ribbed Midi Dress with Slit",
          "public_name": "Hantions",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Hantions",
          "video_image_id": "81RccnnnKFL",
          "video_image_url": "https://m.media-amazon.com/images/I/81RccnnnKFL._CR0,0,1280,675_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/81RccnnnKFL.jpg",
          "video_image_width": "1280",
          "video_image_height": "720",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/8d156d96-6902-4dbb-beee-19410ff21a00/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/8655af8a-31c1-49b6-90ee-9fc6e306d3f1/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:32",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.08a6dc54ad31409d86f6e64cb758d0ff",
          "product_asin": "B09J8SPT73",
          "parent_asin": "B09DSN59NH",
          "related_products": "B09DSRC6Z4, B09DSQQT41, B09DSR28JN, B09DSSLNF8",
          "sponsor_products": "true",
          "title": "SHIBEVER Long Sleeve Bodycon Slit Dress",
          "public_name": "Hantions",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Hantions",
          "video_image_id": "813JsvcBztL",
          "video_image_url": "https://m.media-amazon.com/images/I/813JsvcBztL._CR0,0,970,512_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/813JsvcBztL.jpg",
          "video_image_width": "970",
          "video_image_height": "600",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/e0f0b2ff-bc92-4d75-9866-fd6dc2f1c700/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/659e13bf-82b0-4307-a0b0-da7269f6ddc3/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:15",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.00f5d0c909774c678af10236b436ca1e",
          "product_asin": "B09J8SPT73",
          "parent_asin": "B09DSN59NH",
          "related_products": "B09DSRC6Z4, B09DSR28JN, B09DSQQT41, B09DSS2WPZ",
          "sponsor_products": "true",
          "title": "SHIBEVER long sleeve midi dress, twist front dress with slit",
          "public_name": "Hantions",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Hantions",
          "video_image_id": "A1anveWoukL",
          "video_image_url": "https://m.media-amazon.com/images/I/A1anveWoukL._CR0,0,1920,1013_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/A1anveWoukL.jpg",
          "video_image_width": "1920",
          "video_image_height": "1080",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/71718dbc-743a-4c02-b038-de4b7ff2307c/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/0d1d0e8b-fe9a-44dd-bb3f-703ae48a12a2/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:15",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0607dbbe1d284cf289c388c9c434b1b3",
          "product_asin": "B09J8SPT73",
          "parent_asin": "B09DSN59NH",
          "related_products": "B09JS956M9, B09JRKZH3S, B09JS24LXZ, B09JRHTJQQ, B09JS8KHN7",
          "sponsor_products": "true",
          "title": "SHIBEVER Women Long Sleeve Button Down Casual Tunic Dress",
          "public_name": "Amaxuan",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Amaxuan",
          "video_image_id": "51OTmTjg9sL",
          "video_image_url": "https://m.media-amazon.com/images/I/51OTmTjg9sL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51OTmTjg9sL.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/b355c325-edf9-4863-b99f-999e558dde07/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/a45986a0-473a-45bd-bf90-a860352583d4/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:38",
          "type": "videos_for_related_products"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "is_prime": true,
        "is_amazon_fresh": false,
        "condition": {
          "is_new": true
        },
        "availability": {
          "raw": "Usually ships within 6 days.",
          "dispatch_days": 1
        },
        "fulfillment": {
          "type": "2p",
          "standard_delivery": {
            "date": "Sunday, October 2",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Saturday, October 1",
            "name": "Or fastest delivery Saturday, October 1"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Hantions",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A27TVKRSHV3BH5&asin=B09J8SPT73&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A27TVKRSHV3BH5"
          }
        },
        "price": {
          "symbol": "$",
          "value": 37.98,
          "currency": "USD",
          "raw": "$37.98"
        },
        "shipping": {
          "raw": "FREE"
        }
      }
    }
  };

  let result = await isModleBelowTheKnee(payload);
  expect(result).toBe(false);
});

it("above-the-knee-example-7", async () => {
//https://www.amazon.com/dp/B0B3QSFWLG/ref=sspa_dk_detail_0?psc=1&pd_rd_i=B0B3QSFWLG&pd_rd_w=aIjxu&content-id=amzn1.sym.37ad3f81-aeff-4fe7-accb-8665976bb5fc&pf_rd_p=37ad3f81-aeff-4fe7-accb-8665976bb5fc&pf_rd_r=FD7E21CJ3H8AZ7JVT9F0&pd_rd_wg=Imhnf&pd_rd_r=2b85e2f4-879e-40d3-b00c-ed2b9f361c2c&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzVEhJMjI3S1c0SVpFJmVuY3J5cHRlZElkPUEwMzEzMDMwMlpVUVVURVY0SjZWRCZlbmNyeXB0ZWRBZElkPUEwNzIxOTU2MThBWUhNN0lQMFFaNSZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 552,
      "overage_used": 52,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/dp/B0B3QSFWLG/ref=sspa_dk_detail_0?psc=1&pd_rd_i=B0B3QSFWLG&pd_rd_w=aIjxu&content-id=amzn1.sym.37ad3f81-aeff-4fe7-accb-8665976bb5fc&pf_rd_p=37ad3f81-aeff-4fe7-accb-8665976bb5fc&pf_rd_r=FD7E21CJ3H8AZ7JVT9F0&pd_rd_wg=Imhnf&pd_rd_r=2b85e2f4-879e-40d3-b00c-ed2b9f361c2c&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzVEhJMjI3S1c0SVpFJmVuY3J5cHRlZElkPUEwMzEzMDMwMlpVUVVURVY0SjZWRCZlbmNyeXB0ZWRBZElkPUEwNzIxOTU2MThBWUhNN0lQMFFaNSZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU="
    },
    "product": {
      "title": "ETOSELL Women's Dresses V-Neck Mini Dress Long Lantern Sleeve Swing Dress Swiss Dot Shift Dress Casual Beach Dresses Navy Blue Large",
      "title_excluding_variant_name": "ETOSELL Women's Dresses V-Neck Mini Dress Long Lantern Sleeve Swing Dress Swiss Dot Shift Dress Casual Beach Dresses",
      "keywords": "ETOSELL,Women's,Dresses,V-Neck,Mini,Dress,Long,Lantern,Sleeve,Swing,Dress,Swiss,Dot,Shift,Dress,Casual,Beach,Dresses",
      "keywords_list": [
        "ETOSELL",
        "Women's",
        "Dresses",
        "V-Neck",
        "Mini",
        "Dress",
        "Long",
        "Lantern",
        "Sleeve",
        "Swing",
        "Dress",
        "Swiss",
        "Shift",
        "Dress",
        "Casual",
        "Beach",
        "Dresses"
      ],
      "asin": "B0B3QSFWLG",
      "link": "https://www.amazon.com/dp/B0B3QSFWLG??th=1&psc=1",
      "brand": "Etosell",
      "has_size_guide": true,
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
          "name": "Dresses",
          "link": "https://www.amazon.com/Dresses/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045024",
          "category_id": "1045024"
        },
        {
          "name": "Casual",
          "link": "https://www.amazon.com/Casual-Dresses/b/ref=dp_bc_aui_C_5?ie=UTF8&node=2346727011",
          "category_id": "2346727011"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Dresses > Casual",
      "promotions_feature": "10% coupon applied at checkout Terms Clip this coupon to save 10% on this product when you buy from Etosell. Here's how (restrictions apply) \n   Save 7% each on Tunic Dresses for Women offered by Etosell when you purchase 2 or more. Enter code 65UESVQX at checkout. See more products in this promotion \n   Save 8% each on Fall Dresses for Women offered by Etosell when you purchase 3 or more. Enter code 3XHU22IH at checkout. See more products in this promotion \n   Save 9% each on Swimwear Cover Ups for Women offered by Etosell when you purchase 4 or more. Enter code B56TE57E at checkout. See more products in this promotion \n   Save 10% each on Casual Dresses for Women offered by Etosell when you purchase 5 or more. Enter code 3RMCVXK7 at checkout. See more products in this promotion \n   Save 10% on Silk Nightgowns for Women when you purchase 1 or more Casual Loose Dress for Women offered by Etosell. Enter code 5IBF5ICA at checkout. Here's how (restrictions apply) \n   Save 10% on Victorian Nightgowns for Women when you purchase 1 or more Tunic Dress for Women offered by Etosell. Enter code JOVCSVTC at checkout. Here's how (restrictions apply) \n   Save 20% on this item when you purchase 1 or more Long Sleepwear for Women offered by Etosell. Enter code OTAU359M at checkout. Here's how (restrictions apply) \n   Save 20% on this item when you purchase 1 or more Sleeveless Babydoll Dress for Women offered by Etosell. Enter code BYRDH4YG at checkout. Here's how (restrictions apply) \n   Save 20% on this item when you purchase 1 or more Fall Dresses for Women offered by Etosell. Enter code JAP9WYCG at checkout. Here's how (restrictions apply) \n   Save 10% on Swimwear Cover Ups for Women when you purchase 1 or more Fall Dresses for Women offered by Etosell. Enter code 9NRTT2PM at checkout. Here's how (restrictions apply)",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "brand_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/9038db55-ffef-439b-844a-0fbb8c9345d6.__CR35,23,333,153_PT0_SX315_V1___.jpg",
          "title": "ETOSELL Women's Dresses V-Neck Mini Dress Long Lantern Sleeve Swing Dress Swiss Dot Shift Dress Casual Beach Dresses ETOSELL Women Fall Tunic Dress V Neck Casual Loose Flowy Swing Shift Dresses Swimwear Cover Upsfor Ladies ETOSELL Women's Fall Lantern Long Sleeve V Neck Swiss Dot Flowy A Line Smocked Babydoll Short Dress ETOSELL Women's Casual Long Sleeve Swiss Dot V Neck Ruffle A Line Babydoll Mini Dress ETOSELL Women's Dress Long Sleeve V Neck Swiss Dot Mini Dress Ruffle Flowy Loose Fit Casual Tunic Dresses ETOSELL Women‘s Dresses Long Sleeves Short Mini Dress V Neck Flowy Casual Swiss Dot Loose Fit Babydoll Dress",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/da18f183-56db-4876-abb0-9e5768522de0.__CR0,30,1500,640_PT0_SX1464_V1___.jpg",
          "description": "Founded in 2011, ETOSELL is a brand dedicated to providing customers with fashionable design and comfortable wearing experience.",
          "brand_store": {
            "link": "/stores/page/4B1C8577-BA8C-4A6F-B62C-2954747288A5",
            "id": "4B1C8577-BA8C-4A6F-B62C-2954747288A5"
          },
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/da18f183-56db-4876-abb0-9e5768522de0.__CR0,30,1500,640_PT0_SX1464_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/b0ddba80-c345-4c7f-8bfb-b6f9bf6b6085.__CR40,0,719,900_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/97c26a73-3774-44be-86d1-8ff9f14178c8.__CR40,0,719,900_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/969190e7-728f-4ba0-aa84-dc6a170ca2ef.__CR40,0,719,900_PT0_SX362_V1___.jpg"
          ],
          "products": [
            {
              "title": "ETOSELL Women's Dresses V-Neck Mini Dress Long Lantern Sleeve Swing Dress Swiss Dot Shift Dress C...",
              "asin": "B0B3RHMKNY",
              "link": "/dp/B0B3RHMKNY/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/311MJMIrRlL.__AC_SR166,182___.jpg"
            },
            {
              "title": "ETOSELL Women's Dresses V-Neck Mini Dress Long Lantern Sleeve Swing Dress Swiss Dot Shift Dress C...",
              "asin": "B0B3QXH7J3",
              "link": "/dp/B0B3QXH7J3/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31T0BEUoDAL.__AC_SR166,182___.jpg"
            },
            {
              "title": "ETOSELL Women's Dresses V-Neck Mini Dress Long Lantern Sleeve Swing Dress Swiss Dot Shift Dress C...",
              "asin": "B0B3QGFCBG",
              "link": "/dp/B0B3QGFCBG/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31Z9T978tzL.__AC_SR166,182___.jpg"
            },
            {
              "title": "ETOSELL Women's Dresses V-Neck Mini Dress Long Lantern Sleeve Swing Dress Swiss Dot Shift Dress C...",
              "asin": "B0B3QVZ3XP",
              "link": "/dp/B0B3QVZ3XP/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31Z9T978tzL.__AC_SR166,182___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/9038db55-ffef-439b-844a-0fbb8c9345d6.__CR35,23,333,153_PT0_SX315_V1___.jpg",
        "company_description_text": "Founded in 2011, ETOSELL is a brand dedicated to providing customers with fashionable design and comfortable wearing experience.  Positioned in the style of fashion, feminine, classic, modern and simple to pursue that share of comfortable and happiness in life.  As a user-oriented brand, we have researched and tested various kinds of fabric and produced a variety of soft, breathable, and comfortable clothing.  Enjoy life and yourself!"
      },
      "sub_title": {
        "text": "Visit the Etosell Store",
        "link": "https://www.amazon.com/stores/ETOSELL/page/4B1C8577-BA8C-4A6F-B62C-2954747288A5?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "has_coupon": true,
      "coupon_text": "Save an extra 10% when you apply this coupon",
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/618xV2BmOCL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/618xV2BmOCL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/515In-6-lqL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51PqNkQUzDL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51cFT+y12sL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51BsPBxyYyL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/613b1QadRQL._AC_UL1500_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "videos": [
        {
          "duration_seconds": 40,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/3ab6edeb-d328-48bb-bd44-8bfe1f64458b/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/51rY16UkmyL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "ETOSELL Women Dress Casual Fall Long Sleeve Swiss Dot Swing Mini Dress"
        },
        {
          "duration_seconds": 30,
          "width": 418,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/819ec5c2-a5bd-49e7-a561-a1dfb07ff729/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/51hV9GYbC-L.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "ETOSELL Women's Dresses Sweet & Cute Mini Dress Swiss Dot"
        }
      ],
      "videos_count": 2,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/3ab6edeb-d328-48bb-bd44-8bfe1f64458b/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/819ec5c2-a5bd-49e7-a561-a1dfb07ff729/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.0a984908bc504dc6906c74d98f88f112",
          "product_asin": "B0B3QSFWLG",
          "parent_asin": "B0B3MS2VB4",
          "sponsor_products": "true",
          "title": "ETOSELL Women Dress Casual Fall Long Sleeve Swiss Dot Swing Mini Dress",
          "public_name": "Etosell",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Etosell",
          "video_image_id": "51rY16UkmyL",
          "video_image_url": "https://m.media-amazon.com/images/I/51rY16UkmyL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51rY16UkmyL.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/3ab6edeb-d328-48bb-bd44-8bfe1f64458b/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/3f4584d1-4a4b-4496-adbf-69b1af90c6e1/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:40",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.054d9b2cb8b34ef585831ab6d2ae9f84",
          "product_asin": "B0B3QSFWLG",
          "parent_asin": "B0B3MS2VB4",
          "sponsor_products": "true",
          "title": "ETOSELL Women's Dresses Sweet & Cute Mini Dress Swiss Dot",
          "public_name": "Etosell",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Etosell",
          "video_image_id": "51hV9GYbC-L",
          "video_image_url": "https://m.media-amazon.com/images/I/51hV9GYbC-L._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51hV9GYbC-L.jpg",
          "video_image_width": "640",
          "video_image_height": "734",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/819ec5c2-a5bd-49e7-a561-a1dfb07ff729/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/bd50d299-3246-452f-acb7-75a4c26ed05c/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:30",
          "type": "videos_for_this_product"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 19,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Tuesday, October 4",
            "name": "FREE"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Etosell",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A35XH4BLSQO1JR&asin=B0B3QSFWLG&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A35XH4BLSQO1JR"
          }
        },
        "price": {
          "symbol": "$",
          "value": 26.99,
          "currency": "USD",
          "raw": "$26.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 1262394,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Casual Dresses",
          "rank": 9105,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/2346727011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 1262394, Category: Women's Casual Dresses | Rank: 9105"
    }
  };

  let result = await isModleAboveTheKnee(payload);
  expect(result).toBe(true);
});//EXCEPTIONAL LINK

it("above-the-knee-example-7", async () => {
//https://www.amazon.com/dp/B0B3QSFWLG/ref=sspa_dk_detail_0?psc=1&pd_rd_i=B0B3QSFWLG&pd_rd_w=aIjxu&content-id=amzn1.sym.37ad3f81-aeff-4fe7-accb-8665976bb5fc&pf_rd_p=37ad3f81-aeff-4fe7-accb-8665976bb5fc&pf_rd_r=FD7E21CJ3H8AZ7JVT9F0&pd_rd_wg=Imhnf&pd_rd_r=2b85e2f4-879e-40d3-b00c-ed2b9f361c2c&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzVEhJMjI3S1c0SVpFJmVuY3J5cHRlZElkPUEwMzEzMDMwMlpVUVVURVY0SjZWRCZlbmNyeXB0ZWRBZElkPUEwNzIxOTU2MThBWUhNN0lQMFFaNSZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 552,
      "overage_used": 52,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/dp/B0B3QSFWLG/ref=sspa_dk_detail_0?psc=1&pd_rd_i=B0B3QSFWLG&pd_rd_w=aIjxu&content-id=amzn1.sym.37ad3f81-aeff-4fe7-accb-8665976bb5fc&pf_rd_p=37ad3f81-aeff-4fe7-accb-8665976bb5fc&pf_rd_r=FD7E21CJ3H8AZ7JVT9F0&pd_rd_wg=Imhnf&pd_rd_r=2b85e2f4-879e-40d3-b00c-ed2b9f361c2c&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzVEhJMjI3S1c0SVpFJmVuY3J5cHRlZElkPUEwMzEzMDMwMlpVUVVURVY0SjZWRCZlbmNyeXB0ZWRBZElkPUEwNzIxOTU2MThBWUhNN0lQMFFaNSZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU="
    },
    "product": {
      "title": "ETOSELL Women's Dresses V-Neck Mini Dress Long Lantern Sleeve Swing Dress Swiss Dot Shift Dress Casual Beach Dresses Navy Blue Large",
      "title_excluding_variant_name": "ETOSELL Women's Dresses V-Neck Mini Dress Long Lantern Sleeve Swing Dress Swiss Dot Shift Dress Casual Beach Dresses",
      "keywords": "ETOSELL,Women's,Dresses,V-Neck,Mini,Dress,Long,Lantern,Sleeve,Swing,Dress,Swiss,Dot,Shift,Dress,Casual,Beach,Dresses",
      "keywords_list": [
        "ETOSELL",
        "Women's",
        "Dresses",
        "V-Neck",
        "Mini",
        "Dress",
        "Long",
        "Lantern",
        "Sleeve",
        "Swing",
        "Dress",
        "Swiss",
        "Shift",
        "Dress",
        "Casual",
        "Beach",
        "Dresses"
      ],
      "asin": "B0B3QSFWLG",
      "link": "https://www.amazon.com/dp/B0B3QSFWLG??th=1&psc=1",
      "brand": "Etosell",
      "has_size_guide": true,
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
          "name": "Dresses",
          "link": "https://www.amazon.com/Dresses/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045024",
          "category_id": "1045024"
        },
        {
          "name": "Casual",
          "link": "https://www.amazon.com/Casual-Dresses/b/ref=dp_bc_aui_C_5?ie=UTF8&node=2346727011",
          "category_id": "2346727011"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Dresses > Casual",
      "promotions_feature": "10% coupon applied at checkout Terms Clip this coupon to save 10% on this product when you buy from Etosell. Here's how (restrictions apply) \n   Save 7% each on Tunic Dresses for Women offered by Etosell when you purchase 2 or more. Enter code 65UESVQX at checkout. See more products in this promotion \n   Save 8% each on Fall Dresses for Women offered by Etosell when you purchase 3 or more. Enter code 3XHU22IH at checkout. See more products in this promotion \n   Save 9% each on Swimwear Cover Ups for Women offered by Etosell when you purchase 4 or more. Enter code B56TE57E at checkout. See more products in this promotion \n   Save 10% each on Casual Dresses for Women offered by Etosell when you purchase 5 or more. Enter code 3RMCVXK7 at checkout. See more products in this promotion \n   Save 10% on Silk Nightgowns for Women when you purchase 1 or more Casual Loose Dress for Women offered by Etosell. Enter code 5IBF5ICA at checkout. Here's how (restrictions apply) \n   Save 10% on Victorian Nightgowns for Women when you purchase 1 or more Tunic Dress for Women offered by Etosell. Enter code JOVCSVTC at checkout. Here's how (restrictions apply) \n   Save 20% on this item when you purchase 1 or more Long Sleepwear for Women offered by Etosell. Enter code OTAU359M at checkout. Here's how (restrictions apply) \n   Save 20% on this item when you purchase 1 or more Sleeveless Babydoll Dress for Women offered by Etosell. Enter code BYRDH4YG at checkout. Here's how (restrictions apply) \n   Save 20% on this item when you purchase 1 or more Fall Dresses for Women offered by Etosell. Enter code JAP9WYCG at checkout. Here's how (restrictions apply) \n   Save 10% on Swimwear Cover Ups for Women when you purchase 1 or more Fall Dresses for Women offered by Etosell. Enter code 9NRTT2PM at checkout. Here's how (restrictions apply)",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "brand_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/9038db55-ffef-439b-844a-0fbb8c9345d6.__CR35,23,333,153_PT0_SX315_V1___.jpg",
          "title": "ETOSELL Women's Dresses V-Neck Mini Dress Long Lantern Sleeve Swing Dress Swiss Dot Shift Dress Casual Beach Dresses ETOSELL Women Fall Tunic Dress V Neck Casual Loose Flowy Swing Shift Dresses Swimwear Cover Upsfor Ladies ETOSELL Women's Fall Lantern Long Sleeve V Neck Swiss Dot Flowy A Line Smocked Babydoll Short Dress ETOSELL Women's Casual Long Sleeve Swiss Dot V Neck Ruffle A Line Babydoll Mini Dress ETOSELL Women's Dress Long Sleeve V Neck Swiss Dot Mini Dress Ruffle Flowy Loose Fit Casual Tunic Dresses ETOSELL Women‘s Dresses Long Sleeves Short Mini Dress V Neck Flowy Casual Swiss Dot Loose Fit Babydoll Dress",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/da18f183-56db-4876-abb0-9e5768522de0.__CR0,30,1500,640_PT0_SX1464_V1___.jpg",
          "description": "Founded in 2011, ETOSELL is a brand dedicated to providing customers with fashionable design and comfortable wearing experience.",
          "brand_store": {
            "link": "/stores/page/4B1C8577-BA8C-4A6F-B62C-2954747288A5",
            "id": "4B1C8577-BA8C-4A6F-B62C-2954747288A5"
          },
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/da18f183-56db-4876-abb0-9e5768522de0.__CR0,30,1500,640_PT0_SX1464_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/b0ddba80-c345-4c7f-8bfb-b6f9bf6b6085.__CR40,0,719,900_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/97c26a73-3774-44be-86d1-8ff9f14178c8.__CR40,0,719,900_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/969190e7-728f-4ba0-aa84-dc6a170ca2ef.__CR40,0,719,900_PT0_SX362_V1___.jpg"
          ],
          "products": [
            {
              "title": "ETOSELL Women's Dresses V-Neck Mini Dress Long Lantern Sleeve Swing Dress Swiss Dot Shift Dress C...",
              "asin": "B0B3RHMKNY",
              "link": "/dp/B0B3RHMKNY/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/311MJMIrRlL.__AC_SR166,182___.jpg"
            },
            {
              "title": "ETOSELL Women's Dresses V-Neck Mini Dress Long Lantern Sleeve Swing Dress Swiss Dot Shift Dress C...",
              "asin": "B0B3QXH7J3",
              "link": "/dp/B0B3QXH7J3/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31T0BEUoDAL.__AC_SR166,182___.jpg"
            },
            {
              "title": "ETOSELL Women's Dresses V-Neck Mini Dress Long Lantern Sleeve Swing Dress Swiss Dot Shift Dress C...",
              "asin": "B0B3QGFCBG",
              "link": "/dp/B0B3QGFCBG/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31Z9T978tzL.__AC_SR166,182___.jpg"
            },
            {
              "title": "ETOSELL Women's Dresses V-Neck Mini Dress Long Lantern Sleeve Swing Dress Swiss Dot Shift Dress C...",
              "asin": "B0B3QVZ3XP",
              "link": "/dp/B0B3QVZ3XP/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31Z9T978tzL.__AC_SR166,182___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/9038db55-ffef-439b-844a-0fbb8c9345d6.__CR35,23,333,153_PT0_SX315_V1___.jpg",
        "company_description_text": "Founded in 2011, ETOSELL is a brand dedicated to providing customers with fashionable design and comfortable wearing experience.  Positioned in the style of fashion, feminine, classic, modern and simple to pursue that share of comfortable and happiness in life.  As a user-oriented brand, we have researched and tested various kinds of fabric and produced a variety of soft, breathable, and comfortable clothing.  Enjoy life and yourself!"
      },
      "sub_title": {
        "text": "Visit the Etosell Store",
        "link": "https://www.amazon.com/stores/ETOSELL/page/4B1C8577-BA8C-4A6F-B62C-2954747288A5?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "has_coupon": true,
      "coupon_text": "Save an extra 10% when you apply this coupon",
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/618xV2BmOCL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/618xV2BmOCL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/515In-6-lqL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51PqNkQUzDL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51cFT+y12sL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51BsPBxyYyL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/613b1QadRQL._AC_UL1500_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "videos": [
        {
          "duration_seconds": 40,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/3ab6edeb-d328-48bb-bd44-8bfe1f64458b/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/51rY16UkmyL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "ETOSELL Women Dress Casual Fall Long Sleeve Swiss Dot Swing Mini Dress"
        },
        {
          "duration_seconds": 30,
          "width": 418,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/819ec5c2-a5bd-49e7-a561-a1dfb07ff729/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/51hV9GYbC-L.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "ETOSELL Women's Dresses Sweet & Cute Mini Dress Swiss Dot"
        }
      ],
      "videos_count": 2,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/3ab6edeb-d328-48bb-bd44-8bfe1f64458b/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/819ec5c2-a5bd-49e7-a561-a1dfb07ff729/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.0a984908bc504dc6906c74d98f88f112",
          "product_asin": "B0B3QSFWLG",
          "parent_asin": "B0B3MS2VB4",
          "sponsor_products": "true",
          "title": "ETOSELL Women Dress Casual Fall Long Sleeve Swiss Dot Swing Mini Dress",
          "public_name": "Etosell",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Etosell",
          "video_image_id": "51rY16UkmyL",
          "video_image_url": "https://m.media-amazon.com/images/I/51rY16UkmyL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51rY16UkmyL.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/3ab6edeb-d328-48bb-bd44-8bfe1f64458b/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/3f4584d1-4a4b-4496-adbf-69b1af90c6e1/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:40",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.054d9b2cb8b34ef585831ab6d2ae9f84",
          "product_asin": "B0B3QSFWLG",
          "parent_asin": "B0B3MS2VB4",
          "sponsor_products": "true",
          "title": "ETOSELL Women's Dresses Sweet & Cute Mini Dress Swiss Dot",
          "public_name": "Etosell",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Etosell",
          "video_image_id": "51hV9GYbC-L",
          "video_image_url": "https://m.media-amazon.com/images/I/51hV9GYbC-L._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51hV9GYbC-L.jpg",
          "video_image_width": "640",
          "video_image_height": "734",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/819ec5c2-a5bd-49e7-a561-a1dfb07ff729/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/bd50d299-3246-452f-acb7-75a4c26ed05c/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:30",
          "type": "videos_for_this_product"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 19,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Tuesday, October 4",
            "name": "FREE"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Etosell",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A35XH4BLSQO1JR&asin=B0B3QSFWLG&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A35XH4BLSQO1JR"
          }
        },
        "price": {
          "symbol": "$",
          "value": 26.99,
          "currency": "USD",
          "raw": "$26.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 1262394,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Casual Dresses",
          "rank": 9105,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/2346727011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 1262394, Category: Women's Casual Dresses | Rank: 9105"
    }
  };

  let result = await isModleBelowTheKnee(payload);
  expect(result).toBe(true);
});//EXCEPTIONAL LINK

it("not-above-the-knee-example1", async () => {
  //https://www.amazon.com/dp/B0B2RMHPVB/ref=sspa_dk_detail_4?psc=1&pd_rd_i=B0B2RMHPVB&pd_rd_w=K4wsy&content-id=amzn1.sym.001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_p=001427f3-d335-4adc-9f90-bea7284a3721&pf_rd_r=03W7CYPQMM4TJT833PKA&pd_rd_wg=58Bb5&pd_rd_r=d4af01a5-760b-401a-9b87-ffaca25905ff&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzNkVZVDhRTTJZSDVNJmVuY3J5cHRlZElkPUEwOTIzOTE1MUxQR09QSjlGVlRZRyZlbmNyeXB0ZWRBZElkPUEwNzg3NzY3MVFPSlBNU01XSEZFVyZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 470,
      "credits_used_this_request": 1,
      "credits_remaining": 30,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/dp/B09J8SPT73/ref=sspa_dk_detail_7?psc=1&pd_rd_i=B09J8SPT73&pd_rd_w=uc2ar&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=N0XA0FCWJV3S54KV5JRM&pd_rd_wg=UnPBC&pd_rd_r=4af6240c-66ee-4152-bcb6-3a2e24dee40f&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExVjZQMVdTWVhRSVc5JmVuY3J5cHRlZElkPUEwMjM0NjYwMU9GMFJWOEc5UjVLNCZlbmNyeXB0ZWRBZElkPUEwMTY5MDgwMzJaVDc1UDNKRzkwRyZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU="
    },
    "product": {
      "title": "SHIBEVER Women Casual Dresses V Neck Long Sleeve Twist Front Waist Ribbed Knit Bodycon Slit Dress Cocktail Party Midi Dress 4186-blue Large",
      "title_excluding_variant_name": "SHIBEVER Women Casual Dresses V Neck Long Sleeve Twist Front Waist Ribbed Knit Bodycon Slit Dress Cocktail Party Midi Dress",
      "keywords": "SHIBEVER,Women,Casual,Dresses,V,Neck,Long,Sleeve,Twist,Front,Waist,Ribbed,Knit,Bodycon,Slit,Dress,Cocktail,Party,Midi,Dress",
      "keywords_list": [
        "SHIBEVER",
        "Women",
        "Casual",
        "Dresses",
        "Neck",
        "Long",
        "Sleeve",
        "Twist",
        "Front",
        "Waist",
        "Ribbed",
        "Knit",
        "Bodycon",
        "Slit",
        "Dress",
        "Cocktail",
        "Party",
        "Midi",
        "Dress"
      ],
      "asin": "B09J8SPT73",
      "link": "https://www.amazon.com/dp/B09J8SPT73??th=1&psc=1",
      "brand": "SHIBEVER",
      "has_size_guide": true,
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
          "name": "Dresses",
          "link": "https://www.amazon.com/Dresses/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045024",
          "category_id": "1045024"
        },
        {
          "name": "Casual",
          "link": "https://www.amazon.com/Casual-Dresses/b/ref=dp_bc_aui_C_5?ie=UTF8&node=2346727011",
          "category_id": "2346727011"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Dresses > Casual",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "title": "SHIBEVER Women's Long Sleeve Twist Front Bodycon Midi Dress With Slit SHIBEVER Women's Long Sleeve Midi Dress Twist Front Waist Ribbed Knit Bodycon Dress SHIBEVER Women's Casual Long Sleeve Knit Midi Dress Fall Dress For Women 2022 SHIBEVER Women Fall Dresses Long Sleeve Bodycon Midi Dress with Slit SHIBEVER Womens Bodycon Midi Dresses Long Sleeve Sexy Dresses For Cocktail Party Club Night SHIBEVER Elegant Holiday Party Dresses For Women Solid Color Going Out Dress SHIBEVER Fall Long Sleeve Ribbed Knit Midi Dresses Cocktail Dress For Wedding Guest SHIBEVER Women’s Casual Dressses Long Sleeve Deep V Neck Twist Knot Front Formal Evening Dress SHIBEVER Womens Twist Front Dress Long Sleeve Ribbed Knit Bodycon Dresses SHIBEVER Flattering Dresses For Women Elegant Holiday Party Bodycon Dress",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/40821d00-7862-4350-9174-0ce19de9a7c6.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
          "description": "Features: Elegant ribbed dress with good elastic fits for most figures and become comfort favorite Bodycon dresses for women with side slit and twist design better to shows a female curvy figure Women midi dress with sexy v neck emphasizes your elegant v line Womens casual long sleeve midi dress / Long sleeve midi dress for women / long sleeve twist dress Twist front dress long sleeve for work / twist front midi dress for women / v neck twist front split midi dress Bodycon twist long sleeve dress / midi bodycon dress for women / Womens club & night out dresses Black midi dresses / Winered long sleeve dress for women / Dark khaki bodycon midi dress for women Blue twist front dress dresses / Green midi dress with slit long sleeve slit dress/women midi dress with slit fall long sleeve dress for women/womens midi fall dress long sleeve bodycon dress/long sleeve ribbed bodycon dress front twist midi dress/ribbed knit dress/twist front ribbed knit dress casual long sleve dresses for women /sheath dress for women long sleeve long sleeve midi dress/bodycon midi dress/ribbed midi dress/ribbed bodycon dress long sleeve knit dress/twist front waist dresses/long sleeve twist front waist dress long sleeve cocktail dress for women/long sleve bodycon dress for wedding guest women sexy slit fitted dresses for women/long sleeve casual midi dress women long sleeve dresses/ribbed women long sleeve dress",
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/40821d00-7862-4350-9174-0ce19de9a7c6.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/95fd4a70-b3eb-4ff4-a1a3-4e97eae68191.__CR0,23,463,579_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/bf354e37-9d09-403f-8bb8-f262733448f5.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/7806cdc4-1794-477c-a384-1482d4e8ff63.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/3f6d3378-a5a3-4dc1-8bd9-392dae47f694.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/9b88ccad-88d9-4112-876d-0dcfbfe65315.__CR0,0,362,453_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/eb41b90f-9af9-4c60-987a-f586f925e493.__CR0,0,362,453_PT0_SX362_V1___.jpg"
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/8c306920-f867-4e27-aaa2-8173a7cc742a.__CR0,65,900,270_PT0_SX600_V1___.jpg"
      },
      "sub_title": {
        "text": "Visit the SHIBEVER Store",
        "link": "https://www.amazon.com/stores/SHIBEVER/page/853279B8-8F3E-471A-BC5A-7BDFE0FC6D57?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "has_coupon": true,
      "coupon_text": "Save an extra 10% when you apply this coupon",
      "rating": 4.2,
      "ratings_total": 562,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/61t8GBaPa2L.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/61t8GBaPa2L._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71cQjeRLITL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/710l5VxfSOL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71i-QvwlLfL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61KdAl4c-sL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71JqyTDAdQL._AC_UL1500_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "videos": [
        {
          "duration_seconds": 23,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/97d65051-c7e8-48d2-9c91-396526bbadf6/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/81U5dAMfiSL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "SHIBEVER Women Fall Dress for Wedding Guest Cocktail Party "
        },
        {
          "duration_seconds": 17,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/f1e3eeee-a38b-4a41-becc-0997b0b55137/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/81Ww5+Byw5L.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "SHIBEVER Bodycon Long Sleeve Dress Black Midi Dress"
        },
        {
          "duration_seconds": 22,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/1aea4506-f59b-4d3e-bc7f-ea85fec9ff5e/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/519r9uyK6UL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "SHIBEVER Women Long Sleeve Twist Front Midi Dress"
        },
        {
          "duration_seconds": 15,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/e0f0b2ff-bc92-4d75-9866-fd6dc2f1c700/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/813JsvcBztL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "SHIBEVER Long Sleeve Bodycon Slit Dress"
        },
        {
          "duration_seconds": 10,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/2c52d2ae-48f9-4428-9cba-d78e9e8cdd59/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/81xV0fIyr6L.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "SHIBEVER Women Long Sleeve Midi Dresses Bodycon Slit Dress"
        },
        {
          "duration_seconds": 8,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/48b60e39-78c1-464b-b8c2-e79a4fe0b69c/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/81zJOHbETpL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "SHIBEVER Long Sleeve Midi Dress Twist Front Waist Dress"
        }
      ],
      "videos_count": 6,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/97d65051-c7e8-48d2-9c91-396526bbadf6/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/f1e3eeee-a38b-4a41-becc-0997b0b55137/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/1aea4506-f59b-4d3e-bc7f-ea85fec9ff5e/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/e0f0b2ff-bc92-4d75-9866-fd6dc2f1c700/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/2c52d2ae-48f9-4428-9cba-d78e9e8cdd59/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/48b60e39-78c1-464b-b8c2-e79a4fe0b69c/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.095885ff73cc48cd93eba3209b2a6c69",
          "product_asin": "B09J8SPT73",
          "parent_asin": "B09DSN59NH",
          "related_products": "B09DSRC6Z4, B09DSR28JN, B09DSQQT41, B09DSQRS2M",
          "sponsor_products": "true",
          "title": "SHIBEVER Long Sleeve Midi Dress Twist Front Waist Dress",
          "public_name": "Hantions",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Hantions",
          "video_image_id": "81zJOHbETpL",
          "video_image_url": "https://m.media-amazon.com/images/I/81zJOHbETpL._CR0,0,970,512_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/81zJOHbETpL.jpg",
          "video_image_width": "970",
          "video_image_height": "600",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/48b60e39-78c1-464b-b8c2-e79a4fe0b69c/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/25991757-98d8-489d-b29e-03c9070d5f9c/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:08",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0e87cb5314154cd796b2c8dcaaf17aa9",
          "product_asin": "B09J8SPT73",
          "parent_asin": "B09DSN59NH",
          "related_products": "B0B397FZ48, B0B3986539, B0B395696L, B0B395BY93",
          "sponsor_products": "true",
          "title": "SHIBEVER Bodycon Long Sleeve Dress Black Midi Dress",
          "public_name": "Hantions",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Hantions",
          "video_image_id": "81Ww5+Byw5L",
          "video_image_url": "https://m.media-amazon.com/images/I/81Ww5+Byw5L._CR0,0,970,512_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/81Ww5+Byw5L.jpg",
          "video_image_width": "970",
          "video_image_height": "600",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/f1e3eeee-a38b-4a41-becc-0997b0b55137/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/02ecaeed-eedd-4136-9613-a7a6adf77809/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:17",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.04eadc341711409ab67750f07d5e2d74",
          "product_asin": "B09J8SPT73",
          "parent_asin": "B09DSN59NH",
          "related_products": "B09J8SX4FY, B09J8RZKDK, B0B397FZ48, B0B399G3TZ, B09J8THQCJ",
          "sponsor_products": "true",
          "title": "SHIBEVER Women Long Sleeve Midi Dresses Bodycon Slit Dress",
          "public_name": "Hantions",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Hantions",
          "video_image_id": "81xV0fIyr6L",
          "video_image_url": "https://m.media-amazon.com/images/I/81xV0fIyr6L._CR0,0,970,512_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/81xV0fIyr6L.jpg",
          "video_image_width": "970",
          "video_image_height": "600",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/2c52d2ae-48f9-4428-9cba-d78e9e8cdd59/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/d11d00e0-2a6a-4372-a2d6-d3e2a7272891/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:10",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0237015dfc7049fdb7814be819289b9a",
          "product_asin": "B09J8SPT73",
          "parent_asin": "B09DSN59NH",
          "related_products": "B09DSRC6Z4, B09DSR28JN, B09DSRVPJY, B09DSQM37D",
          "sponsor_products": "true",
          "title": "SHIBEVER Women Fall Dress for Wedding Guest Cocktail Party ",
          "public_name": "Hantions",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Hantions",
          "video_image_id": "81U5dAMfiSL",
          "video_image_url": "https://m.media-amazon.com/images/I/81U5dAMfiSL._CR0,0,970,512_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/81U5dAMfiSL.jpg",
          "video_image_width": "970",
          "video_image_height": "600",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/97d65051-c7e8-48d2-9c91-396526bbadf6/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/c88b9c1c-f9f5-4c0f-9c63-b440bddbed2e/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:23",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.03ea5adf31704e5eb8a01bfc11ff5893",
          "product_asin": "B09J8SPT73",
          "parent_asin": "B09DSN59NH",
          "related_products": "B09J8SX4FY, B09J8RZKDK, B0B397FZ48, B0B39562XS",
          "sponsor_products": "true",
          "title": "SHIBEVER Women Long Sleeve Twist Front Midi Dress",
          "public_name": "Hantions",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Hantions",
          "video_image_id": "519r9uyK6UL",
          "video_image_url": "https://m.media-amazon.com/images/I/519r9uyK6UL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/519r9uyK6UL.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/1aea4506-f59b-4d3e-bc7f-ea85fec9ff5e/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/4529afbe-d4fa-4f0e-b53b-f336dc2718aa/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:22",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.029d899064794c06998b8d23387f9cbe",
          "product_asin": "B09J8SPT73",
          "parent_asin": "B09DSN59NH",
          "related_products": "B09DSPRW9Q, B09DSQ67D5, B09DSS8QPJ, B09DSR17MK, B09DSRW7M1",
          "sponsor_products": "true",
          "title": "Women Long Sleeve Midi Dress",
          "public_name": "Hantions",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Hantions",
          "video_image_id": "51IAkEvX9gL",
          "video_image_url": "https://m.media-amazon.com/images/I/51IAkEvX9gL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51IAkEvX9gL.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/4ca6c00a-c549-46d1-a152-b8307e1f3af4/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/6cf57ea8-fd18-436a-bb15-2818041d20b3/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:34",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0c59a9bd57fc45eeb441768e3fee57c6",
          "product_asin": "B09J8SPT73",
          "parent_asin": "B09DSN59NH",
          "related_products": "B09DSRW7M1, B09DSRVPJY, B09DSQWDM5, B09DSQM37D, B09DSS2WPZ",
          "sponsor_products": "true",
          "title": "SHIBEVER Twist Front Ribbed Midi Dress with Slit",
          "public_name": "Hantions",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Hantions",
          "video_image_id": "81RccnnnKFL",
          "video_image_url": "https://m.media-amazon.com/images/I/81RccnnnKFL._CR0,0,1280,675_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/81RccnnnKFL.jpg",
          "video_image_width": "1280",
          "video_image_height": "720",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/8d156d96-6902-4dbb-beee-19410ff21a00/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/8655af8a-31c1-49b6-90ee-9fc6e306d3f1/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:32",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.08a6dc54ad31409d86f6e64cb758d0ff",
          "product_asin": "B09J8SPT73",
          "parent_asin": "B09DSN59NH",
          "related_products": "B09DSRC6Z4, B09DSQQT41, B09DSR28JN, B09DSSLNF8",
          "sponsor_products": "true",
          "title": "SHIBEVER Long Sleeve Bodycon Slit Dress",
          "public_name": "Hantions",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Hantions",
          "video_image_id": "813JsvcBztL",
          "video_image_url": "https://m.media-amazon.com/images/I/813JsvcBztL._CR0,0,970,512_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/813JsvcBztL.jpg",
          "video_image_width": "970",
          "video_image_height": "600",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/e0f0b2ff-bc92-4d75-9866-fd6dc2f1c700/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/659e13bf-82b0-4307-a0b0-da7269f6ddc3/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:15",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.00f5d0c909774c678af10236b436ca1e",
          "product_asin": "B09J8SPT73",
          "parent_asin": "B09DSN59NH",
          "related_products": "B09DSRC6Z4, B09DSR28JN, B09DSQQT41, B09DSS2WPZ",
          "sponsor_products": "true",
          "title": "SHIBEVER long sleeve midi dress, twist front dress with slit",
          "public_name": "Hantions",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Hantions",
          "video_image_id": "A1anveWoukL",
          "video_image_url": "https://m.media-amazon.com/images/I/A1anveWoukL._CR0,0,1920,1013_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/A1anveWoukL.jpg",
          "video_image_width": "1920",
          "video_image_height": "1080",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/71718dbc-743a-4c02-b038-de4b7ff2307c/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/0d1d0e8b-fe9a-44dd-bb3f-703ae48a12a2/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:15",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0607dbbe1d284cf289c388c9c434b1b3",
          "product_asin": "B09J8SPT73",
          "parent_asin": "B09DSN59NH",
          "related_products": "B09JS956M9, B09JRKZH3S, B09JS24LXZ, B09JRHTJQQ, B09JS8KHN7",
          "sponsor_products": "true",
          "title": "SHIBEVER Women Long Sleeve Button Down Casual Tunic Dress",
          "public_name": "Amaxuan",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Amaxuan",
          "video_image_id": "51OTmTjg9sL",
          "video_image_url": "https://m.media-amazon.com/images/I/51OTmTjg9sL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51OTmTjg9sL.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/b355c325-edf9-4863-b99f-999e558dde07/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/a45986a0-473a-45bd-bf90-a860352583d4/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:38",
          "type": "videos_for_related_products"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "is_prime": true,
        "is_amazon_fresh": false,
        "condition": {
          "is_new": true
        },
        "availability": {
          "raw": "Usually ships within 6 days.",
          "dispatch_days": 1
        },
        "fulfillment": {
          "type": "2p",
          "standard_delivery": {
            "date": "Sunday, October 2",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Saturday, October 1",
            "name": "Or fastest delivery Saturday, October 1"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Hantions",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A27TVKRSHV3BH5&asin=B09J8SPT73&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A27TVKRSHV3BH5"
          }
        },
        "price": {
          "symbol": "$",
          "value": 37.98,
          "currency": "USD",
          "raw": "$37.98"
        },
        "shipping": {
          "raw": "FREE"
        }
      }
    }
  };

  let result = await isModleBelowTheKnee(payload);
  expect(result).toBe(true);
});

it("below-the-knee-example1", async () => {
//https://www.amazon.com/dp/B09ZD4RBKN/ref=sspa_dk_detail_2?psc=1&pd_rd_i=B09ZD4RBKN&pd_rd_w=uc2ar&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=N0XA0FCWJV3S54KV5JRM&pd_rd_wg=UnPBC&pd_rd_r=4af6240c-66ee-4152-bcb6-3a2e24dee40f&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExVjZQMVdTWVhRSVc5JmVuY3J5cHRlZElkPUEwMjM0NjYwMU9GMFJWOEc5UjVLNCZlbmNyeXB0ZWRBZElkPUEwMDcxMTMwMVpEVTk0MDhaNUo3QSZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 473,
      "credits_used_this_request": 1,
      "credits_remaining": 27,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/dp/B09ZD4RBKN/ref=sspa_dk_detail_2?psc=1&pd_rd_i=B09ZD4RBKN&pd_rd_w=uc2ar&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=N0XA0FCWJV3S54KV5JRM&pd_rd_wg=UnPBC&pd_rd_r=4af6240c-66ee-4152-bcb6-3a2e24dee40f&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExVjZQMVdTWVhRSVc5JmVuY3J5cHRlZElkPUEwMjM0NjYwMU9GMFJWOEc5UjVLNCZlbmNyeXB0ZWRBZElkPUEwMDcxMTMwMVpEVTk0MDhaNUo3QSZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU="
    },
    "product": {
      "title": "Nemidor Womens Plus Size Boho Ditsy Floral Print Casual Layered Flared Maxi Dress with Pocket NEM304 14 Plus Navy Print",
      "title_excluding_variant_name": "Nemidor Womens Plus Size Boho Ditsy Floral Print Casual Layered Flared Maxi Dress with Pocket NEM304",
      "keywords": "Nemidor,Womens,Plus,Size,Boho,Ditsy,Floral,Print,Casual,Layered,Flared,Maxi,Dress,with,Pocket,NEM304",
      "keywords_list": [
        "Nemidor",
        "Womens",
        "Plus",
        "Size",
        "Boho",
        "Ditsy",
        "Floral",
        "Print",
        "Casual",
        "Layered",
        "Flared",
        "Maxi",
        "Dress",
        "with",
        "Pocket",
        "NEM304"
      ],
      "asin": "B09ZD4RBKN",
      "link": "https://www.amazon.com/dp/B09ZD4RBKN??th=1&psc=1",
      "brand": "Nemidor",
      "has_size_guide": true,
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
          "name": "Dresses",
          "link": "https://www.amazon.com/Dresses/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045024",
          "category_id": "1045024"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Dresses",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "brand_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/be9509ac-2972-42e8-9c6b-12701dca3edd.__CR104,0,391,180_PT0_SX315_V1___.jpg",
          "title": "Nemidor Womens Plus Size Bohemian Ditsy Floral Print Casual Layered Flared Summer Maxi Dress Nemidor Womens Plus Size Bohemian Ditsy Floral Print Layered Flared Maxi Dress Buyers Show Nemidor Womens Plus Size Boho Ditsy Floral Print Casual Layered Flared Maxi Dress with Pocket Womens Plus Size Bohemian Ditsy Floral Print Layered Flared Maxi Dress Size Chart",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/1f58a9b9-a137-4177-b294-5315078354b2.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
          "description": "",
          "brand_store": {
            "link": "/stores/page/84D8FE04-7448-46AF-9FB2-E5DAA8E2DF93",
            "id": "84D8FE04-7448-46AF-9FB2-E5DAA8E2DF93"
          },
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/1f58a9b9-a137-4177-b294-5315078354b2.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/d56905f4-f3c6-402b-90da-0046fa9e57ef.__CR0,0,362,453_PT0_SX362_V1___.jpg"
          ],
          "products": [
            {
              "title": "Nemidor Womens Plus Size Boho Print V Neck High Low Flowy Midi Wrap Dress with Pockets NEM305",
              "asin": "B09ZDZJS2T",
              "link": "/dp/B09ZDZJS2T/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51%2BnF1ssUiL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Casual Plus Size Summer Boho Floral Print Swing Midi Dress with Pockets NEM306",
              "asin": "B09ZHR6VX5",
              "link": "/dp/B09ZHR6VX5/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41kgbryncsL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Drop Shoulder Plus Size Casual Summer Boho Chiffon Print Skater Dress NEM311",
              "asin": "B0B3DP2HLL",
              "link": "/dp/B0B3DP2HLL/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51zaz60LgGL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Casual Plus Size Tie Waist Slit Long Maxi Dress with Pockets NEM313",
              "asin": "B0B2PK4H4C",
              "link": "/dp/B0B2PK4H4C/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41OxTBs1KbL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Plus Size Deep V Neck Ruched Bodycon Party Wrap Dress with Slit NEM309",
              "asin": "B0B41M98P7",
              "link": "/dp/B0B41M98P7/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/419o-QvSQvL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Plus Size Ruched Pleated Bodycon Midi Casual Party Wrap Dress with Slit NEM307",
              "asin": "B0B2PGXGQ7",
              "link": "/dp/B0B2PGXGQ7/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31j6XFq1gML.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Plus Size Ruched Wrap Dress Pleated Bodycon Midi Casual Party Work Dress NEM303",
              "asin": "B09YC9HLHC",
              "link": "/dp/B09YC9HLHC/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/41YXyDbVV6L.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Short Sleeve Plus Size Dress Casual Midi Swing Dress with Pockets NEM301",
              "asin": "B09Y1WL7NV",
              "link": "/dp/B09Y1WL7NV/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31CTqiecSBL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Plus Size Casual V Neck Short Sleeve A-line Slit Midi Dress with Pocket NEM302",
              "asin": "B09Y1ZGFX5",
              "link": "/dp/B09Y1ZGFX5/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/31vQQzCYU5L.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Plus Size Boho Ditsy Floral Print Casual Layered Flared Maxi Dress with Pocket NEM304",
              "asin": "B09YNQYJQ5",
              "link": "/dp/B09YNQYJQ5/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51lDKkraQuL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Drop Shoulder Plus Size Casual Summer Boho Chiffon Print Skater Dress NEM311",
              "asin": "B0B3DR5FJ3",
              "link": "/dp/B0B3DR5FJ3/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/51WJPgOB1AL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Nemidor Womens Casual Plus Size Tie Waist Slit Long Maxi Dress with Pockets NEM313",
              "asin": "B0B2PMPPWH",
              "link": "/dp/B0B2PMPPWH/ref=emc_bcc_2_i",
              "image": "https://images-na.ssl-images-amazon.com/images/I/3172SAXh0QL.__AC_SR166,182___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/be9509ac-2972-42e8-9c6b-12701dca3edd.__CR0,0,600,180_PT0_SX600_V1___.jpg"
      },
      "sub_title": {
        "text": "Visit the Nemidor Store",
        "link": "https://www.amazon.com/stores/Nemidor/page/84D8FE04-7448-46AF-9FB2-E5DAA8E2DF93?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "has_coupon": true,
      "coupon_text": "Save an extra 6% when you apply this coupon",
      "rating": 4.4,
      "ratings_total": 279,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/71Ed-RwassL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/71Ed-RwassL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81MMpd9m4vL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/815evAx-NqL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81QwN9gYAaL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81FaE2jpPmL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81Bx9NwU1sL._AC_UL1500_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "videos": [
        {
          "duration_seconds": 30,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/338efe78-d98b-4dfd-940a-c21df3b91ddf/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/91XndLFmkIL.SX522_.png",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Nemidor Womens Plus Size Boho Print Layered Flared Maxi Dress NEM304"
        }
      ],
      "videos_count": 1,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/338efe78-d98b-4dfd-940a-c21df3b91ddf/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.0d2ae07cce894d1c9568a9437c27f130",
          "product_asin": "B09ZD4RBKN",
          "parent_asin": "B09YNQRQ8T",
          "related_products": "B09YNR6N7D, B09YNR8D38, B09YNS2GR9, B09YNRBJ31, B09YNQYJQ5",
          "sponsor_products": "true",
          "title": "Nemidor Womens Plus Size Boho Print Layered Flared Maxi Dress NEM304",
          "public_name": "Venus Lu",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "Venus Lu",
          "video_image_id": "91XndLFmkIL",
          "video_image_url": "https://m.media-amazon.com/images/I/91XndLFmkIL._CR0,0,1045,551_SR580,306_.png",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/91XndLFmkIL.png",
          "video_image_width": "1045",
          "video_image_height": "851",
          "video_image_extension": "png",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/338efe78-d98b-4dfd-940a-c21df3b91ddf/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/48a0eeee-2450-4703-847f-a3e434445c59/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:30",
          "type": "videos_for_this_product"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 9,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Sun, Oct 2",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Wed, Sep 28",
            "name": "Or fastest delivery Wed, Sep 28. Order within 15 hrs 56 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Venus Lu",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A2R297Y25OPCBS&asin=B09ZD4RBKN&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A2R297Y25OPCBS"
          }
        },
        "price": {
          "symbol": "$",
          "value": 29.99,
          "currency": "USD",
          "raw": "$29.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 15954,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Dresses",
          "rank": 938,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1045024/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 15954, Category: Women's Dresses | Rank: 938"
    }
  };

  let result = await isModleBelowTheKnee(payload);
  expect(result).toBe(true);
});

//Athletic Back Detaction

it("athletic-back-detection-pass", async () => {
//https://www.amazon.com/RUNNING-GIRL-Strappy-Crisscross-Removable/dp/B07X4VB3D6/ref=sr_1_16?keywords=sports+bras+for+women&qid=1664528823&qu=eyJxc2MiOiI5LjAxIiwicXNhIjoiOC44NyIsInFzcCI6IjguNTMifQ%3D%3D&sprefix=sports+%2Caps%2C360&sr=8-16

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 822,
      "overage_used": 322,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/RUNNING-GIRL-Strappy-Crisscross-Removable/dp/B07X4VB3D6/ref=sr_1_16?keywords=sports bras for women&qid=1664528823&qu=eyJxc2MiOiI5LjAxIiwicXNhIjoiOC44NyIsInFzcCI6IjguNTMifQ==&sprefix=sports ,aps,360&sr=8-16"
    },
    "product": {
      "title": "RUNNING GIRL Strappy Sports Bra for Women, Sexy Crisscross Back Medium Support Yoga Bra with Removable Cups",
      "keywords": "RUNNING,GIRL,Strappy,Sports,Bra,for,Women,,Sexy,Crisscross,Back,Medium,Support,Yoga,Bra,with,Removable,Cups",
      "keywords_list": [
        "RUNNING",
        "GIRL",
        "Strappy",
        "Sports",
        "Women",
        "Sexy",
        "Crisscross",
        "Back",
        "Medium",
        "Support",
        "Yoga",
        "with",
        "Removable",
        "Cups"
      ],
      "asin": "B07X1N5PG9",
      "link": "https://www.amazon.com/RUNNING-GIRL-Strappy-Crisscross-Removable/dp/B07X2NN74Z",
      "brand": "RUNNING GIRL",
      "has_size_guide": true,
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
          "name": "Lingerie",
          "link": "https://www.amazon.com/Lingerie/b/ref=dp_bc_aui_C_5?ie=UTF8&node=14333511",
          "category_id": "14333511"
        },
        {
          "name": "Bras",
          "link": "https://www.amazon.com/Womens-Bras/b/ref=dp_bc_aui_C_6?ie=UTF8&node=1044960",
          "category_id": "1044960"
        },
        {
          "name": "Sports Bras",
          "link": "https://www.amazon.com/Womens-Sports-Bras/b/ref=dp_bc_aui_C_7?ie=UTF8&node=1044990",
          "category_id": "1044990"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Lingerie, Sleep & Lounge > Lingerie > Bras > Sports Bras",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/8f8ce903-21d4-48ac-826d-8ce2f05050af.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
          "brand_store": {
            "link": "/stores/page/B7ACC67E-2539-43EF-98B5-E77ACC4F1B02",
            "id": "B7ACC67E-2539-43EF-98B5-E77ACC4F1B02"
          },
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/8f8ce903-21d4-48ac-826d-8ce2f05050af.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/f46317a6-ba15-4669-b336-b23b1a4804c1.__CR91,177,899,1125_PT0_SX362_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/c851d668-5ad7-4504-8243-ba9e3d61cde7.__CR70,0,559,700_PT0_SX362_V1___.jpg"
          ],
          "products": [
            {
              "title": "RUNNING GIRL High Impact Sports Bras for Women,Racerback Bra Workout Crop Tops for Women",
              "asin": "B09PG6RY24",
              "link": "/dp/B09PG6RY24/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/I/41z7pK8U5DL.__AC_SR166,182___.jpg"
            },
            {
              "title": "RUNNING GIRL Yoga Tank Tops for Women Built in Bra, Workout Cropped Athletic Shirts Plus Size Act...",
              "asin": "B09DPDTRZS",
              "link": "/dp/B09DPDTRZS/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/I/31ulLZL9wNL.__AC_SR166,182___.jpg"
            },
            {
              "title": "RUNNING GIRL Sports Bra for Women,High Impact Large Bust Padded Sports Bra Fitness Workout Runnin...",
              "asin": "B0B42991FT",
              "link": "/dp/B0B42991FT/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/I/31SuTFN8S%2BL.__AC_SR166,182___.jpg"
            },
            {
              "title": "RUNNING GIRL Sports Bra for Women,High Impact Large Bust Padded Sports Bra Fitness Workout Runnin...",
              "asin": "B09QHHL9NZ",
              "link": "/dp/B09QHHL9NZ/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/I/41TaIY0cYGL.__AC_SR166,182___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media/sc/fed48b4d-f01f-4e04-a721-27b7d3c266e7.__CR0,0,600,180_PT0_SX600_V1___.jpg"
      },
      "sub_title": {
        "text": "Visit the RUNNING GIRL Store",
        "link": "https://www.amazon.com/stores/RUNNINGGIRL/page/B7ACC67E-2539-43EF-98B5-E77ACC4F1B02?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.5,
      "ratings_total": 13677,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/71Ya5VHhdvL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/71Ya5VHhdvL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61xj3iBSAlL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81d2TnR6UaL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61UUbtq2bKL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71j+IKh6fJL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71Sx7gsqQwL._AC_UL1500_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "videos": [
        {
          "duration_seconds": 16,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/cf33a459-7bc2-4791-80ca-fd890c52004e/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/41++NjETIKL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "RUNNING GIRL Strappy Sports Bra for Women"
        }
      ],
      "videos_count": 1,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/cf33a459-7bc2-4791-80ca-fd890c52004e/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.0460578cbaab4265912cce8024df8c9b",
          "product_asin": "B07X2NN74Z",
          "parent_asin": "B07X2NN74Z",
          "related_products": "B07XBJC76H, B07X4VB3D6, B07W13JL93, B08SLNT168",
          "sponsor_products": "true",
          "title": "Running Girl Sports bras review!",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/charlestoncrafted_5ced10f7-72b2-4711-93a6-a8760a985c43.jpeg",
          "profile_link": "/shop/charlestoncrafted",
          "public_name": "Charleston Crafted",
          "creator_type": "Influencer",
          "vendor_code": "charlestoncrafted:shop",
          "vendor_name": "Charleston Crafted",
          "vendor_tracking_id": "charlestonc0f-20",
          "video_image_id": "711ar5+Un9L",
          "video_image_url": "https://m.media-amazon.com/images/I/711ar5+Un9L._CR0,0,1280,675_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/711ar5+Un9L.jpg",
          "video_image_width": "1280",
          "video_image_height": "720",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/7a6e6a67-5916-4511-8cc7-0476d1b4297a/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/c2f2824a-05e4-4986-96ec-8b055b2f6dcb/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:37",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/f7ef40ca-957f-4b02-83fd-2549b4462a5f.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.075b2f2723034115ae16e420484e8277",
          "product_asin": "B07X2NN74Z",
          "parent_asin": "B07X2NN74Z",
          "related_products": "B07X4VB3D6",
          "sponsor_products": "true",
          "title": "Running Girl Bra, Sooooo Comfortable and Easy to Put on!",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/beautifulday_1612040709297_original._CR1149,725,1597,1597_._FMjpg_.jpeg",
          "profile_link": "/shop/beautifulday",
          "public_name": "Beautiful Day",
          "creator_type": "Influencer",
          "vendor_code": "beautifulday:shop",
          "vendor_name": "Beautiful Day",
          "vendor_tracking_id": "onamzlisachen-20",
          "video_image_id": "91lrPimMlBL",
          "video_image_url": "https://m.media-amazon.com/images/I/91lrPimMlBL._CR0,0,1280,675_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/91lrPimMlBL.jpg",
          "video_image_width": "1280",
          "video_image_height": "720",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/1cbb712c-b405-492e-8c03-d5249d933938/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/e5fd5a56-140f-4e26-99ab-4946821b7ab8/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:42",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/e924b485-c403-405c-8a4a-6776f114f78f.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0ab519d6f2e749ae9ecca2bec23a3662",
          "product_asin": "B07X2NN74Z",
          "parent_asin": "B07X2NN74Z",
          "related_products": "B07WZH9XHX",
          "sponsor_products": "true",
          "title": "Running Girl Strappy Sports Bra - Super Cute!",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/kelliroberts_1630706504706_original._CR301,0,2268,2268_._FMjpg_.jpeg",
          "profile_link": "/shop/kelliroberts",
          "public_name": "Kelli Roberts",
          "creator_type": "Influencer",
          "vendor_code": "kelliroberts:shop",
          "vendor_name": "Kelli Roberts",
          "vendor_tracking_id": "onamzkellirob-20",
          "video_image_id": "7102sJfreKL",
          "video_image_url": "https://m.media-amazon.com/images/I/7102sJfreKL._CR0,0,1280,675_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/7102sJfreKL.jpg",
          "video_image_width": "1280",
          "video_image_height": "720",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/71e426a9-125f-4f6b-99f9-7f376d9e71a0/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/d0d6cc0b-9b5e-41af-b765-16746bd1f508/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "2:17",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/a939b811-b65b-4e5d-b501-f6e9e5e6d771.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0b83f51c1e7f42e694c702714ec9cbe8",
          "product_asin": "B07X2NN74Z",
          "parent_asin": "B07X2NN74Z",
          "related_products": "B07C3HDGF8, B07X4VB3D6, B07C3KT5Z9",
          "sponsor_products": "true",
          "title": "Mippo Workout Top, 140lbs 5'8\" Medium Fits Perfectly!",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/beautifulday_1612040709297_original._CR1149,725,1597,1597_._FMjpg_.jpeg",
          "profile_link": "/shop/beautifulday",
          "public_name": "Beautiful Day",
          "creator_type": "Influencer",
          "vendor_code": "beautifulday:shop",
          "vendor_name": "Beautiful Day",
          "vendor_tracking_id": "onamzlisachen-20",
          "video_image_id": "91--ySN73aL",
          "video_image_url": "https://m.media-amazon.com/images/I/91--ySN73aL._CR0,0,1280,675_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/91--ySN73aL.jpg",
          "video_image_width": "1280",
          "video_image_height": "720",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/42ebbe8b-d458-4909-ba13-66b61168e58c/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/fe626752-819a-4c2a-950d-354072013bc9/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:40",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/4b81c708-e92e-465f-9a9f-9e215875eee6.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.04f2f7dfd4614576824cea498b6cf84b",
          "product_asin": "B07X2NN74Z",
          "parent_asin": "B07X2NN74Z",
          "related_products": "B07WZJV41P",
          "sponsor_products": "true",
          "title": "RUNNING GIRL Strappy Sports Bra w/ Crisscross Back Close Up",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/stillaslife_4356d602-cb34-420a-9b84-fdc38030c872.jpeg",
          "profile_link": "/shop/stillaslife",
          "public_name": "Still As Life",
          "creator_type": "Influencer",
          "vendor_code": "stillaslife:shop",
          "vendor_name": "Still As Life",
          "vendor_tracking_id": "onamzstillasl-20",
          "video_image_id": "41fFB5O6V9L",
          "video_image_url": "https://m.media-amazon.com/images/I/41fFB5O6V9L._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/41fFB5O6V9L.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/36523512-4005-4edd-9944-7e4595795ba1/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/211b2f0e-0539-4638-b624-91bbd124f06c/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "1:04",
          "type": "videos_for_this_product"
        }
      ],
      "is_bundle": false,
      "attributes": [
        {
          "name": "size",
          "value": "Select"
        },
        {
          "name": "color",
          "value": "Purple"
        }
      ],
      "buybox_winner": {
        "is_prime": false,
        "is_amazon_fresh": false,
        "condition": {
          "is_new": true
        },
        "fulfillment": {
          "type": "1p",
          "is_sold_by_amazon": true,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": false
        },
        "price": {
          "symbol": "$",
          "value": 16.99,
          "currency": "USD",
          "raw": "$16.99"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 1108,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Sports Bras",
          "rank": 12,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1044990/ref=pd_zg_hrsr_fashion"
        }
      ],
      "manufacturer": "RUNNING GIRL",
      "dimensions": "11.81 x 0.39 x 7.87 inches; 4.16 Ounces",
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 1108, Category: Women's Sports Bras | Rank: 12"
    }
  };

  let result = await isBackDetailKeySellingFeature(payload, keywordsList);
  expect(result).toBe(true);
});

it("athletic-back-detection-pass", async () => {
//https://www.amazon.com/RUNNING-GIRL-Criss-Cross-Removable-WX2353-White-L/dp/B07XBJC76H/ref=sr_1_11?crid=1JBNKTBHNSGKV&keywords=athletic+bras&qid=1664800742&qu=eyJxc2MiOiI3LjcyIiwicXNhIjoiNy4yNCIsInFzcCI6IjYuNTgifQ%3D%3D&sprefix=athletic+bra%2Caps%2C309&sr=8-11

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 864,
      "overage_used": 364,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/RUNNING-GIRL-Criss-Cross-Removable-WX2353-White-L/dp/B07XBJC76H/ref=sr_1_11?"
    },
    "product": {
      "title": "RUNNING GIRL Sports Bra for Women, Criss-Cross Back Padded Strappy Sports Bras Medium Support Yoga Bra with Removable Cups",
      "keywords": "RUNNING,GIRL,Sports,Bra,for,Women,,Criss-Cross,Back,Padded,Strappy,Sports,Bras,Medium,Support,Yoga,Bra,with,Removable,Cups",
      "keywords_list": [
        "RUNNING",
        "GIRL",
        "Sports",
        "Women",
        "Criss-Cross",
        "Back",
        "Padded",
        "Strappy",
        "Sports",
        "Bras",
        "Medium",
        "Support",
        "Yoga",
        "with",
        "Removable",
        "Cups"
      ],
      "asin": "B07XBJ6QVR",
      "link": "https://www.amazon.com/RUNNING-GIRL-Criss-Cross-Strappy-Removable/dp/B08SLNT168",
      "brand": "RUNNING GIRL",
      "bestseller_badge": {
        "link": "https://www.amazon.com/gp/bestsellers/fashion/1044990/ref=zg_b_bs_1044990_1",
        "category": "Women's Sports Bras",
        "badge_text": "#1 Best Seller"
      },
      "has_size_guide": true,
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
          "name": "Lingerie",
          "link": "https://www.amazon.com/Lingerie/b/ref=dp_bc_aui_C_5?ie=UTF8&node=14333511",
          "category_id": "14333511"
        },
        {
          "name": "Bras",
          "link": "https://www.amazon.com/Womens-Bras/b/ref=dp_bc_aui_C_6?ie=UTF8&node=1044960",
          "category_id": "1044960"
        },
        {
          "name": "Sports Bras",
          "link": "https://www.amazon.com/Womens-Sports-Bras/b/ref=dp_bc_aui_C_7?ie=UTF8&node=1044990",
          "category_id": "1044990"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Lingerie, Sleep & Lounge > Lingerie > Bras > Sports Bras",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "brand_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/f21c4da1-daed-412c-865d-d61f1c8e9d0a.__CR0,0,315,145_PT0_SX315_V1___.jpg",
          "title": "Perfect bra for yoga,exercise,fitness,any type of workout,or everyday use.",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/d24e0acd-6cfd-47a2-9935-5f95f969ffcf.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
          "description": "Designed for a compression fit, Maximum Support sports bras are constructed with thicker straps and wider hems. They are created for stability & comfort. Perfect for medium/ high-impact workouts such as tennis、HIIT training、yoga、running and cardio,fit snugly to the body for additional lift and support. They will hold you in without holding you back.They are our most supportive bras!",
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/d24e0acd-6cfd-47a2-9935-5f95f969ffcf.__CR0,0,1464,625_PT0_SX1464_V1___.jpg"
          ],
          "products": [
            {
              "title": "RUNNING GIRL Strappy Sports Bra for Women Sexy Crisscross Back Light Support Yoga Bra with Remova...",
              "asin": "B07S4777WT",
              "link": "/dp/B07S4777WT/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/I/41%2Bnvh4IJnL.__AC_SR166,182___.jpg"
            },
            {
              "title": "RUNNING GIRL Sports Bra for Women, Flow Y Back Workout Strappy Sports Bras Medium Support Yoga Gy...",
              "asin": "B09Q8ZN9FS",
              "link": "/dp/B09Q8ZN9FS/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/I/311LdBSCrsL.__AC_SR166,182___.jpg"
            },
            {
              "title": "RUNNING GIRL Sports Bra for Women, Strong-Line Back Padded Workout Sports Bras Medium Support Yog...",
              "asin": "B09Q81XP6Y",
              "link": "/dp/B09Q81XP6Y/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/I/31FZvo6ANHL.__AC_SR166,182___.jpg"
            },
            {
              "title": "RUNNING GIRL Sports Bra for Women, Medium-High Support Criss-Cross Back Strappy Padded Sports Bra...",
              "asin": "B09XHVRWJ5",
              "link": "/dp/B09XHVRWJ5/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/I/41JoTAs9JwL.__AC_SR166,182___.jpg"
            },
            {
              "title": "black sports bra",
              "asin": "B0B6JJXTHC",
              "link": "/dp/B0B6JJXTHC/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/59385450-372d-4f90-847a-5631297e0e83.__CR0,43,3035,3328_PT0_SX166_V1___.jpg"
            },
            {
              "title": "white sports bra",
              "asin": "B0B6JHLSSS",
              "link": "/dp/B0B6JHLSSS/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/1df8fe78-d07f-4950-ac2e-dbca88e039da.__CR0,62,3034,3326_PT0_SX166_V1___.jpg"
            },
            {
              "title": "green sports bra",
              "asin": "B0B6PXWCYM",
              "link": "/dp/B0B6PXWCYM/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/5539cff6-dbe5-4a49-8acc-02aa8e4ecc50.__CR13,0,3101,3400_PT0_SX166_V1___.jpg"
            },
            {
              "title": "brown sports bra",
              "asin": "B0B6JGQ9PL",
              "link": "/dp/B0B6JGQ9PL/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/2f7e422b-c98b-4b6b-b631-e0e9f2f46a06.__CR10,0,3121,3422_PT0_SX166_V1___.jpg"
            },
            {
              "title": "blue sports bras for women",
              "asin": "B0B6JHCFZ3",
              "link": "/dp/B0B6JHCFZ3/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/30de655e-47c2-4281-8df3-9fbb70ae1802.__CR6,0,3264,3579_PT0_SX166_V1___.jpg"
            },
            {
              "title": "white sports bras for women",
              "asin": "B0B6JHM42R",
              "link": "/dp/B0B6JHM42R/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/5f2de918-8b60-4b16-9646-8ba2765c4a48.__CR47,0,3231,3542_PT0_SX166_V1___.jpg"
            },
            {
              "title": "dark bule sports bras for women",
              "asin": "B0B6JFFJ9T",
              "link": "/dp/B0B6JFFJ9T/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/ee3f1c48-d37c-43c8-9f59-ce5c10ba9c71.__CR8,0,3264,3579_PT0_SX166_V1___.jpg"
            },
            {
              "title": "black sports bras for women",
              "asin": "B0B6JGNJZ1",
              "link": "/dp/B0B6JGNJZ1/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/6a3b20a4-0641-4533-9816-19bdc90911ca.__CR16,0,3264,3579_PT0_SX166_V1___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media/sc/43caec79-a48e-45e9-ae4c-232ef8db9810.__CR0,0,600,180_PT0_SX600_V1___.jpg",
        "company_description_text": "Designed for a compression fit, Maximum Support sports bras are constructed with thicker straps and wider hems. They are created for stability & comfort. Perfect for medium/ high-impact workouts such as tennis、HIIT training、yoga、running and cardio,fit snugly to the body for additional lift and support. They will hold you in without holding you back.They are our most supportive bras!"
      },
      "sub_title": {
        "text": "Visit the RUNNING GIRL Store",
        "link": "https://www.amazon.com/stores/RUNNINGGIRL/page/B7ACC67E-2539-43EF-98B5-E77ACC4F1B02?ref_=ast_bln"
      },
      "rating": 4.4,
      "ratings_total": 32496,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/71PKrPCtJ8L.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/71PKrPCtJ8L._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81i9huGRs0L._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81suG0sqR0L._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71Gm5UDYwbL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61HQ5Q-qamL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61fIBQtPXGL._AC_UL1500_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "videos": [
        {
          "duration_seconds": 15,
          "width": 270,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/0536c15e-2780-4f0c-8f0d-d6671fba25fa/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/71EmJmvTLML.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Gym Sports Bra"
        }
      ],
      "videos_count": 1,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/0536c15e-2780-4f0c-8f0d-d6671fba25fa/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.0d2e2e5cee294baa8ca8685db29ebb18",
          "product_asin": "B08SLNT168",
          "parent_asin": "B08SLNT168",
          "related_products": "B07XBJC76H",
          "sponsor_products": "true",
          "title": "Sports Bra Review: Great for larger chests!",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/influencer-3895274e_1586818571903_original._CR0,0,2320,2320_._FMjpg_.jpeg",
          "profile_link": "/shop/influencer-3895274e",
          "public_name": "Jenny Radish’s Finds",
          "creator_type": "Influencer",
          "vendor_code": "influencer-3895274e:shop",
          "vendor_name": "Jenny Radish’s Finds",
          "vendor_tracking_id": "onamzjennyrad-20",
          "video_image_id": "81hLjAhO2QL",
          "video_image_url": "https://m.media-amazon.com/images/I/81hLjAhO2QL._CR0,0,1280,675_SR580,306_.png",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/81hLjAhO2QL.png",
          "video_image_width": "1280",
          "video_image_height": "720",
          "video_image_extension": "png",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/a269e0ff-e9fa-47ad-97a4-482c68a1245d/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/db941e43-8714-408c-9e9a-b3ae9939bceb/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "1:11",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/afa12c42-8590-4865-831e-1bdb5fd3f427.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.047fcacb5d7d4a1f9d0527e0324747ff",
          "product_asin": "B08SLNT168",
          "parent_asin": "B08SLNT168",
          "related_products": "B07X7T9RP4",
          "sponsor_products": "true",
          "title": "sports bra review",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/influencer-1e218c86_1617468484642_original._CR0,93,1536,1536_._FMjpg_.jpeg",
          "profile_link": "/shop/influencer-1e218c86",
          "public_name": "Here Comes Katherine",
          "creator_type": "Influencer",
          "vendor_code": "influencer-1e218c86:shop",
          "vendor_name": "Here Comes Katherine",
          "vendor_tracking_id": "herecomethe0d-20",
          "video_image_id": "51QLIcOmWhL",
          "video_image_url": "https://m.media-amazon.com/images/I/51QLIcOmWhL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51QLIcOmWhL.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/7430b69f-f0fe-45e5-96d9-c3f865b70d33/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/506e20bd-0218-4b49-9d88-94da5b7dc4ba/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:30",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.06c1b76ea83649b5981855ee9dae26f8",
          "product_asin": "B08SLNT168",
          "parent_asin": "B08SLNT168",
          "related_products": "B07X8F3FVL",
          "sponsor_products": "true",
          "title": "Mint Sports Bra",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/influencer-48121ba4_1608837410858_original._CR0,256,1536,1536_._FMjpg_.jpeg",
          "profile_link": "/shop/influencer-48121ba4",
          "public_name": "Turquoise and Tulips ",
          "creator_type": "Influencer",
          "vendor_code": "influencer-48121ba4:shop",
          "vendor_name": "Turquoise and Tulips ",
          "vendor_tracking_id": "onamzhanna0f7-20",
          "video_image_id": "61GYubKPuSL",
          "video_image_url": "https://m.media-amazon.com/images/I/61GYubKPuSL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/61GYubKPuSL.jpg",
          "video_image_width": "640",
          "video_image_height": "1137",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/eddfed06-5c3d-4d29-b2c0-624caf8bf417/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/86086376-f1f2-433e-9055-1c92840b9ce5/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:17",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/aea3be18-7162-426b-aff9-30d8c97bf79a.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0e5cd172d0ae4237b4bfbed5653040b2",
          "product_asin": "B08SLNT168",
          "parent_asin": "B08SLNT168",
          "related_products": "B07XBJC76H",
          "sponsor_products": "true",
          "title": "Love this running sports bra tank top, super comfy, sized up",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/influencer-23088ea5_1637541627257_original._CR48,427,1032,1032_._FMjpg_.jpeg",
          "profile_link": "/shop/influencer-23088ea5",
          "public_name": "Adventures In Mom Life",
          "creator_type": "Influencer",
          "vendor_code": "influencer-23088ea5:shop",
          "vendor_name": "Adventures In Mom Life",
          "vendor_tracking_id": "adventure0e07-20",
          "video_image_id": "A19pvJo6UML",
          "video_image_url": "https://m.media-amazon.com/images/I/A19pvJo6UML._CR0,0,2268,1197_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/A19pvJo6UML.jpg",
          "video_image_width": "2268",
          "video_image_height": "3024",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/ba8169ee-3052-4009-b206-616eeed7fa0b/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/89f33389-a792-4bd4-a487-5aa37503ad61/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "1:09",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/06f878a4-bd61-4d0e-87f8-2a4873b0de4d.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0460578cbaab4265912cce8024df8c9b",
          "product_asin": "B08SLNT168",
          "parent_asin": "B08SLNT168",
          "related_products": "B07XBJC76H, B07X4VB3D6, B07W13JL93, B07X2NN74Z",
          "sponsor_products": "true",
          "title": "Running Girl Sports bras review!",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/charlestoncrafted_5ced10f7-72b2-4711-93a6-a8760a985c43.jpeg",
          "profile_link": "/shop/charlestoncrafted",
          "public_name": "Charleston Crafted",
          "creator_type": "Influencer",
          "vendor_code": "charlestoncrafted:shop",
          "vendor_name": "Charleston Crafted",
          "vendor_tracking_id": "charlestonc0f-20",
          "video_image_id": "711ar5+Un9L",
          "video_image_url": "https://m.media-amazon.com/images/I/711ar5+Un9L._CR0,0,1280,675_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/711ar5+Un9L.jpg",
          "video_image_width": "1280",
          "video_image_height": "720",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/7a6e6a67-5916-4511-8cc7-0476d1b4297a/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/c2f2824a-05e4-4986-96ec-8b055b2f6dcb/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:37",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/f7ef40ca-957f-4b02-83fd-2549b4462a5f.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0c3c04e394034101a6d33352ebcebf56",
          "product_asin": "B08SLNT168",
          "parent_asin": "B08SLNT168",
          "related_products": "B08H58YLP7",
          "sponsor_products": "true",
          "title": "RUNNING GIRL Sports Bra: Good Support AND Easy to Put on!",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/beautifulday_1612040709297_original._CR1149,725,1597,1597_._FMjpg_.jpeg",
          "profile_link": "/shop/beautifulday",
          "public_name": "Beautiful Day",
          "creator_type": "Influencer",
          "vendor_code": "beautifulday:shop",
          "vendor_name": "Beautiful Day",
          "vendor_tracking_id": "onamzlisachen-20",
          "video_image_id": "91jyOtPUrRL",
          "video_image_url": "https://m.media-amazon.com/images/I/91jyOtPUrRL._CR0,0,1280,675_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/91jyOtPUrRL.jpg",
          "video_image_width": "1280",
          "video_image_height": "720",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/07368ec5-b18f-4262-9c55-22593f98e728/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/632bcf35-08d1-4c29-b669-f62a04aa5b1a/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "1:12",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/68177d82-470f-429d-9a47-52258914e719.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0d503fc466b5401ead7c7f64a982a042",
          "product_asin": "B08SLNT168",
          "parent_asin": "B08SLNT168",
          "related_products": "B07XBJC76H, B07Y1MQHRM, B08F7RVX6R, B07Y1LJ5C9",
          "sponsor_products": "true",
          "title": "Super Cute and Affordable Sports Bra + High Waisted Leggings",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/influencer-26ae6984_1607199585972_original._CR0,0,671,671_._FMjpg_.jpeg",
          "profile_link": "/shop/influencer-26ae6984",
          "public_name": "Healthy Fit Fab",
          "creator_type": "Influencer",
          "vendor_code": "influencer-26ae6984:shop",
          "vendor_name": "Healthy Fit Fab",
          "vendor_tracking_id": "onamzheal0c6-20",
          "video_image_id": "912Pq8MMwBL",
          "video_image_url": "https://m.media-amazon.com/images/I/912Pq8MMwBL._CR0,0,3088,1629_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/912Pq8MMwBL.jpg",
          "video_image_width": "3088",
          "video_image_height": "2316",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/f83a6a1c-d547-405d-a83a-a0c4e62fb9b6/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/817bc4df-4de2-4097-90ee-821d106d748b/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "1:03",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/f84e4b50-98de-4e69-b4ce-030acfdc2092.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0c2403e86b03413295a27d4651ad6b02",
          "product_asin": "B08SLNT168",
          "parent_asin": "B08SLNT168",
          "related_products": "B07X8F3GXN",
          "sponsor_products": "true",
          "title": "Running Girl Sports Bra Strappy Back Criss Cross AMAZING",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/influencer-b49b45a2_1617986598771_original._CR0,590,3024,3024_._FMjpg_.jpeg",
          "profile_link": "/shop/influencer-b49b45a2",
          "public_name": "Elizabeth - With A Wink And A Smile",
          "creator_type": "Influencer",
          "vendor_code": "influencer-b49b45a2:shop",
          "vendor_name": "Elizabeth - With A Wink And A Smile",
          "vendor_tracking_id": "onamzeliza0a9-20",
          "video_image_id": "A1ZNgz1Dm7L",
          "video_image_url": "https://m.media-amazon.com/images/I/A1ZNgz1Dm7L._CR0,0,1920,1013_SR580,306_.png",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/A1ZNgz1Dm7L.png",
          "video_image_width": "1920",
          "video_image_height": "1080",
          "video_image_extension": "png",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/9a0d7761-394a-49af-8cea-0eafc696f959/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/458d0f93-144c-4e2b-88cb-bb4dbf5c1b5f/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:32",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/c4cdd32e-67a4-49be-866e-c867de804d34.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.09cdd67651a04329ac301e37b10c606b",
          "product_asin": "B08SLNT168",
          "parent_asin": "B08SLNT168",
          "related_products": "B08H58YLP7",
          "sponsor_products": "true",
          "title": "RUNNING GIRL Criss-Cross Back Strappy Sports Bra Close Up",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/stillaslife_4356d602-cb34-420a-9b84-fdc38030c872.jpeg",
          "profile_link": "/shop/stillaslife",
          "public_name": "Still As Life",
          "creator_type": "Influencer",
          "vendor_code": "stillaslife:shop",
          "vendor_name": "Still As Life",
          "vendor_tracking_id": "onamzstillasl-20",
          "video_image_id": "51X9J5KHCTL",
          "video_image_url": "https://m.media-amazon.com/images/I/51X9J5KHCTL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51X9J5KHCTL.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/47aa193c-e958-49bf-a392-690a9396e80e/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/c0aca201-bbb5-42ff-8797-b49a4a4fc2e9/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "1:02",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0b260c4163e04a7b9831ac57fcc71a07",
          "product_asin": "B08SLNT168",
          "parent_asin": "B08SLNT168",
          "related_products": "B07X7T9RP4, B093GH1X7M, B094R4NW7N",
          "sponsor_products": "true",
          "title": "Favorite Finds: Athletic Gear",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/influencer-ffddba94_1569241667443_original._CR0,0,957,957_._FMjpg_.jpeg",
          "profile_link": "/shop/influencer-ffddba94",
          "public_name": "Gabbing Ginger",
          "creator_type": "Influencer",
          "vendor_code": "influencer-ffddba94:shop",
          "vendor_name": "Gabbing Ginger",
          "vendor_tracking_id": "gabbingginger-20",
          "video_image_id": "914NAOnojJL",
          "video_image_url": "https://m.media-amazon.com/images/I/914NAOnojJL._CR286,0,1478,780_SR580,306_.png",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/914NAOnojJL.png",
          "video_image_width": "2050",
          "video_image_height": "780",
          "video_image_extension": "png",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/a69e8f55-bd08-41fa-b7d9-579c72d19653/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/76d72c95-f80f-48c0-a84c-516e40d54253/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:27",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/ef14009c-e5e2-455f-8044-8b8784ffbf57.vtt",
          "type": "videos_for_this_product"
        }
      ],
      "is_bundle": false,
      "attributes": [
        {
          "name": "size",
          "value": "Select"
        },
        {
          "name": "color",
          "value": "A-white"
        }
      ],
      "buybox_winner": {
        "is_prime": false,
        "is_amazon_fresh": false,
        "condition": {
          "is_new": true
        },
        "fulfillment": {
          "type": "1p",
          "is_sold_by_amazon": true,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": false
        },
        "price": {
          "symbol": "$",
          "value": 16.99,
          "currency": "USD",
          "raw": "$16.99"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 21,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Sports Bras",
          "rank": 1,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1044990/ref=pd_zg_hrsr_fashion"
        }
      ],
      "dimensions": "0.79 x 12.6 x 7.87 inches; 3.84 Ounces",
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 21, Category: Women's Sports Bras | Rank: 1"
    }
  };

  let result = await isBackDetailKeySellingFeature(payload, keywordsList);
  expect(result).toBe(true);
});

it("athletic-back-detection-fail-1", async () => {
//https://www.amazon.com/RUNNING-GIRL-Strappy-Crisscross-Removable/dp/B07X4VB3D6/ref=sr_1_16?keywords=sports+bras+for+women&qid=1664528823&qu=eyJxc2MiOiI5LjAxIiwicXNhIjoiOC44NyIsInFzcCI6IjguNTMifQ%3D%3D&sprefix=sports+%2Caps%2C360&sr=8-16

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 828,
      "overage_used": 328,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/wirarpa-Comfortable-Ultimate-Wireless-Non-Padded/dp/B09GBC5DZ1/ref=sr_1_4_sspa?crid=27ADYKCP43QB8&keywords=bras&qid=1664787836&qu=eyJxc2MiOiIxMS4zMiIsInFzYSI6IjEwLjgyIiwicXNwIjoiMTAuMzEifQ==&sprefix=bras,aps,373&sr=8-4-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExRVZCRE00TVpRN04wJmVuY3J5cHRlZElkPUExMDQ2MTM1MlpUOUZLVzJDUlpHOSZlbmNyeXB0ZWRBZElkPUEwMzUyMzQxMVBHT1QxTk1SQzRMRiZ3aWRnZXROYW1lPXNwX2F0ZiZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU="
    },
    "product": {
      "title": "wirarpa Women's Bras Wireless Full Coverage Plus Size Minimizer Non Padded Comfort Soft Bra Multipack W-beige-1pack 40DDD",
      "title_excluding_variant_name": "wirarpa Women's Bras Wireless Full Coverage Plus Size Minimizer Non Padded Comfort Soft Bra Multipack",
      "keywords": "wirarpa,Women's,Bras,Wireless,Full,Coverage,Plus,Size,Minimizer,Non,Padded,Comfort,Soft,Bra,Multipack",
      "keywords_list": [
        "wirarpa",
        "Women's",
        "Bras",
        "Wireless",
        "Full",
        "Coverage",
        "Plus",
        "Size",
        "Minimizer",
        "Padded",
        "Comfort",
        "Soft",
        "Multipack"
      ],
      "asin": "B09GBC5DZ1",
      "link": "https://www.amazon.com/dp/B09GBC5DZ1??th=1&psc=1",
      "has_size_guide": true,
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
          "name": "Lingerie",
          "link": "https://www.amazon.com/Lingerie/b/ref=dp_bc_aui_C_5?ie=UTF8&node=14333511",
          "category_id": "14333511"
        },
        {
          "name": "Bras",
          "link": "https://www.amazon.com/Womens-Bras/b/ref=dp_bc_aui_C_6?ie=UTF8&node=1044960",
          "category_id": "1044960"
        },
        {
          "name": "Everyday Bras",
          "link": "https://www.amazon.com/Everyday-Bras/b/ref=dp_bc_aui_C_7?ie=UTF8&node=2376204011",
          "category_id": "2376204011"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Lingerie, Sleep & Lounge > Lingerie > Bras > Everyday Bras",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "brand_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/10c8fac9-b116-4d40-aad4-7d3291d3e668.__CR0,0,315,145_PT0_SX315_V1___.jpg",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/d3d9c0bf-6176-4f4c-a88b-6f7421118429.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
          "description": "A professional underwear brand dedicated to creating extreme comfort for women and men.",
          "brand_store": {
            "link": "/stores/page/D914E3F8-B091-4DC0-8A9B-E2E7430B615C",
            "id": "D914E3F8-B091-4DC0-8A9B-E2E7430B615C"
          },
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/d3d9c0bf-6176-4f4c-a88b-6f7421118429.__CR0,0,1464,625_PT0_SX1464_V1___.jpg"
          ],
          "faqs": [
            {
              "title": "WHY NEED  WIRARPA",
              "body": "Great quality and Great value  Provides more comfort, without changing the habits of wearing."
            },
            {
              "title": "WHAT YOU CAN GET FROM US",
              "body": "Finding your perfect pair is a cinch because no day should begin (or end) with a pinch"
            }
          ],
          "products": [
            {
              "title": "Everyday Bra",
              "asin": "B09GB8KQB3",
              "link": "/dp/B09GB8KQB3/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/ae7e0559-d9fc-4a6e-a01b-46c3d338be21.__CR56,0,1167,1280_PT0_SX166_V1___.jpg"
            },
            {
              "title": "Bra",
              "asin": "B09PZRLJBW",
              "link": "/dp/B09PZRLJBW/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/02ed18a1-82c1-468f-988c-261681d7ac8a.__AC_SR166,182___.jpg"
            },
            {
              "title": "BRA",
              "asin": "B09WYRWNY9",
              "link": "/dp/B09WYRWNY9/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/883c011a-5ec3-4c9c-a59d-3ba710311664.__AC_SR166,182___.jpg"
            },
            {
              "title": "wirarpa Women's Minimizer Bras No Underwire Comfortable Full Coverage Wide Strap Plus Size No Pad...",
              "asin": "B09WYWB966",
              "link": "/dp/B09WYWB966/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/bf7234dc-af77-404e-9226-c758bdf3a680.__CR56,0,1167,1280_PT0_SX166_V1___.jpg"
            },
            {
              "title": "plus size bra",
              "asin": "B09GB87RYG",
              "link": "/dp/B09GB87RYG/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/f453aecf-e2ec-4c58-8f37-b9e365d9eee6.__CR0,0,664,728_PT0_SX166_V1___.jpg"
            },
            {
              "title": "plus size bra",
              "asin": "B09GB2WF67",
              "link": "/dp/B09GB2WF67/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/35618b60-fede-4128-9dd0-e78c5accd521.__CR255,0,1131,1240_PT0_SX166_V1___.jpg"
            },
            {
              "title": "underwear",
              "asin": "B07MTCLS8Z",
              "link": "/dp/B07MTCLS8Z/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/bbee6030-382f-451f-8eef-e60d6fce3002.__CR0,0,664,728_PT0_SX166_V1___.jpg"
            },
            {
              "title": "wirarpa Women's High Waisted Cotton Underwear Soft Full Briefs Ladies Breathable Panties Multipack",
              "asin": "B07RGFK9ZV",
              "link": "/dp/B07RGFK9ZV/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/ae54e7dc-b037-430e-9d3e-4bc502eb2f22.__CR686,0,2129,2334_PT0_SX166_V1___.jpg"
            },
            {
              "title": "boy shorts",
              "asin": "B09QWBS9XZ",
              "link": "/dp/B09QWBS9XZ/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/f37f18e3-7025-4cae-b831-d08de2f07d64.__CR0,0,664,728_PT0_SX166_V1___.jpg"
            },
            {
              "title": "boy shorts",
              "asin": "B098QCS82L",
              "link": "/dp/B098QCS82L/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/56949c55-e0af-4a40-992e-741a7e7fb409.__CR0,0,664,728_PT0_SX166_V1___.jpg"
            },
            {
              "title": "boy shorts",
              "asin": "B083GWB5Z2",
              "link": "/dp/B083GWB5Z2/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/6cf53eb4-9b48-4700-a2bf-c64189569f36.__CR0,0,664,728_PT0_SX166_V1___.jpg"
            },
            {
              "title": "women&amp;#39;s underwear",
              "asin": "B082KWRSQM",
              "link": "/dp/B082KWRSQM/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/0c829885-0bb6-4347-9a90-6209cf4d30ed.__CR0,0,664,728_PT0_SX166_V1___.jpg"
            },
            {
              "title": "boy shorts",
              "asin": "B06XPSHZS1",
              "link": "/dp/B06XPSHZS1/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/6cf53eb4-9b48-4700-a2bf-c64189569f36.__CR0,0,664,728_PT0_SX166_V1___.jpg"
            },
            {
              "title": "men&#39;s briefs",
              "asin": "B08S33J5WH",
              "link": "/dp/B08S33J5WH/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/1ea2b56e-20d8-47eb-92f0-eda94103e695.__CR16,0,328,360_PT0_SX166_V1___.jpg"
            },
            {
              "title": "wirarpa Men's Boxer Briefs Cotton Stretch Underwear Open Fly Tagless Underpants Regular Leg 4 Pack",
              "asin": "B0B4B2GPJY",
              "link": "/dp/B0B4B2GPJY/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/a2991a1a-980c-4730-8974-74ea48afaf3f.__CR16,0,328,360_PT0_SX166_V1___.jpg"
            },
            {
              "title": "underwear",
              "asin": "B08LL6S3XV",
              "link": "/dp/B08LL6S3XV/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/340dc9b3-92a7-45d5-beb1-548631501253.__CR0,0,664,728_PT0_SX166_V1___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/4d1f628c-5901-47d4-a988-64717b8fba06.__CR0,0,600,180_PT0_SX600_V1___.jpg",
        "company_description_text": "A professional underwear brand dedicated to creating extreme comfort for women and men.  Founded in 2017, with great quality and material, to promote the experience and feeling of everyday wearing."
      },
      "sub_title": {
        "text": "Learn more Read full return policy",
        "link": "https://www.amazon.com/gp/help/customer/display.html?nodeId=201909010&ref_=buybox-secureTransaction-learnMore-web"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.1,
      "ratings_total": 1879,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/618UhfNMIML.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/618UhfNMIML._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61FTZUNOlWL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61uPDKCCjSL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71eF79e8zoL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/715wt-Gu1tL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71OQGILU6eL._AC_UL1500_.jpg",
          "variant": "PT05"
        },
        {
          "link": "https://m.media-amazon.com/images/I/618UhfNMIML._AC_UL1500_.jpg",
          "variant": "PT08"
        }
      ],
      "images_count": 7,
      "videos": [
        {
          "duration_seconds": 26,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/510469af-4067-4cf6-a524-0ccc108fbcd9/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/71-rVjn6TrL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "wirarpa women's plus size bras wireless"
        }
      ],
      "videos_count": 1,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/510469af-4067-4cf6-a524-0ccc108fbcd9/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.0ba6b184b99d494aaca521fef8d088c4",
          "product_asin": "B09GBC5DZ1",
          "parent_asin": "B09GB6BDD2",
          "sponsor_products": "true",
          "title": "wirarpa Women's Bras Comfortable",
          "profile_image_url": "https://www.amazon.com/avatar/default/amzn1.account.AGLOQTXTCCCBGOYUHLWYPQHVDW6Q?max_width=110&square=true",
          "profile_link": "/gp/profile/amzn1.account.AGLOQTXTCCCBGOYUHLWYPQHVDW6Q",
          "public_name": "Dorothy Abramov",
          "creator_type": "Customer",
          "vendor_code": "UGCPR",
          "vendor_name": "Dorothy Abramov",
          "video_image_id": "91rMYgwu9WL",
          "video_image_url": "https://m.media-amazon.com/images/I/91rMYgwu9WL._CR0,0,1348,711_SR580,306_.png",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/91rMYgwu9WL.png",
          "video_image_width": "1348",
          "video_image_height": "749",
          "video_image_extension": "png",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/52ecddea-21f7-4e17-8293-1282367c0862/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/cb2603ba-9612-43c3-b53f-bf7f5aa879da/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "2:13",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/9892f9bc-c558-4ac3-87e5-8e4aef322a2c.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.01c10e0bd4ae442582880d69260161fc",
          "product_asin": "B09GBC5DZ1",
          "parent_asin": "B09GB6BDD2",
          "sponsor_products": "true",
          "title": "wirarpa minimizer bras for women full coverage",
          "public_name": "US-WLP",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "US-WLP",
          "video_image_id": "51AGnTdqKKL",
          "video_image_url": "https://m.media-amazon.com/images/I/51AGnTdqKKL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51AGnTdqKKL.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/baf59534-9dee-4ba1-a24b-546fb09af91a/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/9519dce3-47b9-49d8-a666-93fa3d4e8300/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:26",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0da9be9903f54790a1b7a3ae33b6dca6",
          "product_asin": "B09GBC5DZ1",
          "parent_asin": "B09GB6BDD2",
          "sponsor_products": "true",
          "title": "Measurement for Women's Bra ",
          "public_name": "US-WLP",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "US-WLP",
          "video_image_id": "A13D-dfwdtL",
          "video_image_url": "https://m.media-amazon.com/images/I/A13D-dfwdtL._CR0,0,1920,1013_SR580,306_.png",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/A13D-dfwdtL.png",
          "video_image_width": "1920",
          "video_image_height": "1080",
          "video_image_extension": "png",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/712386ab-d133-45f0-9e37-c296b98e7421/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/c990c9b0-6c8f-49b9-88e0-c50560eafaa3/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "1:07",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/2dd072b8-c4ee-435a-bd0c-3b007a5a9bb4.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.02a222b0740544a09d2505c7e93d1754",
          "product_asin": "B09GBC5DZ1",
          "parent_asin": "B09GB6BDD2",
          "sponsor_products": "true",
          "title": "wirarpa Women's Wireless Comfort Bras",
          "public_name": "US-WLP",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "US-WLP",
          "video_image_id": "51S0uVUKkbL",
          "video_image_url": "https://m.media-amazon.com/images/I/51S0uVUKkbL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51S0uVUKkbL.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/4a44c87b-dc2d-4b62-9c91-c111b29eeed3/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/15657601-bad6-48e2-9f35-0812f7842fdf/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:33",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0a38bf23c92f48afb52c2be0f970b3b3",
          "product_asin": "B09GBC5DZ1",
          "parent_asin": "B09GB6BDD2",
          "related_products": "B09GB9CV8W",
          "sponsor_products": "true",
          "title": "Wireless but with support",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/influencer-83493954_1622291499240_original._CR569,293,1928,1928_._FMjpg_.jpeg",
          "profile_link": "/shop/influencer-83493954",
          "public_name": "Becky Childs",
          "creator_type": "Influencer",
          "vendor_code": "influencer-83493954:shop",
          "vendor_name": "Becky Childs",
          "vendor_tracking_id": "onamzbecky21-20",
          "video_image_id": "5149TcEGp1L",
          "video_image_url": "https://m.media-amazon.com/images/I/5149TcEGp1L._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/5149TcEGp1L.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/a64c6d20-ebaa-4060-b5d0-a7a1fb2eff98/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/031e034e-8ce3-42da-9e30-6d88abc2c4ce/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:28",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/1ca2f092-2e06-4e80-b88d-7945f880a937.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.083ae380cedb4c8f97ad9553fdab8432",
          "product_asin": "B09GBC5DZ1",
          "parent_asin": "B09GB6BDD2",
          "sponsor_products": "true",
          "title": "wirarpa minimizer bras for women wirefree",
          "public_name": "US-WLP",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "US-WLP",
          "video_image_id": "A1k660vGPXL",
          "video_image_url": "https://m.media-amazon.com/images/I/A1k660vGPXL._CR0,0,1920,1013_SR580,306_.png",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/A1k660vGPXL.png",
          "video_image_width": "1920",
          "video_image_height": "1080",
          "video_image_extension": "png",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/c704a1eb-e3bd-450d-86b4-b6e5598481e5/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/3b4c8dd3-9c12-43fc-b4b4-f285d10fbe77/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:20",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.040b0dbdf22441dfae613608f52c56ad",
          "product_asin": "B09GBC5DZ1",
          "parent_asin": "B09GB6BDD2",
          "related_products": "B09GBB7222",
          "sponsor_products": "true",
          "title": "wirarpa Women's Bras Wireless Full Coverage",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/influencer-bffb7f2f_1631376113917_original._CR219,0,812,812_._FMjpg_.jpeg",
          "profile_link": "/shop/influencer-bffb7f2f",
          "public_name": "Real Mom Stuff",
          "creator_type": "Influencer",
          "vendor_code": "influencer-bffb7f2f:shop",
          "vendor_name": "Real Mom Stuff",
          "vendor_tracking_id": "gmcinfluenc02-20",
          "video_image_id": "91DoTI7e9yL",
          "video_image_url": "https://m.media-amazon.com/images/I/91DoTI7e9yL._CR0,0,1280,675_SR580,306_.png",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/91DoTI7e9yL.png",
          "video_image_width": "1280",
          "video_image_height": "720",
          "video_image_extension": "png",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/27554cd9-258e-4f56-a29e-aa0252fe8d5a/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/ba85eb3c-f4eb-4db5-9198-5e482b615cb9/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "1:00",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/56c23751-4a09-4106-84c7-3f2c80fc8b86.vtt",
          "type": "videos_for_this_product"
        }
      ],
      "is_bundle": false,
      "attributes": [
        {
          "name": "size",
          "value": "40DDD"
        },
        {
          "name": "color",
          "value": "W-beige-1pack"
        }
      ],
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 30,
          "hard_maximum": true
        },
        "offer_id": "11epwmxeijo7FjjzKraUCQLPpXHAP5m8s8onT1S7mTGpJ+5yoQtHjq39BEzYAqi7lDlu5Gthb7N6urVu1AqoPOAS9NGefkBhHdK+B6WwTr8AGe8908zbs1WoZG1wnfGAPKyGEclA1hnGNWYbf8kthDrgsZDmaBXrB1LT7WoV25HbWlH06DWtOIcPZ5TKli6K",
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
          "type": "2p",
          "standard_delivery": {
            "date": "Sun, Oct 9",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Tomorrow, Oct 4",
            "name": "Or fastest delivery Tomorrow, Oct 4. Order within 7 hrs 40 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "US-WLP",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A8JTVSZ36YUA6&asin=B09GBC5DZ1&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A8JTVSZ36YUA6"
          }
        },
        "price": {
          "symbol": "$",
          "value": 28.99,
          "currency": "USD",
          "raw": "$28.99"
        },
        "rrp": {
          "symbol": "$",
          "value": 39.99,
          "currency": "USD",
          "raw": "$39.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      }
    },
    "frequently_bought_together": {
      "total_price": {
        "symbol": "$",
        "value": 55.98,
        "currency": "USD",
        "raw": "$55.98"
      },
      "products": [
        {
          "asin": "B09GBC5DZ1",
          "title": "wirarpa Women's Bras Wireless Full Coverage Plus Size Minimizer Non Padded Comfort Soft Bra Multipack",
          "link": "https://www.amazon.com/dp/B09GBC5DZ1",
          "image": "https://m.media-amazon.com/images/G/01/3ed00923-88b6-42e0-9eec-ee78f426b346/HQP_Explore_Logo_75x75._SS75_CB621903126_.jpg",
          "price": {
            "symbol": "$",
            "value": 28.99,
            "currency": "USD",
            "raw": "$28.99"
          }
        },
        {
          "asin": "B0928JDT8H",
          "title": "Deyllo Women's Full Coverage Plus Size Comfort Minimizer Bra Wirefree Non Padded",
          "link": "https://www.amazon.com/dp/B0928JDT8H",
          "image": "https://images-na.ssl-images-amazon.com/images/I/81giQwzvh1L._AC_UL116_SR116,116_.jpg",
          "price": {
            "symbol": "$",
            "value": 26.99,
            "currency": "USD",
            "raw": "$26.99"
          }
        }
      ]
    }
  };

  let result = await isBackDetailKeySellingFeature(payload, keywordsList);
  expect(result).toBe(false);
});

it("athletic-back-detection-fail-2", async () => {

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 881,
      "overage_used": 381,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/RUNNING-GIRL-Criss-Cross-Strappy-Removable/dp/B09XHWJ85V/ref=sr_1_4_sspa?crid=3OBEABCG8SXOF&keywords=sports bra&qid=1664867611&qu=eyJxc2MiOiI5LjMzIiwicXNhIjoiOS4xOSIsInFzcCI6IjguNzYifQ==&sprefix=sports br,aps,346&sr=8-4-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUFYTkZUVEhZMzZPNVAmZW5jcnlwdGVkSWQ9QTA0MTEyMjgzMTMzQ1ZTWE5EUUFVJmVuY3J5cHRlZEFkSWQ9QTEwMjQ1MDMzREZPWVZJT1FEVU5FJndpZGdldE5hbWU9c3BfYXRmJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ=="
    },
    "product": {
      "title": "RUNNING GIRL Sports Bra for Women, Medium-High Support Criss-Cross Back Strappy Padded Sports Bras Supportive Workout Tops Green Medium",
      "title_excluding_variant_name": "RUNNING GIRL Sports Bra for Women, Medium-High Support Criss-Cross Back Strappy Padded Sports Bras Supportive Workout Tops",
      "keywords": "RUNNING,GIRL,Sports,Bra,for,Women,,Medium-High,Support,Criss-Cross,Back,Strappy,Padded,Sports,Bras,Supportive,Workout,Tops",
      "keywords_list": [
        "RUNNING",
        "GIRL",
        "Sports",
        "Women",
        "Medium-High",
        "Support",
        "Criss-Cross",
        "Back",
        "Strappy",
        "Padded",
        "Sports",
        "Bras",
        "Supportive",
        "Workout",
        "Tops"
      ],
      "asin": "B09XHWJ85V",
      "link": "https://www.amazon.com/dp/B09XHWJ85V??th=1&psc=1",
      "brand": "RUNNING GIRL",
      "has_size_guide": true,
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
          "name": "Lingerie",
          "link": "https://www.amazon.com/Lingerie/b/ref=dp_bc_aui_C_5?ie=UTF8&node=14333511",
          "category_id": "14333511"
        },
        {
          "name": "Bras",
          "link": "https://www.amazon.com/Womens-Bras/b/ref=dp_bc_aui_C_6?ie=UTF8&node=1044960",
          "category_id": "1044960"
        },
        {
          "name": "Sports Bras",
          "link": "https://www.amazon.com/Womens-Sports-Bras/b/ref=dp_bc_aui_C_7?ie=UTF8&node=1044990",
          "category_id": "1044990"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Lingerie, Sleep & Lounge > Lingerie > Bras > Sports Bras",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "brand_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/f21c4da1-daed-412c-865d-d61f1c8e9d0a.__CR0,0,315,145_PT0_SX315_V1___.jpg",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/7f817ec7-ad88-44c3-8fa8-6afe226f8d8b.__CR0,55,1600,683_PT0_SX1464_V1___.jpg",
          "description": "Designed for a compression fit, Maximum Support sports bras are constructed with thicker straps and wider hems. They are created for stability & comfort. Perfect for medium/ high-impact workouts such as tennis、HIIT training、yoga、running and cardio,fit snugly to the body for additional lift and support. They will hold you in without holding you back.They are our most supportive bras!",
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/7f817ec7-ad88-44c3-8fa8-6afe226f8d8b.__CR0,55,1600,683_PT0_SX1464_V1___.jpg"
          ],
          "products": [
            {
              "title": "Green sports bra",
              "asin": "B09XHWJ85V",
              "link": "/dp/B09XHWJ85V/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/a128c295-c7a9-493b-9cab-0150e4fb7b74.__CR33,0,1287,1411_PT0_SX166_V1___.jpg"
            },
            {
              "title": "Brown sports bra",
              "asin": "B09XHVMCCV",
              "link": "/dp/B09XHVMCCV/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/449b77c0-7d24-4c03-b8ca-115deb519c33.__CR23,0,1282,1406_PT0_SX166_V1___.jpg"
            },
            {
              "title": "yellow sports bra",
              "asin": "B09XHVRWJ5",
              "link": "/dp/B09XHVRWJ5/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/828fce7f-5744-4fb8-83ed-185d49ac2496.__CR22,0,1298,1423_PT0_SX166_V1___.jpg"
            },
            {
              "title": "white sports bra",
              "asin": "B09XHVJ1N3",
              "link": "/dp/B09XHVJ1N3/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/c6d0f3d5-9aaf-49f5-a7ee-34959365170c.__CR33,0,1273,1396_PT0_SX166_V1___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/1091ef8a-6ad5-4c4f-a98c-e90a93b08e71.__CR0,0,600,180_PT0_SX600_V1___.jpg",
        "company_description_text": "Designed for a compression fit, Maximum Support sports bras are constructed with thicker straps and wider hems. They are created for stability & comfort. Perfect for medium/ high-impact workouts such as tennis、HIIT training、yoga、running and cardio,fit snugly to the body for additional lift and support. They will hold you in without holding you back.They are our most supportive bras!"
      },
      "sub_title": {
        "text": "Visit the RUNNING GIRL Store",
        "link": "https://www.amazon.com/stores/RUNNINGGIRL/page/B7ACC67E-2539-43EF-98B5-E77ACC4F1B02?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.4,
      "ratings_total": 344,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/61QLOT+YWEL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/61QLOT+YWEL._AC_UL1367_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/511DrC7HVSL._AC_UL1318_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71Lwuz0qxuL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71mJpZzqBML._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71j0RPW23DL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71yPLBcVf9L._AC_UL1500_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "videos": [
        {
          "duration_seconds": 32,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/a351e5e6-88ea-491f-8182-4d0dbf0601a3/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/B1SA0F76V9L.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Sports bras for women-more comfort, more movement, more love"
        }
      ],
      "videos_count": 1,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/a351e5e6-88ea-491f-8182-4d0dbf0601a3/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.01abf3ccbadc4a549d2d2922fdda73ed",
          "product_asin": "B09XHWJ85V",
          "parent_asin": "B09XHX6NLZ",
          "related_products": "B09XHV8H4T, B09XHVPW12, B09XHVMCCV, B09XHXF1QF, B09XHVRWJ5",
          "sponsor_products": "true",
          "title": "Sports bras for women-more comfort, more movement, more love",
          "public_name": "RUNNING GIRL",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "RUNNING GIRL",
          "video_image_id": "B1SA0F76V9L",
          "video_image_url": "https://m.media-amazon.com/images/I/B1SA0F76V9L._CR0,0,3840,2026_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/B1SA0F76V9L.jpg",
          "video_image_width": "3840",
          "video_image_height": "2160",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/a351e5e6-88ea-491f-8182-4d0dbf0601a3/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/9c068f4b-1eb9-447e-b067-4c56867e5207/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:32",
          "type": "videos_for_this_product"
        }
      ],
      "is_bundle": false,
      "attributes": [
        {
          "name": "size",
          "value": "Medium"
        },
        {
          "name": "color",
          "value": "Green"
        }
      ],
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 10,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Mon, Oct 10",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Thu, Oct 6",
            "name": "Or fastest delivery Thu, Oct 6. Order within 21 hrs 30 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "RUNNING GIRL",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A175AG80UVDQ2Q&asin=B09XHWJ85V&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A175AG80UVDQ2Q"
          }
        },
        "price": {
          "symbol": "$",
          "value": 21.99,
          "currency": "USD",
          "raw": "$21.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 59972,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Sports Bras",
          "rank": 279,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1044990/ref=pd_zg_hrsr_fashion"
        }
      ],
      "dimensions": "14.17 x 8.66 x 1 inches; 3.53 Ounces",
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 59972, Category: Women's Sports Bras | Rank: 279"
    },
    "frequently_bought_together": {
      "total_price": {
        "symbol": "$",
        "value": 59.97,
        "currency": "USD",
        "raw": "$59.97"
      },
      "products": []
    }
  };

  let result = await isBackDetailKeySellingFeature(payload, keywordsList);
  expect(result).toBe(true);
});

it("athletic-back-detection-fail-3", async () => {

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 902,
      "overage_used": 402,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/SYROKAN-Support-Racerback-Lightly-Underwire/dp/B07VK7V8NV/ref=sxin_36_pa_sp_search_thematic_sspa"
    },
    "product": {
      "title": "SYROKAN Women's Full Support High Impact Racerback Lightly Lined Underwire Sports Bra",
      "keywords": "SYROKAN,Women's,Full,Support,High,Impact,Racerback,Lightly,Lined,Underwire,Sports,Bra",
      "keywords_list": [
        "SYROKAN",
        "Women's",
        "Full",
        "Support",
        "High",
        "Impact",
        "Racerback",
        "Lightly",
        "Lined",
        "Underwire",
        "Sports"
      ],
      "asin": "B0722VV59B",
      "link": "https://www.amazon.com/SYROKAN-Support-Racerback-Lightly-Underwire/dp/B09TPKF5FF",
      "brand": "SYROKAN",
      "variants_message": "ASIN has more than 400 variants so to minimise response size only ASIN and title are returned",
      "has_size_guide": true,
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
          "name": "Lingerie",
          "link": "https://www.amazon.com/Lingerie/b/ref=dp_bc_aui_C_5?ie=UTF8&node=14333511",
          "category_id": "14333511"
        },
        {
          "name": "Bras",
          "link": "https://www.amazon.com/Womens-Bras/b/ref=dp_bc_aui_C_6?ie=UTF8&node=1044960",
          "category_id": "1044960"
        },
        {
          "name": "Sports Bras",
          "link": "https://www.amazon.com/Womens-Sports-Bras/b/ref=dp_bc_aui_C_7?ie=UTF8&node=1044990",
          "category_id": "1044990"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Lingerie, Sleep & Lounge > Lingerie > Bras > Sports Bras",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "brand_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/17c5fd52-c18d-44c3-9cc9-0d3e6d13a6d8.__CR0,0,315,145_PT0_SX315_V1___.jpg",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/711fcf58-2137-4ed3-94e9-d04a68a97922.__CR1,0,1464,625_PT0_SX1464_V1___.jpg",
          "description": "Focusing on developing excellent athletic bras for sportsperson and sports lovers alike, SYROKAN is a professional sports bras brand which combines technical fabrics with healthy sporty fashion life style.",
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/711fcf58-2137-4ed3-94e9-d04a68a97922.__CR1,0,1464,625_PT0_SX1464_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/b18e30ea-38a2-4772-a816-d70ac7f6a993.__CR0,0,362,453_PT0_SX362_V1___.jpg"
          ],
          "products": [
            {
              "title": "A233",
              "asin": "B09TPKF5FF",
              "link": "/dp/B09TPKF5FF/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/3ab4983e-2f20-4c83-9675-558230e57bcb.__AC_SR166,182___.jpg"
            },
            {
              "title": "A262",
              "asin": "B09TPRQ64K",
              "link": "/dp/B09TPRQ64K/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/5ddf4fb7-fc6e-421f-acf1-6b9cb746704b.__AC_SR166,182___.jpg"
            },
            {
              "title": "A217",
              "asin": "B00O9YXBOK",
              "link": "/dp/B00O9YXBOK/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/300d4efd-7099-4056-916f-42ec0e499d8d.__AC_SR166,182___.jpg"
            },
            {
              "title": "A227",
              "asin": "B01MZ8QDSU",
              "link": "/dp/B01MZ8QDSU/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/7c0bb61c-3e08-4334-8c5b-7005dc39d09b.__CR0,0,166,182_PT0_SX166_V1___.jpg"
            },
            {
              "title": "A251",
              "asin": "B01M2DGOZF",
              "link": "/dp/B01M2DGOZF/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/081ee677-3492-4c6f-b1f2-7574aefb8c00.__AC_SR166,182___.jpg"
            },
            {
              "title": "A007",
              "asin": "B01GCG06KY",
              "link": "/dp/B01GCG06KY/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/938d6db6-0e09-4e33-8261-ed62d43f540f.__AC_SR166,182___.jpg"
            },
            {
              "title": "A240",
              "asin": "B09TPLVMCQ",
              "link": "/dp/B09TPLVMCQ/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/bb91f7f3-99ee-4584-b7fb-d5ebbc8c7232.__AC_SR166,182___.jpg"
            },
            {
              "title": "A196",
              "asin": "B07G77YJLB",
              "link": "/dp/B07G77YJLB/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/88f9a981-10df-4fea-866d-cabb068a696a.__AC_SR166,182___.jpg"
            },
            {
              "title": "A304",
              "asin": "B09TQKDDFM",
              "link": "/dp/B09TQKDDFM/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/c77486bb-f34e-489c-a48e-df7279f9fb69.__AC_SR166,182___.jpg"
            },
            {
              "title": "A305",
              "asin": "B09WHZW3MN",
              "link": "/dp/B09WHZW3MN/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/43106f36-a11b-412c-b84d-9f0c80a48b61.__AC_SR166,182___.jpg"
            },
            {
              "title": "A307",
              "asin": "B0B1V4F2F2",
              "link": "/dp/B0B1V4F2F2/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/57da8113-b6f9-487b-8227-f99a42d6b3c0.__AC_SR166,182___.jpg"
            },
            {
              "title": "A308",
              "asin": "B09WN1DHD3",
              "link": "/dp/B09WN1DHD3/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/9020194c-e4d5-4508-ac48-bb7d7d952d93.__AC_SR166,182___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/17c5fd52-c18d-44c3-9cc9-0d3e6d13a6d8.__CR0,0,315,145_PT0_SX315_V1___.jpg",
        "company_description_text": "Focusing on developing excellent athletic bras for sportsperson and sports lovers alike, SYROKAN is a professional sports bras brand which combines technical fabrics with healthy sporty fashion life style.  We provide different kinds of sport bras which effectively help to enhance athletic performance and comfort."
      },
      "sub_title": {
        "text": "Visit the SYROKAN Store",
        "link": "https://www.amazon.com/stores/SYROKAN/page/5D9F212B-C617-4C27-A731-7E6425DF0A55?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.2,
      "ratings_total": 17180,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/91S-00d858L.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/91S-00d858L._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/91bXRDPoMoL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/918-tpqusRL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/919NtlNlK2L._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/719o+FgC61L._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/91+y1sz7cmL._AC_UL1500_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "is_bundle": false,
      "attributes": [
        {
          "name": "size",
          "value": "Select"
        },
        {
          "name": "color",
          "value": "Brick"
        }
      ],
      "buybox_winner": {
        "is_prime": false,
        "is_amazon_fresh": false,
        "condition": {
          "is_new": true
        },
        "fulfillment": {
          "type": "1p",
          "is_sold_by_amazon": true,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": false
        },
        "price": {
          "symbol": "$",
          "value": 26,
          "currency": "USD",
          "raw": "$26.00"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 8278,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Sports Bras",
          "rank": 64,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1044990/ref=pd_zg_hrsr_fashion"
        }
      ],
      "dimensions": "15.75 x 7.87 x 1.97 inches; 2.4 Ounces",
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 8278, Category: Women's Sports Bras | Rank: 64"
    }
  };

  let result = await isBackDetailKeySellingFeature(payload, keywordsList);
  expect(result).toBe(true);
});

//Accessory Detection

it("accessory-detection-pass-case-1", async () => {

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 1003,
      "overage_used": 503,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/MoZiKQin-Halloween-Crewneck-Sweatshirt-Pullover/dp/B0B87W3C5H/ref=sr_1_2?crid=2GX747SLDZDTS&keywords=All Kids & Baby clothing&qid=1665035163&sprefix=all kids & baby clothing,aps,347&sr=8-2"
    },
    "product": {
      "title": "Toddler Baby Halloween Outfit Boy Girl Pumpkin Sweatshirt Crewneck Pullover Sweater Long Sleeve Shirt Fall Clothes",
      "keywords": "Toddler,Baby,Halloween,Outfit,Boy,Girl,Pumpkin,Sweatshirt,Crewneck,Pullover,Sweater,Long,Sleeve,Shirt,Fall,Clothes",
      "keywords_list": [
        "Toddler",
        "Baby",
        "Halloween",
        "Outfit",
        "Girl",
        "Pumpkin",
        "Sweatshirt",
        "Crewneck",
        "Pullover",
        "Sweater",
        "Long",
        "Sleeve",
        "Shirt",
        "Fall",
        "Clothes"
      ],
      "asin": "B0B6C1F2HJ",
      "link": "https://www.amazon.com/Toddler-Halloween-Sweatshirt-Crewneck-Pullover/dp/B0B3T929JY",
      "brand": "MoZiKQin",
      "bestseller_badge": {
        "link": "https://www.amazon.com/gp/bestsellers/fashion/2475784011/ref=zg_b_bs_2475784011_1",
        "category": "Baby Girls' Hoodies & Activewear",
        "badge_text": "#1 Best Seller"
      },
      "has_size_guide": true,
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
          "name": "Baby",
          "link": "https://www.amazon.com/Baby-Clothing-Shoes/b/ref=dp_bc_aui_C_2?ie=UTF8&node=7147444011",
          "category_id": "7147444011"
        },
        {
          "name": "Baby Girls",
          "link": "https://www.amazon.com/Baby-Girls-Clothing-Shoes/b/ref=dp_bc_aui_C_3?ie=UTF8&node=7628012011",
          "category_id": "7628012011"
        },
        {
          "name": "Clothing",
          "link": "https://www.amazon.com/Baby-Girls-Clothing/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1044512",
          "category_id": "1044512"
        },
        {
          "name": "Hoodies & Active",
          "link": "https://www.amazon.com/Baby-Girls-Hoodies-Activewear/b/ref=dp_bc_aui_C_5?ie=UTF8&node=2475784011",
          "category_id": "2475784011"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Baby > Baby Girls > Clothing > Hoodies & Active",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/211c211b-0ee4-4ec9-9f70-07056d80ce3c.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
          "brand_store": {
            "link": "/stores/page/AB2E5AB9-804F-485B-BF5C-078920E33A6C",
            "id": "AB2E5AB9-804F-485B-BF5C-078920E33A6C"
          },
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/211c211b-0ee4-4ec9-9f70-07056d80ce3c.__CR0,0,1464,625_PT0_SX1464_V1___.jpg"
          ],
          "products": [
            {
              "title": "Call Me Pumpkin Onesie",
              "asin": "B0B5MZT8T9",
              "link": "/dp/B0B5MZT8T9/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/bf5c90f3-20cb-4265-a370-03af06464d3c.__AC_SR166,182___.jpg"
            },
            {
              "title": "Pumpkin Patch Onesie",
              "asin": "B0B682WSCM",
              "link": "/dp/B0B682WSCM/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/267e8799-cb53-43ce-9084-33a4def740cf.__AC_SR166,182___.jpg"
            },
            {
              "title": "Hey Pumpkin Onesie",
              "asin": "B0B84Y19WK",
              "link": "/dp/B0B84Y19WK/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/5fd1d51a-7409-4f8f-bc31-43c37bb34963.__AC_SR166,182___.jpg"
            },
            {
              "title": "Pumpkin Sweatshirt",
              "asin": "B0B63CLLPL",
              "link": "/dp/B0B63CLLPL/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/54183b28-2082-4e4f-962b-28f6736afe30.__AC_SR166,182___.jpg"
            },
            {
              "title": "Waffle Outfit",
              "asin": "B09C8GMWB7",
              "link": "/dp/B09C8GMWB7/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/6ba96540-c571-4930-86a6-7a9d040c745f.__AC_SR166,182___.jpg"
            },
            {
              "title": "Baby Knit Sweater",
              "asin": "B09CYNYX7N",
              "link": "/dp/B09CYNYX7N/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/e4c25b3c-cc0f-4230-92f9-57c454339476.__AC_SR166,182___.jpg"
            },
            {
              "title": "Winter Coat",
              "asin": "B09K5G5YHJ",
              "link": "/dp/B09K5G5YHJ/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/3dd8e7e5-f747-4fd9-9d2d-d6c832359f63.__AC_SR166,182___.jpg"
            },
            {
              "title": "Halloween Sweatshirt",
              "asin": "B0B6C26H72",
              "link": "/dp/B0B6C26H72/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/9e5a707e-19ff-48ca-99e8-d456dfbf0010.__AC_SR166,182___.jpg"
            },
            {
              "title": "Newborn Baby Girl Lace Sleeveless Romper Dress Ruffle Backless Bodysuit Tutu Dress Summer Outfits...",
              "asin": "B093Q1S67N",
              "link": "/dp/B093Q1S67N/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/I/5100HD3vwnL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Infant Baby Girl Boy Cotton Linen Romper Sleeveless Cute Print Bodysuit Jumpsuit Onesie Summer Ou...",
              "asin": "B08XNKTJT6",
              "link": "/dp/B08XNKTJT6/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/I/41rAuTPRY2L.__AC_SR166,182___.jpg"
            },
            {
              "title": "MoZiKQin Baby Girl Leopard Bell Bottoms Outfits Ribbed Strap Crop Tank Top & Leopard Flare Pants ...",
              "asin": "B08XMLXL6X",
              "link": "/dp/B08XMLXL6X/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/I/41WiIrWrr1L.__AC_SR166,182___.jpg"
            },
            {
              "title": "Newborn Infant Baby Boy Camo Summer Clothes Sleeveless Tank Tops T-shirt+Camouflage Shorts 2 Piec...",
              "asin": "B0928N4R3Y",
              "link": "/dp/B0928N4R3Y/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/I/416VcXL8GRL.__AC_SR166,182___.jpg"
            },
            {
              "title": "Baby Girl Boy Easter Bunny Romper Sleeveless Knitted Bodysuit Jumpsuit My 1st Easter Outfit Cute ...",
              "asin": "B08XJY4ZLD",
              "link": "/dp/B08XJY4ZLD/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/I/416JUB4B65L.__AC_SR166,182___.jpg"
            },
            {
              "title": "Baby Boy Easter Outfit Bunny Short Sleeve T-shirt Top and Casual Shorts Set Toddler Boys Easter O...",
              "asin": "B09SNWXMHC",
              "link": "/dp/B09SNWXMHC/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/I/41TUCfHkKyL.__AC_SR166,182___.jpg"
            },
            {
              "title": "MoZiKQin Baby Boy Girl 4th of July Outfit Newborn Oversized USA Romper American Flag Onesie Indep...",
              "asin": "B09XV8JQPV",
              "link": "/dp/B09XV8JQPV/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/I/4157Mu2lLGL.__AC_SR166,182___.jpg"
            },
            {
              "title": "4th of July Baby Boy Outfit Short Sleeve T-shirt Top and Stars Shorts Toddler Boy Independence Da...",
              "asin": "B09XXQ5W31",
              "link": "/dp/B09XXQ5W31/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/I/41m%2Bn8SxENL.__AC_SR166,182___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/502b7f78-de0c-4463-abc7-c1540c7d41ee.__CR0,0,600,180_PT0_SX600_V1___.jpg"
      },
      "sub_title": {
        "text": "Visit the MoZiKQin Store",
        "link": "https://www.amazon.com/stores/MoZiKQin/page/AB2E5AB9-804F-485B-BF5C-078920E33A6C?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.7,
      "ratings_total": 99,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/71KMXspCxmL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/71KMXspCxmL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/814VdY-+XaL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71C6c9ClrYL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81Rt1i2lBmL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/91WTwuqN2dL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/711EbSWwf4L._AC_UL1500_.jpg",
          "variant": "PT05"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71m5WDXGUfL._AC_UL1500_.jpg",
          "variant": "PT06"
        }
      ],
      "images_count": 7,
      "is_bundle": false,
      "attributes": [
        {
          "name": "size",
          "value": "Select"
        },
        {
          "name": "color",
          "value": "Pumpkin Patch Brown"
        }
      ],
      "buybox_winner": {
        "is_prime": false,
        "is_amazon_fresh": false,
        "condition": {
          "is_new": true
        },
        "fulfillment": {
          "type": "1p",
          "is_sold_by_amazon": true,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": false
        },
        "price": {
          "symbol": "$",
          "value": 7.99,
          "currency": "USD",
          "raw": "$7.99"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 689,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Baby Girls' Hoodies & Activewear",
          "rank": 1,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/2475784011/ref=pd_zg_hrsr_fashion"
        },
        {
          "category": "Baby Boys' Hoodies & Activewear",
          "rank": 2,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/2475824011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 689, Category: Baby Girls' Hoodies & Activewear | Rank: 1, Category: Baby Boys' Hoodies & Activewear | Rank: 2"
    }
  };

  let result = await isAccessories(payload, keywordsList);
  expect(result).toBe(true);
});

it("accessory-detection-pass-case-2", async () => {

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 1004,
      "overage_used": 504,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/gp/slredirect/picassoRedirect.html/ref=pa_sp_atf_aps_sr_pg1_1?ie=UTF8&adId=A09523401DDLYB732XL63&url=/Ratchet-Genuine-Leather-Easier-Adjustable/dp/B08LHBSYNK/ref=sr_1_2_sspa?crid=2G8SZQCLKT4S&keywords=Belts&qid=1665042153&qu=eyJxc2MiOiI4LjMxIiwicXNhIjoiNy45MiIsInFzcCI6IjcuNTQifQ%3D%3D&sprefix=belts%2C%2Caps%2C365&sr=8-2-spons&psc=1&qualifier=1665042153&id=8680565439117680&widgetName=sp_atf"
    },
    "product": {
      "title": "CHAOREN Ratchet Belt for men - Mens Belt Leather 1 3/8\" for Casual Jeans - Micro Adjustable Belt Fit Everywhere",
      "keywords": "CHAOREN,Ratchet,Belt,for,men,-,Mens,Belt,Leather,1,3/8\",for,Casual,Jeans,-,Micro,Adjustable,Belt,Fit,Everywhere",
      "keywords_list": [
        "CHAOREN",
        "Ratchet",
        "Belt",
        "Mens",
        "Belt",
        "Leather",
        "3/8\"",
        "Casual",
        "Jeans",
        "Micro",
        "Adjustable",
        "Belt",
        "Everywhere"
      ],
      "asin": "B091T2PZ9F",
      "link": "https://www.amazon.com/Chaoren-Leather-Ratchet-Automatic-Adjustable/dp/B089Y9XT5L",
      "brand": "CHAOREN",
      "bestseller_badge": {
        "link": "https://www.amazon.com/gp/bestsellers/fashion/2474947011/ref=zg_b_bs_2474947011_1",
        "category": "Men's Belts",
        "badge_text": "#1 Best Seller"
      },
      "has_size_guide": true,
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
          "name": "Accessories",
          "link": "https://www.amazon.com/Mens-Accessories/b/ref=dp_bc_aui_C_3?ie=UTF8&node=2474937011",
          "category_id": "2474937011"
        },
        {
          "name": "Belts",
          "link": "https://www.amazon.com/Mens-Belts/b/ref=dp_bc_aui_C_4?ie=UTF8&node=2474947011",
          "category_id": "2474947011"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Men > Accessories > Belts",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "brand_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/848b82ad-05f7-41b9-8a95-d98b5642facc.__CR0,299,1105,509_PT0_SX315_V1___.jpg",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/fe36d23c-4a8e-462a-8097-8d54030fa740.__CR364,697,3636,1552_PT0_SX1464_V1___.jpg",
          "description": "Minimalist Fashion",
          "brand_store": {
            "link": "/stores/page/4E2739D8-96E5-47D7-8C25-A608AC6FAF90",
            "id": "4E2739D8-96E5-47D7-8C25-A608AC6FAF90"
          },
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/fe36d23c-4a8e-462a-8097-8d54030fa740.__CR364,697,3636,1552_PT0_SX1464_V1___.jpg"
          ],
          "products": [
            {
              "title": "BKBKKABU",
              "asin": "B07MBPL3KG",
              "link": "/dp/B07MBPL3KG/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/52116bea-054a-404f-b6ea-1f5e351e32ac.__CR0,254,562,616_PT0_SX166_V1___.jpg"
            },
            {
              "title": "WVCH",
              "asin": "B07YFFT3VS",
              "link": "/dp/B07YFFT3VS/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/fbae69c9-bc4e-481f-846c-a29462b926df.__CR0,254,562,616_PT0_SX166_V1___.jpg"
            },
            {
              "title": "DCCL",
              "asin": "B07M9YMTW9",
              "link": "/dp/B07M9YMTW9/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/9c8e5ea9-04cc-4834-9e5a-3f502e54c4c4.__CR0,254,562,616_PT0_SX166_V1___.jpg"
            },
            {
              "title": "SICL3IN",
              "asin": "B07CYZGY99",
              "link": "/dp/B07CYZGY99/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/a283fb71-57f5-40eb-a0b9-bb4373bcbcf6.__CR0,254,562,616_PT0_SX166_V1___.jpg"
            },
            {
              "title": "RT",
              "asin": "B08LHBSYNK",
              "link": "/dp/B08LHBSYNK/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/3fb8b2c5-1fde-4771-925e-84529d677f18.__CR132,0,2736,3000_PT0_SX166_V1___.jpg"
            },
            {
              "title": "CR1",
              "asin": "B07JBD3MQW",
              "link": "/dp/B07JBD3MQW/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/be57d942-25ac-4fad-bc7e-522ce80c2610.__CR132,0,2736,3000_PT0_SX166_V1___.jpg"
            },
            {
              "title": "RV",
              "asin": "B08THKWW2Q",
              "link": "/dp/B08THKWW2Q/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/24984423-a9ff-4016-a10b-dedebe707f4a.__CR132,0,2736,3000_PT0_SX166_V1___.jpg"
            },
            {
              "title": "JB",
              "asin": "B095K93WJR",
              "link": "/dp/B095K93WJR/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/f3ec0f4b-6adf-415a-8ba0-f17d4a0206d1.__CR132,0,2736,3000_PT0_SX166_V1___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/848b82ad-05f7-41b9-8a95-d98b5642facc.__CR0,299,1105,509_PT0_SX315_V1___.jpg",
        "company_description_text": "Minimalist Fashion  Minimalism and timelessness are the DNA of CHAOREN. We carefully select the best designs for our customers which are suitable for any occasions and outfits. When you come to CHAOREN, being chic and stylish is effortless. Continuous updated designs to meet different personal styles.  CHAOREN creates smart ratchet belts of extraordinary beauty, durability and functionality."
      },
      "sub_title": {
        "text": "Visit the CHAOREN Store",
        "link": "https://www.amazon.com/stores/CHAOREN/page/4E2739D8-96E5-47D7-8C25-A608AC6FAF90?ref_=ast_bln"
      },
      "rating": 4.7,
      "ratings_total": 27942,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/81M94OceXfL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/81M94OceXfL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/A1+dfvbDKbL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71Ta8FDeKqL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/A1AXHPgTEzL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/91Mq6NjtRiL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81771hdfPLL._AC_UL1446_.jpg",
          "variant": "PT05"
        },
        {
          "link": "https://m.media-amazon.com/images/I/91SZF1ixclL._AC_UL1500_.jpg",
          "variant": "PT06"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81seJNHKdOL._AC_UL1500_.jpg",
          "variant": "PT07"
        },
        {
          "link": "https://m.media-amazon.com/images/I/91JKzclRjmL._AC_UL1500_.jpg",
          "variant": "PT08"
        }
      ],
      "images_count": 9,
      "videos": [
        {
          "duration_seconds": 106,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/eace4f89-18a3-4c9f-b77e-8c75f0ff9ffd/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/819wAeWfwiL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "X Ratchet Belts for Men"
        }
      ],
      "videos_count": 1,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/eace4f89-18a3-4c9f-b77e-8c75f0ff9ffd/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.0c6c4e02ae65489eb13b919dd8ac552c",
          "product_asin": "B089Y9XT5L",
          "parent_asin": "B089Y9XT5L",
          "sponsor_products": "true",
          "title": "Great Value for the Money",
          "profile_image_url": "https://www.amazon.com/avatar/default/amzn1.account.AGNYJT4JKXQTCB3BXXT236IJUA2A?max_width=110&square=true",
          "profile_link": "/gp/profile/amzn1.account.AGNYJT4JKXQTCB3BXXT236IJUA2A",
          "public_name": "roger rader",
          "creator_type": "Customer",
          "vendor_code": "UGCPR",
          "vendor_name": "roger rader",
          "video_image_id": "51wsJ9uLEIL",
          "video_image_url": "https://m.media-amazon.com/images/I/51wsJ9uLEIL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51wsJ9uLEIL.jpg",
          "video_image_width": "640",
          "video_image_height": "368",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/8471f7c8-c576-42a5-8dcb-d56d0d758967/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/0a36ce3f-fb94-4668-8cce-ed364f6a29c8/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:34",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.060655033d3845959401bc138ec6c3f7",
          "product_asin": "B089Y9XT5L",
          "parent_asin": "B089Y9XT5L",
          "related_products": "B08LH9W7HY",
          "sponsor_products": "true",
          "title": "Should You Buy? CHAOREN Carbon Fiber Leather Belt",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/deliciousencounters_1642812309872_original._CR0,63,1365,1365_._FMjpg_.jpeg",
          "profile_link": "/shop/deliciousencounters",
          "public_name": "Should You Buy?",
          "creator_type": "Influencer",
          "vendor_code": "deliciousencounters:shop",
          "vendor_name": "Should You Buy?",
          "vendor_tracking_id": "onamzchri0cbe-20",
          "video_image_id": "91kPKii9LjL",
          "video_image_url": "https://m.media-amazon.com/images/I/91kPKii9LjL._CR0,0,1128,595_SR580,306_.png",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/91kPKii9LjL.png",
          "video_image_width": "1128",
          "video_image_height": "634",
          "video_image_extension": "png",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/4482e438-7c03-4f53-b45f-6b8b6191a258/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/a8daab0d-9b02-40c4-8d6d-da4caaa1747a/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "2:55",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.048e3de62ba34e88a55c68ba94d8d0bf",
          "product_asin": "B089Y9XT5L",
          "parent_asin": "B089Y9XT5L",
          "related_products": "B087T533NP",
          "sponsor_products": "true",
          "title": "Showcasing CHAOREN Ratchet Dress Belt for Perfect Fit",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/dragonbloggertechnologyandentertainment_1620967212390_original._CR67,0,453,453_._FMjpg_.png",
          "profile_link": "/shop/dragonbloggertechnologyandentertainment",
          "public_name": "Dragon Blogger Tech and Entertainment",
          "creator_type": "Influencer",
          "vendor_code": "dragonbloggertechnologyandentertainment:shop",
          "vendor_name": "Dragon Blogger Tech and Entertainment",
          "vendor_tracking_id": "dbstore01-20",
          "video_image_id": "51hWUNQkWCL",
          "video_image_url": "https://m.media-amazon.com/images/I/51hWUNQkWCL._CR0,0,1280,675_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51hWUNQkWCL.jpg",
          "video_image_width": "1280",
          "video_image_height": "720",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/9f9c61e4-dda9-447f-ba25-e6688e3387e0/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/0ed2ce7d-4cc4-41ae-8ce7-6e8faccdf453/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:59",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/ca99e148-4aa8-48c8-83df-9106fff9adec.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.04b6d0e8c87246c38ff6b012a121dbae",
          "product_asin": "B089Y9XT5L",
          "parent_asin": "B089Y9XT5L",
          "related_products": "B08LHCW4YH",
          "sponsor_products": "true",
          "title": "CHAOREN Ratchet Dress Belt Review",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/gallagur_1629569090360_original._CR354,121,702,702_._FMjpg_.jpeg",
          "profile_link": "/shop/gallagur",
          "public_name": "RJ's Review",
          "creator_type": "Influencer",
          "vendor_code": "gallagur:shop",
          "vendor_name": "RJ's Review",
          "vendor_tracking_id": "onamzronsmith-20",
          "video_image_id": "A1gouAmSJkL",
          "video_image_url": "https://m.media-amazon.com/images/I/A1gouAmSJkL._CR0,0,1280,675_SR580,306_.png",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/A1gouAmSJkL.png",
          "video_image_width": "1280",
          "video_image_height": "720",
          "video_image_extension": "png",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/e5f976b4-91c3-48dd-a992-f0da1f80d566/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/2bc475a7-9c19-4f08-b1b3-6683aa5ce404/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "1:17",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/26f4a379-5fb9-4a31-87a6-6270e0f2fa5f.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.066bbd622e244fd186a30b707fbabba4",
          "product_asin": "B089Y9XT5L",
          "parent_asin": "B089Y9XT5L",
          "related_products": "B08NJH1T4F, B07MBPL3KG, B083HWTKXY, B08JHX28C6, B08HLWPX5G",
          "sponsor_products": "true",
          "title": "X Ratchet Belts for Men",
          "public_name": "CR CHAOREN",
          "creator_type": "Seller",
          "vendor_code": "Z7AX4",
          "vendor_name": "CR CHAOREN",
          "video_image_id": "819wAeWfwiL",
          "video_image_url": "https://m.media-amazon.com/images/I/819wAeWfwiL._CR0,0,1920,1013_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/819wAeWfwiL.jpg",
          "video_image_width": "1920",
          "video_image_height": "1080",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/eace4f89-18a3-4c9f-b77e-8c75f0ff9ffd/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/5a069d41-9c69-433f-8d0b-43d388dc2b55/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "1:46",
          "type": "videos_for_this_product"
        }
      ],
      "is_bundle": false,
      "attributes": [
        {
          "name": "size",
          "value": "Select"
        },
        {
          "name": "color",
          "value": "Carbon Fiber Imperial - Black"
        }
      ],
      "buybox_winner": {
        "is_prime": false,
        "is_amazon_fresh": false,
        "condition": {
          "is_new": true
        },
        "fulfillment": {
          "type": "1p",
          "is_sold_by_amazon": true,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": false
        },
        "price": {
          "symbol": "$",
          "value": 19.99,
          "currency": "USD",
          "raw": "$19.99"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 85,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Men's Belts",
          "rank": 1,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/2474947011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 85, Category: Men's Belts | Rank: 1"
    }
  };

  let result = await isAccessories(payload, keywordsList);
  expect(result).toBe(true);
});

it("accessory-detection-pass-case-3", async () => {

  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 1005,
      "overage_used": 505,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/Wander-Agio-Womens-Infinity-Scarves/dp/B07WD21G2V/ref=sr_1_12?crid=1MEP0U69LH8B7&keywords=Scarves&qid=1665041707&qu=eyJxc2MiOiI4LjM5IiwicXNhIjoiNy45MiIsInFzcCI6IjcuMzgifQ==&sprefix=scarves,aps,318&sr=8-12"
    },
    "product": {
      "title": "Wander Agio Womens Warm Blanket Scarf Square Winter Shawls Large Infinity Scarves Stripe Plaid Scarf Plaid Grey Pink 11",
      "title_excluding_variant_name": "Wander Agio Womens Warm Blanket Scarf Square Winter Shawls Large Infinity Scarves Stripe Plaid Scarf",
      "keywords": "Wander,Agio,Womens,Warm,Blanket,Scarf,Square,Winter,Shawls,Large,Infinity,Scarves,Stripe,Plaid,Scarf",
      "keywords_list": [
        "Wander",
        "Agio",
        "Womens",
        "Warm",
        "Blanket",
        "Scarf",
        "Square",
        "Winter",
        "Shawls",
        "Large",
        "Infinity",
        "Scarves",
        "Stripe",
        "Plaid",
        "Scarf"
      ],
      "asin": "B07WD21G2V",
      "link": "https://www.amazon.com/dp/B07WD21G2V??th=1&psc=1",
      "brand": "Wander Agio",
      "has_size_guide": true,
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
          "name": "Accessories",
          "link": "https://www.amazon.com/Womens-Accessories/b/ref=dp_bc_aui_C_3?ie=UTF8&node=2474936011",
          "category_id": "2474936011"
        },
        {
          "name": "Scarves & Wraps",
          "link": "https://www.amazon.com/Womens-Scarves-Wraps/b/ref=dp_bc_aui_C_4?ie=UTF8&node=7072324011",
          "category_id": "7072324011"
        },
        {
          "name": "Fashion Scarves",
          "link": "https://www.amazon.com/Womens-Fashion-Scarves/b/ref=dp_bc_aui_C_5?ie=UTF8&node=2474943011",
          "category_id": "2474943011"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Accessories > Scarves & Wraps > Fashion Scarves",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": false,
        "third_party": true
      },
      "sub_title": {
        "text": "Visit the Wander Agio Store",
        "link": "https://www.amazon.com/stores/WanderAgio/page/5CB3F456-5605-44F6-A8D8-FEB994EB438A?ref_=ast_bln"
      },
      "amazons_choice": {
        "keywords": "blanket scarf for women",
        "link": "https://www.amazon.com/s/ref=choice_dp_b?keywords=blanket%20scarf%20for%20women"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.5,
      "ratings_total": 2485,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/91ot0IojnfL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/91ot0IojnfL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/91QqlesMnCL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/914xGCyc2UL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/91ucCx916rL._AC_UL1500_.jpg",
          "variant": "PT03"
        }
      ],
      "images_count": 4,
      "is_bundle": false,
      "attributes": [
        {
          "name": "color",
          "value": "Plaid Grey Pink 11"
        }
      ],
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 30,
          "hard_maximum": true
        },
        "offer_id": "u2pa7u3PnNq90psqR0BIHdONy6Yd7wfHtLFHsczJ5rIMwOh1ZIusWUHe40TMy/hq9MH0FaKEfwXMWy5fAZTwIc75izr0XoZY8d4Fp8Dr5EmMS3hmEAPMeDhJfTO/9pziYA/OBSbj0UbVFNU4zdlX/f+njAK979hKPiWeGT38VzbyE5ssbVAGKc3ipoNcuIBr",
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
          "type": "2p",
          "standard_delivery": {
            "date": "Thursday, October 13",
            "name": "FREE"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "wander agio",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A1LPWTDTF6N3OI&asin=B07WD21G2V&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A1LPWTDTF6N3OI"
          }
        },
        "price": {
          "symbol": "$",
          "value": 7.99,
          "currency": "USD",
          "raw": "$7.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 19445,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Fashion Scarves",
          "rank": 55,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/2474943011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 19445, Category: Women's Fashion Scarves | Rank: 55"
    },
    "frequently_bought_together": {
      "total_price": {
        "symbol": "$",
        "value": 21.48,
        "currency": "USD",
        "raw": "$21.48"
      },
      "products": [
        {
          "asin": "B07WD21G2V",
          "title": "Wander Agio Womens Warm Blanket Scarf Square Winter Shawls Large Infinity Scarves Stripe Plaid Scarf",
          "link": "https://www.amazon.com/dp/B07WD21G2V",
          "image": "https://m.media-amazon.com/images/G/01/3ed00923-88b6-42e0-9eec-ee78f426b346/H0/HQP-75x75-Shopping._SS75_CB622833573_.jpg",
          "price": {
            "symbol": "$",
            "value": 7.99,
            "currency": "USD",
            "raw": "$7.99"
          }
        },
        {
          "asin": "B0757HW7TW",
          "title": "Women's Fall Winter Scarf Classic Tassel Plaid Scarf Warm Soft Chunky Large Blanket Wrap Shawl Scarves",
          "link": "https://www.amazon.com/dp/B0757HW7TW",
          "image": "https://images-na.ssl-images-amazon.com/images/I/81lDj4IShFL._AC_UL116_SR116,116_.jpg",
          "price": {
            "symbol": "$",
            "value": 13.49,
            "currency": "USD",
            "raw": "$13.49"
          }
        }
      ]
    }
  };

  let result = await isAccessories(payload, keywordsList);
  expect(result).toBe(false);
});

//Category Rules Tests 'underwear'

it("discovery-rules", async () => {
  //https://www.amazon.com/Speedo-Powerflex-Solar-Swimsuit-Heather/dp/B01K5N79IM/ref=sr_1_6?keywords=swimwear&qid=1663226421&sprefix=%2Caps%2C282&sr=8-6

  let rainforestResponse = {
    "request_info": {
      "success": true,
      "credits_used": 4,
      "credits_used_this_request": 1,
      "credits_remaining": 496,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/Speedo-Powerflex-Solar-Swimsuit-Heather/dp/B01K5N79IM/ref=sr_1_6?keywords=swimwear&qid=1663226421&sprefix=,aps,282&sr=8-6",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "Speedo Men's Swimsuit Brief PowerFlex Eco Solar",
      "keywords": "Speedo,Men's,Swimsuit,Brief,PowerFlex,Eco,Solar",
      "keywords_list": [
        "Speedo",
        "Men's",
        "Swimsuit",
        "Brief",
        "PowerFlex",
        "Solar"
      ],
      "asin": "B08T3TFVHM",
      "link": "https://www.amazon.com/Speedo-Swimsuit-Brief-PowerFlex-Solar/dp/B08Q4WRKZF",
      "brand": "Speedo",
      "has_size_guide": true,
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
          "name": "Sport Specific Clothing",
          "link": "https://www.amazon.com/b/ref=dp_bc_aui_C_2?ie=UTF8&node=23575629011",
          "category_id": "23575629011"
        },
        {
          "name": "Competitive Swimwear",
          "link": "https://www.amazon.com/b/ref=dp_bc_aui_C_3?ie=UTF8&node=23479403011",
          "category_id": "23479403011"
        },
        {
          "name": "Men",
          "link": "https://www.amazon.com/Mens-Athletic-Swimwear/b/ref=dp_bc_aui_C_4?ie=UTF8&node=2419345011",
          "category_id": "2419345011"
        },
        {
          "name": "Briefs",
          "link": "https://www.amazon.com/Mens-Swim-Briefs/b/ref=dp_bc_aui_C_5?ie=UTF8&node=2371136011",
          "category_id": "2371136011"
        }
      ],
      "description": "From swimming laps to enjoying the beach, this brief is designed to work as hard as you do. Swim with confidence thanks to smooth LYCRA® XTRA LIFE™ fiber construction that offers incredible durability and resistance to bagging, sagging and chemicals. Built-in sun protection offers UPF50+ to Block the Burn as you enjoy the water or sand, while an interior drawcord gives you the option of an even more flattering fit.",
      "sub_title": {
        "text": "Visit the Speedo Store",
        "link": "https://www.amazon.com/stores/Speedo/page/012FFA9E-E5FB-44FA-8A23-EEA4DB36C659?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.4,
      "ratings_total": 3516,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/61Ak-eCkOeL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/61Ak-eCkOeL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61kJQqNTzfL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71sSkUlCvOL._AC_UL1000_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71JpLTOlRYL._AC_UL1000_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71AAdpcPVmL._AC_UL1000_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61TJMze7ViL._AC_UL1000_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "is_bundle": false,
      "buybox_winner": {
        "is_prime": false,
        "is_amazon_fresh": false,
        "condition": {
          "is_new": true
        },
        "fulfillment": {
          "type": "1p",
          "is_sold_by_amazon": true,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": false
        },
        "price": {
          "symbol": "$",
          "value": 17.38,
          "currency": "USD",
          "raw": "$17.38"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 22886,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Men's Athletic Swimwear Briefs",
          "rank": 2,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/2371136011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "manufacturer": "Speedo",
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 22886, Category: Men's Athletic Swimwear Briefs | Rank: 2"
    },
    "brand_store": {
      "id": "012FFA9E-E5FB-44FA-8A23-EEA4DB36C659",
      "link": "https://www.amazon.com/stores/Speedo/page/012FFA9E-E5FB-44FA-8A23-EEA4DB36C659"
    }
  };
  let categoriesMap = {
    "Electronics": "electronics",
    "Printer": "electronics",
    "Clothing, Shoes & Jewelry": "fashion",
    "Sports-Shoes": "shoes",
    "Shoes": "shoes",
    "Socks": "socks",
    "Athletic Socks": "socks",
    "Compression Socks": "socks",
    "Boys": "childware",
    "Girls": "childware",
    "Swim": "swimware",
    "Swimsuits & Cover Ups": "swimware",
    "Competitive Swimwear": "swimware",
    "Sport Specific Clothing": "swimware",
    "Competitive Swimwear": "swimware",
    "Ties, Cummerbunds & Pocket Squares": "tie",
    "Neckties": "tie",
    "Belts": "belts",
    "Watches": "watches",
    "Smartwatches": "watches",
    "Wrist Watches": "watches",
    "Handbags & Wallets": "handbags",
    "Accessories": "accessories",
    "Lingerie": "lingerie",
    "Panties": "underwear",
    "Briefs": "underwear",
    "Boxer Briefs": "underwear",
    "Underwear": "underwear"
  };

  let result = await findProductCategoryFromRainforestResponse(rainforestResponse, categoriesMap);
  console.log("final result " + JSON.stringify(result));
});

it("discovery-rules", async () => {
//https://www.amazon.com/BAMBOO-COOL-Underwear-Comfortable-Viscose/dp/B088WHCD7D/ref=sr_1_3_sspa?keywords=underwear&qid=1663237192&sprefix=under%2Caps%2C309&sr=8-3-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExS0gwUVRCWFlJUE1HJmVuY3J5cHRlZElkPUEwMTM5MDg0MUxDNkZEV0tQNFJJOCZlbmNyeXB0ZWRBZElkPUEwNTcyMDEyMUg3TTJYU05US1FVNCZ3aWRnZXROYW1lPXNwX2F0ZiZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=

  let rainforestResponse = {
    "request_info": {
      "success": true,
      "credits_used": 7,
      "credits_used_this_request": 1,
      "credits_remaining": 493,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/BAMBOO-COOL-Underwear-Comfortable-Viscose/dp/B088WHCD7D/ref=sr_1_3_sspa?keywords=underwear&qid=1663237192&sprefix=under,aps,309&sr=8-3-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExS0gwUVRCWFlJUE1HJmVuY3J5cHRlZElkPUEwMTM5MDg0MUxDNkZEV0tQNFJJOCZlbmNyeXB0ZWRBZElkPUEwNTcyMDEyMUg3TTJYU05US1FVNCZ3aWRnZXROYW1lPXNwX2F0ZiZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "BAMBOO COOL Men’s Underwear boxer briefs Soft Comfortable Bamboo Viscose Underwear Trunks (4 Pack) Boxer Briefs a Small",
      "title_excluding_variant_name": "BAMBOO COOL Men’s Underwear boxer briefs Soft Comfortable Bamboo Viscose Underwear Trunks (4 Pack)",
      "keywords": "BAMBOO,COOL,Men’s,Underwear,boxer,briefs,Soft,Comfortable,Bamboo,Viscose,Underwear,Trunks,(4,Pack)",
      "keywords_list": [
        "BAMBOO",
        "COOL",
        "Men’s",
        "Underwear",
        "boxer",
        "briefs",
        "Soft",
        "Comfortable",
        "Bamboo",
        "Viscose",
        "Underwear",
        "Trunks",
        "Pack)"
      ],
      "asin": "B088WHCD7D",
      "link": "https://www.amazon.com/dp/B088WHCD7D??th=1&psc=1",
      "has_size_guide": true,
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
          "name": "Underwear",
          "link": "https://www.amazon.com/Mens-Underwear/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045706",
          "category_id": "1045706"
        },
        {
          "name": "Boxer Briefs",
          "link": "https://www.amazon.com/Mens-Boxer-Briefs/b/ref=dp_bc_aui_C_5?ie=UTF8&node=1045718",
          "category_id": "1045718"
        }
      ],
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": false,
        "third_party": true
      },
      "sub_title": {
        "text": "Learn more Read full return policy",
        "link": "https://www.amazon.com/gp/help/customer/display.html?nodeId=201909010&ref_=buybox-secureTransaction-learnMore-web"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.4,
      "ratings_total": 3833,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/71snajmyChL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/71snajmyChL._AC_UL1200_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71bkBvAT4SL._AC_UL1200_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81T9WH816pL._AC_UL1200_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71JE-2I+LqL._AC_UL1200_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81s2zQVqbqL._AC_UL1200_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71VO-SdVQ1L._AC_UL1200_.jpg",
          "variant": "PT05"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61K9U7JGAFL._AC_UL1200_.jpg",
          "variant": "PT06"
        }
      ],
      "images_count": 7,
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 30,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Wednesday, September 21",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Tuesday, September 20",
            "name": "Or fastest delivery Tuesday, September 20"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "BAMBOO COOL",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=AGHFGR4RK7H18&asin=B088WHCD7D&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "AGHFGR4RK7H18"
          }
        },
        "price": {
          "symbol": "$",
          "value": 36.99,
          "currency": "USD",
          "raw": "$36.99"
        },
        "rrp": {
          "symbol": "$",
          "value": 39.99,
          "currency": "USD",
          "raw": "$39.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 1360,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Men's Boxer Briefs",
          "rank": 11,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1045718/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 1360, Category: Men's Boxer Briefs | Rank: 11"
    },
    "climate_pledge_friendly": {
      "text": "The Forest Stewardship Council",
      "image": "https://m.media-amazon.com/images/I/111pigi1ylL.png"
    }
  };
  let categoriesMap = {
    "Electronics": "electronics",
    "Printer": "electronics",
    "Clothing, Shoes & Jewelry": "fashion",
    "Sports-Shoes": "shoes",
    "Shoes": "shoes",
    "Socks": "socks",
    "Athletic Socks": "socks",
    "Compression Socks": "socks",
    "Boys": "childware",
    "Girls": "childware",
    "Swim": "swimware",
    "Swimsuits & Cover Ups": "swimware",
    "Competitive Swimwear": "swimware",
    "Sport Specific Clothing": "swimware",
    "Competitive Swimwear": "swimware",
    "Ties, Cummerbunds & Pocket Squares": "tie",
    "Neckties": "tie",
    "Belts": "belts",
    "Watches": "watches",
    "Smartwatches": "watches",
    "Wrist Watches": "watches",
    "Handbags & Wallets": "handbags",
    "Accessories": "accessories",
    "Lingerie": "lingerie",
    "Panties": "underwear",
    "Briefs": "underwear",
    "Boxer Briefs": "underwear",
    "Underwear": "underwear"
  };

  let result = await findProductCategoryFromRainforestResponse(rainforestResponse, categoriesMap);
  console.log("final result " + JSON.stringify(result));
});

it("discovery-rules", async () => {
//https://www.amazon.com/dp/B09VT4YQFH/ref=sspa_dk_detail_5?psc=1&pd_rd_i=B09VT4YQFH&pd_rd_w=IjYZb&content-id=amzn1.sym.4d0fffec-3aba-4480-8fad-c6bd8f7f6b41&pf_rd_p=4d0fffec-3aba-4480-8fad-c6bd8f7f6b41&pf_rd_r=MFTRXNGD4M48Q0ZMX4YZ&pd_rd_wg=kdzIH&pd_rd_r=1489e25d-d6bb-469c-9d0b-7e737c05cffc&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzODNURjA3WFBUMzNWJmVuY3J5cHRlZElkPUEwMjM0OTU3M0hTQk5FOEdLMUFPMiZlbmNyeXB0ZWRBZElkPUEwMDY1NDk0MThTVVFIQk0wWkJXUiZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=

  let rainforestResponse = {
    "request_info": {
      "success": true,
      "credits_used": 8,
      "credits_used_this_request": 1,
      "credits_remaining": 492,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/dp/B09VT4YQFH/ref=sspa_dk_detail_5?psc=1&pd_rd_i=B09VT4YQFH&pd_rd_w=IjYZb&content-id=amzn1.sym.4d0fffec-3aba-4480-8fad-c6bd8f7f6b41&pf_rd_p=4d0fffec-3aba-4480-8fad-c6bd8f7f6b41&pf_rd_r=MFTRXNGD4M48Q0ZMX4YZ&pd_rd_wg=kdzIH&pd_rd_r=1489e25d-d6bb-469c-9d0b-7e737c05cffc&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzODNURjA3WFBUMzNWJmVuY3J5cHRlZElkPUEwMjM0OTU3M0hTQk5FOEdLMUFPMiZlbmNyeXB0ZWRBZElkPUEwMDY1NDk0MThTVVFIQk0wWkJXUiZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "BAMBOO COOL Men’s Underwear Boxer Briefs Soft Comfortable Bamboo Viscose Underwear Trunks (4 Pack) Purple, Black, Dark Gray, Navy Blue X-Large",
      "title_excluding_variant_name": "BAMBOO COOL Men’s Underwear Boxer Briefs Soft Comfortable Bamboo Viscose Underwear Trunks (4 Pack)",
      "keywords": "BAMBOO,COOL,Men’s,Underwear,Boxer,Briefs,Soft,Comfortable,Bamboo,Viscose,Underwear,Trunks,(4,Pack)",
      "keywords_list": [
        "BAMBOO",
        "COOL",
        "Men’s",
        "Underwear",
        "Boxer",
        "Briefs",
        "Soft",
        "Comfortable",
        "Bamboo",
        "Viscose",
        "Underwear",
        "Trunks",
        "Pack)"
      ],
      "asin": "B09VT4YQFH",
      "link": "https://www.amazon.com/dp/B09VT4YQFH??th=1&psc=1",
      "has_size_guide": true,
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
          "name": "Underwear",
          "link": "https://www.amazon.com/Mens-Underwear/b/ref=dp_bc_aui_C_4?ie=UTF8&node=1045706",
          "category_id": "1045706"
        },
        {
          "name": "Boxer Briefs",
          "link": "https://www.amazon.com/Mens-Boxer-Briefs/b/ref=dp_bc_aui_C_5?ie=UTF8&node=1045718",
          "category_id": "1045718"
        }
      ],
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": false,
        "third_party": true
      },
      "sub_title": {
        "text": "Learn more Read full return policy",
        "link": "https://www.amazon.com/gp/help/customer/display.html?nodeId=201909010&ref_=buybox-secureTransaction-learnMore-web"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.5,
      "ratings_total": 77,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/51lAiW8OYBL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/51lAiW8OYBL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61ccLHv1szL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71lkloMxNpL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71fIUWOtrJL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81LfQ1LnpML._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51L5yFLvbeL._AC_UL1500_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "videos": [
        {
          "duration_seconds": 24,
          "width": 680,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/7bba92a9-5405-409f-aa62-ba052de93a63/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/51JkPmnwL5L.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Bamboo Viscose Underwear for Men"
        }
      ],
      "videos_count": 1,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/7bba92a9-5405-409f-aa62-ba052de93a63/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "product_asin": "B09VT5CJSL",
          "title": "Bamboo Viscose Underwear for Men",
          "vendor_code": "Z7AX4",
          "vendor_name": "BAMBOO COOL-3",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/7bba92a9-5405-409f-aa62-ba052de93a63/default.jobtemplate.hls.m3u8",
          "type": "videos_for_related_products"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 30,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Wed, Sep 21",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Tomorrow, Sep 16",
            "name": "Or fastest delivery Tomorrow, Sep 16. Order within 20 mins"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "BAMBOO COOL-3",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A2T4N3VSWRPOLZ&asin=B09VT4YQFH&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A2T4N3VSWRPOLZ"
          }
        },
        "price": {
          "symbol": "$",
          "value": 36.99,
          "currency": "USD",
          "raw": "$36.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 48695,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Men's Boxer Briefs",
          "rank": 213,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1045718/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 48695, Category: Men's Boxer Briefs | Rank: 213"
    }
  };
  let categoriesMap = {
    "Electronics": "electronics",
    "Printer": "electronics",
    "Clothing, Shoes & Jewelry": "fashion",
    "Sports-Shoes": "shoes",
    "Shoes": "shoes",
    "Socks": "socks",
    "Athletic Socks": "socks",
    "Compression Socks": "socks",
    "Boys": "childware",
    "Girls": "childware",
    "Swim": "swimware",
    "Swimsuits & Cover Ups": "swimware",
    "Competitive Swimwear": "swimware",
    "Sport Specific Clothing": "swimware",
    "Competitive Swimwear": "swimware",
    "Ties, Cummerbunds & Pocket Squares": "tie",
    "Neckties": "tie",
    "Belts": "belts",
    "Watches": "watches",
    "Smartwatches": "watches",
    "Wrist Watches": "watches",
    "Handbags & Wallets": "handbags",
    "Accessories": "accessories",
    "Lingerie": "lingerie",
    "Panties": "underwear",
    "Briefs": "underwear",
    "Boxer Briefs": "underwear",
    "Underwear": "underwear"
  };

  let result = await findProductCategoryFromRainforestResponse(rainforestResponse, categoriesMap);
  console.log("final result " + JSON.stringify(result));
});

it("discovery-rules", async () => {
//https://www.amazon.com/Xibing-Underwear-Breathable-Invisible-Multicolor2/dp/B09DS72BMQ/ref=sr_1_4_sspa?keywords=underwear&qid=1663237546&sprefix=under%2Caps%2C309&sr=8-4-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUE4VlpDODhMNERMQk8mZW5jcnlwdGVkSWQ9QTA5MzgxMDdBQUlTSzdBU0xaVVAmZW5jcnlwdGVkQWRJZD1BMDgwNDM2NzJXS1lSNTBaWjdXRlMmd2lkZ2V0TmFtZT1zcF9hdGYmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl

  let rainforestResponse = {
    "request_info": {
      "success": true,
      "credits_used": 10,
      "credits_used_this_request": 1,
      "credits_remaining": 490,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/Xibing-Underwear-Breathable-Invisible-Multicolor2/dp/B09DS72BMQ/ref=sr_1_4_sspa?keywords=underwear&qid=1663237546&sprefix=under,aps,309&sr=8-4-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUE4VlpDODhMNERMQk8mZW5jcnlwdGVkSWQ9QTA5MzgxMDdBQUlTSzdBU0xaVVAmZW5jcnlwdGVkQWRJZD1BMDgwNDM2NzJXS1lSNTBaWjdXRlMmd2lkZ2V0TmFtZT1zcF9hdGYmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "Xibing Women's Seamless Underwear No Show Stretch Bikini Panties Breathable Invisible Hipster Panty 5/10 Pack 10 Pack-multicolor2 Medium",
      "title_excluding_variant_name": "Xibing Women's Seamless Underwear No Show Stretch Bikini Panties Breathable Invisible Hipster Panty 5/10 Pack",
      "keywords": "Xibing,Women's,Seamless,Underwear,No,Show,Stretch,Bikini,Panties,Breathable,Invisible,Hipster,Panty,5/10,Pack",
      "keywords_list": [
        "Xibing",
        "Women's",
        "Seamless",
        "Underwear",
        "Show",
        "Stretch",
        "Bikini",
        "Panties",
        "Breathable",
        "Invisible",
        "Hipster",
        "Panty",
        "5/10",
        "Pack"
      ],
      "asin": "B09DS72BMQ",
      "link": "https://www.amazon.com/dp/B09DS72BMQ??th=1&psc=1",
      "brand": "Xibing",
      "has_size_guide": true,
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
          "name": "Lingerie",
          "link": "https://www.amazon.com/Lingerie/b/ref=dp_bc_aui_C_5?ie=UTF8&node=14333511",
          "category_id": "14333511"
        },
        {
          "name": "Panties",
          "link": "https://www.amazon.com/Womens-Panties/b/ref=dp_bc_aui_C_6?ie=UTF8&node=1044958",
          "category_id": "1044958"
        },
        {
          "name": "Bikinis",
          "link": "https://www.amazon.com/Womens-Bikini-Panties/b/ref=dp_bc_aui_C_7?ie=UTF8&node=1044974",
          "category_id": "1044974"
        }
      ],
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": false,
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/922da6d7-a44b-40a0-a971-04c8e99cdd19.__CR0,0,600,180_PT0_SX600_V1___.jpg"
      },
      "sub_title": {
        "text": "Visit the Xibing Store",
        "link": "https://www.amazon.com/stores/Xibing/page/15312D46-B751-4BEC-BCA2-E3B3A6BDE09A?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "has_coupon": true,
      "coupon_text": "Save an extra 5% when you apply this coupon",
      "rating": 4.4,
      "ratings_total": 664,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/618+Mi++JeL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/618+Mi++JeL._AC_UL1450_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61SZwQcT3aL._AC_UL1372_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61dbv3mtodL._AC_UL1372_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61piMu7rVhL._AC_UL1372_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81BFv-vxa5L._AC_UL1372_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61YlGvLFXrL._AC_UL1450_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "videos": [
        {
          "duration_seconds": 30,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/e5df6025-52e5-4f8c-9953-d77cc7d9113c/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/51CRVGnkRRL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Women's Seamless Underwear"
        },
        {
          "duration_seconds": 28,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/deb60191-cc67-4219-867a-b5ecb6ad5240/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/410KEj+X8BL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "seamless underwear for women"
        }
      ],
      "videos_count": 2,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/e5df6025-52e5-4f8c-9953-d77cc7d9113c/default.jobtemplate.mp4.480.mp4,https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/deb60191-cc67-4219-867a-b5ecb6ad5240/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "product_asin": "B0973T1483",
          "title": "Women's Seamless Underwear",
          "vendor_code": "Z7AX4",
          "vendor_name": "Basa shop",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/e5df6025-52e5-4f8c-9953-d77cc7d9113c/default.jobtemplate.hls.m3u8",
          "type": "videos_for_related_products"
        },
        {
          "product_asin": "B0973T1483",
          "title": "seamless underwear for women",
          "vendor_code": "Z7AX4",
          "vendor_name": "Basa shop",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/deb60191-cc67-4219-867a-b5ecb6ad5240/default.jobtemplate.hls.m3u8",
          "type": "videos_for_related_products"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 5,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Wednesday, September 21",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Tuesday, September 20",
            "name": "Or fastest delivery Tuesday, September 20"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Basa shop",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=ABJCY6LF4GG12&asin=B09DS72BMQ&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "ABJCY6LF4GG12"
          }
        },
        "price": {
          "symbol": "$",
          "value": 32.99,
          "currency": "USD",
          "raw": "$32.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 26722,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Bikini Panties",
          "rank": 64,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1044974/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 26722, Category: Women's Bikini Panties | Rank: 64"
    },
    "brand_store": {
      "id": "15312D46-B751-4BEC-BCA2-E3B3A6BDE09A",
      "link": "https://www.amazon.com/stores/Xibing/page/15312D46-B751-4BEC-BCA2-E3B3A6BDE09A"
    }
  };
  let categoriesMap = {
    "Electronics": "electronics",
    "Printer": "electronics",
    "Clothing, Shoes & Jewelry": "fashion",
    "Sports-Shoes": "shoes",
    "Shoes": "shoes",
    "Socks": "socks",
    "Athletic Socks": "socks",
    "Compression Socks": "socks",
    "Boys": "childware",
    "Girls": "childware",
    "Swim": "swimware",
    "Swimsuits & Cover Ups": "swimware",
    "Competitive Swimwear": "swimware",
    "Sport Specific Clothing": "swimware",
    "Competitive Swimwear": "swimware",
    "Ties, Cummerbunds & Pocket Squares": "tie",
    "Neckties": "tie",
    "Belts": "belts",
    "Watches": "watches",
    "Smartwatches": "watches",
    "Wrist Watches": "watches",
    "Handbags & Wallets": "handbags",
    "Accessories": "accessories",
    "Lingerie": "lingerie",
    "Panties": "underwear",
    "Briefs": "underwear",
    "Boxer Briefs": "underwear",
    "Underwear": "underwear"
  };

  let result = await findProductCategoryFromRainforestResponse(rainforestResponse, categoriesMap);
  console.log("final result " + JSON.stringify(result));
});

it("discovery-rules", async () => {
//https://www.amazon.com/dp/B08FSS1758/ref=sspa_dk_detail_3?psc=1&pd_rd_i=B08FSS1758&pd_rd_w=jmmtH&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=52XJ9EE8BY92402YYG6E&pd_rd_wg=vcu2J&pd_rd_r=c1952148-f4ba-4971-ab8e-e7615f014f5d&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUFXV0s2SzVaWVNXWTEmZW5jcnlwdGVkSWQ9QTA1MzU0NTQxRUFVMFM5NUJaUzQ1JmVuY3J5cHRlZEFkSWQ9QTA4MDI0NDdZREVWWlA2MFhIQzUmd2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWMmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl

  let rainforestResponse = {
    "request_info": {
      "success": true,
      "credits_used": 11,
      "credits_used_this_request": 1,
      "credits_remaining": 489,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/dp/B08FSS1758/ref=sspa_dk_detail_3?psc=1&pd_rd_i=B08FSS1758&pd_rd_w=jmmtH&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=52XJ9EE8BY92402YYG6E&pd_rd_wg=vcu2J&pd_rd_r=c1952148-f4ba-4971-ab8e-e7615f014f5d&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUFXV0s2SzVaWVNXWTEmZW5jcnlwdGVkSWQ9QTA1MzU0NTQxRUFVMFM5NUJaUzQ1JmVuY3J5cHRlZEFkSWQ9QTA4MDI0NDdZREVWWlA2MFhIQzUmd2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWMmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "Xibing Women's Seamless Underwear Bikini Panties No Show Low Rise Breathable Hipster Panty Multipack 5 Pack-light Small",
      "title_excluding_variant_name": "Xibing Women's Seamless Underwear Bikini Panties No Show Low Rise Breathable Hipster Panty Multipack",
      "keywords": "Xibing,Women's,Seamless,Underwear,Bikini,Panties,No,Show,Low,Rise,Breathable,Hipster,Panty,Multipack",
      "keywords_list": [
        "Xibing",
        "Women's",
        "Seamless",
        "Underwear",
        "Bikini",
        "Panties",
        "Show",
        "Rise",
        "Breathable",
        "Hipster",
        "Panty",
        "Multipack"
      ],
      "asin": "B08FSS1758",
      "link": "https://www.amazon.com/dp/B08FSS1758??th=1&psc=1",
      "brand": "Xibing",
      "has_size_guide": true,
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
          "name": "Lingerie",
          "link": "https://www.amazon.com/Lingerie/b/ref=dp_bc_aui_C_5?ie=UTF8&node=14333511",
          "category_id": "14333511"
        },
        {
          "name": "Panties",
          "link": "https://www.amazon.com/Womens-Panties/b/ref=dp_bc_aui_C_6?ie=UTF8&node=1044958",
          "category_id": "1044958"
        },
        {
          "name": "Bikinis",
          "link": "https://www.amazon.com/Womens-Bikini-Panties/b/ref=dp_bc_aui_C_7?ie=UTF8&node=1044974",
          "category_id": "1044974"
        }
      ],
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": false,
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media/sc/308cd561-0514-47a4-b951-1c30b7894bb3.__CR0,0,600,180_PT0_SX600_V1___.jpg"
      },
      "sub_title": {
        "text": "Visit the Xibing Store",
        "link": "https://www.amazon.com/stores/Xibing/page/15312D46-B751-4BEC-BCA2-E3B3A6BDE09A?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.4,
      "ratings_total": 1792,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/61W-bvDhljL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/61W-bvDhljL._AC_UL1450_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61aYDnwRhcS._AC_UL1450_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61X+Ri3wRNS._AC_UL1450_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/617X3dZPsFS._AC_UL1450_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81gVkT6akIS._AC_UL1450_.jpg",
          "variant": "PT04"
        }
      ],
      "images_count": 5,
      "videos": [
        {
          "duration_seconds": 27,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/ece1d03d-6183-4e3a-a0e4-6bd115a8a9c7/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/51AliKQ8JWL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "womens underwear seamless"
        }
      ],
      "videos_count": 1,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/ece1d03d-6183-4e3a-a0e4-6bd115a8a9c7/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "product_asin": "B08FSSWTDK",
          "title": "womens underwear seamless",
          "vendor_code": "Z7AX4",
          "vendor_name": "Basa shop",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/ece1d03d-6183-4e3a-a0e4-6bd115a8a9c7/default.jobtemplate.hls.m3u8",
          "type": "videos_for_related_products"
        },
        {
          "product_asin": "B08FSS1758",
          "title": "Nice underwear",
          "creator_type": "Customer",
          "vendor_code": "UGCPR",
          "vendor_name": "Computer_Link_Inc",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/da01dcbb-5dcc-4358-8910-0261f017dc96/default.jobtemplate.hls.m3u8",
          "type": "videos_for_related_products"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 5,
          "hard_maximum": true
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
          "type": "2p",
          "standard_delivery": {
            "date": "Wednesday, September 21",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Tuesday, September 20",
            "name": "Or fastest delivery Tuesday, September 20"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "Basa shop",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=ABJCY6LF4GG12&asin=B08FSS1758&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "ABJCY6LF4GG12"
          }
        },
        "price": {
          "symbol": "$",
          "value": 17.99,
          "currency": "USD",
          "raw": "$17.99"
        },
        "rrp": {
          "symbol": "$",
          "value": 28.99,
          "currency": "USD",
          "raw": "$28.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 68904,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Bikini Panties",
          "rank": 131,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1044974/ref=pd_zg_hrsr_fashion"
        }
      ],
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 68904, Category: Women's Bikini Panties | Rank: 131"
    },
    "brand_store": {
      "id": "15312D46-B751-4BEC-BCA2-E3B3A6BDE09A",
      "link": "https://www.amazon.com/stores/Xibing/page/15312D46-B751-4BEC-BCA2-E3B3A6BDE09A"
    }
  };
  let categoriesMap = {
    "Electronics": "electronics",
    "Printer": "electronics",
    "Clothing, Shoes & Jewelry": "fashion",
    "Sports-Shoes": "shoes",
    "Shoes": "shoes",
    "Socks": "socks",
    "Athletic Socks": "socks",
    "Compression Socks": "socks",
    "Boys": "childware",
    "Girls": "childware",
    "Swim": "swimware",
    "Swimsuits & Cover Ups": "swimware",
    "Competitive Swimwear": "swimware",
    "Sport Specific Clothing": "swimware",
    "Competitive Swimwear": "swimware",
    "Ties, Cummerbunds & Pocket Squares": "tie",
    "Neckties": "tie",
    "Belts": "belts",
    "Watches": "watches",
    "Smartwatches": "watches",
    "Wrist Watches": "watches",
    "Handbags & Wallets": "handbags",
    "Accessories": "accessories",
    "Lingerie": "lingerie",
    "Panties": "underwear",
    "Briefs": "underwear",
    "Boxer Briefs": "underwear",
    "Underwear": "underwear"
  };

  let result = await findProductCategoryFromRainforestResponse(rainforestResponse, categoriesMap);
  console.log("final result " + JSON.stringify(result));
});

//Category Rules Tests 'swimware'

it("discovery-rules", async () => {
//https://www.amazon.com/Speedo-Womens-Super-Swimsuit-Black/dp/B00FQZOQT0/ref=sr_1_2?keywords=swimsuit&qid=1663237810&sprefix=swim%2Caps%2C312&sr=8-2

  let rainforestResponse = {
    "request_info": {
      "success": true,
      "credits_used": 12,
      "credits_used_this_request": 1,
      "credits_remaining": 488,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/Speedo-Womens-Super-Swimsuit-Black/dp/B00FQZOQT0/ref=sr_1_2?keywords=swimsuit&qid=1663237810&sprefix=swim,aps,312&sr=8-2",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "Speedo Women's Swimsuit One Piece Prolt Super Pro Solid Adult",
      "keywords": "Speedo,Women's,Swimsuit,One,Piece,Prolt,Super,Pro,Solid,Adult",
      "keywords_list": [
        "Speedo",
        "Women's",
        "Swimsuit",
        "Piece",
        "Prolt",
        "Super",
        "Solid",
        "Adult"
      ],
      "asin": "B00FQZO5G4",
      "link": "https://www.amazon.com/Speedo-Womens-Swimsuit-Piece-Prolt/dp/B086GW3MXG",
      "brand": "Speedo",
      "has_size_guide": true,
      "documents": [
        {
          "name": "Size Guide (PDF)",
          "link": "https://m.media-amazon.com/images/I/61Pefa6YXtL.pdf"
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
          "name": "Sport Specific Clothing",
          "link": "https://www.amazon.com/b/ref=dp_bc_aui_C_2?ie=UTF8&node=23575629011",
          "category_id": "23575629011"
        },
        {
          "name": "Competitive Swimwear",
          "link": "https://www.amazon.com/b/ref=dp_bc_aui_C_3?ie=UTF8&node=23479403011",
          "category_id": "23479403011"
        },
        {
          "name": "Women",
          "link": "https://www.amazon.com/Womens-athletic-swimwear/b/ref=dp_bc_aui_C_4?ie=UTF8&node=2419367011",
          "category_id": "2419367011"
        },
        {
          "name": "One-Piece Suits",
          "link": "https://www.amazon.com/Womens-One-Piece-Swimwear/b/ref=dp_bc_aui_C_5?ie=UTF8&node=2371138011",
          "category_id": "2371138011"
        }
      ],
      "description": "Engineered to last through a busy swim season, this technical swimsuit will help you get the most out of each practice session. Durable ProLT fabric provides performance-building compression and reduced recovery time, while a specially designed back features wide straps for ultimate support as you move through the water.",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": false,
        "third_party": true
      },
      "sub_title": {
        "text": "Visit the Speedo Store",
        "link": "https://www.amazon.com/stores/Speedo/page/012FFA9E-E5FB-44FA-8A23-EEA4DB36C659?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.1,
      "ratings_total": 6627,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/81BYFwTECFL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/81BYFwTECFL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/816HiTEL7YL._AC_UL1500_.jpg",
          "variant": "BACK"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71MsMEqxUOL._AC_UL1000_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71KgkJK9erL._AC_UL1000_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/512GdPOfuvL._AC_UL1000_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51ZqPJ9WcNL._AC_UL1000_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71F57IShY3L._AC_UL1500_.jpg",
          "variant": "PT05"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51djqt3MvLL._AC_.jpg",
          "variant": "PT06"
        }
      ],
      "images_count": 8,
      "videos_additional": [
        {
          "product_asin": "B00FQZODVQ",
          "title": "One Piece Women's Swimsuit Speedo Review ",
          "creator_type": "Influencer",
          "vendor_code": "caesarcinema:shop",
          "vendor_name": "Caesar",
          "vendor_tracking_id": "hearces0f-20",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/651d6015-47ba-4e57-ae78-76f76e5c25ab/default.jobtemplate.hls.m3u8",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/dc2ef07c-c603-496c-bc94-d274a34c4b3e.vtt",
          "type": "videos_for_related_products"
        }
      ],
      "is_bundle": false,
      "buybox_winner": {
        "is_prime": false,
        "is_amazon_fresh": false,
        "condition": {
          "is_new": true
        },
        "fulfillment": {
          "type": "1p",
          "is_sold_by_amazon": true,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": false
        },
        "price": {
          "symbol": "$",
          "value": 23.99,
          "currency": "USD",
          "raw": "$23.99"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 1753,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's One-Piece Swimsuits",
          "rank": 5,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1046624/ref=pd_zg_hrsr_fashion"
        }
      ],
      "manufacturer": "Speedo Swimwear",
      "dimensions": "7 x 5 x 1 inches; 3.25 Ounces",
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 1753, Category: Women's One-Piece Swimsuits | Rank: 5"
    },
    "brand_store": {
      "id": "012FFA9E-E5FB-44FA-8A23-EEA4DB36C659",
      "link": "https://www.amazon.com/stores/Speedo/page/012FFA9E-E5FB-44FA-8A23-EEA4DB36C659"
    },
    "user_guide": "https://m.media-amazon.com/images/I/61Pefa6YXtL.pdf"
  };
  let categoriesMap = {
    "Electronics": "electronics",
    "Printer": "electronics",
    "Clothing, Shoes & Jewelry": "fashion",
    "Sports-Shoes": "shoes",
    "Shoes": "shoes",
    "Socks": "socks",
    "Athletic Socks": "socks",
    "Compression Socks": "socks",
    "Boys": "childware",
    "Girls": "childware",
    "Swim": "swimware",
    "Swimsuits & Cover Ups": "swimware",
    "Competitive Swimwear": "swimware",
    "Sport Specific Clothing": "swimware",
    "Competitive Swimwear": "swimware",
    "Ties, Cummerbunds & Pocket Squares": "tie",
    "Neckties": "tie",
    "Belts": "belts",
    "Watches": "watches",
    "Smartwatches": "watches",
    "Wrist Watches": "watches",
    "Handbags & Wallets": "handbags",
    "Accessories": "accessories",
    "Lingerie": "lingerie",
    "Panties": "underwear",
    "Briefs": "underwear",
    "Boxer Briefs": "underwear",
    "Underwear": "underwear"
  };

  let result = await findProductCategoryFromRainforestResponse(rainforestResponse, categoriesMap);
  console.log("final result " + JSON.stringify(result));
});

it("discovery-rules", async () => {
//https://www.amazon.com/dp/B07BBVMDN1/ref=sspa_dk_detail_5?psc=1&pd_rd_i=B07BBVMDN1&pd_rd_w=e7crG&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=6T77099SC0XAY7WWRANY&pd_rd_wg=OSS81&pd_rd_r=c7efffe9-960e-430e-8eaa-78ebc32dc37e&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzVjdMVFQ5WE4wNDlJJmVuY3J5cHRlZElkPUEwMTA1NzIyRldCOEJGVVdCU1pIJmVuY3J5cHRlZEFkSWQ9QTA4NTc2NzFQTUlTMUpHRjJIM1Amd2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWMmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl
  let rainforestResponse = {
    "request_info": {
      "success": true,
      "credits_used": 13,
      "credits_used_this_request": 1,
      "credits_remaining": 487,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/dp/B07BBVMDN1/ref=sspa_dk_detail_5?psc=1&pd_rd_i=B07BBVMDN1&pd_rd_w=e7crG&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=6T77099SC0XAY7WWRANY&pd_rd_wg=OSS81&pd_rd_r=c7efffe9-960e-430e-8eaa-78ebc32dc37e&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzVjdMVFQ5WE4wNDlJJmVuY3J5cHRlZElkPUEwMTA1NzIyRldCOEJGVVdCU1pIJmVuY3J5cHRlZEFkSWQ9QTA4NTc2NzFQTUlTMUpHRjJIM1Amd2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWMmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "TYR Women’s Hexa Diamondfit Swimsuit Black/Purple 32",
      "title_excluding_variant_name": "TYR Women’s Hexa Diamondfit Swimsuit",
      "keywords": "TYR,Women’s,Hexa,Diamondfit,Swimsuit",
      "keywords_list": [
        "Women’s",
        "Hexa",
        "Diamondfit",
        "Swimsuit"
      ],
      "asin": "B07BBVMDN1",
      "link": "https://www.amazon.com/dp/B07BBVMDN1??th=1&psc=1",
      "brand": "TYR",
      "has_size_guide": true,
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
          "name": "Sport Specific Clothing",
          "link": "https://www.amazon.com/b/ref=dp_bc_aui_C_2?ie=UTF8&node=23575629011",
          "category_id": "23575629011"
        },
        {
          "name": "Competitive Swimwear",
          "link": "https://www.amazon.com/b/ref=dp_bc_aui_C_3?ie=UTF8&node=23479403011",
          "category_id": "23479403011"
        },
        {
          "name": "Women",
          "link": "https://www.amazon.com/Womens-athletic-swimwear/b/ref=dp_bc_aui_C_4?ie=UTF8&node=2419367011",
          "category_id": "2419367011"
        },
        {
          "name": "One-Piece Suits",
          "link": "https://www.amazon.com/Womens-One-Piece-Swimwear/b/ref=dp_bc_aui_C_5?ie=UTF8&node=2371138011",
          "category_id": "2371138011"
        }
      ],
      "description": "Stay a step ahead of the competition in the TYR Women’s Hexa Diamondfit Swimsuit. Constructed with TYR’s most durable textile, Durafast Elite - the one piece performance swimsuit utilizes high denier poly fiber and innovative circular knit construction to combine the strength and colorfastness of polyester with the comfort of spandex. Featuring a medium neckline, sleek/flexible straps, keyhole back, moderate cut leg and graphic print, the Diamondfit is ideal for athletes who want reliable coverage during every swim. TYR performance swimsuits are fully lined, provide UPF 50+ sun protection, 360 degree range of motion and a lining for freshness. All Durafast Elite suits are chlorine proof and sustain an impressive 300+ hours of performance. TYR Durafast Elite: 94% Polyester / 6% Spandex",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "brand_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/638b345a-efce-4570-87af-aaecac61441f.__CR0,77,970,447_PT0_SX315_V1___.png",
          "title": "TYR Women’s Hexa Diamondfit Swimsuit Stay a step ahead of the competition in the TYR Women’s Hexa Diamondfit Swimsuit Product details",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/b4c0c96b-43e1-4962-b252-c4f59172af23.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
          "description": "Named for TYR the Norse god of valor and sacrifice, we're a company built on commitment and discipline. We've been pushing the limits of innovation to propel athletes to their absolute best for over 35 years. Whether it's personal records or world championships, we have the hard earned hardware to back it up.",
          "brand_store": {
            "link": "/stores/page/0B59B92B-43ED-4F18-B17D-C2952E091673",
            "id": "0B59B92B-43ED-4F18-B17D-C2952E091673"
          },
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/b4c0c96b-43e1-4962-b252-c4f59172af23.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/37d42850-31bd-4ee4-b137-d7f349b0719a.__CR455,127,533,667_PT0_SX362_V1___.jpg"
          ],
          "products": [
            {
              "title": "tyr, try sport, swim cap, kickboard, swimsuit, goggles, performance, swimwear",
              "asin": "B001A90NOS",
              "link": "/dp/B001A90NOS/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/61faec31-863b-41f1-a050-a9a7a0bdfb9e.__CR957,893,2363,2591_PT0_SX166_V1___.jpg"
            },
            {
              "title": "tyr, try sport, swim cap, kickboard, swimsuit, goggles, performance, swimwear",
              "asin": "B001M9KYL8",
              "link": "/dp/B001M9KYL8/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/cd1976f1-996f-470c-b867-4a9b7b2e3e83.__CR1197,2608,2146,2353_PT0_SX166_V1___.jpg"
            },
            {
              "title": "tyr",
              "asin": "B00D809O06",
              "link": "/dp/B00D809O06/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/ba5e185b-06a8-44a5-ac0b-f4de97ad8cb0.__CR114,0,680,746_PT0_SX166_V1___.jpg"
            },
            {
              "title": "tyr, try sport, swim cap, kickboard, swimsuit, goggles, performance, swimwear",
              "asin": "B003UNT14K",
              "link": "/dp/B003UNT14K/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/168fd22a-b370-48f5-8af3-522b53ddf3df.__CR510,83,756,829_PT0_SX166_V1___.jpg"
            },
            {
              "title": "tyr, try sport, swim cap, kickboard, swimsuit, goggles, performance, swimming",
              "asin": "B000I1T836",
              "link": "/dp/B000I1T836/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/b322eb17-50bd-4f69-8e3e-c7caf164c7ad.__CR28,0,584,640_PT0_SX166_V1___.jpg"
            },
            {
              "title": "tyr, try sport, swim cap, kickboard, swimsuit, goggles, performance, swimming",
              "asin": "B00JOUW0F0",
              "link": "/dp/B00JOUW0F0/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/73d827bd-e74f-48cd-862e-5b26522e0e04.__CR0,322,1599,1753_PT0_SX166_V1___.jpg"
            },
            {
              "title": "TYR, TYR sport, latex swim cap, swim cap latex, adult latex swim cap, swimming, women&amp;#39;s",
              "asin": "B0188R6DRK",
              "link": "/dp/B0188R6DRK/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/bd6d409d-37d0-4d4d-924e-2bb4bfe6c590.__CR203,0,626,686_PT0_SX166_V1___.jpg"
            },
            {
              "title": "TYR, TYR sport, latex swim cap, swim cap latex, adult latex swim cap, swimming, women&#39;s",
              "asin": "B0025UIF46",
              "link": "/dp/B0025UIF46/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/e587b4d4-eed0-4de7-ac10-e8e37b5c7f35.__CR56,139,559,613_PT0_SX166_V1___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/e8df56bc-58d8-4371-bf2f-9b3812df934c.__CR0,0,600,180_PT0_SX600_V1___.png",
        "company_description_text": "We are the brand that strives to make all things possible through sport. \n\n Named for TYR the Norse god of valor and sacrifice, we're a company built on commitment and discipline. We've been pushing the limits of innovation to propel athletes to their absolute best for over 35 years. Whether it's personal records or world championships, we have the hard earned hardware to back it up. \n\n Always in Front."
      },
      "sub_title": {
        "text": "Visit the TYR Store",
        "link": "https://www.amazon.com/stores/TYR/page/0B59B92B-43ED-4F18-B17D-C2952E091673?ref_=ast_bln"
      },
      "rating": 4.6,
      "ratings_total": 469,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/71YWghC1yUL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/71YWghC1yUL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71YvDas6a4L._AC_UL1500_.jpg",
          "variant": "BACK"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71OplP1E+AL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51D8vAMInQL._AC_UL1320_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/51RF3SLjadL._AC_UL1000_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/717tD7gsWgL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81rvYY4BPCL._AC_UL1500_.jpg",
          "variant": "PT05"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81FkImQtuoL._AC_UL1500_.jpg",
          "variant": "PT06"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81ZhZL7MArL._AC_UL1500_.jpg",
          "variant": "PT07"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71vnoODOuUL._AC_UL1500_.jpg",
          "variant": "PT08"
        }
      ],
      "images_count": 10,
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 30,
          "hard_maximum": true
        },
        "new_offers_count": 4,
        "new_offers_from": {
          "symbol": "$",
          "value": 63.99,
          "currency": "USD",
          "raw": "$63.99& FREE Shipping"
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
            "date": "Wed, Sep 21",
            "name": "FREE"
          },
          "fastest_delivery": {
            "date": "Tue, Sep 20",
            "name": "Or fastest delivery Tue, Sep 20"
          },
          "is_sold_by_amazon": true,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": false
        },
        "price": {
          "symbol": "$",
          "value": 65.19,
          "currency": "USD",
          "raw": "$65.19"
        },
        "rrp": {
          "symbol": "$",
          "value": 79.99,
          "currency": "USD",
          "raw": "$79.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 54098,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Athletic One-Piece Swimsuits",
          "rank": 43,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/2371138011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "manufacturer": "TYR",
      "weight": "4.8 Ounces",
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 54098, Category: Women's Athletic One-Piece Swimsuits | Rank: 43"
    },
    "brand_store": {
      "id": "0B59B92B-43ED-4F18-B17D-C2952E091673",
      "link": "https://www.amazon.com/stores/TYR/page/0B59B92B-43ED-4F18-B17D-C2952E091673"
    }
  };
  let categoriesMap = {
    "Electronics": "electronics",
    "Printer": "electronics",
    "Clothing, Shoes & Jewelry": "fashion",
    "Sports-Shoes": "shoes",
    "Shoes": "shoes",
    "Socks": "socks",
    "Athletic Socks": "socks",
    "Compression Socks": "socks",
    "Boys": "childware",
    "Girls": "childware",
    "Swim": "swimware",
    "Swimsuits & Cover Ups": "swimware",
    "Competitive Swimwear": "swimware",
    "Sport Specific Clothing": "swimware",
    "Competitive Swimwear": "swimware",
    "Ties, Cummerbunds & Pocket Squares": "tie",
    "Neckties": "tie",
    "Belts": "belts",
    "Watches": "watches",
    "Smartwatches": "watches",
    "Wrist Watches": "watches",
    "Handbags & Wallets": "handbags",
    "Accessories": "accessories",
    "Lingerie": "lingerie",
    "Panties": "underwear",
    "Briefs": "underwear",
    "Boxer Briefs": "underwear",
    "Underwear": "underwear"
  };

  let result = await findProductCategoryFromRainforestResponse(rainforestResponse, categoriesMap);
  console.log("final result " + JSON.stringify(result));
});

it("discovery-rules", async () => {
//https://www.amazon.com/dp/B07QB8G1QP/ref=sspa_dk_detail_5?psc=1&pd_rd_i=B07QB8G1QP&pd_rd_w=4ryQH&content-id=amzn1.sym.4d0fffec-3aba-4480-8fad-c6bd8f7f6b41&pf_rd_p=4d0fffec-3aba-4480-8fad-c6bd8f7f6b41&pf_rd_r=72BYRJZP08RZ0CXWC96P&pd_rd_wg=5UJLH&pd_rd_r=bdb94c56-77d4-4f21-b2b6-7afb5d738072&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzQlcwU1E5QlVBU1NZJmVuY3J5cHRlZElkPUEwMjU3Mzk5MkRUT1YxTVpLMDBKJmVuY3J5cHRlZEFkSWQ9QTEwNDM2MjMxQ09DUkEzNDEzNlFJJndpZGdldE5hbWU9c3BfZGV0YWlsX3RoZW1hdGljJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==
  let rainforestResponse = {
    "request_info": {
      "success": true,
      "credits_used": 14,
      "credits_used_this_request": 1,
      "credits_remaining": 486,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/dp/B07QB8G1QP/ref=sspa_dk_detail_5?psc=1&pd_rd_i=B07QB8G1QP&pd_rd_w=4ryQH&content-id=amzn1.sym.4d0fffec-3aba-4480-8fad-c6bd8f7f6b41&pf_rd_p=4d0fffec-3aba-4480-8fad-c6bd8f7f6b41&pf_rd_r=72BYRJZP08RZ0CXWC96P&pd_rd_wg=5UJLH&pd_rd_r=bdb94c56-77d4-4f21-b2b6-7afb5d738072&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzQlcwU1E5QlVBU1NZJmVuY3J5cHRlZElkPUEwMjU3Mzk5MkRUT1YxTVpLMDBKJmVuY3J5cHRlZEFkSWQ9QTEwNDM2MjMxQ09DUkEzNDEzNlFJJndpZGdldE5hbWU9c3BfZGV0YWlsX3RoZW1hdGljJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "TYR Women's Lambent Diamondfit Purple 30",
      "title_excluding_variant_name": "TYR Women's Lambent Diamondfit",
      "keywords": "TYR,Women's,Lambent,Diamondfit",
      "keywords_list": [
        "Women's",
        "Lambent",
        "Diamondfit"
      ],
      "asin": "B07QB8G1QP",
      "link": "https://www.amazon.com/dp/B07QB8G1QP??th=1&psc=1",
      "brand": "TYR",
      "has_size_guide": true,
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
          "name": "Sport Specific Clothing",
          "link": "https://www.amazon.com/b/ref=dp_bc_aui_C_2?ie=UTF8&node=23575629011",
          "category_id": "23575629011"
        },
        {
          "name": "Competitive Swimwear",
          "link": "https://www.amazon.com/b/ref=dp_bc_aui_C_3?ie=UTF8&node=23479403011",
          "category_id": "23479403011"
        },
        {
          "name": "Women",
          "link": "https://www.amazon.com/Womens-athletic-swimwear/b/ref=dp_bc_aui_C_4?ie=UTF8&node=2419367011",
          "category_id": "2419367011"
        },
        {
          "name": "One-Piece Suits",
          "link": "https://www.amazon.com/Womens-One-Piece-Swimwear/b/ref=dp_bc_aui_C_5?ie=UTF8&node=2371138011",
          "category_id": "2371138011"
        }
      ],
      "description": "Founded in Huntington Beach, CA by swimwear designer Joseph Lorenzo (current owner) and 1972 Olympic Bronze Medalist Steve Furness, TYR Sport was established in 1985 to provide the competitive swim market with vibrant, performance-driven prints. Since its inception three decades ago, TYR has grown to exist as one of the world’s most recognizable swimming and triathlon brands. With global distributors and an international following, TYR remains dedicated to building the industry’s most durable, uniquely designed swimsuits, cutting edge equipment and innovative caps and goggles. On a relentless path to push the limits of sportswear We not only reimagine technologies for enhanced competitive performance, but also embrace lifestyle markets to accommodate athletes and water enthusiasts at every level.",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "brand_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/638b345a-efce-4570-87af-aaecac61441f.__CR0,77,970,447_PT0_SX315_V1___.png",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/b4c0c96b-43e1-4962-b252-c4f59172af23.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
          "description": "Named for TYR the Norse god of valor and sacrifice, we're a company built on commitment and discipline. We've been pushing the limits of innovation to propel athletes to their absolute best for over 35 years. Whether it's personal records or world championships, we have the hard earned hardware to back it up.",
          "brand_store": {
            "link": "/stores/page/0B59B92B-43ED-4F18-B17D-C2952E091673",
            "id": "0B59B92B-43ED-4F18-B17D-C2952E091673"
          },
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/b4c0c96b-43e1-4962-b252-c4f59172af23.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/37d42850-31bd-4ee4-b137-d7f349b0719a.__CR455,127,533,667_PT0_SX362_V1___.jpg"
          ],
          "products": [
            {
              "title": "tyr, try sport, swim cap, kickboard, swimsuit, goggles, performance, swimwear",
              "asin": "B001A90NOS",
              "link": "/dp/B001A90NOS/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/61faec31-863b-41f1-a050-a9a7a0bdfb9e.__CR957,893,2363,2591_PT0_SX166_V1___.jpg"
            },
            {
              "title": "tyr, try sport, swim cap, kickboard, swimsuit, goggles, performance, swimwear",
              "asin": "B001M9KYL8",
              "link": "/dp/B001M9KYL8/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/cd1976f1-996f-470c-b867-4a9b7b2e3e83.__CR1197,2608,2146,2353_PT0_SX166_V1___.jpg"
            },
            {
              "title": "tyr",
              "asin": "B00D809O06",
              "link": "/dp/B00D809O06/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/ba5e185b-06a8-44a5-ac0b-f4de97ad8cb0.__CR114,0,680,746_PT0_SX166_V1___.jpg"
            },
            {
              "title": "tyr, try sport, swim cap, kickboard, swimsuit, goggles, performance, swimwear",
              "asin": "B003UNT14K",
              "link": "/dp/B003UNT14K/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/168fd22a-b370-48f5-8af3-522b53ddf3df.__CR510,83,756,829_PT0_SX166_V1___.jpg"
            },
            {
              "title": "tyr, try sport, swim cap, kickboard, swimsuit, goggles, performance, swimming",
              "asin": "B000I1T836",
              "link": "/dp/B000I1T836/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/b322eb17-50bd-4f69-8e3e-c7caf164c7ad.__CR28,0,584,640_PT0_SX166_V1___.jpg"
            },
            {
              "title": "tyr, try sport, swim cap, kickboard, swimsuit, goggles, performance, swimming",
              "asin": "B00JOUW0F0",
              "link": "/dp/B00JOUW0F0/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/73d827bd-e74f-48cd-862e-5b26522e0e04.__CR0,322,1599,1753_PT0_SX166_V1___.jpg"
            },
            {
              "title": "TYR, TYR sport, latex swim cap, swim cap latex, adult latex swim cap, swimming, women&amp;#39;s",
              "asin": "B0188R6DRK",
              "link": "/dp/B0188R6DRK/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/bd6d409d-37d0-4d4d-924e-2bb4bfe6c590.__CR203,0,626,686_PT0_SX166_V1___.jpg"
            },
            {
              "title": "TYR, TYR sport, latex swim cap, swim cap latex, adult latex swim cap, swimming, women&#39;s",
              "asin": "B0025UIF46",
              "link": "/dp/B0025UIF46/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/e587b4d4-eed0-4de7-ac10-e8e37b5c7f35.__CR56,139,559,613_PT0_SX166_V1___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/638b345a-efce-4570-87af-aaecac61441f.__CR0,77,970,447_PT0_SX315_V1___.png",
        "company_description_text": "Named for TYR the Norse god of valor and sacrifice, we're a company built on commitment and discipline.  We've been pushing the limits of innovation to propel athletes to their absolute best for over 35 years.  Whether it's personal records or world championships, we have the hard earned hardware to back it up."
      },
      "sub_title": {
        "text": "Visit the TYR Store",
        "link": "https://www.amazon.com/stores/TYR/page/0B59B92B-43ED-4F18-B17D-C2952E091673?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.7,
      "ratings_total": 49,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/81rIIaEI7FL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/81rIIaEI7FL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/91ibdxLKkHL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81tYtneZ8SL._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/91O1b9TRUiL._AC_UL1500_.jpg",
          "variant": "PT10"
        },
        {
          "link": "https://m.media-amazon.com/images/I/91sXzFv3X0L._AC_UL1500_.jpg",
          "variant": "PT11"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81Q2WQw+KBL._AC_UL1500_.jpg",
          "variant": "PT13"
        }
      ],
      "images_count": 6,
      "is_bundle": false,
      "buybox_winner": {
        "new_offers_count": 2,
        "new_offers_from": {
          "symbol": "$",
          "value": 67,
          "currency": "USD",
          "raw": "$67.00"
        },
        "is_prime": true,
        "is_amazon_fresh": false,
        "condition": {
          "is_new": true
        },
        "availability": {
          "type": "in_stock",
          "raw": "Only 1 left in stock - order soon.",
          "dispatch_days": 1,
          "stock_level": 1
        },
        "fulfillment": {
          "type": "2p",
          "standard_delivery": {
            "date": "Thu, Sep 22",
            "name": "FREE"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "ECommerce Distributors",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A7KNO4X5U3FKQ&asin=B07QB8G1QP&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A7KNO4X5U3FKQ"
          }
        },
        "price": {
          "symbol": "$",
          "value": 67,
          "currency": "USD",
          "raw": "$67.00"
        },
        "rrp": {
          "symbol": "$",
          "value": 84.99,
          "currency": "USD",
          "raw": "$84.99"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "more_buying_choices": [
        {
          "price": {
            "symbol": "$",
            "value": 84.99,
            "currency": "USD",
            "raw": "$84.99"
          },
          "seller_name": "Amazon.com",
          "free_shipping": true,
          "position": 1
        }
      ],
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 317307,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Athletic One-Piece Swimsuits",
          "rank": 250,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/2371138011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "manufacturer": "TYR",
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 317307, Category: Women's Athletic One-Piece Swimsuits | Rank: 250"
    },
    "brand_store": {
      "id": "0B59B92B-43ED-4F18-B17D-C2952E091673",
      "link": "https://www.amazon.com/stores/TYR/page/0B59B92B-43ED-4F18-B17D-C2952E091673"
    }
  };
  let categoriesMap = {
    "Electronics": "electronics",
    "Printer": "electronics",
    "Clothing, Shoes & Jewelry": "fashion",
    "Sports-Shoes": "shoes",
    "Shoes": "shoes",
    "Socks": "socks",
    "Athletic Socks": "socks",
    "Compression Socks": "socks",
    "Boys": "childware",
    "Girls": "childware",
    "Swim": "swimware",
    "Swimsuits & Cover Ups": "swimware",
    "Competitive Swimwear": "swimware",
    "Sport Specific Clothing": "swimware",
    "Competitive Swimwear": "swimware",
    "Ties, Cummerbunds & Pocket Squares": "tie",
    "Neckties": "tie",
    "Belts": "belts",
    "Watches": "watches",
    "Smartwatches": "watches",
    "Wrist Watches": "watches",
    "Handbags & Wallets": "handbags",
    "Accessories": "accessories",
    "Lingerie": "lingerie",
    "Panties": "underwear",
    "Briefs": "underwear",
    "Boxer Briefs": "underwear",
    "Underwear": "underwear"
  };

  let result = await findProductCategoryFromRainforestResponse(rainforestResponse, categoriesMap);
  console.log("final result " + JSON.stringify(result));
});

it("discovery-rules", async () => {
//https://www.amazon.com/dp/B09K4RRHC3/ref=sspa_dk_detail_0?psc=1&pd_rd_i=B09K4RRHC3&pd_rd_w=Y5Wt2&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=ZNG17PNHR3FZ6E8ZN13V&pd_rd_wg=25JUy&pd_rd_r=2eec909f-1a6d-4314-9c7c-0f72e1b31da7&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExTVNTNlpUS1UzTlZBJmVuY3J5cHRlZElkPUEwNDM0MDI0MkU3MUQ5WjRHQzU5JmVuY3J5cHRlZEFkSWQ9QTAxNzc2NTIzNjk3NlBGTEVFRDYzJndpZGdldE5hbWU9c3BfZGV0YWlsX3RoZW1hdGljJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==
  let rainforestResponse = {
    "request_info": {
      "success": true,
      "credits_used": 15,
      "credits_used_this_request": 1,
      "credits_remaining": 485,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/dp/B09K4RRHC3/ref=sspa_dk_detail_0?psc=1&pd_rd_i=B09K4RRHC3&pd_rd_w=Y5Wt2&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=ZNG17PNHR3FZ6E8ZN13V&pd_rd_wg=25JUy&pd_rd_r=2eec909f-1a6d-4314-9c7c-0f72e1b31da7&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExTVNTNlpUS1UzTlZBJmVuY3J5cHRlZElkPUEwNDM0MDI0MkU3MUQ5WjRHQzU5JmVuY3J5cHRlZEFkSWQ9QTAxNzc2NTIzNjk3NlBGTEVFRDYzJndpZGdldE5hbWU9c3BfZGV0YWlsX3RoZW1hdGljJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "TYR Women's Durafast Elite Square Neck Controlfit Swimsuit 18 Black Camo",
      "title_excluding_variant_name": "TYR Women's Durafast Elite Square Neck Controlfit Swimsuit",
      "keywords": "TYR,Women's,Durafast,Elite,Square,Neck,Controlfit,Swimsuit",
      "keywords_list": [
        "Women's",
        "Durafast",
        "Elite",
        "Square",
        "Neck",
        "Controlfit",
        "Swimsuit"
      ],
      "asin": "B09K4RRHC3",
      "link": "https://www.amazon.com/dp/B09K4RRHC3??th=1&psc=1",
      "brand": "TYR",
      "has_size_guide": true,
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
          "name": "Sport Specific Clothing",
          "link": "https://www.amazon.com/b/ref=dp_bc_aui_C_2?ie=UTF8&node=23575629011",
          "category_id": "23575629011"
        },
        {
          "name": "Competitive Swimwear",
          "link": "https://www.amazon.com/b/ref=dp_bc_aui_C_3?ie=UTF8&node=23479403011",
          "category_id": "23479403011"
        },
        {
          "name": "Women",
          "link": "https://www.amazon.com/Womens-athletic-swimwear/b/ref=dp_bc_aui_C_4?ie=UTF8&node=2419367011",
          "category_id": "2419367011"
        },
        {
          "name": "One-Piece Suits",
          "link": "https://www.amazon.com/Womens-One-Piece-Swimwear/b/ref=dp_bc_aui_C_5?ie=UTF8&node=2371138011",
          "category_id": "2371138011"
        }
      ],
      "description": "he Solid Square Neck Tank Swimsuit showcases Durafast Stretch construction to combine the durability and colorfastness of polyester with the support and flexibility of spandex. Ideal for training and everyday use, the TSQR7 women's suit is built to sustain hours of abuse while maintaining a comfortable hold on your body. Designed for unsurpassed sun and chlorine resistance, Durafast Stretch fabric keeps your swimwear looking and fitting like new swim after swim. The Solid Square Neck Tank features removable cups and adjustable straps, allow for a comfortable, secure fit.",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": false,
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/e8df56bc-58d8-4371-bf2f-9b3812df934c.__CR0,0,600,180_PT0_SX600_V1___.png",
        "company_description_text": "We are the brand that strives to make all things possible through sport. \n\n Named for TYR the Norse god of valor and sacrifice, we're a company built on commitment and discipline. We've been pushing the limits of innovation to propel athletes to their absolute best for over 35 years. Whether it's personal records or world championships, we have the hard earned hardware to back it up. \n\n Always in Front."
      },
      "sub_title": {
        "text": "Visit the TYR Store",
        "link": "https://www.amazon.com/stores/TYR/page/0B59B92B-43ED-4F18-B17D-C2952E091673?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "rating": 4.2,
      "ratings_total": 451,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/81OOe3llHbL.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/81OOe3llHbL._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71t6PEHAM4L._AC_UL1500_.jpg",
          "variant": "BACK"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81RoUYBjXiL._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61QeX+94QgL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61f90kqFEoL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61dWM4PZxUL._AC_UL1500_.jpg",
          "variant": "PT05"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81BaHNJyTlL._AC_UL1500_.jpg",
          "variant": "PT06"
        }
      ],
      "images_count": 7,
      "videos": [
        {
          "duration_seconds": 17,
          "width": 854,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/b0e007f4-490d-4a4c-b456-89504a7842f7/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/41VQjUyi9GL.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "TYR Women's Durafast Elite Square Neck Controlfit Swimsuit"
        }
      ],
      "videos_count": 1,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/b0e007f4-490d-4a4c-b456-89504a7842f7/default.jobtemplate.mp4.480.mp4",
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 30,
          "hard_maximum": true
        },
        "new_offers_count": 3,
        "new_offers_from": {
          "symbol": "$",
          "value": 89.04,
          "currency": "USD",
          "raw": "$89.04"
        },
        "is_prime": true,
        "is_amazon_fresh": false,
        "condition": {
          "is_new": true
        },
        "availability": {
          "type": "in_stock",
          "raw": "Only 1 left in stock (more on the way).",
          "dispatch_days": 1,
          "stock_level": 1
        },
        "fulfillment": {
          "type": "1p",
          "standard_delivery": {
            "date": "Thursday, September 22",
            "name": "FREE"
          },
          "is_sold_by_amazon": true,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": false
        },
        "price": {
          "symbol": "$",
          "value": 89.04,
          "currency": "USD",
          "raw": "$89.04"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "more_buying_choices": [
        {
          "price": {
            "symbol": "$",
            "value": 89.99,
            "currency": "USD",
            "raw": "$89.99"
          },
          "seller_name": "Outdoor-Gear-Exchange",
          "position": 1
        }
      ],
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 142240,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Athletic One-Piece Swimsuits",
          "rank": 126,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/2371138011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "manufacturer": "TYR",
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 142240, Category: Women's Athletic One-Piece Swimsuits | Rank: 126"
    },
    "brand_store": {
      "id": "0B59B92B-43ED-4F18-B17D-C2952E091673",
      "link": "https://www.amazon.com/stores/TYR/page/0B59B92B-43ED-4F18-B17D-C2952E091673"
    }
  };
  let categoriesMap = {
    "Electronics": "electronics",
    "Printer": "electronics",
    "Clothing, Shoes & Jewelry": "fashion",
    "Sports-Shoes": "shoes",
    "Shoes": "shoes",
    "Socks": "socks",
    "Athletic Socks": "socks",
    "Compression Socks": "socks",
    "Boys": "childware",
    "Girls": "childware",
    "Swim": "swimware",
    "Swimsuits & Cover Ups": "swimware",
    "Competitive Swimwear": "swimware",
    "Sport Specific Clothing": "swimware",
    "Competitive Swimwear": "swimware",
    "Ties, Cummerbunds & Pocket Squares": "tie",
    "Neckties": "tie",
    "Belts": "belts",
    "Watches": "watches",
    "Smartwatches": "watches",
    "Wrist Watches": "watches",
    "Handbags & Wallets": "handbags",
    "Accessories": "accessories",
    "Lingerie": "lingerie",
    "Panties": "underwear",
    "Briefs": "underwear",
    "Boxer Briefs": "underwear",
    "Underwear": "underwear"
  };

  let result = await findProductCategoryFromRainforestResponse(rainforestResponse, categoriesMap);
  console.log("final result " + JSON.stringify(result));
});

it("discovery-rules", async () => {
//https://www.amazon.com/dp/B071LH5365/ref=sspa_dk_detail_3?psc=1&pd_rd_i=B071LH5365&pd_rd_w=HQhJQ&content-id=amzn1.sym.4d0fffec-3aba-4480-8fad-c6bd8f7f6b41&pf_rd_p=4d0fffec-3aba-4480-8fad-c6bd8f7f6b41&pf_rd_r=W6VYBNSY7G3QDNA2D4PD&pd_rd_wg=O82hu&pd_rd_r=f4f44554-7401-47d7-a4da-48f45c69998a&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&smid=A7KNO4X5U3FKQ&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExMzRWTTlYRlc3TkE3JmVuY3J5cHRlZElkPUEwNzMxNTkxM0NWSFZCTVZKQjdSWSZlbmNyeXB0ZWRBZElkPUEwNDg5NDYwMVFPMjA4TzhYSUtSNCZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=

  let rainforestResponse = {
    "request_info": {
      "success": true,
      "credits_used": 16,
      "credits_used_this_request": 1,
      "credits_remaining": 484,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "url": "https://www.amazon.com/dp/B071LH5365/ref=sspa_dk_detail_3?psc=1&pd_rd_i=B071LH5365&pd_rd_w=HQhJQ&content-id=amzn1.sym.4d0fffec-3aba-4480-8fad-c6bd8f7f6b41&pf_rd_p=4d0fffec-3aba-4480-8fad-c6bd8f7f6b41&pf_rd_r=W6VYBNSY7G3QDNA2D4PD&pd_rd_wg=O82hu&pd_rd_r=f4f44554-7401-47d7-a4da-48f45c69998a&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&smid=A7KNO4X5U3FKQ&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExMzRWTTlYRlc3TkE3JmVuY3J5cHRlZElkPUEwNzMxNTkxM0NWSFZCTVZKQjdSWSZlbmNyeXB0ZWRBZElkPUEwNDg5NDYwMVFPMjA4TzhYSUtSNCZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.categories_flat,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store'"
    },
    "product": {
      "title": "TYR CCR7A61030 Crypsis Cutoutfit Swimsuit Red 30",
      "keywords": "TYR,CCR7A61030,Crypsis,Cutoutfit,Swimsuit,Red,30",
      "keywords_list": [
        "CCR7A61030",
        "Crypsis",
        "Cutoutfit",
        "Swimsuit"
      ],
      "asin": "B071LH5365",
      "link": "https://www.amazon.com/TYR-Womens-Crypsis-Cutoutfit-Red/dp/B071LH5365",
      "brand": "TYR",
      "has_size_guide": true,
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
          "name": "Sport Specific Clothing",
          "link": "https://www.amazon.com/b/ref=dp_bc_aui_C_2?ie=UTF8&node=23575629011",
          "category_id": "23575629011"
        },
        {
          "name": "Competitive Swimwear",
          "link": "https://www.amazon.com/b/ref=dp_bc_aui_C_3?ie=UTF8&node=23479403011",
          "category_id": "23479403011"
        },
        {
          "name": "Women",
          "link": "https://www.amazon.com/Womens-athletic-swimwear/b/ref=dp_bc_aui_C_4?ie=UTF8&node=2419367011",
          "category_id": "2419367011"
        },
        {
          "name": "One-Piece Suits",
          "link": "https://www.amazon.com/Womens-One-Piece-Swimwear/b/ref=dp_bc_aui_C_5?ie=UTF8&node=2371138011",
          "category_id": "2371138011"
        }
      ],
      "description": "Founded in Huntington Beach, CA by swimwear designer Joseph Lorenzo (current owner) and 1972 Olympic Bronze Medalist Steve Furness, TYR Sport was established in 1985 to provide the competitive swim market with vibrant, performance-driven prints. Since its inception three decades ago, TYR has grown to exist as one of the world’s most recognizable swimming and triathlon brands. With global distributors and an international following, TYR remains dedicated to building the industry’s most durable, uniquely designed swimsuits, cutting edge equipment and innovative caps and goggles. On a relentless path to push the limits of sportswear We not only reimagine technologies for enhanced competitive performance, but also embrace lifestyle markets to accommodate athletes and water enthusiasts at every level.",
      "sub_title": {
        "text": "Visit the TYR Store",
        "link": "https://www.amazon.com/stores/TYR/page/0B59B92B-43ED-4F18-B17D-C2952E091673?ref_=ast_bln"
      },
      "marketplace_id": "ATVPDKIKX0DER",
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/91URjLWmq3L.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/91URjLWmq3L._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81lI-mq5sDL._AC_UL1500_.jpg",
          "variant": "PT01"
        }
      ],
      "images_count": 2,
      "is_bundle": false,
      "buybox_winner": {
        "maximum_order_quantity": {
          "value": 2,
          "hard_maximum": true
        },
        "new_offers_count": 2,
        "new_offers_from": {
          "symbol": "$",
          "value": 48.61,
          "currency": "USD",
          "raw": "$48.61"
        },
        "is_prime": true,
        "is_amazon_fresh": false,
        "condition": {
          "is_new": true
        },
        "availability": {
          "type": "in_stock",
          "raw": "Only 2 left in stock - order soon.",
          "dispatch_days": 1,
          "stock_level": 2
        },
        "fulfillment": {
          "type": "2p",
          "standard_delivery": {
            "date": "Wednesday, September 21",
            "name": "FREE"
          },
          "is_sold_by_amazon": false,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": true,
          "third_party_seller": {
            "name": "ECommerce Distributors",
            "link": "https://www.amazon.com/gp/help/seller/at-a-glance.html/ref=dp_merchant_link?ie=UTF8&seller=A7KNO4X5U3FKQ&asin=B071LH5365&ref_=dp_merchant_link&isAmazonFulfilled=1",
            "id": "A7KNO4X5U3FKQ"
          }
        },
        "price": {
          "symbol": "$",
          "value": 69,
          "currency": "USD",
          "raw": "$69.00"
        },
        "shipping": {
          "raw": "FREE"
        }
      },
      "more_buying_choices": [
        {
          "price": {
            "symbol": "$",
            "value": 48.61,
            "currency": "USD",
            "raw": "$48.61"
          },
          "seller_name": "Metro Swim Shop Online LLC",
          "position": 1
        }
      ],
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 6904867,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Athletic One-Piece Swimsuits",
          "rank": 4242,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/2371138011/ref=pd_zg_hrsr_fashion"
        }
      ],
      "manufacturer": "PROOK",
      "dimensions": "7.01 x 5.98 x 0.98 inches; 4.37 Ounces",
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 6904867, Category: Women's Athletic One-Piece Swimsuits | Rank: 4242"
    },
    "brand_store": {
      "id": "0B59B92B-43ED-4F18-B17D-C2952E091673",
      "link": "https://www.amazon.com/stores/TYR/page/0B59B92B-43ED-4F18-B17D-C2952E091673"
    }
  };
  let categoriesMap = {
    "Electronics": "electronics",
    "Printer": "electronics",
    "Clothing, Shoes & Jewelry": "fashion",
    "Sports-Shoes": "shoes",
    "Shoes": "shoes",
    "Socks": "socks",
    "Athletic Socks": "socks",
    "Compression Socks": "socks",
    "Boys": "childware",
    "Girls": "childware",
    "Swim": "swimware",
    "Swimsuits & Cover Ups": "swimware",
    "Competitive Swimwear": "swimware",
    "Sport Specific Clothing": "swimware",
    "Competitive Swimwear": "swimware",
    "Ties, Cummerbunds & Pocket Squares": "tie",
    "Neckties": "tie",
    "Belts": "belts",
    "Watches": "watches",
    "Smartwatches": "watches",
    "Wrist Watches": "watches",
    "Handbags & Wallets": "handbags",
    "Accessories": "accessories",
    "Lingerie": "lingerie",
    "Panties": "underwear",
    "Briefs": "underwear",
    "Boxer Briefs": "underwear",
    "Underwear": "underwear"
  };

  let result = await findProductCategoryFromRainforestResponse(rainforestResponse, categoriesMap);
  console.log("final result " + JSON.stringify(result));
});

//https://www.amazon.com/Ulla-Johnson-Womens-Koa-Goldenrod/dp/B09PRRWK82,

//below the waist

it("below-the-waist-example-1-working", async () => {
//https://www.amazon.com/dp/B09ZD4RBKN/ref=sspa_dk_detail_2?psc=1&pd_rd_i=B09ZD4RBKN&pd_rd_w=uc2ar&content-id=amzn1.sym.3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_p=3481f441-61ac-4028-9c1a-7f9ce8ec50c5&pf_rd_r=N0XA0FCWJV3S54KV5JRM&pd_rd_wg=UnPBC&pd_rd_r=4af6240c-66ee-4152-bcb6-3a2e24dee40f&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExVjZQMVdTWVhRSVc5JmVuY3J5cHRlZElkPUEwMjM0NjYwMU9GMFJWOEc5UjVLNCZlbmNyeXB0ZWRBZElkPUEwMDcxMTMwMVpEVTk0MDhaNUo3QSZ3aWRnZXROYW1lPXNwX2RldGFpbF90aGVtYXRpYyZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=

  // let payload = {
  //   "job_id": "qc_nk9zpyet24",
  //   "target_type": "URL",
  //   "target_value": "https://www.amazon.com/dp/B01N7OUMCB/ref=sspa_dk_detail_7?psc=1&pd_rd_i=B01N7OUMCB&pd_rd_w=qh9qd&content-id=amzn1.sym.dd2c6db7-6626-466d-bf04-9570e69a7df0&pf_rd_p=dd2c6db7-6626-466d-bf04-9570e69a7df0&pf_rd_r=KNJK066XP0DHM169GC9Y&pd_rd_wg=K8rWy&pd_rd_r=72da5896-709a-4c90-8b9f-8a584a6e6a01&s=apparel&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExWUFXS1FVMVQ5R1M0JmVuY3J5cHRlZElkPUEwMjg1Mzg4TVg5RFVHTDVHV1dEJmVuY3J5cHRlZEFkSWQ9QTAxMzM4MzUzSDFGQlkxT0o3WlZHJndpZGdldE5hbWU9c3BfZGV0YWlsX3RoZW1hdGljJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==",
  //   "platform_id": "AMAZON",
  //   "manual_upload": false
  // };
  let payload = {
    "request_info": {
      "success": true,
      "credits_used": 864,
      "overage_used": 364,
      "credits_used_this_request": 1,
      "credits_remaining": 0,
      "credits_reset_at": "2022-10-15T02:07:17.000Z"
    },
    "request_parameters": {
      "type": "product",
      "exclude_fields": "also_bought,product.search_alias,product.parent_asin,product.size_guide_html,product.variants,product.rating_breakdown,product.images_flat,product.feature_bullets,product.feature_bullets_count,product.feature_bullets_flat,product.top_reviews,product.specifications,product.specifications_flat,product.first_available,product.model_number,request_info,request_parameters,request_metadata,product.variant_asins_flat,also_viewed,sponsored_products,brand_store",
      "url": "https://www.amazon.com/RUNNING-GIRL-Criss-Cross-Removable-WX2353-White-L/dp/B07XBJC76H/ref=sr_1_11?"
    },
    "product": {
      "title": "RUNNING GIRL Sports Bra for Women, Criss-Cross Back Padded Strappy Sports Bras Medium Support Yoga Bra with Removable Cups",
      "keywords": "RUNNING,GIRL,Sports,Bra,for,Women,,Criss-Cross,Back,Padded,Strappy,Sports,Bras,Medium,Support,Yoga,Bra,with,Removable,Cups",
      "keywords_list": [
        "RUNNING",
        "GIRL",
        "Sports",
        "Women",
        "Criss-Cross",
        "Back",
        "Padded",
        "Strappy",
        "Sports",
        "Bras",
        "Medium",
        "Support",
        "Yoga",
        "with",
        "Removable",
        "Cups"
      ],
      "asin": "B07XBJ6QVR",
      "link": "https://www.amazon.com/RUNNING-GIRL-Criss-Cross-Strappy-Removable/dp/B08SLNT168",
      "brand": "RUNNING GIRL",
      "bestseller_badge": {
        "link": "https://www.amazon.com/gp/bestsellers/fashion/1044990/ref=zg_b_bs_1044990_1",
        "category": "Women's Sports Bras",
        "badge_text": "#1 Best Seller"
      },
      "has_size_guide": true,
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
          "name": "Lingerie",
          "link": "https://www.amazon.com/Lingerie/b/ref=dp_bc_aui_C_5?ie=UTF8&node=14333511",
          "category_id": "14333511"
        },
        {
          "name": "Bras",
          "link": "https://www.amazon.com/Womens-Bras/b/ref=dp_bc_aui_C_6?ie=UTF8&node=1044960",
          "category_id": "1044960"
        },
        {
          "name": "Sports Bras",
          "link": "https://www.amazon.com/Womens-Sports-Bras/b/ref=dp_bc_aui_C_7?ie=UTF8&node=1044990",
          "category_id": "1044990"
        }
      ],
      "categories_flat": "All Departments > Clothing, Shoes & Jewelry > Women > Clothing > Lingerie, Sleep & Lounge > Lingerie > Bras > Sports Bras",
      "a_plus_content": {
        "has_a_plus_content": true,
        "has_brand_story": true,
        "brand_story": {
          "brand_logo": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/f21c4da1-daed-412c-865d-d61f1c8e9d0a.__CR0,0,315,145_PT0_SX315_V1___.jpg",
          "title": "Perfect bra for yoga,exercise,fitness,any type of workout,or everyday use.",
          "hero_image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/d24e0acd-6cfd-47a2-9935-5f95f969ffcf.__CR0,0,1464,625_PT0_SX1464_V1___.jpg",
          "description": "Designed for a compression fit, Maximum Support sports bras are constructed with thicker straps and wider hems. They are created for stability & comfort. Perfect for medium/ high-impact workouts such as tennis、HIIT training、yoga、running and cardio,fit snugly to the body for additional lift and support. They will hold you in without holding you back.They are our most supportive bras!",
          "images": [
            "https://m.media-amazon.com/images/S/aplus-media-library-service-media/d24e0acd-6cfd-47a2-9935-5f95f969ffcf.__CR0,0,1464,625_PT0_SX1464_V1___.jpg"
          ],
          "products": [
            {
              "title": "RUNNING GIRL Strappy Sports Bra for Women Sexy Crisscross Back Light Support Yoga Bra with Remova...",
              "asin": "B07S4777WT",
              "link": "/dp/B07S4777WT/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/I/41%2Bnvh4IJnL.__AC_SR166,182___.jpg"
            },
            {
              "title": "RUNNING GIRL Sports Bra for Women, Flow Y Back Workout Strappy Sports Bras Medium Support Yoga Gy...",
              "asin": "B09Q8ZN9FS",
              "link": "/dp/B09Q8ZN9FS/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/I/311LdBSCrsL.__AC_SR166,182___.jpg"
            },
            {
              "title": "RUNNING GIRL Sports Bra for Women, Strong-Line Back Padded Workout Sports Bras Medium Support Yog...",
              "asin": "B09Q81XP6Y",
              "link": "/dp/B09Q81XP6Y/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/I/31FZvo6ANHL.__AC_SR166,182___.jpg"
            },
            {
              "title": "RUNNING GIRL Sports Bra for Women, Medium-High Support Criss-Cross Back Strappy Padded Sports Bra...",
              "asin": "B09XHVRWJ5",
              "link": "/dp/B09XHVRWJ5/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/I/41JoTAs9JwL.__AC_SR166,182___.jpg"
            },
            {
              "title": "black sports bra",
              "asin": "B0B6JJXTHC",
              "link": "/dp/B0B6JJXTHC/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/59385450-372d-4f90-847a-5631297e0e83.__CR0,43,3035,3328_PT0_SX166_V1___.jpg"
            },
            {
              "title": "white sports bra",
              "asin": "B0B6JHLSSS",
              "link": "/dp/B0B6JHLSSS/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/1df8fe78-d07f-4950-ac2e-dbca88e039da.__CR0,62,3034,3326_PT0_SX166_V1___.jpg"
            },
            {
              "title": "green sports bra",
              "asin": "B0B6PXWCYM",
              "link": "/dp/B0B6PXWCYM/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/5539cff6-dbe5-4a49-8acc-02aa8e4ecc50.__CR13,0,3101,3400_PT0_SX166_V1___.jpg"
            },
            {
              "title": "brown sports bra",
              "asin": "B0B6JGQ9PL",
              "link": "/dp/B0B6JGQ9PL/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/2f7e422b-c98b-4b6b-b631-e0e9f2f46a06.__CR10,0,3121,3422_PT0_SX166_V1___.jpg"
            },
            {
              "title": "blue sports bras for women",
              "asin": "B0B6JHCFZ3",
              "link": "/dp/B0B6JHCFZ3/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/30de655e-47c2-4281-8df3-9fbb70ae1802.__CR6,0,3264,3579_PT0_SX166_V1___.jpg"
            },
            {
              "title": "white sports bras for women",
              "asin": "B0B6JHM42R",
              "link": "/dp/B0B6JHM42R/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/5f2de918-8b60-4b16-9646-8ba2765c4a48.__CR47,0,3231,3542_PT0_SX166_V1___.jpg"
            },
            {
              "title": "dark bule sports bras for women",
              "asin": "B0B6JFFJ9T",
              "link": "/dp/B0B6JFFJ9T/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/ee3f1c48-d37c-43c8-9f59-ce5c10ba9c71.__CR8,0,3264,3579_PT0_SX166_V1___.jpg"
            },
            {
              "title": "black sports bras for women",
              "asin": "B0B6JGNJZ1",
              "link": "/dp/B0B6JGNJZ1/ref=emc_bcc_2_i",
              "image": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/6a3b20a4-0641-4533-9816-19bdc90911ca.__CR16,0,3264,3579_PT0_SX166_V1___.jpg"
            }
          ]
        },
        "third_party": true,
        "company_logo": "https://m.media-amazon.com/images/S/aplus-media/sc/43caec79-a48e-45e9-ae4c-232ef8db9810.__CR0,0,600,180_PT0_SX600_V1___.jpg",
        "company_description_text": "Designed for a compression fit, Maximum Support sports bras are constructed with thicker straps and wider hems. They are created for stability & comfort. Perfect for medium/ high-impact workouts such as tennis、HIIT training、yoga、running and cardio,fit snugly to the body for additional lift and support. They will hold you in without holding you back.They are our most supportive bras!"
      },
      "sub_title": {
        "text": "Visit the RUNNING GIRL Store",
        "link": "https://www.amazon.com/stores/RUNNINGGIRL/page/B7ACC67E-2539-43EF-98B5-E77ACC4F1B02?ref_=ast_bln"
      },
      "rating": 4.4,
      "ratings_total": 32496,
      "main_image": {
        "link": "https://m.media-amazon.com/images/I/71PKrPCtJ8L.jpg"
      },
      "images": [
        {
          "link": "https://m.media-amazon.com/images/I/71PKrPCtJ8L._AC_UL1500_.jpg",
          "variant": "MAIN"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81i9huGRs0L._AC_UL1500_.jpg",
          "variant": "PT01"
        },
        {
          "link": "https://m.media-amazon.com/images/I/81suG0sqR0L._AC_UL1500_.jpg",
          "variant": "PT02"
        },
        {
          "link": "https://m.media-amazon.com/images/I/71Gm5UDYwbL._AC_UL1500_.jpg",
          "variant": "PT03"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61HQ5Q-qamL._AC_UL1500_.jpg",
          "variant": "PT04"
        },
        {
          "link": "https://m.media-amazon.com/images/I/61fIBQtPXGL._AC_UL1500_.jpg",
          "variant": "PT05"
        }
      ],
      "images_count": 6,
      "videos": [
        {
          "duration_seconds": 15,
          "width": 270,
          "height": 480,
          "link": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/0536c15e-2780-4f0c-8f0d-d6671fba25fa/default.jobtemplate.mp4.480.mp4",
          "thumbnail": "https://m.media-amazon.com/images/I/71EmJmvTLML.SX522_.jpg",
          "is_hero_video": false,
          "variant": "MAIN",
          "group_id": "IB_G1",
          "group_type": "videos_for_this_product",
          "title": "Gym Sports Bra"
        }
      ],
      "videos_count": 1,
      "videos_flat": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/0536c15e-2780-4f0c-8f0d-d6671fba25fa/default.jobtemplate.mp4.480.mp4",
      "videos_additional": [
        {
          "id": "amzn1.vse.video.0d2e2e5cee294baa8ca8685db29ebb18",
          "product_asin": "B08SLNT168",
          "parent_asin": "B08SLNT168",
          "related_products": "B07XBJC76H",
          "sponsor_products": "true",
          "title": "Sports Bra Review: Great for larger chests!",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/influencer-3895274e_1586818571903_original._CR0,0,2320,2320_._FMjpg_.jpeg",
          "profile_link": "/shop/influencer-3895274e",
          "public_name": "Jenny Radish’s Finds",
          "creator_type": "Influencer",
          "vendor_code": "influencer-3895274e:shop",
          "vendor_name": "Jenny Radish’s Finds",
          "vendor_tracking_id": "onamzjennyrad-20",
          "video_image_id": "81hLjAhO2QL",
          "video_image_url": "https://m.media-amazon.com/images/I/81hLjAhO2QL._CR0,0,1280,675_SR580,306_.png",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/81hLjAhO2QL.png",
          "video_image_width": "1280",
          "video_image_height": "720",
          "video_image_extension": "png",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/a269e0ff-e9fa-47ad-97a4-482c68a1245d/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/db941e43-8714-408c-9e9a-b3ae9939bceb/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "1:11",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/afa12c42-8590-4865-831e-1bdb5fd3f427.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.047fcacb5d7d4a1f9d0527e0324747ff",
          "product_asin": "B08SLNT168",
          "parent_asin": "B08SLNT168",
          "related_products": "B07X7T9RP4",
          "sponsor_products": "true",
          "title": "sports bra review",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/influencer-1e218c86_1617468484642_original._CR0,93,1536,1536_._FMjpg_.jpeg",
          "profile_link": "/shop/influencer-1e218c86",
          "public_name": "Here Comes Katherine",
          "creator_type": "Influencer",
          "vendor_code": "influencer-1e218c86:shop",
          "vendor_name": "Here Comes Katherine",
          "vendor_tracking_id": "herecomethe0d-20",
          "video_image_id": "51QLIcOmWhL",
          "video_image_url": "https://m.media-amazon.com/images/I/51QLIcOmWhL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51QLIcOmWhL.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/7430b69f-f0fe-45e5-96d9-c3f865b70d33/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/506e20bd-0218-4b49-9d88-94da5b7dc4ba/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:30",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.06c1b76ea83649b5981855ee9dae26f8",
          "product_asin": "B08SLNT168",
          "parent_asin": "B08SLNT168",
          "related_products": "B07X8F3FVL",
          "sponsor_products": "true",
          "title": "Mint Sports Bra",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/influencer-48121ba4_1608837410858_original._CR0,256,1536,1536_._FMjpg_.jpeg",
          "profile_link": "/shop/influencer-48121ba4",
          "public_name": "Turquoise and Tulips ",
          "creator_type": "Influencer",
          "vendor_code": "influencer-48121ba4:shop",
          "vendor_name": "Turquoise and Tulips ",
          "vendor_tracking_id": "onamzhanna0f7-20",
          "video_image_id": "61GYubKPuSL",
          "video_image_url": "https://m.media-amazon.com/images/I/61GYubKPuSL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/61GYubKPuSL.jpg",
          "video_image_width": "640",
          "video_image_height": "1137",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/eddfed06-5c3d-4d29-b2c0-624caf8bf417/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/86086376-f1f2-433e-9055-1c92840b9ce5/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:17",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/aea3be18-7162-426b-aff9-30d8c97bf79a.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0e5cd172d0ae4237b4bfbed5653040b2",
          "product_asin": "B08SLNT168",
          "parent_asin": "B08SLNT168",
          "related_products": "B07XBJC76H",
          "sponsor_products": "true",
          "title": "Love this running sports bra tank top, super comfy, sized up",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/influencer-23088ea5_1637541627257_original._CR48,427,1032,1032_._FMjpg_.jpeg",
          "profile_link": "/shop/influencer-23088ea5",
          "public_name": "Adventures In Mom Life",
          "creator_type": "Influencer",
          "vendor_code": "influencer-23088ea5:shop",
          "vendor_name": "Adventures In Mom Life",
          "vendor_tracking_id": "adventure0e07-20",
          "video_image_id": "A19pvJo6UML",
          "video_image_url": "https://m.media-amazon.com/images/I/A19pvJo6UML._CR0,0,2268,1197_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/A19pvJo6UML.jpg",
          "video_image_width": "2268",
          "video_image_height": "3024",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/ba8169ee-3052-4009-b206-616eeed7fa0b/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/89f33389-a792-4bd4-a487-5aa37503ad61/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "1:09",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/06f878a4-bd61-4d0e-87f8-2a4873b0de4d.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0460578cbaab4265912cce8024df8c9b",
          "product_asin": "B08SLNT168",
          "parent_asin": "B08SLNT168",
          "related_products": "B07XBJC76H, B07X4VB3D6, B07W13JL93, B07X2NN74Z",
          "sponsor_products": "true",
          "title": "Running Girl Sports bras review!",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/charlestoncrafted_5ced10f7-72b2-4711-93a6-a8760a985c43.jpeg",
          "profile_link": "/shop/charlestoncrafted",
          "public_name": "Charleston Crafted",
          "creator_type": "Influencer",
          "vendor_code": "charlestoncrafted:shop",
          "vendor_name": "Charleston Crafted",
          "vendor_tracking_id": "charlestonc0f-20",
          "video_image_id": "711ar5+Un9L",
          "video_image_url": "https://m.media-amazon.com/images/I/711ar5+Un9L._CR0,0,1280,675_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/711ar5+Un9L.jpg",
          "video_image_width": "1280",
          "video_image_height": "720",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/7a6e6a67-5916-4511-8cc7-0476d1b4297a/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/c2f2824a-05e4-4986-96ec-8b055b2f6dcb/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:37",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/f7ef40ca-957f-4b02-83fd-2549b4462a5f.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0c3c04e394034101a6d33352ebcebf56",
          "product_asin": "B08SLNT168",
          "parent_asin": "B08SLNT168",
          "related_products": "B08H58YLP7",
          "sponsor_products": "true",
          "title": "RUNNING GIRL Sports Bra: Good Support AND Easy to Put on!",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/beautifulday_1612040709297_original._CR1149,725,1597,1597_._FMjpg_.jpeg",
          "profile_link": "/shop/beautifulday",
          "public_name": "Beautiful Day",
          "creator_type": "Influencer",
          "vendor_code": "beautifulday:shop",
          "vendor_name": "Beautiful Day",
          "vendor_tracking_id": "onamzlisachen-20",
          "video_image_id": "91jyOtPUrRL",
          "video_image_url": "https://m.media-amazon.com/images/I/91jyOtPUrRL._CR0,0,1280,675_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/91jyOtPUrRL.jpg",
          "video_image_width": "1280",
          "video_image_height": "720",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/07368ec5-b18f-4262-9c55-22593f98e728/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/632bcf35-08d1-4c29-b669-f62a04aa5b1a/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "1:12",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/68177d82-470f-429d-9a47-52258914e719.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0d503fc466b5401ead7c7f64a982a042",
          "product_asin": "B08SLNT168",
          "parent_asin": "B08SLNT168",
          "related_products": "B07XBJC76H, B07Y1MQHRM, B08F7RVX6R, B07Y1LJ5C9",
          "sponsor_products": "true",
          "title": "Super Cute and Affordable Sports Bra + High Waisted Leggings",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/influencer-26ae6984_1607199585972_original._CR0,0,671,671_._FMjpg_.jpeg",
          "profile_link": "/shop/influencer-26ae6984",
          "public_name": "Healthy Fit Fab",
          "creator_type": "Influencer",
          "vendor_code": "influencer-26ae6984:shop",
          "vendor_name": "Healthy Fit Fab",
          "vendor_tracking_id": "onamzheal0c6-20",
          "video_image_id": "912Pq8MMwBL",
          "video_image_url": "https://m.media-amazon.com/images/I/912Pq8MMwBL._CR0,0,3088,1629_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/912Pq8MMwBL.jpg",
          "video_image_width": "3088",
          "video_image_height": "2316",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/f83a6a1c-d547-405d-a83a-a0c4e62fb9b6/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/817bc4df-4de2-4097-90ee-821d106d748b/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "1:03",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/f84e4b50-98de-4e69-b4ce-030acfdc2092.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0c2403e86b03413295a27d4651ad6b02",
          "product_asin": "B08SLNT168",
          "parent_asin": "B08SLNT168",
          "related_products": "B07X8F3GXN",
          "sponsor_products": "true",
          "title": "Running Girl Sports Bra Strappy Back Criss Cross AMAZING",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/influencer-b49b45a2_1617986598771_original._CR0,590,3024,3024_._FMjpg_.jpeg",
          "profile_link": "/shop/influencer-b49b45a2",
          "public_name": "Elizabeth - With A Wink And A Smile",
          "creator_type": "Influencer",
          "vendor_code": "influencer-b49b45a2:shop",
          "vendor_name": "Elizabeth - With A Wink And A Smile",
          "vendor_tracking_id": "onamzeliza0a9-20",
          "video_image_id": "A1ZNgz1Dm7L",
          "video_image_url": "https://m.media-amazon.com/images/I/A1ZNgz1Dm7L._CR0,0,1920,1013_SR580,306_.png",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/A1ZNgz1Dm7L.png",
          "video_image_width": "1920",
          "video_image_height": "1080",
          "video_image_extension": "png",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/9a0d7761-394a-49af-8cea-0eafc696f959/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/458d0f93-144c-4e2b-88cb-bb4dbf5c1b5f/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:32",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/c4cdd32e-67a4-49be-866e-c867de804d34.vtt",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.09cdd67651a04329ac301e37b10c606b",
          "product_asin": "B08SLNT168",
          "parent_asin": "B08SLNT168",
          "related_products": "B08H58YLP7",
          "sponsor_products": "true",
          "title": "RUNNING GIRL Criss-Cross Back Strappy Sports Bra Close Up",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/stillaslife_4356d602-cb34-420a-9b84-fdc38030c872.jpeg",
          "profile_link": "/shop/stillaslife",
          "public_name": "Still As Life",
          "creator_type": "Influencer",
          "vendor_code": "stillaslife:shop",
          "vendor_name": "Still As Life",
          "vendor_tracking_id": "onamzstillasl-20",
          "video_image_id": "51X9J5KHCTL",
          "video_image_url": "https://m.media-amazon.com/images/I/51X9J5KHCTL._CR0,0,640,338_SR580,306_.jpg",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/51X9J5KHCTL.jpg",
          "video_image_width": "640",
          "video_image_height": "360",
          "video_image_extension": "jpg",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/47aa193c-e958-49bf-a392-690a9396e80e/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/c0aca201-bbb5-42ff-8797-b49a4a4fc2e9/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "1:02",
          "type": "videos_for_this_product"
        },
        {
          "id": "amzn1.vse.video.0b260c4163e04a7b9831ac57fcc71a07",
          "product_asin": "B08SLNT168",
          "parent_asin": "B08SLNT168",
          "related_products": "B07X7T9RP4, B093GH1X7M, B094R4NW7N",
          "sponsor_products": "true",
          "title": "Favorite Finds: Athletic Gear",
          "profile_image_url": "https://images-na.ssl-images-amazon.com/images/S/influencer-profile-image-prod/logo/influencer-ffddba94_1569241667443_original._CR0,0,957,957_._FMjpg_.jpeg",
          "profile_link": "/shop/influencer-ffddba94",
          "public_name": "Gabbing Ginger",
          "creator_type": "Influencer",
          "vendor_code": "influencer-ffddba94:shop",
          "vendor_name": "Gabbing Ginger",
          "vendor_tracking_id": "gabbingginger-20",
          "video_image_id": "914NAOnojJL",
          "video_image_url": "https://m.media-amazon.com/images/I/914NAOnojJL._CR286,0,1478,780_SR580,306_.png",
          "video_image_url_unchanged": "https://m.media-amazon.com/images/I/914NAOnojJL.png",
          "video_image_width": "2050",
          "video_image_height": "780",
          "video_image_extension": "png",
          "video_url": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/a69e8f55-bd08-41fa-b7d9-579c72d19653/default.jobtemplate.hls.m3u8",
          "video_previews": "https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/76d72c95-f80f-48c0-a84c-516e40d54253/videopreview.jobtemplate.mp4.342X192P_20HZ_350KBPS_VER_1_0.mp4,342X192P_20HZ_350KBPS_VER_1_0,video/mp4",
          "video_mime_type": "application/x-mpegURL",
          "duration": "0:27",
          "closed_captions": "en,https://m.media-amazon.com/images/S/vse-vms-closed-captions-artifact-us-east-1-prod/closedCaptions/ef14009c-e5e2-455f-8044-8b8784ffbf57.vtt",
          "type": "videos_for_this_product"
        }
      ],
      "is_bundle": false,
      "attributes": [
        {
          "name": "size",
          "value": "Select"
        },
        {
          "name": "color",
          "value": "A-white"
        }
      ],
      "buybox_winner": {
        "is_prime": false,
        "is_amazon_fresh": false,
        "condition": {
          "is_new": true
        },
        "fulfillment": {
          "type": "1p",
          "is_sold_by_amazon": true,
          "is_fulfilled_by_amazon": true,
          "is_fulfilled_by_third_party": false,
          "is_sold_by_third_party": false
        },
        "price": {
          "symbol": "$",
          "value": 16.99,
          "currency": "USD",
          "raw": "$16.99"
        }
      },
      "bestsellers_rank": [
        {
          "category": "Clothing, Shoes & Jewelry",
          "rank": 21,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/ref=pd_zg_ts_fashion"
        },
        {
          "category": "Women's Sports Bras",
          "rank": 1,
          "link": "https://www.amazon.com/gp/bestsellers/fashion/1044990/ref=pd_zg_hrsr_fashion"
        }
      ],
      "dimensions": "0.79 x 12.6 x 7.87 inches; 3.84 Ounces",
      "bestsellers_rank_flat": "Category: Clothing Shoes & Jewelry | Rank: 21, Category: Women's Sports Bras | Rank: 1"
    }
  };

  let result = await isModleBelowTheWaist(payload, keywordsList);
  expect(result).toBe(true);
});