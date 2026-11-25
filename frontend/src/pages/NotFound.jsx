import PageHead from '../components/PageHead.jsx';
import Btn from '../components/Btn.jsx';

export default function NotFound() {
  return (
    <div className="page">
      <PageHead eyebrow="Error 404" title="Wrong" accent="turn" jp="迷子">
        <p>This road doesn't go anywhere. Let's get you back on track.</p>
        <div style={{ marginTop: 28 }}><Btn to="/" variant="red">Back home</Btn></div>
      </PageHead>
    </div>
  );
}
