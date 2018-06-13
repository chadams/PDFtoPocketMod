// https://github.com/galkahana/HummusJS/issues/192#issuecomment-327486758

const hummus = require("hummus");
const Matrix = require("transformation-matrix-js").Matrix;
const _ = require("lodash");

const pageWidth = 612;
const pageHeight = 792;

const defaultOptions = {
  width: pageWidth,
  height: pageHeight
};

const SCALE_ADJUST = 0;

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
    // console.log(firstPageInfo.getTrimBox());

    const pdfWriter = hummus.createWriter(destPath);
    const page = pdfWriter.createPage(0, 0, pageWidth, pageHeight);

    this.outSize = getSizeOfArea([0, 0, pageWidth, pageHeight]);
    this.sourceSize = getSizeOfArea(firstPageInfo.getCropBox());
    this.pmSize = getSizeOfArea([0, 0, pageHeight / 4, pageWidth / 2]);

    this.resizePercentWidth = this.pmSize.width / this.sourceSize.width;
    this.resizePercentHeight = this.pmSize.height / this.sourceSize.height;

    this.resizePercentWidth = this.resizePercentWidth - this.resizePercentWidth * SCALE_ADJUST;
    this.resizePercentHeight = this.resizePercentHeight - this.resizePercentHeight * SCALE_ADJUST;

    // console.log("outSize", this.outSize);
    // console.log("sourceSize", this.sourceSize);
    // console.log("pmSize", this.pmSize);
    // console.log("resizePercentWidth", this.resizePercentWidth);
    // console.log("resizePercentHeight", this.resizePercentHeight);

    const contentContext = pdfWriter.startPageContentContext(page);

    // you may switch between the following viewbox to see the result
    // ePDFPageBoxMediaBox, ePDFPageBoxCropBox, ePDFPageBoxBleedBox, ePDFPageBoxTrimBox, ePDFPageBoxArtBox
    const formIDs = pdfWriter.createFormXObjectsFromPDF(sourcePath, hummus.ePDFPageBoxCropBox);

    // const looper = _.range(0, maxPages);
    // looper.forEach(function(i) {});

    const positions = [2, 3, 4, 8, 7, 6, 5, 1];

    positions.forEach((id, index) => {
      const pageFormID = formIDs[index];

      if (pageFormID) {
        const m = this.getMatrixForPosition(id);
        contentContext
          .q()
          .cm.apply(contentContext, m.toArray())
          // use the xobject
          // https://github.com/galkahana/HummusJS/wiki/Embedding-pdf#create-form-xobjects-from-source-pages
          .doXObject(page.getResourcesDictionary().addFormXObjectMapping(pageFormID))
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
        m.scaleX(this.resizePercentHeight);
        m.scaleY(this.resizePercentWidth);
        m.translate(0, this.outSize.width * 4);
        m.rotateDeg(-90);
        break;
      case 2: // F
        m.scaleX(this.resizePercentHeight);
        m.scaleY(this.resizePercentWidth);
        m.translate(0, this.outSize.width * 3);
        m.rotateDeg(-90);
        break;
      case 3: // 1
        m.scaleX(this.resizePercentHeight);
        m.scaleY(this.resizePercentWidth);
        m.translate(0, this.outSize.width * 2);
        m.rotateDeg(-90);
        break;
      case 4: // 2
        m.scaleX(this.resizePercentHeight);
        m.scaleY(this.resizePercentWidth);
        m.translate(0, this.outSize.width * 1);
        m.rotateDeg(-90);
        break;
      case 5: // 6
        m.scaleX(this.resizePercentHeight);
        m.scaleY(this.resizePercentWidth);
        m.translate(this.outSize.height * 2, this.outSize.width * 3);
        m.rotateDeg(90);
        break;
      case 6: // 5
        m.scaleX(this.resizePercentHeight);
        m.scaleY(this.resizePercentWidth);
        m.translate(this.outSize.height * 2, this.outSize.width * 2);
        m.rotateDeg(90);
        break;
      case 7: // 4
        m.scaleX(this.resizePercentHeight);
        m.scaleY(this.resizePercentWidth);
        m.translate(this.outSize.height * 2, this.outSize.width * 1);
        m.rotateDeg(90);
        break;
      case 8: // 3
        m.scaleX(this.resizePercentHeight);
        m.scaleY(this.resizePercentWidth);
        m.translate(this.outSize.height * 2, this.outSize.width * 0);
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
