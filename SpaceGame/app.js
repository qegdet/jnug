class EventEmitter {
  constructor() {
  this.listeners = {};
  }
  on(message, listener) { //등록하기 메시지들을 등록한다
  if (!this.listeners[message]) {
  this.listeners[message] = [];
  }
  this.listeners[message].push(listener);
  }
  emit(message, payload = null) {//알려주기 소식을 다른 메소드에게 알려준다
  if (this.listeners[message]) {
  this.listeners[message].forEach((l) => l(message, payload));
  }
  }
  clear() {//명단 정리하기 이제 끝나면은 명단들을 전부 없엔다
    this.listeners = {};
   }
  
  }
class GameObject {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.dead = false;     // 객체가 파괴되었는지 여부
      this.type = "";        // 객체 타입 (영웅/적)
      this.width = 0;        // 객체의 폭
      this.height = 0;       // 객체의 높이
      this.img = undefined;  // 객체의 이미지
    }

    rectFromGameObject() {//충돌 영역 계산
      return {
        top: this.y,  //객체의 위쪽 위치
        left: this.x, //객체의 왼쪽 위치
        bottom: this.y + this.height, //객체의 아래쪽 위치
        right: this.x + this.width, //객체의 오른쪽 위치
      };
    }

    draw(ctx) { //그리기 함수
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height); // 캔버스에 이미지 그리기
    }
 }

 class Hero extends GameObject {
  constructor(x, y) {
    super(x, y); //위치 
    this.width = 99;//비행기 넓이
    this.height = 75;//비행기 높이
    this.type = 'Hero'; //객체의 타입: Hero
    this.cooldown = 0; // 초기화
    this.supportShips =[]; //보조 비행기를 담을 배열을 초기화
    this.supportFireTimers = []; // 보조 비행기 타이머 저장
    this.initSupportShips(); //보조 비행기 두 대를 생성하고 설정하는 함수
    this.startSupportFire(); //보조 비행기가 일정 시간마다 레이저를 자동으로 발사하는 함수
    this.life = 3; // 비행기 생명
    this.points = 0;//적을 물리칠 떄 점수 올라감

  }
  decrementLife() {
    if (this.life > 0) {
      this.life--; // 체력 감소
      console.log(`Hero Life Decreased: ${this.life}`);
    }

    if (this.life <= 0) {
      this.dead = true; // 체력이 0이 되면 사망
      eventEmitter.emit(Messages.GAME_END_LOSS); //메시지 처리
    }
  }
  
   incrementPoints() { //점수 올리기
    this.points += 100;
  }
  
  initSupportShips() { //비행기 두대를 생성하고 설정하는 함수
    this.supportShips.push(
      new GameObject(this.x - 70, this.y + 10), // 왼쪽 보조 비행기
      new GameObject(this.x + 110, this.y + 10)  // 오른쪽 보조 비행기
    );
    this.supportShips.forEach((ship) => { //보조 비행기 배열을 순회하며 설정을 적용.
      ship.width = 60;
      ship.height = 50;
      ship.img = heroImg; // 주 비행기의 이미지 사용
      ship.type = 'SupportShip'; // 타입 지정
    });

    
  }

  // 보조 비행기 위치 동기화
  updateSupportShips() {
    this.supportShips[0].x = this.x - 70; //1번쨰 비행기.x
    this.supportShips[0].y = this.y + 10; //1번쨰 비행기.y
    this.supportShips[1].x = this.x + 110; //2번째 비행기.x
    this.supportShips[1].y = this.y + 10; //2번째 비행기.y
  }

  // 주 비행기와 보조 비행기 함께 그리기
  draw(ctx) {
    super.draw(ctx); // 주 비행기 그리기
    this.supportShips.forEach((ship) => { //모든 비행기들을 순회하면서 그린다
      ctx.drawImage(ship.img, ship.x, ship.y, ship.width, ship.height);
    });
  }

  fire() {
    if (this.canFire()) {
      // 주 비행기 레이저
      gameObjects.push(new Laser(this.x + 45, this.y - 10)); //레이저를 발사해서 gameObject에 추가

      this.cooldown = 500; // 쿨다운 설정
      let id = setInterval(() => { //0.1초마다 쿨다운 시간을 줄임
        if (this.cooldown > 0) {
          this.cooldown -= 100;
        } else {
          clearInterval(id); // 쿨다운 종료
        }
      }, 100);
    }
  }
  canFire() {
    return this.cooldown === 0; // 쿨다운 상태 확인
  }
  startSupportFire() {
    this.supportShips.forEach((ship) => {
      const timerId = setInterval(() => {
        if (!ship.dead) {
          gameObjects.push(new Laser(ship.x + 25, ship.y - 10));
        }
      }, 500);
      this.supportFireTimers.push(timerId); // 타이머 저장
    });
  }
  stopSupportFire() {
    // 모든 보조 비행기 타이머 제거
    this.supportFireTimers.forEach((timerId) => clearInterval(timerId));
    this.supportFireTimers = []; // 배열 초기화
  }
}

  class Enemy extends GameObject {
    constructor(x, y) {
      super(x, y);
      this.width = 98;
      this.height = 50;
      this.type = "Enemy";
      // 적 캐릭터의 자동 이동 (Y축 방향)
      let id = setInterval(() => { //시간마다 이동하게 즉 setInterval 시간마다 이동시키게 한다
        if (this.y < canvas.height - this.height) {
          this.y += 5;  // 아래로 이동
        } else {
          console.log('Stopped at', this.y);
          clearInterval(id); // 화면 끝에 도달하면 정지
        }
      }, 300);
    }
   }
  class Laser extends GameObject {
    constructor(x, y) {
      super(x,y); //레이저 위치
      (this.width = 9), (this.height = 33);
      this.type = 'Laser';
      this.img = laserImg;
      let id = setInterval(() => { //레이저 나가는 시간
        if (this.y > 0) {
          this.y -= 15;
        } else {
          this.dead = true;
          clearInterval(id);
        }
      }, 100)
    }
    onDestroy() {
      // 레이저가 제거될 때 타이머 중단
      if (this.timerId) {
        clearInterval(this.timerId);
      }
    }
   }

   class Explosion extends GameObject {
    constructor(x, y) {
      super(x, y);
      this.width = 100; 
      this.height = 100;
      this.type = "Explosion";
      this.img = explosingImg; 
      this.duration = 500; // 폭발 지속 시간 (밀리초)
  
      // 폭발 지속 시간 이후 제거
      setTimeout(() => {
        this.dead = true;
      }, this.duration);
    }
  }
  class Boss extends GameObject {
    constructor(x, y) {
      super(x, y);
      this.width = 300; // 보스 크기
      this.height = 150;
      this.type = "Boss";
      this.health = 50; // 보스 체력
      this.attackCooldown = 5000; // 공격 쿨다운
      this.invincible = false; 
      this.attackIntervalId = null; // 공격 루프 ID 저장
      this.movementIntervalId = null; // 이동 타이머 ID
      this.speedX = 5; // 좌우 이동 속도
      this.direction = 1; // 이동 방향 (1: 오른쪽, -1: 왼쪽)
      this.startAttacking();
      this.startMoving(); // 보스 이동 시작
    }
    startMoving() {
      this.movementIntervalId = setInterval(() => {
        this.x += this.speedX * this.direction; // 방향에 따라 이동
        if (this.x <= 0 || this.x + this.width >= canvas.width) {
          this.direction *= -1; // 벽에 닿으면 방향 전환
        }
      }, 50); // 50ms마다 위치 업데이트
    }
    stopMoving() {
      if (this.movementIntervalId) {
        clearInterval(this.movementIntervalId); // 이동 멈춤
      }
    }
  
    startAttacking() {
      this.attackIntervalId = setInterval(() => {
        if (!this.dead) {
          this.fireSpread(); // 산탄 공격
        }
      }, this.attackCooldown);
    }
    fireSpread() {
      const centerX = this.x + this.width / 2; // 보스 중앙
      const centerY = this.y + this.height; // 보스 하단
  
      const numberOfShots = 5; // 산탄 레이저 개수
      const angleSpread = Math.PI / 10; // 레이저 확산 각도 (45도)
      const startAngle = -Math.PI / 2 - angleSpread / 2; // 레이저 시작 각도
  
      for (let i = 0; i < numberOfShots; i++) {
        const angle = startAngle + (angleSpread / (numberOfShots - 1)) * i; // 각 레이저의 각도
        const laser = new BossLaser(centerX, centerY, angle); // 레이저 생성
        gameObjects.push(laser); // 게임 객체에 추가
      }
    }
  
    decrementHealth() {
      if (this.invincible || this.dead) return; // 무적 상태거나 이미 죽었으면 무시
      this.health--;
      this.invincible = true; // 무적 상태 활성화
      setTimeout(() => (this.invincible = false), 500); // 0.5초 후 무적 해제
  
      console.log(`Boss Hit! Remaining Health: ${this.health}`);
      if (this.health <= 0) {
        this.dead = true;
        this.stopMoving(); // 보스 죽으면 이동 멈춤
        clearInterval(this.attackIntervalId);
        eventEmitter.emit(Messages.GAME_END_WIN); // 게임 승리 이벤트 발생
      }
    }
  
  
    // 보스 그리기
    draw(ctx) {
      super.draw(ctx);

      // 기존 텍스트 영역 초기화
      ctx.clearRect(this.x, this.y - 30, this.width, 30);
  
      // 보스 체력 표시
      ctx.font = "20px Arial";
      ctx.fillStyle = "red";
      ctx.textAlign = "center";
      ctx.fillText(`Boss Health: ${this.health}`, this.x + this.width / 2, this.y - 10);
    }
  }
  class BossLaser extends GameObject {
    constructor(x, y, angle) {
      super(x, y);
      this.width = 50; // 보스 레이저 크기 조정
      this.height = 100;
      this.type = "BossLaser";
      this.img = bossLaserImg;
  
      // 각도 기반 속도 계산
      const speed = 5; // 레이저 속도
      this.dx = speed * Math.cos(angle); // X축 속도
      this.dy = speed * Math.sin(angle); // Y축 속도
  
      // 레이저 이동 업데이트
      this.timerId = setInterval(() => {
        this.x -= this.dx; // X축 이동
        this.y -= this.dy; // Y축 이동
  
        // 화면 밖으로 나가면 제거
        if (this.y > canvas.height || this.x < 0 || this.x > canvas.width) {
          this.dead = true;
          clearInterval(this.timerId);
        }
      }, 50); // 50ms마다 업데이트
    }
  
    onDestroy() {
      // 타이머 제거
      if (this.timerId) {
        clearInterval(this.timerId);
      }
    }
  }
  
  





   let onKeyDown = function (e) {
    console.log(e.keyCode); // 눌린 키의 keyCode를 출력
    switch (e.keyCode) {
      case 37: // 왼쪽 화살표
      case 38: // 위쪽 화살표
      case 39: // 오른쪽 화살표
      case 40: // 아래쪽 화살표
      case 32: // 스페이스바
        e.preventDefault(); // 기본 동작 차단
        break;
      default:
        break; // 다른 키는 기본 동작 유지
    }
   };

  

   const Messages = { //메시지 저장
    KEY_EVENT_UP: "KEY_EVENT_UP",
    KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
    KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
    KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
    COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
    COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
    KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
    GAME_END_LOSS: "GAME_END_LOSS",
    GAME_END_WIN: "GAME_END_WIN",
   };
   let heroImg, //여러 변수들 저장
    enemyImg, 
    laserImg,
    canvas, ctx, 
    gameObjects = [],bossLaserImg, 
    hero,gameLoopId,currentStage=1, 
    eventEmitter = new EventEmitter();
    function drawLife() { //비행기 목숨
      const START_POS = canvas.width - 180; //비행기 이미지 그릴 위치
      for(let i=0; i < hero.life; i++ ) { //선행하면서 목숨을 그린다.
        ctx.drawImage(
          lifeImg, 
          START_POS + (45 * (i+1) ), 
          canvas.height - 37);
      }
     }
     function drawPoints() { //영웅의 포인트를 시각화
    
      ctx.font = "30px Arial";
      ctx.fillStyle = "red";
      ctx.textAlign = "left";
      
      drawText("Points: " + hero.points, 10, canvas.height-20);
     }
     function drawText(message, x, y) {//message 화면에 표시할 문자. x,y 메시지를 그릴 좌표
      ctx.fillText(message, x, y);
      
     }

     function displayMessage(message, color = "red") { //화면 중앙에 메시지를 표시하는 함수
      ctx.font = "30px Arial";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.fillText(message, canvas.width / 2, canvas.height / 2);//실제로 메시지를 캔버스의 중앙에 넣음
      }
     
