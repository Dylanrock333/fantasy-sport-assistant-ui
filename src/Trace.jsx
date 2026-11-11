function formatDuration(ms) {
  if (ms == null) return null
  return `${(ms / 1000).toFixed(1)}s`
}

function LlmStats({ llm }) {
  if (!llm) return null
  const rows = [
    ['Model', llm.model],
    ['Finish reason', llm.finish_reason],
    ['Input tokens', llm.input_tokens],
    ['Output tokens', llm.output_tokens],
    ['Thinking tokens', llm.thinking_tokens],
    ['Cached tokens', llm.cached_tokens],
  ].filter(([, v]) => v !== undefined && v !== null)

  return (
    <table className="llm-stats">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <td className="llm-stats-label">{label}</td>
            <td className="llm-stats-value">{String(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function JsonBlock({ data }) {
  let text = data
  if (typeof data === 'string') {
    try {
      text = JSON.stringify(JSON.parse(data), null, 2)
    } catch {
      text = data
    }
  } else {
    text = JSON.stringify(data, null, 2)
  }
  return <pre className="json-block">{text}</pre>
}

function ToolCard({ call, result }) {
  return (
    <div className="tool-card">
      <div className="tool-card-name">Tool: {call.name}</div>
      <div className="tool-card-label">Args:</div>
      <JsonBlock data={call.args} />
      {result && (
        <details className="trace-toggle">
          <summary>
            View result{result.duration_ms != null ? ` (${formatDuration(result.duration_ms)})` : ''} ▾
          </summary>
          <JsonBlock data={result.result} />
        </details>
      )}
    </div>
  )
}

function Round({ round }) {
  const llm = round.llm_call || {}
  return (
    <details className="trace-row trace-row-l3">
      <summary>
        Round {round.round} · {llm.finish_reason} · {llm.input_tokens} in / {llm.output_tokens} out
        tokens
      </summary>
      <div className="trace-row-body">
        {(round.tool_calls || []).map((call, i) => (
          <ToolCard key={i} call={call} result={round.tool_results?.[i]} />
        ))}
      </div>
    </details>
  )
}

function SubAgent({ agent }) {
  const rounds = agent.rounds || []
  const roundLabel = `${agent.tool_rounds ?? rounds.length} tool round${
    (agent.tool_rounds ?? rounds.length) === 1 ? '' : 's'
  }`
  return (
    <details className="trace-row trace-row-l2">
      <summary>
        {agent.category} · {formatDuration(agent.duration_ms)} · {roundLabel}
      </summary>
      <div className="trace-row-body">
        {rounds.map((round) => (
          <Round key={round.round} round={round} />
        ))}
      </div>
    </details>
  )
}

function Supervisor({ supervisor }) {
  return (
    <details className="trace-row">
      <summary>Planner · {formatDuration(supervisor.duration_ms)}</summary>
      <div className="trace-row-body">
        {supervisor.reasoning && (
          <div className="trace-field">
            <span className="trace-field-label">Reasoning:</span> {supervisor.reasoning}
          </div>
        )}
        {supervisor.categories?.length > 0 && (
          <div className="trace-chips">
            {supervisor.categories.map((cat) => (
              <span key={cat} className="trace-chip">
                {cat}
              </span>
            ))}
          </div>
        )}
        <LlmStats llm={supervisor.llm_call} />
      </div>
    </details>
  )
}

function Personality({ personality }) {
  const thinkingTokens = personality.llm_call?.thinking_tokens
  return (
    <details className="trace-row">
      <summary>Voice · {formatDuration(personality.duration_ms)}</summary>
      <div className="trace-row-body">
        {personality.text && (
          <div className="trace-field">
            <span className="trace-field-label">Final text:</span> {personality.text}
          </div>
        )}
        {personality.thinking != null && (
          <details className="trace-toggle">
            <summary>
              Thinking{thinkingTokens != null ? ` (${thinkingTokens.toLocaleString()} tokens)` : ''} ▾
            </summary>
            <pre className="text-block">{personality.thinking}</pre>
          </details>
        )}
        <LlmStats llm={personality.llm_call} />
      </div>
    </details>
  )
}

function SubAgentRuns({ subAgents }) {
  return (
    <details className="trace-row">
      <summary>Sub-Agent Runs ({subAgents.length})</summary>
      <div className="trace-row-body">
        {subAgents.map((agent, i) => (
          <SubAgent key={agent.category ?? i} agent={agent} />
        ))}
      </div>
    </details>
  )
}

export default function Trace({ trace }) {
  if (!trace) return null
  const { supervisor, sub_agents, personality } = trace

  return (
    <details className="trace-toggle trace-toggle-root">
      <summary>Show reasoning trace ▾</summary>
      <div className="trace-body">
        {supervisor && <Supervisor supervisor={supervisor} />}
        {sub_agents && <SubAgentRuns subAgents={sub_agents} />}
        {personality && <Personality personality={personality} />}
      </div>
    </details>
  )
}
