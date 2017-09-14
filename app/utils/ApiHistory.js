
class ApiHistory extends Array{

  push(item){
    let hasIt = false;
    this.forEach((i)=>{
      if (i.apiName == item.apiName){
        hasIt = true
      }
    })
    if (!hasIt) {
      if (this.length == 3) {
        super.shift();
      }
      super.push(item)
    }
  }

}
var apiHistory = new ApiHistory();
// export {apiHistory}
