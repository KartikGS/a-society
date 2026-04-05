import assert from 'node:assert';
let passed = 0;
let failed = 0;
function test(name, fn) {
    try {
        fn();
        console.log(`  ✓ ${name}`);
        passed++;
    }
    catch (err) {
        console.error(`  ✗ ${name}`);
        console.error(`    ${err.message}`);
        failed++;
    }
}
console.log('\ntypes');
test('FlowRun: conforms to new multi-node structure', () => {
    const flowRun = {
        flowId: 'f1',
        projectRoot: '.',
        recordFolderPath: './records/r1',
        activeNodes: ['node1'],
        completedNodes: [],
        completedNodeArtifacts: {},
        pendingNodeArtifacts: { 'node1': ['artifact.md'] },
        status: 'initialized',
        stateVersion: '2'
    };
    assert.strictEqual(flowRun.activeNodes.length, 1);
    assert.strictEqual(flowRun.completedNodes.length, 0);
    assert.ok(flowRun.pendingNodeArtifacts['node1']);
    assert.strictEqual(flowRun.pendingNodeArtifacts['node1'][0], 'artifact.md');
});
console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0)
    process.exit(1);
