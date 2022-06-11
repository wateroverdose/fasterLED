// ⚠ WARNING ⚠
// THIS CODE WILL GIVE YOU BRAIN DAMAGE

// WRITTEN BY orangeonfire (https://github.com/orangeonfire)

let ledNumber = document.querySelector('#ledNumber'),
   ledNumberA = document.querySelector('#ledNumberA'),
   ledNumberB = document.querySelector('#ledNumberB'),
   ledNumberInput = document.querySelectorAll('.ledNumberInput'),
   ledMatrix = document.querySelector('#ledMatrix'),
   boxArray = [],
   matrixMode = false,
   selectedLayoutType = 'strip',
   enteredNumberSum = 0,
   announcement = document.querySelector('#announcement'),
   announcementCloseButton = document.querySelector('#announcement div img'),
   submitButton = document.querySelector('#submitButton'),
   ieBlocker = document.querySelector('#ieBlocker'),
   ieBlockerCloseButton = document.querySelector('#ieBlocker h5 a'),
   ledBox = document.querySelectorAll('.ledBox');

const layoutTypeRadio = document.querySelectorAll('input[name="layoutType"]');

function layoutTypeCheck() {
   for (let i = 0; i < layoutTypeRadio.length; i++) {
      layoutTypeRadio[i].addEventListener('change', () => {
         selectedLayoutType = layoutTypeRadio[i].value;
         console.warn(`selected layout type: ${selectedLayoutType}`);
         changeLedInputsBasedOnLayoutType()
      })
   }
}

function changeLedInputsBasedOnLayoutType() {
   switch (selectedLayoutType) {
      case 'strip':
         ledNumberA.parentNode.style.display = 'inline-block';
         ledNumberA.value = '1';
         ledNumberB.parentNode.style.display = 'inline-block';
         ledNumberB.value = '80';
         ledNumber.parentNode.style.display = 'none';
         ledNumberB.select();
         matrixMode = false;
         break
      case 'matrix':
         ledNumberA.parentNode.style.display = 'none';
         ledNumberB.parentNode.style.display = 'none';
         ledNumber.parentNode.style.display = 'inline-block';
         ledNumber.value = '8';
         ledNumber.select();
         matrixMode = true;
         break
      case 'custom':
         ledNumber.parentNode.style.display = 'none';
         ledNumberA.parentNode.style.display = 'inline-block';
         ledNumberB.parentNode.style.display = 'inline-block';
         ledNumberA.value = '32';
         ledNumberB.value = '16';
         ledNumberA.select();
         break
      default:
         selectedLayoutType = 'custom';
         changeLedInputsBasedOnLayoutType()
   }
   console.log(`mm: ${matrixMode}, ${ledNumberA.value}, ${ledNumberB.value}, ${ledNumber.value}`);

}


submitButton.addEventListener('click', submitNumber);


//? change grid size accordingly to entered number \/
function changeGridSize(isRect) {
   if (isRect === true) {
      ledMatrix.style.gridTemplateRows = `repeat(${ledNumber.value}, 1fr)`;
      ledMatrix.style.gridTemplateColumns = `repeat(${ledNumber.value}, 1fr)`
   } else {
      ledMatrix.style.gridTemplateRows = `repeat(${ledNumberA.value}, 1fr)`;
      ledMatrix.style.gridTemplateColumns = `repeat(${ledNumberB.value}, 1fr)`
   }
}

