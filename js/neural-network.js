class RecirculationNeuralNetwork {
  constructor(fullSize, compressSize) {
    this.firstLearningCoefficient = 0.0001;
    this.secondLearningCoefficient= 0.0001;
    this.inputLayerVector = null;
    this.outputLayerVector = null;
    this.hiddenLayerVector = null;
    this.firstWeightMatrix = Matrix.Random(fullSize, compressSize);
    this.secondWeightMatrix = this.firstWeightMatrix.transpose();
  }
  step(inputArray) {
    this.kick(inputArray);
    this.updateWeightMatrices();

    return this.outputLayerVector.elements[0];
  }
  kick(inputArray) {
    this.setInputLayerVector(inputArray);
    this.updateHiddenLayerVector();
    this.updateOutputLayerVector();

    return this.outputLayerVector.elements[0];
  }
  setInputLayerVector(inputArray) {
    this.inputLayerVector = Matrix.create([inputArray]);
  }
  updateHiddenLayerVector() {
    this.hiddenLayerVector = this.inputLayerVector.multiply(this.firstWeightMatrix);
  }
  updateOutputLayerVector() {
    this.outputLayerVector = this.hiddenLayerVector.multiply(this.secondWeightMatrix);
  }
  updateWeightMatrices() {
    let errorVector = this.outputLayerVector.subtract(this.inputLayerVector);

    this.updateFirstWeightMatrix(errorVector);
    this.updateSecondWeightMatrix(errorVector);
  }
  updateSecondWeightMatrix(errorVector) {
    let transposedHiddenLayerVector = this.hiddenLayerVector.transpose();
    let deltaMatrix = transposedHiddenLayerVector.multiply(errorVector).multiply(this.secondLearningCoefficient);

    this.secondWeightMatrix = this.secondWeightMatrix.subtract(deltaMatrix)
  }
  updateFirstWeightMatrix(errorVector) {
    let transposedSecondWeightMatrix = this.secondWeightMatrix.transpose();
    let transposedInputLayerVector = this.inputLayerVector.transpose();
    let deltaMatrix = transposedInputLayerVector.multiply(errorVector).multiply(transposedSecondWeightMatrix).multiply(this.firstLearningCoefficient);

    this.firstWeightMatrix = this.firstWeightMatrix.subtract(deltaMatrix);
  }
}