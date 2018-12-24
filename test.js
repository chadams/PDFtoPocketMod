const PocketModConverter = require("./src/pm");

const outputFile = __dirname + "/tests/output/test.pdf";
const srcFile = __dirname + "/tests/TestMaterials/BasicTIFFImagesTest.pdf";
//const srcFile = __dirname + "/tests/TestMaterials/gre_research_validity_data.pdf";

const pocketmod = new PocketModConverter({ size: "letter" });
pocketmod.convert(srcFile, outputFile);
