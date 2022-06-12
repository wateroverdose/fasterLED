// ⚠ WARNING ⚠
// THIS CODE WILL GIVE YOU BRAIN DAMAGE

// WRITTEN BY purplishflame (https://github.com/purplishflame)

let hex_input = document.querySelector('#hex_input'),
   h_slider = document.querySelector('#h_slider'),
   rgb_input = document.querySelectorAll('.rgb_input'),
   cursor_x = 0,
   cursor_y = 0,
   gradients_border = document.querySelector('#gradients_border'),
   gradient_color = document.querySelector('#gradient_color'),
   gradients = document.querySelector('#gradients'),
   gradients_wrapper = document.querySelector('#gradients_wrapper'),
   square_selector = document.querySelector('#square_selector'),
   h_input = document.querySelector('#h_input'),
   s_input = document.querySelector('#s_input'),
   v_input = document.querySelector('#v_input'),
   gradient_rect = gradients.getBoundingClientRect(),
   gradient_rect_divisor = gradient_rect.width / 100,
   gradient_rect_x = cursor_x - gradient_rect.left,
   gradient_rect_y = cursor_y - gradient_rect.top,
   gradient_rect_reverse_y = cursor_y - gradient_rect.bottom,
   bottom_checker = gradient_rect_reverse_y / gradient_rect_divisor,
   left_checker = gradient_rect_x / gradient_rect_divisor,
   is_mouse_over_gradient = false,
   actual_s = 50,
   actual_v = 50;

