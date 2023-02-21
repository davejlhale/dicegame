
data = {};
const fetchData = async (fn) => {
  try {
    let response = await fetch('https://zoo-animal-api.herokuapp.com/animals/rand')
    data = await response.json();
    fn();
  } catch (err) {
    console.log(err)
  }
}


//http://numbersapi.com/42
// /https://images-api.nasa.gov

const fetchData2 = async (fn,num) => {
  try {
    let response2 =  (await fetch(`http://numbersapi.com/47?json`));
    data = await response2.json();
    console.log("data",data,response2)
     fn();
  } catch (err) {
    console.log("s",err)
  }
}
const displayFetched =()=> {
  img = document.createElement('img');
  img.src = data.image_link
  document.getElementsByTagName('body')[0].appendChild(img)
  console.log("test", img.src)
}
displayFetched2=( )=>{
  h1 = document.createElement('h1');
  h1.innerHTML = data.text
  document.getElementsByTagName('body')[0].appendChild(h1)
 
console.log(data)

}
fetchData(displayFetched);
fetchData2(displayFetched2,33);
