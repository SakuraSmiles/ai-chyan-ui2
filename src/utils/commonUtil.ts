const  getAssetsFile = (url:string) => {
    return new URL(`${url}`, import.meta.url).href
 }
const getImg = (path: string) => {
  return new URL(`../assets/${path}`, import.meta.url).href
}
 export {
    getAssetsFile,
    getImg
 }