/*
 * notes to future self
 * - make the color picker a seperate project after finishing fasterled
*/

let hex_input = ds('#hex_input'),
    h_slider = ds('#h_slider'),
    rgb_input = ds_a('.rgb_input'),
    color_value_inputs = ds_a('.color_number_input'),
    cursor_x = 0,
    cursor_y = 0,
    gradients_border = ds('#gradients_border'),
    gradient_color = ds('#gradient_color'),
    gradients = ds('#gradients'),
    gradients_wrapper = ds('#gradients_wrapper'),
    selector = ds('#selector'),
    hsv_input = ds_a('.hsv_input'),
    gradient_rect = gradients.getBoundingClientRect(),
    gradient_rect_divisor = gradient_rect.width / 100,
    gradient_rect_x = cursor_x - gradient_rect.left,
    gradient_rect_y = cursor_y - gradient_rect.top,
    gradient_rect_reverse_y = cursor_y - gradient_rect.bottom,
    left_setter = gradient_rect_x / gradient_rect_divisor,
    is_mouse_over_gradient = false,
    actual_s = 50,
    actual_v = 50;

window.addEventListener('mousemove', (e) => {
   cursor_x = e.clientX;
   cursor_y = e.clientY;
});

//? source: https://stackoverflow.com/a/17243070/17747971
function hsv_to_rgb(h, s, v) {
   h = h;
   s = s;
   v = v;
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
   }
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
      h: h * 360,
      s: s * 100,
      v: v * 100
   }
}

function rgb_to_hex(x) {
   let hex = x.toString(16);
   if (hex.length === 1) {
      hex = `0${hex}`;
   }
   return hex;
}