function loadTexture(path) { //이미지 파일을 비동기적으로 불러오는 함수
    return new Promise((resolve) => {//Promise는 이미지가 로드될 때까지 기다린 후 , 완료되면 이미지 반환
      const img = new Image(); //새로운 이미지 생성
      img.src = path; //이미지 패스
      img.onload = () => { //이미지가 로드 완료되면 resolve를 호출해서 불러온다 그후 promise로 반환
        resolve(img);
      };
    })
}
function createHero() { //히어로 비행기 생성 함수
  hero = new Hero(
    canvas.width / 2 - 45,
    canvas.height - canvas.height / 4
  );
  hero.img = heroImg;
  gameObjects.push(hero);
 }
 function drawGameObjects(ctx) { //모든 ctx 객체들 생성 함수
  gameObjects.forEach(go => go.draw(ctx));
 }
 function isHeroDead() { //영웅 비행기가 죽었는지 확인하는 함수
  return hero.life <= 0;
 }
 function isEnemiesDead() { //적군이 죽었는지 확인하는 ㅎ마수
  const enemies = gameObjects.filter((go) => go.type === "Enemy" && 
!go.dead); //게임 속 객체중 type이 enemy이고 !go.dead(죽지 않은)적만 골라냄
  return enemies.length === 0; //남아있는 적의 수가 0이면 true를 반환함
 }


 function createEnemies() {
  const MONSTER_TOTAL = 5; //한줄에 5개 비행기 배치
  const MONSTER_WIDTH = MONSTER_TOTAL * 98; //한 줄에 적 5개를 배치했을 때 전체 가로 너비.
  const START_X = (canvas.width - MONSTER_WIDTH) / 2; //적 비행기를 화면 중앙에 배치하기 위해 , 적 무리의 시작 위치를 계산 
  const STOP_X = START_X + MONSTER_WIDTH; //화면 너비에서 적 전체 너비를 빼고 양쪽 여백을 같게 하기 위해 나눔.
  for (let x = START_X; x < STOP_X; x += 98) {//가로방향으로 적 비행기 배치
    for (let y = 0; y < 50 * 5; y += 50) { //세로 방향으로 적군 배치
      const enemy = new Enemy(x, y);
      enemy.img = enemyImg;
      gameObjects.push(enemy);
    }
  }
 }
 function createEnemies2(enemyImg) {
  const rows = 5; // 적군의 총 줄 수
  const centerX = canvas.width / 2; // 화면 중앙값

  for (let i = 0; i < rows; i++) {
    const numEnemies = rows - i; // 줄마다 적의 수가 줄어듦
    const startX = centerX - (numEnemies * enemyImg.width) / 2; // 중앙에서 시작

    for (let j = 0; j < numEnemies; j++) { 
      const x = startX + j * enemyImg.width; // 적의 x 좌표
      const y = i * enemyImg.height; // 적의 y 좌표
      const enemy = new Enemy(x, y); // 새로운 적 생성
      enemy.img = enemyImg; // 이미지 설정
      gameObjects.push(enemy); // 적을 게임 객체 리스트에 추가
    }
  }
}


 function endGame(win) {
  clearInterval(gameLoopId);

  // 게임 화면이 겹칠 수 있으니, 200ms 지연
  setTimeout(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (win) {
      displayMessage(
        "Victory!!! Pew Pew... - Press [Enter] to start a new game Captain Pew Pew",
        "green"
      );
    } else {
      displayMessage(
        "You died !!! Press [Enter] to start a new game Captain Pew Pew"
      );
    }
  }, 200)  
 }
 function resetGame() {
  if (gameLoopId) {
    clearInterval(gameLoopId);
    eventEmitter.clear();
  }

  // 타이머 및 객체 초기화
  if (hero) hero.stopSupportFire(); // 보조 비행기 타이머 정리
  gameObjects.forEach((obj) => {
    if (obj.attackIntervalId) {
      clearInterval(obj.attackIntervalId);
    }
  });

  gameObjects = [];
  currentStage = 1;
  initGame();
  gameLoopId = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    updateGameObjects(); // 객체 상태 업데이트
    drawGameObjects(ctx); // 객체 그리기
    drawPoints();
    drawLife();
  }, 100);
}
 
