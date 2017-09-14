export function Log(content, tag){
  let isDebug = true;
  if(isDebug) {
    if(tag){
      console.log(content, tag);
    } else {
      console.log(content);
    }
  }
}
