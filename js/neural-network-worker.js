importScripts('../bower_components/sylvester/sylvester.js', './neural-network.js');

class NeuralNetworkWorker {
  constructor(error, size, imageSize, secondLayerSize, vectors) {
    let iterations = 0;
    let currentError;
    let recirculationNeuralNetwork = new RecirculationNeuralNetwork(size, secondLayerSize);

    do {
      this.teachNeuroWeb(vectors, recirculationNeuralNetwork);
      currentError = this.countCurrentError(vectors, recirculationNeuralNetwork);
      iterations++;
      console.log(iterations, currentError);
    } while(isNaN(currentError) || currentError > error);
    let n = 3 * size;
    let z = (n * imageSize) / ((imageSize + n) * secondLayerSize + 2);
    console.log(z);
    vectors.forEach((vector, i) => vector.forEach((element, j) => vectors[i][j] = recirculationNeuralNetwork.kick(element)));
    self.postMessage({
      vectors: vectors
    });
  }
  teachNeuroWeb(vectors, recirculationNeuralNetwork) {
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