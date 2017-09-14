import {Base64} from './base64'
import {ApiMap,panoramaUrl} from '../constants/Network';
import {ApiRequest, showErrorAlert} from './ApiRequest';
import * as common from './CommonUtils';
import UrlEncode from './UrlEncode';

var apiRequest = new ApiRequest();
var deviceWidth = common.getWidth();
var deviceHeight = common.getHeight();

var SchemeHandler = {

  //新建临时方案
  newScheme(name = new Date().toLocaleDateString(), inputScheme, newTempSchemeCallback){
    let tempScheme = JSON.parse(JSON.stringify(inputScheme))
    delete tempScheme.id;
    delete tempScheme.designSchemeId;
    if(tempScheme.areas != null){
       delete (tempScheme.areas[0].id)
       delete (tempScheme.areas[0].areaId)
       let products = tempScheme.areas[0].products;
       products.map((item)=>{
         delete (item.id)
       })
    }
    tempScheme.name = name;
    (name == 'tempScheme') ? (tempScheme.listable = false) : tempScheme.listable = true;
    apiRequest.request(ApiMap.newTempScheme, null, tempScheme, newTempSchemeCallback);
  },

  // DNAApplication({DNAScheme, scheme}){
  //   let DNAItems = this.productInit(DNAScheme);
  //   let items = this.productInit(scheme)
  //   items && items.schemeProduct && items.schemeProduct.map((item, itemIndex, items)=>{
  //       DNAItems && DNAItems.schemeProduct && DNAItems.schemeProduct.map((DNAItem, DNAItemIndex, DNAItems)=>{
  //         if( item.categoryId == DNAItem.categoryId ){
  //           this.modifyProduct({ scheme, item: items[itemIndex], DNAItem: DNAItem})
  //         }
  //       })
  //   })
  // },

	scheme: null,

  productInit(scheme){
    //获取案例物品列表 和 DNA
    this.wallMaterials  = this.getPresetMaterial([...scheme.walls, ...scheme.presetProducts]);
    let area = scheme.areas[0] ? scheme.areas[0] : {};
    try {
			this.schemeProduct  = area ? this.getSchemeProduct(area.products) : [];
			// this.schemeProducts = [...this.schemeProduct, ...this.wallMaterials];
			return {
				wallMaterials: this.wallMaterials,
				schemeProduct: this.schemeProduct
			}
    } catch (e) {
      console.log(e);
    }
  },

  // modifyProductOfCategory: function(scanedProduct){
  //   var products = this.modifyPage.scheme.areas[0].products
  //   for (var i in products) {
  //       if ( products[i].product.categoryId == scanedProduct.categoryId) {
  //           this.modifyPage.scheme.areas[0].products[i].product = scanedProduct;
  //       }
  //   }
  // },
  //
  // modifyMaterialOfCategory: function(scanedProduct){
  //     for (var i in this.modifyPage.scheme.walls) {
  //     let wallMaterials = this.modifyPage.scheme.walls[i].materials;
  //     for (var j in wallMaterials) {
  //         if (wallMaterials[j].material.categoryId == scanedProduct.categoryId) {
  //           this.modifyPage.scheme.walls.presetMaterials[j].material  = scanedProduct;
  //         }
  //       }
  //     }
  //     for (var i in this.modifyPage.scheme.presetProducts) {
  //       let materials = this.modifyPage.scheme.presetProducts[i].presetMaterials;
  //       for (var j in materials) {
  //           if (materials[j].material.categoryId == scanedProduct.categoryId) {
  //             this.modifyPage.scheme.presetProducts[i].presetMaterials[j].material = scanedProduct;
  //           }
  //       }
  //     }
  // },
  filterProduct(categoryId) {
    //过滤 门 ，门框 护墙板，
    let arr = [277, 481, 340]
    return arr.indexOf(categoryId) === -1
    //product.categoryId != 277 && product.categoryId != 481 && product.categoryId != 340
  },

  getSchemeProduct: function(products){
    var productArr = [];
    var productId  = [];
    for (var i in products) {
      let product = products[i].product;
      let id = product.id;
      if ( productId.indexOf(id)<0 ) {
          if (this.filterProduct(product.categoryId)) {
              if (product.categoryId === 300) {
                /*
                指定类别为300的地毯  需要作为材质进行替换；
                创建一个虚拟的材质对象 对应的材质类别 ID 为 440；
                需要在替换材质方法中也进行特殊处理
                */
                let tempMaterial = {
                      id: product.id,
                      name: product.name,
                      description: product.description,
                      images: product.images,
                      categoryId: 440,
                      materialId: product.productId
                    } ;
                let extraComponents = products[i].components;
                /*从额外的组件材质中取最新的图片*/
                if ((extraComponents.length !== 0) && extraComponents[0].material) {
                    tempMaterial.images = extraComponents[0].material.images;
                }
                this.wallMaterials && this.wallMaterials.push(tempMaterial);
             }else{
                productId.push(id);
                productArr.push(product);
             }
        }
      }
    }
    return productArr
  },

  getPresetMaterial: function(walls){
    var materialArr  = [];
    var materialsId = [];
    for (var i in walls) {
      let materials = walls[i].presetMaterials ? walls[i].presetMaterials : walls[i].materials;
      for (var j in materials) {
          var materialId = materials[j].material.id;
          var material   = materials[j].material;
          if ( materialsId.indexOf(materialId)<0 ) {
            materialsId.push(materialId);
            materialArr.push(material);
          }
      }
    }
    return materialArr;
 },

 modifyProduct: function({scheme, item, DNAItem}){
  //  let id = originalItem.responseData.id; //待替换物品id
  //  let scheme = tempScheme.responseData;  //待处理方案
   let products = scheme.areas[0].products; //待处理方案的所有物品
   for (let i in products) {
       if ( products[i].product.id == item.id) {
           products[i].product = DNAItem;
       }
   }
   return scheme;
  //  dispatch({type: types.TEMP_SCHEME, data: scheme})
 },

 modifyMaterial: function({scheme, item, DNAItem}){
   let walls = scheme.walls ;
   let presetProducts = scheme.presetProducts ;

   /*
    特殊处理的地毯材质ID为440
   */
   if ((DNAItem.categoryId === 440) || (DNAItem.type_id === 440) ){
       let products = scheme.areas[0].products; //待处理方案的所有物品
       for (let i in products) {
           if ( products[i].product.id == item.id ) {
               let productComponents = products[i].product.components;
               productComponents && productComponents.map((component)=>{ //遍历物品组件 添加到配置组件材质中
                   let hasConfiguredComponent = false;
                   products[i].components.map((comp, index)=>{  //遍历物品的配置组件 替换其中的材质 若没找到则添加进去
                       if (comp.fromId ===  component.id) {
                           hasConfiguredComponent = true;
                           products[i].components[index] = {
                               fromId: component.id,
                               material: DNAItem
                           };
                       }
                   })
                   if (!hasConfiguredComponent) { //若在配置组件中没找到 可一直添加到配置组件
                       products[i].components.push ({
                           fromId: component.id,
                           material: DNAItem
                       })
                   }

               })
           }
       }
   }

   for (let i in walls ) {
       let wallMaterials = walls[i].materials;
       for (let j in wallMaterials) {
           if (wallMaterials[j].material.id == item.id) {
             walls[i].materials[j].material = DNAItem;
           }
       }
   }
   for (let i in presetProducts) {
     let materials = presetProducts[i].presetMaterials;
     for (let j in materials) {
         if (materials[j].material.id == item.id) {
            presetProducts[i].presetMaterials[j].material = DNAItem;
         }
     }
   }
   return scheme;
 },

 modifyProductByCategory(scheme, scanedProduct){
   var tempScheme = JSON.parse(JSON.stringify(scheme))
   var products = tempScheme.areas[0].products ;
   for (var i in products) {
       if ( products[i].product.categoryId == scanedProduct.categoryId) {
           tempScheme.areas[0].products[i].product = scanedProduct;
       }
   }
   return tempScheme;
 },

 modifyMaterialByCategory(scheme, scanedProduct){
   var tempScheme = JSON.parse(JSON.stringify(scheme))
     for (var i in tempScheme.walls) {
     let wallMaterials = tempScheme.walls[i].materials;
     for (var j in wallMaterials) {
         if (wallMaterials[j].material.categoryId == scanedProduct.categoryId) {
          tempScheme.walls.presetMaterials[j].material  = scanedProduct;
         }
       }
     }
     for (var i in tempScheme.presetProducts) {
       let materials = tempScheme.presetProducts[i].presetMaterials;
       for (var j in materials) {
           if (materials[j].material.categoryId == scanedProduct.categoryId) {
             tempScheme.presetProducts[i].presetMaterials[j].material = scanedProduct;
           }
       }
     }
     return tempScheme;
 },

 getPanoramaUrl(scheme){
   let images = scheme ? scheme.images : ( this.scheme ? this.scheme.images: '');
   //去除images字段url字符串
   //  if (images.indexOf("{")) {
   //     return images
   //   }
   if(images){
      let jsonObj= common.getSafetyJsonObj(images);
      let url ;
      if (jsonObj.p360s && jsonObj.p360s.length != 0) {
        url = panoramaUrl;   // -> panoramaUrl 从network导入的全局变量
        let base64String = (new Base64()).encode(images)
        url = url + 'res=' + base64String + '&resType=sd&bar=show&logo=false'
      } else if (jsonObj.autosave && jsonObj.autosave.p360) {
        url =  (jsonObj.autosave.p360 + '&bar=show&logo=false').replace('show','show_inner')
      }
      return url;
    }
 },

getScreenshots(scheme, size){
  if(scheme && scheme.images && scheme.images.indexOf("{") >= 0){
    let jsonObj = JSON.parse(scheme.images)
    let tmpArray = [];
    if(jsonObj.screenshots && jsonObj.screenshots.length > 0){
      for(let index in jsonObj.screenshots){
        tmpArray.push(this.jointImageSize(jsonObj.screenshots[index], size))
      }
    } else {
        tmpArray.push(this.getScreenshot(scheme, size))
    }
    return tmpArray;
  }
},

 getScreenshot(scheme, size){
  //  let condition = '?imageView2/0/w/' + parseInt(size.width * 2).toString();
   let images = scheme && scheme.images;
   if (images ) {
     if (images.indexOf("{")) {
        return this.jointImageSize(images,size)
      }
      let jsonObj = JSON.parse(images)
      !jsonObj.screenshots && console.log('error....',jsonObj )
      if (jsonObj.screenshots && jsonObj.screenshots.length && jsonObj.autosave.screenshot) {
        return this.jointImageSize(jsonObj.screenshots[0], size)
      } else if (jsonObj.autosave && jsonObj.autosave.screenshot) {
        return this.jointImageSize( jsonObj.autosave.screenshot, size)
      }
   }
 },

 jointImageSize( imageUrl, size){
   if (size && size.width) {
     return imageUrl + '?imageView2/0/w/' + parseInt( size.width * 2).toString()
   } else if (size && size.height) {
     return imageUrl + '?imageView2/0/h/' + parseInt( size.height * 2).toString()
   } else {
     return imageUrl
   }
 },

 hasMutableCaptures(scheme){
   let extraData = scheme.extraData;
   let extraDataJson = JSON.parse(extraData)
   if ( extraDataJson.CapturePoints && extraDataJson.CapturePoints.length != 0 ) {
      return 1 ;
    }
    return 0 ;
 },

 getCommunitySchemePublishBody(schemeData, schemeResponseData){
   let productArr = [];
   let products = this.getSchemeProduct(schemeResponseData.data.areas[0].products);
   for (let product of products) {
       let newProduct = new Object();
       newProduct.owner_id = schemeResponseData.data.ownerId;
       newProduct.product_origin_id = product.id;
       newProduct.product_url = product.images
       newProduct.product_name = product.name;
       productArr.push(newProduct)
   }
   let apiRequest = new ApiRequest();
   let body = {
     "name": schemeData.name,
     "upload_type": "import",
     "origin_id": schemeData.id,
     "design_date": schemeData.createdUtc,
     "cost": 0,
     "actual_area": 0,
     "thumbnail": this.getScreenshot(schemeData),
     "introduction": "暂无介绍",
     //"pano_url": SchemeHandler.getPanoramaUrl(schemeData),
     "pano_url": this.getPanoramaUrlList(schemeData),
     "pano_thumbnail": this.getScreenshots(schemeData).toString(),
     "images": this.getScreenshots(schemeData).toString(),
     "images_thumbnail": "",
     "description": "暂无描述",
     "ItemList": productArr,
   }
   return body;
 },

 getPanoramaUrlList(scheme){
   let images = scheme ? scheme.images : this.scheme.images;
   if (images.indexOf("{")) {
      return images
    }
    let jsonObj= JSON.parse(images)
    let imageList = [];
    if (jsonObj.p360s && jsonObj.p360s.length != 0) {
       jsonObj.p360s.map((item, index, items)=>{
         imageList.push(item.p360)
       })
    } else if (jsonObj.autosave && jsonObj.autosave.p360) {
      let img = (jsonObj.autosave.p360 + '&bar=show&logo=false').replace('show','show_inner');
      imageList.push(img);
    }
    return imageList.toString();
 },

  getPanosUrl(panos) {
    let panoList = [];
    if (panos.length) {
      for (let i = 0; i < panos.length; i++) {
        panoList[i] = panos[i].pano_url;
      }
    }
	  return panoList.join();
  },

 getImageListPanoramaUrl(imageList){
  return panoramaUrl + 'res=' + UrlEncode(imageList) + '&resType=imageList&bar=show&logo=false'
 }
}
export default SchemeHandler
