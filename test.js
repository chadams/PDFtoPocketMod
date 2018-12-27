const PocketModConverter = require("./src/pm");
const fs = require("fs");

const types = ["letter", "A4"];

types.forEach(type => {
  const outputFile = __dirname + `/tests/output/test_${type}.pdf`;
  const srcFile = __dirname + "/tests/TestMaterials/BasicTIFFImagesTest.pdf";
  //const srcFile = __dirname + "/tests/TestMaterials/gre_research_validity_data.pdf";

  if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
  }
  const pocketmod = new PocketModConverter({ size: type });
  pocketmod.convert(srcFile, outputFile);
});
