let selected_layout_type = 0,
    led_count = 0,
    led_box = ds_a('.led_box'),
    led_box_wrapper = ds_a('.led_box_wrapper'),
    code_final = ds('#code_final');

const layout_type_radio = ds_a('input[name="layout_type"]'),
      led_number_a = ds('#led_number_a'),
      led_number_b = ds('#led_number_b'),
      led_number_input = ds('.led_number_input'),
      led_input_box = ds('#led_input_box'),
      led_container = ds('#led_container'),
      brightness_level_slider = ds('#brightness_level_slider'),
      brightness_level = ds('#brightness_level'),
      code_box = ds('code'),
      led_container_wrapper = ds('#led_container_wrapper'),
      submit_button = ds('#submit_button'),
      data_pin = ds('#data_pin'),
      regen_code = ds('#regen_code'),
      leds = ds('#leds'),
      val = [led_color_array = [], settings = []];

function save_as_json(dom_node, filename, val) {
   let x = new Blob([JSON.stringify(val)]);
   dom_node.download = `${filename}${Math.round(Date.now() / 100000)}.json`
   dom_node.href = URL.createObjectURL(x);
}

let code_gen_count = 0;
function make_code_gen_unavailable(seconds) {
   let interval;
   if (code_gen_count === 0) {
      console.log('start the engines!!! 😎😎');
      regen_code.style.animationPlayState = 'running';
      interval = setInterval(update, seconds * 1000);
      code_gen_count++;
   };
   function update() {
      regen_code.style.animationPlayState = 'paused';
      console.log(`${seconds} seconds passed! removing the interval`);
      code_gen_count = 0;
      clearInterval(interval);
   };
};

regen_code.addEventListener('click', () => {
   console.table(led_color_array);
   generate_code(led_count, brightness_level.value, data_pin.value, led_color_array);
   make_code_gen_unavailable(get_style(regen_code, 'animation-duration', false, false).substring(0, 1));
});

led_number_a.addEventListener('input', () => {
   if (selected_layout_type === 1) led_number_b.value = led_number_a.value;
});

led_number_b.addEventListener('input', () => {
   if (selected_layout_type === 1) led_number_a.value = led_number_b.value;
});

function layout_type_check(n) {
   selected_layout_type = n;
   console.warn(`selected layout type: ${selected_layout_type}`);
   change_led_inputs_based_on_layout_type()
};

for (let n = 0; n < layout_type_radio.length; n++) {
   layout_type_radio[n].addEventListener('change', () => {
      layout_type_check(n);
   });
};

function change_led_inputs_based_on_layout_type() {
   switch (selected_layout_type) {
      case 0:
         led_number_a.value = '1';
         led_number_b.value = '80';
         led_number_b.select();
         break;
      case 1:
         led_number_a.value = '8';
         led_number_b.value = '8';
         led_number_a.select();
         break;
      case 2:
         led_number_a.value = '32';
         led_number_b.value = '16';
         led_number_a.select();
         break;
      default:
         selected_layout_type = 2;
         break;
   };
   console.log(`${led_number_a.value}, ${led_number_b.value}`);
};

//? change grid size accordingly to entered number \/
function change_grid_size() {
   led_container.style.gridTemplateRows = `repeat(${led_number_a.value}, 1fr)`;
   led_container.style.gridTemplateColumns = `repeat(${led_number_b.value}, 1fr)`;
};

function create_dom_node(name, type) {
   if (type === undefined) {
      type = 'div';
   };
   let item = document.createElement(type);
   item.classList.add(name);
   return item;
};

function get_style(element, style, conv_px_to_rem, add_rem_postfix) {
   if (element === undefined || style === undefined) return undefined;
   let x = window.getComputedStyle(element).getPropertyValue(style);
   if (conv_px_to_rem) {
      x = rem_px_conv(x, true, true);
      if (add_rem_postfix) x += 'rem';
   };
   return x;
};

submit_button.addEventListener('click', submit_number);

function submit_number() {
   //? set the enterednumber \/
   led_count = Number(led_number_a.value) * Number(led_number_b.value);

   //? if user does a little bit of trolling, stop the function \/
   if (led_count === 0) return;

   led_input_box.style.display = 'none';
   leds.style.display = 'flex';
   ds('.settings_page:nth-of-type(1)').style.borderRadius = 'calc(var(--radius) * 2)';
   write_led_boxes();
   ds('.settings_page:nth-of-type(2)').style.display = 'none';
   
   let led_box_width = get_style(led_box[0], 'width', true, false),
       led_box_border = get_style(led_box[0], 'border-width', true, false),
       led_container_margin = get_style(led_container, 'margin', true, false);

   led_container_wrapper.style.height = `${((Number(led_number_a.value) + .75) * led_box_width) + (Number(led_number_a.value) * led_box_border) + (Number(led_container_margin) * 2)}rem`;
   led_container_wrapper.style.width = `${((Number(led_number_b.value) + .75) * led_box_width) + (Number(led_number_b.value) * led_box_border) + (Number(led_container_margin) * 2)}rem`;
   code_box.style.display = 'block';
};

let lmb_held_on_leds = false;
led_container.addEventListener('mousedown', () => {lmb_held_on_leds = true;});
led_container.addEventListener('mouseup', () => {lmb_held_on_leds = false;});

