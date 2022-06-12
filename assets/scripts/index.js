// ⚠ WARNING ⚠
// THIS CODE WILL GIVE YOU BRAIN DAMAGE

// WRITTEN BY purplishflame (https://github.com/purplishflame)

let box_array = [],
    matrixMode = false,
    selected_layout_type = 'strip',
    led_count = 0,
    current_box = document.querySelector('#current_box'),
    led_box,
    data_pin;

const layout_type_radio = document.querySelectorAll('input[name="layout_type"]'),
      led_number = document.querySelector('#led_number'),
      led_number_a = document.querySelector('#led_number_A'),
      led_number_b = document.querySelector('#led_number_B'),
      led_number_input = document.querySelectorAll('.led_number_input'),
      led_input_box = document.querySelector('#led_input_box'),
      led_matrix = document.querySelector('#led_matrix'),
      color_value_inputs = document.querySelectorAll('.color_number_input'),
      brightness_level_slider = document.querySelector('#brightness_level_slider'),
      code_box = document.querySelector('code'),
      code_final = document.querySelector('#code_final'),
      submit_color_button = document.querySelector('#submit_color'),
      led_matrix_wrapper = document.querySelector('#led_matrix_wrapper'),
      submit_button = document.querySelector('#submit_button');

function layout_type_check() {
   for (let i = 0; i < layout_type_radio.length; i++) {
      layout_type_radio[i].addEventListener('change', () => {
         selected_layout_type = layout_type_radio[i].value;
         console.warn(`selected layout type: ${selected_layout_type}`);
         change_led_inputs_based_on_layout_type()
      })
   }
}

function change_led_inputs_based_on_layout_type() {
   switch (selected_layout_type) {
      case 'strip':
         led_number_a.parentNode.style.display = 'inline-block';
         led_number_a.value = '1';
         led_number_b.parentNode.style.display = 'inline-block';
         led_number_b.value = '80';
         led_number.parentNode.style.display = 'none';
         led_number_b.select();
         matrixMode = false;
         break;
      case 'matrix':
         led_number_a.parentNode.style.display = 'none';
         led_number_b.parentNode.style.display = 'none';
         led_number.parentNode.style.display = 'inline-block';
         led_number.value = '8';
         led_number.select();
         matrixMode = true;
         break;
      case 'custom':
         led_number.parentNode.style.display = 'none';
         led_number_a.parentNode.style.display = 'inline-block';
         led_number_b.parentNode.style.display = 'inline-block';
         led_number_a.value = '32';
         led_number_b.value = '16';
         led_number_a.select();
         break;
      default:
         selected_layout_type = 'custom';
         break;
   }
   console.log(`mm: ${matrixMode}, ${led_number_a.value}, ${led_number_b.value}, ${led_number.value}`);
}

//? change grid size accordingly to entered number \/
function change_grid_size(isRect) {
   if (isRect === true) {
      led_matrix.style.gridTemplateRows = `repeat(${led_number.value}, 1fr)`; /*this cut kinda fresh fr fr*/
      led_matrix.style.gridTemplateColumns = `repeat(${led_number.value}, 1fr)`;
   } else {
      led_matrix.style.gridTemplateRows = `repeat(${led_number_a.value}, 1fr)`;
      led_matrix.style.gridTemplateColumns = `repeat(${led_number_b.value}, 1fr)`;
   }
}

function create_item(name, type) {
   if (type === undefined) {
      type = 'div';
   }
   let item = document.createElement(type);
   item.classList.add(name);
   return item;
}

function get_style(element, style, convPxToRem, addRemPostfix) {
   if (element === undefined || style === undefined) return undefined;
   let x = window.getComputedStyle(element).getPropertyValue(style);
   if (convPxToRem === true) {
      x = rem_px_conv(x, true);
      if (addRemPostfix === true) x += 'rem';
   }
   return x;
}

submit_button.addEventListener('click', submitNumber);

function submitNumber() {
   //? set the enterednumber \/
   matrixMode === true ? led_count = led_number.value * led_number.value : led_count = led_number_a.value * led_number_b.value;

   //? if user does a little bit of trolling, stop the function \/
   if (led_count == 0) return;

   led_input_box.style.display = 'none';
   write_led_boxes();
   led_matrix_wrapper.style.display = 'flex';
   
   const led_matrix_padding = get_style(led_matrix, 'padding', true, false);
         led_matrix_gap = get_style(led_matrix, 'gap', true, false);
   
   const test_wrapper = document.querySelector('#testWrapper');

   if (matrixMode === true) {
      test_wrapper.style.height = `${(led_number.value * 2) + (led_matrix_padding) + (led_matrix_gap * led_number.value)}rem`;
      test_wrapper.style.width = test_wrapper.style.height;
   } else {
      test_wrapper.style.height = `${(led_number_b.value) + (led_matrix_padding) + (led_matrix_gap * led_number_a.value)}rem`;
      test_wrapper.style.width = `${(led_number_b.value) + (led_matrix_padding) + (led_matrix_gap * led_number_a.value)}rem`;
   }
   code_box.style.display = 'block';
}

