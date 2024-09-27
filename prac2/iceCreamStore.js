// { scoops: [], total: }
let transactions = []
// { scoops: [], total: }
transactions.push({ scoops: ["Chocolate", "Vanilla", "Mint Chip"], total: 5.5 })
transactions.push({ scoops: ["Raspberry", "StrawBerry"], total: 2 })
transactions.push({ scoops: ["Vanilla", "Vanilla"], total: 4 })
 
// 수익 계산
const total = transactions.reduce((acc, curr) => acc + curr.total, 0);
console.log(`You've made ${total} $ today`); // You've made 11.5 $ toda
// 각 맛의 판매량
let flavorDistribution = transactions.reduce((acc, curr) => {
 curr.scoops.forEach(scoop => {
 if (!acc[scoop]) {
 acc[scoop] = 0;
 }
 acc[scoop]++;
 })
 return acc;
}, {}) // { Chocolate: 1, Vanilla: 3, Mint Chip: 1, Raspberry: 1, StrawBerry: 1 }


let mostPopularTast = Object.keys(flavorDistribution).reduce((acc,curr)=>{
    if(flavorDistribution[curr]>flavorDistribution[acc]){
        return curr;
    }
    return acc;
}, Object.keys(flavorDistribution)[0]);

console.log(`The flavor tastle is ${mostPopularTast}`);





console.log(flavorDistribution);
