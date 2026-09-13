import { RiskEngine, DEFAULT_RISK_WEIGHTS } from '../services/riskEngine';

async function runTests() {
  console.log('--- Starting MindGuard AI Risk Engine Tests ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  const engine = new RiskEngine();

  // Test 1: Normal Vitals
  const normalResult = await engine.analyze({
    heartRate: 72,
    spo2: 98,
    steps: 6420,
    sleepHours: 7.33,
    moodScore: 6,
    voiceStress: 'LOW'
  });
  assert(normalResult.riskScore <= 30, `Normal scenario score (${normalResult.riskScore}) should be <= 30`);
  assert(normalResult.riskLevel === 'NORMAL', `Normal scenario level should be NORMAL (got ${normalResult.riskLevel})`);
  assert(normalResult.disclaimer.includes('Not a Medical Diagnostic Model'), 'Disclaimer must be present');

  // Test 2: Moderate Vitals
  const moderateResult = await engine.analyze({
    heartRate: 88,
    spo2: 97,
    steps: 3500,
    sleepHours: 6.0,
    moodScore: 5,
    voiceStress: 'MEDIUM'
  });
  assert(
    moderateResult.riskScore >= 31 && moderateResult.riskScore <= 60,
    `Moderate scenario score (${moderateResult.riskScore}) should be 31-60`
  );
  assert(moderateResult.riskLevel === 'MODERATE', `Moderate scenario level should be MODERATE`);

  // Test 3: Prompt High-Stress Scenario
  // Heart rate: 105, Sleep: 4.5h, Activity: low, Mood: 3/10, Voice stress: High
  const highStressResult = await engine.analyze({
    heartRate: 105,
    spo2: 96,
    steps: 1200,
    sleepHours: 4.5,
    moodScore: 3,
    voiceStress: 'HIGH'
  });
  assert(
    highStressResult.riskScore >= 75,
    `High stress scenario score (${highStressResult.riskScore}) should be elevated (>=75)`
  );
  assert(
    highStressResult.riskLevel === 'HIGH' || highStressResult.riskLevel === 'VERY HIGH',
    `High stress scenario level should be HIGH or VERY HIGH (got ${highStressResult.riskLevel})`
  );
  assert(highStressResult.contributingFactors.length === 6, 'Should report 6 contributing factors');
  assert(
    highStressResult.recommendations.some((r) => r.toLowerCase().includes('breathing')),
    'Recommendations should mention breathing'
  );

  // Test 4: Custom Configurable Weights
  const customEngine = new RiskEngine({
    heartRate: 0.50, // elevate HR importance
    sleep: 0.10,
    mood: 0.10,
    activity: 0.10,
    voiceStress: 0.15,
    spo2: 0.05
  });
  const customWeights = customEngine.getWeights();
  assert(customWeights.heartRate === 0.50, 'Custom weights should reflect new heartRate weight');

  console.log(`\nTests Completed: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
