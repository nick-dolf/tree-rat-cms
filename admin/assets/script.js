/*
/ Output 
*/
function output(message, fail) {
  const now = new Date();

  if (fail) {
    $("#output")
      .prepend(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} - 
    <span class="text-danger">${message}</span><br>`);
  } else {
    $("#output")
      .prepend(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} - 
    ${message}<br>`);
  }
  $("#output").animate({ scrollTop: 0 }, "fast");
}

/*
 * Folders
 */

// Folder CREATE (POST)
$("#folder-create").click((event) => {
  const postData = $("#addFolder").serialize();

  const button = document.getElementById("folder-add");

  output(`Creating Folder: ${postData}`);

  button.querySelector(".spinner-border").classList.remove("d-none");
  button.disabled = true;

  $.post("page-folders", postData)
    .done((response) => {
      output("Folder Created");
      console.log(response);
      $("#accordionPageAnchor").html(response);
    })
    .fail((response) => {
      output("Folder creation failed: " + response.responseText, true);
      console.log("fail", response.responseText);
    })
    .always(() => {
      button.querySelector(".spinner-border").classList.add("d-none");
      button.disabled = false;
      $(".btn-close").click();
    });
});

// Folder DELETE (DELETE) 
$(document).on("click", ".folder-delete", (event) => {
  const button = event.target;
  const deleteFolder = button.dataset.cms;
  if (confirm(`Do you really want to delete ${deleteFolder}?`)) {
    output(`sending delete request to server: ${deleteFolder}`);
    button.disabled = true;

    $.ajax({ url: `page-folders/${deleteFolder}`, type: "DELETE" })
      .done((response) => {
        output("delete request was successful");
        console.log("delete success", response);
        $("#accordionPageAnchor").html(response);
      })
      .fail((response) => {
        output("delete request failed: " + response.responseText, true);
        console.log("delete failed:", response.responseText);
      })
      .always(() => {
        button.disabled = false;
      });
  }
});