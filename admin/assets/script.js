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
 * Confirm Modal
 */
$("#confirmModal").on("show.bs.modal", (event) => {
  const button = event.relatedTarget;
  const text = button.getAttribute('data-cms-text')
  console.log($(this));
});

/*
 * Folders
 */

// Folder CREATE (POST)
$(document).on("click", "#folder-create",  (event) => {
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


/*
 * Pages
 */

// Pages CREATE (POST)
$(document).on("click", "#page-create",  (event) => {
  const postData = $("#addPage").serialize();

  const button = document.getElementById("page-add");

  output(`Creating Page: ${postData}`);

  button.querySelector(".spinner-border").classList.remove("d-none");
  button.disabled = true;

  $.post("pages", postData)
    .done((response) => {
      output("Page Created");
      console.log(response);
      $("#accordionPageAnchor").html(response);
    })
    .fail((response) => {
      output("Page creation failed: " + response.responseText, true);
      console.log("fail", response.responseText);
    })
    .always(() => {
      button.querySelector(".spinner-border").classList.add("d-none");
      button.disabled = false;
      $(".btn-close").click();
    });
});

// Pages UPDATE (PUT)
$(".page-save-draft").click((event) => {
  const button = event.currentTarget;

  button.querySelector(".spinner-border").classList.remove("d-none");
  button.disabled = true;

  const formData = new FormData(document.getElementById("pageForm"));

  $.ajax({
    url: "",
    type: "PUT",
    data: formData,
    enctype: "multipart/form-data",
    processData: false,
    contentType: false,
  })
    .done((response) => {
      output("Draft Saved");
      console.log("update success", response);
      $("#pageFormAnchor").html(response);
      initSortable();
    })
    .fail((response) => {
      output("Failed to save draft", true);
      console.log("update fail", response.responseText);
    })
    .always(() => {
      button.querySelector(".spinner-border").classList.add("d-none");
      button.disabled = false;
    });
});



// Page DELETE (DELETE)
$(document).on("click", ".page-delete", (event) => {
  const button = event.target;
  const deletePage = button.dataset.cms;
  if (confirm(`Do you really want to delete ${deletePage}?`)) {
    output(`sending delete request to server: ${deletePage}`);
    button.disabled = true;

    $.ajax({ url: `pages/${deletePage}`, type: "DELETE" })
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

/*
/ Initialize Sortable 
*/
function initSortable() {
  $("#sortable").sortable({ handle: ".handle", update: orderSections });
  $(".block-anchor").sortable({ handle: ".block-handle", update: orderSections });
}
initSortable();


/*
 * Sections
 */

$(document).on("click", ".section-add", (event) =>  {
  const selected = $("#select-template :selected");
  output(selected.val());

  // Use epoch time for unique id for Accordion
  let unique = new Date().getTime();

  $("#sortable").prepend(
    $(`#${selected.val()}-template`).html().replace(/section-qq.*q/g, `section-qq${unique}q`)
  );

  orderSections();
});

$(document).on("click", ".section-delete", (event) => {
  const button = event.currentTarget;
  const deleteSection = button.dataset.cms;

  if (confirm(`Do you really want to delete ${deleteSection} section?`)) {
    output(`deleted ${deleteSection} section`);
    button.closest(".cms-section").remove(0);
    orderSections();
  }
});

function orderSections() {
  $(".cms-section").each((sectionIndex, sectionItem) => {
    $(sectionItem)
      .find("[name*='section']")
      .each((index, item) => {
        let name = $(item)
          .attr("name")
          .replace(/sections\[[^\]]*\]/, `sections[${sectionIndex}]`);

        $(item).attr("name", name);
      });
  });
}