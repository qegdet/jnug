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



   
   