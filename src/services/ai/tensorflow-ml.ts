// TensorFlow.js ML Service
// Real machine learning model for anomaly detection and bot classification
// Uses TensorFlow.js for browser/Node.js compatible ML

interface TrainingData {
    features: number[][];
    labels: number[];
}

interface ModelConfig {
    inputShape: number;
    hiddenLayers: number[];
    outputShape: number;
    learningRate: number;
}

interface PredictionResult {
    prediction: number;
    confidence: number;
    class: string;
}

// Feature extraction for ML model
export function extractFeatures(request: {
    requestRate: number;
    pathEntropy: number;
    timingVariance: number;
    headerCount: number;
    uaComplexity: number;
    requestSize: number;
    responseTime: number;
    hourOfDay: number;
}): number[] {
    // Normalize features to 0-1 range
    return [
        Math.min(request.requestRate / 100, 1),           // Request rate (0-100+)
        request.pathEntropy,                               // Already 0-1
        Math.min(request.timingVariance / 1000, 1),       // Timing variance (ms)
        Math.min(request.headerCount / 20, 1),            // Header count
        Math.min(request.uaComplexity / 20, 1),           // UA complexity
        Math.min(request.requestSize / 10000, 1),         // Request size (bytes)
        Math.min(request.responseTime / 5000, 1),         // Response time (ms)
        request.hourOfDay / 24,                           // Hour of day (0-23)
    ];
}

export class TensorFlowMLService {
    private anomalyModel: any = null;
    private botModel: any = null;
    private tf: any = null;
    private modelLoaded: boolean = false;
    private trainingHistory: TrainingData = { features: [], labels: [] };

    constructor() {
        this.initializeTensorFlow();
    }

    private async initializeTensorFlow(): Promise<void> {
        try {
            // Dynamic import for TensorFlow.js
            // In production, install: npm install @tensorflow/tfjs
            if (typeof window !== 'undefined') {
                // Browser environment - load from CDN
                console.log('[ML] TensorFlow.js will be loaded from CDN in browser');
            } else {
                // Node.js environment
                try {
                    this.tf = await import('@tensorflow/tfjs');
                    await this.createModels();
                    this.modelLoaded = true;
                    console.log('[ML] TensorFlow.js initialized in Node.js');
                } catch (e) {
                    console.log('[ML] TensorFlow.js not installed, using statistical fallback');
                }
            }
        } catch (error) {
            console.error('[ML] Failed to initialize TensorFlow:', error);
        }
    }

    private async createModels(): Promise<void> {
        if (!this.tf) return;

        // Anomaly Detection Model (Autoencoder-style)
        this.anomalyModel = this.tf.sequential({
            layers: [
                this.tf.layers.dense({ inputShape: [8], units: 16, activation: 'relu' }),
                this.tf.layers.dropout({ rate: 0.2 }),
                this.tf.layers.dense({ units: 8, activation: 'relu' }),
                this.tf.layers.dense({ units: 4, activation: 'relu' }),
                this.tf.layers.dense({ units: 8, activation: 'relu' }),
                this.tf.layers.dense({ units: 1, activation: 'sigmoid' }),
            ],
        });

        this.anomalyModel.compile({
            optimizer: this.tf.train.adam(0.001),
            loss: 'binaryCrossentropy',
            metrics: ['accuracy'],
        });

        // Bot Classification Model
        this.botModel = this.tf.sequential({
            layers: [
                this.tf.layers.dense({ inputShape: [8], units: 32, activation: 'relu' }),
                this.tf.layers.dropout({ rate: 0.3 }),
                this.tf.layers.dense({ units: 16, activation: 'relu' }),
                this.tf.layers.dense({ units: 8, activation: 'relu' }),
                this.tf.layers.dense({ units: 3, activation: 'softmax' }), // human, good_bot, bad_bot
            ],
        });

        this.botModel.compile({
            optimizer: this.tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy'],
        });

        console.log('[ML] Models created');
    }

    // Predict anomaly score
    async predictAnomaly(features: number[]): Promise<PredictionResult> {
        if (!this.modelLoaded || !this.anomalyModel) {
            return this.fallbackAnomalyPrediction(features);
        }

        try {
            const input = this.tf.tensor2d([features]);
            const prediction = this.anomalyModel.predict(input);
            const score = (await prediction.data())[0];

            input.dispose();
            prediction.dispose();

            return {
                prediction: score,
                confidence: Math.abs(score - 0.5) * 2 * 100,
                class: score > 0.5 ? 'anomaly' : 'normal',
            };
        } catch (error) {
            return this.fallbackAnomalyPrediction(features);
        }
    }

