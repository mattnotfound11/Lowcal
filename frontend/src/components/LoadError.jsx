export default function LoadError({ error }) {
  return (
    <div className="alert" role="alert">
      Couldn't reach the Lowcal server ({error?.message || 'unknown error'}). Make sure the backend is running with
      <code> npm run dev</code> from the project root, then refresh.
    </div>
  );
}