function write_led_boxes() {
   //? create boxes \/
   for (let n = 1; n <= led_count; n++) {
      led_container.appendChild(create_dom_node('led_box_wrapper')).appendChild(create_dom_node('led_box')).innerHTML = n;
   }
   led_box = ds_a('.led_box');
   led_box_wrapper = ds_a('.led_box_wrapper');

   for (let n = 0; n < led_box.length; n++) {
      led_box_wrapper[n].addEventListener('mouseover', () => {
         over = true
         if (lmb_held_on_leds) {
            led_box[n].style.background = `#${hex_input.value}`;
            led_color_array[n] = `0x${hex_input.value}`;
            let cfi = hex_to_rgb(hex_input.value);
            led_box[n].style.color = invert_rgb(cfi.r, cfi.g, cfi.b, true);
         };
      });
      led_box_wrapper[n].addEventListener('mousemove', () => {
         if (over !== true) {
            led_box[n].style.background = `#${hex_input.value}`;
            led_color_array[n] = `0x${hex_input.value}`;
            let cfi = hex_to_rgb(hex_input.value);
            led_box[n].style.color = invert_rgb(cfi.r, cfi.g, cfi.b, true);
         }
      });
      led_box_wrapper[n].addEventListener('mouseleave', () => {
         over = false;
      })
   };

   led_container_wrapper.addEventListener('mouseleave', () => {
      console.log('cursor left led_container_wrapper')
      lmb_held_on_leds = false;
   })

   //? change the grid size to match the selected shape \/
   change_grid_size();

   //? push basic color
   Array.from(led_container.children).forEach(() => {
      led_color_array.push(`0x000000`)
   });

   generate_code(led_count, brightness_level.value, data_pin.value, led_color_array);
};

function generate_code(led_amount, brightness, pin, arr, led_type) {
   if (brightness === undefined) brightness = 255;
   code_final.value = '';
   code_final.value += 
   
`#include <FastLED.h>

const int led_count = ${led_amount};
const int data_pin = ${pin};
const int brightness_level = ${brightness};

CRGB leds[led_count] = {${arr.join(', ')}};

void setup() {\n
   pinMode(data_pin, OUTPUT);\n
   FastLED.addLeds<NEOPIXEL, data_pin>(leds, led_count); /* change the NEOPIXEL to a var later */
   FastLED.show();
   FastLED.setBrightness(brightness_level);
}

void loop() {}`;
};

function update_box(box, color) {
   led_box[box].style.background = color;
};

// ? brightness level slider value
let blsv;
function update_blsv() {
   blsv = brightness_level_slider.value;
   ds(':root').style.setProperty("--brightness_level_slider_color", `rgb(${blsv}, ${blsv}, ${blsv})`);
   brightness_level.value = Number(brightness_level_slider.value);
};
brightness_level_slider.addEventListener('input', update_blsv);
update_blsv();

data_pin.addEventListener('input', () => {
   data_pin.style.width = `calc(${change_input_width(data_pin.value)} + 2ch)`;
});

//? limit inputs to 64
function limitInputs(x) {
   this.value = this.value.replace(/[^0-9]+/g, '').replace(/(\..*?)\..*/g, '$1');
   if (this.value <= 0) {
      this.value = '';
   };
   if (this.value.length > String(x).length) {
      this.value = String(x);
   };
};

for (let n = 0; n < led_number_input.length; n++) {
   led_number_input[n].addEventListener('input', limitInputs, 64);
};

/*
dom_select('#change_all_colors').addEventListener('click', change_all_colors);
function change_all_colors() {
   led_color_array[i] = `#${hex_input.value}`;
   led_box[i].style.background = led_color_array[i];
};
*/

function invert_rgb(_r, _g, _b, concatenate) {
   if (_r === undefined || _g === undefined || _b === undefined) return;
   _r ^= 0xff;
   _g ^= 0xff;
   _b ^= 0xff;
   if (concatenate === true) {
      return `rgb(${_r}, ${_g}, ${_b})`;
   } else {
      return {
         r: _r,
         g: _g,
         b: _b
      };
   };
};

layout_type_check();
change_led_inputs_based_on_layout_type();
for (let n = 0; n < 3; n++) {
   console.warn('%chi, i would be pleased if you\'d give my project a star on github :)', 'font-size: 2rem; font-family: \'montserrat\', sans-serif, sans; background: #000; border-radius: 1rem; padding: 1rem; color: magenta;');
   console.log('\n');
};

let all_inputs = ds_a('input:not(input[type="checkbox"]):not(input[type="radius"]:not(input[type="radio"])');
for (let n = 0; n < all_inputs.length; n++) {
   all_inputs[n].addEventListener('click', () => {
      all_inputs[n].select();
   });
};

let color_change_btns = ds_a('.change_color_button');
for (let n = 0; n < color_change_btns.length; n++) {
   if (color_change_btns[n].checked) {
      color_change_btns[n].parentNode.style.background = 'rgb(91, 197, 79)'
   } else {
      color_change_btns[n].parentNode.style.background = 'rgb(255, 0, 0)'
   };
   color_change_btns[n].parentNode.addEventListener('click', () => {
      if (color_change_btns[n].checked) {
         color_change_btns[n].parentNode.style.background = 'rgb(255, 0, 0)';
         color_change_btns[n].checked = false;
      } else {
         color_change_btns[n].parentNode.style.background = 'rgb(91, 197, 79)';
         color_change_btns[n].checked = true;
      };
   });
};


function on_resize() {
   ds('.settings_page:nth-of-type(2)').style.width = get_style(ds('.settings_page:nth-of-type(1)'), 'width');
}
window.addEventListener('resize', on_resize);
on_resize();