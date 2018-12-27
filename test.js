const PocketModConverter = require("./src/pm");
const fs = require("fs");

const types = ["A4", "letter"];

types.forEach(type => {
  const outputFile = __dirname + `/tests/output/test_${type}.pdf`;
  const srcFile = __dirname + "/tests/TestMaterials/BasicTIFFImagesTest.pdf";
  // const srcFile = __dirname + "/tests/TestMaterials/gre_research_validity_data.pdf";

  if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
  }
  // console.log(`Converting to ${type}`);
  const pocketmod = new PocketModConverter({ size: type });
  pocketmod.convert(srcFile, outputFile);
});
