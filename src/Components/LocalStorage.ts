const addLocalStorage=(addType:string,value:any)=>{
    localStorage.setItem(addType,JSON.stringify(value))
}

export default addLocalStorage;