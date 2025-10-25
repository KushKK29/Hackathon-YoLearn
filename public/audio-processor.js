class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._bufferQueue = [];
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const audioData = input[0];
      this._bufferQueue.push(new Float32Array(audioData));
      
      if (this._bufferQueue.length >= 60) {
        const combined = Float32Array.from(this._bufferQueue.flat());
        this.port.postMessage({ audioData: combined });
        this._bufferQueue = [];
      }
    }
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
