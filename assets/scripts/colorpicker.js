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
   };
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
   };
   return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
   };
};

//? source: https://stackoverflow.com/a/17243070/17747971
function rgb_to_hsv(r, g, b) {
   if (arguments.length === 1) {
      g = r.g, b = r.b, r = r.r;
   };

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
   };

   return {
      h: h * 360,
      s: s * 100,
      v: v * 100
   };
};

function rgb_to_hex(x) {
   let hex = x.toString(16);
   if (hex.length === 1) {
      hex = `0${hex}`;
   }
   return hex;
};

// ? send null as the first argument to send singular values
function hex_to_rgb(str, h, e, x) {
   if (str === undefined) return;
   if (str !== null) {
      let str_arr = str.match(/.{0,2}/g);
      h = str_arr[0];
      e = str_arr[1];
      x = str_arr[2];
   };
   return {
      r: parseInt(h, 16),
      g: parseInt(e, 16),
      b: parseInt(x, 16)
   };
};

function constrain(num, min, max) {
   return Math.max(Math.min(num, max), min);
};

let bottom_setter = gradient_rect_reverse_y / gradient_rect_divisor, top_setter;
function selector_pos() {
   //? update gradientrectx and make gradientreverseY \/
   // ? i have absolutely no clue why this works, but if anything breaks, it's because of the rem_px_conv's below
   gradient_rect_x = cursor_x - gradient_rect.left;
   gradient_rect_y = cursor_y - gradient_rect.top;
   gradient_rect_reverse_y = cursor_y - gradient_rect.bottom;
   gradient_rect = gradients.getBoundingClientRect();
   //? reverse the gradient y /\
   //? use the left checker to make sure the selector doesnt overflow horizontally \/
   left_setter = constrain(gradient_rect_x / gradient_rect_divisor, 0, 100);
   //? use the bottom and top checkers to make sure the selector doesnt overflow vertically \/
   bottom_setter = constrain(gradient_rect_reverse_y / gradient_rect_divisor, -100, 0);
   //? top checker
   top_setter = constrain(gradient_rect_y / gradient_rect_divisor, 0, 100);
   //? change the selector's left based on the s input \/
   selector.style.left = `${rem_px_conv((left_setter * gradient_rect_divisor), true, false)}rem`;
   //? now top
   selector.style.top = `${rem_px_conv((top_setter * gradient_rect_divisor), true, false)}rem`;
   update_color_values();
};
selector_pos();

h_slider.addEventListener('input', () => {
   update_color_values();
});

function update_color_values() {
   //? update the value of s and v inputs based on the checkers \/
   actual_s = left_setter;
   actual_v = Math.abs(bottom_setter);
   hsv_input[1].value = left_setter.toFixed(2);
   hsv_input[2].value = actual_v.toFixed(2);

   let cp_val = get_current_cp_val();

   gradients_border.style.background = cp_val.out;

   //? set rgb inputs
   rgb_input[0].value = `${cp_val.x.r}`;
   rgb_input[1].value = `${cp_val.x.g}`;
   rgb_input[2].value = `${cp_val.x.b}`;
   for (let n = 0; n < rgb_input.length; n++) {
      rgb_input[n].style.width = change_input_width(rgb_input[n].value, 3);
   };

   //? set hex inputs from rgb
   hex_input.value = `${rgb_to_hex(cp_val.x.r)}${rgb_to_hex(cp_val.x.g)}${rgb_to_hex(cp_val.x.b)}`;
};

function get_current_cp_val() {
   let x = hsv_to_rgb(h_slider.value / 360, actual_s / 100, actual_v / 100),
       out = `rgb(${x.r}, ${x.g}, ${x.b})`;
   return {
      x,
      out
   };
};

hex_input.addEventListener('change', () => {
   hex_input.value = format_hex(hex_input.value);
   const htr = hex_to_rgb(hex_input.value);
   rgb_input[0].value = htr.r;
   rgb_input[1].value = htr.g;
   rgb_input[2].value = htr.b;
   for (let n = 0; n < rgb_input.length; n++) {
      rgb_input[n].style.width = change_input_width(rgb_input[n].value, 3);
   }
   const rth = rgb_to_hsv(htr.r, htr.g, htr.b);
   h_slider.value = rth.h;
   hsv_input[0].value = rth.h;
   hsv_input[1].value = rth.s;
   hsv_input[2].value = rth.v;
});

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
};

function format_hex(str, arrayify) {
   let val = str;
   // console.log(`str: ${str}, val: ${val}`);
   // console.log(`val.length > 6 is next`);
   if (val.length > 6) {
      // console.log(`val.length > 6 proceeded`);
      val = val.slice(0, 6);
      // console.log(`val sliced to 6 chars`);
      // console.log(val);
   };
   if (val.length !== 3 && val.length !== 6) return;
   if (contains_hex_nums(val) === undefined || contains_hex_nums(val) !== val.length) return;
   val = val.toLowerCase();
   // console.log(`val toLowerCase`);
   let arr = [];
   // console.log(`arr var created`);
   // console.log(`val.length === 3 is next`);
   if (val.length === 3) {
      // console.log(`val.length === 3 proceeded`);
      val = val.split('').map(a => a + a).join('');
      // console.log(`val split and mapped`);
      // console.log(val)
   };
   if (arrayify === true) {
      arr = val.match(/.{1,2}/g);
      // console.log(`arr = val.match(/.{1,2}/g)`);
      // console.log(arr);
      return arr;
   } else return val;
}

hex_input.addEventListener('change', () => {
   hex_input.value = format_hex(hex_input.value);
});

h_slider.addEventListener('input', change_gradient_based_on_slider);

function change_gradient_based_on_slider() {
   hsv_input[0].value = h_slider.value;
   gradient_color.style.background = `hsl(${h_slider.value}, 100%, 50%) none repeat scroll 0% 0%`;
   gradients_border.style.background = get_current_cp_val();
};

function change_input_width(obj, max) {
   if (max === undefined) max = String(obj).length;
   for (let n = 1; n < max; n++) {
      if (obj.length >= max) {
         return `${max}ch`;
      } else if (obj.length === max - n) {
         return `${max - n}ch`;
      } else {
         return '1ch';
      };
   };
};

for (let n = 0; n < rgb_input.length; n++) {
   rgb_input[n].addEventListener('input', () => {
      rgb_input[n].style.width = change_input_width(rgb_input[n].value, 3);
   });
};

//? update gradients
gradients_wrapper.addEventListener('click', selector_pos);

gradients_wrapper.addEventListener('mousedown', () => {
   gradients_wrapper.addEventListener('mousemove', eErxyQ);
});

gradients_wrapper.addEventListener('mouseup', () => {
   gradients_wrapper.removeEventListener('mousemove', eErxyQ);
});

function eErxyQ() {
   selector_pos();
};

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