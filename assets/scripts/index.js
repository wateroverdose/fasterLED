let selected_layout_type = 0,
    led_count = 0,
    led_box = ds_a('.led_box'),
    led_box_wrapper = ds_a('.led_box_wrapper'),
    code_final = ds('#code_final');

const layout_type_radio = ds_a('input[name="layout_type"]'),
      num_input = ds_a('.led_number_input'),
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
      bg_worker = new Worker('worker.js'),
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
const settings_1 = ds('.settings_page:nth-of-type(1)'),
      settings_2 = ds('.settings_page:nth-of-type(2)');
function hide_clock_pin_input(ch_wid) {
   const cps = ds('#clock_pin_selection');
   if (led_chipset.value === 'APA102' || led_chipset.value === 'WS2801' || led_chipset.value === 'LPD8806' || led_chipset.value === 'P9813' || led_chipset.value === 'SM16716') {
      if (ch_wid) {
         if (include_clock_pin !== true) {
            settings_2.style.width = `calc(${get_style(settings_2, 'width')} + 4rem)`;
         }
      }
      include_clock_pin = true;
      cps.style.display = 'flex';
   } else {
      if (ch_wid) {
         if (include_clock_pin) {
            settings_2.style.width = `calc(${get_style(settings_2, 'width')} - 4rem)`;
         }
      }
      include_clock_pin = false;
      cps.style.display = 'none';
   };
   settings_1.style.width = get_style(settings_2, 'width');
}
ds('#led_chipset').addEventListener('change', hide_clock_pin_input.bind(null, true));
hide_clock_pin_input(false);

const conf_input = ds('#conf_input');
function load_json_conf(input) {
   let text = new FileReader();
   text.readAsText(input.files[0])
   text.addEventListener('load', () => {
      console.log(text.result);
      let _json = JSON.parse(text.result);
      console.log(_json);
      for (let n = 0; n < _json.length; n++) {
         for (let m = 0; m < _json[n].length; m++) {
            app[n][m] = _json[n][m];
         }
      }
      data_pin.value = settings[2];
      clock_pin.value = settings[3];
      brightness_level.value = settings[4];
      led_chipset.value = settings[5];
      order[0].value = settings[6].substring(0, 1);
      order[1].value = settings[6].substring(1, 2);
      order[2].value = settings[6].substring(2, 3);

      blsv = settings[4];
      update_blsv();
      brightness_level.value = settings[4];
      brightness_level_slider.value = settings[4];

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
   save_settings();
   dl_json(ds('#save_as_json'), `fasterLED_${random_str}.json`, app);
});

regen_code.addEventListener('click', () => {
   save_settings();
   generate_code(led_count, settings[4], settings[2], led_color_array, settings[5], settings[6], settings[3]);
});

num_input[0].addEventListener('input', () => {
   if (selected_layout_type) num_input[1].value = num_input[0].value;
});

num_input[1].addEventListener('input', () => {
   if (selected_layout_type) num_input[0].value = num_input[1].value;
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
         num_input[0].value = '1';
         num_input[1].value = '80';
         num_input[1].select();
         break;
      case 1:
         num_input[0].value = '8';
         num_input[1].value = '8';
         num_input[1].select();
         break;
      case 2:
         num_input[0].value = '16';
         num_input[1].value = '8';
         num_input[0].select();
         break;
      default:
         selected_layout_type = 2;
         update_led_inputs_based_on_layout_type();
         break;
   }
}

//? change grid size accordingly to entered number \/
function change_grid_size() {
   led_container.style.gridTemplateRows = `repeat(${settings[0]}, 1fr)`;
   led_container.style.gridTemplateColumns = `repeat(${settings[1]}, 1fr)`;
}

submit_button.addEventListener('click', start);

const order = ds_a('.rgb_order');
function save_settings() {
   settings[0] = num_input[0].value;
   settings[1] = num_input[1].value;
   settings[2] = data_pin.value;
   settings[3] = clock_pin.value;
   settings[4] = brightness_level.value;
   settings[5] = led_chipset.value;
   settings[6] = `${order[0].value}${order[1].value}${order[2].value}`;
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
   settings_2.style.borderRadius = 'calc(var(--radius) * 2)';
   settings_1.style.display = 'none';
   
   let led_box_width = get_style(led_box[0], 'width', true, false),
       led_box_border = get_style(led_box[0], 'border-width', true, false),
       led_container_margin = get_style(led_container, 'margin', true, false);

   led_container_wrapper.style.height = `${((Number(settings[0]) + .75) * led_box_width) + (Number(settings[0]) * led_box_border) + (Number(led_container_margin) * 2)}rem`;
   led_container_wrapper.style.width = `${((Number(settings[1]) + .75) * led_box_width) + (Number(settings[1]) * led_box_border) + (Number(led_container_margin) * 2)}rem`;
   code_box.style.display = 'block';
}

function write_led_boxes(json) {
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
      led_box_wrapper[n].addEventListener('mouseenter', () => {if (lmb_held_on_leds) brush(n)});
      led_box_wrapper[n].addEventListener('mousedown', brush.bind(null, n));
   }

   function brush(n) {
      if (brush_enabled) {
         update_box(n, hex_input.value)
         const cfi = hex_to_rgb(hex_input.value.substring(1, 7));
         led_box[n].style.color = get_bg_color(cfi.r, cfi.g, cfi.b);
      } else {
         update_box(n, '#000000');
         led_box[n].style.color = '#fff';
      }

   }

   led_container_wrapper.addEventListener('mouseleave', () => {
      lmb_held_on_leds = false;
   })

   //? change the grid size to match the selected shape \/
   change_grid_size();

   //? push basic color
   if (!json) {
      Array.from(led_container.children).forEach(() => {
         led_color_array.push(`0x000000`);
      });
   } else {
      for (let n = 0; n < led_count.length; n++) {
         update_box(n, `#${led_color_array[n].substring(2, 8)}`);
      }
   }

   generate_code(led_count, settings[4], settings[2], led_color_array, settings[5], settings[6], settings[3]);
   on_resize();
}

