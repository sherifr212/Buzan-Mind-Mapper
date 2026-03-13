import { BrowserRouter, Routes, Route, Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { EditableCanvas, PersonalStyleMode, TutorialFlow, useUserProgressStore } from '@bmm/ui';
import fixtureSimple from './fixtures/fixture-simple.bmm.json';
import fixtureEmpty from './fixtures/fixture-empty.bmm.json';
import fixtureTextCentral from './fixtures/fixture-text-central.bmm.json';
import fixtureManyBranches from './fixtures/fixture-many-branches.bmm.json';
import fixtureFlat from './fixtures/fixture-flat.bmm.json';
import fixtureHealth from './fixtures/fixture-health.bmm.json';
import fixtureCluster from './fixtures/fixture-cluster.bmm.json';
import { TutorialPage } from './TutorialPage';
import type { MindMap } from '@bmm/data-model';

// ─── Fixture registry ─────────────────────────────────────────────────────────

const FIXTURES: Record<string, MindMap> = {
  'test-fixture-simple': fixtureSimple as unknown as MindMap,
  'test-fixture-empty': fixtureEmpty as unknown as MindMap,
  'test-fixture-text-central': fixtureTextCentral as unknown as MindMap,
  'test-fixture-many-branches': fixtureManyBranches as unknown as MindMap,
  'test-fixture-flat': fixtureFlat as unknown as MindMap,
  'test-fixture-health': fixtureHealth as unknown as MindMap,
  'test-fixture-cluster': fixtureCluster as unknown as MindMap,
};

// ─── Map Editor Page ──────────────────────────────────────────────────────────

function MapEditorPage({ mapId }: { mapId: string }) {
  const map = FIXTURES[mapId];
  if (!map) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Map not found: {mapId}</h1>
        <Link to="/">← Home</Link>
      </div>
    );
  }
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <EditableCanvas initialMap={map} />
    </div>
  );
}

// ─── New map page (alias for empty fixture) ───────────────────────────────────

function NewMapPage() {
  const navigate = useNavigate();
  const tutorialComplete = useUserProgressStore((s) => s.tutorialComplete);

  if (!tutorialComplete) {
    return (
      <div style={{ padding: '2rem', maxWidth: 640, margin: '0 auto', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: 24, marginBottom: 16, color: '#1e293b' }}>Create New Map</h1>
        <button
          data-testid="free-create-locked"
          disabled
          style={{
            opacity: 0.4,
            cursor: 'not-allowed',
            padding: '10px 20px',
            fontSize: 14,
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            background: '#f8fafc',
            marginBottom: 24,
            display: 'block',
          }}
        >
          Complete tutorial to unlock
        </button>
        <TutorialFlow
          initialStep={0}
          onComplete={() => {
            useUserProgressStore.getState().setTutorialComplete();
            navigate('/map/new');
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <EditableCanvas initialMap={FIXTURES['test-fixture-empty']} />
    </div>
  );
}

// ─── Route component ──────────────────────────────────────────────────────────

function MapRoute() {
  const { mapId = '' } = useParams<{ mapId: string }>();
  return <MapEditorPage mapId={mapId} />;
}

// ─── Home Page ────────────────────────────────────────────────────────────────

function HomePage() {
  const [searchParams] = useSearchParams();
  const mapsParam = parseInt(searchParams.get('maps') ?? '0', 10);
  const mapsCreated = useUserProgressStore((s) => s.mapsCreated);
  const displayMaps = (!isNaN(mapsParam) && mapsParam > 0) ? mapsParam : mapsCreated;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Buzan Mind Mapper</h1>

      {/* Map progress tracker — always visible */}
      <div
        data-testid="map-progress-tracker"
        style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 10,
          padding: '16px 20px',
          marginBottom: 24,
          maxWidth: 480,
        }}
      >
        <strong style={{ fontSize: 16 }}>{displayMaps} / 100 maps completed</strong>
        <p style={{ margin: '8px 0', color: '#475569', fontSize: 14 }}>
          Buzan recommends 100 maps to fully internalise the laws
        </p>
        <progress value={displayMaps} max={100} style={{ width: '100%' }} />
      </div>

      <p>Open a mind map to start editing:</p>
      <ul>
        {Object.keys(FIXTURES).map((id) => (
          <li key={id}>
            <Link to={`/map/${id}`}>{id}</Link>
          </li>
        ))}
        <li>
          <Link to="/map/new">New Map (empty)</Link>
        </li>
        <li>
          <Link to="/tutorial">Start Tutorial</Link>
        </li>
      </ul>
    </div>
  );
}

// ─── Personal Style Page ──────────────────────────────────────────────────────

function PersonalStylePage() {
  const [searchParams] = useSearchParams();
  const mapsCompleted = parseInt(searchParams.get('maps') ?? '0', 10) || 0;
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: 480, margin: '0 auto' }}>
      <PersonalStyleMode mapsCompleted={mapsCompleted} />
      <p style={{ marginTop: 16 }}>
        <Link to="/">← Home</Link>
      </p>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map/new" element={<NewMapPage />} />
        <Route path="/map/:mapId" element={<MapRoute />} />
        <Route path="/personal-style" element={<PersonalStylePage />} />
        <Route path="/tutorial" element={<TutorialPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
