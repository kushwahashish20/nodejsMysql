const fs =  require('fs');
fs.writeFile('./data.txt',"Node is open source ",(err)=>{
   err ? console.log("error show"): console.log("Successfully write data")
})
fs.readFile('./data.txt',(err,data)=>{
    if(err){
        console.log(err)
    }else
    console.log(data)
})
//function
const test = () =>{
   console.log("function executed")
}
test();
console.log("sat the top");