function initGame() {
  gameObjects = [];
  createHero();

  if (currentStage === 1) {
    createEnemies();
  } else if (currentStage === 2) {
    createEnemies2(enemyImg);
  } else if (currentStage === 3) {
    createBoss();
  }

  // 키 입력 리스너 재등록
  window.addEventListener("keydown", onKeyDown);
  registerEventListeners();

  eventEmitter.on(Messages.KEY_EVENT_ENTER, resetGame);
  eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
    first.dead = true;

    if (second.type === "Boss") {
      second.decrementHealth();
      if (second.health <= 0&& second.dead) {
        eventEmitter.emit(Messages.GAME_END_WIN);
      }
    } else if (second.type === "Enemy") {
      second.dead = true;
      hero.incrementPoints();
      
    }

    if (isEnemiesDead()) {
      if (currentStage < 3) {
        nextStage();
      } else {
        eventEmitter.emit(Messages.GAME_END_WIN);
      }
    }
  });

  eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
    enemy.dead = true;
    hero.decrementLife();

    const explosion = new Explosion(enemy.x, enemy.y);
    gameObjects.push(explosion);

    if (isHeroDead()) {
      eventEmitter.emit(Messages.GAME_END_LOSS);
    }
  });

  eventEmitter.on(Messages.GAME_END_WIN, () => {
    endGame(true);
  });

  eventEmitter.on(Messages.GAME_END_LOSS, () => {
    endGame(false);
  });
}
  
 

 

  // 키 이벤트 처리
  eventEmitter.on(Messages.KEY_EVENT_UP, () => {
    hero.y -= 5;
    hero.updateSupportShips(); // 보조 비행기 위치 갱신
  });
  eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
    hero.y += 5;
    hero.updateSupportShips();
  });
  eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
    hero.x -= 5;
    hero.updateSupportShips();
  });
  eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
    hero.x += 5;
    hero.updateSupportShips();
  });
  eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
    if (hero.canFire()) {
      hero.fire();
    }
  });
  eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
    first.dead = true;
    second.dead = true;
    const explosion = new Explosion(second.x, second.y);
    gameObjects.push(explosion);
  });


 function intersectRect(r1, r2) {
  return !(
    r2.left > r1.right ||  // r2가 r1의 오른쪽에 있음
    r2.right < r1.left ||  // r2가 r1의 왼쪽에 있음
    r2.top > r1.bottom ||  // r2가 r1의 아래에 있음
    r2.bottom < r1.top     // r2가 r1의 위에 있음
  );
 }
 function updateGameObjects() {
  const enemies = gameObjects.filter((go) => go.type === "Enemy");
  const lasers = gameObjects.filter((go) => go.type === "Laser");
  const bossLasers = gameObjects.filter((go) => go.type === "BossLaser");
  const boss = gameObjects.find((go) => go.type === "Boss");

  enemies.forEach(enemy => {
    const heroRect = hero.rectFromGameObject();
    if (intersectRect(heroRect, enemy.rectFromGameObject())) {
      eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
    }
  })
  if (boss && !boss.dead) {
    lasers.forEach((laser) => {
      if (intersectRect(laser.rectFromGameObject(), boss.rectFromGameObject())) {
        laser.dead = true; // 충돌한 레이저 제거
        boss.decrementHealth(); // 보스 체력 감소
        return; // 한 번 처리한 레이저는 중복 처리 방지
      }
    });
  }
  bossLasers.forEach((laser) => {
    if (intersectRect(laser.rectFromGameObject(), hero.rectFromGameObject())) {
      laser.dead = true; // 레이저 제거
      hero.decrementLife(); // 영웅 체력 감소
      console.log("Hero Hit by Boss Laser! Life Remaining:", hero.life);
    }
  });
  lasers.forEach((l) => {
    enemies.forEach((m) => {
      if (intersectRect(l.rectFromGameObject(), m.rectFromGameObject())) {
        eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
          first: l,
          second: m,
        });
      }
    });
  });
  gameObjects = gameObjects.filter((go) => !go.dead);
  
 }
