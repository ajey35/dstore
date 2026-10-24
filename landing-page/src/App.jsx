const releasesUrl = 'https://github.com/durability-labs/archivist-desktop/releases/latest';

function BrandMark({ small = false }) {
  return (
    <a className={`brand${small ? ' brand-small' : ''}`} href="#home" aria-label="Archivist home">
      <span className="brand-icon" aria-hidden="true">
        <svg viewBox="0 0 40 40" fill="none">
          <path d="M20 3.5 35 12v16L20 36.5 5 28V12L20 3.5Z" fill="currentColor" />
          <path d="m20 10 9.2 17h-4.7l-4.5-8.6-4.5 8.6h-4.7L20 10Z" fill="#F6F8F3" />
        </svg>
      </span>
      <span>archivist</span>
    </a>
  );
}

function ArrowIcon({ diagonal = false }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="arrow-icon">
      {diagonal ? (
        <path d="M5 15 15 5M6 5h9v9" />
      ) : (
        <path d="M3.5 10h12m-5-5 5 5-5 5" />
      )}
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="download-icon">
      <path d="M10 2.75v9m0 0 3.5-3.5M10 11.75 6.5 8.25M3.5 13.25v3h13v-3" />
    </svg>
  );
}

function PlatformIcon({ name }) {
  if (name === 'Windows') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="m2 5.2 8.2-1.1v7.7H2V5.2Zm9.5-1.3L22 2.5v9.3H11.5V3.9ZM2 13.1h8.2v7.7L2 19.7v-6.6Zm9.5 0H22v9.4l-10.5-1.4v-8Z" />
      </svg>
    );
  }
  if (name === 'macOS') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.1 12.8c0-2.4 2-3.6 2.1-3.7a4.6 4.6 0 0 0-3.6-1.9c-1.5-.2-2.9.9-3.7.9s-2-.9-3.3-.9a4.9 4.9 0 0 0-4.1 2.5c-1.8 3.1-.5 7.7 1.2 10.2.8 1.2 1.8 2.5 3 2.4 1.2-.1 1.7-.8 3.3-.8s2.1.8 3.4.8 2.1-1.2 2.9-2.4a10 10 0 0 0 1.3-2.7 4.2 4.2 0 0 1-2.5-4.4ZM14.7 5.7A4.4 4.4 0 0 0 15.8 2a4.5 4.5 0 0 0-3 1.5 4.1 4.1 0 0 0-1.1 3.6 3.8 3.8 0 0 0 3-1.4Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.1 2a10 10 0 0 0-8.8 14.8L2 22l5.3-1.4A10 10 0 1 0 12.1 2Zm0 18.2a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-3.1.8.8-3-.2-.4a8.2 8.2 0 1 1 6.9 3.9Zm4.5-6.2c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8.9-.1.2-.3.2-.5.1-.2-.1-1-.4-2-1.2-.8-.7-1.3-1.5-1.5-1.7-.1-.2 0-.3.1-.4l.4-.4.3-.4c.1-.1 0-.3 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.2-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.7 4.3 3.8.6.3 1.1.4 1.4.5.6.2 1.2.2 1.6.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}

const features = [
  {
    number: '01',
    title: 'Your files, your devices',
    description: 'Sync the folders you choose across your computers. Your workflow stays yours.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="3.5" y="5.5" width="15" height="13" rx="2.5" />
        <path d="M8 23h6m-3-4v4m9-12h8v14h-8z" />
        <path d="m21.5 15 1.5 1.5 3-3" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'A network, not a silo',
    description: 'Move files peer to peer and keep your storage connected to a broader network.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="4" />
        <circle cx="6" cy="8" r="2.5" />
        <circle cx="26" cy="8" r="2.5" />
        <circle cx="6" cy="24" r="2.5" />
        <circle cx="26" cy="24" r="2.5" />
        <path d="m8 9.5 5 4m11-4-5 4m-11 9 5-4m11 4-5-4" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Backups that keep going',
    description: 'Set up a backup peer to make an extra copy of your synced files automatically.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M25.5 15.5a10 10 0 0 0-17.8-5.7L5 13m0 0V7m0 6h6M6.5 17a10 10 0 0 0 17.8 5.7L27 19m0 0v6m0-6h-6" />
        <path d="M16 11v5l3 2" />
      </svg>
    ),
  },
];

