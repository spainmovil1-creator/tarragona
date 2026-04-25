class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(0);
    this.chunkSize = 4096; // Adjust chunk size if needed
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const channelData = input[0];
      
      const newBuffer = new Float32Array(this.buffer.length + channelData.length);
      newBuffer.set(this.buffer);
      newBuffer.set(channelData, this.buffer.length);
      this.buffer = newBuffer;

      while (this.buffer.length >= this.chunkSize) {
        const chunk = this.buffer.slice(0, this.chunkSize);
        this.port.postMessage(chunk);
        this.buffer = this.buffer.slice(this.chunkSize);
      }
    }
    return true; // Keep processor alive
  }
}

registerProcessor('pcm-processor', PCMProcessor);
