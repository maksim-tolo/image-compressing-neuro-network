importScripts('../bower_components/sylvester/sylvester.js', './neural-network.js');

class NeuralNetworkWorker {
  constructor(error, size, imageSize, secondLayerSize, vectors) {
    const CHANNELS_NUMBER = 4;
    let iterations = 0;
    let currentError;
    let recirculationNeuralNetwork = new RecirculationNeuralNetwork(size, secondLayerSize);
    let n = CHANNELS_NUMBER * size;
    let l = imageSize / size;
    let z = ((n + l) * secondLayerSize + 2) / (n * l + 2);

    do {
      this.teachNeuroNetwork(vectors, recirculationNeuralNetwork);
      currentError = this.countCurrentError(vectors, recirculationNeuralNetwork);
      iterations++;
      console.log(iterations, currentError);
    } while(isNaN(currentError) || currentError > error);

    console.log('Compression ratio:', z);
    console.log('Rectangles number:', l);
    console.log('Form length:', n);
    console.log('Total error:', currentError);
    console.log('Number of iterations:', iterations);
    vectors.forEach((vector, i) => vector.forEach((element, j) => vectors[i][j] = recirculationNeuralNetwork.kick(element)));
    self.postMessage({
      vectors: vectors
    });
  }
  teachNeuroNetwork(vectors, recirculationNeuralNetwork) {
    vectors.forEach((vector) => vector.forEach((element) => recirculationNeuralNetwork.step(element)));
  }
  countCurrentError(vectors, recirculationNeuralNetwork) {
    return vectors.reduce((currentError, vector) => currentError + vector.reduce((currentError, element) => currentError + this.countError(element, recirculationNeuralNetwork.kick(element)), 0), 0);
  }
  countError(input, output) {
    return input.reduce((prev, cur, index) => {
      let element = (output[index] - cur);

      return prev + Math.pow(element, 2);
    }, 0);
  }
}

self.addEventListener('message', function(e) {
  new NeuralNetworkWorker(e.data.error, e.data.size, e.data.imageSize, e.data.secondLayerSize, e.data.vectors);
}, false);