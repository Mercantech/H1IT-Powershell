import { coreLearningGoals, getPinsForCoreGoal } from '../../data/learningGoals';
import './PresentationLearningGoalsSlide.css';

export function PresentationLearningGoalsSlide() {
  return (
    <div className="pres-learning-goals">
      <h2 className="pres-heading">Læringsmål</h2>
      <p className="pres-learning-goals-lead">
        Tre mål I kan forholde jer til — bygget på 9 målpinde fra pensum.
      </p>

      <div className="pres-learning-goals-grid">
        {coreLearningGoals.map((goal) => (
          <article key={goal.id} className="pres-learning-goal">
            <span className="pres-learning-goal-num">Mål {goal.id}</span>
            <h3>{goal.title}</h3>
            <p className="pres-learning-goal-summary">{goal.summary}</p>
            <ul>
              {goal.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <p className="pres-learning-pins-label">
              {getPinsForCoreGoal(goal.id).length > 0 ? 'Målpinde:' : 'Pensum:'}
            </p>
            {getPinsForCoreGoal(goal.id).length > 0 ? (
              <ul className="pres-learning-pins">
                {getPinsForCoreGoal(goal.id).map((pin) => (
                  <li key={pin.id}>
                    <span className="pres-pin-id">{pin.id}</span> {pin.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="pres-learning-pins-empty">Projektfokus — kobles på Dag 1, 2 og Projektkobling</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
