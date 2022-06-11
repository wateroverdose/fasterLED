// ⚠ WARNING ⚠
// THIS CODE WILL GIVE YOU BRAIN DAMAGE

// WRITTEN BY orangeonfire (https://github.com/orangeonfire)

let hexInput = document.querySelector('#hexInput'),
   hSlider = document.querySelector('#hSlider'),
   rgbInput = document.querySelectorAll('.rgbInput'),
   cursorX = 0,
   cursorY = 0,
   gradientsBorder = document.querySelector('#gradientsBorder'),
   gradientColor = document.querySelector('#gradientColor'),
   gradients = document.querySelector('#gradients'),
   gradientsWrapper = document.querySelector('#gradientsWrapper'),
   squareSelector = document.querySelector('#squareSelector'),
   hInput = document.querySelector('#hInput'),
   sInput = document.querySelector('#sInput'),
   vInput = document.querySelector('#vInput'),
   gradientRect = gradients.getBoundingClientRect(),
   divider = gradientRect.width / 100,
   gradientRectX = cursorX - gradientRect.left,
   gradientRectY = cursorY - gradientRect.top,
   gradientRectReverseY = cursorY - gradientRect.bottom,
   bottomChecker = gradientRectReverseY / divider,
   leftChecker = gradientRectX / divider,
   isMouseOverGradients = false,
   actualS = 50,
   actualV = 50;

window.addEventListener('mousemove', (e) => {
   cursorX = e.clientX;
   cursorY = e.clientY
})

// source: https://www.geeksforgeeks.org/javascript-throttling
const throttle = (func, delay) => {
   let prev = 0;

   return (...args) => {
      let now = new Date().getTime();

      if (now - prev > delay) {
         prev = now;

         return func(...args);
      }
   }
}

// source: https://ehsangazar.com/optimizing-javascript-event-listeners-for-performance-e28406ad406c
function debounce(func, wait, immediate) {
   let timeout;
   return function () {
      let context = this,
         args = arguments;
      let later = function () {
         timeout = null;
         if (!immediate) func.apply(context, args);
      };
      let callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
   };
};

