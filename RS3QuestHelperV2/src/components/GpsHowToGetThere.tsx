import type { StepHowToGetThere } from '../types/quest-data';

interface GpsHowToGetThereProps {
  howTo: StepHowToGetThere;
}

export default function GpsHowToGetThere({ howTo }: GpsHowToGetThereProps) {
  return (
    <div className="gps-card gps-how-to-get">
      <div className="gps-card-label">How to Get There</div>
      <div className="gps-htg-row">
        <span className="gps-htg-key">Location</span>
        <span className="gps-htg-val">{howTo.location}</span>
      </div>
      <div className="gps-htg-row">
        <span className="gps-htg-key">Fastest route</span>
        <span className="gps-htg-val gps-htg-fast">{howTo.fastestRoute}</span>
      </div>
      {howTo.alternativeRoute && (
        <div className="gps-htg-row">
          <span className="gps-htg-key">Alternative</span>
          <span className="gps-htg-val">{howTo.alternativeRoute}</span>
        </div>
      )}
      <div className="gps-htg-row gps-htg-lost">
        <span className="gps-htg-key">If lost</span>
        <span className="gps-htg-val">{howTo.ifLost}</span>
      </div>
    </div>
  );
}
