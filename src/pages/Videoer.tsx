import { Link } from 'react-router-dom';
import { YouTubeEmbed } from '../components/YouTubeEmbed';
import {
  beginnerPlaylistUrl,
  beginnerVideos,
  dayLabels,
  type VideoDay,
} from '../data/videos';
import './Videoer.css';

const dayOrder: VideoDay[] = ['dag-1', 'dag-2'];

export function Videoer() {
  const byDay = dayOrder.map((day) => ({
    day,
    videos: beginnerVideos.filter((video) => video.relatedDay === day),
  }));

  return (
    <div className="container">
      <header className="page-header">
        <h1>Video-pensum</h1>
        <p>
          Supplerende videoer til jeres undervisning — alle fra Microsofts{' '}
          <em>Beginner PowerShell 7 Tutorials</em>. Se dem her på siden eller
          åbn hele{' '}
          <a href={beginnerPlaylistUrl} target="_blank" rel="noreferrer">
            playlisten på YouTube
          </a>
          .
        </p>
      </header>

      <div className="videoer-intro card">
        <p>
          Videoerne er inddelt efter hvilken undervisningsdag de passer bedst
          til. Brug dem som repetition før eller efter Dag 1 og Dag 2.
        </p>
        <div className="videoer-jump">
          {dayOrder.map((day) => (
            <a key={day} href={`#${day}`} className="btn btn-secondary btn-sm">
              {dayLabels[day]}
            </a>
          ))}
        </div>
      </div>

      {byDay.map(({ day, videos }) => (
        <section key={day} id={day} className="videoer-day">
          <div className="videoer-day-header">
            <h2>{dayLabels[day]}</h2>
            <Link to={`/${day}`} className="project-link">
              → Gå til {dayLabels[day]}
            </Link>
          </div>

          <div className="videoer-grid">
            {videos.map((video) => (
              <article key={video.id} className="videoer-card card">
                <YouTubeEmbed
                  videoId={video.id}
                  title={`PowerShell 7 Tutorials for Beginners #${video.episode}: ${video.title}`}
                />
                <div className="videoer-card-body">
                  <p className="videoer-episode">Video {video.episode}</p>
                  <h3>{video.title}</h3>
                  <p>{video.summary}</p>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="project-link"
                  >
                    Åbn på YouTube ↗
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