function hex_to_rgb(str, h, e, x) {
   // ? send null as the first argument to send singular values
   if (str === undefined) return;
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

function constrain(num, min, max) {
   return Math.max(Math.min(num, max), min);
}

let bottom_setter, top_setter;
function selector_pos(update) {
   gradient_rect_x = cursor_x - gradient_rect.left;
   gradient_rect_y = cursor_y - gradient_rect.top;
   gradient_rect_reverse_y = cursor_y - gradient_rect.bottom;
   gradient_rect = gradients.getBoundingClientRect();

   left_setter = constrain(gradient_rect_x / gradient_rect_divisor, 0, 100);
   bottom_setter = constrain(gradient_rect_reverse_y / gradient_rect_divisor, -100, 0);
   top_setter = constrain(gradient_rect_y / gradient_rect_divisor, 0, 100);
   
   // selector.style.left = `${rem_px_conv((left_setter * gradient_rect_divisor), true, false)}rem`;
   selector.style.left = `${left_setter * gradient_rect_divisor}px`
   // selector.style.top = `${rem_px_conv((top_setter * gradient_rect_divisor), true, false)}rem`;
   selector.style.top = `${top_setter * gradient_rect_divisor}px`

   actual_s = left_setter;
   actual_v = Math.abs(bottom_setter);

   if (update) update_color_values();
}
selector_pos(true);

function set_selector_pos(x, y) {
   left_setter = constrain(x, 0, 100);
   bottom_setter = constrain(-100 + y, -100, 0);
   top_setter = constrain(y, 0, 100);
   selector.style.left = `${rem_px_conv(x * gradient_rect_divisor, true, false)}rem`;
   selector.style.top = `${rem_px_conv(y * gradient_rect_divisor, true, false)}rem`;
   actual_s = left_setter;
   actual_v = Math.abs(bottom_setter);
   selector.style.left = `${left_setter * gradient_rect_divisor}px`
   selector.style.top = `${top_setter * gradient_rect_divisor}px`
   update_color_values();
}

h_slider.addEventListener('input', update_color_values);

h_slider.addEventListener('input', change_gradient_based_on_slider);

function update_color_values() {
   hsv_input[1].value = Math.round(actual_s);
   hsv_input[2].value = Math.round(actual_v);

   const cp_val = get_current_cp_val();

   gradients_border.style.background = cp_val.out;

   //? set rgb inputs
   rgb_input[0].value = `${cp_val.x.r}`;
   rgb_input[1].value = `${cp_val.x.g}`;
   rgb_input[2].value = `${cp_val.x.b}`;
   for (let n = 0; n < rgb_input.length; n++) {
      rgb_input[n].style.width = `${get_input_width(rgb_input[n].value, 3)}ch`;
   }

   //? set hex inputs from rgb
   hex_input.value = `#${rgb_to_hex(cp_val.x.r)}${rgb_to_hex(cp_val.x.g)}${rgb_to_hex(cp_val.x.b)}`;
}

function get_current_cp_val() {
   const x = hsv_to_rgb(h_slider.value / 360, actual_s / 100, actual_v / 100),
         out = `rgb(${x.r}, ${x.g}, ${x.b})`;
   return {
      x,
      out
   }
}

hex_input.addEventListener('change', () => {
   const htr = hex_to_rgb(format_hex(hex_input.value, false)),
         rth = rgb_to_hsv(htr.r, htr.g, htr.b);
   rgb_input[0].value = htr.r;
   rgb_input[1].value = htr.g;
   rgb_input[2].value = htr.b;
   for (let n = 0; n < rgb_input.length; n++) {
      rgb_input[n].style.width = `${get_input_width(rgb_input[n].value, 3)}ch`;
   }
   h_slider.value = rth.h;
   set_selector_pos(rth.s, rth.v);
});

// hex_input.addEventListener('change', () => {
//    let formatted;
//    if (hex_input.value.length === 3) {
//       formatted = hex_input.value.charAt(0) === '#' ? format_hex(hex_input.value.substring(1, 4)) : format_hex(hex_input.value);
//    } else if (hex_input.value.length === 6) {
//       formatted = hex_input.value.charAt(0) === '#' ? format_hex(hex_input.value.substring(1, 7)) : format_hex(hex_input.value);
//    }
//    console.log(formatted);
//    if (formatted === undefined) {return;} else {
//       hex_input.value = formatted;
//       const htr = hex_to_rgb(formatted.substring(1, 7));
//       rgb_input[0].value = htr.r;
//       rgb_input[1].value = htr.g;
//       rgb_input[2].value = htr.b;
//       for (let n = 0; n < rgb_input.length; n++) {
//          rgb_input[n].style.width = get_input_width(rgb_input[n].value, 3);
//       }
//       const rth = rgb_to_hsv(htr.r, htr.g, htr.b);
//       h_slider.value = rth.h;
//       actual_s = Math.round(rth.s);
//       actual_v = Math.round(rth.v);
//       set_selector_pos(actual_s, actual_v);
//       hsv_input[0].value = Math.round(rth.h);
//       hsv_input[1].value = actual_s;
//       hsv_input[2].value = actual_v;
//    }
// });

for (let n = 0; n < hsv_input.length; n++) {
   hsv_input[n].addEventListener('change', () => {
      change_gradient_based_on_slider();
      h_slider.value = hsv_input[0].value;
      set_selector_pos(hsv_input[2].value, hsv_input[1].value);
   })
}

function contains_hex_nums(str) {
   if (typeof(str) !== 'string') return; 
   return str.match(/[a-f0-9]/gi).length;
}

function format_hex(str, arrayify) {
   let _str = str;
   if (_str.length === 7 && _str.charAt(0) === '#') {
      _str = _str.substring(1, 7);
   } else if (_str.length === 4 && _str.charAt(0) === '#') {
      _str = _str.substring(1, 4);
   } else if (_str.length > 6) {
      _str = _str.slice(0, 6);
   }
   if (_str.length !== 3 && _str.length !== 6) return;
   if (contains_hex_nums(_str) !== _str.length || contains_hex_nums === null || contains_hex_nums(_str) === undefined) return;
   _str = _str.toLowerCase();
   console.log(_str)
   const arr = [];
   if (_str.length === 3) {
      _str = _str.split('').map(a => a + a).join('');
      console.log(_str)
   }
   if (arrayify) {
      arr = _str.match(/.{1,2}/g);
      return arr;
   }
   return _str;
}


function change_gradient_based_on_slider() {
   gradient_color.style.background = `hsl(${h_slider.value}, 100%, 50%) none repeat scroll 0% 0%`;
   gradients_border.style.background = get_current_cp_val().out;
   hsv_input[0].value = Math.round(h_slider.value);
}
change_gradient_based_on_slider();

for (let n = 0; n < rgb_input.length; n++) {
   rgb_input[n].addEventListener('input', () => {
      rgb_input[n].style.width = `${get_input_width(rgb_input[n].value, 3)}ch`;
   });
}

//? update gradients
gradients_wrapper.addEventListener('click', selector_pos);

gradients_wrapper.addEventListener('mousedown', () => {
   gradients_wrapper.addEventListener('mousemove', eErxyQ);
});

gradients_wrapper.addEventListener('mouseup', () => {
   gradients_wrapper.removeEventListener('mousemove', eErxyQ);
   gradients_wrapper.style.cursor = 'crosshair';
});

function eErxyQ() {
   selector_pos(true);
   if (get_style(gradients_wrapper, 'cursor') !== 'all-scroll') {
      gradients_wrapper.style.cursor = 'all-scroll';
   }
}

document.addEventListener('mouseup', () => {
   gradients_wrapper.removeEventListener('mousemove', eErxyQ);
});

//? update the clientX and clientY on resize
window.addEventListener('resize', () => {
   gradient_rect_divisor = gradient_rect.width / 100;
   gradient_rect = gradients.getBoundingClientRect();
   gradient_rect_x = cursor_x - gradient_rect.left;
   gradient_rect_y = cursor_y - gradient_rect.top;
   gradient_rect_reverse_y = cursor_y - gradient_rect.bottom;
});

set_selector_pos(50, 50);
for (let n = 0; n < rgb_input.length; n++) {
   rgb_input[n].style.width = `${get_input_width(rgb_input[n].value, 3)}ch`;
}