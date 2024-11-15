function loadTexture(path) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        resolve(img);
      };
    })
}

window.onload = async() => {
    const canvas = document.getElementById("myCanvas"); //canvas 불러옴 
    const ctx = canvas.getContext("2d"); // 2d형식
    const heroImg = await loadTexture('assets/player.png')// 아군 이미지 변수 저장
    const enemyImg = await loadTexture('assets/enemyShip.png') //적군 이미지 변수 저장
    const Background = await loadTexture("assets/starBackground.png") //배경 이미지
    const pattern = ctx.createPattern(Background,'repeat'); //배경적용한 패턴
    ctx.fillStyle = pattern; // 배경 패턴 적용
    ctx.fillRect(0,0, canvas.width, canvas.height); // 배경 이미지 크기 

    //createHeros(ctx,canvas,heroImg);
    ctx.drawImage(heroImg, canvas.width/2 - 45, canvas.height - (canvas.height/4)); //좌표 
    ctx.drawImage(heroImg,canvas.width/2-120,canvas.height-(canvas.height/4)+10,60,50);//보조 우주선 1
    ctx.drawImage(heroImg,canvas.width/2+70,canvas.height-(canvas.height/4)+10,60,50);//보조 우주선 2

    createEnemies2(ctx, canvas, enemyImg);
};



/*function createEnemies(ctx, canvas, enemyImg) { //적군 생성 
    const MONSTER_TOTAL = 5;
    const MONSTER_WIDTH = MONSTER_TOTAL * enemyImg.width;
    const START_X = (canvas.width - MONSTER_WIDTH) / 2; //적군 위치 
    const STOP_X = START_X + MONSTER_WIDTH;
    for (let x = START_X; x < STOP_X; x += enemyImg.width) { //배치 돌리기 
      for (let y = 0; y < enemyImg.height * 5; y += enemyImg.height) {
        ctx.drawImage(enemyImg, x, y);
      }
    }
}*/

function createEnemies2(ctx, canvas, enemyImg) {
   const rows =5;//적군의 총 줄 수
   const centerX = canvas.width/2;//중앙값

   for(let i=0; i<rows;i++){
    const numEnemies = rows -i; //배치할 적군이고 줄마다 줄어짐
    const startX = centerX - (numEnemies * enemyImg.width)/2; //적군이 화면 중앙에서 시작함

    for(let j =0; j< numEnemies; j++){ //각 적군을 순차적으로 배치
        const x = startX +j*enemyImg.width;
        const y = i*enemyImg.height;
        ctx.drawImage(enemyImg,x,y);
    }
   }
}