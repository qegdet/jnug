console.log(document.getElementById('plant1'));
dragElement(document.getElementById('plant1'));
dragElement(document.getElementById('plant2'));
dragElement(document.getElementById('plant3'));
dragElement(document.getElementById('plant4'));
dragElement(document.getElementById('plant5'));
dragElement(document.getElementById('plant6'));
dragElement(document.getElementById('plant7'));
dragElement(document.getElementById('plant8'));
dragElement(document.getElementById('plant9'));
dragElement(document.getElementById('plant10'));
dragElement(document.getElementById('plant11'));
dragElement(document.getElementById('plant12'));
dragElement(document.getElementById('plant13'));
dragElement(document.getElementById('plant14'));

let zIndexCounter = 1;

function dragElement(terrariumElement) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    terrariumElement.onpointerdown = pointerDrag;

    
    function pointerDrag(e) {
        e.preventDefault();
        console.log(e);
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.addEventListener('pointermove', elementDrag);  // 이벤트 리스너 추가
        document.addEventListener('pointerup', stopElementDrag);
        document.ondblclick = dubclick; // 이벤트 리스너 추가
    }

    function elementDrag(e) {
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        console.log(pos1, pos2, pos3, pos4);
        terrariumElement.style.top = (terrariumElement.offsetTop - pos2) + 'px';
        terrariumElement.style.left = (terrariumElement.offsetLeft - pos1) + 'px';
    }

    function stopElementDrag() {
        document.removeEventListener('pointermove', elementDrag);  // 이벤트 리스너 제거
        document.removeEventListener('pointerup', stopElementDrag); // 이벤트 리스너 제거
    }

    function dubclick(){
        terrariumElement.style.zIndex = ++zIndexCounter;
    }


}
   //마우스 효과 
class PointerParticle {
    constructor(spread, speed, component) {
      const { ctx, pointer, hue } = component;
  
      this.ctx = ctx;
      this.x = pointer.x;
      this.y = pointer.y;
      this.mx = pointer.mx * 0.1;
      this.my = pointer.my * 0.1;
      this.size = Math.random() + 1;
      this.decay = 0.01;
      this.speed = speed * 0.08;
      this.spread = spread * this.speed;
      this.spreadX = (Math.random() - 0.5) * this.spread - this.mx;
      this.spreadY = (Math.random() - 0.5) * this.spread - this.my;
      this.color = `hsl(${hue}deg 90% 60%)`;
    }
  
    draw() {
      this.ctx.fillStyle = this.color;
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  
    collapse() {
      this.size -= this.decay;
    }
  
    trail() {
      this.x += this.spreadX * this.size;
      this.y += this.spreadY * this.size;
    }
  
    update() {
      this.draw();
      this.trail();
      this.collapse();
    }
  }
  
  class PointerParticles extends HTMLElement {
    static register(tag = "pointer-particles") {
      if ("customElements" in window) {
        customElements.define(tag, this);
      }
    }
  
    static css = `
      :host {
        display: grid;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
    `;
  
    constructor() {
      super();
  
      this.canvas;
      this.ctx;
      this.fps = 60;
      this.msPerFrame = 1000 / this.fps;
      this.timePrevious;
      this.particles = [];
      this.pointer = {
        x: 0,
        y: 0,
        mx: 0,
        my: 0
      };
      this.hue = 0;
    }
  
    connectedCallback() {
      const canvas = document.createElement("canvas");
      const sheet = new CSSStyleSheet();
  
      this.shadowroot = this.attachShadow({ mode: "open" });
  
      sheet.replaceSync(PointerParticles.css);
      this.shadowroot.adoptedStyleSheets = [sheet];
  
      this.shadowroot.append(canvas);
  
      this.canvas = this.shadowroot.querySelector("canvas");
      this.ctx = this.canvas.getContext("2d");
      this.setCanvasDimensions();
      this.setupEvents();
      this.timePrevious = performance.now();
      this.animateParticles();
    }
  
    createParticles(event, { count, speed, spread }) {
      this.setPointerValues(event);
  
      for (let i = 0; i < count; i++) {
        this.particles.push(new PointerParticle(spread, speed, this));
      }
    }
  
    setPointerValues(event) {
      this.pointer.x = event.x - this.offsetLeft;
      this.pointer.y = event.y - this.offsetTop;
      this.pointer.mx = event.movementX;
      this.pointer.my = event.movementY;
    }
  
    setupEvents() {
      const parent = this.parentNode;
  
      parent.addEventListener("click", (event) => {
        this.createParticles(event, {
          count: 300,
          speed: Math.random() + 1,
          spread: Math.random() + 50
        });
      });
  
      parent.addEventListener("pointermove", (event) => {
        this.createParticles(event, {
          count: 20,
          speed: this.getPointerVelocity(event),
          spread: 1
        });
      });
  
      window.addEventListener("resize", () => this.setCanvasDimensions());
    }
  
    getPointerVelocity(event) {
      const a = event.movementX;
      const b = event.movementY;
      const c = Math.floor(Math.sqrt(a * a + b * b));
  
      return c;
    }
  
    handleParticles() {
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].update();
  
        if (this.particles[i].size <= 0.1) {
          this.particles.splice(i, 1);
          i--;
        }
      }
    }
  
    setCanvasDimensions() {
      const rect = this.parentNode.getBoundingClientRect();
  
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
    }
  
    animateParticles() {
      requestAnimationFrame(() => this.animateParticles());
  
      const timeNow = performance.now();
      const timePassed = timeNow - this.timePrevious;
  
      if (timePassed < this.msPerFrame) return;
  
      const excessTime = timePassed % this.msPerFrame;
  
      this.timePrevious = timeNow - excessTime;
  
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.hue = this.hue > 360 ? 0 : (this.hue += 3);
  
      this.handleParticles();
    }
  }
  
  PointerParticles.register();