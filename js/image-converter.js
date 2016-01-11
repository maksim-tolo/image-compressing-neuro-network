'use strict';

class ImageToVectorsConverter {
  constructor(maxChannelValue = 255, subWidth = 5, subHeight = 5) {
    this.CHANNELS_NUMBER = 4;
    this.maxChannelValue = maxChannelValue;
    this.subWidth = subWidth;
    this.subHeight = subHeight;
  }
  convert(canvas, width, height) {
    return this.convertImageDataArrayToVectors(this.getImageData(canvas, width, height));
  }
  getImageData(canvas, width, height) {
    return document.getElementById(canvas).getContext('2d').getImageData(0, 0, width, height);
  }
  convertImageDataArrayToChannelMatrix(imageData, channel) {
    let matrix = [[]];

    for (let i = channel; i < imageData.data.length; i += this.CHANNELS_NUMBER) {
      if (matrix[matrix.length - 1].length === imageData.width) {
        matrix.push([]);
      }
      matrix[matrix.length - 1].push(imageData.data[i]);
    }

    return matrix;
  }
  convertImageDataArrayToChannelsMatrix(imageData) {
    let matrix = [];

    for(let i = 0; i < this.CHANNELS_NUMBER; i++) {
      matrix[i] = this.convertImageDataArrayToChannelMatrix(imageData, i);
    }

    return matrix;
  }
  convertChannelsMatrixToVectors (matrix) {
    let vectors = [];

    for (let i = 0; i < this.CHANNELS_NUMBER; i++) {
      vectors[i] = this.convertChannelMatrixToVectors(matrix[i]);
    }

    return vectors;
  }
  convertChannelMatrixToVectors(matrix) {
    let k = this.subWidth;
    let p = this.subHeight;
    let vectors = [];
    let me = this;

    matrix.forEach(function(row, i) {
      row.forEach(function(el, j) {
        let newI = (i - i % k) / k;
        let newJ = (j - j % p) / p;
        let newSize = (row.length - row.length % p) / p;
        let index = newI * newSize + newJ;
        if (!vectors[index]) {
          vectors[index] = [];
        }
        vectors[index].push(me.convertChannelToCoefficient(el));
      });
    });

    return vectors;
  }
  convertImageDataArrayToVectors(imageData) {
    let channelsMatrix = this.convertImageDataArrayToChannelsMatrix(imageData);

    return this.convertChannelsMatrixToVectors(channelsMatrix);
  }
  restore(canvas, vectors, width, height) {
    let context = document.getElementById(canvas).getContext('2d');
    let imageData = context.createImageData(width, height);
    let k = this.subWidth;
    let p = this.subHeight;

    for (let n = 0; n < vectors[0].length; n++) {
      for (let o = 0; o < vectors[0][n].length; o++) {
        let size = (width - width % p) / p;
        let i = (n - n % size) / size * k + (o - o % p) / p;
        let j = n % size * k + o % p;
        let index = this.CHANNELS_NUMBER * (i * height + j);
        for (let channel = 0; channel < this.CHANNELS_NUMBER; channel++) {
          imageData.data[index + channel] = this.convertCoefficientToChannel(vectors[channel][n][o]);
        }
      }
    }
    context.putImageData(imageData, 0, 0);
  }
  convertChannelToCoefficient(channel) {
    return 2 * channel / this.maxChannelValue - 1;
  }
  convertCoefficientToChannel(coefficient) {
    let channel = 0;

    if (coefficient > 1) {
      channel = this.maxChannelValue;
    } else if (coefficient >= -1) {
      channel = this.maxChannelValue * (coefficient + 1) / 2;
    }

    return channel;
  }
}