const platforms = [
  { name: 'macOS', detail: 'Apple silicon', file: '.dmg' },
  { name: 'Windows', detail: '64-bit', file: '.exe' },
  { name: 'Linux', detail: 'AppImage · .deb', file: '.AppImage / .deb' },
];

function App() {
  return (
    <div id="home" className="site-shell">
      <div className="announcement">
        <span className="announcement-dot" />
        Archivist is in alpha — help shape what comes next
        <a href="https://github.com/durability-labs/archivist-desktop" target="_blank" rel="noreferrer">
          Explore the project <ArrowIcon diagonal />
        </a>
      </div>

      <header className="site-header">
        <BrandMark />
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#downloads">Downloads</a>
        </nav>
        <a className="header-cta" href="#downloads">
          Get Archivist <ArrowIcon />
        </a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span /> A calmer home for your files</div>
            <h1>Your files.<br /><span>Your devices.</span><br />All in sync.</h1>
            <p className="hero-description">
              Keep your important folders moving between devices with peer-to-peer storage
              and backups that work quietly in the background.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#downloads">
                <DownloadIcon /> Get Archivist <ArrowIcon />
              </a>
              <a className="text-link" href="#how-it-works">See how it works <ArrowIcon /></a>
            </div>
            <div className="hero-proof">
              <span className="proof-icon">↗</span>
              <span>Open source</span><i />
              <span>Peer to peer</span><i />
              <span>Built for your devices</span>
            </div>
          </div>

          <div className="hero-art" aria-label="Illustration of folders syncing between your devices">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-spark spark-one">✳</div>
            <div className="art-spark spark-two">✳</div>
            <div className="device device-laptop">
              <div className="device-top">
                <div className="window-controls"><b /><b /><b /></div>
                <span>My folders</span>
                <span className="device-menu">•••</span>
              </div>
              <div className="folder-row">
                <span className="folder-emoji">📁</span><span>Projects</span><span className="folder-check">✓</span>
              </div>
              <div className="folder-row">
                <span className="folder-emoji">📁</span><span>Photos</span><span className="folder-check">✓</span>
              </div>
              <div className="folder-row">
                <span className="folder-emoji">📁</span><span>Field notes</span><span className="folder-check">✓</span>
              </div>
              <div className="sync-caption"><span className="sync-pulse" /> All folders up to date</div>
              <div className="laptop-base" />
            </div>
            <div className="device device-peer">
              <div className="peer-header"><span className="sync-pulse" /> Peer online</div>
              <div className="peer-app-icon">
                <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
                  <path d="M20 3.5 35 12v16L20 36.5 5 28V12L20 3.5Z" fill="currentColor" />
                  <path d="m20 10 9.2 17h-4.7L20 18.4 15.5 27h-4.7L20 10Z" fill="#F6F8F3" />
                </svg>
              </div>
              <span className="peer-label">Backup peer</span>
              <div className="peer-file"><span>📄</span><span>project-notes.md</span><b>✓</b></div>
              <div className="peer-file"><span>🖼️</span><span>weekend.jpg</span><b>✓</b></div>
              <div className="peer-file"><span>📄</span><span>ideas.txt</span><b>✓</b></div>
            </div>
            <div className="floating-chip">
              <span className="chip-check">✓</span>
              <span><b>Just synced</b><small>Across your devices</small></span>
            </div>
            <div className="art-label">YOUR FILES, FINDING THEIR WAY HOME</div>
          </div>
          <div className="hero-bottom">
            <span>STORAGE, WITHOUT THE SILOS</span>
            <span className="bottom-line" />
            <span>SCROLL TO EXPLORE <span className="scroll-arrow">↓</span></span>
          </div>
        </section>

        <section className="intro-section" id="how-it-works">
          <div className="section-kicker"><span>01</span> A little more connected</div>
          <div className="intro-content">
            <h2>Good files deserve<br />a good <em>home.</em></h2>
            <div className="intro-aside">
              <p>
                Archivist brings your folders and devices together in one simple desktop app.
                Choose what to sync, connect your own devices, and keep an extra backup in the loop.
              </p>
              <a className="text-link" href="#downloads">Meet your new file routine <ArrowIcon /></a>
            </div>
          </div>
          <div className="flow-steps">
            <div className="flow-step">
              <span className="step-number">01</span>
              <div className="step-icon step-folder">📁</div>
              <h3>Choose a folder</h3>
              <p>Pick the files you want to keep in sync.</p>
            </div>
            <span className="flow-connector" aria-hidden="true">→</span>
            <div className="flow-step">
              <span className="step-number">02</span>
              <div className="step-icon step-network">
                <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="4" /><circle cx="6" cy="8" r="2.5" /><circle cx="26" cy="8" r="2.5" /><circle cx="6" cy="24" r="2.5" /><circle cx="26" cy="24" r="2.5" /><path d="m8 9.5 5 4m11-4-5 4m-11 9 5-4m11 4-5-4" /></svg>
              </div>
              <h3>Connect your devices</h3>
              <p>Bring your computers onto one peer-to-peer network.</p>
            </div>
            <span className="flow-connector" aria-hidden="true">→</span>
            <div className="flow-step">
              <span className="step-number">03</span>
              <div className="step-icon step-check">✓</div>
              <h3>Let it stay in sync</h3>
              <p>Your folders keep up while you get on with your day.</p>
            </div>
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="features-heading">
            <div>
              <div className="section-kicker"><span>02</span> Less managing, more making</div>
              <h2>Everything in its<br /><em>right place.</em></h2>
            </div>
            <p>A thoughtful way to keep your digital life close, connected, and a little less complicated.</p>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.number}>
                <div className="feature-card-top">
                  <span className="feature-number">{feature.number} / 03</span>
                  <span className="feature-icon">{feature.icon}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <a href="#downloads" aria-label={`Download Archivist: ${feature.title}`}><ArrowIcon diagonal /></a>
              </article>
            ))}
          </div>
        </section>

        <section className="quote-section">
          <div className="quote-mark">“</div>
          <blockquote>
            The best place for your files is wherever <em>you</em> are.
          </blockquote>
          <span className="quote-caption">ONE LIBRARY. ALL YOUR DEVICES.</span>
          <div className="quote-decoration" aria-hidden="true"><span /><span /><span /></div>
        </section>

        <section className="downloads-section" id="downloads">
          <div className="downloads-copy">
            <div className="section-kicker"><span>03</span> Find your platform</div>
            <h2>A fresh start<br />for your <em>files.</em></h2>
            <p>Download Archivist for your computer and start connecting your folders.</p>
            <a className="button button-dark" href={releasesUrl} target="_blank" rel="noreferrer">
              Browse all releases <ArrowIcon diagonal />
            </a>
            <div className="alpha-note"><span>i</span> Archivist is alpha software. Keep a separate backup of important files.</div>
          </div>
          <div className="platform-list">
            {platforms.map((platform) => (
              <a
                className="platform-row"
                href={releasesUrl}
                key={platform.name}
                target="_blank"
                rel="noreferrer"
                aria-label={`Download Archivist for ${platform.name}; select ${platform.file} on the releases page`}
              >
                <span className="platform-icon"><PlatformIcon name={platform.name} /></span>
                <span className="platform-name"><b>{platform.name}</b><small>{platform.detail}</small></span>
                <span className="platform-file">{platform.file}</span>
                <span className="platform-arrow"><ArrowIcon diagonal /></span>
              </a>
            ))}
            <p className="release-hint">Each button opens the latest release. Choose the matching installer for your system.</p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <BrandMark small />
        <span className="footer-caption">Your files, together.</span>
        <div className="footer-links">
          <a href="https://github.com/durability-labs/archivist-desktop" target="_blank" rel="noreferrer">GitHub <ArrowIcon diagonal /></a>
          <a href={releasesUrl} target="_blank" rel="noreferrer">Releases <ArrowIcon diagonal /></a>
        </div>
        <span className="copyright">© 2026 Archivist</span>
      </footer>
    </div>
  );
}

export default App;
