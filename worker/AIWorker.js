// AI Worker for handling local LLM processing without freezing the UI
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@3.0.0/+esm';

// Configure environment for local models
env.allowLocalModels = true;
env.localModelPath = './assets/models/';
// Disable remote model fetching to ensure we only use local models
env.remoteHost = '';
env.useRemoteModels = false;

class AIPipeline {
  static task = 'text-generation';
  // Use the Xenova-converted model that works with Transformers.js
  static model = 'Xenova/qwen2.5-0.5b-instruct'; // Model that's optimized for browser use

  static instance = null;

  constructor(progress_callback = null) {
    this.progress_callback = progress_callback;
  }

  async init() {
    // Load the text generation pipeline
    // The first time this runs, it will download the model to the cache
    // Subsequent runs will use the cached version
    this.generator = await pipeline(
      AIPipeline.task,
      AIPipeline.model,
      {
        progress_callback: this.progress_callback,
        // Use float16 to reduce memory usage
        dtype: 'fp16'
      }
    );
  }

  async generate(text, options = {}) {
    if (!this.generator) {
      await this.init();
    }

    // Set default options
    const defaultOptions = {
      max_new_tokens: 200,
      temperature: 0.7,
      repetition_penalty: 1.2,
      return_full_text: false,
    };

    const generationArgs = { ...defaultOptions, ...options };

    let output = await this.generator(text, generationArgs);
    return output[0].generated_text;
  }
}

// Listen for messages from the main thread
let aiPipeline = null;

self.addEventListener('message', async (event) => {
  const { message_id, function_call, args } = event.data;

  try {
    if (function_call === 'init') {
      aiPipeline = new AIPipeline((data) => {
        self.postMessage({ message_id, status: 'progress', ...data });
      });
      await aiPipeline.init();
      self.postMessage({ message_id, status: 'ready' });
    }
    else if (function_call === 'generate' && aiPipeline) {
      const result = await aiPipeline.generate(args.text, args.options);
      self.postMessage({ message_id, status: 'complete', result });
    }
  } catch (error) {
    self.postMessage({ message_id, status: 'error', error: error.message });
  }
});