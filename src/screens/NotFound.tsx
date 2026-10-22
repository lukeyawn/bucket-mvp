import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="empty">
      <h2>Nothing here</h2>
      <Link to="/map">Back to the map</Link>
    </div>
  );
}
