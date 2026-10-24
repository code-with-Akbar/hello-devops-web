export default function Home() {
  return (
    <main className="container">
      <h1>DevOps Lab: hello-devops-web</h1>
      <p>Next.js app, Docker container mein, nginx reverse proxy ke peeche.</p>
      <div className="links">
        <a href="/api/health">/api/health</a>
        <a href="/api/version">/api/version</a>
      </div>
    </main>
  );
}