function generate_code(led_amount, brightness, pin, arr, led_type, rgb_order, clock_pin) {
   let err = '';
   if (brightness === undefined || !isNaN(brightness)) brightness = 255;
   if (pin === undefined) err += 'data pin is undefined\n';
   if (led_amount === undefined) err += 'amount of LED\'s is undefined\n';
   if (arr === undefined) err += 'LED array is undefined\n';
   if (led_type === undefined) err += 'LED chipset is undefined';
   if (rgb_order === undefined) rgb_order = 'RGB';

   if (err !== '') {throw err}
   console.log('starting the engines 😎😎');
   console.table(led_color_array);

   code_final.textContent = '';
   code_final.textContent += 
   
`#include <FastLED.h>

#define LED_AMOUNT ${led_amount}
#define DATA_PIN ${pin}`;

   if (include_clock_pin) code_final.textContent += 
`
#define CLOCK_PIN ${clock_pin}`;

   code_final.textContent +=
`
#define LED_CHIPSET ${led_type}
#define RGB_ORDER ${rgb_order}

int brightness_level = ${brightness};

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
   led_color_array[box] = `0x${color.substring(1, 7)}`;
}

// ? brightness level slider value
let blsv = brightness_level_slider.value;
function update_blsv() {
   ds(':root').style.setProperty("--brightness_level_slider_color", `rgb(${Math.round(blsv * 2.55)}, ${Math.round(blsv * 2.55)}, ${Math.round(blsv * 2.55)})`);
}
brightness_level_slider.addEventListener('input', () => {
   blsv = Number(brightness_level_slider.value);
   update_blsv();
   brightness_level.value = Number(blsv);
});

brightness_level.addEventListener('input', () => {
   blsv = Number(brightness_level.value);
   update_blsv();
   brightness_level_slider.value = brightness_level.value;
});
update_blsv();

data_pin.addEventListener('input', () => {
   data_pin.style.width = `calc(${get_input_width(data_pin.value, 2)}ch + 2ch)`;
});

ds('#change_all_colors').addEventListener('click', () => {
   const x = hex_to_rgb(hex_input.value.substring(1, 7));
   for (let n = 0; n < led_count; n++) {
      update_box(n, hex_input.value);
      led_box[n].style.color = get_bg_color(x.r, x.g, x.b);
   }
});

update_led_inputs_based_on_layout_type();

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

let is_dark = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? true : false;

let _ts = ds_a('[name="tool_select"]'), brush_enabled = true;
function check_ts() {
   if (_ts[3].checked) {
      _ts[2].style.outline = '2px solid rgb(255, 0, 160)';
      _ts[0].style.outline = 'none';
      brush_enabled = false;
   } else {
      _ts[0].style.outline = '2px solid rgb(255, 0, 160)';
      _ts[2].style.outline = 'none';
      brush_enabled = true;
   }
}
for (let n = 0; n < _ts.length; n++) {
   _ts[n].addEventListener('click', check_ts);
}

function on_resize() {
   settings_2.style.width = get_style(settings_1, 'width');
   for (let n = 0; n < question_wrapper.length; n++) qm_box[n] = question_wrapper[n].getBoundingClientRect();
}

window.addEventListener('resize', on_resize);
on_resize();