function write_led_boxes() {
   //? create boxes \/
   for (let i = 1; i <= led_count; i++) {
      led_matrix.appendChild(create_item('led_box_wrapper')).appendChild(create_item('led_box')).innerHTML = i;
   }

   //? change the grid size to match the selected shape \/
   change_grid_size(matrixMode);

   let include_clock_pin = false; /* for animation, wip */

   //? update the textarea with code \/
   code_final.innerHTML = `const int data_pin = ${data_pin};\n
                           const int led_count = ${led_count};\n
                           CRGB leds[led_count];\n

                           void setup() {\n
                              pinMode(data_pin, OUTPUT);\n
                              }\n
                           \n
                           void loop() {\n
                              for (int i = 0; i < led_count; i++) {\n
                                 leds[i] = strtol(${box_array[1]});\n`

   for (let i = 0; i <= led_count - 1; i++) {
      code_final.innerHTML += (`leds[${i}] = ${i}\n`);
   }

   //? push basic color
   Array.from(led_matrix.children).forEach(() => {
      box_array.push(`#ffffff`)
   })

   //? update ledbox \/
   led_box = document.querySelectorAll('.led_box');

   function update_led_colors() {
      if (current_box.innerHTML = led_box[current_box].innerHTML) {
         led_box[current_box].style.background = box_array[current_box]
      }
   }

   //? add event listeners to all leds to get the current led and update the value \/
   for (let i = 0; i < led_box.length; i++) {
      led_box[i].addEventListener('click', () => {
         //? update currentBox with current box (duh) \/
         current_box = i;
         current_box.innerHTML = current_box + 1;
         //? change #verycoolmeter to the current box number + 1 (to avoid confusion) /\
      })
   }
   //? add event listeners to the submitcolor button to update led colors \/
   submit_color_button.addEventListener('click', () => {
      if (current_box === undefined) return
      //? change the boxarray entry \/
      box_array[current_box] = '#' + hex_input.value;
      //? log it too \/
      console.log(box_array[current_box]);
      //? aaaaand update the color \/
      update_led_colors()
   })
}

// ? brightness level slider value
let blsv;
function update_blsv() {
   blsv = brightness_level_slider.value * 2.5;
   document.querySelector(':root').style.setProperty("--brightness_level_slider_color", `rgb(${blsv}, ${blsv}, ${blsv})`);
}
brightness_level_slider.addEventListener('input', update_blsv);
update_blsv();

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

for (let i = 0; i < led_number_input.length; i++) {
   led_number_input[i].addEventListener('input', limitInputs, '64')
   led_number_input[i].addEventListener('input', () => {
      if (led_number_a === led_number_b) {
         matrixMode = true;
         led_number = led_number_a;
      } else {
         matrixMode = false;
      }
   })
}

function changeAllColors() {
   console.log('test');
   box_array[i] = `#${hex_input.value}`;
   led_box[i].style.background = box_array[i];
}

function updateBox(box, color) {
   led_box[box].style.background = color;
}

const debouncedChangeAllColors = debounce(changeAllColors, 10)

document.querySelector('#change_all_colors').addEventListener('click', changeAllColors);

layout_type_check();
change_led_inputs_based_on_layout_type();
for (let i = 0; i < 3; i++) {
   console.warn('%chi, i would be pleased if you\'d give my project a star on github :)', 'font-size: 2rem; font-family: \'montserrat\', sans-serif, sans; background: #000; border-radius: 1rem; padding: 1rem; color: magenta;');
   console.log('\n')
}

let allInputs = document.querySelectorAll('input:not(input[type="checkbox"]):not(input[type="radius"]:not(input[type="radio"])');
for (let i = 0; i < allInputs.length; i++) {
   allInputs[i].addEventListener('click', () => {
      allInputs[i].select()
   })
}

let changingColorButtons = document.querySelectorAll('.change_color_button');
for (let i = 0; i < changingColorButtons.length; i++) {
   if (changingColorButtons[i].checked === true) {
      changingColorButtons[i].parentNode.style.background = 'rgb(91, 197, 79)'
   } else {
      changingColorButtons[i].parentNode.style.background = 'rgb(255, 0, 0)'
   }
   changingColorButtons[i].parentNode.addEventListener('click', () => {
      if (changingColorButtons[i].checked === true) {
         changingColorButtons[i].parentNode.style.background = 'rgb(255, 0, 0)';
         changingColorButtons[i].checked = false
      } else {
         changingColorButtons[i].parentNode.style.background = 'rgb(91, 197, 79)';
         changingColorButtons[i].checked = true
      }
   })
}


function on_resize() {
   document.querySelector('#settings_p2').style.width = get_style(document.querySelector('#settings_p1'), 'width');
}
window.addEventListener('resize', on_resize);
on_resize();

// window.onbeforeunload = function() {return 'you will lose all of your leds because im too lazy to code a save system'};

// document.addEventListener('DOMContentLoaded', startup);