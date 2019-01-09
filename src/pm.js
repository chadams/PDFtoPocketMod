// https://github.com/galkahana/HummusJS/issues/192#issuecomment-327486758

const hummus = require("hummus");
const Matrix = require("transformation-matrix-js").Matrix;
const _ = require("lodash");

const pageSizes = {
  letter: {
    pageWidth: 612,
    pageHeight: 792
  },
  A4: {
    pageWidth: 595,
    pageHeight: 842
  }
};

const defaultOptions = {
  size: "letter"
};

const SCALE_ADJUST = 1;

class PocketModConverter {
  constructor(options) {
    this.options = _.extend({}, defaultOptions, options);
    const size = pageSizes[this.options.size] ? this.options.size : defaultOptions.size;
    this.options.width = pageSizes[size].pageWidth;
    this.options.height = pageSizes[size].pageHeight;
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
    this.sourceSize = getSizeOfArea(firstPageInfo.getMediaBox());
    this.pmSize = getSizeOfArea([0, 0, pageHeight / 4, pageWidth / 2]);

    this.resizePercentWidthFull = this.outSize.width / this.sourceSize.width;
    this.resizePercentHeightFull = this.outSize.height / this.sourceSize.height;

    this.resizePercentWidth = this.pmSize.width / this.sourceSize.width;
    this.resizePercentHeight = this.pmSize.height / this.sourceSize.height;

    // this.resizePercentWidth = this.resizePercentWidth * SCALE_ADJUST;
    // this.resizePercentHeight = this.resizePercentHeight * SCALE_ADJUST;

    // console.log("outSize", this.outSize);
    // console.log("sourceSize", this.sourceSize);
    // console.log("pmSize", this.pmSize);
    // console.log("resizePercentWidthFull", this.resizePercentWidthFull);
    // console.log("resizePercentHeightFull", this.resizePercentHeightFull);
    // console.log("resizePercentWidth", this.resizePercentWidth);
    // console.log("resizePercentHeight", this.resizePercentHeight);
    // console.log("------------------------");

    const contentContext = pdfWriter.startPageContentContext(page);

    // you may switch between the following viewbox to see the result
    // ePDFPageBoxMediaBox, ePDFPageBoxCropBox, ePDFPageBoxBleedBox, ePDFPageBoxTrimBox, ePDFPageBoxArtBox
    const formIDs = pdfWriter.createFormXObjectsFromPDF(sourcePath, [0, 0, pageWidth, pageHeight]);

    // const looper = _.range(0, maxPages);
    // looper.forEach(function(i) {});

    const positions = [1, 2, 3, 4, 5, 6, 7, 8];

    positions.forEach((id, index) => {
      const pageFormID = formIDs[index];

      if (pageFormID) {
        const m = this.getMatrixForPosition(id);
        contentContext
          .q()

          // .w(2)
          // .K(0, 1, 0, 0)

          // .m(0, 0)
          // .l(this.sourceSize.width, 0)
          // .l(this.sourceSize.width, this.sourceSize.height)
          // .l(0, this.sourceSize.height)
          // .s()
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
folds on top
-------------------

*/
  getMatrixForPosition(positionID) {
    const sizes = this;
    var m = new Matrix();
    switch (positionID) {
      case 1:
        m.scaleX(sizes.resizePercentHeight);
        m.scaleY(sizes.resizePercentWidth);
        m.translate(sizes.sourceSize.height * 2, sizes.sourceSize.width * 3);
        m.rotateDeg(90);
        break;
      case 2:
        m.scaleX(sizes.resizePercentHeight);
        m.scaleY(sizes.resizePercentWidth);
        m.translate(0, sizes.sourceSize.width * 4);
        m.rotateDeg(-90);
        break;
      case 3:
        m.scaleX(sizes.resizePercentHeight);
        m.scaleY(sizes.resizePercentWidth);
        m.translate(0, sizes.sourceSize.width * 3);
        m.rotateDeg(-90);
        break;
      case 4:
        m.scaleX(sizes.resizePercentHeight);
        m.scaleY(sizes.resizePercentWidth);
        m.translate(0, sizes.sourceSize.width * 2);
        m.rotateDeg(-90);
        break;
      case 5:
        m.scaleX(sizes.resizePercentHeight);
        m.scaleY(sizes.resizePercentWidth);
        m.translate(0, sizes.sourceSize.width * 1);
        m.rotateDeg(-90);
        break;
      case 6:
        m.scaleX(sizes.resizePercentHeight);
        m.scaleY(sizes.resizePercentWidth);
        m.translate(sizes.sourceSize.height * 2, sizes.sourceSize.width * 0);
        m.rotateDeg(90);
        break;
      case 7:
        m.scaleX(sizes.resizePercentHeight);
        m.scaleY(sizes.resizePercentWidth);
        m.translate(sizes.sourceSize.height * 2, sizes.sourceSize.width * 1);
        m.rotateDeg(90);
        break;
      case 8:
        m.scaleX(sizes.resizePercentHeight);
        m.scaleY(sizes.resizePercentWidth);
        m.translate(sizes.sourceSize.height * 2, sizes.sourceSize.width * 2);
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
