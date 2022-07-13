// ? i made this in 2 minutes, maybe it's not the best way to do it, so update this later ~ 20/06/22
// ? dom_select
// function dom_select(str, forced_nodelist, forced_node) {
//    if (str === undefined) return undefined;
//    if (forced_node && forced_nodelist) return undefined;
//    let is_nodelist = false;
//    if (forced_node) return document.querySelector(str);
//    if (forced_nodelist) return document.querySelectorAll(str);
//    if (str.match(/[.]/) !== null) str.match(/[.]/).length !== null ? is_nodelist = true : is_nodelist = false;
//    if (is_nodelist) {return document.querySelectorAll(str);} else {return document.querySelector(str);}
// }

// ? domnode_select
function ds(dom_node) {
   if (dom_node === undefined) {return undefined} else {return document.querySelector(dom_node)};
}

// ? domnode_select_all
function ds_a(dom_node) {
   if (dom_node === undefined) {return undefined} else {return document.querySelectorAll(dom_node)};
}

// TODO actually make this function good ~ 11/06/22
function rem_px_conv(value, type, postfix_present) {
   // ? set type as true if you want to convert to rem, false if you want to convert to px
   if (value === undefined || type === undefined || postfix_present === undefined) return undefined;
   if (type) {
      if (postfix_present) {
         val = value.replace('px', '') / parseFloat(getComputedStyle(document.documentElement).fontSize)/* + 'rem'*/;
      } else {
         return value / parseFloat(getComputedStyle(document.documentElement).fontSize)/* + 'rem'*/;
      }
   } else {
      if (postfix_present) {
         return (value.replace('rem', '') * parseFloat(getComputedStyle(document.documentElement).fontSize))/* + 'px'*/;
      } else {
         return value * parseFloat(getComputedStyle(document.documentElement).fontSize)/* + 'px'*/;
      }
   }
}

function set_cookie(id, val) {
   let _date = new Date();
   _date.setTime(_date.getTime() + 31556926); // ? store cookie for 1 year
   document.cookie += `${id}=${val}; `;
}

function get_cookie(id) {
   var keyValue = document.cookie.match('(^|;) ?' + id + '=([^;]*)(;|$)');
   return keyValue ? keyValue[2] : null;
}

function create_dom_node(type, id, _class) {
   if (type === undefined) type = 'div';
   let node = document.createElement(type);
   if (id === undefined && _class !== undefined) {
      node.classList.add(_class);
   } else if (_class === undefined && id !== undefined) {
      node.setAttribute('id', id);
   } else if (id !== undefined && _class !== undefined) {
      node.setAttribute('id', id);
      node.classList.add(_class);
   } else {
      return undefined;
   }
   return node;
}

function get_style(element, style, conv_px_to_rem, add_rem_postfix) {
   if (element === undefined || style === undefined) return undefined;
   let x = window.getComputedStyle(element).getPropertyValue(style);
   if (conv_px_to_rem) {
      x = rem_px_conv(x, true, true);
      if (add_rem_postfix) x += 'rem';
   }
   return x;
}

function get_input_width(obj, max) {
   if (max === undefined) return;
   if (obj.length >= max) return max;
   for (let n = 1; n < max; n++) if (obj.length === max - n) return max - n;
   if (obj.length === 1) return 1;
}