//수정 코드
function registerEventListeners() {
  eventEmitter.on(Messages.KEY_EVENT_UP, () => {
    hero.y -= 5;
    hero.updateSupportShips(); // 보조 비행기 위치 갱신
  });
  eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
    hero.y += 5;
    hero.updateSupportShips();
  });
  eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
    hero.x -= 5;
    hero.updateSupportShips();
  });
  eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
    hero.x += 5;
    hero.updateSupportShips();
  });
  eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
    if (hero.canFire()) {
      hero.fire();
    }
  });
}
// 적군 모두 제거되었는지 확인
function isEnemiesDead() {
  const enemies = gameObjects.filter((go) => go.type === "Enemy" && !go.dead);
  return enemies.length === 0; // 적군이 남아있지 않으면 true 반환
}

// 다음 스테이지 진행
function nextStage() {
  clearInterval(gameLoopId);

  // 이전 스테이지 객체 정리
  gameObjects.forEach((obj) => {
    if (obj.onDestroy) obj.onDestroy(); // 각 객체의 정리 함수 호출
  });
  gameObjects = []; // 게임 객체 초기화

  if (hero) hero.stopSupportFire(); // 보조 비행기 타이머 정리

  eventEmitter.clear(); // 이벤트 리스너 초기화

  currentStage++;
  initGame();

  gameLoopId = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    updateGameObjects();
    drawGameObjects(ctx);
    drawPoints();
    drawLife();
  }, 100);
}


