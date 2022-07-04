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
      led_chipset = ds('#led_chipset'),
      question_wrapper = ds_a('.question_wrapper'),
      app = [led_color_array = [], settings = []];

const random_str = random_string(8);

const save_ino = ds('#save_ino_file');
ds('#save_ino_file > button').addEventListener('click', () => {
   save_ino.download = `fasterLED_${random_str}.ino`;
   save_ino.href = URL.createObjectURL(new Blob([code_final.innerText]));
})

ds('#copy_contents').addEventListener('click', () => {
   navigator.clipboard.writeText(code_final.innerText);
})

let include_clock_pin = false;
function hide_clock_pin_input(ch_wid) {
   const cps = ds('#clock_pin_selection');
   if (led_chipset.value === 'APA102' || led_chipset.value === 'WS2801' || led_chipset.value === 'LPD8806' || led_chipset.value === 'P9813' || led_chipset.value === 'SM16716') 
   {
      if (ch_wid) {
         if (include_clock_pin !== true) {
            ds('.settings_page:nth-of-type(2)').style.width = `calc(${get_style(ds('.settings_page:nth-of-type(2)'), 'width')} + 4rem)`;
         }
      }
      include_clock_pin = true;
      cps.style.display = 'flex';
   } else {
      if (ch_wid) {
         if (include_clock_pin) {
            ds('.settings_page:nth-of-type(2)').style.width = `calc(${get_style(ds('.settings_page:nth-of-type(2)'), 'width')} - 4rem)`;
         }
      }
      include_clock_pin = false;
      cps.style.display = 'none';
   };
   ds('.settings_page:nth-of-type(1)').style.width = get_style(ds('.settings_page:nth-of-type(2)'), 'width');
}
ds('#led_chipset').addEventListener('change', hide_clock_pin_input.bind(null, true));
hide_clock_pin_input(false);

const conf_input = ds('#conf_input');
function load_json_conf(input) {
   let text = new FileReader();
   text.readAsText(input.files[0])
   text.addEventListener('load', () => {
      console.log(text.result);
      let json = JSON.parse(text.result);
      console.log(json);
      for (let n = 0; n < json.length; n++) {
         for (let m = 0; m < json[n].length; m++) {
            app[n][m] = json[n][m];
         }
      }
      submit_number();
      write_led_boxes(true);
      for (let n = 0; n < app[0].length; n++) {
         update_box(n, `#${app[0][n].substr(2, 8)}`);
      }
   });
   input.remove();
}

ds('#upload_conf > button').addEventListener('click', () => {
   spawn_file_input();
   const x = ds('#json_file_input');
   x.click();
   x.addEventListener('change', () => {
      load_json_conf(x);
   });
});

function spawn_file_input() {
   let el = create_dom_node('input', 'json_file_input');
   el.setAttribute('type', 'file');
   el.setAttribute('accept', 'application/json');
   el.style.display = 'none';
   return document.body.appendChild(el);
}

const question_mark_bubble = ds('#question_mark_bubble');
let qm_box = [];

function move_qm_bubble() {
   question_mark_bubble.style.left = `calc(${(qm_box[0].width / 2) + cursor_x}px - 13.5rem/2)`;
   question_mark_bubble.style.top = `calc(${qm_box[0].top}px - (${question_mark_bubble.getBoundingClientRect().height}px)`;
}

function question_mark_bubble_popup() {
   question_mark_bubble.style.display = 'block';
   window.addEventListener('mousemove', move_qm_bubble);
}

for (let n = 0; n < question_wrapper.length; n++) {
   qm_box[n] = question_wrapper[n].getBoundingClientRect();
   question_wrapper[n].addEventListener('mouseover', question_mark_bubble_popup);
   question_wrapper[n].addEventListener('mouseleave', () => {
      window.removeEventListener('mousemove', move_qm_bubble);
      question_mark_bubble.style.display = 'none';
   });
}

ds('#rgb_order_label > span.question_wrapper').addEventListener('mouseover', () => {
   question_mark_bubble.innerHTML = 'some LED chipsets might use different color orders than RGB. try making a test pattern with red, green and blue, then adjust this setting accordingly';
});

function dl_json(dom_node, filename, val) {
   dom_node.download = `${filename}`;
   dom_node.href = URL.createObjectURL(new Blob([JSON.stringify(val)]));
}

function random_string(len) {
   let result = '';
   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
   for (let n = 0; n < len; n++) result += chars.charAt(Math.round(Math.random() * chars.length));
   return result;
}

ds('#save_as_json').addEventListener('click', () => {
   dl_json(ds('#save_as_json'), `fasterLED_${random_str}.json`, app);
});