function convRem(rem) {
   return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function convPx(px) {
   return px / parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function getProp(element, value) {
   let x = window.getComputedStyle(element).getPropertyValue(value);
   return x;
}

//? source: https://stackoverflow.com/a/17243070/17747971
function hsvToRgb(h, s, v) {
   let r, g, b, i, f, p, q, t;
   if (arguments.length === 1) {
      s = h.s, v = h.v, h = h.h;
   }
   i = Math.floor(h * 6);
   f = h * 6 - i;
   p = v * (1 - s);
   q = v * (1 - f * s);
   t = v * (1 - (1 - f) * s);
   switch (i % 6) {
      case 0:
         r = v, g = t, b = p;
         break;
      case 1:
         r = q, g = v, b = p;
         break;
      case 2:
         r = p, g = v, b = t;
         break;
      case 3:
         r = p, g = q, b = v;
         break;
      case 4:
         r = t, g = p, b = v;
         break;
      case 5:
         r = v, g = p, b = q;
         break;
   }
   return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
   };
}

//? source: https://stackoverflow.com/a/17243070/17747971
function rgbToHsv(r, g, b) {
   if (arguments.length === 1) {
      g = r.g, b = r.b, r = r.r;
   }
   let max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      d = max - min,
      h,
      s = (max === 0 ? 0 : d / max),
      v = max / 255;

   switch (max) {
      case min:
         h = 0;
         break;
      case r:
         h = (g - b) + d * (g < b ? 6 : 0);
         h /= 6 * d;
         break;
      case g:
         h = (b - r) + d * 2;
         h /= 6 * d;
         break;
      case b:
         h = (r - g) + d * 4;
         h /= 6 * d;
         break;
   }

   return {
      h: h,
      s: s,
      v: v
   };
}

function rgbToHex(x) {
   let hex = x.toString(16);
   if (hex.length === 1) {
      hex = `0${hex}`
   }
   return hex
}

function setSquareSelectorPosition() {
   //? update gradientrectx and make gradientreverseY \/
   gradientRectX = cursorX - gradientRect.left;
   gradientRectY = cursorY - gradientRect.top;
   gradientRectReverseY = cursorY - gradientRect.bottom;
   //? reverse the gradient y /\

   //? update the top, bottom and left checkers \/
   topChecker = gradientRectY / divider;
   bottomChecker = gradientRectReverseY / divider;
   leftChecker = gradientRectX / divider;

   //? use the left checker to make sure the selector doesnt overflow horizontally \/
   if (gradientRectX / divider < 0) {
      leftChecker = 0
   } else if (gradientRectX / divider >= 100) {
      leftChecker = 100
   }

   //? use the bottom and top checkers to make sure the selector doesnt overflow vertically \/
   if (gradientRectReverseY / divider > 0) {
      bottomChecker = 0
   } else if (gradientRectReverseY / divider <= -100) {
      bottomChecker = -100
   }
   //? top checker
   if (gradientRectY / divider < 0) {
      topChecker = 0
   } else if (gradientRectY / divider >= 100) {
      topChecker = 100;
   }

   updateColorValues()
}



hSlider.addEventListener('input', changeGradientBackgroundFromSlider);

function changeGradientBackgroundFromSlider() {
   hInput.value = hSlider.value;
   //!

   //!

   //!

   //! DOKONCZYC TO GUWNO BO NEI DZIALA :))))
   gradientColor.style.background = `hsl(${hSlider.value}, 100%, 50%) none repeat scroll 0% 0%`;
   let x = hsvToRgb(hSlider.value / 360, actualS / 100, actualV / 100),
      out = `rgb(${x.r}, ${x.g}, ${x.b})`;
   gradientsBorder.style.background = out;
}

function updateColorValues() {
   //? update the value of s and v inputs based on the checkers \/
   actualS = leftChecker;
   actualV = Math.abs(bottomChecker);
   sInput.value = actualS.toFixed(2);
   vInput.value = actualV.toFixed(2);

   //? reverse the vInput so it's not negative /\

   //? change the selector's left based on the s input \/
   squareSelector.style.left = `${convPx(leftChecker * divider - 1)}rem`
   //? now top
   squareSelector.style.top = `${convPx(topChecker * divider + 1)}rem`



   let x = hsvToRgb(hSlider.value / 360, actualS / 100, actualV / 100),
      out = `rgb(${x.r}, ${x.g}, ${x.b})`;
   gradientsBorder.style.background = out;

   //? set rgb inputs
   document.querySelector('#rInput').value = `${x.r}`;
   document.querySelector('#gInput').value = `${x.g}`;
   document.querySelector('#bInput').value = `${x.b}`;

   //? set hex inputs from rgb
   hexInput.value = `${rgbToHex(x.r)}${rgbToHex(x.g)}${rgbToHex(x.b)}`
}


//? the whole gradient mechanics
gradients.addEventListener('mouseover', () => {
   isMouseOverGradients = true
});

gradients.addEventListener('mouseout', () => {
   isMouseOverGradients = false
});

gradientsWrapper.addEventListener('click', setSquareSelectorPosition)

gradientsWrapper.addEventListener('mousedown', () => {
   gradientsWrapper.addEventListener('mousemove', setSquareSelectorPosition)
})

document.body.addEventListener('mouseup', () => {
   gradientsWrapper.removeEventListener('mousemove', setSquareSelectorPosition)
})



//? update the clientX and clientY on resize
window.addEventListener('resize', () => {
   cursorX = document.body.getBoundingClientRect().width;
   cursorY = document.body.getBoundingClientRect().height;
   divider = gradientRect.width / 100;
   gradientRect = gradients.getBoundingClientRect();
   gradientRectX = cursorX - gradientRect.left;
   gradientRectY = cursorY - gradientRect.top;
   gradientRectReverseY = cursorY - gradientRect.bottom
})