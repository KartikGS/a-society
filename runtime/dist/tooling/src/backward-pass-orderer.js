import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { extractFrontmatter } from './utils.js';
export function parseRecordWorkflowFrontmatter(doc) {
    if (!doc || typeof doc !== 'object') {
        throw new Error('workflow.md frontmatter must parse to an object');
    }
    const rawWorkflow = doc.workflow;
    if (!rawWorkflow || typeof rawWorkflow !== 'object') {
        throw new Error('workflow.md frontmatter must contain a workflow object');
    }
    const workflowObj = rawWorkflow;
    const rawNodes = workflowObj.nodes;
    if (!Array.isArray(rawNodes) || rawNodes.length === 0) {
        throw new Error('workflow.nodes must be a non-empty array');
    }
    const nodes = rawNodes.map((node, index) => {
        if (!node || typeof node !== 'object') {
            throw new Error(`workflow.nodes[${index}] must be an object`);
        }
        const nodeObj = node;
        const id = nodeObj.id;
        const role = nodeObj.role;
        if (typeof id !== 'string' || id.trim() === '') {
            throw new Error(`workflow.nodes[${index}].id must be a non-empty string`);
        }
        if (typeof role !== 'string' || role.trim() === '') {
            throw new Error(`workflow.nodes[${index}].role must be a non-empty string`);
        }
        return {
            id,
            role,
            'human-collaborative': typeof nodeObj['human-collaborative'] === 'string' ? nodeObj['human-collaborative'] : undefined,
        };
    });
    const rawEdges = workflowObj.edges ?? [];
    if (!Array.isArray(rawEdges)) {
        throw new Error('workflow.edges must be an array');
    }
    const edges = rawEdges.map((edge, index) => {
        if (!edge || typeof edge !== 'object') {
            throw new Error(`workflow.edges[${index}] must be an object`);
        }
        const edgeObj = edge;
        const from = edgeObj.from;
        const to = edgeObj.to;
        if (typeof from !== 'string' || from.trim() === '') {
            throw new Error(`workflow.edges[${index}].from must be a non-empty string`);
        }
        if (typeof to !== 'string' || to.trim() === '') {
            throw new Error(`workflow.edges[${index}].to must be a non-empty string`);
        }
        return {
            from,
            to,
            artifact: typeof edgeObj.artifact === 'string' ? edgeObj.artifact : undefined,
        };
    });
    return {
        workflow: {
            name: typeof workflowObj.name === 'string' ? workflowObj.name : undefined,
            nodes,
            edges,
        },
    };
}
export function buildBackwardPassPlan(nodes, edges, synthesisRole, mode) {
    const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]));
    const hasOutgoing = new Set(edges.map(e => e.from));
    const terminalIds = nodes.map(n => n.id).filter(id => !hasOutgoing.has(id));
    if (terminalIds.length === 0) {
        throw new Error('workflow.nodes must produce at least one terminal node');
    }
    if (mode === 'parallel') {
        const roles = Array.from(new Set(nodes.map(n => n.role)));
        const metaAnalysisGroup = roles.map(role => ({
            role,
            stepType: 'meta-analysis',
            sessionInstruction: 'existing-session',
            findingsRolesToInject: [],
        }));
        const synthesisGroup = [{
                role: synthesisRole,
                stepType: 'synthesis',
                sessionInstruction: 'new-session',
                findingsRolesToInject: [],
            }];
        return [metaAnalysisGroup, synthesisGroup];
    }
    // mode === 'graph-based'
    // Step 1: Compute topological order position (BFS from sources)
    const incomingCount = {};
    const children = {};
    for (const node of nodes) {
        incomingCount[node.id] = 0;
        children[node.id] = [];
    }
    for (const edge of edges) {
        incomingCount[edge.to] = (incomingCount[edge.to] ?? 0) + 1;
        children[edge.from].push(edge.to);
    }
    const sources = nodes.filter(n => incomingCount[n.id] === 0).map(n => n.id);
    const topologicalOrder = [];
    const queue = [...sources];
    const processedIncoming = { ...incomingCount };
    while (queue.length > 0) {
        const currentId = queue.shift();
        topologicalOrder.push(currentId);
        for (const childId of children[currentId]) {
            processedIncoming[childId]--;
            if (processedIncoming[childId] === 0) {
                queue.push(childId);
            }
        }
    }
    const nodePosition = Object.fromEntries(topologicalOrder.map((id, index) => [id, index]));
    // Step 2: First occurrence position per role
    const firstOccurrencePosition = {};
    for (const node of nodes) {
        const pos = nodePosition[node.id];
        if (pos !== undefined) {
            if (firstOccurrencePosition[node.role] === undefined || pos < firstOccurrencePosition[node.role]) {
                firstOccurrencePosition[node.role] = pos;
            }
        }
    }
    // Step 3: Direct successor roles per role
    const directSuccessorRoles = {};
    for (const edge of edges) {
        const fromRole = nodeById[edge.from].role;
        const toRole = nodeById[edge.to].role;
        if (!directSuccessorRoles[fromRole])
            directSuccessorRoles[fromRole] = new Set();
        directSuccessorRoles[fromRole].add(toRole);
    }
    // Step 4: Backward pass grouping (BFS from terminals through predecessors)
    const predecessors = {};
    for (const edge of edges) {
        predecessors[edge.to] = [...(predecessors[edge.to] ?? []), edge.from];
    }
    const nodeDistance = {};
    const backQueue = [...terminalIds];
    terminalIds.forEach(id => { nodeDistance[id] = 0; });
    while (backQueue.length > 0) {
        const current = backQueue.shift();
        const dist = nodeDistance[current];
        for (const pred of (predecessors[current] ?? [])) {
            if (nodeDistance[pred] === undefined) {
                nodeDistance[pred] = dist + 1;
                backQueue.push(pred);
            }
        }
    }
    const roleMaxDistance = {};
    for (const [id, dist] of Object.entries(nodeDistance)) {
        const role = nodeById[id].role;
        roleMaxDistance[role] = Math.max(roleMaxDistance[role] ?? 0, dist);
    }
    const roleGroupsByDist = {};
    for (const [role, dist] of Object.entries(roleMaxDistance)) {
        roleGroupsByDist[dist] = [...(roleGroupsByDist[dist] ?? []), role];
    }
    const sortedRoleDistances = Object.keys(roleGroupsByDist).map(Number).sort((a, b) => a - b);
    const plan = [];
    for (const dist of sortedRoleDistances) {
        const roles = roleGroupsByDist[dist];
        const groupEntries = roles.map(role => {
            const successors = directSuccessorRoles[role] ?? new Set();
            const findingsRolesToInject = Array.from(successors).filter(s => firstOccurrencePosition[s] > firstOccurrencePosition[role]);
            return {
                role,
                stepType: 'meta-analysis',
                sessionInstruction: 'existing-session',
                findingsRolesToInject,
            };
        });
        plan.push(groupEntries);
    }
    // Final Synthesis Step
    plan.push([{
            role: synthesisRole,
            stepType: 'synthesis',
            sessionInstruction: 'new-session',
            findingsRolesToInject: [],
        }]);
    return plan;
}
export function computeBackwardPassPlan(recordFolderPath, synthesisRole, mode) {
    const workflowFilePath = path.join(recordFolderPath, 'workflow.md');
    let content;
    try {
        content = fs.readFileSync(workflowFilePath, 'utf8');
    }
    catch (err) {
        throw new Error(`Cannot read workflow.md at ${workflowFilePath}: ${err.message}`);
    }
    const yamlStr = extractFrontmatter(content);
    if (yamlStr === null) {
        throw new Error(`No YAML frontmatter found in ${workflowFilePath}`);
    }
    let parsed;
    try {
        parsed = yaml.load(yamlStr);
    }
    catch (err) {
        throw new Error(`Invalid YAML in ${workflowFilePath}: ${err.message}`);
    }
    const frontmatter = parseRecordWorkflowFrontmatter(parsed);
    return buildBackwardPassPlan(frontmatter.workflow.nodes, frontmatter.workflow.edges, synthesisRole, mode);
}
function normalizeRoleSlug(role) {
    return role.toLowerCase().replace(/\s+/g, '-');
}
export function locateFindingsFiles(recordFolderPath, roleNames) {
    const filenames = (() => {
        try {
            return fs.readdirSync(recordFolderPath);
        }
        catch {
            return [];
        }
    })();
    const normalizedRequestedRoles = new Set(roleNames.map(normalizeRoleSlug));
    const findingsPattern = /^(\d+)[a-z]?-(.*)-findings\.md$/i;
    const matches = filenames.filter(filename => {
        const match = filename.match(findingsPattern);
        if (!match)
            return false;
        const roleSlug = normalizeRoleSlug(match[2]);
        return normalizedRequestedRoles.has(roleSlug);
    });
    return matches.map(filename => path.relative(process.cwd(), path.join(recordFolderPath, filename)));
}
export function locateAllFindingsFiles(recordFolderPath) {
    const filenames = (() => {
        try {
            return fs.readdirSync(recordFolderPath);
        }
        catch {
            return [];
        }
    })();
    const findingsPattern = /^\d+[a-z]?-(.*)-findings\.md$/i;
    const matches = filenames.filter(filename => findingsPattern.test(filename));
    return matches.map(filename => path.relative(process.cwd(), path.join(recordFolderPath, filename)));
}
