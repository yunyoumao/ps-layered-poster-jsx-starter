#target photoshop

/*
 * Create a synthetic layered research poster starter.
 * This script uses fictional content only. Edit the generated layers in Photoshop.
 */

app.displayDialogs = DialogModes.NO;

function readTextFile(file) {
  file.encoding = "UTF-8";
  if (!file.open("r")) {
    throw new Error("Could not open layout file: " + file.fsName);
  }
  var text = file.read();
  file.close();
  return text;
}

function loadLayout() {
  if (typeof JSON === "undefined" || typeof JSON.parse !== "function") {
    throw new Error("This Photoshop scripting environment does not provide JSON.parse.");
  }
  var scriptFile = new File($.fileName);
  var layoutFile = new File(scriptFile.parent.parent.fsName + "/templates/poster-layout.json");
  if (!layoutFile.exists) {
    throw new Error("Layout file not found: " + layoutFile.fsName);
  }
  return JSON.parse(readTextFile(layoutFile));
}

function hexToSolidColor(hex) {
  var color = new SolidColor();
  var clean = hex.replace("#", "");
  color.rgb.red = parseInt(clean.substring(0, 2), 16);
  color.rgb.green = parseInt(clean.substring(2, 4), 16);
  color.rgb.blue = parseInt(clean.substring(4, 6), 16);
  return color;
}

function makeRectLayer(doc, name, x, y, w, h, fillHex) {
  var layer = doc.artLayers.add();
  layer.name = name;
  doc.selection.select([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
  doc.selection.fill(hexToSolidColor(fillHex));
  doc.selection.deselect();
  return layer;
}

function makeTextLayer(doc, name, text, x, y, size, colorHex) {
  var layer = doc.artLayers.add();
  layer.kind = LayerKind.TEXT;
  layer.name = name;
  layer.textItem.contents = text;
  layer.textItem.position = [x, y];
  layer.textItem.size = size;
  layer.textItem.color = hexToSolidColor(colorHex);
  layer.textItem.font = "ArialMT";
  return layer;
}

function createPoster(layout) {
  var documentConfig = layout.document;
  var content = layout.content;
  var palette = layout.palette;
  var width = documentConfig.width_px;
  var height = documentConfig.height_px;
  var doc = app.documents.add(width, height, documentConfig.resolution, documentConfig.name, NewDocumentMode.RGB, DocumentFill.WHITE);

  makeRectLayer(doc, "00 Background", 0, 0, width, height, documentConfig.background);
  makeRectLayer(doc, "01 Header Accent", 0, 0, width, 18, palette.accent);
  makeTextLayer(doc, "02 Title", content.title, 120, 130, 62, palette.ink);
  makeTextLayer(doc, "03 Subtitle", content.subtitle, 120, 205, 30, palette.muted);
  makeTextLayer(doc, "04 Authors", content.authors + "  |  " + content.affiliation, 120, 260, 24, palette.accent);

  var cardW = 1030;
  var cardH = 430;
  var leftX = 120;
  var rightX = 1250;
  var topY = 360;
  var bottomY = 870;

  var positions = [
    ["10", leftX, topY],
    ["20", rightX, topY],
    ["30", leftX, bottomY],
    ["40", rightX, bottomY]
  ];

  for (var i = 0; i < content.sections.length && i < positions.length; i += 1) {
    var section = content.sections[i];
    var position = positions[i];
    var layerPrefix = position[0] + " " + section.heading + " Panel";
    makeRectLayer(doc, layerPrefix + " Background", position[1], position[2], cardW, cardH, palette.panel);
    makeRectLayer(doc, layerPrefix + " Rule", position[1], position[2], 14, cardH, i % 2 === 0 ? palette.accent : palette.accent2);
    makeTextLayer(doc, layerPrefix + " Heading", section.heading, position[1] + 42, position[2] + 76, 36, palette.ink);
    makeTextLayer(doc, layerPrefix + " Body", section.body, position[1] + 42, position[2] + 142, 24, palette.muted);
  }

  makeRectLayer(doc, "50 Figure Placeholder", 120, 1340, 1560, 150, "#EEF7F5");
  makeTextLayer(doc, "51 Figure Caption", "Figure placeholder: replace with public-safe or approved research visuals.", 150, 1426, 26, palette.accent);
  makeRectLayer(doc, "60 QR Placeholder", 1770, 1340, 190, 150, "#FFFFFF");
  makeTextLayer(doc, "61 QR Note", "QR / contact placeholder", 1990, 1426, 24, palette.muted);
}

createPoster(loadLayout());
