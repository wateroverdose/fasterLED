// ? i made this in 2 minutes, maybe it's not the best way to do it, so update this later ~ 20/06/22
// ? dom_select
// function dom_select(str, forced_nodelist, forced_node) {
//    if (str === undefined) return undefined;
//    if (forced_node && forced_nodelist) return undefined;
//    let is_nodelist = false;
//    if (forced_node) return document.querySelector(str);
//    if (forced_nodelist) return document.querySelectorAll(str);
//    if (str.match(/[.]/) !== null) str.match(/[.]/).length !== null ? is_nodelist = true : is_nodelist = false;
//    if (is_nodelist) {return document.querySelectorAll(str);} else {return document.querySelector(str);};
// };

// ? dom_select
function ds(dom_node) {
   if (dom_node === undefined) {return undefined} else {return document.querySelector(dom_node)};
}

// ? dom_select_all
function ds_a(dom_node) {
   if (dom_node === undefined) {return undefined} else {return document.querySelectorAll(dom_node)};
}

// TODO actually make this function good ~ 11/06/22
function rem_px_conv(value, type, is_postfix_present) {
   if (value === undefined || type === undefined || is_postfix_present === undefined) return undefined;
   let val;
   if (type === true) {
      if (is_postfix_present === true) {
         val = value.replace('px', '') / parseFloat(getComputedStyle(document.documentElement).fontSize)/* + 'rem'*/;
      } else {
         return value / parseFloat(getComputedStyle(document.documentElement).fontSize)/* + 'rem'*/;
      };
   } else {
      if (is_postfix_present === true) {
         return (value.replace('rem', '') * parseFloat(getComputedStyle(document.documentElement).fontSize))/* + 'px'*/;
      } else {
         return value * parseFloat(getComputedStyle(document.documentElement).fontSize)/* + 'px'*/;
      };
   };
};

function set_cookie(id, val) {
   let _date = new Date();
   _date.setTime(_date.getTime() + 31556926); // ? store cookie for 1 year
   document.cookie = `${id}=${val};exipers=${_date.toUTCString()}`;
};

function get_cookie(id) {
   var keyValue = document.cookie.match('(^|;) ?' + id + '=([^;]*)(;|$)');
   return keyValue ? keyValue[2] : null;
};