import {ApiRequest} from './ApiRequest';

export var UploadPanorama = {
  uploadPanorma(panoramaUrl, screenShot){
                  let hash = ".............."//str.replace("p=","")
                  let extraData = JSON.stringify({Icon: screenShot})
                  let body = {
                              "fileName": hash+".jpg",
                              "url": panoramaUrl,
                              "mediaType": "image/jpeg",
                              "size": 1,
                              "hashCode": hash,
                              "isPublic": true,
                              "extraData": extraData
                             }
                  ApiRequest( "uploadPanorma", {storageKey: hash}, body )
              }

}
