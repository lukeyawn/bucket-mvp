import { useEffect } from 'react';
import { CircleUser, Compass, ListOrdered, Map as MapIcon } from 'lucide-react';
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { LocationIntro } from './components/LocationIntro';
import { SimulatedBanner } from './components/SimulatedBanner';
import { refreshHere } from './lib/location';
import { useStore } from './lib/store';
import { BucketsScreen } from './screens/BucketsScreen';
import { CollectFlow } from './screens/CollectFlow';
import { FeedScreen } from './screens/FeedScreen';
import { ListScreen } from './screens/ListScreen';
import { MapScreen } from './screens/MapScreen';
import { NotFound } from './screens/NotFound';
import { PlaceScreen } from './screens/PlaceScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { RankFlow } from './screens/RankFlow';
import { RankingsScreen } from './screens/RankingsScreen';
import { WantToGoScreen } from './screens/WantToGoScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}

function Shell() {
  const { pathname } = useLocation();
  const seenIntro = useStore((s) => s.settings.seenLocationIntro);
  const inFlow = pathname.startsWith('/collect/') || pathname.startsWith('/rank/');
  const onMap = pathname === '/map';

  // Read the position once at launch for the "you are here" dot (after the intro on first launch).
  useEffect(() => {
    if (seenIntro) refreshHere();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // New screens start at the top.
  useEffect(() => {
    document.querySelector('.screen')?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="phone" id="phone">
      <SimulatedBanner />
      {onMap ? (
        <MapScreen />
      ) : (
        <main className="screen">
          <Routes>
            <Route path="/" element={<FeedScreen />} />
            <Route path="/place/:id" element={<PlaceScreen />} />
            <Route path="/collect/:id" element={<CollectFlow />} />
            <Route path="/rank/:id" element={<RankFlow />} />
            <Route path="/rankings" element={<RankingsScreen />} />
            <Route path="/buckets" element={<BucketsScreen />} />
            <Route path="/buckets/:listId" element={<ListScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/want-to-go" element={<WantToGoScreen />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      )}
      {!inFlow && <TabBar />}
      <LocationIntro />
    </div>
  );
}

function TabBar() {
  return (
    <nav className="tabbar" aria-label="Main">
      <NavLink to="/" end>
        <Compass size={22} aria-hidden="true" />
        Discover
      </NavLink>
      <NavLink to="/map">
        <MapIcon size={22} aria-hidden="true" />
        Map
      </NavLink>
      <NavLink to="/buckets">
        <BucketIcon />
        Buckets
      </NavLink>
      <NavLink to="/rankings">
        <ListOrdered size={22} aria-hidden="true" />
        Rankings
      </NavLink>
      <NavLink to="/profile">
        <CircleUser size={22} aria-hidden="true" />
        Profile
      </NavLink>
    </nav>
  );
}

/** Line icon in Lucide's style: a plain bucket with a handle. */
function BucketIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 9 C5 3, 19 3, 19 9" />
      <path d="M3.5 9 H20.5 L18.5 20 A1.5 1.5 0 0 1 17 21 H7 A1.5 1.5 0 0 1 5.5 20 Z" />
      <path d="M5 14 H19" />
    </svg>
  );
}