    // Predict bot classification
    async predictBot(features: number[]): Promise<PredictionResult> {
        if (!this.modelLoaded || !this.botModel) {
            return this.fallbackBotPrediction(features);
        }

        try {
            const input = this.tf.tensor2d([features]);
            const prediction = this.botModel.predict(input);
            const probs = await prediction.data();

            input.dispose();
            prediction.dispose();

            const classes = ['human', 'good_bot', 'bad_bot'];
            const maxIdx = probs.indexOf(Math.max(...probs));

            return {
                prediction: maxIdx,
                confidence: probs[maxIdx] * 100,
                class: classes[maxIdx],
            };
        } catch (error) {
            return this.fallbackBotPrediction(features);
        }
    }

    // Fallback statistical prediction when TensorFlow not available
    private fallbackAnomalyPrediction(features: number[]): PredictionResult {
        // Simple weighted scoring
        const weights = [0.25, 0.15, 0.15, 0.1, 0.1, 0.1, 0.1, 0.05];
        let score = 0;
        for (let i = 0; i < features.length; i++) {
            score += features[i] * weights[i];
        }

        // Adjust: high request rate, low timing variance are anomalous
        if (features[0] > 0.5) score += 0.2;
        if (features[2] < 0.1) score += 0.15;

        score = Math.min(1, Math.max(0, score));

        return {
            prediction: score,
            confidence: Math.abs(score - 0.5) * 2 * 100,
            class: score > 0.5 ? 'anomaly' : 'normal',
        };
    }

    private fallbackBotPrediction(features: number[]): PredictionResult {
        // Scoring based on features
        let humanScore = 0;
        let botScore = 0;

        // High request rate = bot
        if (features[0] > 0.3) botScore += 0.3;
        else humanScore += 0.2;

        // High timing variance = human
        if (features[2] > 0.3) humanScore += 0.3;
        else botScore += 0.2;

        // More headers = human
        if (features[3] > 0.5) humanScore += 0.2;
        else botScore += 0.1;

        // Complex UA = human
        if (features[4] > 0.3) humanScore += 0.2;
        else botScore += 0.15;

        const total = humanScore + botScore;
        const humanProb = humanScore / total;

        if (humanProb > 0.6) {
            return { prediction: 0, confidence: humanProb * 100, class: 'human' };
        } else if (humanProb < 0.4) {
            return { prediction: 2, confidence: (1 - humanProb) * 100, class: 'bad_bot' };
        } else {
            return { prediction: 1, confidence: 50, class: 'good_bot' };
        }
    }

    // Train model with new data
    async train(data: TrainingData, epochs: number = 10): Promise<{ loss: number; accuracy: number } | null> {
        if (!this.modelLoaded || !this.tf) {
            console.log('[ML] Cannot train - TensorFlow not loaded');
            return null;
        }

        try {
            const xs = this.tf.tensor2d(data.features);
            const ys = this.tf.tensor2d(data.labels.map(l => [l]));

            const history = await this.anomalyModel.fit(xs, ys, {
                epochs,
                batchSize: 32,
                validationSplit: 0.2,
                verbose: 0,
            });

            xs.dispose();
            ys.dispose();

            const lastEpoch = history.history;
            return {
                loss: lastEpoch.loss[lastEpoch.loss.length - 1],
                accuracy: lastEpoch.acc[lastEpoch.acc.length - 1],
            };
        } catch (error) {
            console.error('[ML] Training error:', error);
            return null;
        }
    }

    // Add training sample
    addTrainingSample(features: number[], label: number): void {
        this.trainingHistory.features.push(features);
        this.trainingHistory.labels.push(label);

        // Auto-train when we have enough samples
        if (this.trainingHistory.features.length >= 100) {
            this.train(this.trainingHistory, 5).then(() => {
                console.log('[ML] Auto-training completed');
                this.trainingHistory = { features: [], labels: [] };
            });
        }
    }

    // Get model status
    getStatus(): {
        tensorflowLoaded: boolean;
        anomalyModelReady: boolean;
        botModelReady: boolean;
        trainingSamples: number;
    } {
        return {
            tensorflowLoaded: this.modelLoaded,
            anomalyModelReady: !!this.anomalyModel,
            botModelReady: !!this.botModel,
            trainingSamples: this.trainingHistory.features.length,
        };
    }

    // Save model (to localStorage in browser or file in Node)
    async saveModel(path: string): Promise<boolean> {
        if (!this.modelLoaded || !this.anomalyModel) return false;
        try {
            await this.anomalyModel.save(`file://${path}/anomaly-model`);
            await this.botModel.save(`file://${path}/bot-model`);
            return true;
        } catch (error) {
            console.error('[ML] Save error:', error);
            return false;
        }
    }

    // Load model
    async loadModel(path: string): Promise<boolean> {
        if (!this.tf) return false;
        try {
            this.anomalyModel = await this.tf.loadLayersModel(`file://${path}/anomaly-model/model.json`);
            this.botModel = await this.tf.loadLayersModel(`file://${path}/bot-model/model.json`);
            return true;
        } catch (error) {
            console.error('[ML] Load error:', error);
            return false;
        }
    }
}

export const tensorflowML = new TensorFlowMLService();
export { extractFeatures as extractMLFeatures };
