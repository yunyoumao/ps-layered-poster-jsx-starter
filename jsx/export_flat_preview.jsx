#target photoshop

/*
 * Export the active Photoshop document as a flattened PNG preview.
 * Choose an output folder when prompted.
 */

app.displayDialogs = DialogModes.NO;

if (app.documents.length === 0) {
  throw new Error("Open or create a poster document before exporting.");
}

var doc = app.activeDocument;
var outputFolder = Folder.selectDialog("Choose output folder for poster preview");
if (outputFolder) {
  var duplicate = doc.duplicate(doc.name + " preview", true);
  duplicate.flatten();
  var file = new File(outputFolder.fsName + "/" + doc.name.replace(/[\\/:*?\"<>|]/g, "_") + ".png");
  var options = new PNGSaveOptions();
  duplicate.saveAs(file, options, true, Extension.LOWERCASE);
  duplicate.close(SaveOptions.DONOTSAVECHANGES);
}
