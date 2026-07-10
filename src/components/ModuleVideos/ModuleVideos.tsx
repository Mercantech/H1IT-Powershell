import { getVideosForModule, type VideoModule } from '../../data/videos';
import { YouTubeEmbed } from '../YouTubeEmbed';
import './ModuleVideos.css';

interface ModuleVideosProps {
  module: VideoModule;
}

export function ModuleVideos({ module }: ModuleVideosProps) {
  const videos = getVideosForModule(module);
  if (videos.length === 0) return null;

  return (
    <div className={`module-videos ${videos.length > 1 ? 'module-videos--grid' : ''}`}>
      {videos.map((video) => (
        <figure key={video.id} className="module-video card">
          <YouTubeEmbed
            videoId={video.id}
            title={`PowerShell 7 Tutorials for Beginners #${video.episode}: ${video.title}`}
          />
          <figcaption className="module-video-caption">
            <p className="module-video-label">Video {video.episode}</p>
            <h4>{video.title}</h4>
            <p>{video.summary}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
