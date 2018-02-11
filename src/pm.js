// https://github.com/galkahana/HummusJS/issues/192#issuecomment-327486758

const hummus = require("hummus");
const Matrix = require("transformation-matrix-js").Matrix;
const _ = require("lodash");

const pageWidth = 595;
const pageHeight = 842;

const defaultOptions = {
  width: pageWidth,
  height: pageHeight
};

class PocketModConverter {
  constructor(options) {
    this.options = _.extend({}, defaultOptions, options);
  }

  convert(sourcePath, destPath) {
    const pageWidth = this.options.width;
    const pageHeight = this.options.height;

    const pdfReader = hummus.createReader(sourcePath);
    const srcPageCount = pdfReader.getPagesCount();
    const firstPageInfo = pdfReader.parsePage(0);
    const maxPages = Math.min(srcPageCount, 8);
    // Here is you issue, the mediabox is not the same as cropbox
    // console.log(firstPageInfo.getMediaBox());
    // console.log(firstPageInfo.getCropBox());

    const pdfWriter = hummus.createWriter(destPath);
    const page = pdfWriter.createPage(0, 0, pageWidth, pageHeight);

    this.outSize = getSizeOfArea([0, 0, pageWidth, pageHeight]);
    this.sourceSize = getSizeOfArea(firstPageInfo.getCropBox());
    this.pmSize = getSizeOfArea([0, 0, pageHeight / 4, pageWidth / 2]);

    this.resizePercentWidth = this.pmSize.width / this.sourceSize.width;
    this.resizePercentHeight = this.pmSize.height / this.sourceSize.height;

    console.log("outSize", this.outSize);
    console.log("sourceSize", this.sourceSize);
    console.log("pmSize", this.pmSize);
    console.log("resizePercentWidth", this.resizePercentWidth);
    console.log("resizePercentHeight", this.resizePercentHeight);

    const contentContext = pdfWriter.startPageContentContext(page);

    // you may switch between the following viewbox to see the result
    // ePDFPageBoxMediaBox, ePDFPageBoxCropBox, ePDFPageBoxBleedBox, ePDFPageBoxTrimBox, ePDFPageBoxArtBox
    const formIDs = pdfWriter.createFormXObjectsFromPDF(
      sourcePath,
      hummus.ePDFPageBoxCropBox
    );

    // const looper = _.range(0, maxPages);
    // looper.forEach(function(i) {});

    const positions = [1, 2, 3, 4, 5, 6, 7, 8];

    positions.forEach((id, index) => {
      const pageFormID = formIDs[index];

      if (pageFormID) {
        const m = this.getMatrixForPosition(id);
        contentContext
          .q()
          .cm.apply(contentContext, m.toArray())
          // use the xobject
          // https://github.com/galkahana/HummusJS/wiki/Embedding-pdf#create-form-xobjects-from-source-pages
          .doXObject(
            page.getResourcesDictionary().addFormXObjectMapping(pageFormID)
          )
          .Q();
      }
    });

    pdfWriter.writePage(page).end();
  }

  /*
1.B  |  5.6
2.F  |  6.5
3.1  |  7.4
4.2  |  8.3
*/
  getMatrixForPosition(positionID) {
    var m = new Matrix();
    switch (positionID) {
      case 1: // B
        m.translate(0, this.pmSize.width * 4);
        m.scaleX(this.resizePercentWidth);
        m.scaleY(this.resizePercentHeight);
        m.rotateDeg(-90);
        break;
      case 2: // F
        m.translate(0, this.pmSize.width * 3);
        m.scaleX(this.resizePercentWidth);
        m.scaleY(this.resizePercentHeight);
        m.rotateDeg(-90);
        break;
      case 3: // 1
        m.translate(0, this.pmSize.width * 2);
        m.scaleX(this.resizePercentWidth);
        m.scaleY(this.resizePercentHeight);
        m.rotateDeg(-90);
        break;
      case 4: // 2
        m.translate(0, this.pmSize.width * 1);
        m.scaleX(this.resizePercentWidth);
        m.scaleY(this.resizePercentHeight);
        m.rotateDeg(-90);
        break;
      case 5: // 6
        m.translate(this.pmSize.height * 2, this.pmSize.width * 3);
        m.scaleX(this.resizePercentWidth);
        m.scaleY(this.resizePercentHeight);
        m.rotateDeg(90);
        break;
      case 6: // 5
        m.translate(this.pmSize.height * 2, this.pmSize.width * 2);
        m.scaleX(this.resizePercentWidth);
        m.scaleY(this.resizePercentHeight);
        m.rotateDeg(90);
        break;
      case 7: // 4
        m.translate(this.pmSize.height * 2, this.pmSize.width * 1);
        m.scaleX(this.resizePercentWidth);
        m.scaleY(this.resizePercentHeight);
        m.rotateDeg(90);
        break;
      case 8: // 3
        m.translate(this.pmSize.height * 2, this.pmSize.width * 0);
        m.scaleX(this.resizePercentWidth);
        m.scaleY(this.resizePercentHeight);
        m.rotateDeg(90);
        break;

      default:
        break;
    }
    return m;
  }
}

module.exports = PocketModConverter;

// utils

function getSizeOfArea(areaArray) {
  const parts = ["x1", "y1", "x2", "y2"];
  const size = _.zipObject(parts, areaArray);
  return { width: size.x2 - size.x1, height: size.y2 - size.y1 };
}