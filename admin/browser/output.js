/**
 * 
 * @param {String} message - Text to display on output  
 * @param {Boolean} fail - Displays red text if true
 */
function output(message, fail) {
  const now = new Date();

  if (fail) {
    $("#output").prepend(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} - 
    <span class="text-danger">${message}</span><br>`);
  } else {
    $("#output").prepend(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} - 
    ${message}<br>`);
  }
  $("#output").animate({ scrollTop: 0 }, "fast");
}