window.addEventListener('mousemove', (e) => {
   cursor_x = e.clientX;
   cursor_y = e.clientY;
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

// TODO actually make this function good ~ 11/06/22
function rem_px_conv(value, type, is_postfix_present) {
   if (value === undefined || type === undefined || is_postfix_present === undefined) return;
   if (type === true) {
      if (is_postfix_present === true) {
         return (value.replace('px', '') / parseFloat(getComputedStyle(document.documentElement).fontSize))/* + 'rem'*/;
      } else {
         return value / parseFloat(getComputedStyle(document.documentElement).fontSize)/* + 'rem'*/;
      }
   } else {
      if (is_postfix_present === true) {
         return (value.replace('rem', '') * parseFloat(getComputedStyle(document.documentElement).fontSize))/* + 'px'*/;
      } else {
         return value * parseFloat(getComputedStyle(document.documentElement).fontSize)/* + 'px'*/;
      }
   }
}

function getProp(element, value) {
   let x = window.getComputedStyle(element).getPropertyValue(value);
   return x;
}

//? source: https://stackoverflow.com/a/17243070/17747971
function hsv_to_rgb(h, s, v) {
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
      r: Math.round(r * 2.5),
      g: Math.round(g * 2.5),
      b: Math.round(b * 2.5)
   };
}

//? source: https://stackoverflow.com/a/17243070/17747971
function rgb_to_hsv(r, g, b) {
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

function rgb_to_hex(x) {
   let hex = x.toString(16);
   if (hex.length === 1) {
      hex = `0${hex}`
   }
   return hex;
}

// ? send null as the first argument to send singular values
function hex_to_rgb(str, h, e, x) {
   if (str === undefined) return;
   arr = [];
   if (str !== null) {
      let str_arr = str.match(/.{0,2}/g);
      h = str_arr[0];
      e = str_arr[1];
      x = str_arr[2];
   }
   return {
      r: parseInt(h, 16),
      g: parseInt(e, 16),
      b: parseInt(x, 16)
   }
}

function constrain(x, a, b) {
   return Math.max(Math.min(x, b), a);
}

function set_square_selector_position() {
   //? update gradientrectx and make gradientreverseY \/
   gradient_rect_x = cursor_x - gradient_rect.left;
   gradient_rect_y = cursor_y - gradient_rect.top;
   gradient_rect_reverse_y = cursor_y - gradient_rect.bottom;
   //? reverse the gradient y /\
   //? use the left checker to make sure the selector doesnt overflow horizontally \/
   left_checker = constrain(gradient_rect_x / gradient_rect_divisor, 0, 100);
   //? use the bottom and top checkers to make sure the selector doesnt overflow vertically \/
   bottom_checker = constrain(gradient_rect_reverse_y / gradient_rect_divisor, -100, 0);
   //? top checker
   top_checker = constrain(gradient_rect_y / gradient_rect_divisor, 0, 100);
   //? change the selector's left based on the s input \/
   square_selector.style.left = `${rem_px_conv((left_checker * gradient_rect_divisor - 1), true, false)}rem`;
   //? now top
   square_selector.style.top = `${rem_px_conv((top_checker * gradient_rect_divisor + 1), true, false)}rem`;
   update_color_values();
}


// function update_color_picker_from_values() {

// }
// for (let i = 0; i < color_value_inputs.length; i++) {
//    color_value_inputs[i].addEventListener('input', () => {
//       update_color_picker_from_values();
//    });
// }

function contains_hex_nums(str) {
   if (typeof(str) !== 'string') return; 
   return str.match(/[a-f0-9]/gi).length;
}

function format_hex(str) {
   val = str;
   if (val.length > 6) {
      val = val.slice(0, 6);
   }
   if (val.length !== 3 && val.length !== 6) return;
   if (contains_hex_nums(val) === undefined || contains_hex_nums(val) !== val.length) return;
   val = val.toLowerCase();
   let arr = [];
   if (val.length === 3) {
      val = val.split('').map(a => a + a).join('');
      return val;
   }
   arr = val.match(/.{1,2}/g);
   console.log(arr)
}

hex_input.addEventListener('change', () => {
   hex_input.value = format_hex(hex_input.value);
});

h_slider.addEventListener('input', change_gradient_based_on_slider);

function change_gradient_based_on_slider() {
   h_input.value = h_slider.value;
   //!

   //!

   //!

   //! DOKONCZYC TO GUWNO BO NEI DZIALA :))))
   gradient_color.style.background = `hsl(${h_slider.value}, 100%, 50%) none repeat scroll 0% 0%`;
   let x = hsv_to_rgb(h_slider.value / 360, actual_s / 100, actual_v / 100),
       out = `rgb(${x.r}, ${x.g}, ${x.b})`;
   gradients_border.style.background = out;
}

function update_color_values() {
   //? update the value of s and v inputs based on the checkers \/
   actual_s = left_checker;
   actual_v = Math.abs(bottom_checker);
   s_input.value = actual_s.toFixed(2);
   v_input.value = actual_v.toFixed(2);

   //? reverse the vInput so it's not negative /\


   let x = hsv_to_rgb(h_slider.value / 360, actual_s / 100, actual_v / 100),
      out = `rgb(${x.r}, ${x.g}, ${x.b})`;
   gradients_border.style.background = out;

   //? set rgb inputs
   document.querySelector('#r_input').value = `${x.r}`;
   document.querySelector('#g_input').value = `${x.g}`;
   document.querySelector('#b_input').value = `${x.b}`;

   //? set hex inputs from rgb
   hex_input.value = `${rgb_to_hex(x.r)}${rgb_to_hex(x.g)}${rgb_to_hex(x.b)}`;
}

function change_input_width(obj) {
   if (obj.length >= 3) {
      return '3ch';
   } else if (obj.length === 2) {
      return '2ch';
   } else {
      return '1ch';
   }
}

function update_rgb_input_val(n) {
   rgb_input[n].style.width = change_input_width(rgb_input[n].value);
}

for (let i = 0; i < rgb_input.length; i++) {
   rgb_input[i].addEventListener('input', () => {
      update_rgb_input_val(i);
   });
}

//? the whole gradient mechanics
gradients.addEventListener('mouseover', () => {
   is_mouse_over_gradient = true;
});

gradients.addEventListener('mouseout', () => {
   !is_mouse_over_gradient;
});

gradients_wrapper.addEventListener('click', set_square_selector_position);

gradients_wrapper.addEventListener('mousedown', () => {
   gradients_wrapper.addEventListener('mousemove', set_square_selector_position)
})

document.body.addEventListener('mouseup', () => {
   gradients_wrapper.removeEventListener('mousemove', set_square_selector_position)
})



//? update the clientX and clientY on resize
window.addEventListener('resize', () => {
   cursor_x = document.body.getBoundingClientRect().width;
   cursor_y = document.body.getBoundingClientRect().height;
   gradient_rect_divisor = gradient_rect.width / 100;
   gradient_rect = gradients.getBoundingClientRect();
   gradient_rect_x = cursor_x - gradient_rect.left;
   gradient_rect_y = cursor_y - gradient_rect.top;
   gradient_rect_reverse_y = cursor_y - gradient_rect.bottom;
});