let code_gen_count = 0;
function make_code_gen_unavailable(seconds) {
   let interval;
   if (code_gen_count === 0) {
      console.log('start the engines!!! 😎😎');
      regen_code.style.animationPlayState = 'running';
      interval = setInterval(update, seconds * 1000);
      code_gen_count++;
   }
   function update() {
      regen_code.style.animationPlayState = 'paused';
      console.log(`${seconds} seconds passed! removing the interval`);
      code_gen_count = 0;
      clearInterval(interval);
   }
}

regen_code.addEventListener('click', () => {
   save_settings();
   console.table(led_color_array);
   generate_code(led_count, settings[4], settings[2], led_color_array, settings[5]);
   make_code_gen_unavailable(get_style(regen_code, 'animation-duration', false, false).substring(0, 3));
});

led_number_a.addEventListener('input', () => {
   if (selected_layout_type) led_number_b.value = led_number_a.value;
});

led_number_b.addEventListener('input', () => {
   if (selected_layout_type) led_number_a.value = led_number_b.value;
});

function layout_type_check(n) {
   selected_layout_type = n;
   console.warn(`selected layout type: ${selected_layout_type}`);
   update_led_inputs_based_on_layout_type();
}

for (let n = 0; n < layout_type_radio.length; n++) {
   layout_type_radio[n].addEventListener('change', () => {
      layout_type_check(n);
   });
}

function update_led_inputs_based_on_layout_type() {
   switch (selected_layout_type) {
      case 0:
         led_number_a.value = '1';
         led_number_b.value = '80';
         led_number_b.select();
         break;
      case 1:
         led_number_a.value = '8';
         led_number_b.value = '8';
         led_number_b.select();
         break;
      case 2:
         led_number_a.value = '16';
         led_number_b.value = '8';
         led_number_a.select();
         break;
      default:
         selected_layout_type = 2;
         update_led_inputs_based_on_layout_type();
         break;
   }
   console.log(`${led_number_a.value}, ${led_number_b.value}`);
}

//? change grid size accordingly to entered number \/
function change_grid_size() {
   led_container.style.gridTemplateRows = `repeat(${settings[0]}, 1fr)`;
   led_container.style.gridTemplateColumns = `repeat(${settings[1]}, 1fr)`;
}

submit_button.addEventListener('click', start);

function save_settings() {
   settings[0] = led_number_a.value;
   settings[1] = led_number_b.value;
   settings[2] = data_pin.value;
   settings[3] = clock_pin.value;
   settings[4] = brightness_level.value;
   settings[5] = led_chipset.value;
}

function start() {
   save_settings();
   submit_number();
   write_led_boxes(false);
}

function submit_number() {
   //? set the enterednumber \/
   led_count = settings[0] * settings[1];

   //? if user does a little bit of trolling, stop the function \/
   if (led_count === 0) return;

   led_input_box.style.display = 'none';
   leds.style.display = 'flex';
   ds('.settings_page:nth-of-type(2)').style.borderRadius = 'calc(var(--radius) * 2)';
   ds('.settings_page:nth-of-type(1)').style.display = 'none';
   
   let led_box_width = get_style(led_box[0], 'width', true, false),
       led_box_border = get_style(led_box[0], 'border-width', true, false),
       led_container_margin = get_style(led_container, 'margin', true, false);

   led_container_wrapper.style.height = `${((Number(settings[0]) + .75) * led_box_width) + (Number(settings[0]) * led_box_border) + (Number(led_container_margin) * 2)}rem`;
   led_container_wrapper.style.width = `${((Number(settings[1]) + .75) * led_box_width) + (Number(settings[1]) * led_box_border) + (Number(led_container_margin) * 2)}rem`;
   code_box.style.display = 'block';
}

function write_led_boxes(json) {
   let brush_smme = false;
   let lmb_held_on_leds = false;
   led_container.addEventListener('mousedown', () => {lmb_held_on_leds = true;});
   led_container.addEventListener('mouseup', () => {lmb_held_on_leds = false;});

   //? create boxes \/
   for (let n = 1; n <= led_count; n++) {
      led_container.appendChild(create_dom_node('div', undefined, 'led_box_wrapper')).appendChild(create_dom_node('div', undefined, 'led_box')).innerHTML = n;
   }
   led_box = ds_a('.led_box');
   led_box_wrapper = ds_a('.led_box_wrapper');

   for (let n = 0; n < led_box.length; n++) {
      led_box_wrapper[n].addEventListener('mouseenter', () => {
         if (lmb_held_on_leds && brush_smme) {
            brush_smme = false;
            brush(n);
         }
      });
      led_box_wrapper[n].addEventListener('mousemove', () => {
         if (brush_smme === false && lmb_held_on_leds) {
            brush_smme = true;
            brush(n);
         };
      });
      led_box_wrapper[n].addEventListener('click', () => {
         brush(n);
      });
   }

   function brush(n) {
      led_box[n].style.background = hex_input.value;
      led_color_array[n] = `0x${hex_input.value.substring(1, 7)}`;
      const cfi = hex_to_rgb(hex_input.value.substring(1, 7));
      led_box[n].style.color = get_bg_color(cfi.r, cfi.g, cfi.b);
   }

   led_container_wrapper.addEventListener('mouseleave', () => {
      lmb_held_on_leds = false;
   })

   //? change the grid size to match the selected shape \/
   change_grid_size();

   //? push basic color
   if (json !== true) {
      Array.from(led_container.children).forEach(() => {
         led_color_array.push(`0x000000`);
      });
   } else {
      for (let n = 0; n < led_count.length; n++) {
         update_box(n, `#${led_color_array[n].substring(2, 8)}`);
      }
   }

   generate_code(led_count, settings[4], settings[2], led_color_array, settings[5]);
}

