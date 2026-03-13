import { BrowserRouter, Routes, Route, Link, useParams, useSearchParams } from 'react-router-dom';
import { EditableCanvas, PersonalStyleMode } from '@bmm/ui';
import fixtureSimple from './fixtures/fixture-simple.bmm.json';
import fixtureEmpty from './fixtures/fixture-empty.bmm.json';
import fixtureTextCentral from './fixtures/fixture-text-central.bmm.json';
import fixtureManyBranches from './fixtures/fixture-many-branches.bmm.json';
import fixtureFlat from './fixtures/fixture-flat.bmm.json';
import fixtureHealth from './fixtures/fixture-health.bmm.json';
import fixtureCluster from './fixtures/fixture-cluster.bmm.json';
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
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Buzan Mind Mapper</h1>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
