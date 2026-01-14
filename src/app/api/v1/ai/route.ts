// AI Security API - Anomaly Detection, Bot Classification, Auto-tuning
import { NextRequest, NextResponse } from 'next/server';
import { anomalyDetection } from '@/services/ai/anomaly-detection';
import { botClassifier } from '@/services/ai/bot-classifier';
import { autoTuning } from '@/services/ai/auto-tuning';
import { tensorflowML, extractMLFeatures } from '@/services/ai/tensorflow-ml';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');

    // Get anomaly detection stats
    if (service === 'anomaly') {
        return NextResponse.json({
            stats: anomalyDetection.getStats(),
            recentAnomalies: anomalyDetection.getRecentAnomalies(10),
        });
    }

    // Get bot classifier stats
    if (service === 'bot') {
        return NextResponse.json({
            stats: botClassifier.getStats(),
        });
    }

    // Get auto-tuning stats
    if (service === 'tuning') {
        return NextResponse.json({
            stats: autoTuning.getStats(),
            rulePerformance: autoTuning.getRulePerformance(),
            tuningHistory: autoTuning.getTuningHistory(10),
        });
    }

    // Get ML model status
    if (service === 'ml') {
        return NextResponse.json({
            status: tensorflowML.getStatus(),
        });
    }

    // Default: return all AI stats
    return NextResponse.json({
        status: 'active',
        services: {
            anomalyDetection: {
                enabled: true,
                ...anomalyDetection.getStats(),
            },
            botClassifier: {
                enabled: true,
                ...botClassifier.getStats(),
            },
            autoTuning: {
                ...autoTuning.getStats(),
            },
            tensorflowML: {
                ...tensorflowML.getStatus(),
            },
        },
        updatedAt: new Date().toISOString(),
    });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    // Analyze request for anomalies
    if (body.action === 'analyze') {
        anomalyDetection.recordRequest({
            ip,
            path: body.path || '/',
            method: body.method || 'GET',
            userAgent,
            timestamp: Date.now(),
            requestSize: body.requestSize || 0,
            responseTime: body.responseTime || 0,
            statusCode: body.statusCode || 200,
            headers: body.headers || {},
        });

        const anomalyScore = anomalyDetection.analyzeIP(ip);
        return NextResponse.json({ anomalyScore });
    }

    // Classify bot
    if (body.action === 'classify') {
        const classification = botClassifier.classify(
            ip,
            userAgent,
            body.headers || {},
            body.behavior
        );
        return NextResponse.json({ classification });
    }

    // Report false positive
    if (body.action === 'report_fp') {
        const reportId = autoTuning.reportFalsePositive(
            body.ruleId,
            ip,
            body.path || '/',
            userAgent,
            body.reason
        );
        return NextResponse.json({ success: true, reportId });
    }

    // Verify false positive
    if (body.action === 'verify_fp') {
        const success = autoTuning.verifyFalsePositive(body.reportId, body.isVerified);
        return NextResponse.json({ success });
    }

    // Record rule trigger
    if (body.action === 'record_trigger') {
        autoTuning.recordTrigger(body.ruleId, body.isBlocked);
        return NextResponse.json({ success: true });
    }

    // Run auto-tune
    if (body.action === 'run_tune') {
        const result = autoTuning.runAutoTune();
        return NextResponse.json(result);
    }

    // Set anomaly threshold
    if (body.action === 'set_threshold') {
        anomalyDetection.setThreshold(body.threshold);
        return NextResponse.json({ success: true });
    }

    // Toggle auto-tuning
    if (body.action === 'set_auto_tune') {
        autoTuning.setAutoTune(body.enabled);
        return NextResponse.json({ success: true, enabled: body.enabled });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
