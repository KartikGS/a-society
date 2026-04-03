import { HandoffInterpreter } from './runtime/src/handoff.js';
const text = "Okay, I am done.\n```yaml\nhandoff:\n  role: 'Next'\n  artifact_path: 'mock.md'\n```";
try {
  console.log(HandoffInterpreter.parse(text));
} catch(e) {
  console.error(e);
}
