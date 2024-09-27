let cardOne = 7;
let cardTwo = 5;
let sum = cardOne + cardTwo;
let carBanks = [4,7,6,4,7,3,2];
let cardThree = 9;
let bankSum =0;
sum += cardThree;


if (sum > 21) {
 console.log('You lost');
} else if(sum === 21){
    console.log('black jack!');
    return 
}else{
console.log(`You have ${sum} points`);
}


for(let i =0; i<carBanks.length;i++){
    if(bankSum <=17){
        bankSum+=carBanks[i];
    }else{
        break;
    }
}


if (bankSum > 21 || (sum <= 21 && sum > bankSum)) {
 console.log('You win');
}else if(sum === bankSum){
    console.log("draw!");
} 
else {
 console.log(`Bank wins bankPoint is ${bankSum}`);
}
