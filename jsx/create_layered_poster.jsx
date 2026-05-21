#target photoshop

/*
 * Create a synthetic layered research poster starter.
 * This script uses fictional content only. Edit the generated layers in Photoshop.
 */

app.displayDialogs = DialogModes.NO;

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

function createPoster() {
  var width = 2400;
  var height = 1600;
  var doc = app.documents.add(width, height, 150, "Synthetic Research Poster Starter", NewDocumentMode.RGB, DocumentFill.WHITE);

  var palette = {
    bg: "#F8F7F2",
    ink: "#172024",
    muted: "#5D686C",
    accent: "#006C67",
    accent2: "#B05A1C",
    panel: "#FFFFFF",
    line: "#D8D6CD"
  };

  makeRectLayer(doc, "00 Background", 0, 0, width, height, palette.bg);
  makeRectLayer(doc, "01 Header Accent", 0, 0, width, 18, palette.accent);
  makeTextLayer(doc, "02 Title", "Synthetic Research Workflow Poster", 120, 130, 62, palette.ink);
  makeTextLayer(doc, "03 Subtitle", "Layered Photoshop JSX starter with fictional content and placeholder visuals.", 120, 205, 30, palette.muted);
  makeTextLayer(doc, "04 Authors", "Alex Smith, Mina Rivera, Jordan Lee  |  Fictional Research Tools Lab", 120, 260, 24, palette.accent);

  var cardW = 1030;
  var cardH = 430;
  var leftX = 120;
  var rightX = 1250;
  var topY = 360;
  var bottomY = 870;

  var cards = [
    ["10 Motivation Panel", leftX, topY, "Motivation", "Public poster templates should be editable, layered, and safe to share without exposing private data."],
    ["20 Workflow Panel", rightX, topY, "Workflow", "Generate layer groups, section panels, figure placeholders, and export previews from a repeatable script."],
    ["30 Checks Panel", leftX, bottomY, "Checks", "Review typography, figure placement, color contrast, captions, QR code targets, and final export settings."],
    ["40 Takeaway Panel", rightX, bottomY, "Takeaway", "Keep automation generic. Put real research content only in private project copies."]
  ];

  for (var i = 0; i < cards.length; i += 1) {
    var card = cards[i];
    makeRectLayer(doc, card[0] + " Background", card[1], card[2], cardW, cardH, palette.panel);
    makeRectLayer(doc, card[0] + " Rule", card[1], card[2], 14, cardH, i % 2 === 0 ? palette.accent : palette.accent2);
    makeTextLayer(doc, card[0] + " Heading", card[3], card[1] + 42, card[2] + 76, 36, palette.ink);
    makeTextLayer(doc, card[0] + " Body", card[4], card[1] + 42, card[2] + 142, 24, palette.muted);
  }

  makeRectLayer(doc, "50 Figure Placeholder", 120, 1340, 1560, 150, "#EEF7F5");
  makeTextLayer(doc, "51 Figure Caption", "Figure placeholder: replace with public-safe or approved research visuals.", 150, 1426, 26, palette.accent);
  makeRectLayer(doc, "60 QR Placeholder", 1770, 1340, 190, 150, "#FFFFFF");
  makeTextLayer(doc, "61 QR Note", "QR / contact placeholder", 1990, 1426, 24, palette.muted);
}

createPoster();