function generate_code(led_amount, brightness, pin, arr, led_type, rgb_order, clock_pin) {
   let err = '';
   if (brightness === undefined) brightness = 255;
   if (pin === undefined) err += 'data pin is undefined\n';
   if (led_amount === undefined) err += 'amount of LED\'s is undefined\n';
   if (arr === undefined) err += 'LED array is undefined\n';
   if (led_type === undefined) err += 'LED chipset is undefined\n';
   if (rgb_order === undefined) rgb_order = 'RGB';

   if (err !== '') {throw err}

   code_final.textContent = '';
   code_final.textContent += 
   
`#include <FastLED.h>

#define LED_AMOUNT ${led_amount}
#define DATA_PIN ${pin}
#define CLOCK_PIN ${clock_pin}
#define LED_CHIPSET ${led_type}
#define RGB_ORDER ${rgb_order}
#define brightness_level ${brightness}

CRGB leds[LED_AMOUNT] = {${arr.join(', ')}};

void setup() {
   pinMode(DATA_PIN, OUTPUT);
   FastLED.addLeds<LED_CHIPSET, DATA_PIN, RGB_ORDER>(leds, LED_AMOUNT);
   FastLED.setBrightness(brightness_level);
   FastLED.show();
}

void loop() {}`;
}

function update_box(box, color) {
   led_box[box].style.background = color;
}

// ? brightness level slider value
let blsv;
function update_blsv() {
   blsv = brightness_level_slider.value;
   ds(':root').style.setProperty("--brightness_level_slider_color", `rgb(${blsv}, ${blsv}, ${blsv})`);
   brightness_level.value = Number(brightness_level_slider.value);
}
brightness_level_slider.addEventListener('input', update_blsv);
update_blsv();

data_pin.addEventListener('input', () => {
   data_pin.style.width = `calc(${get_input_width(data_pin.value, 2)}ch + 2ch)`;
});

//? limit inputs to 64
function limit_inputs(x) {
   this.value = this.value.replace(/[^0-9]+/g, '').replace(/(\..*?)\..*/g, '$1');
   if (this.value <= 0) {
      this.value = '';
   }
   if (this.value.length > String(x).length) {
      this.value = String(x);
   }
}

for (let n = 0; n < led_number_input.length; n++) {
   led_number_input[n].addEventListener('input', limit_inputs, 64);
}

ds('#change_all_colors').addEventListener('click', () => {
   const x = hex_to_rgb(hex_input.value.substring(1, 7));
   for (let n = 0; n < led_count; n++) {
      update_box(n, hex_input.value);
      led_box[n].style.color = get_bg_color(x.r, x.g, x.b);
   }
});

update_led_inputs_based_on_layout_type();

let all_inputs = ds_a('input:not(input[type="checkbox"]):not(input[type="radius"]:not(input[type="radio"])');
for (let n = 0; n < all_inputs.length; n++) {
   all_inputs[n].addEventListener('click', () => {
      all_inputs[n].select();
   });
}

let color_change_btns = ds_a('.change_color_button');
for (let n = 0; n < color_change_btns.length; n++) {
   if (color_change_btns[n].checked) {
      color_change_btns[n].parentNode.style.background = 'rgb(91, 197, 79)'
   } else {
      color_change_btns[n].parentNode.style.background = 'rgb(255, 0, 0)'
   }
   color_change_btns[n].parentNode.addEventListener('click', () => {
      if (color_change_btns[n].checked) {
         color_change_btns[n].parentNode.style.background = 'rgb(255, 0, 0)';
         color_change_btns[n].checked = false;
      } else {
         color_change_btns[n].parentNode.style.background = 'rgb(91, 197, 79)';
         color_change_btns[n].checked = true;
      }
   });
}

function get_bg_color(r, g, b) {
   return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 150) ? '#000' : '#fff';
}


function on_resize() {
   ds('.settings_page:nth-of-type(2)').style.width = get_style(ds('.settings_page:nth-of-type(1)'), 'width');
   for (let n = 0; n < question_wrapper.length; n++) qm_box[n] = question_wrapper[n].getBoundingClientRect();
}
window.addEventListener('resize', on_resize);
on_resize();