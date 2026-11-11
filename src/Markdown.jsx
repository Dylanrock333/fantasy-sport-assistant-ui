function renderInline(text, keyPrefix) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

export default function Markdown({ text }) {
  const lines = text.split('\n')
  const blocks = []
  let currentList = null

  for (const line of lines) {
    const bulletMatch = line.match(/^[*-]\s+(.*)/)
    if (bulletMatch) {
      if (!currentList) {
        currentList = []
        blocks.push(currentList)
      }
      currentList.push(bulletMatch[1])
    } else {
      currentList = null
      blocks.push(line)
    }
  }

  return blocks.map((block, i) => {
    if (Array.isArray(block)) {
      return (
        <ul key={i} className="md-list">
          {block.map((item, j) => (
            <li key={j}>{renderInline(item, `${i}-${j}`)}</li>
          ))}
        </ul>
      )
    }
    if (block === '') return null
    return <p key={i} className="md-line">{renderInline(block, i)}</p>
  })
}