// 보스 생성
function createBoss() {
  const boss = new Boss(canvas.width / 2 - 150, 50); // 보스를 중앙 상단에 배치
  boss.img = bossImg; // 보스 이미지 설정
  gameObjects.push(boss); // 보스를 게임 객체 리스트에 추가
}

//까지
 window.onload = async () => {
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");
  heroImg = await loadTexture("assets/player.png");
  enemyImg = await loadTexture("assets/enemyShip.png");
  laserImg = await loadTexture("assets/laserRed.png");
  explosingImg = await loadTexture("assets/laserGreenShot.png");
  lifeImg = await loadTexture("assets/life.png");
  bossImg = await loadTexture("assets/images/enemyUFO.png");
  bossLaserImg = await  loadTexture("assets/images/meteorBig.png");
  initGame();
  
   gameLoopId = setInterval(() => {
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    updateGameObjects();
    drawGameObjects(ctx);
    drawPoints();
    drawLife();
  }, 100);
 };


 window.addEventListener('keydown', onKeyDown);
 
 window.addEventListener("keyup", (evt) => {
  if (evt.key === "ArrowUp") {
    eventEmitter.emit(Messages.KEY_EVENT_UP);
  } else if (evt.key === "ArrowDown") {
    eventEmitter.emit(Messages.KEY_EVENT_DOWN);
  } else if (evt.key === "ArrowLeft") {
    eventEmitter.emit(Messages.KEY_EVENT_LEFT);
  } else if (evt.key === "ArrowRight") {
    eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
  } else if(evt.keyCode === 32) {
    eventEmitter.emit(Messages.KEY_EVENT_SPACE);
  }else if(evt.key === "Enter") {
    eventEmitter.emit(Messages.KEY_EVENT_ENTER);
   }
 });



  
  
    
    