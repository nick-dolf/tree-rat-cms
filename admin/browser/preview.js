function reloadPreview() {
  const preview = $("#previewFrame");

  if (preview[0]) {
    preview[0].contentWindow.location.reload(true);
  }
}

$("#previewFrame").on("load", () => {
  let iframe = document.getElementById("previewFrame");

  const contentHeight = iframe.contentWindow.document.body.scrollHeight;
  iframe.height = contentHeight;

  const previewSize = $("input[name='previewSize']:checked").val();

  if (previewSize == "mobile") {
    $("#thumbnailContainer").height(contentHeight * 0.4);
  } else if (previewSize == "tablet") {
    $("#thumbnailContainer").height(contentHeight * 0.25);
  } else {
    $("#thumbnailContainer").height(contentHeight * 0.125);
  }
});

$("input[name='previewSize']").on("change", function () {
  const previewSize = $(this).val();
  let iframe = document.getElementById("previewFrame");

  if (previewSize == "mobile") {
    $("#thumbnailContainer").attr("class", "mobile");
  } else if (previewSize == "tablet") {
    $("#thumbnailContainer").attr("class", "tablet");
  } else {
    $("#thumbnailContainer").attr("class", "desktop");
  }

  reloadPreview();
});

reloadPreview();