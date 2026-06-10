import './WordDetail.css';

function WordDetail({ clue, onClose }) {
  if (!clue) return null;

  const d = clue.details;
  if (!d) return null;

  return (
    <div className="word-detail-overlay" onClick={onClose}>
      <div className="word-detail-modal" onClick={e => e.stopPropagation()}>
        <button className="word-detail-close" onClick={onClose}>x</button>

        <div className="word-detail-header">
          <h2>{clue.article ? `${clue.article} ${clue.word}` : clue.word}</h2>
          <span className={`level-badge ${clue.level.toLowerCase()}`}>{clue.level}</span>
        </div>

        <p className="word-detail-translation">{clue.clue}</p>

        {d.gender && (
          <div className="word-detail-section">
            <span className="word-detail-label">Gender</span>
            <span className="word-detail-value">{d.gender}</span>
            {d.plural && <span className="word-detail-value"> | Plural: {d.plural}</span>}
          </div>
        )}

        {d.cases && (
          <div className="word-detail-section">
            <span className="word-detail-label">Cases</span>
            <table className="cases-table">
              <tbody>
                <tr><td>Nominativ</td><td>{d.cases.nominative}</td></tr>
                <tr><td>Akkusativ</td><td>{d.cases.accusative}</td></tr>
                <tr><td>Dativ</td><td>{d.cases.dative}</td></tr>
                <tr><td>Genitiv</td><td>{d.cases.genitive}</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {d.etymology && (
          <div className="word-detail-section">
            <span className="word-detail-label">Etymology</span>
            <p>{d.etymology}</p>
          </div>
        )}

        {d.examples && d.examples.length > 0 && (
          <div className="word-detail-section">
            <span className="word-detail-label">Examples</span>
            <ul className="examples-list">
              {d.examples.map((ex, i) => <li key={i}>{ex}</li>)}
            </ul>
          </div>
        )}

        {d.usage && (
          <div className="word-detail-section">
            <span className="word-detail-label">Usage</span>
            <p>{d.usage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WordDetail;
