'use strict';

class MainController {
  constructor() {
    this.width = 0;
    this.height = 0;
    this.error = 0;
    this.image = null;
    this.imageToVectorsConverter = null;
    this.neuralNetworkWorker = new Worker('./js/neural-network-worker.js');

    $('#image-chooser').on('change', this.selectFile.bind(this));
    $('#start').on('click', this.start.bind(this));
  }
  selectFile(event) {
    let file = event.target.files[0];

    if (file) {
      this.image = $('<img>', {
        crossOrigin: './crossdomain.xml',
        src: URL.createObjectURL(file)
      });
      this.image.on('load', this.prepareImage.bind(this));
    } else {
      this.image = null;
    }
  }
  prepareImage() {
    let context = $('#basic')[0].getContext('2d');

    this.height = this.image[0].height;
    this.width = this.image[0].width;

    this.setCanvasSize();
    URL.revokeObjectURL(this.image[0].src);
    context.drawImage(this.image[0], 0, 0);
  }
  setCanvasSize() {
    $('#input, #output, #basic').each((index, canvas) => {
      canvas.width = this.width;
      canvas.height = this.height;
    });
    $('#width').text('Width: ' + this.width);
    $('#height').text('Height: ' + this.height);
  }
  initParameters() {
    const DEFAULT_SUB_WIDTH = 5;
    const DEFAULT_SUB_HEIGHT = 5;
    const DEFAULT_ERROR = 0.1;
    const DEFAULT_SECOND_LAYER_SIZE = 32;

    this.subWidth = parseInt($('#sub-width').val(), 10) || DEFAULT_SUB_WIDTH;
    this.subHeight = parseInt($('#sub-height').val(), 10) || DEFAULT_SUB_HEIGHT;
    this.error = parseFloat($('#error').val()) || DEFAULT_ERROR;
    this.secondLayerSize = parseInt($('#second-layer-size').val(), 10) || DEFAULT_SECOND_LAYER_SIZE;
  }
  initImageConverter() {
    let maxChannelValue = 255;

    this.imageToVectorsConverter = new ImageToVectorsConverter(maxChannelValue, this.subWidth, this.subHeight);
  }
  getImageVectors() {
    const CANVAS_WITH_IMAGE_ID = 'basic';

    let vectors = this.imageToVectorsConverter.convert(CANVAS_WITH_IMAGE_ID, this.width, this.height);
    this.imageToVectorsConverter.restore('input', vectors, this.width, this.height);//TODO

    return vectors;
  }
  restoreImageFromVectors(e) {
    let vectors = e.data.vectors;

    this.imageToVectorsConverter.restore('output', vectors, this.width, this.height); //TODO
  }
  start() {
    if (this.image) {
      this.initParameters();
      this.initImageConverter();

      this.neuralNetworkWorker.postMessage({
        error: this.error,
        size: this.subWidth * this.subHeight,
        secondLayerSize: this.secondLayerSize,
        imageSize: this.width * this.height,
        vectors: this.getImageVectors()
      });
      this.neuralNetworkWorker.addEventListener('message', this.restoreImageFromVectors.bind(this), false);
    }
  }
}

new MainController();