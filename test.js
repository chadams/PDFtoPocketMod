const PocketModConverter = require("./src/pm");

const outputFile = __dirname + "/tests/output/test.pdf";
const srcFile = __dirname + "/tests/TestMaterials/BasicTIFFImagesTest.pdf";

const pocketmod = new PocketModConverter();
pocketmod.convert(srcFile, outputFile);