function submitNumber() {
   //? set the enterednumber \/
   if (matrixMode == true) {
      enteredNumberSum = Math.pow(ledNumber.value, 2);
   } else {
      enteredNumberSum = ledNumberA.value * ledNumberB.value;
   }

   //? if user does a little trolling dont do anything \/
   if (enteredNumberSum == 0) {
      return
      //? else continue \/
   } else {
      document.querySelector('#ledInput').style.display = 'none';
      document.querySelector('code').style.display = 'flex';
      writeLedBoxes();
   }

   let currentBox,
      prevBox;

   function writeLedBoxes() {
      function createItem(name) {
         let div = document.createElement('div');
         div.classList.add(name);
         return div;
      }

      //? create boxes \/
      for (let i = 1; i <= enteredNumberSum; i++) {
         document.querySelector('#ledMatrix').appendChild(createItem('ledBoxWrapper')).appendChild(createItem('ledBox')).innerHTML = i;
      }

      //? change the grid size to match the selected shape \/
      changeGridSize(matrixMode);

      //? update the textarea with code \/
      for (let i = 0; i <= enteredNumberSum - 1; i++) {
         document.querySelector('#codeFinal').innerHTML += (`leds[${i}] = ${i}\n`);
      }

      //? push basic color
      Array.from(ledMatrix.children).forEach(() => {
         boxArray.push(`#ffffff`)
      })

      //? update ledbox \/
      ledBox = document.querySelectorAll('.ledBox');

      function updateLedColors() {
         if (document.querySelector('#currentBox').innerHTML = ledBox[currentBox].innerHTML) {
            ledBox[currentBox].style.background = boxArray[currentBox]
         }
      }

      //? add event listeners to all leds to get the current led and update the value \/
      for (let i = 0; i < ledBox.length; i++) {
         ledBox[i].addEventListener('click', () => {
            //? update currentBox with current box (duh) \/
            currentBox = i;
            document.querySelector('#currentBox').innerHTML = currentBox + 1;
            //? change #verycoolmeter to the current box number + 1 (to avoid confusion) /\
         })
      }
      //? add event listeners to the submitcolor button to update led colors \/
      document.querySelector('#submitColor').addEventListener('click', () => {
         if (currentBox === undefined) return
         //? change the boxarray entry \/
         boxArray[currentBox] = '#' + hexInput.value;
         //? log it too \/
         console.log(boxArray[currentBox]);
         //? aaaaand update the color \/
         updateLedColors()
      })
   }

   document.querySelector('#ledMatrixWrapper').style.display = 'flex';

   if (matrixMode === true) {
      document.querySelector('#testWrapper').style.height = `${(ledNumber.value * 2) + (0.25 /* padding of ledmatrix */) + (0.25 /* gap of ledmatrix */ * ledNumber.value)}rem`;
      document.querySelector('#testWrapper').style.width = document.querySelector('#testWrapper').style.height;
   } else {
      document.querySelector('#testWrapper').style.height = `${(ledNumberB.value) + (0.25 /* padding of ledmatrix */) + (0.25 /* gap of ledmatrix */ * ledNumberA.value)}rem`;
      document.querySelector('#testWrapper').style.width = `${(ledNumberB.value) + (0.25 /* padding of ledmatrix */) + (0.25 /* gap of ledmatrix */ * ledNumberA.value)}rem`;
   }
   document.querySelector('code').style.display = 'block'
}

//? limit inputs to 64
function limitInputs(amog) {
   this.value = this.value.replace(/[^0-9]+/g, '').replace(/(\..*?)\..*/g, '$1');
   if (this.value <= 0) {
      this.value = '';
   }
   if (this.value.length >= 3) {
      this.value = amog;
   }
}

for (let i = 0; i < ledNumberInput.length; i++) {
   ledNumberInput[i].addEventListener('input', limitInputs, '64')
   ledNumberInput[i].addEventListener('input', () => {
      if (ledNumberA === ledNumberB) {
         matrixMode = true;
         ledNumber = ledNumberA
      } else {
         matrixMode = false;
      }
   })
}

function changeAllColors() {
   console.log('test');
   for (let i = 0; i < boxArray.length; i++) {
      boxArray[i] = `#${hexInput.value}`;
      ledBox[i].style.background = boxArray[i];
   }
}

const debouncedChangeAllColors = debounce(changeAllColors, 10)

document.querySelector('#changeAllColors').addEventListener('click', debouncedChangeAllColors)

layoutTypeCheck();
changeLedInputsBasedOnLayoutType();
for (let i = 0; i < 3; i++) {
   console.warn('%chi, i would be pleased if you\'d give my project a star on github :)', 'font-size: 2rem; font-family: \'montserrat\', sans-serif, sans; background: #000; border-radius: 1rem; padding: 1rem; color: magenta;');
   console.log('\n')
}
let piss = document.querySelectorAll('input:not(input[type="checkbox"]):not(input[type="radius"]:not(input[type="radio"])');
for (let i = 0; i < piss.length; i++) {
   piss[i].addEventListener('click', () => {
      piss[i].select()
   })
}
let bigBtn = document.querySelectorAll('.changeColorButton');
for (let i = 0; i < bigBtn.length; i++) {
   if (bigBtn[i].checked === true) {
      bigBtn[i].parentNode.style.background = 'rgb(91, 197, 79)';
   } else {
      bigBtn[i].parentNode.style.background = 'rgb(255, 0, 0)';
   }
   bigBtn[i].parentNode.addEventListener('click', () => {
      if (bigBtn[i].checked === true) {
         bigBtn[i].parentNode.style.background = 'rgb(255, 0, 0)';
         bigBtn[i].checked = false;
      } else {
         bigBtn[i].parentNode.style.background = 'rgb(91, 197, 79)';
         bigBtn[i].checked = true;
      }
   })
}

// window.onbeforeunload = function() {return 'you will lose all of your leds because im too lazy to code a save system'};

// document.addEventListener('DOMContentLoaded', startup);