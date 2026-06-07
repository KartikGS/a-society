import { describe, expect, it } from 'vitest';
import { HandoffInterpreter, HandoffParseError } from '../../src/orchestration/handoff.js';

function expectHandoffError(fn: () => unknown): HandoffParseError {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(HandoffParseError);
    return error as HandoffParseError;
  }
  throw new Error('Expected HandoffParseError to be thrown.');
}

describe('handoff-interpreter', () => {
  it('parses a single-object handoff target', () => {
    const text = 'Some text before.\n```handoff\ntarget_node_id: owner-review\nartifact_path: path/to/file.md\n```';

    const result = HandoffInterpreter.parse(text);

    expect(result).toMatchObject({
      kind: 'targets',
      targets: [{ target_node_id: 'owner-review', artifact_path: 'path/to/file.md' }],
    });
  });

  it('parses an array of multiple handoff targets', () => {
    const text = 'Fork point reached.\n```handoff\n- target_node_id: framework-services-implementation\n  artifact_path: path/a.md\n- target_node_id: orchestration-implementation\n  artifact_path: path/b.md\n```';

    const result = HandoffInterpreter.parse(text);

    expect(result).toMatchObject({
      kind: 'targets',
      targets: [
        { target_node_id: 'framework-services-implementation', artifact_path: 'path/a.md' },
        { target_node_id: 'orchestration-implementation', artifact_path: 'path/b.md' },
      ],
    });
  });

  it('handles null artifact_path', () => {
    const text = '```handoff\ntarget_node_id: curator-proposal\nartifact_path: null\n```';

    const result = HandoffInterpreter.parse(text);

    expect(result).toMatchObject({
      kind: 'targets',
      targets: [{ artifact_path: null }],
    });
  });

  it('parses forward-pass-closed signal', () => {
    const result = HandoffInterpreter.parse('```handoff\ntype: forward-pass-closed\n```');

    expect(result.kind).toBe('forward-pass-closed');
  });

  it('parses meta-analysis-complete signal', () => {
    const text = '```handoff\ntype: meta-analysis-complete\nfindings_path: .a-society/state/a-society/example-flow/record/findings/owner-findings.md\n```';

    const result = HandoffInterpreter.parse(text);

    expect(result).toMatchObject({
      kind: 'meta-analysis-complete',
      findingsPath: '.a-society/state/a-society/example-flow/record/findings/owner-findings.md',
    });
  });

  it('parses backward-pass-complete signal', () => {
    const text = '```handoff\ntype: backward-pass-complete\nartifact_path: .a-society/state/a-society/example-flow/record/12-owner-feedback.md\n```';

    const result = HandoffInterpreter.parse(text);

    expect(result).toMatchObject({
      kind: 'backward-pass-complete',
      artifactPath: '.a-society/state/a-society/example-flow/record/12-owner-feedback.md',
    });
  });

  it('parses prompt-human signal as awaiting_human', () => {
    const result = HandoffInterpreter.parse('```handoff\ntype: prompt-human\n```');

    expect(result.kind).toBe('awaiting_human');
  });

  it('throws invalid_target_shape for an empty target array', () => {
    const error = expectHandoffError(() => HandoffInterpreter.parse('```handoff\n[]\n```'));

    expect(error.details.code).toBe('invalid_target_shape');
    expect(error.details.modelRepairMessage).toContain('at least one target');
  });

  it('throws missing_required_field for missing or empty target_node_id', () => {
    const error = expectHandoffError(() => HandoffInterpreter.parse('```handoff\nartifact_path: some/path.md\n```'));

    expect(error.details.code).toBe('missing_required_field');
    expect(error.details.operatorSummary).toBe('Handoff block missing required field');

    const emptyTargetError = expectHandoffError(() => HandoffInterpreter.parse("```handoff\n- target_node_id: ' '\n  artifact_path: p.md\n```"));
    expect(emptyTargetError.details.code).toBe('missing_required_field');
  });

  it('throws yaml_parse for malformed YAML', () => {
    const error = expectHandoffError(() => HandoffInterpreter.parse('```handoff\n - target_node_id: owner-review\n  - artifact_path: p.md\n```'));

    expect(error.details.code).toBe('yaml_parse');
    expect(error.details.operatorSummary).toBe('Malformed handoff block');
    expect(error.details.modelRepairMessage).toContain('could not be parsed as YAML');
  });

  it('throws unknown_signal_type with operator summary naming the type', () => {
    const error = expectHandoffError(() => HandoffInterpreter.parse('```handoff\ntype: unknown-signal\n```'));

    expect(error.details.code).toBe('unknown_signal_type');
    expect(error.details.operatorSummary).toContain('unknown-signal');
    expect(error.details.modelRepairMessage).toContain('forward-pass-closed');
  });

  it('throws missing_required_field for typed signals missing required fields', () => {
    const findingsError = expectHandoffError(() => HandoffInterpreter.parse('```handoff\ntype: meta-analysis-complete\n```'));
    expect(findingsError.details.code).toBe('missing_required_field');
    expect(findingsError.details.modelRepairMessage).toContain('missing findings_path');

    const backwardError = expectHandoffError(() => HandoffInterpreter.parse('```handoff\ntype: backward-pass-complete\n```'));
    expect(backwardError.details.code).toBe('missing_required_field');
    expect(backwardError.details.modelRepairMessage).toContain('missing artifact_path');
  });

  it('throws missing_block when no handoff block exists', () => {
    const error = expectHandoffError(() => HandoffInterpreter.parse('```yaml\ntarget_node_id: owner-review\n```'));

    expect(error.details.code).toBe('missing_block');
    expect(error.details.operatorSummary).toBe('Malformed handoff block');
  });

  it('uses distinct codes and summaries for malformed handoff and unsupported signal', () => {
    const malformedError = expectHandoffError(() => HandoffInterpreter.parse('```handoff\n - target_node_id: owner-review\n  - bad: yaml\n```'));
    const unknownError = expectHandoffError(() => HandoffInterpreter.parse('```handoff\ntype: some-future-type\n```'));

    expect(malformedError.details.code).not.toBe(unknownError.details.code);
    expect(malformedError.details.operatorSummary).not.toBe(unknownError.details.operatorSummary);
  });
});
